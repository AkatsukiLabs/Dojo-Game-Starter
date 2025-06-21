# Complete Guide: Dojo Model Updates and Client Code

This guide details the step-by-step process for adding new fields to Dojo models and their corresponding functionalities in the React client.

## 📋 Process Overview

When adding new fields or actions to a Dojo model, you must update multiple layers of the stack. This guide ensures you don't miss any critical steps.

**IMPORTANT!**
For the Cairo contracts use Sensei MCP.
Do not make changes that are not defined in this file.

---

## 🎯 Step 1: Cairo Model Changes

### 1.1 Update `contract/src/models/player.cairo` (or corresponding model)

#### a) Modify the main structure
```cairo
#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
#[dojo::model]
pub struct Player {
    #[key]
    pub owner: ContractAddress,
    pub experience: u32,
    pub health: u32,
    pub coins: u32,
    pub creation_day: u32,
    // ✅ ADD NEW FIELDS HERE
    pub shoot: u32,
    pub dribble: u32,
    pub energy: u32,
    pub stamina: u32,
}
```

#### b) Update the `fn new` constructor
```cairo
fn new(
    owner: ContractAddress,
    experience: u32,
    health: u32,
    coins: u32,
    creation_day: u32,
    // ✅ ADD NEW PARAMETERS
    shoot: u32,
    dribble: u32,
    energy: u32,
    stamina: u32,
) -> Player {
    Player {
        owner: owner,
        experience: experience,
        health: health,
        coins: coins,
        creation_day: creation_day,
        // ✅ ADD INITIALIZATION
        shoot: shoot,
        dribble: dribble,
        energy: energy,
        stamina: stamina,
    }
}
```

#### c) Update `ZeroablePlayerTrait`
```cairo
fn zero() -> Player {
    Player {
        owner: constants::ZERO_ADDRESS(),
        experience: 0,
        health: 0,
        coins: 0,
        creation_day: 0,
        // ✅ ADD FIELDS WITH VALUE 0
        shoot: 0,
        dribble: 0,
        energy: 0,
        stamina: 0,
    }
}
```

#### d) Create setter methods for new fields
```cairo
fn add_shoot(ref self: Player, shoot_amount: u32) {
    self.shoot += shoot_amount;
}

fn add_dribble(ref self: Player, dribble_amount: u32) {
    self.dribble += dribble_amount;
}

fn add_energy(ref self: Player, energy_amount: u32) {
    self.energy += energy_amount;
}

fn add_stamina(ref self: Player, stamina_amount: u32) {
    self.stamina += stamina_amount;
}

fn remove_stamina(ref self: Player, stamina_amount: u32) {
    self.stamina -= stamina_amount;
}
```

#### e) Update ALL tests
```cairo
#[test]
#[available_gas(1000000)]
fn test_player_new_constructor() {
    let player = PlayerTrait::new(
        mock_address,
        50,   // experience
        100,  // health
        25,   // coins
        42,   // creation_day
        // ✅ ADD VALUES FOR NEW FIELDS
        30,   // shoot
        35,   // dribble
        100,  // energy
        100,  // stamina
    );

    // ✅ ADD ASSERTIONS FOR NEW FIELDS
    assert_eq!(player.shoot, 30, "Shoot should be initialized to 30");
    assert_eq!(player.dribble, 35, "Dribble should be initialized to 35");
    assert_eq!(player.energy, 100, "Energy should be initialized to 100");
    assert_eq!(player.stamina, 100, "Stamina should be initialized to 100");
}
```

**⚠️ IMPORTANT:** Update ALL existing tests to include the new fields.

---

## 🏪 Step 2: Update Store Layer

### 2.1 Modify `contract/src/store.cairo`

#### a) Update the constructor in `create_player`
```cairo
fn create_player(mut self: Store) {
    let caller = get_caller_address();
    let current_timestamp = get_block_timestamp();

    let new_player = PlayerTrait::new(
        caller,
        0,   // experience
        100, // health
        0,   // coins
        Timestamp::unix_timestamp_to_day(current_timestamp),
        // ✅ ADD INITIAL VALUES FOR NEW FIELDS
        10,  // shoot - starting skill level
        10,  // dribble - starting skill level
        40,  // energy - starting energy
        40,  // stamina - starting stamina
    );

    self.world.write_model(@new_player);
}
```

