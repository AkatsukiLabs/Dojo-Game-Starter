# 3. Core Files - Dojo Game Starter Integration

## 📁 File Structure Overview

The integration relies on **8 core files** that work together to bridge React frontend with Dojo smart contracts. Each file has a specific responsibility in the architecture:

```
src/
├── dojo/
│   ├── 🔗 bindings.ts          # TypeScript interfaces from Cairo contracts
│   ├── ⚙️ dojoConfig.ts         # Dojo connection configuration
│   ├── 🏗️ contracts.gen.ts     # Auto-generated contract functions
│   ├── 🌐 starknet-provider.tsx # Wallet & network provider
│   └── hooks/
│       ├── 🔌 useStarknetConnect.tsx # Wallet connection logic
│       ├── 👤 usePlayer.tsx         # Player data management
│       └── 🎮 useSpawnPlayer.tsx    # Player creation logic
└── ⚡ main.tsx                   # Application entry point
```

---

## 🔗 Type Safety Layer

### **`bindings.ts`** - Contract-to-TypeScript Bridge

**🎯 Purpose**: Provides TypeScript interfaces that mirror Cairo contract structures, ensuring type safety across the entire application.

```typescript
// Auto-generated from Cairo contracts
export interface Player {
  owner: string;          // Player's wallet address
  experience: number;     // Game experience points
  health: number;         // Current health status
  coins: number;          // Player's currency
  creation_day: number;   // When player was created
}

// Achievement system types
export interface TrophyCreation {
  id: number;
  hidden: boolean;
  points: number;
  description: string;
  tasks: Array<Task>;
}

// Schema definition for Dojo SDK
export const schema: SchemaType = {
  full_starter_react: {
    Player: {
      owner: "",
      experience: 0,
      health: 0,
      coins: 0,
      creation_day: 0,
    },
  },
  achievement: {
    TrophyCreation: { /* ... */ },
    TrophyProgression: { /* ... */ },
  },
};
```

**✨ Key Features:**
- **Auto-generation**: Updates automatically when Cairo contracts change
- **Full Type Safety**: Catches type errors at compile time
- **Default Values**: Provides sensible defaults for all properties
- **Achievement Integration**: Includes trophy and task system types

**🔄 How It Works:**
1. Cairo contracts define models (e.g., `Player` struct)
2. Dojo tooling generates TypeScript interfaces
3. Frontend imports these types for complete type safety
4. Any contract changes immediately surface as TypeScript errors

---

## ⚙️ Configuration Layer

### **`dojoConfig.ts`** - Central Configuration Hub

**🎯 Purpose**: Centralizes all Dojo and Starknet connection settings, making environment management simple and secure.

```typescript
import { createDojoConfig } from "@dojoengine/core";
import { manifest } from "../config/manifest";

// Environment variables for secure configuration
const {
  VITE_PUBLIC_NODE_URL,
  VITE_PUBLIC_TORII,
  VITE_PUBLIC_MASTER_ADDRESS,
  VITE_PUBLIC_MASTER_PRIVATE_KEY,
} = import.meta.env;

export const dojoConfig = createDojoConfig({
  manifest,                                                    // Contract deployment info
  masterAddress: VITE_PUBLIC_MASTER_ADDRESS || '',            // Master account for transactions
  masterPrivateKey: VITE_PUBLIC_MASTER_PRIVATE_KEY || '',     // Master account private key
  rpcUrl: VITE_PUBLIC_NODE_URL || '',                         // Starknet RPC endpoint
  toriiUrl: VITE_PUBLIC_TORII || '',                          // Torii GraphQL indexer URL
});
```

**✨ Key Components:**
- **`manifest`**: Contains deployed contract addresses and ABIs
- **RPC URL**: Direct connection to Starknet network
- **Torii URL**: GraphQL endpoint for indexed blockchain data
- **Master Account**: For contract administration (development only)

**🌍 Environment Configuration:**
```bash
# .env.local
VITE_PUBLIC_NODE_URL=https://api.cartridge.gg/x/starknet/sepolia
VITE_PUBLIC_TORII=https://api.cartridge.gg/x/myproject/torii
VITE_PUBLIC_MASTER_ADDRESS=0x...
VITE_PUBLIC_MASTER_PRIVATE_KEY=0x...
```

---

## 🏗️ Contract Interface Layer

### **`contracts.gen.ts`** - Smart Contract Function Library

**🎯 Purpose**: Auto-generated functions that provide a clean TypeScript API for all smart contract interactions.

