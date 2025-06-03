// Starknet import
use starknet::{ContractAddress, contract_address_const};

// Zero address
pub fn ZERO_ADDRESS() -> ContractAddress {
    contract_address_const::<0x0>()
}

// Seconds per day
pub const SECONDS_PER_DAY: u64 = 86400;
// Achievements quantity
pub const ACHIEVEMENTS_COUNT: u8 = 5;
pub const ACHIEVEMENTS_INITIAL_ID: u8 = 1;