// Starknet import
use starknet::ContractAddress;
use core::num::traits::zero::Zero;

// Constants imports
use full_starter_react::constants;

// Helpers import
use full_starter_react::helpers::timestamp::Timestamp;

// Model
#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
#[dojo::model]
pub struct Player {
    #[key]
    pub owner: ContractAddress,
    pub experience: u32,
    pub health: u32,
    pub coins: u32,
    pub creation_day: u32,
}

// Traits Implementations
#[generate_trait]
pub impl PlayerImpl of PlayerTrait {
    fn new(
        owner: ContractAddress,
        experience: u32,
        health: u32,
        coins: u32,
        creation_day: u32,
    ) -> Player {
        Player {
            owner: owner,
            experience: experience,
            health: health,
            coins: coins,
            creation_day: creation_day,
        }
    }

    fn add_coins(ref self: Player, coins_amount: u32) { 
        self.coins += coins_amount;
    }

    fn add_experience(ref self: Player, experience_amount: u32) { 
        self.experience += experience_amount;
    }

    fn add_health(ref self: Player, health_amount: u32) { 
        self.health += health_amount;
    }

}

#[generate_trait]
pub impl PlayerAssert of AssertTrait {
    #[inline(always)]
    fn assert_exists(self: Player) {
        assert(self.is_non_zero(), 'Player: Does not exist');
    }

    #[inline(always)]
    fn assert_not_exists(self: Player) {
        assert(self.is_zero(), 'Player: Already exist');
    }
}

pub impl ZeroablePlayerTrait of Zero<Player> {
    #[inline(always)]
    fn zero() -> Player {
        Player {
            owner: constants::ZERO_ADDRESS(),
            experience: 0,
            health: 0,
            coins: 0,
            creation_day: 0,
        }
    }

    #[inline(always)]
    fn is_zero(self: @Player) -> bool {
       *self.owner == constants::ZERO_ADDRESS()
    }

    #[inline(always)]
    fn is_non_zero(self: @Player) -> bool {
        !self.is_zero()
    }
}

// Tests
#[cfg(test)]
mod tests {
    use super::{Player, ZeroablePlayerTrait, PlayerImpl, PlayerTrait, PlayerAssert};
    use full_starter_react::constants;
    use starknet::{ContractAddress, contract_address_const};

    #[test]
    #[available_gas(1000000)]
    fn test_player_new_constructor() {
        // Use contract_address_const to create a mock address
        let mock_address: ContractAddress = contract_address_const::<0x123>();
        
        // Test the new constructor
        let player = PlayerTrait::new(
            mock_address,
            50,   // experience
            100,  // health
            25,   // coins
            42,   // creation_day
        );

        assert_eq!(
            player.owner, 
            mock_address, 
            "Player owner should match the initialized address"
        );
        assert_eq!(player.experience, 50, "Experience should be initialized to 50");
        assert_eq!(player.health, 100, "Health should be initialized to 100");
        assert_eq!(player.coins, 25, "Coins should be initialized to 25");
        assert_eq!(player.creation_day, 42, "Creation day should be initialized to 42");
    }

    #[test]
    #[available_gas(1000000)]
    fn test_player_initialization() {
        // Use contract_address_const to create a mock address
        let mock_address: ContractAddress = contract_address_const::<0x123>();

        let player = Player {
            owner: mock_address,
            experience: 0,
            health: 100,
            coins: 0,
            creation_day: 1,
        };

        assert_eq!(
            player.owner, 
            mock_address, 
            "Player owner should match the initialized address"
        );
        assert_eq!(
            player.coins, 
            0, 
            "Initial coins should be 0"
        );
        assert_eq!(
            player.health, 
            100, 
            "Initial health should be 100"
        );
        assert_eq!(
            player.experience, 
            0, 
            "Initial experience should be 0"
        );
    }

