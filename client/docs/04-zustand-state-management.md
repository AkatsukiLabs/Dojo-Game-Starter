# 4. Zustand State Management - Dojo Game Starter

## 🎯 Why Zustand for Onchain Games?

Zustand is the **backbone** of the Dojo Game Starter's state management, chosen specifically for its performance and simplicity in handling blockchain interactions. Unlike traditional web apps, onchain games require:

- **Optimistic Updates**: Instant UI feedback while transactions process
- **State Reconciliation**: Syncing local state with blockchain reality
- **Transaction Tracking**: Managing multiple async blockchain operations
- **Data Persistence**: Caching blockchain data for better UX

```
🏗️ State Architecture Overview

┌─────────────────────────────────────────────────────────┐
│                  ZUSTAND STORE                          │
├─────────────────────────────────────────────────────────┤
│  👤 Player State    │  🎮 Game State   │  ⚡ UI State    │
│  - owner           │  - gameStarted   │  - isLoading    │
│  - experience      │  - currentAction │  - error        │
│  - health          │  - txStatus      │  - txHash       │
│  - coins           │                  │                 │
└─────────────────────────────────────────────────────────┘
              ↑                    ↓
    ┌─────────────────┐    ┌─────────────────┐
    │  Custom Hooks   │    │ React Components│
    │  - usePlayer    │    │  - GameActions  │
    │  - useTrainAction│    │  - PlayerStats  │
    │  - useMineAction │    │  - StatusBar    │
    └─────────────────┘    └─────────────────┘
```

---

## 🏪 Core Store Structure

### **`store.ts`** - Global State Hub

The Zustand store serves as the single source of truth for all application state:

```typescript
// Interface matching bindings from Cairo contracts
export interface Player {
  owner: string;          // Player's wallet address
  experience: number;     // Game experience points
  health: number;         // Current health (0-100)
  coins: number;          // Player's currency
  creation_day: number;   // Timestamp when created
}

// Application state structure
interface AppState {
  // 👤 Player Data
  player: Player | null;
  
  // ⚡ UI State
  isLoading: boolean;     // Global loading state
  error: string | null;   // Error messages
  
  // 🎮 Game State
  gameStarted: boolean;   // Whether game session is active
}

// Store actions for state mutations
interface AppActions {
  // Player management
  setPlayer: (player: Player | null) => void;
  updatePlayerCoins: (coins: number) => void;
  updatePlayerExperience: (experience: number) => void;
  updatePlayerHealth: (health: number) => void;
  
  // UI management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Game management
  startGame: () => void;
  endGame: () => void;
  resetStore: () => void;
}
```

### **Store Creation with Persistence**

```typescript
const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial state
      player: null,
      isLoading: false,
      error: null,
      gameStarted: false,

      // Player actions - immutable updates
      setPlayer: (player) => set({ player }),
      
      updatePlayerCoins: (coins) => set((state) => ({
        player: state.player ? { ...state.player, coins } : null
      })),
      
      updatePlayerExperience: (experience) => set((state) => ({
        player: state.player ? { ...state.player, experience } : null
      })),

      updatePlayerHealth: (health) => set((state) => ({
        player: state.player ? { ...state.player, health } : null
      })),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Game actions
      startGame: () => set({ gameStarted: true }),
      endGame: () => set({ gameStarted: false }),
      resetStore: () => set(initialState),
    }),
    {
      name: 'dojo-starter-store',           // localStorage key
      partialize: (state) => ({            // Only persist these fields
        player: state.player,
        gameStarted: state.gameStarted,
      }),
    }
  )
);
```

**🔑 Key Features:**
- **Immutable Updates**: All state changes create new objects (React optimization)
- **Selective Persistence**: Only critical data survives page refreshes
- **Type Safety**: Full TypeScript integration with interface definitions
- **Middleware Support**: Easy integration with persist, devtools, etc.

---

## ⚡ Optimistic Updates Pattern

The most critical feature for onchain games is **optimistic updates** - updating the UI immediately while blockchain transactions process in the background.

### **Game Action Hook Example: `useTrainAction`**

