// Interface definition
#[starknet::interface]
pub trait IGame<T> {
    // --------- Core gameplay methods ---------
    fn spawn_player(ref self: T);
    fn train(ref self: T);
    fn mine(ref self: T);
    fn rest(ref self: T);
}

#[dojo::contract]
pub mod game {
    // Local import
    use super::{IGame};

    // Achievement import
    use full_starter_react::achievements::achievement::{Achievement, AchievementTrait};

    // Store import
    use full_starter_react::store::{StoreTrait};

    // Constant import
    use full_starter_react::constants;

    // Models import
    use full_starter_react::models::player::{PlayerAssert};

    // Dojo achievements imports
    use achievement::components::achievable::AchievableComponent;
    use achievement::store::{StoreTrait as AchievementStoreTrait};
    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    impl AchievableInternalImpl = AchievableComponent::InternalImpl<ContractState>;

    // Dojo Imports
    #[allow(unused_imports)]
    use dojo::model::{ModelStorage};
    #[allow(unused_imports)]
    use dojo::world::{WorldStorage, WorldStorageTrait};
    #[allow(unused_imports)]
    use dojo::event::EventStorage;

    use starknet::{get_block_timestamp};

    #[storage]
    struct Storage {
        #[substorage(v0)]
        achievable: AchievableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AchievableEvent: AchievableComponent::Event,
    }

    // Constructor
    fn dojo_init(ref self: ContractState) {
        let mut world = self.world(@"full_starter_react");

        let mut achievement_id: u8 = 1;
        while achievement_id <= constants::ACHIEVEMENTS_COUNT {
            let achievement: Achievement = achievement_id.into();
            self
                .achievable
                .create(
                    world,
                    id: achievement.identifier(),
                    hidden: achievement.hidden(),
                    index: achievement.index(),
                    points: achievement.points(),
                    start: achievement.start(),
                    end: achievement.end(),
                    group: achievement.group(),
                    icon: achievement.icon(),
                    title: achievement.title(),
                    description: achievement.description(),
                    tasks: achievement.tasks(),
                    data: achievement.data(),
                );
            achievement_id += 1;
        }
    }

    // Implementation of the interface methods
    #[abi(embed_v0)]
    impl GameImpl of IGame<ContractState> {
        
        // Method to create a new player
        fn spawn_player(ref self: ContractState) {
            let mut world = self.world(@"full_starter_react");
            let store = StoreTrait::new(world);

            // Create new player
            store.create_player();
        }

        // Method to train player (+10 experience)
        fn train(ref self: ContractState) {
            let mut world = self.world(@"full_starter_react");
            let store = StoreTrait::new(world);
            let achievement_store = AchievementStoreTrait::new(world);

            let player = store.read_player();

            // Train player
            store.train_player();

            // Emit events for achievements progression
            let mut achievement_id = constants::ACHIEVEMENTS_INITIAL_ID; // 1
            let stop = constants::ACHIEVEMENTS_COUNT; // 5
            
            while achievement_id <= stop {
                let task: Achievement = achievement_id.into(); // u8 to Achievement
                let task_identifier = task.identifier(); // Achievement identifier is the task to complete
                achievement_store.progress(player.owner.into(), task_identifier, 1, get_block_timestamp());
                achievement_id += 1;
            };
        }

        // Method to mine coins (+5 coins, -5 health)
        fn mine(ref self: ContractState) {
            let mut world = self.world(@"full_starter_react");
            let store = StoreTrait::new(world);
            let achievement_store = AchievementStoreTrait::new(world);

            let player = store.read_player();
           
            // Mine coins
            store.mine_coins();

            // Emit events for achievements progression
            let mut achievement_id = constants::ACHIEVEMENTS_INITIAL_ID; // 1
            let stop = constants::ACHIEVEMENTS_COUNT; // 5
            
            while achievement_id <= stop {
                let task: Achievement = achievement_id.into(); // u8 to Achievement
                let task_identifier = task.identifier(); // Achievement identifier is the task to complete
                achievement_store.progress(player.owner.into(), task_identifier, 1, get_block_timestamp());
                achievement_id += 1;
            };
        }

        // Method to rest player (+20 health)
        fn rest(ref self: ContractState) {
            let mut world = self.world(@"full_starter_react");
            let store = StoreTrait::new(world);
            let achievement_store = AchievementStoreTrait::new(world);

            let player = store.read_player();

            // Rest player
            store.rest_player();

            // Emit events for achievements progression
            let mut achievement_id = constants::ACHIEVEMENTS_INITIAL_ID; // 1
            let stop = constants::ACHIEVEMENTS_COUNT; // 5
            
            while achievement_id <= stop {
                let task: Achievement = achievement_id.into(); // u8 to Achievement
                let task_identifier = task.identifier(); // Achievement identifier is the task to complete
                achievement_store.progress(player.owner.into(), task_identifier, 1, get_block_timestamp());
                achievement_id += 1;
            };
        }

    }
}