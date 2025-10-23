#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Map, Symbol,
};

// --- Struct untuk menyimpan data Campaign ---
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub owner: Address,    // Pembuat campaign
    pub goal: i128,        // Target donasi
    pub deadline: u64,     // Batas waktu (Unix timestamp)
    pub token: Address,    // Token yang dikumpulkan (misal: XLM, USDC)
    pub raised: i128,      // Dana terkumpul
    pub donations: Map<Address, i128>, // Peta donatur dan jumlah donasi
}

// --- Storage Keys untuk Factory ---
// Menyimpan Map<u64, Campaign>
const CAMPAIGNS: Symbol = symbol_short!("CAMPAIGNS");
// Menyimpan u64 untuk campaign ID berikutnya
const NEXT_ID: Symbol = symbol_short!("NEXT_ID");

// Contract struct
#[contract]
pub struct CrowdfundingContract;

// Contract implementation
#[contractimpl]
impl CrowdfundingContract {
    /// Membuat campaign baru.
    /// Siapapun bisa memanggil ini.
    /// Mengembalikan ID (u64) dari campaign yang baru dibuat.
    pub fn create_campaign(
        env: Env,
        owner: Address,    // Address creator campaign
        goal: i128,        // Target amount (stroops)
        deadline: u64,     // Unix timestamp kapan campaign berakhir
        token: Address,    // Token contract address yang ingin dikumpulkan
    ) -> u64 {
        // Otentikasi owner
        owner.require_auth();

        // Validasi input
        if goal <= 0 {
            panic!("Goal must be positive");
        }
        if deadline <= env.ledger().timestamp() {
            panic!("Deadline must be in the future");
        }

        // Buat struct Campaign baru
        let new_campaign = Campaign {
            owner,
            goal,
            deadline,
            token,
            raised: 0,
            donations: Map::new(&env),
        };

        // Ambil campaigns map (atau buat baru jika belum ada)
        let mut campaigns: Map<u64, Campaign> = env
            .storage()
            .instance()
            .get(&CAMPAIGNS)
            .unwrap_or_else(|| Map::new(&env));

        // Ambil ID berikutnya
        let campaign_id: u64 = env.storage().instance().get(&NEXT_ID).unwrap_or(0u64);

        // Simpan campaign baru ke map
        campaigns.set(campaign_id, new_campaign);

        // Simpan map & ID berikutnya kembali ke storage
        env.storage().instance().set(&CAMPAIGNS, &campaigns);
        env.storage().instance().set(&NEXT_ID, &(campaign_id + 1));

        // Kembalikan ID campaign baru
        campaign_id
    }

    /// Donasi ke campaign tertentu menggunakan token transfer
    pub fn donate(env: Env, campaign_id: u64, donor: Address, amount: i128) {
        donor.require_auth();

        if amount <= 0 {
            panic!("Donation amount must be positive");
        }

        // Ambil map utama dan campaign spesifik
        let mut campaigns = CrowdfundingContract::get_campaigns_map(env.clone());
        let mut campaign = CrowdfundingContract::get_campaign_internal(&campaigns, campaign_id);

        if campaign.deadline <= env.ledger().timestamp() {
            panic!("Campaign has ended");
        }

        // Transfer token dari donor ke kontrak ini
        // !! Gunakan token::Client generik di sini karena token bisa apa saja !!
        let token_client = token::Client::new(&env, &campaign.token);
        let contract_address = env.current_contract_address();
        token_client.transfer(&donor, &contract_address, &amount);

        // Update data campaign
        campaign.raised += amount;
        let current_donation = campaign.donations.get(donor.clone()).unwrap_or(0);
        campaign.donations.set(donor, current_donation + amount);

        // Simpan campaign yang sudah diupdate ke map
        campaigns.set(campaign_id, campaign);
        // Simpan map kembali ke storage
        env.storage().instance().set(&CAMPAIGNS, &campaigns);
    }

