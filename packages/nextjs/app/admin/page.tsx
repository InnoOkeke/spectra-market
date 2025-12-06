"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { isAdmin } from "~~/utils/adminConfig";
import { usePredictionMarket } from "~~/hooks/usePredictionMarket";
import deployedContracts from "~~/contracts/deployedContracts";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const userIsAdmin = isAdmin(address);
  const { 
    createMarket: createMarketContract,
    addCategory,
    setPlatformFee,
    withdrawFees,
  } = usePredictionMarket();

  const contractAddress = deployedContracts[11155111].PredictionMarketV2.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV2.abi;

  // Read contract data
  const { data: categoryCount } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getCategoryCount",
  });

  const { data: collectedFees } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getCollectedFees",
  });

  const { data: platformFeePercent } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "platformFeePercent",
  });

  // State
  const [activeTab, setActiveTab] = useState<"markets" | "categories" | "fees">("markets");
  const [marketId, setMarketId] = useState("0");
  const [question, setQuestion] = useState("");
  const [categoryId, setCategoryId] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [targetPrice, setTargetPrice] = useState("40000");
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  // Fee form
  const [newFeePercent, setNewFeePercent] = useState("");

  async function createMarket(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    setCreateSuccess(false);
    
    try {
      const deadlineTimestamp = BigInt(Math.floor(new Date(deadline).getTime() / 1000));
      const targetPriceBigInt = BigInt(targetPrice);
      const categoryIdBigInt = BigInt(categoryId);
      
      const tx = await createMarketContract(question, categoryIdBigInt, deadlineTimestamp, targetPriceBigInt);
      console.log("Market creation tx:", tx);
      
      setCreateSuccess(true);
      setQuestion("");
      setDeadline("");
      setTargetPrice("40000");
      
      setTimeout(() => setCreateSuccess(false), 5000);
    } catch (error) {
      console.error("Error creating market:", error);
      alert(`Failed to create market: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName || !categoryDescription) return;
    setIsCreating(true);
    try {
      await addCategory(categoryName, categoryDescription);
      setCategoryName("");
      setCategoryDescription("");
      alert("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSetPlatformFee(e: React.FormEvent) {
    e.preventDefault();
    if (!newFeePercent) return;
    setIsCreating(true);
    try {
      await setPlatformFee(BigInt(newFeePercent));
      setNewFeePercent("");
      alert("Platform fee updated successfully!");
    } catch (error) {
      console.error("Error setting platform fee:", error);
      alert("Failed to update platform fee");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleWithdrawFees() {
    setIsCreating(true);
    try {
      await withdrawFees();
      alert("Fees withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing fees:", error);
      alert("Failed to withdraw fees");
    } finally {
      setIsCreating(false);
    }
  }

  async function resolveMarket(e: React.FormEvent) {
    e.preventDefault();
    alert(
      `Resolving Market #${marketId}\nTarget Price: $${targetPrice}\nSee scripts/fhe-resolver.js for implementation`,
    );
  }

  // Access control check
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-[#FFD534]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#FFD534]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mb-2">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-6">Please connect your wallet to access the admin dashboard.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#0FA958] to-[#19C37D] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[#FF4D4F]/30 p-8 text-center">
            <div className="w-16 h-16 bg-[#FF4D4F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#FF4D4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-2">This page is restricted to administrators only.</p>
            <p className="text-sm text-gray-500 mb-6">
              Your address: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{address}</code>
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#0FA958] to-[#19C37D] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0FA958] to-[#19C37D] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#111111]">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage markets and resolve outcomes</p>
            </div>
          </div>
          <div className="mt-4 px-4 py-2 bg-[#0FA958]/10 border border-[#0FA958]/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-[#0FA958]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[#0FA958] font-medium">Admin Access Granted</span>
              <span className="text-gray-500">
                • {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Market */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0FA958]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Market
            </h2>

            <form onSubmit={createMarket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Market Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Will BTC reach $100k by 2026?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111]"
                  required
                >
                  {Array.from({ length: Number(categoryCount || 0) }, (_, i) => (
                    <option key={i} value={i}>
                      Category {i}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Target Price (USD)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  placeholder="40000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111]"
                  required
                />
              </div>

              {createSuccess && (
                <div className="p-3 bg-[#0FA958]/10 border border-[#0FA958]/20 rounded-xl text-sm text-[#0FA958] flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Market created successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:from-[#0FA958]/90 hover:to-[#19C37D]/90 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-[#0FA958]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreating ? "Creating..." : "Create Market"}
              </button>
            </form>
          </div>

          {/* Resolve Market */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FF4D4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Resolve Market
            </h2>

            <form onSubmit={resolveMarket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Market ID</label>
                <input
                  type="number"
                  value={marketId}
                  onChange={e => setMarketId(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20 outline-none transition bg-white text-[#111111]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Target Price (USD)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  placeholder="40000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20 outline-none transition bg-white text-[#111111]"
                  required
                />
              </div>

              <div className="p-4 bg-[#FFD534]/10 border border-[#FFD534]/20 rounded-xl">
                <div className="flex gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-[#FFD534] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    This will trigger the FHE resolver script to aggregate encrypted bets and determine winners.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF4D4F] to-[#FF4D4F]/80 hover:from-[#FF4D4F]/90 hover:to-[#FF4D4F]/70 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-[#FF4D4F]/30"
              >
                Resolve Market
              </button>
            </form>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#111111] mb-4">Admin Instructions</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="text-[#0FA958] font-bold">1.</span>
              <p>
                <strong>Create Market:</strong> Define a new prediction market with a question and deadline. Markets
                will be created on-chain and encrypted bets will be accepted.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-[#0FA958] font-bold">2.</span>
              <p>
                <strong>Resolve Market:</strong> After the deadline, use the resolver to fetch external data (CoinGecko
                API) and compute the outcome using FHE aggregation.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-[#0FA958] font-bold">3.</span>
              <p>
                <strong>FHE Resolver:</strong> Run{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">node scripts/fhe-resolver.js</code> to trigger automated
                resolution with encrypted computation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
