# 7. Data Flow - Dojo Game Starter Integration

## 🌊 Complete Data Flow Overview

Understanding how data flows through the Dojo Game Starter is crucial for extending and debugging the system. The data flow follows a **reactive pattern** where UI updates instantly (optimistic) while blockchain operations happen in the background.

```
🔄 Complete Data Flow Cycle

┌─────────────────────────────────────────────────────────────────┐
│                    INITIAL LOAD FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Page Load → 2. Provider Setup → 3. Wallet Connect          │
│      ↓              ↓                    ↓                      │
│  4. Player Check → 5. GraphQL Query → 6. Store Update          │
│      ↓              ↓                    ↓                      │
│  7. Component Render → 8. UI Display → 9. Ready State          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    GAME ACTION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│  1. User Click → 2. Hook Validation → 3. Optimistic Update     │
│      ↓              ↓                    ↓                      │
│  4. UI Instant Update → 5. Blockchain TX → 6. Confirmation     │
│      ↓              ↓                    ↓                      │
│  7. Success/Rollback → 8. Final State → 9. UI Reconciliation   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Application Startup Flow

### **1. Initial Render & Provider Setup**

When the app first loads, the provider hierarchy establishes the foundation:

```typescript
// main.tsx - Initialization chain
const sdk = await init<SchemaType>({
  client: {
    toriiUrl: dojoConfig.toriiUrl,
    worldAddress: dojoConfig.manifest.world.address,
  }
});

// Provider tree setup
<DojoSdkProvider sdk={sdk} clientFn={setupWorld}>
  <StarknetProvider>
    <App />
  </StarknetProvider>
</DojoSdkProvider>
```

**🎯 What Happens:**
- Dojo SDK connects to Torii indexer
- Starknet provider configures wallet connectors
- React component tree renders with providers available

### **2. Component Mounting & Hook Initialization**

```typescript
// HomeScreen.tsx - Component composition
export default function HomePage() {
  return (
    <div>
      <StatusBar />     {/* Connection status */}
      <GameSection />   {/* Player stats + actions */}
    </div>
  )
}

