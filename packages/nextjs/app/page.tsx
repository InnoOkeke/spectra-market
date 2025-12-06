"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePublicClient } from "wagmi";
import { type SportsMarket, fetchUpcomingSportsEvents, getSportIcon } from "~~/utils/sportsApi";
import { usePredictionMarket } from "~~/hooks/usePredictionMarket";
import { useDeployedContractInfo, useSelectedNetwork } from "~~/hooks/helper";
import { MarketCard } from "~~/components/MarketCard";
import { getOnChainMarketId, getSportsMarketMappings } from "~~/utils/sportsMarketMapping";

export default function Home() {
  const [sportsMarkets, setSportsMarkets] = useState<SportsMarket[]>([]);
  const [marketIds, setMarketIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"crypto" | "sports">("crypto");
  const [isLoading, setIsLoading] = useState(true);
  const { marketCount } = usePredictionMarket();
  const selectedNetwork = useSelectedNetwork();
  const publicClient = usePublicClient({ chainId: selectedNetwork.id });
  const { data: contractInfo } = useDeployedContractInfo({ contractName: "PredictionMarket" });

  useEffect(() => {
    fetchUpcomingSportsEvents().then(events => {
      const mappings = getSportsMarketMappings();
      const onChainSportsMarkets = events.filter(event => 
        mappings.some(m => m.sportsEventId === event.id)
      );
      setSportsMarkets(onChainSportsMarkets);
    }).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!contractInfo?.address || !publicClient) return;
    (async () => {
      try {
        const count = await publicClient.readContract({
          address: contractInfo.address,
          abi: contractInfo.abi,
          functionName: "getMarketCount",
        });
        const n = Number(count || 0);
        setMarketIds(n > 0 ? Array.from({ length: n }, (_, i) => i) : []);
      } catch {
        setMarketIds([]);
      }
    })();
  }, [contractInfo, publicClient]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1C1C1E] to-[#2A2A2C]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0FA958]/10 via-[#19C37D]/5 to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0FA958]/10 rounded-full border border-[#0FA958]/20 mb-6">
              <div className="w-2 h-2 bg-[#0FA958] rounded-full animate-pulse" />
              <span className="text-sm text-[#19C37D]">Powered by FHEVM</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#0FA958] via-[#19C37D] to-[#FFD534] bg-clip-text text-transparent">
              Spectra
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Professional encrypted prediction markets. Your positions remain confidential.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#markets"
                className="px-8 py-4 bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:from-[#0FA958]/90 hover:to-[#19C37D]/90 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-[#0FA958]/30 text-white"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById("markets")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Markets
              </a>
            </div>
          </div>

          {/* Stats removed (demo data) */}
        </div>
      </div>

      {/* Markets Section */}
      <div id="markets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-[#111111]">Active Markets</h2>
            <p className="text-gray-600">Place your encrypted bets and earn rewards</p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab("crypto")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "crypto"
                  ? "bg-gradient-to-r from-[#0FA958] to-[#19C37D] text-white shadow-lg"
                  : "text-gray-600 hover:text-[#0FA958]"
              }`}
            >
              💰 Crypto
            </button>
            <button
              onClick={() => setActiveTab("sports")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "sports"
                  ? "bg-gradient-to-r from-[#0FA958] to-[#19C37D] text-white shadow-lg"
                  : "text-gray-600 hover:text-[#0FA958]"
              }`}
            >
              ⚽ Sports
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {activeTab === "crypto" ? (
            marketIds.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-600 mb-4">No crypto markets available yet.</p>
                <p className="text-sm text-gray-500">Create the first market or check back soon!</p>
              </div>
            ) : (
              marketIds.map((id) => <MarketCard key={id} marketId={id} />)
            )
          ) : isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#0FA958] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sports markets...</p>
            </div>
          ) : sportsMarkets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No sports markets available yet.</p>
            </div>
          ) : (
            sportsMarkets.map((m) => {
              const onChainId = getOnChainMarketId(m.id);
              return (
                <Link
                  key={m.id}
                  href={`/market/${onChainId}`}
                  className="group relative bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#0FA958]/50 rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-[#0FA958]/20"
                >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#FFD534]/20 text-[#111111] rounded-full text-sm font-medium border border-[#FFD534]/30">
                    {getSportIcon(m.sport)} {m.sport}
                  </span>
                  <span className="px-3 py-1 bg-[#19C37D]/20 text-[#19C37D] rounded-full text-sm font-medium border border-[#19C37D]/30">
                    Active #{onChainId}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-[#111111] group-hover:text-[#0FA958] transition-colors">
                    {m.question}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Ends: {m.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>Volume: {m.volume}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>{m.participants} participants</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-[#0FA958]/10 text-[#0FA958] rounded-lg text-xs font-medium border border-[#0FA958]/20">
                      🔐 Encrypted
                    </div>
                    <div className="px-3 py-1 bg-[#FFD534]/10 text-[#111111] rounded-lg text-xs font-medium border border-[#FFD534]/20">
                      ⚡ Instant Settlement
                    </div>
                  </div>
                  <span className="text-[#0FA958] group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
              );
            })
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0FA958] to-[#19C37D] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#111111]">Fully Encrypted</h3>
            <p className="text-gray-600">
              All bets are encrypted using FHEVM. No one can see your positions until market resolution.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FFD534] to-[#0FA958] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#111111]">Fast & Fair</h3>
            <p className="text-gray-600">
              Instant bet placement and automated resolution. Smart contracts ensure fairness.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#19C37D] to-[#0FA958] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#111111]">Earn Rewards</h3>
            <p className="text-gray-600">Successful predictions earn you returns. Create markets and earn fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
