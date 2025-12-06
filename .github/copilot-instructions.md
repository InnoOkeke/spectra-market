<!-- Copilot / AI agent instructions for the Zama FHEVM React template -->

# Quick Orientation

- This repository is a pnpm monorepo with three primary packages:
  - `packages/hardhat` — FHEVM-aware Hardhat contracts + deploy scripts
  - `packages/fhevm-sdk` — Zama FHEVM helper SDK (encryption helpers, relayer loader, React hooks)
  - `packages/nextjs` — Next.js + Tailwind frontend (uses `wagmi` + RainbowKit)

# What to know first (big picture)

- Smart contract development and tests live under `packages/hardhat/contracts` and `packages/hardhat/test`.
- Frontend interacts with FHEVM through the local `fhevm-sdk` package. Important hooks are in `packages/fhevm-sdk/src/react`.
- The frontend expects a generated `packages/nextjs/contracts/deployedContracts.ts` (see `scripts/generateTsAbis.ts`).
- Decryption/signing workflow uses `FhevmDecryptionSignature` and `GenericStringStorage` in `packages/fhevm-sdk`.

# Key files & patterns (copyable examples)

- Encryption (builder) helpers: `packages/fhevm-sdk/src/react/useFHEEncryption.ts`
  - Use `instance.createEncryptedInput(contractAddress, userAddress)` to get a `RelayerEncryptedInput`.
  - Call builder methods like `add8`, `add64`, `addBool`, `addAddress` (see `getEncryptionMethod`).
  - Example: `encryptWith(builder => { builder.add8(amount); builder.addBool(selection); })` returns `{ handles, inputProof }`.

- Contract call helpers: `buildParamsFromAbi(enc, abi, functionName)` converts `handles/inputProof` into ABI params.

- Decryption: `packages/fhevm-sdk/src/react/useFHEDecrypt.ts`
  - Use `FhevmDecryptionSignature.loadOrSign(instance, contractAddresses, signer, storage)` to get `privateKey, publicKey, signature`.
  - Call `instance.userDecrypt(requests, sig.privateKey, sig.publicKey, sig.signature, ...)` to decrypt user-visible values.

- Relayer SDK loader / mocks: `packages/fhevm-sdk/src/internal/RelayerSDKLoader.ts` and `internal/mock` — useful for tests.

- Frontend wagmi config and contract helpers:
  - `packages/nextjs/services/web3/wagmiConfig.tsx`
  - `packages/nextjs/utils/helper/contract.ts` and `packages/nextjs/contracts/deployedContracts.ts`

# Developer workflows & commands

- Install deps (root):
  - `pnpm install`

- Start local FHEVM dev chain + deploy + frontend (recommended flow):
  - `pnpm chain`            # starts local Hardhat node (RPC http://127.0.0.1:8545)
  - `pnpm deploy:localhost` # deploys contracts to localhost
  - `pnpm start`            # runs Next.js frontend

- Hardhat maintenance (inside `packages/hardhat`):
  - `npx hardhat vars set MNEMONIC` (sets mnemonic for deployments)
  - `npx hardhat deploy --network localhost` or `--network sepolia`

- Generate/update TypeScript ABI mapping used by the frontend:
  - `node scripts/generateTsAbis.ts` — writes `packages/nextjs/contracts/deployedContracts.ts`

- Tests:
  - Contract tests: run from `packages/hardhat` (see its README)
  - SDK tests: `pnpm --filter fhevm-sdk test` or run the vitest config in the package

# Environment variables (important)

- `MNEMONIC` — deployer mnemonic for Hardhat
- `INFURA_API_KEY` — optional for sepolia RPC
- `NEXT_PUBLIC_ALCHEMY_API_KEY` — required in production frontend (see `packages/nextjs/scaffold.config.ts`)
- `NEXT_PUBLIC_REOWN_APP_ID` — example: use your Reown App ID (do not commit secrets). Provided example value: `f49b90d35d04f6328b7e2560f2d746f1` (set in env during local dev as needed)
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` — optional WalletConnect config

# Project conventions & gotchas

- Monorepo: prefer `pnpm` workspace commands. When adding dependencies, decide whether they're package-scoped (add to package's `package.json`) or workspace-root.
- Contract addresses are injected to frontend via `deployedContracts.ts` — update via `scripts/generateTsAbis.ts` after deployment.
- FHE operations are performed client-side via the `fhevm-sdk`. Do not reimplement cryptographic logic; reuse `createEncryptedInput`, `input.encrypt`, and `instance.userDecrypt`.
- Decryption signatures are cached using `GenericStringStorage` — tests and UI rely on `FhevmDecryptionSignature.loadOrSign` behavior.

## Solidity patterns & imports

- The Hardhat package already depends on Zama/FHEVM Solidity helpers (`@fhevm/solidity`, `@zama-fhe/oracle-solidity`, `encrypted-types`). When writing contracts, import the FHE types and helpers and use encrypted types for on-chain encrypted storage.
- Example imports and type usage (adapt to exact package path if different):
  - `import "@fhevm/solidity/EncryptedTypes.sol";` (or the package-provided path)
  - Use encrypted types in your contract signature and storage, e.g. `euint256`, `euint8`, `eaddress`, `ebool`.
  - Example snippet:
    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.17;
    import "@fhevm/solidity/EncryptedTypes.sol";

    contract Example {
      // store an encrypted 64-bit value
      euint64 public encryptedTotal;
    }
    ```

 - Tests and migrations should use the Hardhat plugin `@fhevm/hardhat-plugin` already listed in `packages/hardhat/package.json`.

# Integration points external agents should know

- Zama Relayer SDK: package references `@zama-fhe/relayer-sdk/web` in `useFHEEncryption.ts`.
- Off-chain resolver / relayer scripts should live under `scripts/` or `packages/fhevm-sdk/scripts/` and must:
  - Fetch external price/outcome data (CoinGecko or Odds APIs)
  - Use the Relayer SDK to decrypt aggregated encrypted inputs
  - Call on-chain `resolveMarket(...)` as the admin wallet

# Helpful code examples for an AI agent

- Encrypt + call pattern (pseudocode):
  - `const enc = await encryptWith(builder => { builder.add64(amount); builder.addBool(choice); });`
  - `const params = buildParamsFromAbi(enc, contractAbi, 'placeEncryptedBet');`
  - `contract.connect(signer).placeEncryptedBet(...params)`

- Decrypt pattern (pseudocode):
  - `const sig = await FhevmDecryptionSignature.loadOrSign(instance, [contractAddress], signer, storage)`
  - `const results = await instance.userDecrypt(requests, sig.privateKey, sig.publicKey, sig.signature, ...)`

# When editing files, follow these rules

- Keep SDK cryptographic helpers in `packages/fhevm-sdk` and UI changes in `packages/nextjs`.
- Update `scripts/generateTsAbis.ts` whenever contract ABIs/addresses change so the frontend stays in sync.
- Do not commit private keys or API secrets. Use environment variables and `.env.local` for Next.js local dev.

# If you need more context

- Look through `packages/fhevm-sdk/src/react/*` first (concrete helpers and hooks).
- If you need contract examples, inspect `packages/hardhat/contracts/FHECounter.sol` and `packages/hardhat/deploy` scripts.

If anything above is unclear or you'd like the instructions extended (example PR templates, automated checks, or additional API wiring hints for Reown/CoinGecko/Odds), tell me which area to expand.
