#![no_std]
// 'contracttype' dihapus dari baris ini
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, symbol_short, Map}; 

// --- Storage Keys ---
// Kunci untuk saldo per alamat (Address -> i128)
const BALANCE: Symbol = symbol_short!("BALANCE"); 
// Kunci untuk metadata
const NAME: Symbol = symbol_short!("NAME");
const SYMBOL: Symbol = symbol_short!("SYMBOL");
const TOTAL: Symbol = symbol_short!("TOTAL");
const DECIMAL: Symbol = symbol_short!("DECIMAL");

#[contract]
pub struct TokenContract;

// Helper untuk membaca saldo
fn get_balance(env: &Env, addr: &Address) -> i128 {
    let balances: Map<Address, i128> = env.storage().instance().get(&BALANCE).unwrap_or(Map::new(env));
    balances.get(addr.clone()).unwrap_or(0)
}

// Helper untuk menulis saldo
fn set_balance(env: &Env, addr: &Address, amount: &i128) {
    let mut balances: Map<Address, i128> = env.storage().instance().get(&BALANCE).unwrap_or(Map::new(env));
    balances.set(addr.clone(), amount.clone());
    env.storage().instance().set(&BALANCE, &balances);
    
    // (Catatan: Kontrak token standar juga harus mem-publish event di sini)
}


#[contractimpl]
impl TokenContract {

    // Initialize token dengan nama, symbol, dan supply
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        total_supply: i128,
    ) {
        // Verify admin authorization
        admin.require_auth();

        // Validasi input
        if total_supply <= 0 {
            panic!("Total supply harus lebih dari 0");
        }
        
        // Pastikan belum diinisialisasi
        if env.storage().instance().has(&NAME) {
            panic!("Sudah diinisialisasi");
        }

        // Simpan token info
        env.storage().instance().set(&NAME, &name);
        env.storage().instance().set(&SYMBOL, &symbol);
        env.storage().instance().set(&TOTAL, &total_supply);
        env.storage().instance().set(&DECIMAL, &7u32); // Standar token butuh ini

        // Set balance admin = total supply
        let mut balances: Map<Address, i128> = Map::new(&env);
        balances.set(admin.clone(), total_supply);
        env.storage().instance().set(&BALANCE, &balances);
    }

    // --- Implementasi Standar Token ---

    // Get nama token
    pub fn name(env: Env) -> String {
        env.storage().instance().get(&NAME).unwrap()
    }

    // Get symbol token
    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&SYMBOL).unwrap()
    }
    
    // Get decimals
    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DECIMAL).unwrap()
    }

    // Get total supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&TOTAL).unwrap()
    }

    // Get balance untuk alamat spesifik
    pub fn balance(env: Env, id: Address) -> i128 {
        get_balance(&env, &id)
    }

    // Transfer token
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        // Verify authorization
        from.require_auth();

        // Validasi amount
        if amount <= 0 {
            panic!("Amount harus lebih dari 0");
        }

        // Get current balances
        let from_balance = get_balance(&env, &from);
        let to_balance = get_balance(&env, &to);

        // Check sufficient balance
        if from_balance < amount {
            panic!("Balance tidak cukup");
        }

        // Update balances
        set_balance(&env, &from, &(from_balance - amount));
        set_balance(&env, &to, &(to_balance + amount));
    }
    
    // --- Fungsi Getter Lama (Untuk kompatibilitas) ---
    
    pub fn get_name(env: Env) -> String {
        Self::name(env)
    }
    
    pub fn get_symbol(env: Env) -> String {
        Self::symbol(env)
    }
    
    pub fn get_total_supply(env: Env) -> i128 {
        Self::total_supply(env)
    }
    
    // 'env' diubah menjadi '_env' untuk menghilangkan warning
    pub fn get_balance(_env: Env) -> i128 {
        panic!("Fungsi get_balance() sudah tidak dipakai, gunakan balance(Address)");
    }
}

mod test;