```typescript
export const useTrainAction = (): UseTrainActionReturn => {
  const { account } = useAccount();
  const { client } = useDojoSDK();
  const { player, updatePlayerExperience } = useAppStore();
  
  const [trainState, setTrainState] = useState<TrainActionState>({
    isLoading: false,
    error: null,
    txHash: null,
    txStatus: null
  });
  
  const executeTrain = useCallback(async () => {
    try {
      // 1. ⚡ OPTIMISTIC UPDATE - Instant UI feedback
      setTrainState({ isLoading: true, txStatus: 'PENDING', ... });
      updatePlayerExperience((player?.experience || 0) + 10);
      
      // 2. 🔗 BLOCKCHAIN TRANSACTION - Send to network
      console.log("📤 Executing train transaction...");
      const tx = await client.game.train(account);
      
      if (tx?.transaction_hash) {
        setTrainState(prev => ({ ...prev, txHash: tx.transaction_hash }));
      }
      
      // 3. ✅ CONFIRMATION - Transaction succeeded
      if (tx && tx.code === "SUCCESS") {
        console.log("✅ Train transaction successful!");
        setTrainState(prev => ({ ...prev, txStatus: 'SUCCESS' }));
        
        // Auto-clear success state after 3 seconds
        setTimeout(() => resetTrainState(), 3000);
      } else {
        throw new Error(`Transaction failed: ${tx?.code}`);
      }
      
    } catch (error) {
      // 4. ❌ ROLLBACK - Revert optimistic update on failure
      console.error("❌ Training failed:", error);
      updatePlayerExperience((player?.experience || 0) - 10); // Rollback
      setTrainState({ 
        isLoading: false, 
        error: error.message, 
        txStatus: 'REJECTED' 
      });
    }
  }, [account, client, player, updatePlayerExperience]);
  
  return { trainState, executeTrain, canTrain: !trainState.isLoading };
};
```

### **Pattern Breakdown:**

1. **⚡ Immediate Update**: UI updates instantly (+10 EXP shown immediately)
2. **🔗 Background Transaction**: Blockchain operation happens asynchronously
3. **✅ Confirmation**: Success state maintained, user sees completion
4. **❌ Rollback**: If transaction fails, optimistic update is reverted

---

## 🎮 Game Action Hooks Integration

Each game action follows the same optimistic pattern but with different logic:

### **`useMineAction` - Earn Coins, Lose Health**

```typescript
const executeMine = useCallback(async () => {
  // Validation - check if player has enough health
  const hasEnoughHealth = (player?.health || 0) > 5;
  if (!hasEnoughHealth) {
    setMineState(prev => ({ 
      ...prev, 
      error: "Not enough health to mine (need >5 HP)" 
    }));
    return;
  }

  try {
    // Optimistic update: +5 coins, -5 health
    updatePlayerCoins((player?.coins || 0) + 5);
    updatePlayerHealth(Math.max(0, (player?.health || 100) - 5));
    
    // Execute blockchain transaction
    const tx = await client.game.mine(account);
    
    // Handle success/failure...
  } catch (error) {
    // Rollback both changes on failure
    updatePlayerCoins((player?.coins || 0) - 5);
    updatePlayerHealth((player?.health || 0) + 5);
  }
}, [client, account, player, updatePlayerCoins, updatePlayerHealth]);
```

### **`useRestAction` - Recover Health**

```typescript
const executeRest = useCallback(async () => {
  // Validation - only rest if health < 100
  const needsHealth = (player?.health || 0) < 100;
  if (!needsHealth) {
    setRestState(prev => ({ 
      ...prev, 
      error: "Health is already full" 
    }));
    return;
  }

  try {
    // Optimistic update: +20 health (max 100)
    updatePlayerHealth(Math.min(100, (player?.health || 100) + 20));
    
    // Execute blockchain transaction
    const tx = await client.game.rest(account);
    
    // Handle success/failure...
  } catch (error) {
    // Rollback health change on failure
    updatePlayerHealth((player?.health || 0) - 20);
  }
}, [client, account, player, updatePlayerHealth]);
```

---

## 🔧 Advanced Store Patterns

### **Selective State Subscriptions**

Zustand allows components to subscribe only to specific state slices, minimizing re-renders:

```typescript
// ✅ Good - Only re-renders when coins change
function CoinsDisplay() {
  const coins = useAppStore(state => state.player?.coins || 0);
  return <span>Coins: {coins}</span>;
}

// ✅ Good - Multiple specific values
function PlayerStats() {
  const { experience, health } = useAppStore(state => ({
    experience: state.player?.experience || 0,
    health: state.player?.health || 100,
  }));
  
  return (
    <div>
      <div>EXP: {experience}</div>
      <div>HP: {health}</div>
    </div>
  );
}

// ❌ Bad - Re-renders on any store change
function BadComponent() {
  const store = useAppStore(); // Subscribes to everything
  return <div>Coins: {store.player?.coins}</div>;
}
```

### **Computed Values and Derived State**

```typescript
// Custom selector for computed values
const usePlayerStats = () => {
  return useAppStore(state => {
    if (!state.player) return null;
    
    return {
      // Raw values
      experience: state.player.experience,
      health: state.player.health,
      coins: state.player.coins,
      
      // Computed values
      level: Math.floor(state.player.experience / 100) + 1,
      healthPercentage: (state.player.health / 100) * 100,
      isLowHealth: state.player.health < 20,
      canAfford: (price: number) => state.player.coins >= price,
      
      // Status indicators
      status: state.player.health <= 0 ? 'dead' :
              state.player.health < 20 ? 'critical' :
              state.player.health < 50 ? 'low' : 'healthy'
    };
  });
};

// Usage in components
function AdvancedPlayerDisplay() {
  const stats = usePlayerStats();
  
  if (!stats) return <div>No player data</div>;
  
  return (
    <div className={stats.isLowHealth ? 'text-red-500' : 'text-green-500'}>
      <div>Level {stats.level}</div>
      <div>Health: {stats.health}% ({stats.status})</div>
      <div>Can afford 50 coins: {stats.canAfford(50) ? 'Yes' : 'No'}</div>
    </div>
  );
}
```

