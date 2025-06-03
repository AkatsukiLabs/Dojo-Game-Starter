// Integration tests for Game Starter functionality
#[cfg(test)]
mod tests {
    // Test utilities
    use full_starter_react::tests::utils::utils::{
        PLAYER, cheat_caller_address, create_game_system, create_test_world,
    };
    
    // System imports
    use full_starter_react::systems::game::{IGameDispatcherTrait};
    
    // Models imports
    use full_starter_react::models::player::{Player};
    
    // Dojo imports
    #[allow(unused_imports)]
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo::model::{ModelStorage};
    
    
    #[test]
    #[available_gas(40000000)]
    fn test_spawn_player() {
        // Create test environment
        let world = create_test_world();
        let game_system = create_game_system(world);
        
        // Set the caller address for the test
        cheat_caller_address(PLAYER());
        
        // Test spawning a player
        game_system.spawn_player();
        
        // Verify player was created successfully
        let player: Player = world.read_model(PLAYER());
        
        // Basic player validation
        assert(player.owner == PLAYER(), 'Player owner should match');
        assert(player.experience == 0, 'Player starts with 0 exp');
        assert(player.health == 100, 'Player starts with 100 health');
        assert(player.coins == 0, 'Player starts with 0 coins');
    }
    
    #[test]
    #[available_gas(40000000)]
    fn test_train_player() {
        // Create test environment
        let world = create_test_world();
        let game_system = create_game_system(world);
        
        // Set the caller address for the test
        cheat_caller_address(PLAYER());
        
        // Spawn a player first
        game_system.spawn_player();
        
        // Train the player
        game_system.train();
        
        // Verify player state after training
        let player: Player = world.read_model(PLAYER());
        
        assert(player.experience == 10, 'Player should have 10 exp');
        assert(player.health == 100, 'Health should remain 100');
        assert(player.coins == 0, 'Coins should remain 0');
    }
    
    #[test]
    #[available_gas(40000000)]
    fn test_multiple_training_sessions() {
        // Create test environment
        let world = create_test_world();
        let game_system = create_game_system(world);
        
        // Set the caller address for the test
        cheat_caller_address(PLAYER());
        
        // Spawn a player first
        game_system.spawn_player();
        
        // Train multiple times
        game_system.train(); // +10 exp = 10
        game_system.train(); // +10 exp = 20
        game_system.train(); // +10 exp = 30
        
        // Verify cumulative experience
        let player: Player = world.read_model(PLAYER());
        assert(player.experience == 30, 'Player should have 30 exp');
    }
    
    #[test]
    #[available_gas(40000000)]
    fn test_mine_coins() {
        // Create test environment
        let world = create_test_world();
        let game_system = create_game_system(world);
        
        // Set the caller address for the test
        cheat_caller_address(PLAYER());
        
        // Spawn a player first
        game_system.spawn_player();
        
        // Mine coins
        game_system.mine();
        
        // Verify player state after mining
        let player: Player = world.read_model(PLAYER());
        
        assert(player.coins == 5, 'Player should have 5 coins');
        assert(player.health == 95, 'Health should be 95');
        assert(player.experience == 0, 'Experience should remain 0');
    }
    
    #[test]
    #[available_gas(40000000)]
    fn test_multiple_mining_sessions() {
        // Create test environment
        let world = create_test_world();
        let game_system = create_game_system(world);
        
        // Set the caller address for the test
        cheat_caller_address(PLAYER());
        
        // Spawn a player first
        game_system.spawn_player();
        
        // Mine multiple times
        game_system.mine(); // +5 coins, -5 health = 5 coins, 95 health
        game_system.mine(); // +5 coins, -5 health = 10 coins, 90 health
        game_system.mine(); // +5 coins, -5 health = 15 coins, 85 health
        
        // Verify cumulative effects
        let player: Player = world.read_model(PLAYER());
        assert(player.coins == 15, 'Player should have 15 coins');
        assert(player.health == 85, 'Player should have 85 health');
    }
    
    #[test]
    #[available_gas(40000000)]
    fn test_rest_player() {
        // Create test environment
        let world = create_test_world();
        let game_system = create_game_system(world);
        
        // Set the caller address for the test
        cheat_caller_address(PLAYER());
        
        // Spawn a player first
        game_system.spawn_player();
        
        // Mine to reduce health first
        game_system.mine(); // Health becomes 95
        
        // Rest to recover health
        game_system.rest();
        
        // Verify player state after resting
        let player: Player = world.read_model(PLAYER());
        
        assert(player.health == 115, 'Health should be 115');
        assert(player.coins == 5, 'Coins should remain 5');
        assert(player.experience == 0, 'Experience should remain 0');
    }
    
    #[test]
    #[available_gas(80000000)]
    fn test_complete_game_flow() {
        // Create test environment
        let world = create_test_world();
        let game_system = create_game_system(world);
        
        // Set the caller address for the test
        cheat_caller_address(PLAYER());
        
        // Spawn a player
        game_system.spawn_player();
        
        // Perform various actions
        game_system.train();  // +10 exp
        game_system.mine();   // +5 coins, -5 health
        game_system.rest();   // +20 health
        game_system.train();  // +10 exp
        game_system.mine();   // +5 coins, -5 health
        
        // Verify final state
        let player: Player = world.read_model(PLAYER());
        
        assert(player.experience == 20, 'Should have 20 experience');
        assert(player.coins == 10, 'Should have 10 coins');
        assert(player.health == 110, 'Should have 110 health'); // 100 - 5 + 20 - 5 = 110
    }
   
   
}