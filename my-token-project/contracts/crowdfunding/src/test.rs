#![cfg(test)]

// Import Crowdfunding contract
use super::*;
// Import Token contract dari crate 'token'
use ::token::{TokenContract, TokenContractClient}; // << DENGAN ::

use soroban_sdk::{
    testutils::{Address as _, Ledger, LedgerInfo},
     Address, Env, // Hapus import yang tidak perlu lagi
};


// Helper setup dasar (MENGGUNAKAN TOKEN KUSTOM)
fn setup_test<'a>() -> (
    Env,
    CrowdfundingContractClient<'a>, // Client Crowdfunding
    TokenContractClient<'a>,        // Client Token Kustom
    Address,                        // Alamat Kontrak Token Kustom
    Address,                        // Alamat Admin Token/Pemilik Campaign Awal
) {
    let env = Env::default();
    // Tidak perlu mock_all_auths() di sini, panggil di test case

    // --- CROWDFUND CONTRACT ---
    let crowdfunding_contract_id = env.register(CrowdfundingContract, ());
    let crowdfunding_client = CrowdfundingContractClient::new(&env, &crowdfunding_contract_id);

    // --- TOKEN CONTRACT (KUSTOM) ---
    let token_contract_id = env.register(TokenContract, ()); // << Register Token Kustom
    let token_client = TokenContractClient::new(&env, &token_contract_id);
    let token_admin = Address::generate(&env); // Admin/pemilik token

    // Inisialisasi token kustom (perlu mock_all_auths sementara)
    let initial_supply = 1_000_000_000 * 10_000_000; // 1 Miliar token (misalnya @ 7 desimal)
    { // Scope sementara untuk mock_all_auths
        env.mock_all_auths();
        token_client.initialize(
            &token_admin,
            &soroban_sdk::String::from_str(&env, "Test Token"),
            &soroban_sdk::String::from_str(&env, "TST"),
            &initial_supply,
        );
    }
    // token_admin sekarang punya semua supply awal

    // --- OTHER SETUP ---
    env.ledger().set(LedgerInfo {
        timestamp: 1678886400,
        protocol_version: 23,
        sequence_number: 10,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 16,
        min_persistent_entry_ttl: 4096,
        max_entry_ttl: 6312000,
    });

    (
        env,
        crowdfunding_client,
        token_client,
        token_contract_id, // Alamat token kustom
        token_admin,       // Admin token (juga sbg owner awal)
    )
}


// --- FUNGSI HELPER BARU (Menggunakan transfer token kustom) ---
// Helper untuk memberi dana donatur (transfer dari admin token)
fn fund_donor<'a>(
    _env: &Env, // Tidak dipakai jika mock_all_auths aktif
    token_client: &TokenContractClient<'a>,
    admin: &Address,    // Admin token yang punya supply awal
    donor: &Address,
    amount: &i128,
) {
    // Transfer dari admin ke donor
    // Otorisasi admin diasumsikan sudah di-mock oleh pemanggil (test case)
    token_client.transfer(admin, donor, amount);
}

// Helper jump time (tidak berubah)
fn jump(env: &Env, time_increase: u64) {
    env.ledger().set(LedgerInfo {
        timestamp: env.ledger().timestamp().saturating_add(time_increase),
        protocol_version: env.ledger().protocol_version(),
        sequence_number: env.ledger().sequence().saturating_add(1),
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 16,
        min_persistent_entry_ttl: 4096,
        max_entry_ttl: 6312000,
    });
}


// --- Test Cases (Menggunakan mock_all_auths() dan token kustom) ---

#[test]
fn test_create_campaign() {
    let (env, client, _token_client, token_address, owner) = setup_test();
    let goal = 900_000_000i128;
    let deadline = env.ledger().timestamp() + 86400;
    env.mock_all_auths(); // Untuk create_campaign

    let campaign_id = client.create_campaign(&owner, &goal, &deadline, &token_address);
    assert_eq!(campaign_id, 0);
    assert_eq!(client.get_total_raised(&campaign_id), 0);
    assert_eq!(client.get_goal(&campaign_id), goal);
    assert_eq!(client.get_deadline(&campaign_id), deadline);
    assert_eq!(client.get_next_id(), 1);
    let campaign_data = client.get_campaign(&campaign_id);
    assert_eq!(campaign_data.owner, owner);
    assert_eq!(campaign_data.token, token_address);
}

