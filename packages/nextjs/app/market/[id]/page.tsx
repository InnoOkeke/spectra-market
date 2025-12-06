"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useFheHelpers } from '~~/utils/fhe';
import { fetchUpcomingSportsEvents, getSportIcon } from '~~/utils/sportsApi';

interface MarketData {
  id: string | number;
  question: string;
  deadline: string;
  volume: string;
  participants: number;
  category?: string;
  sport?: string;
  homeTeam?: string;
  awayTeam?: string;
}

// Generate static paths for all markets (for static export)
export function generateStaticParams() {
  // Pre-generate paths for crypto markets (0-2) and common sports market IDs
  const marketIds = [
    '0', '1', '2', // Crypto markets
    'sport-1', 'sport-2', 'sport-3', 'sport-4', 'sport-5', // Sports markets
    'sport-6', 'sport-7', 'sport-8', 'sport-9', 'sport-10'
  ];
  
  return marketIds.map((id) => ({ id }));
}

export default function MarketDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('0.01');
  const [side, setSide] = useState('yes');
  const [instance, setInstance] = useState<any>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);

  useEffect(() => {
    // Access window only on client side
    if (typeof window !== 'undefined') {
      setInstance((window as any).__FHEVM_INSTANCE);
    }

    // Load market data based on ID
    async function loadMarketData() {
      // Crypto markets
      const cryptoMarkets: MarketData[] = [
        { id: '0', question: 'Will BTC be >= $40k on 2026-01-01?', deadline: '2026-01-01', volume: '125.5 ETH', participants: 234, category: 'Crypto' },
        { id: '1', question: 'Will ETH reach $3000 by end of Q1 2026?', deadline: '2026-03-31', volume: '89.2 ETH', participants: 156, category: 'Crypto' },
        { id: '2', question: 'Will S&P 500 exceed 5000 points in 2026?', deadline: '2026-12-31', volume: '203.8 ETH', participants: 421, category: 'Finance' },
      ];

      // Check if it's a crypto market
      let market = cryptoMarkets.find(m => m.id.toString() === id);

      // If not found, check sports markets
      if (!market && id.startsWith('sport-')) {
        const sportsMarkets = await fetchUpcomingSportsEvents();
        market = sportsMarkets.find(m => m.id === id);
      }

      setMarketData(market || cryptoMarkets[0]); // Fallback to first market if not found
    }

    loadMarketData();
  }, [id]);

  const { encryptBet } = useFheHelpers({ instance, signer: undefined, contractAddress: undefined as any });

  async function placeBet(e: React.FormEvent) {
    e.preventDefault();
    
    // Check wallet connection
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For demo purposes, simulate bet placement
      // In production, this would:
      // 1. Encrypt the bet data using Zama FHEVM
      // 2. Call the smart contract's placeEncryptedBet function
      // 3. Wait for transaction confirmation
      
      console.log('Placing bet:', {
        marketId: id,
        amount: amount,
        side: side,
        address: address
      });

      // Simulate encryption and contract call
      if (encryptBet) {
        const enc = await encryptBet((builder: any) => {
          builder.add64(BigInt(Math.floor(Number(amount) * 1e18)).toString());
          builder.addBool(side === 'yes');
        });
        console.log('Encrypted payload:', enc);
      }

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBetPlaced(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setBetPlaced(false);
        setAmount('0.01');
      }, 3000);
      
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!marketData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-8 flex items-center justify-center">
        <div className="text-gray-600">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Market Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {marketData.sport && (
                  <span className="px-3 py-1 bg-[#FFD534]/20 text-[#111111] rounded-full text-sm font-medium border border-[#FFD534]/30">
                    {getSportIcon(marketData.sport)} {marketData.sport}
                  </span>
                )}
                {marketData.category && (
                  <span className="px-3 py-1 bg-[#0FA958]/20 text-[#0FA958] rounded-full text-sm font-medium border border-[#0FA958]/30">
                    {marketData.category}
                  </span>
                )}
                <span className="px-3 py-1 bg-[#19C37D]/20 text-[#19C37D] rounded-full text-sm font-medium border border-[#19C37D]/30">
                  Active
                </span>
                <span className="text-sm text-gray-500">Market #{id}</span>
              </div>
              <h1 className="text-3xl font-bold text-[#111111] mb-2">
                {marketData.question}
              </h1>
              {marketData.homeTeam && marketData.awayTeam && (
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-lg font-semibold text-[#111111]">
                    {marketData.homeTeam}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-lg font-semibold text-[#111111]">
                    {marketData.awayTeam}
                  </span>
                </div>
              )}
              <p className="text-gray-600">
                Market closes on <span className="font-semibold">{marketData.deadline}</span>
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Volume</div>
              <div className="text-2xl font-bold text-[#111111]">{marketData.volume}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Participants</div>
              <div className="text-2xl font-bold text-[#111111]">{marketData.participants}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Your Position</div>
              <div className="text-2xl font-bold text-[#0FA958]">🔐 Encrypted</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Place Bet Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#111111] mb-4">Place Your Bet</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your bet will be encrypted and remain private until market resolution.
            </p>

            <form onSubmit={placeBet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">
                  Amount (ETH)
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  disabled={isSubmitting || !isConnected}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">
                  Your Prediction
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSide('yes')}
                    disabled={isSubmitting || !isConnected}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      side === 'yes'
                        ? 'bg-[#0FA958] text-white shadow-lg shadow-[#0FA958]/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide('no')}
                    disabled={isSubmitting || !isConnected}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      side === 'no'
                        ? 'bg-[#FF4D4F] text-white shadow-lg shadow-[#FF4D4F]/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {!isConnected && (
                <div className="p-4 bg-[#FFD534]/10 border border-[#FFD534]/20 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-[#FFD534]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Please connect your wallet to place a bet</span>
                  </div>
                </div>
              )}

              {betPlaced && (
                <div className="p-4 bg-[#0FA958]/10 border border-[#0FA958]/20 rounded-xl">
                  <div className="flex items-center gap-2 text-[#0FA958]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Bet placed successfully!</span>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting || !isConnected}
                  className="w-full bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:from-[#0FA958]/90 hover:to-[#19C37D]/90 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-[#0FA958]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    '🔐 Place Encrypted Bet'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Market Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#111111] mb-4">How It Works</h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#0FA958]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0FA958] font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#111111] mb-1">Choose Your Side</h3>
                  <p className="text-sm text-gray-600">
                    Select Yes or No and enter your bet amount.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#0FA958]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0FA958] font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#111111] mb-1">Encrypted Submission</h3>
                  <p className="text-sm text-gray-600">
                    Your bet is encrypted using Zama FHEVM. Nobody can see your position.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#0FA958]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0FA958] font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#111111] mb-1">Market Resolution</h3>
                  <p className="text-sm text-gray-600">
                    After the deadline, the market resolves and winners are paid out automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-[#0FA958]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Your bets are fully encrypted and private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