---

## 💾 Persistence Strategy

The store uses strategic persistence to balance performance with UX:

```typescript
{
  name: 'dojo-starter-store',
  partialize: (state) => ({
    // ✅ Persist - Critical user data
    player: state.player,
    gameStarted: state.gameStarted,
    
    // ❌ Don't persist - Transient UI state
    // isLoading: state.isLoading,    // Should reset on page load
    // error: state.error,            // Errors should not persist
    // txHash: state.txHash,          // Transaction state is temporary
  }),
}
```

**What Gets Persisted:**
- **Player Data**: Cached to avoid re-fetching on every page load
- **Game State**: Remember if user was in an active game session

**What Doesn't Get Persisted:**
- **Loading States**: Should always start fresh
- **Error Messages**: Don't show stale errors
- **Transaction Hashes**: Temporary transaction tracking

---

## 🎯 Integration with React Components

### **Component Usage Patterns**

```typescript
// GameActions.tsx - Uses multiple action hooks
function GameActions() {
  const player = useAppStore(state => state.player);
  
  // Each action has its own hook with optimistic updates
  const { trainState, executeTrain, canTrain } = useTrainAction();
  const { mineState, executeMine, canMine } = useMineAction();
  const { restState, executeRest, canRest } = useRestAction();
  
  return (
    <div>
      <Button 
        onClick={executeTrain}
        disabled={!canTrain || trainState.isLoading}
        className={trainState.txStatus === 'SUCCESS' ? 'border-green-500' : ''}
      >
        {trainState.isLoading ? 'Training...' : 'Train (+10 EXP)'}
      </Button>
      
      <Button 
        onClick={executeMine}
        disabled={!canMine || mineState.isLoading}
      >
        {mineState.isLoading ? 'Mining...' : 'Mine (+5 Coins, -5 HP)'}
      </Button>
      
      <Button 
        onClick={executeRest}
        disabled={!canRest || restState.isLoading}
      >
        {restState.isLoading ? 'Resting...' : 'Rest (+20 HP)'}
      </Button>
    </div>
  );
}
```

---

## 🚀 Performance Benefits

### **Why Zustand > Redux for Onchain Games**

| Feature | Zustand | Redux | Impact |
|---------|---------|-------|---------|
| **Boilerplate** | Minimal | Heavy | Faster development |
| **Bundle Size** | ~2.5KB | ~19KB+ | Better loading times |
| **TypeScript** | Native | Requires setup | Better DX |
| **Optimistic Updates** | Simple | Complex | Easier blockchain UX |
| **Selectors** | Built-in | Requires reselect | Less dependencies |
| **Persistence** | Middleware | External lib | Simpler setup |

### **Real Performance Impact:**

```typescript
// Zustand - Direct, minimal re-renders
const coins = useAppStore(state => state.player?.coins || 0);

// Redux equivalent - More complex, potential over-rendering
const coins = useSelector(state => state.player?.coins || 0);
const dispatch = useDispatch();
```

---

## 🛡️ Error Handling & Resilience

### **Transaction State Management**

```typescript
// Comprehensive transaction state tracking
interface ActionState {
  isLoading: boolean;                               // UI loading state
  error: string | null;                            // Error messages
  txHash: string | null;                          // Blockchain tx hash
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null; // Transaction status
}

// Auto-cleanup patterns
const executeAction = async () => {
  try {
    // Execute optimistic update + transaction
  } catch (error) {
    // Set error state
    setActionState({ error: error.message, txStatus: 'REJECTED' });
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setActionState({ error: null, txStatus: null });
    }, 5000);
  }
};
```

### **Store Recovery Patterns**

```typescript
// Reset store to clean state when needed
const { resetStore } = useAppStore();

// Partial reset - only clear errors
const clearErrors = () => useAppStore.setState({ error: null });

// Recovery from failed state
const recoverFromFailedTransaction = () => {
  useAppStore.setState({
    isLoading: false,
    error: null,
    // Keep player data, just clear transaction state
  });
};
```

---

Zustand provides the perfect foundation for onchain game state management, combining simplicity with powerful features needed for blockchain interactions. The optimistic update pattern ensures users get immediate feedback while maintaining data consistency with the blockchain.

**Next**: We'll explore how **Cartridge Controller Integration** provides seamless wallet connectivity and gaming-focused user experience.