#[test]
fn test_create_multiple_campaigns() {
    let (env, client, _token_client, token_address, owner1) = setup_test();
    env.mock_all_auths(); // Untuk create_campaign

    let goal1 = 100_000i128;
    let deadline1 = env.ledger().timestamp() + 100;
    let campaign_id_1 = client.create_campaign(&owner1, &goal1, &deadline1, &token_address);
    assert_eq!(campaign_id_1, 0);

    let owner2 = Address::generate(&env); // Owner baru
    let goal2 = 500_000i128;
    let deadline2 = env.ledger().timestamp() + 200;
    let campaign_id_2 = client.create_campaign(&owner2, &goal2, &deadline2, &token_address);
    assert_eq!(campaign_id_2, 1);

    assert_eq!(client.get_goal(&campaign_id_1), goal1);
    assert_eq!(client.get_goal(&campaign_id_2), goal2);
}

#[test]
fn test_get_donation_no_donation() {
    let (env, client, _token_client, token_address, owner) = setup_test();
    let non_donor = Address::generate(&env);
    let goal = 900_000_000i128;
    let deadline = env.ledger().timestamp() + 86400;
    env.mock_all_auths(); // Untuk create_campaign

    let campaign_id = client.create_campaign(&owner, &goal, &deadline, &token_address);
    assert_eq!(client.get_donation(&campaign_id, &non_donor), 0);
}


#[test]
fn test_donate_success() {
    let (env, client, token_client, token_address, token_admin) = setup_test(); // owner = token_admin
    let donor1 = Address::generate(&env);
    let donor2 = Address::generate(&env);
    let initial_fund: i128 = 1_000_000_000;

    // --- Setup Token & Dana ---
    env.mock_all_auths(); // Untuk fund_donor (transfer dari admin)
    fund_donor(&env, &token_client, &token_admin, &donor1, &initial_fund);
    fund_donor(&env, &token_client, &token_admin, &donor2, &initial_fund);
    // --- Selesai Setup Token ---

    env.mock_all_auths(); // Untuk create_campaign & donate (transfer dari donor)
    let campaign_id = client.create_campaign(
        &token_admin, // Owner campaign = admin token
        &1000_000_000i128,
        &(env.ledger().timestamp() + 86400),
        &token_address,
    );

    let amount1 = 100_000_000i128;
    client.donate(&campaign_id, &donor1, &amount1);
    assert_eq!(client.get_total_raised(&campaign_id), amount1);
    assert_eq!(client.get_donation(&campaign_id, &donor1), amount1);


    let amount2 = 50_000_000i128;
    client.donate(&campaign_id, &donor1, &amount2); // mock_all_auths() masih aktif
    assert_eq!(client.get_total_raised(&campaign_id), amount1 + amount2);
    assert_eq!(client.get_donation(&campaign_id, &donor1), amount1 + amount2);


    let amount3 = 300_000_000i128;
    client.donate(&campaign_id, &donor2, &amount3); // mock_all_auths() masih aktif
    assert_eq!(
        client.get_total_raised(&campaign_id),
        amount1 + amount2 + amount3
    );
    assert_eq!(client.get_donation(&campaign_id, &donor2), amount3);

}

#[test]
#[should_panic(expected = "Donation amount must be positive")]
fn test_donate_zero_amount() {
    let (env, client, _token_client, token_address, owner) = setup_test();
    let donor = Address::generate(&env);

    env.mock_all_auths();
    let campaign_id = client.create_campaign(
        &owner,
        &1000,
        &(env.ledger().timestamp() + 100),
        &token_address,
    );
    client.donate(&campaign_id, &donor, &0);
}

#[test]
#[should_panic(expected = "Donation amount must be positive")]
fn test_donate_negative_amount() {
    let (env, client, _token_client, token_address, owner) = setup_test();
    let donor = Address::generate(&env);

    env.mock_all_auths();
    let campaign_id = client.create_campaign(
        &owner,
        &1000,
        &(env.ledger().timestamp() + 100),
        &token_address,
    );
    client.donate(&campaign_id, &donor, &-100);
}


