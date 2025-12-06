"use client";

import { use, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useFhevm } from "@fhevm-sdk";
import { useFheHelpers } from "~~/utils/fhe";
import deployedContracts from "~~/contracts/deployedContracts";
import { usePredictionMarket } from "~~/hooks/usePredictionMarket";
import { useMarketBets, useUserBet } from "~~/hooks/useMarketBets";
import { useMarketPoolInfo } from "~~/hooks/useMarketPoolInfo";
import { toHex, formatEther } from "viem";
import { useWagmiEthers } from "~~/hooks/wagmi/useWagmiEthers";
import { useState } from "react";

interface MarketData {
  id: string | number;
  question: string;
  deadline: string;
  volume: string;
  participants: number;
  category: string;
  sport?: string;
  homeTeam?: string;
  awayTeam?: string;
}

export default function MarketDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address, isConnected, chain } = useAccount();
  const [amount, setAmount] = useState("0.001");
  const [side, setSide] = useState("yes");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  
  const { placeBet: placeBetContract, getMarketInfo, claimWinnings } = usePredictionMarket();
  const { bets } = useMarketBets(parseInt(id));
  const { userBet } = useUserBet(parseInt(id), address);
  const { poolInfo } = useMarketPoolInfo(parseInt(id));
  
  // Get PredictionMarketV2 contract address from deployed contracts
  const contractAddress = deployedContracts[11155111]?.PredictionMarketV2?.address as `0x${string}` | undefined;
  
  // Use the wagmi hook properly at the top level
  const marketInfo = getMarketInfo();
  const { data: contractMarketData, isLoading: isMarketLoading } = useReadContract({
    address: marketInfo.address,
    abi: marketInfo.abi,
    functionName: "getMarket",
    args: id && !isNaN(parseInt(id)) ? [BigInt(parseInt(id))] : undefined,
    query: {
      enabled: !!id && !isNaN(parseInt(id)) && !!marketInfo.address && !!marketInfo.abi,
      staleTime: 60000, // Cache for 1 minute
    },
  });
  
  // Initialize FHEVM
  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return (window as any).ethereum;
  }, []);

  const { instance } = useFhevm({
    provider,
    chainId: chain?.id || 11155111, // Default to Sepolia
  });
  
  const { ethersSigner } = useWagmiEthers();
  const { encryptBet } = useFheHelpers({ instance, signer: ethersSigner, contractAddress });

  // Compute market data directly from hooks instead of separate useEffect
  const marketData = useMemo(() => {
    const marketId = parseInt(id);
    if (isNaN(marketId)) return null;

    if (!contractMarketData || !Array.isArray(contractMarketData)) return null;

    const [question, categoryId, deadline, creator, resolved, winningSide, targetPrice] = contractMarketData as [
      string,
      bigint,
      bigint,
      string,
      boolean,
      boolean,
      bigint,
    ];

    const participantCount = poolInfo ? Number(poolInfo.participantCount) : 0;
    const totalBets = poolInfo ? Number(poolInfo.totalYesBets + poolInfo.totalNoBets) : 0;

    return {
      id: marketId,
      question,
      deadline: new Date(Number(deadline) * 1000).toLocaleDateString(),
      volume: totalBets > 0 ? `${totalBets} bet${totalBets !== 1 ? 's' : ''}` : "No bets yet",
      participants: participantCount,
      category: question.includes("BTC") || question.includes("ETH") ? "Crypto" : "Finance",
    };
  }, [id, contractMarketData, poolInfo]);

  async function placeBet(e: React.FormEvent) {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    if (!contractAddress) {
      alert("Contract address not found. Please check network.");
      return;
    }

    setIsSubmitting(true);
    setLoadingStep("Initializing encryption...");

    try {
      // Wait for FHEVM instance and signer if not ready
      if (!instance || !ethersSigner) {
        alert("Encryption system is initializing. Please wait a moment and try again.");
        setIsSubmitting(false);
        setLoadingStep("");
        return;
      }

      if (!encryptBet || !placeBetContract) {
        throw new Error("Missing encryption or contract dependencies");
      }

      // Only encrypt the amount, side is public
      setLoadingStep("Encrypting bet amount...");
      const enc = await encryptBet((builder: any) => {
        builder.add64(BigInt(Math.floor(Number(amount) * 1e18)));
      });
      
      if (!enc || !enc.handles || !enc.inputProof) {
        throw new Error("Encryption failed");
      }

      console.log("Encrypted data:", {
        handleLength: enc.handles[0].length,
        inputProofLength: enc.inputProof.length,
        handleHex: toHex(enc.handles[0]),
        inputProofHex: toHex(enc.inputProof),
      });

      const marketId = BigInt(id);
      const betSide = side === "yes";
      const betValue = BigInt(Math.floor(Number(amount) * 1e18));
      
      // Send the encrypted data as bytes (not bytes32)
      setLoadingStep("Waiting for wallet confirmation...");
      await placeBetContract(
        marketId,
        toHex(enc.handles[0]) as `0x${string}`,
        toHex(enc.inputProof) as `0x${string}`,
        betSide,
        betValue
      );

      setLoadingStep("Transaction confirmed!");
      setBetPlaced(true);
      setTimeout(() => {
        setBetPlaced(false);
        setAmount("0.001");
        setLoadingStep("");
      }, 3000);
    } catch (error) {
      console.error("Bet placement error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to place bet: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setLoadingStep("");
    }
  }

  async function handleClaimWinnings() {
    if (!marketData || !userBet?.exists) return;
    
    setIsSubmitting(true);
    try {
      const marketId = BigInt(id);
      await claimWinnings(marketId);
      alert("Winnings claimed successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to claim winnings: ${errorMessage}`);
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
                <span className="px-3 py-1 bg-[#0FA958]/20 text-[#0FA958] rounded-full text-sm font-medium border border-[#0FA958]/30">
                  {marketData.category}
                </span>
                <span className="px-3 py-1 bg-[#19C37D]/20 text-[#19C37D] rounded-full text-sm font-medium border border-[#19C37D]/30">
                  Active
                </span>
                <span className="text-sm text-gray-500">Market #{id}</span>
              </div>
              <h1 className="text-3xl font-bold text-[#111111] mb-2">{marketData.question}</h1>
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
                <label className="block text-sm font-medium text-[#111111] mb-2">Amount (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={isSubmitting || !isConnected}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Your Prediction</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSide("yes")}
                    disabled={isSubmitting || !isConnected}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      side === "yes"
                        ? "bg-[#0FA958] text-white shadow-lg shadow-[#0FA958]/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide("no")}
                    disabled={isSubmitting || !isConnected}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      side === "no"
                        ? "bg-[#FF4D4F] text-white shadow-lg shadow-[#FF4D4F]/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>Please connect your wallet to place a bet</span>
                  </div>
                </div>
              )}
              
              {isConnected && (!instance || !ethersSigner) && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Initializing encryption system... Please wait.</span>
                  </div>
                </div>
              )}

              {betPlaced && (
                <div className="p-4 bg-[#0FA958]/10 border border-[#0FA958]/20 rounded-xl">
                  <div className="flex items-center gap-2 text-[#0FA958]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">Bet placed successfully!</span>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !isConnected}
                  className="w-full bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:from-[#0FA958]/90 hover:to-[#19C37D]/90 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-[#0FA958]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {loadingStep || "Processing..."}
                    </span>
                  ) : !isConnected ? (
                    "Connect Wallet to Bet"
                  ) : (
                    "🔐 Place Encrypted Bet"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* User Bet Status & Claim */}
          {userBet?.exists && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[#111111] mb-4">Your Bet</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold">{formatEther(userBet.amount)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Side:</span>
                  <span className={`font-bold ${userBet.side ? 'text-green-600' : 'text-red-600'}`}>
                    {userBet.side ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-bold">
                    {userBet.claimed ? '✓ Claimed' : 'Pending'}
                  </span>
                </div>
                
                {marketData && contractMarketData && Array.isArray(contractMarketData) && contractMarketData[3] && !userBet.claimed && userBet.side === contractMarketData[4] && (
                  <button
                    onClick={handleClaimWinnings}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Claiming...' : '🎉 Claim Winnings'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pool Statistics */}
          {poolInfo && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[#111111] mb-4">Pool Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pool:</span>
                  <span className="font-bold">
                    {formatEther(poolInfo.totalYesAmount + poolInfo.totalNoAmount)} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">YES Pool:</span>
                  <span className="font-bold text-green-600">
                    {formatEther(poolInfo.totalYesAmount)} ETH ({poolInfo.totalYesBets.toString()} bets)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NO Pool:</span>
                  <span className="font-bold text-red-600">
                    {formatEther(poolInfo.totalNoAmount)} ETH ({poolInfo.totalNoBets.toString()} bets)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-bold">{poolInfo.participantCount.toString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bet List */}
          {bets && bets.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:col-span-2">
              <h2 className="text-xl font-bold text-[#111111] mb-4">Recent Bets ({bets.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bets.slice(0, 10).map((bet, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {bet.bettor.slice(0, 6)}...{bet.bettor.slice(-4)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        bet.side ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {bet.side ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatEther(bet.amount)} ETH</div>
                      <div className="text-xs text-gray-500">
                        {new Date(Number(bet.timestamp) * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  <p className="text-sm text-gray-600">Select Yes or No and enter your bet amount.</p>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
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
