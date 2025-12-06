import { usePredictionMarket } from "~~/hooks/usePredictionMarket";
import Link from "next/link";

interface MarketCardProps {
  marketId: number;
}

export function MarketCard({ marketId }: MarketCardProps) {
  const { getMarket } = usePredictionMarket();
  const { data: marketData } = getMarket(marketId);

  if (!marketData || !Array.isArray(marketData)) {
    return null;
  }

  const [question, deadline] = marketData as [string, bigint, ...any[]];

  return (
    <Link href={`/market/${marketId}`}>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0FA958] hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-[#0FA958]/10 text-[#0FA958] rounded-full text-sm font-semibold">
            💰 Crypto
          </span>
          <span className="text-sm text-gray-500">
            Ends {new Date(Number(deadline) * 1000).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-4 text-[#111111] group-hover:text-[#0FA958] transition-colors">
          {question}
        </h3>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <div className="text-sm text-gray-500">Volume</div>
            <div className="font-semibold text-[#111111]">0 ETH</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Participants</div>
            <div className="font-semibold text-[#111111]">0</div>
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-[#0FA958] to-[#19C37D] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Trade →
          </button>
        </div>
      </div>
    </Link>
  );
}
