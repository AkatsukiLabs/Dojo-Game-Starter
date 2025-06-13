# 6. React Hooks Pattern - Dojo Game Starter

## 🎯 Hook-Based Architecture Philosophy

The Dojo Game Starter uses a **sophisticated hook pattern** that separates concerns while maintaining seamless integration between React components and blockchain operations. Each hook has a specific responsibility, but they work together to create a unified, reactive gaming experience.

```
🔗 Hook Dependency Graph

┌─────────────────────────────────────────────────────────────────┐
│                        COMPONENT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  📱 StatusBar    │  🎮 GameActions   │  📊 PlayerStats          │
│  - Connection    │  - Train/Mine     │  - Experience            │
│  - Player Status │  - Rest Actions   │  - Health/Coins          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HOOK ORCHESTRATION                         │
├─────────────────────────────────────────────────────────────────┤
│  🔌 useStarknetConnect → 👤 usePlayer → 🎮 useSpawnPlayer      │
│                           ↓              ↓                      │
│                    🏋️ useTrainAction  ⛏️ useMineAction         │
│                    💤 useRestAction   📊 useGameStats          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     INTEGRATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  🏪 Zustand Store  │  🔗 Dojo SDK     │  📡 GraphQL Queries     │
│  - Global State   │  - Contracts     │  - Torii Indexer        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Connection Layer Hooks

### **`useStarknetConnect`** - Wallet Connection Foundation

This hook manages the **fundamental connection** to Starknet via Cartridge Controller.

**🔑 Core Connection Logic:**
```typescript
const handleConnect = useCallback(async () => {
  const connector = connectors[0]; // Cartridge Controller
  
  try {
    setIsConnecting(true);
    console.log("🔗 Attempting to connect controller...");
    
    // Opens Cartridge Controller interface
    await connect({ connector });
    
    console.log("✅ Controller connected successfully");
  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    setIsConnecting(false);
  }
}, [connect, connectors]);
```

**📤 Return Interface:**
```typescript
return { 
  status,           // 'connected' | 'disconnected' | 'connecting'
  address,          // Wallet address when connected
  isConnecting,     // Connection loading state
  handleConnect,    // Function to initiate connection
  handleDisconnect, // Function to disconnect
};
```

**🎯 Key Responsibilities:**
- **Controller Integration**: Direct interface with Cartridge Controller
- **Connection State**: Comprehensive connection status management
- **Error Handling**: Robust error management for connection failures
- **Auto-Reconnection**: Supports automatic reconnection on page refresh

---

## 👤 Data Layer Hooks

### **`usePlayer`** - Player Data Management

The **data backbone** of the game, connecting GraphQL queries to Zustand state.

**🔍 GraphQL Query Structure:**
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
        }
      }
    }
  }
`;
```

**🔄 Data Fetching Logic:**
```typescript
const fetchPlayerData = async (playerOwner: string): Promise<Player | null> => {
  const response = await fetch(TORII_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: PLAYER_QUERY,
      variables: { playerOwner }
    }),
  });

  const result = await response.json();
  
  if (!result.data?.fullStarterReactPlayerModels?.edges?.length) {
    return null; // Player not found
  }

  // Convert hex blockchain values to JavaScript numbers
  const rawData = result.data.fullStarterReactPlayerModels.edges[0].node;
  return {
    owner: rawData.owner,
    experience: hexToNumber(rawData.experience),
    health: hexToNumber(rawData.health),
    coins: hexToNumber(rawData.coins),
    creation_day: hexToNumber(rawData.creation_day)
  };
};
```

**🏪 Zustand Integration:**
```typescript
// Get player from store and setter function
const storePlayer = useAppStore(state => state.player);
const setPlayer = useAppStore(state => state.setPlayer);

// Auto-fetch when wallet address changes
useEffect(() => {
  if (userAddress) {
    fetchPlayerData(userAddress).then(setPlayer);
  }
}, [userAddress]);
```

**🎯 Key Features:**
- **GraphQL Integration**: Direct queries to Torii indexer
- **Data Transformation**: Converts hex blockchain values to JavaScript numbers
- **Zustand Integration**: Seamless state management
- **Caching**: Leverages store for performance
- **Auto-Refresh**: Reacts to wallet address changes

---

## 🎮 Initialization Layer Hook

### **`useSpawnPlayer`** - Player Creation Orchestrator

The **most complex hook**, handling player creation and initialization logic.

**🛡️ Race Condition Prevention:**
```typescript
const [isInitializing, setIsInitializing] = useState(false);

