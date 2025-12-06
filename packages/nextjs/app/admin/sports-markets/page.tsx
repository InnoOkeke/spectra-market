"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { isAdmin } from "~~/utils/adminConfig";
import { usePredictionMarket } from "~~/hooks/usePredictionMarket";
import { fetchUpcomingSportsEvents, type SportsMarket, getSportIcon } from "~~/utils/sportsApi";
import { 
  getSportsMarketMappings, 
  saveSportsMarketMapping, 
  isSportsMarketCreated,
  getOnChainMarketId 
} from "~~/utils/sportsMarketMapping";

export default function SportsMarketsAdminPage() {
  const { address, isConnected } = useAccount();
  const userIsAdmin = isAdmin(address);
  const { createMarket: createMarketContract, marketCount } = usePredictionMarket();

  const [sportsEvents, setSportsEvents] = useState<SportsMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingMarkets, setCreatingMarkets] = useState<Set<string>>(new Set());
  const [createdMarkets, setCreatedMarkets] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadSportsEvents();
    loadExistingMappings();
  }, []);

  function loadExistingMappings() {
    const mappings = getSportsMarketMappings();
    const map = new Map<string, number>();
    mappings.forEach(m => {
      map.set(m.sportsEventId, m.onChainMarketId);
    });
    setCreatedMarkets(map);
  }

  async function loadSportsEvents() {
    setIsLoading(true);
    try {
      const events = await fetchUpcomingSportsEvents();
      setSportsEvents(events);
    } catch (error) {
      console.error("Error loading sports events:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createSportsMarket(event: SportsMarket) {
    if (creatingMarkets.has(event.id) || isSportsMarketCreated(event.id)) {
      alert("This sports market has already been created!");
      return;
    }

    setCreatingMarkets(prev => new Set(prev).add(event.id));

    try {
      // Convert deadline to timestamp
      const deadlineDate = new Date(event.deadline);
      const deadlineTimestamp = BigInt(Math.floor(deadlineDate.getTime() / 1000));

      // Sports markets use category 2 (Sports)
      const categoryId = BigInt(2);
      
      // For sports markets, we don't use target price in the traditional sense
      // We can use it to store the event type or leave it as 0
      const targetPrice = BigInt(0);

      const tx = await createMarketContract(event.question, categoryId, deadlineTimestamp, targetPrice);
      console.log("Sports market creation tx:", tx);

      // Get the current market count to determine the new market ID
      // The new market ID will be the current count (0-indexed)
      const newMarketId = Number(marketCount || 0);
      
      // Save the mapping
      saveSportsMarketMapping({
        sportsEventId: event.id,
        onChainMarketId: newMarketId,
        question: event.question,
        sport: event.sport,
        homeTeam: event.homeTeam,
        awayTeam: event.awayTeam,
        deadline: event.deadline,
        createdAt: Date.now(),
      });
      
      setCreatedMarkets(prev => new Map(prev).set(event.id, newMarketId));
      
      alert(`Sports market created successfully!\nMarket ID: ${newMarketId}\n${event.question}`);
    } catch (error) {
      console.error("Error creating sports market:", error);
      alert(`Failed to create market: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setCreatingMarkets(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  }

  async function createAllSportsMarkets() {
    const unCreated = sportsEvents.filter(event => !createdMarkets.has(event.id));
    
    if (unCreated.length === 0) {
      alert("All sports events have already been created as markets!");
      return;
    }

    if (!confirm(`Create ${unCreated.length} sports markets on-chain?`)) return;

    for (const event of unCreated) {
      await createSportsMarket(event);
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Access control
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
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
            <h1 className="text-2xl font-bold text-[#111111] mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#111111]">⚽ Sports Markets Admin</h1>
              <p className="text-gray-600 mt-2">Create on-chain markets from upcoming sports events</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              ← Back to Admin
            </Link>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How Sports Markets Work</p>
                <p>
                  Sports events are fetched from external APIs. You can create on-chain prediction markets for these events.
                  Each market will have encrypted bets and automatic settlement based on the outcome.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={loadSportsEvents}
            disabled={isLoading}
            className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "🔄 Refresh Events"}
          </button>
          <button
            onClick={createAllSportsMarkets}
            disabled={isLoading || sportsEvents.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:opacity-90 text-white rounded-xl font-semibold transition disabled:opacity-50"
          >
            ⚡ Create All Markets
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Available Events</div>
            <div className="text-2xl font-bold text-[#111111]">{sportsEvents.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Created Markets</div>
            <div className="text-2xl font-bold text-[#0FA958]">{createdMarkets.size}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-[#FFD534]">{sportsEvents.length - createdMarkets.size}</div>
          </div>
        </div>

        {/* Sports Events List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#0FA958] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sports events...</p>
            </div>
          ) : sportsEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No sports events available</p>
            </div>
          ) : (
            sportsEvents.map(event => {
              const isCreated = createdMarkets.has(event.id);
              const isCreating = creatingMarkets.has(event.id);
              const marketId = createdMarkets.get(event.id);

              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-xl border p-6 transition ${
                    isCreated ? "border-[#0FA958] bg-[#0FA958]/5" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-[#FFD534]/20 text-[#111111] rounded-full text-sm font-medium border border-[#FFD534]/30">
                          {getSportIcon(event.sport)} {event.sport}
                        </span>
                        {isCreated && (
                          <span className="px-3 py-1 bg-[#0FA958]/20 text-[#0FA958] rounded-full text-sm font-medium border border-[#0FA958]/30">
                            ✅ Created #{marketId}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-[#111111] mb-2">{event.question}</h3>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-gray-100 rounded-lg font-semibold text-[#111111]">
                          {event.homeTeam}
                        </span>
                        <span className="text-gray-400">vs</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg font-semibold text-[#111111]">
                          {event.awayTeam}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Deadline: {event.deadline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {isCreated ? (
                        <Link
                          href={`/market/${marketId}`}
                          className="px-4 py-2 bg-[#0FA958] hover:bg-[#0FA958]/90 text-white rounded-xl font-medium transition text-center"
                        >
                          View Market
                        </Link>
                      ) : (
                        <button
                          onClick={() => createSportsMarket(event)}
                          disabled={isCreating}
                          className="px-4 py-2 bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:opacity-90 text-white rounded-xl font-medium transition disabled:opacity-50 whitespace-nowrap"
                        >
                          {isCreating ? "Creating..." : "Create Market"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