    /// Refund mechanism jika campaign gagal (hanya bisa dipanggil oleh donatur)
    pub fn refund(env: Env, campaign_id: u64, donor: Address) -> i128 {
        donor.require_auth();

        let mut campaigns = CrowdfundingContract::get_campaigns_map(env.clone());
        let mut campaign = CrowdfundingContract::get_campaign_internal(&campaigns, campaign_id);

        if !CrowdfundingContract::is_ended(env.clone(), campaign_id) {
            panic!("Campaign belum berakhir");
        }
        if CrowdfundingContract::is_goal_reached(env.clone(), campaign_id) {
            panic!("Goal sudah tercapai, tidak bisa refund");
        }

        let donation_amount = campaign.donations.get(donor.clone()).unwrap_or(0);

        if donation_amount <= 0 {
            panic!("Donatur tidak ditemukan atau sudah refund");
        }

        // Update state campaign
        campaign.donations.set(donor.clone(), 0);
        campaign.raised -= donation_amount;

        // Simpan perubahan state
        campaigns.set(campaign_id, campaign.clone());
        env.storage().instance().set(&CAMPAIGNS, &campaigns);

        // <<< AWAL PERBAIKAN (Blok #[cfg(not(test))] dihapus) >>>
        
        // !! Gunakan token::Client generik di sini !!
        let token_client = token::Client::new(&env, &campaign.token);
        let contract_address = env.current_contract_address();
        token_client.transfer(&contract_address, &donor, &donation_amount);
        
        // <<< AKHIR PERBAIKAN >>>

        donation_amount
    }

    // --- Fungsi Getter (Read-Only) ---

    /// (Helper) Mengambil map semua campaign
    fn get_campaigns_map(env: Env) -> Map<u64, Campaign> {
        env.storage()
            .instance()
            .get(&CAMPAIGNS)
            .unwrap_or_else(|| Map::new(&env))
    }

    /// (Helper) Mengambil satu campaign dari map
    fn get_campaign_internal(campaigns: &Map<u64, Campaign>, id: u64) -> Campaign {
        campaigns.get(id).expect("Campaign not found")
    }

    /// Get data lengkap dari satu campaign (untuk frontend)
    pub fn get_campaign(env: Env, id: u64) -> Campaign {
        let campaigns = CrowdfundingContract::get_campaigns_map(env);
        CrowdfundingContract::get_campaign_internal(&campaigns, id)
    }

    /// Get ID (u64) untuk campaign berikutnya
    pub fn get_next_id(env: Env) -> u64 {
        env.storage().instance().get(&NEXT_ID).unwrap_or(0u64)
    }

    /// Get total amount yang sudah terkumpul untuk campaign tertentu
    pub fn get_total_raised(env: Env, campaign_id: u64) -> i128 {
        CrowdfundingContract::get_campaign(env, campaign_id).raised
    }

    /// Get berapa banyak specific donor sudah donate ke campaign tertentu
    pub fn get_donation(env: Env, campaign_id: u64, donor: Address) -> i128 {
        let campaign = CrowdfundingContract::get_campaign(env, campaign_id);
        campaign.donations.get(donor).unwrap_or(0)
    }

    /// Get campaign goal amount
    pub fn get_goal(env: Env, campaign_id: u64) -> i128 {
        CrowdfundingContract::get_campaign(env, campaign_id).goal
    }

    /// Get campaign deadline timestamp
    pub fn get_deadline(env: Env, campaign_id: u64) -> u64 {
        CrowdfundingContract::get_campaign(env, campaign_id).deadline
    }

    /// Check apakah campaign sudah reach goal
    pub fn is_goal_reached(env: Env, campaign_id: u64) -> bool {
        let campaign = CrowdfundingContract::get_campaign(env, campaign_id);
        campaign.goal > 0 && campaign.raised >= campaign.goal
    }

    /// Check apakah campaign sudah berakhir (deadline passed)
     pub fn is_ended(env: Env, campaign_id: u64) -> bool {
        // Tambahkan .clone() saat memanggil get_deadline
        let deadline = CrowdfundingContract::get_deadline(env.clone(), campaign_id);
        // Sekarang 'env' masih bisa dipakai di sini
        deadline > 0 && env.ledger().timestamp() > deadline
    }

    /// Calculate progress percentage dari campaign
    pub fn get_progress_percentage(env: Env, campaign_id: u64) -> i128 {
        let campaign = CrowdfundingContract::get_campaign(env, campaign_id);
        if campaign.goal == 0 {
            return 0;
        }
        campaign
            .raised
            .checked_mul(100)
            .unwrap_or(i128::MAX)
            .checked_div(campaign.goal)
            .unwrap_or(0)
    }
}

// Modul test harus ada di akhir
#[cfg(test)]
mod test;