#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize_token() {
    // Setup environment
    let env = Env::default();
    let contract_id = env.register(TokenContract, ());
    let client = TokenContractClient::new(&env, &contract_id);

    // Create admin address
    let admin = Address::generate(&env);

    // Mock authorization
    env.mock_all_auths();

    // Initialize token
    let name = String::from_str(&env, "Indonesian Rupiah");
    let symbol = String::from_str(&env, "IDR");
    let supply = 1_000_000_000i128; // 1 miliar

    client.initialize(&admin, &name, &symbol, &supply);

    // Verify token info (menggunakan nama fungsi standar)
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
    assert_eq!(client.total_supply(), supply);
    assert_eq!(client.decimals(), 7);
    // Cek saldo admin
    assert_eq!(client.balance(&admin), supply);
    // Cek saldo user lain (harus 0)
    let user = Address::generate(&env);
    assert_eq!(client.balance(&user), 0);
}

#[test]
fn test_get_token_info() {
    let env = Env::default();
    let contract_id = env.register(TokenContract, ());
    let client = TokenContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    env.mock_all_auths();

    let name = String::from_str(&env, "Workshop Token");
    let symbol = String::from_str(&env, "WST");
    let supply = 5_000_000i128;

    client.initialize(&admin, &name, &symbol, &supply);

    // Test getter functions (gunakan nama standar)
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
    assert_eq!(client.total_supply(), supply);
}

#[test]
#[should_panic(expected = "Total supply harus lebih dari 0")]
fn test_initialize_invalid_supply() {
    let env = Env::default();
    let contract_id = env.register(TokenContract, ());
    let client = TokenContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    env.mock_all_auths();

    let name = String::from_str(&env, "Bad Token");
    let symbol = String::from_str(&env, "BAD");
    let supply = 0i128; // Invalid!

    // Should panic
    client.initialize(&admin, &name, &symbol, &supply);
}

#[test]
fn test_transfer() {
    let env = Env::default();
    let contract_id = env.register(TokenContract, ());
    let client = TokenContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    env.mock_all_auths();

    let name = String::from_str(&env, "Test Token");
    let symbol = String::from_str(&env, "TST");
    let supply = 1_000_000i128;

    client.initialize(&admin, &name, &symbol, &supply);

    // Cek saldo awal
    assert_eq!(client.balance(&admin), supply);
    assert_eq!(client.balance(&user), 0);

    // Transfer tokens
    let transfer_amount = 100_000i128;
    client.transfer(&admin, &user, &transfer_amount);

    // Cek saldo akhir
    assert_eq!(client.balance(&admin), supply - transfer_amount);
    assert_eq!(client.balance(&user), transfer_amount);
}