# 5. Cartridge Controller Integration - Dojo Game Starter

## 🎮 What is Cartridge Controller?

Cartridge Controller is a **gaming-focused wallet** built specifically for onchain games on Starknet. Unlike traditional wallets that require constant popups and confirmations, the Controller provides a seamless gaming experience through **session policies** that pre-approve specific game actions.

```
🎯 Gaming Wallet vs Traditional Wallet

┌─────────────────────────────────────────────────────────────────┐
│                    TRADITIONAL WALLET                           │
├─────────────────────────────────────────────────────────────────┤
│  Each Action → Popup → User Approval → Transaction             │
│  🏋️ Train → 📱 "Approve?" → ✅ Click → ⏳ Wait                   │
│  ⛏️ Mine  → 📱 "Approve?" → ✅ Click → ⏳ Wait                   │
│  💤 Rest  → 📱 "Approve?" → ✅ Click → ⏳ Wait                   │
│                                                                 │
│  Result: Interrupted gameplay, poor UX                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CARTRIDGE CONTROLLER                         │
├─────────────────────────────────────────────────────────────────┤
│  Pre-approved Actions → Direct Execution → Instant Feedback    │
│  🏋️ Train → ⚡ Instant → ✅ +10 EXP                             │
│  ⛏️ Mine  → ⚡ Instant → ✅ +5 Coins, -5 HP                     │
│  💤 Rest  → ⚡ Instant → ✅ +20 HP                              │
│                                                                 │
│  Result: Seamless gameplay, console-like UX                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Controller Configuration

### **`cartridgeConnector.tsx`** - The Heart of Gaming UX

The Cartridge Connector configuration is where the magic happens - defining which actions players can perform without constant wallet popups:

```typescript
import { Connector } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import { ColorMode, SessionPolicies, ControllerOptions } from "@cartridge/controller";
import { constants } from "starknet";

const { VITE_PUBLIC_DEPLOY_TYPE } = import.meta.env;

// Your deployed game contract address
const CONTRACT_ADDRESS_GAME = '0x31b119987eeb1a6c0d13b029ad9a3c64856369dcdfd6e69d9af4c9fba6f507f';

// 🎯 SESSION POLICIES - The key to seamless gaming
const policies: SessionPolicies = {
  contracts: {
    [CONTRACT_ADDRESS_GAME]: {
      methods: [
        { name: "spawn_player", entrypoint: "spawn_player" },
        { name: "train", entrypoint: "train" },
        { name: "mine", entrypoint: "mine" },
        { name: "rest", entrypoint: "rest" },
      ],
    },
  },
};

// 🎨 VISUAL CUSTOMIZATION
const colorMode: ColorMode = "dark";                    // Dark theme for gaming
const theme = "full-starter-react";                     // Custom game theme

const options: ControllerOptions = {
  // 🌐 Network Configuration
  chains: [
    {
      rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    },
  ],
  defaultChainId: VITE_PUBLIC_DEPLOY_TYPE === 'mainnet' 
    ? constants.StarknetChainId.SN_MAIN 
    : constants.StarknetChainId.SN_SEPOLIA,
  
  // 🎯 Core Configuration
  policies,                                              // Pre-approved actions
  theme,                                                 // Visual branding
  colorMode,                                             // UI appearance
  namespace: "full_starter_react",                       // Unique game identifier
  slot: "full-starter-react",                           // Session slot name
};

// Create the connector instance
const cartridgeConnector = new ControllerConnector(options) as never as Connector;

export default cartridgeConnector;
```

---

## 🔑 Session Policies - The Core Innovation

**Session Policies** are what make Cartridge Controller revolutionary for gaming. They define exactly which contract methods can be called without user approval.

### **Policy Structure Breakdown**

```typescript
const policies: SessionPolicies = {
  contracts: {
    // Contract address (from your deployed Dojo contracts)
    [CONTRACT_ADDRESS_GAME]: {
      methods: [
        // Each method that should work seamlessly in-game
        { name: "spawn_player", entrypoint: "spawn_player" },     // Create new player
        { name: "train", entrypoint: "train" },                   // +10 EXP action
        { name: "mine", entrypoint: "mine" },                     // +5 coins, -5 health
        { name: "rest", entrypoint: "rest" },                     // +20 health recovery
      ],
    },
  },
};
```

### **🎯 Why This Matters:**

```typescript
// ❌ WITHOUT Session Policies (traditional wallet):
const train = async () => {
  // User sees popup: "Do you want to approve this transaction?"
  const approval = await wallet.requestPermission("train");
  if (approval) {
    const tx = await contract.train();
    // User waits, game flow interrupted
  }
  // Poor gaming experience
};

// ✅ WITH Session Policies (Cartridge Controller):
const train = async () => {
  const tx = await client.game.train(account);
  // Executes immediately, no popup, seamless experience
  updatePlayerExperience(+10); // Optimistic update
  // Perfect gaming UX
};
```

### **🛡️ Security & Limitations**

Session policies are **secure by design**:

- **Contract-specific**: Only approved contracts can be called
- **Method-specific**: Only approved methods within those contracts
- **Time-limited**: Sessions expire and need renewal
- **Revocable**: Users can revoke permissions anytime

```typescript
// ✅ ALLOWED - These will execute seamlessly
await client.game.train(account);        // Pre-approved ✅
await client.game.mine(account);         // Pre-approved ✅
await client.game.rest(account);         // Pre-approved ✅

