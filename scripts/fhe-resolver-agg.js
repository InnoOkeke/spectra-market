#!/usr/bin/env node
/**
 * Relayer aggregation + decryption example (template)
 * - Collects `BetPlaced` events from the PredictionMarket contract
 * - Aggregates encrypted handles (placeholder)
 * - Decrypts aggregated handles (placeholder)
 * - Calls `resolveMarket` on-chain with aggregated handles + proof
 *
 * NOTE: This file contains placeholders where the official `@zama-fhe/relayer-sdk`
 * API must be used. The exact function names depend on the SDK version.
 * See: https://docs.zama.ai/protocol/relayer-sdk-guides/
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  const rpc = process.env.PROVIDER_URL || 'http://127.0.0.1:8545';
  const adminKey = process.env.ADMIN_PRIVATE_KEY;
  const predictionAddress = process.env.PREDICTION_MARKET_ADDRESS || '';
  const marketId = process.env.MARKET_ID;

  if (!adminKey) throw new Error('ADMIN_PRIVATE_KEY not set');
  if (!predictionAddress) throw new Error('PREDICTION_MARKET_ADDRESS not set');
  if (!marketId) throw new Error('MARKET_ID not set');

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const admin = new ethers.Wallet(adminKey, provider);

  // Load ABI from frontend-deployedContracts (if present) to avoid duplication
  let abi = null;
  try {
    const deployed = require('../packages/nextjs/contracts/deployedContracts').default;
    const local = deployed[31337] || deployed[Object.keys(deployed)[0]];
    abi = local?.PredictionMarket?.abi || null;
  } catch (e) {
    // fallback: read local ABI file if exists
    const guess = path.join(__dirname, '..', 'packages', 'hardhat', 'artifacts', 'contracts', 'PredictionMarket.sol', 'PredictionMarket.json');
    if (fs.existsSync(guess)) {
      const json = JSON.parse(fs.readFileSync(guess, 'utf8'));
      abi = json.abi;
    }
  }

  if (!abi) throw new Error('PredictionMarket ABI not found; run `pnpm deploy:localhost` or update deployedContracts.ts');

  const contract = new ethers.Contract(predictionAddress, abi, provider);

  // Fetch BetPlaced events for the market
  const filter = contract.filters.BetPlaced(Number(marketId));
  const events = await contract.queryFilter(filter, 0, 'latest');

  if (!events || events.length === 0) {
    console.log('No bets found for market', marketId);
  }

  // Collect encrypted handles and proofs
  const handles = events.map(ev => ev.args?.handles).filter(Boolean);
  const proofs = events.map(ev => ev.args?.inputProof).filter(Boolean);

  console.log(`Found ${handles.length} encrypted bet handles`);

  // === AGGREGATION (SDK integration point) ===
  // The Zama relayer SDK should be used here to aggregate the encrypted inputs.
  // Pseudocode (replace with actual SDK calls):
  // const { Relayer } = require('@zama-fhe/relayer-sdk');
  // const relayer = new Relayer({ /* config */ });
  // const aggregated = await relayer.aggregate(handles, proofs);
  // const aggregatedHandles = aggregated.handles;
  // const aggregatedProof = aggregated.proof;

  let aggregatedHandles = ethers.constants.HashZero;
  let aggregatedProof = ethers.constants.HashZero;

  try {
    const RelayerSDK = require('@zama-fhe/relayer-sdk');
    console.log('Loaded @zama-fhe/relayer-sdk:', Object.keys(RelayerSDK));

    // Try common entry points - adapt these to the SDK's real API
    if (typeof RelayerSDK.aggregateEncryptedInputs === 'function') {
      const agg = await RelayerSDK.aggregateEncryptedInputs(handles, proofs);
      aggregatedHandles = agg.handles || aggregatedHandles;
      aggregatedProof = agg.proof || aggregatedProof;
    } else if (RelayerSDK.Relayer && typeof RelayerSDK.Relayer.aggregate === 'function') {
      const rel = new RelayerSDK.Relayer();
      const agg = await rel.aggregate(handles, proofs);
      aggregatedHandles = agg.handles || aggregatedHandles;
      aggregatedProof = agg.proof || aggregatedProof;
    } else {
      console.warn('Relayer SDK loaded but expected aggregation method not found. Please wire aggregation per SDK docs.');
    }
  } catch (e) {
    console.warn('Could not load @zama-fhe/relayer-sdk (or method unsupported). Skipping aggregation step.');
    console.warn(e?.message || e);
  }

  console.log('Aggregated handles:', aggregatedHandles);
  console.log('Aggregated proof:', aggregatedProof);

  // === DECRYPTION (SDK integration point) ===
  // Decrypt aggregatedHandles with relayer private key if needed to compute winners.
  // Pseudocode:
  // const decrypted = await relayer.decryptAggregate(aggregatedHandles, privateKey);
  // compute winners from decrypted data

  // For now, compute a dummy winning side (you should derive from decrypted values)
  const winningSide = true; // replace with actual computation

  // Call resolveMarket on-chain as admin with aggregated handles/proof
  const tx = await contract.connect(admin).resolveMarket(Number(marketId), aggregatedHandles, aggregatedProof, winningSide);
  console.log('resolveMarket tx hash:', tx.hash);
  await tx.wait();
  console.log('Market resolved on-chain');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