// GameSection.tsx - Data consuming components
export function GameSection() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <PlayerStats />   {/* Displays player data */}
      <GameActions />   {/* Triggers game actions */}
    </div>
  )
}
```

**🔄 Hook Activation Chain:**
```
1. StatusBar mounts → useStarknetConnect + usePlayer + useSpawnPlayer
2. PlayerStats mounts → useAppStore (player data subscription)
3. GameActions mounts → useTrainAction + useMineAction + useRestAction
```

---

## 🔌 Connection & Authentication Flow

### **StatusBar Component - Connection Orchestrator**

The StatusBar demonstrates the complete connection flow:

```typescript
// StatusBar.tsx - Connection coordination
export function StatusBar() {
  const { status, handleConnect } = useStarknetConnect();
  const { player, isLoading: playerLoading } = usePlayer();
  const { initializePlayer, isInitializing } = useSpawnPlayer();

  // 🎮 Auto-initialization after connection
  useEffect(() => {
    if (status === "connected" && !player && !isInitializing && !playerLoading) {
      console.log("🎮 Controller connected, auto-initializing player...");
      setTimeout(() => {
        initializePlayer().then(result => {
          console.log("🎮 Auto-initialization result:", result);
        });
      }, 500);
    }
  }, [status, player, isInitializing, playerLoading, initializePlayer]);

  return (
    <div>
      {status !== "connected" ? (
        <Button onClick={handleConnect}>
          Connect Controller
        </Button>
      ) : (
        <div>Connected: {formatAddress(address)}</div>
      )}
    </div>
  );
}
```

**📊 Connection State Progression:**
```
'disconnected' → 'connecting' → 'connected' → player check → player creation/load → 'ready'
```

---

## 📊 Data Reading Flow (Query Pattern)

### **Player Data Fetching via usePlayer**

```typescript
// usePlayer.tsx - Data fetching pattern
export const usePlayer = () => {
  const { account } = useAccount();
  const { player: storePlayer, setPlayer } = useAppStore();

  // 🔍 GraphQL query to Torii
  const fetchPlayerData = async (playerOwner: string) => {
    const response = await fetch(TORII_URL, {
      method: "POST",
      body: JSON.stringify({
        query: PLAYER_QUERY,
        variables: { playerOwner }
      }),
    });

    const result = await response.json();
    
    if (result.data?.fullStarterReactPlayerModels?.edges?.length) {
      const rawData = result.data.fullStarterReactPlayerModels.edges[0].node;
      return {
        owner: rawData.owner,
        experience: hexToNumber(rawData.experience),
        health: hexToNumber(rawData.health),
        coins: hexToNumber(rawData.coins),
        creation_day: hexToNumber(rawData.creation_day)
      };
    }
    return null;
  };

  // 🔄 Auto-fetch when address changes
  useEffect(() => {
    if (account?.address) {
      fetchPlayerData(account.address).then(setPlayer);
    }
  }, [account?.address]);

  return { player: storePlayer, refetch: fetchPlayerData };
};
```

**🌊 Data Flow Steps:**
```
1. Wallet connects → account.address available
2. usePlayer detects address change → triggers fetchPlayerData
3. GraphQL query sent to Torii → blockchain data retrieved
4. Data processed (hex→number) → setPlayer updates Zustand store
5. Store change triggers → component re-renders with new player data
```

### **PlayerStats Component - Data Consumption**

```typescript
// PlayerStats.tsx - Reactive data display
export function PlayerStats() {
  const player = useAppStore(state => state.player);
  const isLoading = useAppStore(state => state.isLoading);

  // 📊 Computed values from player data
  const currentLevel = Math.floor((player?.experience || 0) / 100) + 1;
  const expInCurrentLevel = (player?.experience || 0) % 100;
  const healthColor = getHealthColor(player?.health || 100);

  return (
    <Card>
      <CardContent>
        {/* Experience display */}
        <div>
          <span>Level {currentLevel}</span>
          <span>{expInCurrentLevel} / 100</span>
          <Progress value={(expInCurrentLevel / 100) * 100} />
        </div>

        {/* Health with color coding */}
        <div>
          <span className={healthColor}>
            Health: {player?.health || 100}/100
          </span>
          <Progress value={player?.health || 100} />
        </div>

        {/* Coins display */}
        <div>
          <Coins className="w-4 h-4" />
          <span>Coins: {player?.coins || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

**⚡ Reactive Updates:**
- Any change to `player` in Zustand store → PlayerStats re-renders
- Computed values (level, progress) update automatically
- UI reflects new state instantly

---

## 🎮 Game Action Flow (Write Operations)

### **Training Action - Complete Flow**

The training action showcases the complete optimistic update pattern:

```typescript
// GameActions.tsx - User interaction
export function GameActions() {
  const { executeTrain, trainState, canTrain } = useTrainAction();

  return (
    <Button 
      onClick={executeTrain}
      disabled={!canTrain || trainState.isLoading}
    >
      {trainState.isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          Training...
        </>
      ) : (
        <>
          <Dumbbell />
          Train (+10 EXP)
        </>
      )}
    </Button>
  );
}
```

### **useTrainAction - Optimistic Update Implementation**

```typescript
// useTrainAction.tsx - Complete action flow
const executeTrain = useCallback(async () => {
  try {
    // 🎯 1. VALIDATION
    if (!canTrain || !account) {
      setTrainState(prev => ({ ...prev, error: "Cannot train right now" }));
      return;
    }

    // ⚡ 2. OPTIMISTIC UPDATE
    setTrainState({ isLoading: true, txStatus: 'PENDING' });
    updatePlayerExperience((player?.experience || 0) + 10);
    
    // 🔗 3. BLOCKCHAIN TRANSACTION
    console.log("📤 Executing train transaction...");
    const tx = await client.game.train(account);

    // ✅ 4. SUCCESS HANDLING
    if (tx && tx.code === "SUCCESS") {
      setTrainState({ txStatus: 'SUCCESS', isLoading: false });
      
      // Auto-clear success state
      setTimeout(() => {
        setTrainState({ isLoading: false, error: null, txStatus: null });
      }, 3000);
    } else {
      throw new Error(`Training failed: ${tx?.code}`);
    }

  } catch (error) {
    // ❌ 5. ROLLBACK ON FAILURE
    console.error("❌ Training failed:", error);
    updatePlayerExperience((player?.experience || 0) - 10); // Revert!
    
    setTrainState({
      isLoading: false,
      error: error.message,
      txStatus: 'REJECTED'
    });
  }
}, [canTrain, account, client, player, updatePlayerExperience]);
```

**🔄 Step-by-Step Breakdown:**

1. **User Clicks "Train"** → `executeTrain()` called
2. **Validation Check** → Ensure wallet connected, player exists
3. **Optimistic Update** → UI shows +10 EXP immediately
4. **Component Re-render** → PlayerStats shows new experience
5. **Blockchain TX** → Transaction sent to Dojo contract
6. **Success/Failure** → Confirm optimistic update or rollback
7. **Final State** → UI settles into final confirmed state

---

## 🔄 State Synchronization Patterns

### **Multi-Component State Coordination**

Multiple components react to the same state changes:

```typescript
// Player data flows to multiple components simultaneously
const player = useAppStore(state => state.player);

// StatusBar uses player for status messages
const getStatusMessage = () => {
  if (!player) return "Create player to start";
  return "Ready to play!";
};

// PlayerStats uses player for display
const stats = {
  experience: player?.experience || 0,
  health: player?.health || 100,
  coins: player?.coins || 0,
};

// GameActions use player for validation
const canTrain = isConnected && player !== null && !isLoading;
const canMine = canTrain && (player?.health || 0) > 5;
const canRest = canTrain && (player?.health || 0) < 100;
```

### **Loading State Coordination**

```typescript
// StatusBar.tsx - Coordinated loading states
const isLoading = isConnecting || status === "connecting" || isInitializing || playerLoading;

const getStatusMessage = () => {
  if (!isConnected) return "Connect your controller to start playing";
  if (playerLoading) return "Loading player data...";
  if (isInitializing) {
    if (txStatus === 'PENDING') return "Creating player on blockchain...";
    if (txStatus === 'SUCCESS') return "Player created successfully!";
    return "Initializing player...";
  }
  if (player) return "Ready to play!";
  return "Preparing...";
};
```

---

## 🔄 Error Handling & Recovery Flow

### **Transaction Failure Pattern**

```typescript
// Error handling with optimistic rollback
try {
  // Optimistic update
  updatePlayerCoins(player.coins + 5);
  updatePlayerHealth(player.health - 5);
  
  // Blockchain transaction
  const tx = await client.game.mine(account);
  
  if (tx.code !== "SUCCESS") {
    throw new Error("Transaction failed");
  }
} catch (error) {
  // Rollback optimistic changes
  updatePlayerCoins(player.coins - 5);    // Revert coins
  updatePlayerHealth(player.health + 5);  // Revert health
  
  // Show error to user
  setMineState({ error: error.message, txStatus: 'REJECTED' });
}
```

### **Component Error States**

```typescript
// PlayerStats.tsx - Error state display
if (isLoading) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin" />
      <span>Loading player data...</span>
    </div>
  );
}

if (!isConnected) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
      <span>Connect controller to load player stats</span>
    </div>
  );
}

if (isConnected && !player) {
  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
      <span>Creating your player automatically...</span>
    </div>
  );
}
```

---


## 🎯 Real-Time Gameplay Example

Let's trace a complete user action from click to final state:

**Scenario: User clicks "Mine" button**

```
⏱️ T+0ms:    User clicks "Mine" button
⏱️ T+1ms:    GameActions.executeMine() called
⏱️ T+2ms:    Validation passes (player has >5 health)
⏱️ T+5ms:    Optimistic update: coins +5, health -5
⏱️ T+6ms:    PlayerStats re-renders with new values
⏱️ T+7ms:    Button shows "Mining..." with spinner
⏱️ T+10ms:   Blockchain transaction initiated
⏱️ T+2000ms: Transaction confirmed by network
⏱️ T+2001ms: Success state set, loading spinner removed
⏱️ T+2002ms: Button returns to normal state
⏱️ T+5000ms: Success state auto-cleared
```

**🎯 Key Insights:**
- **User sees response in <10ms** (optimistic update)
- **UI stays responsive** during 2-second blockchain delay
- **Automatic error recovery** if transaction fails
- **Progressive enhancement** - works with or without blockchain

---

The data flow architecture ensures that users get **instant feedback** while maintaining **data consistency** with the blockchain. This pattern can be extended to any new game mechanics by following the same optimistic update → blockchain transaction → confirmation/rollback flow.

**Next**: We'll explore how to Extend the System with new game mechanics and features.