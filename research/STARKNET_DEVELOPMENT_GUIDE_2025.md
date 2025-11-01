# Comprehensive Starknet Development Guide 2025

## Executive Summary

This guide provides comprehensive documentation for building modern Starknet applications in 2025, covering Cairo 2.12.0, the latest development tools, frontend integration frameworks, and deployment best practices.

---

## Table of Contents

1. [Cairo Language (v2.12.0)](#1-cairo-language-v2120)
2. [Starknet.js & Starknet React](#2-starknetjs--starknet-react)
3. [Scarb Package Manager](#3-scarb-package-manager)
4. [Starknet Foundry Testing Framework](#4-starknet-foundry-testing-framework)
5. [Frontend Frameworks](#5-frontend-frameworks)
6. [Wallet Integration](#6-wallet-integration)
7. [Development Tools](#7-development-tools)
8. [Deployment & DevOps](#8-deployment--devops)
9. [Documentation Generation](#9-documentation-generation)
10. [Modern TypeScript/JavaScript Tooling](#10-modern-typescriptjavascript-tooling)

---

## 1. Cairo Language (v2.12.0)

### Overview

Cairo is the first Turing-complete language for creating provable programs for general computation. As of 2025, Cairo 2.12.0 is the current stable version.

### Official Resources

- **The Cairo Book**: https://www.starknet.io/cairo-book/
- **Official Documentation**: https://docs.starknet.io/
- **GitHub Repository**: https://github.com/starkware-libs/cairo
- **Cairo Docs Hub**: https://docs.cairo-lang.org/

### Version Information

- **Current Version**: Cairo 2.12.0
- **Starknet Foundry Compatible Version**: 0.48.0
- **Architecture**: Rust-inspired syntax with safety features

### Key Concepts

#### Cairo and Sierra

Starting with Cairo 1.0+, the contract class includes instructions in **Sierra** (Safe Intermediate Representation) rather than directly compiling to Cairo assembly:

- **Cairo** → User-facing programming language
- **Sierra** → Safe intermediate layer ensuring all transactions are provable
- **CASM** → Cairo Assembly for execution

This three-layer architecture ensures:
1. All code is eventually provable
2. Safe execution guarantees
3. Optimized performance

### Installation

Cairo is installed via Scarb (the Cairo package manager):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
```

### Project Structure

```
my-starknet-project/
├── Scarb.toml              # Package manifest
├── src/
│   ├── lib.cairo           # Library entry point
│   └── contract.cairo      # Smart contract code
└── tests/
    └── test_contract.cairo # Test files
```

### Basic Smart Contract Example

```cairo
#[starknet::contract]
mod HelloStarknet {
    use starknet::ContractAddress;

    #[storage]
    struct Storage {
        balance: u128,
        owner: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_balance: u128, owner: ContractAddress) {
        self.balance.write(initial_balance);
        self.owner.write(owner);
    }

    #[external(v0)]
    fn get_balance(self: @ContractState) -> u128 {
        self.balance.read()
    }

    #[external(v0)]
    fn set_balance(ref self: ContractState, new_balance: u128) {
        // Only owner can update balance
        assert(self.owner.read() == starknet::get_caller_address(), 'Not authorized');
        self.balance.write(new_balance);
    }
}
```

### OpenZeppelin Contracts for Cairo

OpenZeppelin provides battle-tested contract components for Cairo:

- **GitHub**: https://github.com/OpenZeppelin/cairo-contracts
- **Interactive Wizard**: https://wizard.openzeppelin.com/cairo
- **Documentation**: https://docs.openzeppelin.com/contracts-cairo/

#### Installation

Add to `Scarb.toml`:

```toml
[dependencies]
openzeppelin = "3.0.0-alpha.3"
```

#### Example: ERC20 Token

```cairo
#[starknet::contract]
mod MyToken {
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::ContractAddress;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ERC20Event: ERC20Component::Event
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_supply: u256, recipient: ContractAddress) {
        let name = "MyToken";
        let symbol = "MTK";
        self.erc20.initializer(name, symbol);
        self.erc20._mint(recipient, initial_supply);
    }
}
```

### Best Practices

1. **Use Components**: Leverage OpenZeppelin's component-based architecture for reusability
2. **Test Thoroughly**: Write comprehensive tests using Starknet Foundry
3. **Gas Optimization**: Keep storage reads/writes to a minimum
4. **Security**: Always validate caller permissions using `get_caller_address()`
5. **Error Handling**: Use descriptive error messages with `assert`

---

## 2. Starknet.js & Starknet React

### Starknet.js

#### Overview

Starknet.js is the official JavaScript/TypeScript library for interacting with Starknet.

- **Current Version**: 7.6.4 (as of 2025)
- **Official Documentation**: https://starknetjs.com/
- **GitHub**: https://github.com/starknet-io/starknet.js

#### Installation

```bash
npm install starknet
# or
yarn add starknet
# or
pnpm add starknet
```

#### Key Features

1. **Scalability and Integrity** - Preserves L1 Ethereum security via STARK proofs
2. **General Purpose Development** - Deploy any business logic using Starknet Contracts
3. **Composability** - Ethereum-level composability for easy development

#### Basic Usage

```typescript
import { Provider, Contract, Account, ec, json } from "starknet";

// Connect to provider
const provider = new Provider({ sequencer: { network: 'mainnet-alpha' } });

// Create account
const privateKey = "0x1234...";
const accountAddress = "0x5678...";
const account = new Account(provider, accountAddress, privateKey);

// Interact with contract
const contractAddress = "0x...";
const { abi } = await provider.getClassAt(contractAddress);
const contract = new Contract(abi, contractAddress, provider);

// Read from contract
const balance = await contract.get_balance();

// Write to contract (requires Account)
const result = await account.execute({
    contractAddress,
    entrypoint: 'set_balance',
    calldata: ['100']
});
```

#### RpcProvider Usage

```typescript
import { RpcProvider } from "starknet";

// Using Infura
const provider = new RpcProvider({
  nodeUrl: `https://starknet-mainnet.infura.io/v3/${INFURA_API_KEY}`
});

// Using Alchemy
const provider = new RpcProvider({
  nodeUrl: `https://starknet-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
});

// Using public provider
const provider = new RpcProvider({
  nodeUrl: 'https://starknet-mainnet.public.blastapi.io'
});
```

### Starknet React

#### Overview

Starknet React is a collection of React hooks for Starknet, inspired by wagmi and powered by starknet.js.

- **Current Version**: v4.x
- **Official Documentation**: https://www.starknet-react.com/
- **GitHub**: https://github.com/apibara/starknet-react

#### Core Technologies

1. **Tanstack Query** - Data fetching operations
2. **Starknet.js** - Starknet interaction capabilities
3. **abi-wan-kanabi** - Type-safe contract calls

#### Installation

```bash
npm add @starknet-react/chains @starknet-react/core starknet get-starknet-core
# or
pnpm add @starknet-react/chains @starknet-react/core starknet get-starknet-core
```

#### Setup with Next.js

**1. Create Provider Component (`app/providers.tsx`)**

```typescript
'use client'

import React from 'react'
import { StarknetConfig, publicProvider, argent, braavos, useInjectedConnectors } from '@starknet-react/core'
import { sepolia, mainnet } from '@starknet-react/chains'

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    // Show recommended wallets
    recommended: [
      argent(),
      braavos(),
    ],
    // Include all injected wallets
    includeRecommended: "onlyIfNoConnectors",
    // Order by last usage
    order: "random"
  })

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  )
}
```

**2. Wrap App in Provider (`app/layout.tsx`)**

```typescript
import { StarknetProvider } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StarknetProvider>
          {children}
        </StarknetProvider>
      </body>
    </html>
  )
}
```

**3. Use Hooks in Components**

```typescript
'use client'

import { useAccount, useConnect, useDisconnect, useContract, useContractRead, useContractWrite } from '@starknet-react/core'

export function WalletConnect() {
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <div>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ContractInteraction() {
  const { address } = useAccount()

  // Read from contract
  const { data: balance, isLoading } = useContractRead({
    address: "0x...",
    abi: contractAbi,
    functionName: "get_balance",
    args: [address],
  })

  // Write to contract
  const { writeAsync } = useContractWrite({
    calls: [{
      contractAddress: "0x...",
      entrypoint: "set_balance",
      calldata: ["100"]
    }]
  })

  return (
    <div>
      <p>Balance: {balance?.toString()}</p>
      <button onClick={() => writeAsync()}>Update Balance</button>
    </div>
  )
}
```

#### Using Custom RPC Providers

```typescript
import { infuraProvider, alchemyProvider } from '@starknet-react/core'

// Infura
const provider = infuraProvider({ apiKey: process.env.INFURA_API_KEY })

// Alchemy
const provider = alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY })
```

---

## 3. Scarb Package Manager

### Overview

Scarb is the official project management tool for Cairo and Starknet, managing dependencies, compiling projects, and serving as an extensible development platform.

- **Current Version**: 2.12.0 (with Cairo 2.12.0)
- **Official Documentation**: https://docs.swmansion.com/scarb/
- **GitHub**: https://github.com/software-mansion/scarb

### Installation

```bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
```

### Key Features (2025)

1. **Incremental Compilation** - Cache compilation steps for faster rebuilds
2. **Dependency Management** - Manage Cairo packages via Git or crates.io-style registries
3. **Built-in Cairo Compiler** - Includes Cairo and Starknet compiler
4. **Documentation Generation** - Generate docs with `scarb doc`
5. **Dependency Visualization** - `scarb tree` command to visualize dependency trees

### Basic Commands

```bash
# Create new project
scarb new my_project

# Build project
scarb build

# Run tests
scarb test

# Add dependency
scarb add dependency_name

# Generate documentation
scarb doc

# Visualize dependency tree
scarb tree

# Format code
scarb fmt
```

### Scarb.toml Configuration

```toml
[package]
name = "my_starknet_project"
version = "0.1.0"
edition = "2024_07"

[dependencies]
starknet = ">=2.12.0"
openzeppelin = "3.0.0-alpha.3"

[dev-dependencies]
snforge_std = { git = "https://github.com/foundry-rs/starknet-foundry", tag = "v0.48.0" }

[[target.starknet-contract]]
sierra = true
casm = true

[tool.snforge]
exit_first = false
```

### Package Structure

```
my-starknet-project/
├── Scarb.toml           # Package manifest
├── Scarb.lock           # Lock file for exact versions
├── src/
│   ├── lib.cairo        # Library root
│   └── contracts/
│       └── my_contract.cairo
└── tests/
    └── test_contract.cairo
```

---

## 4. Starknet Foundry Testing Framework

### Overview

Starknet Foundry is a blazing-fast toolkit for developing Starknet contracts, providing comprehensive testing capabilities.

- **Current Version**: 0.48.0
- **Official Documentation**: https://foundry-rs.github.io/starknet-foundry/
- **GitHub**: https://github.com/foundry-rs/starknet-foundry

### Components

1. **snforge** - Starknet testing framework
2. **sncast** - Tool for interacting with contracts

### Installation

#### Via Starkup (Recommended)

```bash
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
starkup
```

#### Manual Installation

```bash
# Add to Scarb.toml
[dependencies]
snforge_std = { git = "https://github.com/foundry-rs/starknet-foundry", tag = "v0.48.0" }
```

### Creating New Project

```bash
snforge new my_project
cd my_project
```

### Running Tests

```bash
# Run all tests
snforge test

# Run specific test
snforge test test_name

# Run with output
snforge test -v

# Run tests in specific file
snforge test --path tests/test_file.cairo
```

### Writing Tests

```cairo
#[cfg(test)]
mod tests {
    use super::HelloStarknet;
    use snforge_std::{declare, ContractClassTrait, start_cheat_caller_address};

    #[test]
    fn test_constructor() {
        let contract = declare("HelloStarknet").unwrap();
        let constructor_args = array![100_u256, 0x123]; // initial_balance, owner

        let (contract_address, _) = contract.deploy(@constructor_args).unwrap();

        let dispatcher = IHelloStarknetDispatcher { contract_address };
        let balance = dispatcher.get_balance();

        assert(balance == 100, 'Wrong balance');
    }

    #[test]
    fn test_set_balance() {
        let contract = declare("HelloStarknet").unwrap();
        let owner = starknet::contract_address_const::<0x123>();
        let constructor_args = array![100_u256, owner.into()];

        let (contract_address, _) = contract.deploy(@constructor_args).unwrap();
        let dispatcher = IHelloStarknetDispatcher { contract_address };

        // Cheat caller address to be owner
        start_cheat_caller_address(contract_address, owner);

        dispatcher.set_balance(200);
        let new_balance = dispatcher.get_balance();

        assert(new_balance == 200, 'Balance not updated');
    }
}
```

### Cheatcodes

Starknet Foundry provides powerful cheatcodes for testing:

```cairo
use snforge_std::{
    declare, ContractClassTrait,
    start_cheat_caller_address, stop_cheat_caller_address,
    start_cheat_block_timestamp, stop_cheat_block_timestamp,
    start_cheat_block_number, stop_cheat_block_number,
    spy_events, EventSpy, EventSpyAssertionsTrait
};

#[test]
fn test_with_cheatcodes() {
    let contract_address = deploy_contract();

    // Change caller address
    start_cheat_caller_address(contract_address, alice());
    // ... perform actions as alice
    stop_cheat_caller_address(contract_address);

    // Change block timestamp
    start_cheat_block_timestamp(contract_address, 1000);
    // ... perform time-dependent actions
    stop_cheat_block_timestamp(contract_address);

    // Spy on events
    let mut spy = spy_events();
    // ... trigger events
    spy.assert_emitted(@array![
        (contract_address, ExpectedEvent { ... })
    ]);
}
```

### Configuration (Scarb.toml)

```toml
[tool.snforge]
# Exit on first test failure
exit_first = false

# Fuzzing configuration
fuzzer_runs = 256
fuzzer_seed = 1234

# Test execution
max_n_steps = 1_000_000
```

---

## 5. Frontend Frameworks

### Next.js Integration (Recommended for 2025)

#### Create Next.js App

```bash
npx create-next-app@latest my-starknet-app
cd my-starknet-app
npm install starknet @starknet-react/core @starknet-react/chains get-starknet-core
```

#### Project Structure

```
my-starknet-app/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   └── providers.tsx       # Starknet configuration
├── components/
│   ├── WalletConnect.tsx
│   └── ContractInteraction.tsx
├── lib/
│   ├── contracts/          # Contract ABIs
│   └── constants.ts        # Contract addresses
└── public/
```

#### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### React with Vite (Alternative)

```bash
npm create vite@latest my-starknet-app -- --template react-ts
cd my-starknet-app
npm install starknet @starknet-react/core @starknet-react/chains
```

#### Vite Configuration

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Required for starknet.js
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### Best Practices

1. **Use Server Components** - Leverage Next.js 14+ App Router for better performance
2. **Client Components for Hooks** - Mark wallet/contract interaction components with `'use client'`
3. **Environment Variables** - Store API keys and contract addresses in `.env.local`
4. **Type Safety** - Generate TypeScript types from contract ABIs using abi-wan-kanabi
5. **Error Handling** - Implement proper error boundaries and loading states

---

## 6. Wallet Integration

### Supported Wallets (2025)

1. **Argent** - Most popular Starknet wallet
2. **Braavos** - Advanced security features with daily spending limits
3. **Argent X** (Browser Extension)
4. **Ready Wallet** (formerly Argent X)

### get-starknet Integration

#### Installation

```bash
npm install get-starknet-core
```

#### Basic Implementation

```typescript
import { connect, disconnect } from "get-starknet"

// Connect to wallet
const starknet = await connect({
  modalMode: "alwaysAsk",
  modalTheme: "dark"
})

if (starknet?.isConnected) {
  const address = starknet.selectedAddress
  // Use wallet
}

// Disconnect
await disconnect()
```

### Starknet React Wallet Hooks

```typescript
'use client'

import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'

export function WalletButton() {
  const { address, status } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (status === 'connected') {
    return (
      <div>
        <p>Address: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        <button onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={!connector.available()}
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  )
}
```

### Account Abstraction on Starknet

Starknet has **native account abstraction** - every account is a smart contract by design.

#### Key Components

1. **Signature Abstraction** - Custom validation logic (multi-sig, 2FA, hardware signers)
2. **Fee Abstraction** - Pay fees in any token (not just ETH)
3. **Nonce Abstraction** - Customizable replay-protection mechanisms

#### SNIP-6 Account Interface

All account contracts must implement SNIP-6:

```cairo
#[starknet::interface]
trait IAccount<TState> {
    fn __validate__(ref self: TState, calls: Array<Call>) -> felt252;
    fn __execute__(ref self: TState, calls: Array<Call>) -> Array<Span<felt252>>;
}
```

#### Benefits

- **Enhanced Security** - Implement custom security features (spending limits, recovery mechanisms)
- **Flexible Authentication** - Support for different signature schemes (secp256k1, secp256r1, etc.)
- **Better UX** - Gas abstraction, session keys, batched transactions

---

## 7. Development Tools

### 7.1 Starkli CLI

#### Overview

Starkli is a blazing-fast CLI tool for Starknet powered by starknet-rs.

- **Documentation**: https://book.starkli.rs/
- **GitHub**: https://github.com/xJonathanLEI/starkli

#### Installation

```bash
curl https://get.starkli.sh | sh
starkliup
```

#### Key Commands

```bash
# Check version
starkli --version

# Declare contract
starkli declare target/dev/my_contract_MyContract.contract_class.json \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json

# Deploy contract
starkli deploy <CLASS_HASH> <CONSTRUCTOR_ARGS> \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json

# Invoke contract function
starkli invoke <CONTRACT_ADDRESS> set_balance 100 \
  --account ~/.starkli-wallets/deployer/account.json

# Call (read) contract function
starkli call <CONTRACT_ADDRESS> get_balance

# Get transaction status
starkli transaction <TX_HASH>

# Get block info
starkli block-number
starkli block <BLOCK_NUMBER>
```

#### Account Setup

```bash
# Create new account
starkli account oz init ~/.starkli-wallets/deployer/account.json

# Deploy account
starkli account deploy ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json
```

### 7.2 Katana Local Node

#### Overview

Katana is a blazingly fast Starknet sequencer for local development.

- **Documentation**: https://book.dojoengine.org/toolchain/katana
- **GitHub**: https://github.com/dojoengine/katana

#### Installation

**Recommended: Dojoup**

```bash
curl -L https://install.dojoengine.org | bash
dojoup install
```

**Alternative: From Source**

```bash
git clone https://github.com/dojoengine/dojo
cd dojo
cargo install --path ./bin/katana --locked --force
```

#### System Requirements

- glibc version 2.33 or higher
- Not supported on Ubuntu 20.04 LTS or CentOS 7

#### Quick Start

```bash
# Start local sequencer with development mode (no fees)
katana --dev --dev.no-fee

# Custom configuration
katana \
  --block-time 1000 \
  --accounts 20 \
  --seed 42 \
  --dev.no-fee
```

#### Features

1. **Instant Finality** - Single authority over transaction ordering
2. **10 Pre-funded Accounts** - Ready for immediate testing
3. **Built-in Block Explorer** - Available at http://localhost:5050/explorer
4. **State Forking** - Fork existing networks for testing against live contracts
5. **Cairo Native** - Optional AOT compilation for significant performance gains
6. **Hot Reloading** - Developer-focused tooling

#### Using with Starkli

Katana includes built-in accounts for Starkli:

```bash
# In terminal 1: Start Katana
katana --dev --dev.no-fee

# In terminal 2: Deploy using pre-funded account
starkli deploy <CLASS_HASH> \
  --rpc http://localhost:5050 \
  --account katana-0 \
  --private-key 0x...
```

#### RPC Endpoint

```
http://localhost:5050
```

### 7.3 Starknet Devnet (Alternative)

#### Installation

```bash
pip install starknet-devnet
```

#### Usage

```bash
# Start devnet
starknet-devnet --seed 42 --port 5050 --accounts 10
```

---

## 8. Deployment & DevOps

### Deployment Process

Starknet deployment is a two-step process:

1. **Declare** - Submit contract class (code) to the network
2. **Deploy** - Create an instance of the declared class

### 8.1 Using Starkli

#### Step 1: Compile Contract

```bash
scarb build
```

This generates:
- `target/dev/my_contract_MyContract.contract_class.json` (Sierra)
- `target/dev/my_contract_MyContract.compiled_contract_class.json` (CASM)

#### Step 2: Declare Contract Class

```bash
starkli declare \
  target/dev/my_contract_MyContract.contract_class.json \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json \
  --network sepolia

# Save the CLASS_HASH from output
# Example: 0x1234...
```

#### Step 3: Deploy Contract Instance

```bash
starkli deploy \
  <CLASS_HASH> \
  <CONSTRUCTOR_ARG_1> <CONSTRUCTOR_ARG_2> ... \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json \
  --network sepolia

# Save the CONTRACT_ADDRESS from output
```

### 8.2 Universal Deployer Contract (UDC)

The UDC is the recommended way to deploy contracts programmatically.

#### Using with Starknet.js

```typescript
import { Account, Contract, json } from "starknet";
import UDC_ABI from "./udc_abi.json";

const UDC_ADDRESS = "0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf";

async function deployContract(account: Account, classHash: string, constructorArgs: any[]) {
  const udc = new Contract(UDC_ABI, UDC_ADDRESS, account);

  const uniqueSalt = "0x" + Math.floor(Math.random() * 1000000).toString(16);

  const deployCall = udc.populate("deployContract", {
    classHash,
    salt: uniqueSalt,
    unique: 1, // Unique deployment per account
    calldata: constructorArgs
  });

  const { transaction_hash } = await account.execute(deployCall);

  // Wait for transaction
  await account.waitForTransaction(transaction_hash);

  // Calculate deployed address
  const deployedAddress = calculateContractAddress({
    deployer: UDC_ADDRESS,
    salt: uniqueSalt,
    classHash,
    constructorCalldata: constructorArgs
  });

  return deployedAddress;
}
```

### 8.3 CI/CD Pipeline Example (GitHub Actions)

```yaml
name: Deploy to Starknet

on:
  push:
    branches: [ main ]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Scarb
        run: |
          curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Install Starknet Foundry
        run: |
          curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
          echo "$HOME/.foundry/bin" >> $GITHUB_PATH

      - name: Build contracts
        run: scarb build

      - name: Run tests
        run: snforge test

      - name: Install Starkli
        run: |
          curl https://get.starkli.sh | sh
          export PATH="$HOME/.starkli/bin:$PATH"

      - name: Declare contract
        env:
          STARKNET_ACCOUNT: ${{ secrets.STARKNET_ACCOUNT }}
          STARKNET_KEYSTORE: ${{ secrets.STARKNET_KEYSTORE }}
        run: |
          echo "$STARKNET_ACCOUNT" > account.json
          echo "$STARKNET_KEYSTORE" > keystore.json

          CLASS_HASH=$(starkli declare \
            target/dev/my_contract_MyContract.contract_class.json \
            --account account.json \
            --keystore keystore.json \
            --network sepolia | grep -oP '0x[a-fA-F0-9]+')

          echo "CLASS_HASH=$CLASS_HASH" >> $GITHUB_ENV

      - name: Deploy contract
        env:
          CLASS_HASH: ${{ env.CLASS_HASH }}
        run: |
          CONTRACT_ADDRESS=$(starkli deploy \
            $CLASS_HASH \
            100 0x123 \
            --account account.json \
            --keystore keystore.json \
            --network sepolia | grep -oP '0x[a-fA-F0-9]+')

          echo "Deployed contract at: $CONTRACT_ADDRESS"
```

### 8.4 Environment-Specific Configuration

```typescript
// lib/config.ts
export const CONTRACTS = {
  development: {
    rpcUrl: 'http://localhost:5050',
    myContract: '0x...' // Katana deployment
  },
  sepolia: {
    rpcUrl: `https://starknet-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
    myContract: '0x...' // Sepolia testnet deployment
  },
  mainnet: {
    rpcUrl: `https://starknet-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    myContract: '0x...' // Mainnet deployment
  }
}

export function getConfig(network: 'development' | 'sepolia' | 'mainnet') {
  return CONTRACTS[network]
}
```

### 8.5 Best Practices

1. **Test Locally First** - Use Katana for rapid iteration
2. **Deploy to Sepolia Testnet** - Validate on public testnet before mainnet
3. **Version Control** - Tag deployments with git tags
4. **Contract Verification** - Verify source code on block explorers
5. **Upgradability** - Design contracts with upgradability in mind (proxy patterns)
6. **Monitoring** - Set up monitoring for deployed contracts
7. **Gas Estimation** - Test gas costs on testnet before mainnet deployment

### 8.6 Gas Optimization (2025 Updates)

Starknet v0.13.5+ introduces **Layer 2 gas** - a new resource model separating L2 execution costs from L1 gas:

- **Predictable Fees** - Less dependent on Ethereum gas fluctuations
- **State Diff Compression** - Significantly reduced transaction costs
- **Optimized Blob Usage** - More efficient data availability

#### Optimization Tips

1. **Minimize Storage Writes** - Storage is expensive
2. **Use Events for Data** - Events are cheaper than storage
3. **Batch Transactions** - Combine multiple operations
4. **Optimize Calldata** - Reduce constructor and function arguments
5. **Use Built-in Types** - Prefer `u128` over `u256` when possible

---

## 9. Documentation Generation

### 9.1 Scarb Doc

#### Usage

```bash
# Generate documentation
scarb doc

# Documentation is generated in target/doc/<PACKAGE_NAME>/
```

#### Documentation Comments

```cairo
/// Represents a user's balance information
///
/// # Storage
/// - `balance`: The current balance in the account
/// - `owner`: The address of the account owner
#[storage]
struct Storage {
    /// The user's token balance
    balance: u128,
    /// The account owner's address
    owner: ContractAddress,
}

/// Returns the current balance
///
/// # Returns
/// The balance as a u128
#[external(v0)]
fn get_balance(self: @ContractState) -> u128 {
    self.balance.read()
}

/// Updates the balance (owner only)
///
/// # Arguments
/// * `new_balance` - The new balance to set
///
/// # Panics
/// Panics if caller is not the owner
#[external(v0)]
fn set_balance(ref self: ContractState, new_balance: u128) {
    assert(self.owner.read() == get_caller_address(), 'Not authorized');
    self.balance.write(new_balance);
}
```

#### Building Documentation

```bash
# Generate docs
scarb doc

# Navigate to documentation
cd target/doc/my_package

# Build with mdBook
mdbook build

# Serve locally
mdbook serve
# Documentation available at http://localhost:3000
```

### 9.2 Kaaper (Alternative)

Kaaper is a documentation generator for Cairo projects that extracts code documentation into YAML files.

- **GitHub**: https://github.com/onlydustxyz/kaaper

```bash
# Install Kaaper
pip install kaaper

# Generate docs
kaaper generate
```

### 9.3 Documentation Best Practices

1. **Document All Public Functions** - Use `///` for public APIs
2. **Include Examples** - Show usage examples in comments
3. **Document Panics** - Clearly state when functions can panic
4. **Type Documentation** - Document complex types and structs
5. **Module Documentation** - Use `//!` for module-level docs

---

## 10. Modern TypeScript/JavaScript Tooling

### 10.1 TypeScript Configuration

#### tsconfig.json for Starknet Projects

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/contracts/*": ["./src/lib/contracts/*"]
    }
  },
  "include": ["src", "next-env.d.ts"],
  "exclude": ["node_modules"]
}
```

### 10.2 Vite Configuration

#### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // Required for starknet.js
  define: {
    global: 'globalThis',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/contracts': path.resolve(__dirname, './src/lib/contracts'),
    },
  },

  optimizeDeps: {
    include: ['starknet', '@starknet-react/core'],
  },

  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'starknet': ['starknet'],
          'starknet-react': ['@starknet-react/core', '@starknet-react/chains'],
        }
      }
    }
  },

  server: {
    port: 3000,
    open: true,
  },
})
```

### 10.3 Package.json Scripts

```json
{
  "name": "my-starknet-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "cairo:build": "cd contracts && scarb build",
    "cairo:test": "cd contracts && snforge test",
    "katana": "katana --dev --dev.no-fee",
    "deploy:local": "node scripts/deploy-local.js",
    "deploy:sepolia": "node scripts/deploy-sepolia.js"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "starknet": "^7.6.4",
    "@starknet-react/chains": "^4.0.0",
    "@starknet-react/core": "^4.0.0",
    "get-starknet-core": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.6.0",
    "prettier": "^3.3.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "14.2.0"
  }
}
```

### 10.4 Type Generation from ABIs

#### Using abi-wan-kanabi

```typescript
// scripts/generate-types.ts
import { getAbi } from 'abi-wan-kanabi'
import fs from 'fs'

async function generateTypes() {
  const contractAddress = '0x...'
  const provider = new RpcProvider({ nodeUrl: 'https://...' })

  const abi = await getAbi(contractAddress, provider)

  // Generate TypeScript types
  fs.writeFileSync(
    'src/types/contract.ts',
    `export const contractABI = ${JSON.stringify(abi, null, 2)} as const`
  )
}

generateTypes()
```

### 10.5 ESLint Configuration

#### .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 10.6 Prettier Configuration

#### .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### 10.7 Environment Variables

#### .env.local

```bash
# RPC Providers
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key

# Network
NEXT_PUBLIC_NETWORK=sepolia # or mainnet

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Private keys (NEVER commit these)
DEPLOYER_PRIVATE_KEY=0x...
DEPLOYER_ADDRESS=0x...
```

### 10.8 Git Hooks with Husky

```bash
npm install --save-dev husky lint-staged
npx husky install
```

#### .husky/pre-commit

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run type-check
npm run lint
npx lint-staged
```

#### .lintstagedrc.js

```javascript
module.exports = {
  '*.{ts,tsx}': ['prettier --write', 'eslint --fix'],
  '*.cairo': ['scarb fmt']
}
```

---

## 11. RPC Providers

### Major Providers (2025)

1. **Infura** - https://www.infura.io/
2. **Alchemy** - https://www.alchemy.com/
3. **Blast** - https://blastapi.io/
4. **Chainstack** - https://chainstack.com/
5. **Lava Network** - https://www.lavanet.xyz/
6. **QuickNode** - https://www.quicknode.com/

### Provider Configuration Examples

#### Infura

```typescript
import { RpcProvider } from 'starknet'

const provider = new RpcProvider({
  nodeUrl: `https://starknet-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
})

// Sepolia testnet
const testnetProvider = new RpcProvider({
  nodeUrl: `https://starknet-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
})
```

#### Alchemy

```typescript
import { RpcProvider } from 'starknet'

const provider = new RpcProvider({
  nodeUrl: `https://starknet-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
})
```

#### With Starknet React

```typescript
import { alchemyProvider, infuraProvider } from '@starknet-react/core'

// Use in StarknetConfig
<StarknetConfig
  provider={alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY })}
  // or
  provider={infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY })}
>
  {children}
</StarknetConfig>
```

---

## 12. Additional Resources

### Official Websites

- **Starknet**: https://www.starknet.io/
- **StarkWare**: https://starkware.co/
- **Cairo Lang**: https://www.cairo-lang.org/

### Community

- **Starknet Community Forum**: https://community.starknet.io/
- **Discord**: https://discord.gg/starknet
- **Telegram**: https://t.me/starknet_official

### Learning Resources

- **The Cairo Book**: https://www.starknet.io/cairo-book/
- **Starknet by Example**: https://github.com/NethermindEth/StarknetByExample
- **Starknet Basecamp**: https://www.starknet.io/tutorials/starknet-basecamp-smart-contracts/

### Block Explorers

- **Voyager**: https://voyager.online/
- **Starkscan**: https://starkscan.co/
- **ViewBlock**: https://viewblock.io/starknet

### Ecosystem Tools

- **Starknet ID**: Identity protocol for Starknet
- **Argent**: Smart wallet with social recovery
- **Braavos**: Security-focused wallet
- **JediSwap**: Decentralized exchange
- **mySwap**: AMM protocol

---

## 13. Quick Start Checklist

### For Contract Development

- [ ] Install Scarb (`curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh`)
- [ ] Install Starknet Foundry (`curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh`)
- [ ] Create new project (`snforge new my_project`)
- [ ] Add OpenZeppelin dependencies (optional)
- [ ] Write contracts in `src/`
- [ ] Write tests in `tests/`
- [ ] Run tests (`snforge test`)
- [ ] Build contracts (`scarb build`)

### For Frontend Development

- [ ] Create Next.js app (`npx create-next-app@latest`)
- [ ] Install Starknet packages (`npm install starknet @starknet-react/core @starknet-react/chains`)
- [ ] Set up Starknet provider in root layout
- [ ] Create wallet connection component
- [ ] Create contract interaction hooks
- [ ] Configure environment variables
- [ ] Set up TypeScript types from ABIs

### For Local Development

- [ ] Install Katana (`curl -L https://install.dojoengine.org | bash && dojoup install`)
- [ ] Start local node (`katana --dev --dev.no-fee`)
- [ ] Install Starkli (`curl https://get.starkli.sh | sh && starkliup`)
- [ ] Deploy contracts locally
- [ ] Connect frontend to local node

### For Production Deployment

- [ ] Test thoroughly on Katana
- [ ] Deploy to Sepolia testnet
- [ ] Verify contract functionality
- [ ] Set up monitoring
- [ ] Deploy to mainnet
- [ ] Verify source code on block explorer

---

## Conclusion

Building on Starknet in 2025 offers a robust development experience with mature tooling:

- **Cairo 2.12.0** provides a safe, efficient language for smart contracts
- **Scarb** simplifies dependency management and builds
- **Starknet Foundry** offers comprehensive testing capabilities
- **Starknet.js & Starknet React** enable seamless frontend integration
- **Katana** provides fast local development
- **Native account abstraction** enables innovative UX patterns

The ecosystem continues to evolve with significant improvements in gas costs, developer experience, and scalability. With proper tooling setup and following best practices outlined in this guide, you can build secure, efficient, and user-friendly applications on Starknet.

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Cairo Version**: 2.12.0
**Starknet.js Version**: 7.6.4
**Starknet React Version**: 4.x
**Starknet Foundry Version**: 0.48.0
