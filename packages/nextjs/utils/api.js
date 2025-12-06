const axios = require('axios');

async function getCoinPrice(coinId = 'bitcoin') {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
  const res = await axios.get(url);
  return res.data?.[coinId]?.usd;
}

async function getOdds(sport = 'soccer_epl') {
  // Placeholder for TheOdds API - requires API key
  const apiKey = process.env.THEODDS_API_KEY || '';
  if (!apiKey) {
    throw new Error('THEODDS_API_KEY not set');
  }
  const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=h2h`;
  const res = await axios.get(url);
  return res.data;
}

module.exports = {
  getCoinPrice,
  getOdds,
};