// ❌ BLOCKED - These will require explicit approval
await client.game.deletePlayer(account); // Not in policies ❌
await otherContract.transfer(account);    // Different contract ❌
```

---

## 🌐 Network & Environment Configuration

### **Multi-Environment Support**

```typescript
const options: ControllerOptions = {
  chains: [
    {
      // Cartridge provides optimized RPC endpoints
      rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    },
  ],
  
  // Automatic network selection based on deployment
  defaultChainId: VITE_PUBLIC_DEPLOY_TYPE === 'mainnet' 
    ? constants.StarknetChainId.SN_MAIN      // Mainnet for production
    : constants.StarknetChainId.SN_SEPOLIA,  // Sepolia for testing
  
  namespace: "full_starter_react",           // Unique identifier
  slot: "full-starter-react",               // Session storage key
};
```

### **🔧 Environment Variables**

```bash
# .env.local
VITE_PUBLIC_DEPLOY_TYPE=sepolia              # or 'mainnet'
```

This automatically switches between networks without code changes!

---

## 🎨 Visual Customization

### **Gaming-First UI Design**

```typescript
// Visual configuration for gaming experience
const colorMode: ColorMode = "dark";        // Perfect for gaming
const theme = "full-starter-react";         // Your game's branding

const options: ControllerOptions = {
  colorMode,                                 // Dark theme
  theme,                                     // Custom styling
  // ... other options
};
```

### **🎮 Controller Features**

- **Dark Mode**: Optimized for gaming sessions
- **Custom Themes**: Brand your wallet experience
- **Achievement Integration**: Built-in achievement system
- **Profile Management**: Player profiles and statistics
- **Session Management**: Clear session status and controls

---

## 🔌 Integration with React Hooks

### **`useStarknetConnect.tsx`** - Connection Management

The Controller integrates seamlessly with Starknet React hooks:

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
      
      // This opens the Cartridge Controller interface
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
    address,          // Player's wallet address
    isConnecting,     // Loading state
    handleConnect,    // Function to open Controller
    handleDisconnect, // Function to disconnect
  };
}
```

### **🎮 Connection Flow**

```
1. User clicks "Connect Controller"
   ↓
2. Cartridge Controller interface opens
   ↓
3. User creates account or signs in
   ↓
4. Session policies are approved
   ↓
5. Game actions now work seamlessly
   ↓
6. Player can focus on gameplay!
```

---

## 🎯 Advanced Controller Features

### **Profile Integration**

The Controller provides built-in profile management:

```typescript
// Access to controller-specific features
const { connector } = useAccount();

const handlePlayerReady = useCallback(() => {
  if (!connector || !('controller' in connector)) {
    console.error("Connector not initialized");
    return;
  }
  
  // Open player profile with achievements
  if (connector.controller && 'openProfile' in connector.controller) {
    connector.controller.openProfile("achievements");
  }
}, [connector]);
```

### **🏆 Built-in Achievement System**

```typescript
// Achievement integration comes built-in
const openAchievements = () => {
  connector.controller.openProfile("achievements");
};

```

---

## 🔄 Integration with StarknetProvider

### **Provider Configuration**

```typescript
// starknet-provider.tsx
export default function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect                                    // Auto-reconnect on page load
      chains={[sepolia]}                            // Available networks
      connectors={[cartridgeConnector]}             // Use Cartridge Controller
      provider={provider}                           // RPC provider
    >
      {children}
    </StarknetConfig>
  );
}
```

### **🔄 Auto-Connection Flow**

```typescript
// Automatic reconnection on page load
useEffect(() => {
  if (isConnected && !player && !isInitializing) {
    console.log("🎮 Controller connected, auto-initializing player...");
    
    // Automatically create player if needed
    setTimeout(() => {
      initializePlayer().then(result => {
        console.log("🎮 Auto-initialization result:", result);
      });
    }, 500);
  }
}, [isConnected, player, isInitializing, initializePlayer]);
```

---

## 🚀 Game Action Flow with Controller

### **Seamless Transaction Pattern**

```typescript
// Game action with Controller (no popups!)
const executeTrain = useCallback(async () => {
  try {
    // 1. ⚡ Optimistic update (instant UI feedback)
    updatePlayerExperience((player?.experience || 0) + 10);
    
    // 2. 🎮 Execute via Controller (no popup)
    console.log("📤 Executing train transaction...");
    const tx = await client.game.train(account); // Seamless!
    
    // 3. ✅ Handle confirmation
    if (tx && tx.code === "SUCCESS") {
      console.log("✅ Train successful!");
      // UI already updated optimistically
    }
    
  } catch (error) {
    // 4. ❌ Rollback on error
    updatePlayerExperience((player?.experience || 0) - 10);
    console.error("❌ Training failed:", error);
  }
}, [client, account, player, updatePlayerExperience]);
```

### **🎯 User Experience Comparison**

```
Traditional Wallet Flow:
User clicks "Train" → Popup appears → User clicks "Approve" → Transaction processes → UI updates
⏱️ Time: 5-10 seconds, requires user attention

Controller Flow:
User clicks "Train" → UI updates instantly → Transaction processes in background
⏱️ Time: <1 second, no interruption
```

---

## 🎮 Gaming UX Benefits

### **Why Controller is Perfect for Onchain Games**

| Traditional Wallet | Cartridge Controller | Impact |
|-------------------|---------------------|---------|
| Popup per action | Pre-approved actions | 🚀 **10x faster** gameplay |
| User attention required | Background execution | 🎯 **Uninterrupted** focus |
| Complex UI | Gaming-focused design | 😊 **Better** user experience |
| Generic branding | Custom game themes | 🎨 **Branded** experience |
| No achievements | Built-in achievement system | 🏆 **Enhanced** engagement |

---

The Cartridge Controller transforms blockchain gaming from a friction-filled experience into something that feels like traditional gaming. By eliminating constant wallet popups and providing gaming-specific features, it enables developers to create truly engaging onchain games.

**Next**: We'll explore the **React Hooks Pattern** that powers the seamless integration between Controller, Dojo contracts, and React components.