    #[test]
    #[available_gas(1000000)]
    fn test_player_zero_values() {
        let player: Player = ZeroablePlayerTrait::zero();

        assert_eq!(
            player.owner, 
            constants::ZERO_ADDRESS(), 
            "Player owner should match the zero address"
        );
        assert_eq!(
            player.experience, 
            0, 
            "Zero player experience should be 0"
        );
        assert_eq!(
            player.health, 
            0, 
            "Zero player health should be 0"
        );
        assert_eq!(
            player.coins, 
            0, 
            "Zero player coins should be 0"
        );
    }

    #[test]
    #[available_gas(1000000)]
    fn test_player_add_coins() {
        let mock_address: ContractAddress = contract_address_const::<0x123>();
        
        // Use the constructor instead of direct initialization
        let mut player = PlayerTrait::new(
            mock_address,
            0,    // experience
            100,  // health
            0,    // coins
            1,    // creation_day
        );

        player.add_coins(50);
        assert_eq!(
            player.coins, 
            50, 
            "Player should have 50 coins after adding 50"
        );

        player.add_coins(100);
        assert_eq!(
            player.coins, 
            150, 
            "Player should have 150 coins after adding 100 more"
        );
    }

    #[test]
    #[available_gas(1000000)]
    fn test_player_add_experience() {
        let mock_address: ContractAddress = contract_address_const::<0x123>();
        
        let mut player = PlayerTrait::new(
            mock_address,
            0,    // experience
            100,  // health
            0,    // coins
            1,    // creation_day
        );

        player.add_experience(25);
        assert_eq!(
            player.experience, 
            25, 
            "Player should have 25 experience after adding 25"
        );

        player.add_experience(75);
        assert_eq!(
            player.experience, 
            100, 
            "Player should have 100 experience after adding 75 more"
        );
    }

    #[test]
    #[available_gas(1000000)]
    fn test_player_health_management() {
        let mock_address: ContractAddress = contract_address_const::<0x123>();
        
        let mut player = PlayerTrait::new(
            mock_address,
            0,    // experience
            100,  // health
            0,    // coins
            1,    // creation_day
        );

        // Test adding health
        player.add_health(50);
        assert_eq!(
            player.health, 
            150, 
            "Player should have 150 health after adding 50"
        );

    }

    #[test]
    #[available_gas(1000000)]
    fn test_player_assert_traits() {
        let mock_address: ContractAddress = contract_address_const::<0x456>();
        
        // Test with existing player
        let existing_player = PlayerTrait::new(
            mock_address,
            10,   // experience
            100,  // health
            5,    // coins
            1,    // creation_day
        );

        existing_player.assert_exists(); // Should not panic

        // Test with zero player
        let zero_player: Player = ZeroablePlayerTrait::zero();
        zero_player.assert_not_exists(); // Should not panic
        
        assert!(zero_player.is_zero(), "Zero player should be zero");
        assert!(existing_player.is_non_zero(), "Existing player should be non-zero");
    }

    #[test]
    #[available_gas(1000000)]
    fn test_player_complex_scenario() {
        let mock_address: ContractAddress = contract_address_const::<0x789>();
        
        // Initialize player with some starting values
        let mut player = PlayerTrait::new(
            mock_address,
            15,   // experience
            80,   // health
            50,   // coins
            10,   // creation_day
        );
        
        // Simulate a game session
        player.add_coins(75);        // Collected coins during gameplay
        player.add_experience(100);  // Gained experience
        player.add_health(10);       // Restored some health
        
        // Verify final state
        assert_eq!(player.coins, 125, "Player should have 125 coins total");
        assert_eq!(player.experience, 115, "Player should have 115 total experience");
        assert_eq!(player.health, 90, "Player should have 90 health after damage and healing");
        assert_eq!(player.creation_day, 10, "Creation day should remain unchanged");
        assert_eq!(player.owner, mock_address, "Owner should remain unchanged");
    }

    
}