```typescript
export function setupWorld(provider: DojoProvider) {
  
  // Build calldata for game actions
  const build_game_train_calldata = (): DojoCall => {
    return {
      contractName: "game",
      entrypoint: "train",
      calldata: [],
    };
  };

  // Execute training action
  const game_train = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount as any,
        build_game_train_calldata(),
        "full_starter_react",  // Namespace from dojo.toml
      );
    } catch (error) {
      console.error("Training failed:", error);
      throw error;
    }
  };

  // Return organized API
  return {
    game: {
      train: game_train,
      mine: game_mine,
      rest: game_rest,
      spawnPlayer: game_spawnPlayer,
      
      // Calldata builders for advanced usage
      buildTrainCalldata: build_game_train_calldata,
      buildMineCalldata: build_game_mine_calldata,
      // ...
    },
  };
}
```

**🎯 Game Actions Available:**
- **`spawnPlayer()`**: Create new player on blockchain
- **`train()`**: Increase experience (+10 EXP)
- **`mine()`**: Earn coins but lose health (+5 coins, -5 health)
- **`rest()`**: Recover health (+20 health)

**✨ Features:**
- **Error Handling**: Built-in try/catch for all contract calls
- **Consistent API**: All functions follow the same pattern
- **Calldata Builders**: For advanced transaction composition
- **Type Safety**: Full TypeScript support for parameters and returns

---

## 🌐 Provider Layer

### **`starknet-provider.tsx`** - Blockchain Connection Manager

**🎯 Purpose**: Configures Starknet connection, wallet integration, and network selection based on deployment environment.

```typescript
export default function StarknetProvider({ children }: PropsWithChildren) {
  const { VITE_PUBLIC_DEPLOY_TYPE } = import.meta.env;
  
  // Dynamic RPC URL based on environment
  const getRpcUrl = () => {
    switch (VITE_PUBLIC_DEPLOY_TYPE) {
      case "mainnet": return "https://api.cartridge.gg/x/starknet/mainnet";
      case "sepolia": return "https://api.cartridge.gg/x/starknet/sepolia";
      default: return "https://api.cartridge.gg/x/starknet/sepolia";
    }
  };

  // Configure JSON-RPC provider
  const provider = jsonRpcProvider({
    rpc: () => ({ nodeUrl: getRpcUrl() }),
  });

  // Select appropriate chain
  const chains = VITE_PUBLIC_DEPLOY_TYPE === "mainnet" 
    ? [mainnet] 
    : [sepolia];

  return (
    <StarknetConfig
      autoConnect              // Automatically reconnect on page load
      chains={chains}          // Available networks
      connectors={[cartridgeConnector]}  // Wallet options
      explorer={starkscan}     // Block explorer integration
      provider={provider}      // RPC provider
    >
      {children}
    </StarknetConfig>
  );
}
```

**✨ Key Features:**
- **Environment Awareness**: Automatic network selection
- **Auto-reconnection**: Remembers wallet connections
- **Cartridge Integration**: Gaming-focused wallet support
- **Explorer Integration**: Starkscan for transaction viewing

---

## ⚡ Application Bootstrap

### **`main.tsx`** - System Initialization

**🎯 Purpose**: Orchestrates the complete application startup, from Dojo SDK initialization to React rendering.

```typescript
async function main() {
  try {
    console.log("🚀 Initializing Dojo SDK...");
    
    // Initialize Dojo SDK with configuration
    const sdk = await init<SchemaType>({
      client: {
        toriiUrl: dojoConfig.toriiUrl,        // GraphQL indexer
        relayUrl: dojoConfig.relayUrl,        // Real-time updates
        worldAddress: dojoConfig.manifest.world.address,  // World contract
      },
      domain: {
        name: "DojoGameStarter",
        version: "1.0",
        chainId: "KATANA",    // Can be KATANA, SN_SEPOLIA, SN_MAIN
        revision: "1",
      },
    });

    console.log("✅ Dojo SDK initialized successfully");

    // Render application with provider hierarchy
    createRoot(rootElement).render(
      <StrictMode>
        <DojoSdkProvider sdk={sdk} dojoConfig={dojoConfig} clientFn={setupWorld}>
          <StarknetProvider>
            <App />
          </StarknetProvider>
        </DojoSdkProvider>
      </StrictMode>
    );
    
  } catch (error) {
    console.error("❌ Failed to initialize Dojo:", error);
    
    // Graceful error handling with fallback UI
    renderErrorFallback(error);
  }
}
```

**🎯 Initialization Steps:**
1. **Dojo SDK Init**: Connect to Torii indexer and World contract
2. **Provider Setup**: Establish DojoSdkProvider → StarknetProvider hierarchy
3. **Error Handling**: Graceful fallback if initialization fails
4. **Type Safety**: SchemaType ensures contract-frontend alignment