const initializePlayer = useCallback(async () => {
  // Prevent multiple executions
  if (isInitializing) {
    return { success: false, error: "Already initializing" };
  }
  setIsInitializing(true);
  // ... rest of logic
}, [isInitializing]);
```

**✅ Validation Chain:**
```typescript
// Multi-step validation before creating player
if (status !== "connected") {
  return { success: false, error: "Controller not connected" };
}

if (!account) {
  return { success: false, error: "No account found" };
}
```

**🔍 Player Existence Check:**
```typescript
// Check if player already exists
console.log("🔄 Checking for existing player...");
setInitState(prev => ({ ...prev, step: 'checking' }));

await refetchPlayer(); // Use usePlayer hook to refresh data

if (player) {
  // Player exists - no need to create
  return { success: true, playerExists: true };
}
```

**🎮 Player Creation Flow:**
```typescript
// Create new player via Dojo SDK
console.log("🎮 Creating new player...");
setInitState(prev => ({ ...prev, step: 'spawning', txStatus: 'PENDING' }));

const txResult = await client.game.spawnPlayer(account);

if (txResult && txResult.code === "SUCCESS") {
  // Refresh player data after creation
  await refetchPlayer();
  
  return { 
    success: true, 
    playerExists: false, 
    transactionHash: txResult.transaction_hash 
  };
}
```

**📊 Complex State Tracking:**
```typescript
interface InitializeState {
  isInitializing: boolean;
  error: string | null;
  step: 'checking' | 'spawning' | 'loading' | 'success';
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
}
```

**🎯 Complex State Management:**
- **Multi-step Process**: Checking → Spawning → Loading → Success
- **Transaction Tracking**: Complete transaction lifecycle
- **Error Recovery**: Comprehensive error handling
- **Race Condition Prevention**: Multiple execution guards
- **Hook Integration**: Coordinates with `usePlayer` and `useStarknetConnect`

---

## ⚡ Game Action Hooks

### **`useTrainAction`** - Training Action with Optimistic Updates

Each game action follows the **same optimistic pattern** but with action-specific logic.

**🎯 Action Validation:**
```typescript
const { account, status } = useAccount();
const { player } = useAppStore();

const isConnected = status === "connected";
const hasPlayer = player !== null;
const canTrain = isConnected && hasPlayer && !trainState.isLoading;
```

**⚡ Optimistic Update Pattern:**
```typescript
const executeTrain = useCallback(async () => {
  try {
    // 1. ⚡ IMMEDIATE UI UPDATE
    setTrainState({ isLoading: true, txStatus: 'PENDING', ... });
    updatePlayerExperience((player?.experience || 0) + 10);

    // 2. 🔗 BLOCKCHAIN TRANSACTION
    const tx = await client.game.train(account);

    // 3. ✅ CONFIRMATION
    if (tx && tx.code === "SUCCESS") {
      setTrainState({ txStatus: 'SUCCESS', isLoading: false });
    }
  } catch (error) {
    // 4. ❌ ROLLBACK on failure
    updatePlayerExperience((player?.experience || 0) - 10);
    setTrainState({ error: error.message, txStatus: 'REJECTED' });
  }
}, [client, account, player]);
```

**🔄 Auto-Cleanup Logic:**
```typescript
// Auto-clear success state after 3 seconds
setTimeout(() => {
  setTrainState({
    isLoading: false,
    error: null,
    txHash: null,
    txStatus: null
  });
}, 3000);
```

### **Action Hook Variations**

Each action hook follows the same pattern but with different validation and effects:

**⛏️ useMineAction - Health Validation:**
```typescript
const hasEnoughHealth = (player?.health || 0) > 5;
const canMine = isConnected && hasPlayer && hasEnoughHealth && !mineState.isLoading;

