# Starknet Quick Reference Guide 2025

## Version Information (Current as of Nov 2025)

- **Cairo**: 2.12.0
- **Starknet.js**: 7.6.4
- **Starknet React**: 4.x
- **Starknet Foundry**: 0.48.0
- **Scarb**: 2.12.0

---

## Installation Commands

```bash
# Scarb (Cairo package manager)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# Starknet Foundry (Testing framework)
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
starkup

# Starkli (CLI tool)
curl https://get.starkli.sh | sh
starkliup

# Katana (Local node)
curl -L https://install.dojoengine.org | bash
dojoup install
```

---

## Essential Scarb Commands

```bash
scarb new my_project        # Create new project
scarb build                 # Build contracts
scarb test                  # Run tests
scarb add <package>         # Add dependency
scarb doc                   # Generate documentation
scarb tree                  # Show dependency tree
scarb fmt                   # Format code
```

---

## Starknet Foundry Commands

```bash
snforge new my_project      # Create new project with tests
snforge test                # Run all tests
snforge test -v             # Verbose output
snforge test test_name      # Run specific test
```

---

## Starkli Commands

```bash
# Declare contract
starkli declare target/dev/MyContract.contract_class.json \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json

# Deploy contract
starkli deploy <CLASS_HASH> <CONSTRUCTOR_ARGS> \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json

# Call (read) function
starkli call <CONTRACT_ADDRESS> get_balance

# Invoke (write) function
starkli invoke <CONTRACT_ADDRESS> set_balance 100 \
  --account ~/.starkli-wallets/deployer/account.json

# Get transaction
starkli transaction <TX_HASH>

# Get block
starkli block-number
starkli block <BLOCK_NUMBER>
```

---

## Katana Commands

```bash
# Start local node (development mode, no fees)
katana --dev --dev.no-fee

# Custom configuration
katana \
  --block-time 1000 \
  --accounts 20 \
  --seed 42 \
  --dev.no-fee

# Default RPC endpoint
http://localhost:5050

# Built-in block explorer
http://localhost:5050/explorer
```

---

## NPM/PNPM Commands for Frontend

```bash
# Next.js + Starknet
npx create-next-app@latest my-starknet-app
cd my-starknet-app
npm install starknet @starknet-react/core @starknet-react/chains get-starknet-core

# Vite + React + Starknet
npm create vite@latest my-starknet-app -- --template react-ts
cd my-starknet-app
npm install starknet @starknet-react/core @starknet-react/chains
```

---

## Minimal Cairo Contract

```cairo
#[starknet::contract]
mod MyContract {
    use starknet::ContractAddress;

    #[storage]
    struct Storage {
        value: u128,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_value: u128) {
        self.value.write(initial_value);
    }

    #[external(v0)]
    fn get_value(self: @ContractState) -> u128 {
        self.value.read()
    }

    #[external(v0)]
    fn set_value(ref self: ContractState, new_value: u128) {
        self.value.write(new_value);
    }
}
```

---

## Minimal Test

```cairo
#[cfg(test)]
mod tests {
    use super::MyContract;
    use snforge_std::{declare, ContractClassTrait};

    #[test]
    fn test_constructor() {
        let contract = declare("MyContract").unwrap();
        let (contract_address, _) = contract.deploy(@array![100_u128]).unwrap();

        let dispatcher = IMyContractDispatcher { contract_address };
        assert(dispatcher.get_value() == 100, 'Wrong value');
    }
}
```

---

## Minimal Scarb.toml

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2024_07"

[dependencies]
starknet = ">=2.12.0"

[dev-dependencies]
snforge_std = { git = "https://github.com/foundry-rs/starknet-foundry", tag = "v0.48.0" }

[[target.starknet-contract]]
sierra = true
casm = true
```

---

## Next.js Provider Setup

```typescript
// app/providers.tsx
'use client'

import { StarknetConfig, publicProvider, argent, braavos, useInjectedConnectors } from '@starknet-react/core'
import { sepolia, mainnet } from '@starknet-react/chains'

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "onlyIfNoConnectors",
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

// app/layout.tsx
import { StarknetProvider } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <StarknetProvider>{children}</StarknetProvider>
      </body>
    </html>
  )
}
```

---

## Wallet Connection Component

```typescript
'use client'

import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'