---

## 🔌 Connection Management

### **`useStarknetConnect.tsx`** - Wallet Connection Hook

**🎯 Purpose**: Simplifies wallet connection logic with comprehensive state management.

```typescript
export function useStarknetConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { status, address } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    const connector = connectors[0]; // Cartridge Controller
    if (!connector) {
      console.error("No connector found");
      return;
    }
    
    try {
      setIsConnecting(true);
      console.log("🔗 Attempting to connect controller...");
      await connect({ connector });
      console.log("✅ Controller connected successfully");
    } catch (error) {
      console.error("❌ Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectors]);

  return { 
    status,           // 'connected' | 'disconnected' | 'connecting'
    address,          // Wallet address when connected
    isConnecting,     // Loading state
    handleConnect,    // Function to initiate connection
    handleDisconnect, // Function to disconnect wallet
  };
}
```

**✨ Connection States:**
- **`disconnected`**: No wallet connected
- **`connecting`**: Connection in progress
- **`connected`**: Wallet successfully connected
- **`reconnecting`**: Attempting to restore previous connection

---

## 👤 Data Management

### **`usePlayer.tsx`** - Player Data Hook

**🎯 Purpose**: Manages player data fetching from blockchain with caching and error handling.

```typescript
interface UsePlayerReturn {
  player: Player | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePlayer = (): UsePlayerReturn => {
  const { account } = useAccount();
  const { player: storePlayer, setPlayer } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // GraphQL query to Torii indexer
  const PLAYER_QUERY = `
    query GetPlayer($playerAddress: ContractAddress!) {
      playerModels(where: { owner: $playerAddress }) {
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

  const refetch = useCallback(async () => {
    if (!account?.address) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(TORII_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: PLAYER_QUERY,
          variables: { playerAddress: addAddressPadding(account.address) }
        }),
      });
      
      const result = await response.json();
      const playerData = result.data?.playerModels?.edges?.[0]?.node;
      
      if (playerData) {
        setPlayer(playerData);
      }
    } catch (error) {
      console.error("Failed to fetch player:", error);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, setPlayer]);

  return { player: storePlayer, isLoading, error: null, refetch };
};
```

---

## 🎮 Player Initialization

### **`useSpawnPlayer.tsx`** - Player Creation Hook

**🎯 Purpose**: Handles the complex logic of player creation and initialization with comprehensive state tracking.

```typescript
export const useSpawnPlayer = () => {
  const { client } = useDojoSDK();
  const { account } = useAccount();
  const { player, refetch: refetchPlayer } = usePlayer();
  const [isInitializing, setIsInitializing] = useState(false);

  const initializePlayer = useCallback(async (): Promise<InitializeResponse> => {
    if (isInitializing) {
      return { success: false, playerExists: false, error: "Already initializing" };
    }

    setIsInitializing(true);

    try {
      // Check if player already exists
      await refetchPlayer();
      
      if (player) {
        console.log("✅ Player already exists");
        return { success: true, playerExists: true };
      }

      // Create new player
      console.log("🎮 Creating new player...");
      const txResult = await client.game.spawnPlayer(account);
      
      console.log("✅ Player created:", txResult.transaction_hash);
      
      // Refresh player data
      await refetchPlayer();
      
      return { 
        success: true, 
        playerExists: false, 
        transactionHash: txResult.transaction_hash 
      };
        
    } catch (error) {
      console.error("❌ Player initialization failed:", error);
      return { 
        success: false, 
        playerExists: false, 
        error: error.message 
      };
    } finally {
      setIsInitializing(false);
    }
  }, [client, account, player, refetchPlayer, isInitializing]);

  return { initializePlayer, isInitializing };
};
```

---

## 🔄 File Relationships

### **Data Flow Between Core Files**

```
1. main.tsx
   ↓ (initializes)
2. dojoConfig.ts 
   ↓ (configures)
3. contracts.gen.ts
   ↓ (provides API to)
4. useSpawnPlayer.tsx
   ↓ (creates player via)
5. usePlayer.tsx
   ↓ (fetches data to)
6. Zustand Store
   ↓ (updates)
7. React Components
```

### **Type Safety Chain**
```
Cairo Contracts → bindings.ts → Custom Hooks → React Components
```

### **Connection Chain**
```
starknet-provider.tsx → useStarknetConnect.tsx → Game Components
```

---

These 8 core files work together to create a seamless bridge between your React frontend and Dojo smart contracts. Each file has a single responsibility but collectively they provide a complete, type-safe, and robust integration layer.

**Next**: We'll explore how **Zustand State Management** powers the reactive UI updates and optimistic user experience.