#### b) Add functions for new actions
```cairo
fn train_shooting(mut self: Store) {
    let mut player = self.read_player();

    // Example: +5 shooting, +5 experience, -10 stamina
    player.add_shoot(5);
    player.add_experience(5);
    player.remove_stamina(10);

    self.world.write_model(@player);
}

fn restore_stamina(mut self: Store) {
    let mut player = self.read_player();

    // +20 stamina
    player.add_stamina(20);

    self.world.write_model(@player);
}
```

---

## 📦 Step 3: Update TypeScript Bindings

### 3.1 Update `client/src/dojo/bindings.ts`

```typescript
export interface Player {
    owner: string;
    experience: number;
    health: number;
    coins: number;
    creation_day: number;
    // ✅ ADD NEW FIELDS
    shoot: number;
    dribble: number;
    energy: number;
    stamina: number;
}

export const schema: SchemaType = {
    full_starter_react: {
        Player: {
            owner: "",
            experience: 0,
            health: 0,
            coins: 0,
            creation_day: 0,
            // ✅ ADD WITH DEFAULT VALUES
            shoot: 0,
            dribble: 0,
            energy: 0,
            stamina: 0,
        },
    },
};
```

---

## 🔗 Step 4: Update Contract Functions

### 4.1 Add to `client/src/dojo/contracts.gen.ts`

```typescript
// ✅ ADD CALLDATA BUILDER
const build_game_trainShooting_calldata = (): DojoCall => {
    return {
        contractName: "game",
        entrypoint: "train_shooting",
        calldata: [],
    };
};

// ✅ ADD EXECUTION FUNCTION
const game_trainShooting = async (snAccount: Account | AccountInterface) => {
    try {
        return await provider.execute(
            snAccount as any,
            build_game_trainShooting_calldata(),
            "full_starter_react",
        );
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// ✅ ADD TO RETURN OBJECT
return {
    game: {
        // ... existing functions
        trainShooting: game_trainShooting,
        buildTrainShootingCalldata: build_game_trainShooting_calldata,
        restoreStamina: game_restoreStamina,
        buildRestoreStaminaCalldata: build_game_restoreStamina_calldata,
    },
};
```

---

## 🎮 Step 5: Update System Layer (if applicable)

### 5.1 Add to `contract/src/systems/game.cairo`

#### a) Update interface
```cairo
#[starknet::interface]
pub trait IGame<T> {
    // ... existing methods
    fn train_shooting(ref self: T);
    fn restore_stamina(ref self: T);
}
```

#### b) Implement methods
```cairo
fn train_shooting(ref self: ContractState) {
    let mut world = self.world(@"full_starter_react");
    let store = StoreTrait::new(world);
    let achievement_store = AchievementStoreTrait::new(world);

    let player = store.read_player();

    // Train shooting
    store.train_shooting();

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
```

**⚠️ CRITICAL:** Always follow the EXACT same pattern as existing functions. Do NOT use `emit!` or other custom patterns.