// Optimistic update: +5 coins, -5 health
updatePlayerCoins((player?.coins || 0) + 5);
updatePlayerHealth(Math.max(0, (player?.health || 100) - 5));
```

**💤 useRestAction - Full Health Check:**
```typescript
const needsHealth = (player?.health || 0) < 100;
const canRest = isConnected && hasPlayer && needsHealth && !restState.isLoading;

// Optimistic update: +20 health (max 100)
updatePlayerHealth(Math.min(100, (player?.health || 100) + 20));
```

---

## 🔄 Hook Integration Patterns

### **Component Usage Pattern**

```typescript
// GameActions.tsx - Component using multiple action hooks
export function GameActions() {
  const player = useAppStore(state => state.player);

  // Each action has its own dedicated hook
  const { trainState, executeTrain, canTrain } = useTrainAction();
  const { mineState, executeMine, canMine } = useMineAction();
  const { restState, executeRest, canRest } = useRestAction();

  const actions = [
    {
      icon: Dumbbell,
      label: "Train",
      description: "+10 EXP",
      onClick: executeTrain,
      state: trainState,
      canExecute: canTrain,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Hammer,
      label: "Mine", 
      description: "+5 Coins, -5 Health",
      onClick: executeMine,
      state: mineState,
      canExecute: canMine,
      color: "from-yellow-500 to-yellow-600",
      disabledReason: !canMine && player && (player.health || 0) <= 5 
        ? "Low Health!" 
        : undefined,
    },
    {
      icon: Bed,
      label: "Rest",
      description: "+20 Health", 
      onClick: executeRest,
      state: restState,
      canExecute: canRest,
      color: "from-green-500 to-green-600",
      disabledReason: !canRest && player && (player.health || 0) >= 100 
        ? "Full Health!" 
        : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const isLoading = action.state.isLoading;
        
        return (
          <Button
            key={action.label}
            onClick={action.onClick}
            disabled={!action.canExecute || isLoading}
            className={`w-full h-14 bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-300`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {action.label}ing...
              </>
            ) : (
              <>
                <Icon className="w-5 h-5 mr-2" />
                {action.label} ({action.description})
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}
```

### **Status Bar Integration**

```typescript
// StatusBar.tsx - Orchestrating multiple hooks
export function StatusBar() {
  const { status, address, handleConnect, handleDisconnect } = useStarknetConnect();
  const { player, isLoading: playerLoading } = usePlayer();
  const { initializePlayer, isInitializing, txStatus } = useSpawnPlayer();
  const { connector } = useAccount();

  const isConnected = status === "connected";
  const isLoading = isConnecting || isInitializing || playerLoading;

  // 🎮 Auto-initialize player after connection
  useEffect(() => {
    if (isConnected && !player && !isInitializing && !playerLoading) {
      console.log("🎮 Controller connected, auto-initializing player...");
      setTimeout(() => {
        initializePlayer().then(result => {
          console.log("🎮 Auto-initialization result:", result);
        });
      }, 500);
    }
  }, [isConnected, player, isInitializing, playerLoading, initializePlayer]);

  // Status message logic
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

  return (
    <div className="status-bar">
      {/* Connection UI */}
      {!isConnected ? (
        <Button onClick={handleConnect} disabled={isLoading}>
          {isConnecting ? "Connecting..." : "Connect Controller"}
        </Button>
      ) : (
        <div className="connected-state">
          <span>Connected: {formatAddress(address)}</span>
          <span>{getStatusMessage()}</span>
        </div>
      )}
    </div>
  );
}
```

---

## 🧠 Hook Coordination Patterns

### **Data Flow Between Hooks**

```
1. useStarknetConnect establishes wallet connection
   ↓
2. usePlayer automatically fetches player data when address changes
   ↓
3. useSpawnPlayer uses player data to determine if creation is needed
   ↓
4. Game action hooks (useTrainAction, etc.) use player data for validation
   ↓
5. All hooks update Zustand store for reactive UI updates
```

---

The React hooks pattern in Dojo Game Starter provides a clean, reusable, and maintainable way to manage complex blockchain interactions while maintaining excellent user experience through optimistic updates and comprehensive error handling.

**Next**: We'll explore the complete **Data Flow** to understand how all these pieces work together in real-time gameplay scenarios.