export function WalletConnect() {
  const { address, status } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (status === 'connected') {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button key={connector.id} onClick={() => connect({ connector })}>
          Connect {connector.name}
        </button>
      ))}
    </div>
  )
}
```

---

## Contract Interaction

```typescript
import { useContractRead, useContractWrite } from '@starknet-react/core'

// Read
const { data: value } = useContractRead({
  address: "0x...",
  abi: contractAbi,
  functionName: "get_value",
})

// Write
const { writeAsync } = useContractWrite({
  calls: [{
    contractAddress: "0x...",
    entrypoint: "set_value",
    calldata: ["100"]
  }]
})
```

---

## RPC Provider URLs

```typescript
// Infura
const MAINNET = `https://starknet-mainnet.infura.io/v3/${INFURA_API_KEY}`
const SEPOLIA = `https://starknet-sepolia.infura.io/v3/${INFURA_API_KEY}`

// Alchemy
const MAINNET = `https://starknet-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`

// Public
const MAINNET = 'https://starknet-mainnet.public.blastapi.io'
```

---

## Environment Variables Template

```bash
# .env.local
NEXT_PUBLIC_INFURA_API_KEY=your_key_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Don't commit these
DEPLOYER_PRIVATE_KEY=0x...
DEPLOYER_ADDRESS=0x...
```

---

## Common Cheatcodes (Testing)

```cairo
use snforge_std::{
    start_cheat_caller_address,
    stop_cheat_caller_address,
    start_cheat_block_timestamp,
    start_cheat_block_number,
    spy_events,
};

// Change caller
start_cheat_caller_address(contract_address, alice());
// ... perform actions
stop_cheat_caller_address(contract_address);

// Change timestamp
start_cheat_block_timestamp(contract_address, 1000);

// Spy events
let mut spy = spy_events();
// ... trigger events
spy.assert_emitted(@array![(contract_address, ExpectedEvent { ... })]);
```

---

## Deployment Workflow

```bash
# 1. Build
scarb build

# 2. Declare
starkli declare target/dev/MyContract.contract_class.json \
  --account account.json --keystore keystore.json
# Save CLASS_HASH

# 3. Deploy
starkli deploy <CLASS_HASH> <CONSTRUCTOR_ARGS> \
  --account account.json --keystore keystore.json
# Save CONTRACT_ADDRESS
```

---

## Useful Links

### Documentation
- Cairo Book: https://www.starknet.io/cairo-book/
- Starknet Docs: https://docs.starknet.io/
- Starknet.js: https://starknetjs.com/
- Starknet React: https://www.starknet-react.com/
- Starknet Foundry: https://foundry-rs.github.io/starknet-foundry/
- Starkli Book: https://book.starkli.rs/
- Scarb: https://docs.swmansion.com/scarb/

### Tools
- OpenZeppelin Wizard: https://wizard.openzeppelin.com/cairo
- Voyager Explorer: https://voyager.online/
- Starkscan: https://starkscan.co/

### GitHub
- Cairo: https://github.com/starkware-libs/cairo
- Starknet.js: https://github.com/starknet-io/starknet.js
- Starknet React: https://github.com/apibara/starknet-react
- Starknet Foundry: https://github.com/foundry-rs/starknet-foundry
- OpenZeppelin Cairo: https://github.com/OpenZeppelin/cairo-contracts
- Starkli: https://github.com/xJonathanLEI/starkli
- Katana: https://github.com/dojoengine/katana

---

## Troubleshooting

### Common Issues

**Issue**: "Command not found" after installation
**Solution**: Add to PATH or restart terminal

**Issue**: Katana won't start
**Solution**: Check glibc version (`ldd --version`), needs 2.33+

**Issue**: Frontend can't connect to wallet
**Solution**: Ensure wallet extension is installed and enabled

**Issue**: Contract deployment fails
**Solution**: Check account has funds, verify network connection

**Issue**: Tests fail with "Class hash not found"
**Solution**: Ensure contract is built before running tests

---

## Best Practices

1. Always test locally with Katana first
2. Deploy to Sepolia testnet before mainnet
3. Use environment variables for sensitive data
4. Implement proper error handling in frontend
5. Write comprehensive tests (aim for >80% coverage)
6. Document all public contract functions
7. Use OpenZeppelin components when possible
8. Keep dependencies updated
9. Monitor gas costs on testnet
10. Verify contracts on block explorers

---

**Quick Reference Version**: 1.0
**Last Updated**: November 2025