**📋 Required Pattern for ALL System Functions:**
1. `let mut world = self.world(@"full_starter_react");`
2. `let store = StoreTrait::new(world);`
3. `let achievement_store = AchievementStoreTrait::new(world);`
4. `let player = store.read_player();`
5. Call your store method (e.g., `store.improve_charisma();`)
6. Achievement progression loop (copy exactly from other functions)
```

---

## 🪝 Step 6: Update React Hooks

### 6.1 Update `client/src/dojo/hooks/usePlayer.tsx`

#### a) Add fields to GraphQL query
```typescript
const PLAYER_QUERY = `
    query GetPlayer($playerOwner: ContractAddress!) {
        fullStarterReactPlayerModels(where: { owner: $playerOwner }) {
            edges {
                node {
                    owner
                    experience
                    health
                    coins
                    creation_day
                    shoot
                    dribble
                    energy
                    stamina
                }
            }
        }
    }
`;
```

#### b) Update data processing
```typescript
return {
    owner: rawPlayerData.owner,
    experience: hexToNumber(rawPlayerData.experience),
    health: hexToNumber(rawPlayerData.health),
    coins: hexToNumber(rawPlayerData.coins),
    creation_day: hexToNumber(rawPlayerData.creation_day),
    // ✅ ADD NEW FIELDS WITH DEFAULTS
    shoot: hexToNumber(rawPlayerData.shoot || 10),
    dribble: hexToNumber(rawPlayerData.dribble || 10),
    energy: hexToNumber(rawPlayerData.energy || 40),
    stamina: hexToNumber(rawPlayerData.stamina || 40),
};
```

### 6.2 Create specific action hooks

Example: `client/src/dojo/hooks/useTrainShootingAction.tsx`

```typescript
export const useTrainShootingAction = (): UseTrainShootingActionReturn => {
    const { account, status } = useAccount();
    const { client } = useDojoSDK();
    const {
        player,
        updatePlayerShooting,
        updatePlayerExperience,
        updatePlayerStamina
    } = useAppStore();

    // ✅ SPECIFIC VALIDATION
    const hasEnoughStamina = (player?.stamina || 0) >= 10;
    const canTrainShooting = isConnected && hasPlayer && hasEnoughStamina && !isLoading;

    const executeTrainShooting = useCallback(async () => {
        try {
            // ✅ OPTIMISTIC UPDATE - MUST MATCH CONTRACT LOGIC
            updatePlayerShooting((player?.shoot || 10) + 5);
            updatePlayerExperience((player?.experience || 0) + 5);
            updatePlayerStamina(Math.max(0, (player?.stamina || 40) - 10));

            const tx = await client.game.trainShooting(account as Account);

            if (tx && tx.code === "SUCCESS") {
                // Success - optimistic updates remain
            } else {
                throw new Error(`Transaction failed: ${tx?.code}`);
            }
        } catch (error) {
            // ✅ ROLLBACK - REVERT ALL OPTIMISTIC UPDATES
            updatePlayerShooting((player?.shoot || 10) - 5);
            updatePlayerExperience((player?.experience || 0) - 5);
            updatePlayerStamina(Math.min(100, (player?.stamina || 40) + 10));
        }
    }, [/* dependencies */]);
};
```

---

## 🗄️ Step 7: Update Zustand Store

### 7.1 Modify `client/src/zustand/store.ts`

#### a) Update interface
```typescript
export interface Player {
    owner: string;
    experience: number;
    health: number;
    coins: number;
    creation_day: number;
    // ✅ ADD NEW FIELDS
    shoot: number;
    dribble: number;
    energy: number;
    stamina: number;
}
```

#### b) Add update actions
```typescript
interface AppActions {
    // ... existing actions
    updatePlayerShooting: (shoot: number) => void;
    updatePlayerDribbling: (dribble: number) => void;
    updatePlayerEnergy: (energy: number) => void;
    updatePlayerStamina: (stamina: number) => void;
}

// ✅ IMPLEMENT ACTIONS
updatePlayerShooting: (shoot) => set((state) => ({
    player: state.player ? { ...state.player, shoot } : null
})),

updatePlayerStamina: (stamina) => set((state) => ({
    player: state.player ? { ...state.player, stamina } : null
})),
```

---

## 🎨 Step 8: Update UI Components

### 8.1 Update `client/src/components/player-stats.tsx`

```typescript
const stats = [
    // ... existing stats
    {
        label: "Shooting",
        value: player?.shoot || 10,
        color: "text-red-400",
        icon: Target
    },
    {
        label: "Stamina",
        value: player?.stamina || 40,
        color: "text-blue-400",
        icon: Battery
    },
];

// ✅ ADD SPECIFIC ALERTS
{player && player.stamina <= 10 && (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <span>⚡ Low stamina! Restore stamina to train skills.</span>
    </div>
)}
```

### 8.2 Update `client/src/components/game-actions.tsx`

```typescript
// ✅ IMPORT NEW HOOKS
import { useTrainShootingAction } from "../dojo/hooks/useTrainShootingAction";
import { useRestoreStaminaAction } from "../dojo/hooks/useRestoreStaminaAction";

// ✅ USE HOOKS
const { trainShootingState, executeTrainShooting, canTrainShooting } = useTrainShootingAction();
const { restoreStaminaState, executeRestoreStamina, canRestoreStamina } = useRestoreStaminaAction();

