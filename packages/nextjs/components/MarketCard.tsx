import Link from "next/link";
import type { Market } from "~~/hooks/useMarkets";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const isExpired = Number(market.deadline) * 1000 < Date.now();
  const deadlineDate = new Date(Number(market.deadline) * 1000);
  
  return (
    <Link href={`/market/${market.id}`}>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0FA958] hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            market.resolved 
              ? 'bg-gray-100 text-gray-600' 
              : isExpired
              ? 'bg-orange-100 text-orange-600'
              : 'bg-[#0FA958]/10 text-[#0FA958]'
          }`}>
            {market.resolved ? '✓ Resolved' : isExpired ? '⏱ Expired' : '🔴 Live'}
          </span>
          <span className="text-sm text-gray-500">
            {isExpired ? 'Ended' : 'Ends'} {deadlineDate.toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-4 text-[#111111] group-hover:text-[#0FA958] transition-colors line-clamp-2">
          {market.question}
        </h3>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex gap-4">
            <div>
              <div className="text-sm text-gray-500">Market ID</div>
              <div className="font-semibold text-[#111111]">#{market.id}</div>
            </div>
            {market.resolved && (
              <div>
                <div className="text-sm text-gray-500">Winner</div>
                <div className="font-semibold text-[#0FA958]">{market.winningSide ? 'YES' : 'NO'}</div>
              </div>
            )}
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-[#0FA958] to-[#19C37D] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            {market.resolved ? 'View →' : 'Trade →'}
          </button>
        </div>
      </div>
    </Link>
  );
}
