import Link from "next/link";
import type { Market } from "~~/hooks/useMarkets";
import { useMarketPoolInfo } from "~~/hooks/useMarketPoolInfo";
import { formatEther } from "viem";

interface MarketCardProps {
  market: Market;
  showPoolInfo?: boolean; // Optional prop to control if pool info should be fetched
}

const CATEGORY_INFO = [
  { id: 0, name: "Crypto", icon: "💰", color: "bg-[#0FA958]/10 text-[#0FA958] border-[#0FA958]/20" },
  { id: 1, name: "Politics", icon: "🏛️", color: "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20" },
  { id: 2, name: "Sports", icon: "⚽", color: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" },
  { id: 3, name: "Environmental", icon: "🌍", color: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" },
  { id: 4, name: "Technology", icon: "💻", color: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20" },
  { id: 5, name: "Finance", icon: "📈", color: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20" },
];

export function MarketCard({ market, showPoolInfo = false }: MarketCardProps) {
  const isExpired = Number(market.deadline) * 1000 < Date.now();
  const deadlineDate = new Date(Number(market.deadline) * 1000);
  const { poolInfo } = useMarketPoolInfo(market.id);
  
  // V3: Only participant count available (pool amounts encrypted)
  const participantCount = poolInfo ? Number(poolInfo.participantCount) : 0;
  
  const category = CATEGORY_INFO.find(c => c.id === Number(market.categoryId)) || CATEGORY_INFO[0];
  
  return (
    <Link href={`/market/${market.id}`}>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0FA958] hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${category.color}`}>
              {category.icon} {category.name}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              market.resolved 
                ? 'bg-gray-100 text-gray-600' 
                : isExpired
                ? 'bg-orange-100 text-orange-600'
                : 'bg-[#0FA958]/10 text-[#0FA958]'
            }`}>
              {market.resolved ? '✓ Resolved' : isExpired ? '⏱ Expired' : '🔴 Live'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {isExpired ? 'Ended' : 'Ends'} {deadlineDate.toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-4 text-[#111111] group-hover:text-[#0FA958] transition-colors line-clamp-2">
          {market.question}
        </h3>

        {/* Pool Statistics - Privacy Protected */}
        {poolInfo && (
          <div className="mb-4 space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 mb-2">
                🔐 <strong>Privacy Protected:</strong> Pool amounts are encrypted
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Participants:</span>
                <span className="font-bold text-[#111111]">{participantCount}</span>
              </div>
            </div>
          </div>
        )}

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