// ✅ ADD TO ACTIONS ARRAY
const actions = [
    // ... existing actions
    {
        icon: Target,
        label: "Train Shooting",
        description: "+5 Shooting, +5 EXP, -10 Stamina",
        onClick: executeTrainShooting,
        color: "from-red-500 to-red-600",
        state: trainShootingState,
        canExecute: canTrainShooting,
    },
    {
        icon: Battery,
        label: "Restore Stamina",
        description: "+20 Stamina",
        onClick: executeRestoreStamina,
        color: "from-purple-500 to-purple-600",
        state: restoreStaminaState,
        canExecute: canRestoreStamina,
        disabledReason: !canRestoreStamina && player && (player.stamina || 0) >= 100
            ? "Full Stamina!"
            : undefined,
    },
];
```

---

## 🔐 Step 9: Update Cartridge Connector

### 9.1 Add to `client/src/config/cartridgeConnector.tsx`

```typescript
const policies = {
    contracts: {
        [CONTRACT_ADDRESS_GAME]: {
            methods: [
                // ... existing methods
                { name: "train_shooting", entrypoint: "train_shooting" },
                { name: "restore_stamina", entrypoint: "restore_stamina" },
            ],
        },
    },
}
```

---

## 🔍 Step 10: Verification and Testing

### 10.1 Verification Checklist

- [ ] ✅ Contracts compile without errors
- [ ] ✅ TypeScript compiles without errors
- [ ] ✅ All Cairo tests pass
- [ ] ✅ UI shows new fields correctly
- [ ] ✅ Actions work (optimistic update)
- [ ] ✅ Persistence works (page reload)
- [ ] ✅ Validations work (buttons disabled appropriately)
- [ ] ✅ Rollback works on error

### 10.2 Testing Pattern

1. **Execute action** → Verify immediate UI update
2. **Reload page** → Verify data persistence
3. **Test limits** → Verify validations (e.g., stamina = 0)
4. **Simulate errors** → Verify rollback

---

## ⚠️ Common Errors to Avoid

### 🚨 **Critical Error #1: Inconsistent System Function Pattern**
```cairo
// ❌ BAD - Using custom emit! or different pattern
fn improve_charisma(ref self: ContractState) {
    let mut world = self.world(@"full_starter_react");
    let store = StoreTrait::new(world);

    store.improve_charisma();

    let player = store.read_player();
    emit!(world, (Events::ActionsEvent(player.owner, "improve_charisma")));
}

// ✅ GOOD - Follow the EXACT same pattern as ALL other functions
fn improve_charisma(ref self: ContractState) {
    let mut world = self.world(@"full_starter_react");
    let store = StoreTrait::new(world);
    let achievement_store = AchievementStoreTrait::new(world);

    let player = store.read_player();

    // Improve charisma
    store.improve_charisma();

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
```

### 🚨 **Critical Error #2: Hooks Don't Update All Fields**
```typescript
// ❌ BAD - Only updates one field
updatePlayerShooting((player?.shoot || 10) + 5);

// ✅ GOOD - Updates ALL fields that the contract changes
updatePlayerShooting((player?.shoot || 10) + 5);
updatePlayerExperience((player?.experience || 0) + 5);
updatePlayerStamina(Math.max(0, (player?.stamina || 40) - 10));
```

### 🚨 **Critical Error #3: Incomplete Tests**
```cairo
// ❌ BAD - Forgetting to update existing tests
let player = PlayerTrait::new(mock_address, 0, 100, 0, 1); // Missing new fields

// ✅ GOOD - Include ALL fields
let player = PlayerTrait::new(mock_address, 0, 100, 0, 1, 10, 10, 40, 40);
```

### 🚨 **Critical Error #4: Inconsistent Defaults**
```typescript
// ❌ BAD - Different defaults in different places
shoot: hexToNumber(rawPlayerData.shoot || 0),     // Default 0
updatePlayerShooting((player?.shoot || 10) + 5); // Default 10

// ✅ GOOD - Consistent defaults
shoot: hexToNumber(rawPlayerData.shoot || 10),    // Default 10
updatePlayerShooting((player?.shoot || 10) + 5); // Default 10
```

---

## 📚 Additional Resources

- [Dojo Documentation](https://book.dojoengine.org/)
- [Architecture Guide](./02-architecture.md)
- [Hook Patterns](./06-react-hooks-pattern.md)
- [System Extension](./08-extending-system.md)

---

**💡 Final Tip:** Always follow this exact order. Each step depends on the previous one. If you skip one, data persistence will likely not work correctly.
