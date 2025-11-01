# Starknet Randomness Generator - Comprehensive Research Report 2025

## Executive Summary

This research report compiles best practices, tools, and patterns for building a randomness generator on Starknet in 2025. The ecosystem has matured significantly with multiple production-ready VRF (Verifiable Random Function) solutions, robust development tooling, and an active developer community.

---

## Table of Contents

1. [VRF Principles and AnyRand](#1-vrf-principles-and-anyrand)
2. [Starknet-Specific Randomness Solutions](#2-starknet-specific-randomness-solutions)
3. [Modern Starknet Development Stack](#3-modern-starknet-development-stack)
4. [Security Best Practices](#4-security-best-practices)
5. [Performance Optimization](#5-performance-optimization)
6. [Testing Frameworks](#6-testing-frameworks)
7. [Frontend Integration](#7-frontend-integration)
8. [Reference Implementations](#8-reference-implementations)
9. [VRF Solutions Comparison](#9-vrf-solutions-comparison)
10. [Community Recommendations](#10-community-recommendations)

---

## 1. VRF Principles and AnyRand

### What is a Verifiable Random Function (VRF)?

A VRF is a cryptographic primitive that generates random numbers that are:
- **Unpredictable**: Cannot be predicted before generation
- **Verifiable**: Can be cryptographically proven to be random
- **Unbiased**: Cannot be manipulated by any party

### How VRFs Work

1. **Seed Submission**: A smart contract submits a private seed to the VRF provider
2. **Off-chain Generation**: The provider generates randomness using an off-chain private key combined with the seed
3. **Proof Generation**: A cryptographic proof is created alongside the random value
4. **On-chain Verification**: Both the random value and proof are verified on-chain
5. **Consumption**: The contract receives the verified unbiased result

**Security Guarantee**: The private seed prevents provider manipulation, while the private key prevents contract prediction—ensuring neither party can bias outcomes.

### AnyRand Principles

AnyRand provides free, verifiable randomness for EVM-compatible blockchains based on these core principles:

**Decentralization**
- Derives randomness from the drand network operated by the League of Entropy
- Uses decentralized threshold BLS network
- Produces publicly verifiable randomness beacons
- Permissionless and censorship-resistant

**Verifiability**
- Each random output includes cryptographic proof
- Anyone can verify the randomness independently
- Uses signature-based entropy fed into keccak256 as a random oracle

**Universal Accessibility**
- Works across all EVM-compatible chains
- Supports latest rollups with basic EVM precompiles
- Optimized for BN254 curve for seamless EVM integration

### VRF Generation Patterns

**Pattern 1: Request-Response (Asynchronous)**
```
User → Request Randomness (with seed) → VRF Oracle
VRF Oracle → Generate Random + Proof → Callback to Contract
Contract → Verify Proof → Use Randomness
```
*Used by: Pragma VRF, Chainlink VRF*

**Pattern 2: Atomic (Synchronous)**
```
User → Single Transaction → VRF + Response in same block
```
*Used by: Cartridge VRF*

**Pattern 3: Commit-Reveal**
```
Phase 1: User commits hash(value + salt)
Phase 2: User reveals value + salt
Contract verifies and uses randomness
```
*Traditional pattern, less common in modern implementations*

---

## 2. Starknet-Specific Randomness Solutions

### 2.1 Pragma VRF

**Official Site**: https://www.pragma.build/
**Documentation**: https://docs.pragma.build/
**GitHub**: https://github.com/astraly-labs/pragma-oracle

**Technical Specifications**:
- **Curve**: Curve25519 (IETF recommended)
- **Hash Method**: Elligator2 (optimized for cost and security)
- **Implementation**: Cairo 1.0 native
- **Pattern**: Asynchronous request-response

**Key Features**:
- First VRF implementation in Cairo
- Open-source Python implementation
- Designed for gaming and DeFi applications
- Cryptographically secure and provably fair

**Pricing Model**:
- Callback Gas Usage: Covers transaction costs (excess refunded)
- Premium: Variable fee based on request volume

**Integration Example**:
```toml
# Scarb.toml
[dependencies]
pragma_lib = { git = "https://github.com/astraly-labs/pragma-lib" }
```

```cairo
// Dice Game Example
use pragma_lib::interfaces::{IRandomnessDispatcher, IRandomnessDispatcherTrait};

#[starknet::interface]
trait IDiceGame<TContractState> {
    fn request_randomness_from_pragma(ref self: TContractState);
    fn receive_random_words(ref self: TContractState, requestor_address: ContractAddress,
                           request_id: u64, random_words: Span<felt252>, calldata: Array<felt252>);
    fn get_last_random_number(self: @TContractState) -> felt252;
}

// Key parameters:
// - callback_address: Your contract address for receiving randomness
// - callback_fee_limit: Max gas for callback execution
// - publish_delay: Minimum blocks between request and fulfillment
// - num_words: Number of random values (felt252) to receive
```

**Important**: Ensure your contract holds sufficient ETH to cover request costs and callback execution.

**Use Cases**:
- Gaming (treasure hunts, card shuffling, dice rolls)
- Lotteries and raffles
- Quest generation
- Fair random selection

### 2.2 Cartridge VRF

**Official Site**: https://www.cartridge.gg/
**Documentation**: https://docs.cartridge.gg/vrf/overview

**Technical Specifications**:
- **Curve**: Stark curve (native to Starknet)
- **Hash**: Poseidon hash (optimized for STARK proofs)
- **Implementation**: Cairo native, Dojo-compatible
- **Pattern**: Atomic (synchronous) execution

**Key Features**:
1. **Atomic Execution**: Request and response in same transaction
2. **Synchronous Randomness**: Immediate results, no waiting
3. **Efficient Verification**: Optimized for Starknet's proof system
4. **Fully On-chain**: Complete transparency and verifiability
5. **Gaming Focused**: Designed for instant gameplay needs
6. **Cost-effective**: Paymaster integration support

**Usage Patterns**:
```cairo
// Nonce-based randomness (unique per contract address)
let random = consume_random(Source::Nonce(contract_address));

// Salt-based randomness (unique per salt value)
let random = consume_random(Source::Salt(my_salt));
```

**Advantages**:
- No callback functions needed
- No waiting for multiple transactions
- Better user experience for games
- Simplified development model

**Best For**:
- Fully on-chain games
- Real-time randomness needs
- Dojo engine projects
- Applications requiring instant resolution

### 2.3 Drand Integration

**Reference**: https://hackmd.io/@plyL18hXRUWjalLcgt3rLg/Sy4MY981q
**GitHub**: Various implementations (see ZKasino example)

**Technical Specifications**:
- **Network**: Drand network (League of Entropy)
- **Pattern**: Beacon-based with repeater bot
- **Verification**: On-chain signature verification

**Architecture**:
```
Drand Network → Random Payload → VRF Repeater Bot → VRF Oracle → Contract
```

**Workflow**:
1. User makes game move, triggers RNG request
2. Drand network outputs random number payload
3. VRF Repeater (JS bot) picks up payload and sends to Oracle
4. VRF Oracle verifies signature and provides randomness
5. Contract uses verified randomness

**Advantages**:
- Blockchain-agnostic randomness source
- Credible organizations operate nodes
- Public randomness beacons
- Anyone can run a repeater bot

**Implementation**:
- Uses Drand JS + Starknet Hardhat plugin
- Contract verifies payload signatures on-chain
- Open-source bot implementations available

### 2.4 Commit-Reveal Pattern

**Reference**: https://github.com/gaetbout/starknet-commit-reveal
**Documentation**: https://starknet-by-example.voyager.online/advanced-concepts/commit-reveal/

**Traditional Pattern**:
```cairo
// Phase 1: Commit
fn commit(hash_of_value: felt252) {
    // Store hash(value + salt)
}

// Phase 2: Reveal
fn reveal(value: felt252, salt: felt252) {
    // Verify hash matches
    // Use value as randomness
}
```

**Pros**:
- No external dependencies
- Simple implementation
- No oracle costs

**Cons**:
- Requires multiple transactions
- User can abort if unhappy with result
- Not suitable for multiplayer games
- Vulnerable to last-revealer advantage

**Modern Status**: Largely superseded by VRF solutions for production applications, but still useful for:
- Learning exercises
- Low-stakes applications
- Voting systems
- Simple single-player games

### 2.5 Kerubim (Emerging Solution)

**Reference**: https://medium.com/@block3labs/kerubim-toward-native-randomness-on-starknet-fba932cd2691

**Innovation**: Native randomness at the sequencer level

**Approach**:
- Redesigns Starknet sequencer to generate randomness with every block
- Provides native randomness without external oracles
- Still in development/research phase

**Status**: Experimental, represents future direction for L2 randomness

---

## 3. Modern Starknet Development Stack

### 3.1 Cairo Language

**Current Version**: Cairo 2.12.0 (as of August 2025)
**Official Site**: https://www.cairo-lang.org/
**Documentation**: https://book.cairo-lang.org/
**GitHub**: https://github.com/starkware-libs/cairo

**Language Characteristics**:
- Rust-like syntax and semantics
- High-level language for efficient and safe code
- Native support for STARK proofs
- Strong type system
- No garbage collection (stack-based)

**Recent Improvements (2024-2025)**:
- Rewritten language server (faster completion and error checking)
- Enhanced compiler optimization
- Better error handling in contracts (v0.13.5+)
- More aggressive function inlining
- Improved gas handling

**Installation (One-liner)**:
```bash
curl https://get.starkup.sh | sh
```

This installs:
- Cairo compiler
- Scarb (package manager)
- Starknet Foundry (testing framework)

**Verify Installation**:
```bash
cairo --version  # Cairo 2.12.0
scarb --version  # Scarb 2.12.0
snforge --version  # Starknet Foundry 0.45.0
```

### 3.2 Scarb Package Manager

**Official Site**: https://docs.swmansion.com/scarb/
**GitHub**: https://github.com/software-mansion/scarb
**Current Version**: 2.12.2 with Cairo v2.12.2

**Description**: Project management tool inspired by Rust's Cargo

**Key Features**:
- Dependency management
- Project compilation
- Extensible platform for Cairo development
- Semantic versioning support
- **Incremental Compilation** (2025 feature)

**Installation Best Practice**:
```bash
# Recommended: Use asdf version manager
asdf plugin add scarb
asdf install scarb latest
asdf global scarb latest
```

**Why asdf?**: Each Scarb version is tied to a specific Cairo version. asdf allows easy switching between compiler versions.

**Project Setup**:
```bash
scarb new my_project
cd my_project
scarb build
scarb test
```

**Scarb.toml Example**:
```toml
[package]
name = "randomness_generator"
version = "0.1.0"
edition = "2023_11"

[dependencies]
starknet = ">=2.12.0"
openzeppelin = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v1.0.0" }
pragma_lib = { git = "https://github.com/astraly-labs/pragma-lib" }

[[target.starknet-contract]]
sierra = true
casm = true

[tool.snforge]
fork = [
    { name = "mainnet", url = "https://starknet-mainnet.public.blastapi.io", block_id.number = 123456 }
]
```

**Incremental Compilation** (New in 2025):
- Caches compilation steps
- Reuses cache in subsequent builds
- Preserve `target/` directory between runs
- Significantly faster rebuild times

**Versioning Best Practices**:
- Use three-part semantic versioning (e.g., 1.0.0)
- Before 1.0.0: Breaking changes increment minor version
- After 1.0.0: Breaking changes increment major version
- Increment minor version for new public APIs

### 3.3 Development Tools

#### Starknet Foundry

**GitHub**: https://github.com/foundry-rs/starknet-foundry
**Documentation**: https://foundry-rs.github.io/starknet-foundry/

**Components**:
1. **snforge**: Testing framework (like Truffle/Hardhat for Starknet)
2. **sncast**: CLI tool for interacting with contracts and chain data

**Testing Commands**:
```bash
snforge test                    # Run all tests
snforge test --ignored          # Run ignored tests
snforge test --include-ignored  # Run all including ignored
snforge test test_name          # Run specific test
SNFORGE_BACKTRACE=1 snforge test  # Enable backtrace
```

**Deployment Commands**:
```bash
sncast declare --contract-name MyContract
sncast deploy --class-hash 0x...
sncast call --contract-address 0x... --function get_value
sncast invoke --contract-address 0x... --function set_value --calldata 42
```

#### Starknet Devnet (Local Development)

```bash
starknet-devnet --seed 0 --host 127.0.0.1 --port 5050
```

#### Cairo Language Server

- Integrated with VS Code, Vim, Emacs
- Real-time error checking
- Code completion
- Go to definition
- Recently rewritten for better performance (2024)

### 3.4 Smart Contract Standards

#### OpenZeppelin Cairo Contracts

**Official Site**: https://www.openzeppelin.com/cairo-contracts
**GitHub**: https://github.com/OpenZeppelin/cairo-contracts
**Documentation**: https://docs.openzeppelin.com/contracts-cairo/

**Market Position** (2025):
- Powers 55% of Starknet TVL
- Secured over $620M at peak (April 2024)
- Industry-standard security implementations

**Standards Supported**:
- ERC20: Fungible tokens
- ERC721: Non-fungible tokens
- ERC1155: Multi-tokens
- ERC4626: Tokenized vaults

**Security Features**:
- Role-based access control (AccessControl)
- Account abstraction primitives
- Contract upgradeability (Proxy patterns)
- Pausable contracts (emergency stops)
- Reentrancy guards
- Initialization guards

**Installation**:
```toml
[dependencies]
openzeppelin = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v1.0.0" }
```

**Usage Example**:
```cairo
use openzeppelin::token::erc20::ERC20Component;
use openzeppelin::access::ownable::OwnableComponent;

#[starknet::contract]
mod MyToken {
    use super::{ERC20Component, OwnableComponent};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // Component implementations...
}
```

**Contract Wizard**:
- Interactive smart contract generator
- URL: https://wizard.openzeppelin.com/cairo (check if available)
- Generates boilerplate for common patterns

---

## 4. Security Best Practices

### 4.1 General Randomness Security Principles

#### Critical Security Threats

**1. Predictability**
- **Threat**: Block hashes, timestamps, or on-chain data are predictable
- **Impact**: Attackers can predict outcomes before committing actions
- **Solution**: Use VRF oracles with cryptographic proofs

**2. Block Producer Manipulation**
- **Threat**: Sequencers can see transaction outcomes before inclusion
- **Impact**: Can selectively include/exclude transactions based on favorable outcomes
- **Solution**:
  - Implement delays (commit-reveal)
  - Use external randomness sources (VRF oracles)
  - Ensure cryptographic verification

**3. Front-Running**
- **Threat**: Observers can see pending randomness requests
- **Impact**: Can submit competing transactions with knowledge of outcomes
- **Solution**:
  - Private mempools
  - Commit-reveal schemes
  - Threshold encryption

**4. Last Actor Advantage**
- **Threat**: In multi-party randomness, last participant can decide to abort
- **Impact**: Biased outcomes favoring last participant
- **Solution**:
  - Use non-interactive VRFs
  - Implement penalties for non-participation
  - Use timeout mechanisms

### 4.2 VRF Security Best Practices

#### Chainlink VRF Best Practices

**Official Guide**: https://docs.chain.link/vrf/v2/best-practices

1. **Don't Re-request Randomness**: Store results, don't request multiple times for same purpose
2. **Use Subscription Method**: More cost-effective than direct funding
3. **Set Appropriate Callback Gas Limit**: Ensure sufficient gas for callback execution
4. **Verify Randomness Source**: Check proof verification in callback
5. **Handle Callback Failures**: Implement fallback mechanisms
6. **Consider Request Costs**: Factor in LINK token costs

#### Pragma VRF Security Considerations

1. **Fund Your Contract**: Ensure sufficient ETH for callback execution
2. **Set Publish Delay**: Minimum blocks between request and fulfillment
3. **Validate Callback**: Only accept callbacks from Pragma oracle
4. **Handle Refunds**: Excess gas is refunded to your contract
5. **Rate Limiting**: Implement per-user or per-session limits

**Example Security Pattern**:
```cairo
#[starknet::contract]
mod SecureRandomness {
    use pragma_lib::interfaces::{IRandomnessDispatcher};

    #[storage]
    struct Storage {
        pragma_oracle: ContractAddress,
        pending_requests: LegacyMap<u64, bool>,
        results: LegacyMap<u64, felt252>,
    }

    #[external(v0)]
    fn receive_random_words(
        ref self: ContractState,
        requestor_address: ContractAddress,
        request_id: u64,
        random_words: Span<felt252>,
        calldata: Array<felt252>
    ) {
        // Security check 1: Verify caller is Pragma oracle
        assert(get_caller_address() == self.pragma_oracle.read(), 'Unauthorized callback');

        // Security check 2: Verify this is a pending request
        assert(self.pending_requests.read(request_id), 'Invalid request');

        // Security check 3: Ensure request not already fulfilled
        assert(self.results.read(request_id) == 0, 'Already fulfilled');

        // Store result
        self.results.write(request_id, *random_words[0]);
        self.pending_requests.write(request_id, false);
    }
}
```

#### Cartridge VRF Security

1. **Atomic Execution**: Eliminates callback vulnerabilities
2. **Nonce Management**: Use unique nonces per request
3. **Salt Entropy**: Ensure sufficient entropy in salt values
4. **Verification**: Proof is verified on-chain automatically

### 4.3 Common Vulnerabilities and Mitigations

#### Vulnerability 1: Using Block Data for Randomness

```cairo
// WRONG - Predictable!
fn bad_random() -> felt252 {
    let block_hash = get_block_hash_syscall(get_block_number() - 1);
    return block_hash; // Predictable to sequencers
}

// CORRECT - Use VRF
fn good_random(ref self: ContractState) {
    let request_id = self.request_randomness_from_pragma();
    // Handle in callback
}
```

#### Vulnerability 2: Insufficient Entropy

```cairo
// WRONG - Weak entropy
fn weak_random(seed: u32) -> felt252 {
    return hash(seed); // Limited entropy
}

// CORRECT - Use proper seed
fn strong_random(seed: felt252, nonce: felt252) -> felt252 {
    // Request from VRF with both seed and nonce
}
```

#### Vulnerability 3: No Request Verification

```cairo
// WRONG - No verification
fn receive_random(random: felt252) {
    self.result.write(random); // Anyone can call!
}

// CORRECT - Verify caller
fn receive_random_words(requestor: ContractAddress, random: felt252) {
    assert(get_caller_address() == self.oracle.read(), 'Unauthorized');
    self.result.write(random);
}
```

### 4.4 Starknet-Specific Security

#### Account Abstraction Considerations

Starknet's native account abstraction affects randomness:
- Signature verification happens at account level
- Multi-sig can participate in randomness requests
- Session keys can automate random requests

#### Proof System Security

STARK proofs provide additional security:
- Post-quantum resistant
- Publicly verifiable
- No trusted setup required

#### Cairo-Specific Patterns

**Felt252 Arithmetic**:
```cairo
// Careful with felt252 wrapping
let random: felt252 = vrf_result;
let bounded: u256 = (random % upper_bound).into(); // Safe modulo
```

**Storage Verification**:
```cairo
// Verify storage hasn't been tampered
#[derive(Drop, Serde, starknet::Store)]
struct RandomnessRequest {
    requester: ContractAddress,
    block_number: u64,
    fulfilled: bool,
}
```

### 4.5 Audit Checklist

Before deploying randomness contracts:

- [ ] Use established VRF solution (Pragma/Cartridge)
- [ ] Implement caller verification in callbacks
- [ ] Set appropriate gas limits
- [ ] Handle callback failures gracefully
- [ ] Rate limit randomness requests
- [ ] Verify storage state before fulfillment
- [ ] Test with Starknet Foundry
- [ ] Consider audit from:
  - Trail of Bits
  - OpenZeppelin
  - CertiK
  - Consensys Diligence

### 4.6 Security Resources

**Official Documentation**:
- Starknet Security: https://docs.starknet.io/security/
- Cairo Security Guide: https://secure-contracts.com/not-so-smart-contracts/cairo/

**Community Resources**:
- Starknet Security Community Forum
- Cairo Auditors Group
- OWASP Top 10 for Smart Contracts 2025

---

## 5. Performance Optimization

### 5.1 Cairo Contract Optimization Principles

#### Primary Cost Drivers on Starknet

**1. Storage Operations** (Highest Cost)
- Each storage slot write costs significant gas
- Storage reads are cheaper but still costly
- Focus optimization efforts here first

**2. Computation (L2 Gas)**
- Cairo step execution
- Sierra to CASM compilation
- Builtin operations

**3. Data Availability (L1 Gas)**
- State diff posting to L1
- Calldata usage
- Message passing L2→L1

**Gas Components Breakdown**:
```
Total Fee = (L2_gas * L2_gas_price) +
            (L1_data_gas * L1_gas_price) +
            (L1_gas * L1_gas_price)
```

### 5.2 Storage Optimization Techniques

#### Technique 1: Storage Packing

**Official Guide**: https://book.cairo-lang.org/ch103-01-optimizing-storage-costs.html

**Concept**: Pack multiple variables into single storage slot (251 bits max)

**Example - Bad**:
```cairo
#[storage]
struct Storage {
    value1: u32,  // Separate slot
    value2: u32,  // Separate slot
    value3: u32,  // Separate slot
}
// Cost: 3 storage writes
```

**Example - Good**:
```cairo
#[derive(Drop, Sero, starknet::Store)]
struct PackedData {
    value1: u32,
    value2: u32,
    value3: u32,
}

#[storage]
struct Storage {
    packed: PackedData,  // Single slot!
}
// Cost: 1 storage write (3x cheaper!)
```

**StorePacking Trait** (Automatic):
```cairo
use starknet::StorePacking;

#[derive(Copy, Drop, Sero)]
struct GameState {
    score: u32,
    level: u16,
    lives: u8,
}

// Cairo automatically packs these into single felt252
impl GameStateStorePacking of StorePacking<GameState, felt252> {
    fn pack(value: GameState) -> felt252 {
        let packed = value.score.into() +
                    (value.level.into() * 0x100000000) +
                    (value.lives.into() * 0x10000000000);
        packed
    }

    fn unpack(value: felt252) -> GameState {
        // Automatic unpacking
    }
}
```

**Best Practices**:
- Use smallest possible types (u8, u16, u32 instead of u256)
- Group related variables together
- Total packed size must fit in 251 bits
- u128 is good for intermediate packing

#### Technique 2: Storage Slot Allocation

**Key Difference from Solidity**: Starknet allocates storage by hash of variable name, not sequential order.

```cairo
#[storage]
struct Storage {
    value_a: u256,  // Hash('value_a') → slot
    value_b: u256,  // Hash('value_b') → slot
}
// Order doesn't matter in Starknet!
```

#### Technique 3: Minimize Storage Writes

```cairo
// BAD - Multiple writes
fn update_score(ref self: ContractState, points: u32) {
    let score = self.score.read();
    let new_score = score + points;
    self.score.write(new_score);
    self.last_update.write(get_block_timestamp());
}

// GOOD - Batch writes with packed struct
fn update_score(ref self: ContractState, points: u32) {
    let mut state = self.game_state.read();  // Single read
    state.score += points;
    state.last_update = get_block_timestamp();
    self.game_state.write(state);  // Single write
}
```

#### Technique 4: Use Events for Historical Data

```cairo
// WRONG - Store all history on-chain
#[storage]
struct Storage {
    roll_history: LegacyMap<u64, felt252>,  // Expensive!
}

// CORRECT - Emit events, query off-chain
#[event]
#[derive(Drop, starknet::Event)]
struct DiceRolled {
    player: ContractAddress,
    roll: felt252,
    timestamp: u64,
}

fn roll_dice(ref self: ContractState, random: felt252) {
    self.emit(DiceRolled {
        player: get_caller_address(),
        roll: random,
        timestamp: get_block_timestamp()
    });
    // No storage write needed!
}
```

### 5.3 Computation Optimization

#### Recent Performance Improvements (2024-2025)

**Cairo Native Execution** (February 2025):
- Contracts run as native machine code
- No Cairo VM interpretation overhead
- Significant throughput increase

**Stwo Prover** (April 2025):
- 1000x more efficient than current prover
- 100x better than any other market prover
- Faster finality and lower fees

**Achieved Improvements**:
- Gas fees: $0.24 → <$0.001 (100x reduction)
- Transaction speed: 15s → 2s (7x improvement)
- Computation cost: ~50% reduction
- DA cost: 10-25% reduction

#### Compiler Optimizations

**Automatic Optimizations** (Cairo 2.12+):
- Aggressive function inlining
- Dead code elimination
- Constant folding
- Loop unrolling (when beneficial)
- Function specialization

**Manual Optimizations**:

**1. Minimize Loop Iterations**:
```cairo
// BAD - Inefficient loop
fn sum_array(arr: Span<u32>) -> u32 {
    let mut sum = 0;
    let mut i = 0;
    loop {
        if i >= arr.len() { break; }
        sum += *arr[i];
        i += 1;
    }
    sum
}

// GOOD - Use built-in iteration
fn sum_array(arr: Span<u32>) -> u32 {
    let mut sum = 0;
    for value in arr {
        sum += *value;
    };
    sum
}
```

**2. Leverage Builtins**:
```cairo
// GOOD - Use Cairo builtins (optimized)
use core::pedersen::pedersen;
use core::poseidon::poseidon_hash_span;

fn hash_data(data: felt252) -> felt252 {
    poseidon_hash_span(array![data].span())  // Uses Poseidon builtin
}
```

**3. Avoid Unnecessary Cloning**:
```cairo
// BAD - Unnecessary clone
fn process(value: GameState) -> u32 {
    value.score  // value moved
}

// GOOD - Use reference
fn process(value: @GameState) -> u32 {
    *value.score  // No move/clone needed
}
```

#### Felt252 vs. Integer Types

```cairo
// Use appropriate types
let small_value: u8 = 255;     // 1 byte
let medium_value: u32 = 1000;  // 4 bytes
let large_value: u256 = 1000000;  // 32 bytes
let felt_value: felt252 = 123;  // 32 bytes (but special handling)

// Felt252 operations are optimized in Cairo
// Use felt252 for hashes, addresses, most computations
// Use u32/u64 for counters, small numbers
// Use u256 for token amounts, large numbers
```

### 5.4 Randomness-Specific Optimizations

#### Optimize VRF Requests

**Pattern 1: Batch Requests**
```cairo
// BAD - Multiple VRF requests
fn generate_deck(ref self: ContractState) {
    for i in 0..52 {
        let random = self.request_random();  // 52 requests!
    }
}

// GOOD - Single request with multiple words
fn generate_deck(ref self: ContractState) {
    // Request 2-3 random values, use as seeds
    let request_id = self.request_randomness_from_pragma(
        callback_address: get_contract_address(),
        callback_fee_limit: 100000,
        publish_delay: 1,
        num_words: 3,  // Get multiple random values
    );
}

fn receive_random_words(random_words: Span<felt252>) {
    // Use Fisher-Yates shuffle with these seeds
    let seed1 = *random_words[0];
    let seed2 = *random_words[1];
    let seed3 = *random_words[2];
    // Generate 52 cards from 3 seeds
}
```

**Pattern 2: Deterministic Expansion**
```cairo
// Use single VRF result to generate many values
fn expand_randomness(seed: felt252, count: u32) -> Array<felt252> {
    let mut results = ArrayTrait::new();
    let mut i = 0;
    loop {
        if i >= count { break; }
        // Hash seed with counter for deterministic expansion
        let random = poseidon_hash_span(
            array![seed, i.into()].span()
        );
        results.append(random);
        i += 1;
    };
    results
}
```

#### Cartridge VRF Optimization

```cairo
// Atomic execution - no callback overhead!
use cartridge_vrf::{consume_random, Source};

fn instant_roll(ref self: ContractState) {
    // Single transaction, no waiting
    let random = consume_random(
        Source::Nonce(get_contract_address())
    );
    let roll = (random % 6) + 1;  // Dice roll
    self.process_result(roll);
}
```

### 5.5 Data Availability Optimization

**Technique 1: Minimize Calldata**
```cairo
// BAD - Large calldata
fn bulk_process(data: Array<felt252>) {  // Expensive if large!
    // Process array
}

// GOOD - Use hash + off-chain storage
fn bulk_process(data_hash: felt252) {
    // Verify hash matches off-chain data
    // Process using off-chain indexer
}
```

**Technique 2: State Diff Compression** (v0.13.5+)
- Automatic compression of state diffs
- Uses blob data where possible
- 10-25% DA cost reduction

### 5.6 Gas Analysis Tools

#### Walnut Flamegraphs

**Website**: https://walnut.dev/
**Use Case**: Visualize gas consumption breakdown

**Features**:
- Flamechart visualization
- Identify expensive functions
- Compare before/after optimizations
- Analyze L2 gas vs L1 data gas

**Usage**:
1. Submit transaction hash
2. View interactive flamegraph
3. Identify hotspots (widest flames)
4. Optimize those functions first

#### Starknet Gas Profiling

```bash
# Profile test execution
snforge test --gas-report

# Output shows:
# - Gas per test
# - Gas per function call
# - Storage operations count
```

### 5.7 Performance Benchmarks

**Typical Gas Costs** (v0.13.5+):

| Operation | Approximate Cost |
|-----------|-----------------|
| ERC20 Transfer | <$0.001 |
| NFT Mint | ~$0.002-0.005 |
| Storage Write | ~$0.0001 per slot |
| Pragma VRF Request | ~$0.01-0.02 |
| Cartridge VRF (atomic) | ~$0.005-0.01 |

**Target Performance**:
- Current: 460 TPS (can handle all Ethereum L1+L2 traffic)
- With Cairo Native (2025): Thousands of TPS
- With Stwo (2025): Even higher throughput

### 5.8 Optimization Checklist

Before deployment:
- [ ] Pack storage variables using StorePacking
- [ ] Minimize storage write operations
- [ ] Use events instead of storage for historical data
- [ ] Leverage Cairo builtins (poseidon, pedersen, etc.)
- [ ] Batch VRF requests when possible
- [ ] Use deterministic expansion for multiple random values
- [ ] Profile gas usage with Walnut/snforge
- [ ] Consider Cartridge VRF for atomic execution
- [ ] Test on devnet before mainnet
- [ ] Monitor costs on testnet first

---

## 6. Testing Frameworks

### 6.1 Starknet Foundry

**Official Documentation**: https://foundry-rs.github.io/starknet-foundry/
**GitHub**: https://github.com/foundry-rs/starknet-foundry
**Current Version**: 0.45.0+

**Philosophy**: Blazing fast toolkit for developing Starknet contracts, inspired by Foundry (Ethereum).

### 6.2 snforge - Testing Framework

#### Installation

Included with starkup installer:
```bash
curl https://get.starkup.sh | sh
starkup
snforge --version
```

#### Basic Test Structure

**Test Location**: Tests live in `#[cfg(test)]` modules in the same file as code.

```cairo
// src/lib.cairo
fn sum(a: felt252, b: felt252) -> felt252 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::sum;

    #[test]
    fn test_sum() {
        let result = sum(2, 3);
        assert(result == 5, 'sum incorrect');
    }

    #[test]
    fn test_sum_zero() {
        assert(sum(0, 0) == 0, 'zero case failed');
    }
}
```

#### Running Tests

```bash
snforge test                      # Run all tests
snforge test test_sum            # Run specific test
snforge test --exact test_sum    # Exact match
snforge test -f sum              # Filter by name
```

#### Test Attributes

**1. Expected Failures**:
```cairo
#[test]
#[should_panic]
fn test_overflow() {
    let result = 2 / 0;  // Should panic
}

#[test]
#[should_panic(expected: ('Division by zero',))]
fn test_specific_error() {
    assert(1 == 2, 'Division by zero');  // Exact error message
}

#[test]
#[should_panic(expected: ('overflow',))]
fn test_felt_error() {
    panic_with_felt252('overflow');
}
```

**2. Ignoring Tests**:
```cairo
#[test]
#[ignore]
fn expensive_test() {
    // This test is skipped by default
}
```

Run ignored tests:
```bash
snforge test --ignored            # Only ignored
snforge test --include-ignored    # All tests including ignored
```

#### Testing Smart Contracts

**Contract Test Structure**:
```cairo
// src/randomness.cairo
#[starknet::interface]
trait IRandomness<TContractState> {
    fn request_random(ref self: TContractState) -> u64;
    fn get_result(self: @TContractState, request_id: u64) -> felt252;
}

#[starknet::contract]
mod RandomnessContract {
    #[storage]
    struct Storage {
        results: LegacyMap<u64, felt252>,
        nonce: u64,
    }

    #[abi(embed_v0)]
    impl RandomnessImpl of super::IRandomness<ContractState> {
        fn request_random(ref self: ContractState) -> u64 {
            let id = self.nonce.read();
            self.nonce.write(id + 1);
            id
        }

        fn get_result(self: @ContractState, request_id: u64) -> felt252 {
            self.results.read(request_id)
        }
    }
}

// Tests
#[cfg(test)]
mod tests {
    use super::{RandomnessContract, IRandomnessDispatcher, IRandomnessDispatcherTrait};
    use starknet::{ContractAddress, deploy_syscall, ClassHash};
    use starknet::testing::{set_contract_address, set_block_timestamp};

    fn deploy_contract() -> ContractAddress {
        let contract = declare('RandomnessContract');
        let contract_address = contract.deploy(@ArrayTrait::new()).unwrap();
        contract_address
    }

    #[test]
    fn test_request_random() {
        let contract_address = deploy_contract();
        let dispatcher = IRandomnessDispatcher { contract_address };

        let request_id = dispatcher.request_random();
        assert(request_id == 0, 'first request should be 0');

        let request_id2 = dispatcher.request_random();
        assert(request_id2 == 1, 'second request should be 1');
    }
}
```

#### Test Helpers and Cheatcodes

**1. Contract Deployment**:
```cairo
use snforge_std::{declare, ContractClassTrait};

#[test]
fn test_deploy() {
    let contract = declare('MyContract');
    let constructor_args = array![123, 456];
    let contract_address = contract.deploy(@constructor_args).unwrap();
    // Use contract_address...
}
```

**2. Cheatcodes** (Test-only Functions):
```cairo
use snforge_std::{
    start_prank, stop_prank,
    start_warp, stop_warp,
    spy_events, EventSpy,
    load, store
};

#[test]
fn test_with_cheatcodes() {
    let contract_address = deploy_contract();
    let user = starknet::contract_address_const::<0x123>();

    // Prank: Change caller address
    start_prank(CheatTarget::One(contract_address), user);
    // Calls now appear from 'user'
    dispatcher.some_function();
    stop_prank(CheatTarget::One(contract_address));

    // Warp: Change block timestamp
    start_warp(CheatTarget::One(contract_address), 1000);
    // Block timestamp is now 1000
    stop_warp(CheatTarget::One(contract_address));

    // Spy on events
    let mut spy = spy_events(SpyOn::One(contract_address));
    dispatcher.emit_event();
    spy.assert_emitted(@array![
        (contract_address, Event::SomeEvent(SomeEvent { value: 123 }))
    ]);
}
```

**3. Mock Contracts**:
```cairo
#[starknet::contract]
mod MockOracle {
    #[storage]
    struct Storage {
        fixed_random: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, fixed_value: felt252) {
        self.fixed_random.write(fixed_value);
    }

    #[external(v0)]
    fn get_random(self: @ContractState) -> felt252 {
        self.fixed_random.read()
    }
}

#[test]
fn test_with_mock() {
    let mock_oracle = deploy_mock_oracle(42);
    // Test contract using mock oracle that always returns 42
}
```

### 6.3 Testing Randomness Contracts

#### Pattern 1: Mock VRF Oracle

```cairo
#[starknet::contract]
mod MockPragmaOracle {
    #[storage]
    struct Storage {
        random_values: LegacyMap<u64, felt252>,
    }

    #[external(v0)]
    fn request_randomness(
        ref self: ContractState,
        callback_address: ContractAddress,
        callback_fee_limit: u128,
        publish_delay: u64,
        num_words: u64,
    ) -> u64 {
        let request_id = 1;

        // Immediately fulfill (no delay in tests)
        let random_words = array![12345];  // Deterministic for testing

        let callback = IRandomnessDispatcher { contract_address: callback_address };
        callback.receive_random_words(
            get_contract_address(),
            request_id,
            random_words.span(),
            array![].span()
        );

        request_id
    }
}

#[test]
fn test_dice_roll() {
    let mock_oracle = deploy_mock_oracle();
    let dice_game = deploy_dice_game(mock_oracle);

    let roll = dice_game.roll_dice();
    // Mock oracle returns 12345, so roll = (12345 % 6) + 1 = 4
    assert(roll == 4, 'incorrect roll');
}
```

#### Pattern 2: Test Different Random Values

```cairo
#[test]
fn test_various_outcomes() {
    let test_cases = array![
        (100, 1),   // 100 % 6 + 1 = 5
        (101, 2),   // 101 % 6 + 1 = 6
        (102, 3),   // 102 % 6 + 1 = 1
    ];

    for (random_value, expected_roll) in test_cases {
        let mock_oracle = deploy_mock_oracle(*random_value);
        let dice_game = deploy_dice_game(mock_oracle);
        let roll = dice_game.roll_dice();
        assert(roll == *expected_roll, 'wrong outcome');
    };
}
```

#### Pattern 3: Test Security Checks

```cairo
#[test]
#[should_panic(expected: ('Unauthorized callback',))]
fn test_unauthorized_callback() {
    let game = deploy_game();
    let attacker = starknet::contract_address_const::<0x999>();

    start_prank(CheatTarget::One(game), attacker);
    // Try to call receive_random_words from non-oracle address
    game.receive_random_words(attacker, 1, array![42].span(), array![]);
}

#[test]
#[should_panic(expected: ('Already fulfilled',))]
fn test_double_fulfillment() {
    let game = deploy_game();
    let oracle = deploy_oracle();

    // Fulfill once
    oracle.fulfill_request(1, 42);

    // Try to fulfill again - should fail
    oracle.fulfill_request(1, 99);
}
```

#### Pattern 4: Integration Tests

```cairo
#[test]
fn test_full_game_flow() {
    // Deploy all contracts
    let mock_oracle = deploy_mock_oracle();
    let game_token = deploy_erc20();
    let lottery_game = deploy_lottery(mock_oracle, game_token);

    let player1 = starknet::contract_address_const::<0x1>();
    let player2 = starknet::contract_address_const::<0x2>();

    // Player 1 enters
    start_prank(CheatTarget::One(lottery_game), player1);
    game_token.approve(lottery_game, 100);
    lottery_game.enter_lottery(100);
    stop_prank(CheatTarget::One(lottery_game));

    // Player 2 enters
    start_prank(CheatTarget::One(lottery_game), player2);
    game_token.approve(lottery_game, 100);
    lottery_game.enter_lottery(100);
    stop_prank(CheatTarget::One(lottery_game));

    // Draw winner
    lottery_game.draw_winner();

    // Check winner (deterministic from mock oracle)
    let winner = lottery_game.get_winner();
    assert(winner == player1 || winner == player2, 'invalid winner');
}
```

### 6.4 Gas Reporting

```bash
snforge test --gas-report
```

Output:
```
Test gas usage:
  test_request_random: 12,345 gas
  test_receive_callback: 45,678 gas
  test_full_flow: 98,765 gas
```

### 6.5 Debugging Tests

**Enable Backtrace**:
```bash
SNFORGE_BACKTRACE=1 snforge test
```

**Print Debugging**:
```cairo
use debug::PrintTrait;

#[test]
fn test_with_debug() {
    let value = 42;
    value.print();  // Prints to console

    let result = some_function();
    result.print();
}
```

### 6.6 Assertion Macros

```cairo
use snforge_std::{assert_eq, assert_ne, assert_lt, assert_le, assert_gt, assert_ge};

#[test]
fn test_with_macros() {
    assert_eq!(2 + 2, 4, "addition failed");
    assert_ne!(1, 2, "values should differ");
    assert_lt!(5, 10, "5 should be less than 10");
    assert_le!(5, 5, "5 should be less or equal to 5");
    assert_gt!(10, 5, "10 should be greater than 5");
    assert_ge!(10, 10, "10 should be greater or equal to 10");
}
```

**Note**: These macros have gas costs, use only in development!

### 6.7 Testing Best Practices

1. **Test Isolation**: Each test should be independent
2. **Use Mocks**: Mock external dependencies (oracles, tokens)
3. **Test Edge Cases**: Zero values, maximum values, overflow conditions
4. **Security Tests**: Unauthorized access, reentrancy, replay attacks
5. **Gas Awareness**: Monitor gas usage, optimize expensive functions
6. **Deterministic Tests**: Use fixed random values for reproducibility
7. **Integration Tests**: Test full user flows end-to-end

### 6.8 Continuous Integration

**GitHub Actions Example**:
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Scarb
        run: |
          curl https://get.starkup.sh | sh
          starkup

      - name: Run tests
        run: snforge test --gas-report

      - name: Check formatting
        run: scarb fmt --check
```

---

## 7. Frontend Integration

### 7.1 Starknet-React Library

**Official Documentation**: https://www.starknet-react.com/
**GitHub**: https://github.com/apibara/starknet-react
**Current Version**: Compatible with Starknet.js v6

**Description**: Collection of React hooks for Starknet, built on:
- **Tanstack Query**: Data fetching and caching
- **Starknet.js**: Core Starknet interactions
- **abi-wan-kanabi**: Type-safe contract calls

### 7.2 Installation and Setup

#### Install Dependencies

```bash
npm install @starknet-react/chains @starknet-react/core starknet
```

For Cartridge wallet support:
```bash
npm install @cartridge/connector
```

#### Project Structure

```
my-dapp/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Provider wrapper
│   │   └── page.tsx            # Main page
│   ├── components/
│   │   ├── ConnectWallet.tsx
│   │   ├── RandomnessDisplay.tsx
│   │   └── RequestRandomness.tsx
│   ├── hooks/
│   │   └── useRandomness.ts
│   ├── lib/
│   │   └── contracts.ts        # Contract ABIs and addresses
│   └── providers.tsx           # Starknet provider config
├── package.json
└── tsconfig.json
```

### 7.3 Provider Configuration

**providers.tsx**:
```typescript
'use client';

import { mainnet, sepolia } from '@starknet-react/chains';
import { StarknetConfig, publicProvider, useInjectedConnectors, voyager } from '@starknet-react/core';
import { ready, braavos, ControllerConnector } from '@starknet-react/connectors';

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    // Recommended wallets
    recommended: [
      ready(),
      braavos(),
    ],
    // Include recommended only if no other wallets detected
    includeRecommended: "onlyIfNoConnectors",
    // Randomize order for fairness
    order: "random",
  });

  // Add Cartridge Controller
  const cartridgeConnector = new ControllerConnector({
    rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet",
  });

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={[...connectors, cartridgeConnector]}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}
```

**Next.js App Router (app/layout.tsx)**:
```typescript
import { StarknetProvider } from '@/providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StarknetProvider>
          {children}
        </StarknetProvider>
      </body>
    </html>
  );
}
```

### 7.4 Contract Integration

**lib/contracts.ts**:
```typescript
import { Contract } from 'starknet';

export const RANDOMNESS_CONTRACT_ADDRESS =
  '0x1234...'; // Your deployed contract

export const RANDOMNESS_ABI = [
  {
    type: 'function',
    name: 'request_randomness_from_pragma',
    inputs: [],
    outputs: [{ type: 'core::integer::u64' }],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'get_last_random_number',
    inputs: [],
    outputs: [{ type: 'core::felt252' }],
    state_mutability: 'view',
  },
  {
    type: 'event',
    name: 'RandomnessRequested',
    inputs: [
      { name: 'requester', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'request_id', type: 'core::integer::u64' },
    ],
  },
  {
    type: 'event',
    name: 'RandomnessReceived',
    inputs: [
      { name: 'request_id', type: 'core::integer::u64' },
      { name: 'random_value', type: 'core::felt252' },
    ],
  },
] as const;
```

### 7.5 Core Hooks Usage

#### Connect Wallet

**components/ConnectWallet.tsx**:
```typescript
'use client';

import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        <button onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3>Connect Wallet</h3>
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
  );
}
```

#### Read Contract Data

**hooks/useRandomness.ts**:
```typescript
import { useContractRead } from '@starknet-react/core';
import { RANDOMNESS_CONTRACT_ADDRESS, RANDOMNESS_ABI } from '@/lib/contracts';

export function useLastRandomNumber() {
  const { data, isError, isLoading, error, refetch } = useContractRead({
    functionName: 'get_last_random_number',
    args: [],
    abi: RANDOMNESS_ABI,
    address: RANDOMNESS_CONTRACT_ADDRESS,
    watch: true, // Auto-refresh on new blocks
  });

  return {
    randomNumber: data?.toString(),
    isLoading,
    isError,
    error,
    refetch,
  };
}
```

**components/RandomnessDisplay.tsx**:
```typescript
'use client';

import { useLastRandomNumber } from '@/hooks/useRandomness';

export function RandomnessDisplay() {
  const { randomNumber, isLoading, isError, refetch } = useLastRandomNumber();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading randomness</div>;

  return (
    <div>
      <h3>Last Random Number</h3>
      <p>{randomNumber || 'No random number yet'}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

#### Write to Contract

**components/RequestRandomness.tsx**:
```typescript
'use client';

import { useContractWrite, useWaitForTransaction } from '@starknet-react/core';
import { RANDOMNESS_CONTRACT_ADDRESS, RANDOMNESS_ABI } from '@/lib/contracts';
import { useState } from 'react';

export function RequestRandomness() {
  const [requestId, setRequestId] = useState<string | null>(null);

  const { writeAsync, data: txHash, isPending } = useContractWrite({
    calls: [
      {
        contractAddress: RANDOMNESS_CONTRACT_ADDRESS,
        entrypoint: 'request_randomness_from_pragma',
        calldata: [],
      },
    ],
  });

  const { isLoading: isWaiting, isError, data: receipt } = useWaitForTransaction({
    hash: txHash,
    watch: true,
  });

  const handleRequest = async () => {
    try {
      const result = await writeAsync();
      console.log('Transaction sent:', result.transaction_hash);

      // Parse events from receipt to get request_id
      // (You'd implement event parsing here)
    } catch (error) {
      console.error('Error requesting randomness:', error);
    }
  };

  return (
    <div>
      <button
        onClick={handleRequest}
        disabled={isPending || isWaiting}
      >
        {isPending && 'Preparing transaction...'}
        {isWaiting && 'Waiting for confirmation...'}
        {!isPending && !isWaiting && 'Request Randomness'}
      </button>

      {txHash && (
        <p>
          Transaction: {txHash.slice(0, 10)}...
          {isWaiting && ' (confirming...)'}
          {receipt && ' (confirmed!)'}
        </p>
      )}

      {isError && <p style={{ color: 'red' }}>Transaction failed</p>}
    </div>
  );
}
```

### 7.6 Event Listening

**hooks/useRandomnessEvents.ts**:
```typescript
import { useEffect, useState } from 'react';
import { useProvider } from '@starknet-react/core';
import { RANDOMNESS_CONTRACT_ADDRESS, RANDOMNESS_ABI } from '@/lib/contracts';
import { Contract } from 'starknet';

interface RandomnessEvent {
  requestId: string;
  randomValue: string;
  blockNumber: number;
}

export function useRandomnessEvents() {
  const [events, setEvents] = useState<RandomnessEvent[]>([]);
  const { provider } = useProvider();

  useEffect(() => {
    if (!provider) return;

    const contract = new Contract(RANDOMNESS_ABI, RANDOMNESS_CONTRACT_ADDRESS, provider);

    // Subscribe to new blocks
    const pollEvents = async () => {
      try {
        // Get recent events (last 100 blocks)
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = currentBlock - 100;

        const eventFilter = {
          from_block: { block_number: fromBlock },
          to_block: 'latest',
          address: RANDOMNESS_CONTRACT_ADDRESS,
          keys: [
            // Event selector for RandomnessReceived
            '0x...' // Calculate hash of event name
          ],
        };

        const eventsList = await provider.getEvents(eventFilter);

        const parsedEvents = eventsList.events.map(event => ({
          requestId: event.data[0],
          randomValue: event.data[1],
          blockNumber: event.block_number,
        }));

        setEvents(parsedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    // Poll every 10 seconds
    const interval = setInterval(pollEvents, 10000);
    pollEvents(); // Initial fetch

    return () => clearInterval(interval);
  }, [provider]);

  return events;
}
```

### 7.7 Type-Safe Contract Calls

Using **abi-wan-kanabi** for type safety:

```typescript
import { Abi } from 'abi-wan-kanabi';

const abi = Abi.from(RANDOMNESS_ABI);

// Type-safe function calls
const { data } = useContractRead({
  functionName: 'get_last_random_number',
  args: [],
  abi,
  address: RANDOMNESS_CONTRACT_ADDRESS,
});

// TypeScript knows data is a felt252/bigint
const number: bigint = data || 0n;
```

### 7.8 Multi-Call Pattern

Execute multiple contract calls in single transaction:

```typescript
const { writeAsync } = useContractWrite({
  calls: [
    // Approve tokens
    {
      contractAddress: TOKEN_ADDRESS,
      entrypoint: 'approve',
      calldata: [GAME_ADDRESS, 100],
    },
    // Enter game
    {
      contractAddress: GAME_ADDRESS,
      entrypoint: 'enter_lottery',
      calldata: [100],
    },
    // Request randomness
    {
      contractAddress: RANDOMNESS_CONTRACT_ADDRESS,
      entrypoint: 'request_randomness_from_pragma',
      calldata: [],
    },
  ],
});
```

### 7.9 Error Handling

```typescript
const { writeAsync, error } = useContractWrite({
  calls: [...],
});

const handleSubmit = async () => {
  try {
    const result = await writeAsync();
    toast.success('Transaction submitted!');
  } catch (err: any) {
    if (err.message.includes('User rejected')) {
      toast.error('Transaction rejected');
    } else if (err.message.includes('Insufficient balance')) {
      toast.error('Insufficient balance');
    } else {
      toast.error('Transaction failed: ' + err.message);
    }
  }
};
```

### 7.10 Complete Example: Dice Game UI

**app/page.tsx**:
```typescript
'use client';

import { ConnectWallet } from '@/components/ConnectWallet';
import { RandomnessDisplay } from '@/components/RandomnessDisplay';
import { RequestRandomness } from '@/components/RequestRandomness';
import { useAccount } from '@starknet-react/core';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Starknet Randomness Demo</h1>

      <ConnectWallet />

      {isConnected && (
        <>
          <RandomnessDisplay />
          <RequestRandomness />
        </>
      )}
    </main>
  );
}
```

### 7.11 Production Best Practices

1. **Environment Variables**:
```typescript
// .env.local
NEXT_PUBLIC_RANDOMNESS_CONTRACT=0x123...
NEXT_PUBLIC_NETWORK=mainnet
```

2. **Loading States**: Always show loading indicators
3. **Error Boundaries**: Catch React errors gracefully
4. **Transaction Feedback**: Show clear status messages
5. **Gas Estimation**: Warn users of high gas costs
6. **Wallet Detection**: Handle missing wallet extensions
7. **Network Switching**: Detect and prompt network changes
8. **Caching**: Use Tanstack Query caching effectively

### 7.12 Integration Resources

- **Starknet React Docs**: https://www.starknet-react.com/docs/getting-started
- **Starknet.js Docs**: https://www.starknetjs.com/
- **Example Projects**: https://github.com/topics/starknet-react
- **Cartridge Docs**: https://docs.cartridge.gg/

---

## 8. Reference Implementations

### 8.1 VRF Oracle Implementations

#### 8.1.1 StarkLink VRF

**GitHub**: https://github.com/StarkLinkVRF/VRF-StarkNet

**Description**: VRF oracle on StarkNet based on IETF vrf-spec-05

**Technical Details**:
- **Cryptographic Suite**: Modified SECP256K1_SHA256_TAI
- **Hash Function**: Keccak (instead of SHA256)
- **Standard**: IETF Internet Research Task Force spec

**Key Files**:
- `contracts/rng_oracle.cairo`: Main oracle contract
- `contracts/vrf_verify.cairo`: VRF verification logic
- `contracts/consumer_example.cairo`: Example consumer contract

**Usage Pattern**:
```cairo
// Consumer contract requests randomness
#[external(v0)]
fn request_random(ref self: ContractState) -> u64 {
    let oracle = IVRFOracleDispatcher { contract_address: self.oracle.read() };
    let request_id = oracle.request_randomness(
        get_contract_address(),  // callback address
        100000,                  // callback gas limit
    );
    request_id
}

// Oracle calls back with randomness
#[external(v0)]
fn fulfill_randomness(ref self: ContractState, request_id: u64, randomness: felt252) {
    // Verify caller is oracle
    assert(get_caller_address() == self.oracle.read(), 'Unauthorized');
    // Use randomness
    self.process_random(randomness);
}
```

**Rust Client**:
- **GitHub**: https://github.com/StarkLinkVRF/vrf-client-starknet-rs
- Fork of vrf-rs with StarkNet support
- Provides off-chain VRF generation and verification

#### 8.1.2 Pragma Oracle

**GitHub**: https://github.com/astraly-labs/pragma-oracle

**Description**: First provable oracle on Starknet, includes VRF

**Key Directories**:
- `pragma-oracle/randomness/`: VRF implementation
- `pragma-oracle/examples/`: Example integrations
- `pragma-lib/`: Client library for contracts

**Features**:
- Price feeds (primary feature)
- Randomness VRF
- Computational oracle capabilities
- Provable data integrity

**VRF Requestor Example**:
```cairo
use pragma_lib::interfaces::{IRandomnessDispatcher, IRandomnessDispatcherTrait};

#[starknet::contract]
mod DiceGame {
    use super::IRandomnessDispatcher;

    #[storage]
    struct Storage {
        pragma_vrf: ContractAddress,
        last_random: felt252,
    }

    #[external(v0)]
    fn roll_dice(ref self: ContractState) -> u64 {
        let randomness = IRandomnessDispatcher {
            contract_address: self.pragma_vrf.read()
        };

        let request_id = randomness.request_randomness_from_pragma(
            callback_address: get_contract_address(),
            callback_fee_limit: 100000,
            publish_delay: 1,
            num_words: 1,
        );

        request_id
    }

    #[external(v0)]
    fn receive_random_words(
        ref self: ContractState,
        requestor_address: ContractAddress,
        request_id: u64,
        random_words: Span<felt252>,
        calldata: Array<felt252>
    ) {
        let random = *random_words[0];
        self.last_random.write(random);

        // Use random number
        let dice_roll = (random % 6) + 1;
        // Process dice roll...
    }
}
```

#### 8.1.3 Reilabs Starknet VRF

**GitHub**: https://github.com/reilabs/starknet-vrf

**Description**: VRF implementation using Cairo hints and Dojo framework

**Key Features**:
- Integrates with Dojo game engine
- Uses Cairo hints for off-chain computation
- Optimized for gaming use cases

**Status**: Research/experimental implementation

### 8.2 Gaming Examples

#### 8.2.1 Kaiji - Poker Game

**GitHub**: https://github.com/Tbelleng/Kaiji

**Description**: Poker game on Starknet using ZK proofs and randomness

**Technical Approach**:
- Each player generates random number using Cairo's randomness
- Numbers used to shuffle deck
- ZK proofs verify fair play
- No trusted dealer needed

**Key Concepts Demonstrated**:
- Multi-party computation
- Deck shuffling algorithm
- Commit-reveal pattern
- Zero-knowledge proofs for game state

**Architecture**:
```
Players → Generate Random Seeds → Combine Seeds → Shuffle Deck
         → ZK Proof of Fair Shuffle → Play Game → Verify Outcomes
```

#### 8.2.2 Dojo Engine Examples

**GitHub**: https://github.com/dojoengine/dojo
**Examples Repo**: https://github.com/AkatsukiLabs/DojoByExample

**Description**: Provable game engine for fully on-chain games

**Notable Games Using Dojo**:
1. **Influence**: Space strategy MMO
2. **Loot Survivor**: Roguelike survival game
3. **Briq**: Creative building game

**Dojo + Randomness Pattern**:
```cairo
// In Dojo world contract
#[dojo::contract]
mod game_actions {
    use cartridge_vrf::{consume_random, Source};

    fn spawn_enemy(world: IWorldDispatcher, player: ContractAddress) {
        // Atomic VRF - no callback needed!
        let random = consume_random(Source::Nonce(get_contract_address()));

        let enemy_type = random % 5;  // 5 enemy types
        let enemy_level = (random / 5) % 10;  // Level 0-9

        // Spawn enemy using Dojo ECS
        set!(world, (
            Enemy {
                player,
                entity_id: world.uuid(),
                enemy_type,
                level: enemy_level,
            }
        ));
    }
}
```

#### 8.2.3 PrediFi - Prediction Protocol

**Description**: Decentralized prediction market on Starknet

**Use of Randomness**:
- Random selection of oracle reporters
- Tiebreaker resolution
- Sampling for fraud detection

**Not Open Source**: Limited public information available

### 8.3 Commit-Reveal Implementations

#### 8.3.1 Starknet Commit-Reveal

**GitHub**: https://github.com/gaetbout/starknet-commit-reveal

**Description**: Simple commit-reveal implementation for Starknet

**Use Cases Demonstrated**:
- Voting systems
- Rock-paper-scissors
- Sealed-bid auctions
- Lottery systems

**Example Contract**:
```cairo
#[starknet::contract]
mod CommitReveal {
    use core::hash::{HashStateTrait, HashStateExTrait};
    use core::poseidon::PoseidonTrait;

    #[storage]
    struct Storage {
        commitments: LegacyMap<ContractAddress, felt252>,
        reveals: LegacyMap<ContractAddress, felt252>,
        commit_block: LegacyMap<ContractAddress, u64>,
    }

    #[external(v0)]
    fn commit(ref self: ContractState, commitment: felt252) {
        let sender = get_caller_address();

        // Store hash of (value + salt)
        self.commitments.write(sender, commitment);
        self.commit_block.write(sender, get_block_number());
    }

    #[external(v0)]
    fn reveal(ref self: ContractState, value: felt252, salt: felt252) {
        let sender = get_caller_address();

        // Must wait at least 1 block
        assert(
            get_block_number() > self.commit_block.read(sender),
            'Must wait one block'
        );

        // Verify commitment
        let hash = PoseidonTrait::new()
            .update(value)
            .update(salt)
            .finalize();

        assert(
            hash == self.commitments.read(sender),
            'Invalid reveal'
        );

        // Store revealed value
        self.reveals.write(sender, value);
    }

    #[external(v0)]
    fn get_combined_randomness(self: @ContractState) -> felt252 {
        // XOR all reveals for combined randomness
        // (Simplified - production needs more participants)
        let player1_reveal = self.reveals.read(player1);
        let player2_reveal = self.reveals.read(player2);
        player1_reveal ^ player2_reveal
    }
}
```

### 8.4 Educational Resources

#### 8.4.1 Starknet by Example

**Website**: https://starknet-by-example.voyager.online/

**Relevant Sections**:
- Applications → Random Number Generator
- Advanced Concepts → Commit-Reveal
- Oracle Interactions → Pragma VRF

**Code Examples**: Fully documented with explanations

#### 8.4.2 Cairo Goldmine

**GitHub**: https://github.com/beautyisourbusiness/cairo-goldmine

**Description**: Comprehensive annotated list of Starknet ecosystem repositories

**Categories**:
- Development tools
- Educational resources
- Smart contract standards
- Gaming frameworks
- Oracle solutions

#### 8.4.3 Awesome Starknet

**GitHub**: https://github.com/keep-starknet-strange/awesome-starknet

**Description**: Curated list of Starknet resources

**Sections**:
- Libraries
- Tools
- Educational content
- DApps
- Infrastructure

### 8.5 Production DApps Using Randomness

#### 8.5.1 Gaming

1. **Influence** (influence.eth)
   - Space strategy MMO
   - Uses Dojo + randomness for procedural generation
   - Production launch in progress

2. **Loot Survivor**
   - Roguelike survival game
   - Random enemy spawns, loot drops
   - Fully on-chain with provable randomness

3. **ZKasino** (Mentioned in research)
   - Casino games on Starknet
   - Uses drand randomness beacon
   - Production status unclear

#### 8.5.2 DeFi

1. **Lottery Protocols**
   - Various lottery implementations
   - Use Pragma VRF for winner selection
   - Example: https://github.com/makerzy/lottery-project

2. **Prediction Markets**
   - Random oracle selection
   - Tiebreaker resolution
   - Sample verification

### 8.6 Testing Examples

**Starknet Foundry Test Suite**:
```cairo
// Full test example from production contract

#[cfg(test)]
mod tests {
    use super::{RandomnessContract, IRandomnessDispatcher};
    use snforge_std::{declare, ContractClassTrait, start_prank, stop_prank};

    fn setup() -> (ContractAddress, ContractAddress) {
        // Deploy mock oracle
        let oracle_class = declare('MockPragmaOracle');
        let oracle = oracle_class.deploy(@array![]).unwrap();

        // Deploy randomness contract
        let contract_class = declare('RandomnessContract');
        let contract = contract_class.deploy(@array![oracle]).unwrap();

        (contract, oracle)
    }

    #[test]
    fn test_request_and_receive() {
        let (contract, oracle) = setup();
        let dispatcher = IRandomnessDispatcher { contract_address: contract };

        // Request randomness
        let request_id = dispatcher.request_random();
        assert(request_id == 0, 'First request should be 0');

        // Simulate oracle callback
        start_prank(CheatTarget::One(contract), oracle);
        dispatcher.receive_random_words(
            contract,
            request_id,
            array![42].span(),
            array![].span()
        );
        stop_prank(CheatTarget::One(contract));

        // Verify result
        let result = dispatcher.get_result(request_id);
        assert(result == 42, 'Result should be 42');
    }

    #[test]
    #[should_panic(expected: ('Unauthorized',))]
    fn test_unauthorized_callback() {
        let (contract, _) = setup();
        let attacker = starknet::contract_address_const::<0x999>();

        start_prank(CheatTarget::One(contract), attacker);
        // Should fail - not oracle
        contract.receive_random_words(...);
    }
}
```

### 8.7 Reference Links Summary

**Official Implementations**:
- StarkLink VRF: https://github.com/StarkLinkVRF/VRF-StarkNet
- Pragma Oracle: https://github.com/astraly-labs/pragma-oracle
- Reilabs VRF: https://github.com/reilabs/starknet-vrf

**Gaming Examples**:
- Kaiji Poker: https://github.com/Tbelleng/Kaiji
- Dojo Engine: https://github.com/dojoengine/dojo
- Dojo Examples: https://github.com/AkatsukiLabs/DojoByExample

**Educational**:
- Starknet by Example: https://starknet-by-example.voyager.online/
- Cairo Goldmine: https://github.com/beautyisourbusiness/cairo-goldmine
- Awesome Starknet: https://github.com/keep-starknet-strange/awesome-starknet
- Commit-Reveal: https://github.com/gaetbout/starknet-commit-reveal

**Standards**:
- OpenZeppelin Cairo: https://github.com/OpenZeppelin/cairo-contracts

---

## 9. VRF Solutions Comparison

### 9.1 Feature Comparison Matrix

| Feature | Chainlink VRF | Pragma VRF | Cartridge VRF | Commit-Reveal | Drand |
|---------|--------------|------------|---------------|---------------|-------|
| **Blockchain Support** | Multi-chain | Starknet | Starknet | Any | Agnostic |
| **Transaction Model** | Async callback | Async callback | Atomic/Sync | Multi-tx | Async |
| **Cryptographic Curve** | SECP256k1 | Curve25519 | Stark curve | N/A | BN254/G2 |
| **Verification** | On-chain proof | On-chain proof | On-chain proof | Hash verify | Signature verify |
| **Trust Model** | Oracle network | Oracle network | Game sequencer | Users | Beacon network |
| **Cost** | LINK tokens | ETH + premium | ETH (optimized) | Gas only | ETH (relay cost) |
| **Speed** | 1-2 blocks | 1+ blocks | Same block | 2+ blocks | Beacon interval |
| **Gaming Optimized** | No | Yes | **Yes** | No | Partial |
| **Manipulation Resistant** | **Excellent** | **Excellent** | **Excellent** | Moderate | **Excellent** |
| **Starknet Native** | No | **Yes** | **Yes** | Yes | Requires bridge |
| **Production Ready** | **Yes** | **Yes** | **Yes** | Yes | Experimental |

### 9.2 Detailed Comparison

#### 9.2.1 Chainlink VRF

**Strengths**:
- Industry-leading, battle-tested solution
- Largest VRF network with many node operators
- Cross-chain compatibility
- Extensive documentation and support
- Multiple layers of verification
- Insurance fund for failures

**Weaknesses**:
- Not native to Starknet (requires bridge/integration)
- Requires LINK token holdings
- Higher costs than alternatives
- Asynchronous (requires waiting for callback)
- May have limited Starknet support in 2025

**Best For**:
- High-value applications (DeFi, NFTs)
- Applications needing maximum decentralization
- Projects already using Chainlink on other chains
- Use cases where cost is not primary concern

**Technical Details**:
- **VRF Version**: v2.5 (Subscription model)
- **Proof System**: EC-VRF using SECP256k1
- **Verification**: On-chain verification of VRF proof
- **Randomness Source**: Node operator's private key + user seed

**Integration Complexity**: Medium-High
- Requires LINK token management
- Subscription setup
- Callback gas estimation
- Cross-chain considerations for Starknet

#### 9.2.2 Pragma VRF

**Strengths**:
- Native Starknet implementation (Cairo)
- First VRF on Starknet
- Based on IETF-recommended Curve25519
- Integrated with Pragma's oracle network
- Pay in ETH (no special tokens needed)
- Well-documented Cairo integration
- Actively maintained by Pragma team

**Weaknesses**:
- Relatively new (launched 2024)
- Smaller operator network than Chainlink
- Asynchronous callback pattern
- Requires contract to hold ETH for fees
- Limited track record compared to Chainlink

**Best For**:
- Starknet-native applications
- Gaming applications needing fair randomness
- DeFi protocols on Starknet
- Projects using other Pragma oracle services
- Cost-conscious applications

**Technical Details**:
- **Curve**: Curve25519 (IETF RFC 9381)
- **Hash Method**: Elligator2
- **Proof System**: VRF proof verified on-chain
- **Fee Structure**: Callback gas + premium
- **Randomness Source**: Pragma oracle private key + contract seed

**Integration Complexity**: Medium
- Add pragma_lib dependency
- Implement callback function
- Fund contract with ETH
- Set appropriate gas limits

**Code Example**:
```cairo
use pragma_lib::interfaces::{IRandomnessDispatcher};

// Request
let request_id = randomness.request_randomness_from_pragma(
    callback_address: get_contract_address(),
    callback_fee_limit: 100000,
    publish_delay: 1,  // Blocks to wait
    num_words: 1,      // Number of random values
);

// Receive (callback)
fn receive_random_words(
    request_id: u64,
    random_words: Span<felt252>,
) {
    // Use randomness
}
```

#### 9.2.3 Cartridge VRF

**Strengths**:
- **Atomic execution** (same transaction!)
- No callback needed
- Optimized for Starknet (Stark curve + Poseidon)
- Gaming-focused design
- Simplest developer experience
- Instant randomness for better UX
- Lower gas costs
- Paymaster integration support
- Dojo-compatible

**Weaknesses**:
- Newer solution (less battle-tested)
- Requires trust in Cartridge sequencer
- Limited to Starknet
- Smaller operator network
- Less decentralized than oracle-based VRF

**Best For**:
- Fully on-chain games
- Real-time applications
- Dojo engine projects
- Applications needing instant feedback
- Cost-sensitive gaming use cases

**Technical Details**:
- **Curve**: Stark curve (native to Starknet)
- **Hash**: Poseidon hash (STARK-optimized)
- **Execution**: Synchronous/atomic
- **Source**: Nonce-based or salt-based
- **Verification**: Automatic on-chain

**Integration Complexity**: Low
- Simple function call
- No callbacks
- No external dependencies
- No separate funding needed

**Code Example**:
```cairo
use cartridge_vrf::{consume_random, Source};

// That's it! Single transaction
fn roll_dice() -> u8 {
    let random = consume_random(
        Source::Nonce(get_contract_address())
    );
    (random % 6 + 1).try_into().unwrap()
}
```

#### 9.2.4 Commit-Reveal

**Strengths**:
- No external dependencies
- No oracle costs
- Fully on-chain
- Simple concept
- Complete control
- No trust in third parties

**Weaknesses**:
- Requires multiple transactions
- Users can abort if unhappy
- Vulnerable to last-actor advantage
- Poor UX (waiting periods)
- Not suitable for single-player
- Requires economic incentives

**Best For**:
- Multi-party games (rock-paper-scissors)
- Voting systems
- Sealed-bid auctions
- Low-stakes applications
- Learning/educational projects

**Technical Details**:
- **Phase 1**: Submit hash(value + salt)
- **Phase 2**: Reveal value + salt
- **Verification**: Check hash matches
- **Combine**: XOR or hash multiple reveals

**Integration Complexity**: Low-Medium
- Implement commit/reveal functions
- Handle timeout mechanisms
- Design incentive structures

**Not Recommended For Production Randomness** in most cases.

#### 9.2.5 Drand

**Strengths**:
- Highly decentralized (League of Entropy)
- Public randomness beacon
- Time-based randomness
- Blockchain-agnostic
- Credible organizations operate nodes
- Open-source
- No cost to consume beacon

**Weaknesses**:
- Requires repeater bot on Starknet
- Beacon interval limits frequency
- Integration complexity
- Less documented for Starknet
- Experimental on Starknet

**Best For**:
- Applications needing public randomness
- Multi-chain applications
- Time-based lottery systems
- Research projects

**Technical Details**:
- **Network**: League of Entropy
- **Beacon**: Publishes every 30 seconds
- **Curve**: BN254 (new beacon), BLS12-381 (legacy)
- **Integration**: Requires repeater bot to relay to Starknet

**Integration Complexity**: High
- Deploy/run repeater bot
- Implement signature verification
- Handle beacon timing

### 9.3 Cost Comparison

**Estimated Costs per Random Request** (2025):

| Solution | Per Request Cost | Notes |
|----------|-----------------|-------|
| Chainlink VRF | $0.10 - $0.50 | LINK tokens + gas |
| Pragma VRF | $0.01 - $0.02 | ETH for callback + premium |
| Cartridge VRF | $0.005 - $0.01 | ETH gas only (atomic) |
| Commit-Reveal | $0.002 - $0.005 | 2x gas for commit+reveal |
| Drand | $0.001 - $0.005 | Gas for verification only |

**Note**: Costs vary with network congestion and ETH/LINK prices.

### 9.4 Security Comparison

**Manipulation Resistance**:

1. **Chainlink VRF**: Highest
   - Multiple node operators
   - Cryptographic proofs
   - Economic incentives
   - Slash conditions
   - Insurance fund

2. **Pragma VRF**: High
   - VRF cryptographic proofs
   - Oracle network
   - Economic incentives
   - Starknet security

3. **Cartridge VRF**: High
   - Cryptographic proofs
   - Relies on sequencer honesty
   - STARK proof verification
   - Smaller trust set

4. **Drand**: Highest
   - Threshold cryptography
   - Distributed trust (League of Entropy)
   - Public verifiability
   - Many independent operators

5. **Commit-Reveal**: Medium-Low
   - Vulnerable to last-actor advantage
   - Users can abort
   - Requires economic incentives
   - Weak for single-player

### 9.5 Developer Experience

**Ease of Integration** (Easiest to Hardest):

1. **Cartridge VRF**: Single function call, no callbacks
2. **Commit-Reveal**: Simple logic, full control
3. **Pragma VRF**: Straightforward Cairo integration
4. **Chainlink VRF**: More complex, cross-chain considerations
5. **Drand**: Requires custom infrastructure

**Documentation Quality**:

1. **Chainlink VRF**: Excellent (most mature)
2. **Pragma VRF**: Good (Cairo-specific docs)
3. **Cartridge VRF**: Good (focused on gaming)
4. **Commit-Reveal**: Examples available
5. **Drand**: Limited Starknet-specific docs

### 9.6 Recommendation by Use Case

**Gaming (Real-time)**:
- **Primary**: Cartridge VRF (atomic, instant)
- **Alternative**: Pragma VRF (if async is acceptable)

**Gaming (Turn-based)**:
- **Primary**: Pragma VRF (proven, cost-effective)
- **Alternative**: Cartridge VRF (faster UX)

**Lottery/Raffles**:
- **Primary**: Pragma VRF (established, fair)
- **Alternative**: Drand (public verifiability)

**NFT Minting**:
- **Primary**: Pragma VRF (Starknet-native)
- **Alternative**: Chainlink (if cross-chain)

**DeFi Protocols**:
- **Primary**: Chainlink VRF (highest security)
- **Alternative**: Pragma VRF (Starknet-optimized)

**Governance/Voting**:
- **Primary**: Drand (public, verifiable)
- **Alternative**: Commit-Reveal (simple)

**Educational/Low-stakes**:
- **Primary**: Commit-Reveal (learning)
- **Alternative**: Pragma VRF (production-like)

### 9.7 Migration Considerations

If building for multiple chains:
- Start with Chainlink VRF (cross-chain)
- Add Starknet-specific optimizations later

If Starknet-only:
- **Gaming**: Cartridge VRF
- **Other**: Pragma VRF
- Avoid Chainlink (unnecessary complexity)

If maximum decentralization needed:
- Chainlink VRF or Drand
- Accept higher costs/complexity

---

## 10. Community Recommendations

### 10.1 Starknet Ecosystem Overview (2025)

#### Market Position

**Developer Growth**:
- Fastest-growing Layer 2 developer community
- 18% growth (Q3 2023 → Q3 2024)
- 4th largest ecosystem in 500-2,000 developer range
- Behind: Aptos, Stellar, Sui

**Ecosystem Growth**:
- 168% project growth in 2024
- 72 projects (Nov 2023) → 193 projects (Nov 2024)
- 121 brand-new dApps and tools added

**Total Value Locked**:
- OpenZeppelin contracts power 55% of Starknet TVL
- Peak: $620M (April 2024)
- Steady growth trajectory

### 10.2 Official Roadmap (2024-2025)

#### Completed Improvements (v0.13.2)

**Performance**:
- Transaction confirmation: <2 seconds
- Fixed L1 costs: 50% reduction
- Network capacity: Expanded significantly
- Gas fees: $0.24 → <$0.001 (ERC20 transfer)

**Developer Experience**:
- Better error handling in contracts
- Improved debugging tools
- Enhanced language server

#### Upcoming (2025)

**Version 0.14.0** (September 2025):
- 6-second block times
- Mempool implementation
- Fee market mechanism
- Distributed sequencer architecture
- Pre-confirmed finality

**Cairo Native** (February 2025):
- Contracts run as native machine code
- Significant throughput increase
- No VM interpretation overhead

**Stwo Prover** (April 2025):
- 1000x more efficient than current prover
- 100x better than any market prover
- Faster finality
- Lower fees

**Kakarot zkEVM** (2025):
- Dual-VM validity rollup
- EVM compatibility on Starknet
- Expands developer pool: 1,500 → 20,000+
- Cairo + Solidity support

### 10.3 Community Best Practices

#### From Starknet Community Forum

**Development Workflow**:
1. Use `starkup` for tool installation (one command)
2. Use `asdf` for version management (flexibility)
3. Use Starknet Foundry for testing (snforge)
4. Use OpenZeppelin contracts (security)
5. Profile gas usage (optimization)
6. Test on Sepolia before mainnet (safety)

**Project Structure**:
```
my-project/
├── src/
│   ├── lib.cairo              # Main library
│   ├── contracts/             # Contract implementations
│   │   ├── randomness.cairo
│   │   └── game.cairo
│   └── interfaces/            # Contract interfaces
│       ├── irandomness.cairo
│       └── igame.cairo
├── tests/
│   ├── test_randomness.cairo
│   └── test_game.cairo
├── scripts/
│   ├── deploy.sh
│   └── interact.sh
├── Scarb.toml                 # Package manifest
└── README.md
```

**Cairo Style Guide**:
- Use snake_case for functions and variables
- Use PascalCase for types and traits
- Group related storage variables
- Document public interfaces
- Use explicit types (avoid auto-inference in contracts)
- Prefer felt252 for addresses and hashes

#### From GitHub Community

**Popular Patterns**:

1. **Component Pattern** (OpenZeppelin style):
```cairo
#[starknet::contract]
mod MyContract {
    use openzeppelin::token::erc20::ERC20Component;
    use openzeppelin::access::ownable::OwnableComponent;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // Embed implementations
    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
}
```

2. **Dispatcher Pattern** (Interface calls):
```cairo
use starknet::ContractAddress;

#[starknet::interface]
trait IMyContract<TContractState> {
    fn do_something(ref self: TContractState, value: u256);
}

// Usage
let dispatcher = IMyContractDispatcher { contract_address };
dispatcher.do_something(123);
```

3. **Events for Indexing** (Off-chain queries):
```cairo
#[event]
#[derive(Drop, starknet::Event)]
enum Event {
    RandomnessRequested: RandomnessRequested,
    RandomnessFulfilled: RandomnessFulfilled,
}

#[derive(Drop, starknet::Event)]
struct RandomnessRequested {
    #[key]
    requester: ContractAddress,
    request_id: u64,
    timestamp: u64,
}
```

### 10.4 Security Recommendations

#### From Auditors and Security Researchers

**Pre-Deployment Checklist**:
- [ ] Use established libraries (OpenZeppelin)
- [ ] Implement access control
- [ ] Add reentrancy guards
- [ ] Validate all inputs
- [ ] Handle errors gracefully
- [ ] Test edge cases thoroughly
- [ ] Profile gas usage
- [ ] Get professional audit (for high-value contracts)

**Common Vulnerabilities in Cairo**:
1. **Arithmetic Overflow**: felt252 wraps silently
2. **Unauthorized Access**: Missing caller checks
3. **Storage Collision**: Incorrect StorePacking
4. **Callback Vulnerabilities**: Unverified oracle callbacks
5. **Reentrancy**: Even in Cairo (via cross-contract calls)

**Mitigation Patterns**:
```cairo
// 1. Check caller
assert(get_caller_address() == self.owner.read(), 'Unauthorized');

// 2. Reentrancy guard
self.locked.write(true);
// ... do work ...
self.locked.write(false);

// 3. Safe math (use u256 when overflow matters)
let safe_value: u256 = value1.into() + value2.into();

// 4. Verify oracle
assert(get_caller_address() == self.oracle.read(), 'Invalid oracle');

// 5. Rate limiting
let last_call = self.last_call.read(caller);
assert(get_block_timestamp() - last_call > COOLDOWN, 'Too soon');
```

### 10.5 Performance Recommendations

#### From Starknet Core Developers

**Optimization Priorities** (Impact vs Effort):

1. **High Impact, Low Effort**:
   - Storage packing (use StorePacking trait)
   - Use events instead of storage for history
   - Minimize storage writes

2. **High Impact, Medium Effort**:
   - Batch operations (multicall)
   - Use appropriate data types (u32 vs felt252)
   - Leverage builtins (poseidon, pedersen)

3. **Medium Impact, High Effort**:
   - Optimize loop iterations
   - Function inlining (manual)
   - Advanced algorithm optimization

**Anti-Patterns to Avoid**:
```cairo
// WRONG - Repeated storage reads
fn bad_function(ref self: ContractState) {
    let x = self.value.read();  // Read 1
    let y = self.value.read();  // Read 2 - wasteful!
}

// CORRECT - Single read
fn good_function(ref self: ContractState) {
    let value = self.value.read();  // Read once
    let x = value;
    let y = value;
}

// WRONG - Unnecessary storage
#[storage]
struct Storage {
    computed_value: u256,  // Can be computed from other storage
}

// CORRECT - Compute on demand
fn get_computed_value(self: @ContractState) -> u256 {
    let a = self.value_a.read();
    let b = self.value_b.read();
    a + b  // No storage needed
}
```

### 10.6 Randomness-Specific Recommendations

#### From Gaming Community

**For Real-Time Games**:
- Use Cartridge VRF (atomic execution)
- Deterministically expand single random value
- Cache randomness when possible
- Batch random requests

**For Turn-Based Games**:
- Use Pragma VRF (proven, cost-effective)
- Request randomness at turn start
- Show loading state during callback
- Handle callback failures gracefully

**For Lotteries**:
- Use Pragma VRF or Chainlink VRF
- Implement drawing ceremony
- Emit events for transparency
- Allow public verification

#### From DeFi Community

**For Protocol Randomness**:
- Prefer Chainlink VRF (highest security)
- Implement rate limiting
- Add admin pause mechanism
- Log all random requests/responses
- Consider insurance/fallbacks

### 10.7 Testing Recommendations

#### From Starknet Foundry Maintainers

**Test Coverage Goals**:
- Unit tests: >90% coverage
- Integration tests: All user flows
- Security tests: All access control
- Gas tests: Profile expensive functions
- Fuzz tests: Random inputs (when applicable)

**Test Organization**:
```cairo
#[cfg(test)]
mod unit_tests {
    // Test individual functions
}

#[cfg(test)]
mod integration_tests {
    // Test full workflows
}

#[cfg(test)]
mod security_tests {
    // Test access control, edge cases
}
```

**Continuous Integration**:
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install tools
        run: curl https://get.starkup.sh | sh && starkup
      - name: Run tests
        run: snforge test --gas-report
      - name: Check formatting
        run: scarb fmt --check
```

### 10.8 Deployment Recommendations

#### From Production DApp Developers

**Deployment Checklist**:
1. Test thoroughly on Sepolia testnet
2. Verify contract source code
3. Document contract addresses
4. Set up monitoring/alerting
5. Prepare emergency pause mechanism
6. Document upgrade process (if upgradeable)
7. Announce to community

**Monitoring**:
- Use Voyager Block Explorer
- Set up custom indexer (Apibara)
- Monitor events in real-time
- Track gas usage trends
- Set up alerts for failures

**Mainnet Launch Strategy**:
1. Deploy on Sepolia (test)
2. Run for 1-2 weeks (stability)
3. Fix any issues
4. Deploy on Mainnet (production)
5. Gradual rollout (limits at first)
6. Monitor closely (first 48 hours)
7. Gradually remove limits

### 10.9 Community Resources

#### Official Resources

**Documentation**:
- Starknet Docs: https://docs.starknet.io/
- Cairo Book: https://book.cairo-lang.org/
- Starknet by Example: https://starknet-by-example.voyager.online/

**Developer Tools**:
- Starknet Foundry: https://foundry-rs.github.io/starknet-foundry/
- Scarb: https://docs.swmansion.com/scarb/
- OpenZeppelin: https://docs.openzeppelin.com/contracts-cairo/

**Forums and Community**:
- Starknet Community Forum: https://community.starknet.io/
- Discord: https://discord.gg/starknet
- Telegram: https://t.me/starknet_community
- Twitter: @Starknet

#### Learning Resources

**Tutorials**:
- Starknet Basecamp: Official tutorial series
- Cairo 101: Interactive learning
- Starknet Workshops: GitHub repositories
- YouTube Channel: Official Starknet channel

**Bootcamps and Courses**:
- Starknet Basecamp (free)
- Community-run workshops
- Hackathon projects (for inspiration)

#### Getting Help

**Best Channels**:
1. **Technical Questions**: Community Forum
2. **Bug Reports**: GitHub Issues
3. **Quick Questions**: Discord #dev-support
4. **General Discussion**: Telegram
5. **Announcements**: Twitter/X

**Response Times**:
- Discord: Minutes to hours
- Forum: Hours to days
- GitHub: Days to weeks

### 10.10 Future Trends (2025-2026)

#### Expected Developments

**Randomness Solutions**:
- More VRF providers entering market
- Native Starknet randomness (research)
- Better integration with gaming engines
- Lower costs through optimization

**Tooling Improvements**:
- Better debugging tools
- Enhanced IDE support
- Improved testing frameworks
- Gas profiling tools

**Language Evolution**:
- More built-in cryptographic primitives
- Better optimization passes
- Enhanced safety features
- Improved ergonomics

**Ecosystem Growth**:
- More gaming dApps
- DeFi protocol expansion
- NFT marketplace growth
- Infrastructure maturation

#### Community Predictions

**Short Term (2025)**:
- Cairo Native adoption (performance boost)
- Stwo prover deployment (cost reduction)
- Kakarot launch (EVM compatibility)
- Continued TVL growth

**Medium Term (2026)**:
- Mainstream gaming adoption
- Cross-chain randomness standards
- Enhanced privacy features
- Institutional DeFi use

### 10.11 Recommended Starting Path

For building a randomness generator on Starknet in 2025:

**Week 1: Setup & Learning**
1. Install development tools (starkup)
2. Read Cairo Book (chapters 1-10)
3. Complete Starknet by Example tutorials
4. Study randomness section specifically

**Week 2: Experimentation**
1. Deploy test contracts on Sepolia
2. Integrate Pragma VRF (simplest production option)
3. Build simple dice game
4. Write comprehensive tests

**Week 3: Optimization**
1. Profile gas usage
2. Implement storage packing
3. Optimize computation
4. Add error handling

**Week 4: Frontend & Production**
1. Build React frontend with starknet-react
2. Test full user flow
3. Deploy to mainnet (if ready)
4. Monitor and iterate

**Recommended Stack**:
- **Backend**: Cairo 2.12+, Scarb, OpenZeppelin contracts
- **Randomness**: Pragma VRF (or Cartridge for gaming)
- **Testing**: Starknet Foundry (snforge)
- **Frontend**: Next.js + starknet-react
- **Deployment**: Sepolia → Mainnet

---

## Conclusion

Building a randomness generator on Starknet in 2025 offers multiple production-ready solutions:

**Best Practices Summary**:
1. Use established VRF solutions (Pragma or Cartridge)
2. Never use block data for randomness
3. Optimize storage usage (StorePacking)
4. Test extensively with Starknet Foundry
5. Follow OpenZeppelin security patterns
6. Monitor gas usage and optimize
7. Integrate frontend with starknet-react
8. Deploy to testnet first

**Recommended Solution**:
- **Gaming**: Cartridge VRF (atomic, instant)
- **General Purpose**: Pragma VRF (proven, cost-effective)
- **High Security**: Chainlink VRF (most established)

**Key Resources**:
- Cairo Book: https://book.cairo-lang.org/
- Pragma VRF: https://docs.pragma.build/
- Starknet Foundry: https://foundry-rs.github.io/starknet-foundry/
- OpenZeppelin: https://docs.openzeppelin.com/contracts-cairo/

The Starknet ecosystem is mature enough for production randomness applications in 2025, with excellent tooling, active community support, and battle-tested implementations.

---

## Appendix: Quick Reference

### Common Commands

```bash
# Installation
curl https://get.starkup.sh | sh
starkup

# Project setup
scarb new my_project
cd my_project
scarb build

# Testing
snforge test
snforge test --gas-report
SNFORGE_BACKTRACE=1 snforge test

# Deployment
sncast declare --contract-name MyContract
sncast deploy --class-hash 0x...

# Interaction
sncast call --contract-address 0x... --function get_value
sncast invoke --contract-address 0x... --function set_value --calldata 42
```

### Useful Links Quick Access

- Starknet Docs: https://docs.starknet.io/
- Cairo Book: https://book.cairo-lang.org/
- Pragma VRF: https://docs.pragma.build/
- Cartridge VRF: https://docs.cartridge.gg/vrf/overview
- Starknet Foundry: https://foundry-rs.github.io/starknet-foundry/
- Starknet React: https://www.starknet-react.com/
- OpenZeppelin: https://github.com/OpenZeppelin/cairo-contracts
- Community Forum: https://community.starknet.io/

### Contract Templates

See reference implementations section for complete examples.

---

**Report Generated**: 2025-11-01
**Research Focus**: Starknet Randomness Generation Best Practices
**Target Audience**: Cairo developers building randomness-dependent applications
**Last Updated**: Based on latest information available as of January 2025