#[test]
#[should_panic(expected = "Campaign has ended")]
fn test_donate_after_deadline() {
    let (env, client, token_client, token_address, token_admin) = setup_test();
    let donor = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 100;
    let initial_fund: i128 = 1_000_000_000;

    env.mock_all_auths(); // Untuk fund_donor, create_campaign & donate
    fund_donor(&env, &token_client, &token_admin, &donor, &initial_fund);

    let campaign_id = client.create_campaign(&token_admin, &1000, &deadline, &token_address);

    jump(&env, 101); // Lewati deadline

    client.donate(&campaign_id, &donor, &100_000_000); // Ini akan panic
}


#[test]
fn test_is_goal_reached() {
    let (env, client, token_client, token_address, token_admin) = setup_test();
    let donor = Address::generate(&env);
    let goal = 50_000_000i128;
    let initial_fund: i128 = 1_000_000_000;

    env.mock_all_auths(); // Untuk fund_donor, create_campaign & donate
    fund_donor(&env, &token_client, &token_admin, &donor, &initial_fund);

    let campaign_id = client.create_campaign(
        &token_admin,
        &goal,
        &(env.ledger().timestamp() + 100),
        &token_address,
    );
    assert_eq!(client.is_goal_reached(&campaign_id), false);

    client.donate(&campaign_id, &donor, &30_000_000);
    assert_eq!(client.is_goal_reached(&campaign_id), false);

    client.donate(&campaign_id, &donor, &20_000_000); // Total 50M
    assert_eq!(client.is_goal_reached(&campaign_id), true);

    client.donate(&campaign_id, &donor, &10_000_000); // Total 60M
    assert_eq!(client.is_goal_reached(&campaign_id), true);
}


#[test]
fn test_is_ended() { // Tidak perlu mock auths tambahan
    let (env, client, _token_client, token_address, owner) = setup_test();
    let deadline = env.ledger().timestamp() + 1000;
    env.mock_all_auths(); // Untuk create_campaign
    let campaign_id = client.create_campaign(&owner, &1000, &deadline, &token_address);

    assert_eq!(client.is_ended(&campaign_id), false);
    jump(&env, 1000);
    assert_eq!(client.is_ended(&campaign_id), false);
    jump(&env, 1);
    assert_eq!(client.is_ended(&campaign_id), true);
}


#[test]
fn test_get_progress_percentage() {
    let (env, client, token_client, token_address, token_admin) = setup_test();
    let donor = Address::generate(&env);
    let goal = 100_000_000i128;
    let initial_fund: i128 = 1_000_000_000;

    env.mock_all_auths(); // Untuk fund_donor, create_campaign & donate
    fund_donor(&env, &token_client, &token_admin, &donor, &initial_fund);

    let campaign_id = client.create_campaign(
        &token_admin,
        &goal,
        &(env.ledger().timestamp() + 100),
        &token_address,
    );

    assert_eq!(client.get_progress_percentage(&campaign_id), 0);
    client.donate(&campaign_id, &donor, &25_000_000);
    assert_eq!(client.get_progress_percentage(&campaign_id), 25);
    client.donate(&campaign_id, &donor, &25_000_000);
    assert_eq!(client.get_progress_percentage(&campaign_id), 50);
    client.donate(&campaign_id, &donor, &50_000_000);
    assert_eq!(client.get_progress_percentage(&campaign_id), 100);
    client.donate(&campaign_id, &donor, &20_000_000);
    assert_eq!(client.get_progress_percentage(&campaign_id), 120);
}


#[test]
fn test_refund_success() {
    let (env, client, token_client, token_address, token_admin) = setup_test();
    let donor = Address::generate(&env);
    let goal = 100_000_000i128;
    let deadline = env.ledger().timestamp() + 100;
    let initial_fund: i128 = 1_000_000_000;

    env.mock_all_auths(); // Untuk fund_donor, create_campaign, donate & refund
    fund_donor(&env, &token_client, &token_admin, &donor, &initial_fund);

    let campaign_id = client.create_campaign(&token_admin, &goal, &deadline, &token_address);

    let donation_amount = 30_000_000i128;
    client.donate(&campaign_id, &donor, &donation_amount);
    assert_eq!(client.get_donation(&campaign_id, &donor), donation_amount);
    assert_eq!(client.get_total_raised(&campaign_id), donation_amount);

    jump(&env, 101);

    let refunded = client.refund(&campaign_id, &donor);

    assert_eq!(refunded, donation_amount);
    assert_eq!(client.get_donation(&campaign_id, &donor), 0);
    assert_eq!(client.get_total_raised(&campaign_id), 0);
}

