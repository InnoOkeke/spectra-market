"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const [marketId, setMarketId] = useState('0');
  const [claimed, setClaimed] = useState(false);

  function claim(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    // Placeholder: call smart contract to claim winnings
    console.log('Claiming winnings for market', marketId);
    setClaimed(true);
    setTimeout(() => setClaimed(false), 3000);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FFD534] to-[#0FA958] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#111111] mb-2">Claim Winnings</h1>
            <p className="text-gray-600">Withdraw your earnings from resolved markets</p>
          </div>

          {!isConnected ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#FFD534]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FFD534]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#111111] mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">Please connect your wallet to claim winnings</p>
              <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-[#0FA958] to-[#19C37D] text-white rounded-xl font-semibold hover:opacity-90 transition">
                Go Home
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={claim} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Market ID</label>
                  <input 
                    type="number"
                    value={marketId} 
                    onChange={e => setMarketId(e.target.value)} 
                    placeholder="Enter market ID"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111]"
                  />
                  <p className="mt-2 text-sm text-gray-500">Enter the ID of the market you won</p>
                </div>
                
                {claimed ? (
                  <div className="p-4 bg-[#0FA958]/10 border border-[#0FA958]/20 rounded-xl">
                    <div className="flex items-center gap-2 text-[#0FA958]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Claim Submitted Successfully!</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#FFD534] to-[#0FA958] hover:opacity-90 text-[#111111] font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
                  >
                    💰 Claim Winnings
                  </button>
                )}
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-[#111111] mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0FA958]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How It Works
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Only winners can claim from resolved markets</li>
                  <li>• Winnings are distributed automatically to your wallet</li>
                  <li>• You can only claim once per market</li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-[#0FA958] hover:text-[#19C37D] transition-colors">
                  ← Back to Markets
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
