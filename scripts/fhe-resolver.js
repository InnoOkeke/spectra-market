#!/usr/bin/env node
/**
 * Relayer / Off-chain resolver script (template)
 * Responsibilities:
 *  - Fetch price from CoinGecko (or other API)
 *  - Use Zama Relayer SDK to decrypt aggregated encrypted inputs
 *  - Compute winners and call PredictionMarket.resolveMarket(...) as admin
 *
 * Usage:
 *  - Set environment variables: PROVIDER_URL, ADMIN_PRIVATE_KEY, MARKET_ID, COIN_ID, TARGET_PRICE
 *  - Run: `node scripts/fhe-resolver.js`
 */

const axios = require('axios');
const { ethers } = require('ethers');

async function fetchPrice(coinId = 'bitcoin') {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
  const res = await axios.get(url);
  return res.data?.[coinId]?.usd;
}

async function main() {
  const rpc = process.env.PROVIDER_URL || 'http://127.0.0.1:8545';
  const adminKey = process.env.ADMIN_PRIVATE_KEY;
  const marketId = process.env.MARKET_ID;
  const coinId = process.env.COIN_ID || 'bitcoin';
  const targetPrice = process.env.TARGET_PRICE;

  if (!adminKey) {
    console.error('ADMIN_PRIVATE_KEY not set');
    process.exit(1);
  }
  if (!marketId) {
    console.error('MARKET_ID not set');
    process.exit(1);
  }
  if (!targetPrice) {
    console.error('TARGET_PRICE not set');
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const admin = new ethers.Wallet(adminKey, provider);

  const price = await fetchPrice(coinId);
  console.log(`CoinGecko price for ${coinId}: $${price}`);

  const winningSide = Number(price) >= Number(targetPrice);
  console.log('Winning side (true = yes):', winningSide);

  // NOTE: The code below assumes the relayer SDK and aggregated handles/proofs
  //       are available. In a production relayer you would:
  // 1) Listen to BetPlaced/MarketCreated events to collect handles
  // 2) Use @zama-fhe/relayer-sdk to aggregate encrypted inputs and perform decryption
  // 3) Compute winners and optionally perform on-chain transfers or call resolveMarket with aggregated handles

  // Example on-chain call (PredictionMarket ABI + address required):
  // const predictionAbi = [ ... ]; // load ABI
  // const predictionAddress = process.env.PREDICTION_MARKET_ADDRESS;
  // const contract = new ethers.Contract(predictionAddress, predictionAbi, admin);
  // // aggregatedHandles and inputProof should be produced by the relayer
  // const aggregatedHandles = ethers.constants.HashZero; // placeholder
  // const inputProof = ethers.constants.HashZero; // placeholder
  // const tx = await contract.resolveMarket(marketId, aggregatedHandles, inputProof, winningSide);
  // await tx.wait();

  console.log('Resolver script completed (template). Replace placeholders with relayer aggregation logic.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