#[test]
#[should_panic(expected = "Campaign belum berakhir")]
fn test_refund_before_deadline() {
    let (env, client, token_client, token_address, token_admin) = setup_test();
    let donor = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 1000;
    let initial_fund: i128 = 1_000_000_000;

    env.mock_all_auths(); // Untuk fund_donor, create_campaign, donate & refund
    fund_donor(&env, &token_client, &token_admin, &donor, &initial_fund);

    let campaign_id = client.create_campaign(&token_admin, &1000, &deadline, &token_address);

    client.donate(&campaign_id, &donor, &30_000_000);
    client.refund(&campaign_id, &donor); // Panic
}


#[test]
#[should_panic(expected = "Goal sudah tercapai, tidak bisa refund")]
fn test_refund_when_goal_reached() {
    let (env, client, token_client, token_address, token_admin) = setup_test();
    let donor = Address::generate(&env);
    let goal = 50_000_000i128;
    let deadline = env.ledger().timestamp() + 100;
    let initial_fund: i128 = 1_000_000_000;

    env.mock_all_auths(); // Untuk fund_donor, create_campaign, donate & refund
    fund_donor(&env, &token_client, &token_admin, &donor, &initial_fund);

    let campaign_id = client.create_campaign(&token_admin, &goal, &deadline, &token_address);

    client.donate(&campaign_id, &donor, &goal);
    assert_eq!(client.is_goal_reached(&campaign_id), true);

    jump(&env, 101);
    client.refund(&campaign_id, &donor); // Panic
}

#[test]
#[should_panic(expected = "Goal must be positive")]
fn test_create_campaign_zero_goal() { // Tidak perlu mock auths tambahan
    let (env, client, _token_client, token_address, owner) = setup_test();
    let deadline = env.ledger().timestamp() + 86400;
    env.mock_all_auths(); // Untuk create_campaign
    client.create_campaign(&owner, &0i128, &deadline, &token_address);
}

#[test]
#[should_panic(expected = "Deadline must be in the future")]
fn test_create_campaign_past_deadline() { // Tidak perlu mock auths tambahan
    let (env, client, _token_client, token_address, owner) = setup_test();
    let goal = 100_000_000i128;
    let deadline = env.ledger().timestamp();
    env.mock_all_auths(); // Untuk create_campaign
    client.create_campaign(&owner, &goal, &deadline, &token_address);
}

#[test]
#[should_panic(expected = "Donatur tidak ditemukan atau sudah refund")]
fn test_refund_no_donation() { // Perlu mock auth untuk refund
    let (env, client, _token_client, token_address, owner) = setup_test();
    let donor = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 100;

    env.mock_all_auths(); // << Mock auths SEBELUM create_campaign & refund
    let campaign_id = client.create_campaign(&owner, &1000, &deadline, &token_address);

    jump(&env, 101);
    client.refund(&campaign_id, &donor); // Panic
}

#[test]
#[should_panic(expected = "Donatur tidak ditemukan atau sudah refund")]
fn test_refund_twice() {
    let (env, client, token_client, token_address, token_admin) = setup_test();
    let donor = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 100;
    let initial_fund: i128 = 1_000_000_000;

    env.mock_all_auths(); // << Mock auths SEBELUM fund_donor, create_campaign, donate & refund
    fund_donor(&env, &token_client, &token_admin, &donor, &initial_fund);

    // <<< PERBAIKAN DI SINI: Ubah goal agar campaign GAGAL >>>
    // Goal 1000 diganti menjadi 100_000_000 (100 Juta)
    let campaign_id = client.create_campaign(&token_admin, &100_000_000i128, &deadline, &token_address);

    let donation_amount = 30_000_000i128; // Donasi 30 Juta (Goal 100 Juta tidak tercapai)
    client.donate(&campaign_id, &donor, &donation_amount);

    jump(&env, 101); // Waktu berakhir

    client.refund(&campaign_id, &donor); // Refund pertama sukses
    client.refund(&campaign_id, &donor); // Refund kedua panic (karena donasi sudah 0)
}


#[test]
#[should_panic(expected = "Campaign not found")]
fn test_interact_with_nonexistent_campaign() { // Perlu mock auth untuk donate
    let (env, client, _, _, _) = setup_test();
    let donor = Address::generate(&env);
    let amount = 100i128;

    env.mock_all_auths(); // << Mock auths di sini

    client.donate(&999, &donor, &amount); // Akan panic
}