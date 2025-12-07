import { useEffect, useState, useRef } from "react";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo, useSelectedNetwork } from "./helper";

export interface Market {
  id: number;
  question: string;
  categoryId: bigint;
  deadline: bigint;
  creator: `0x${string}`;
  resolved: boolean;
  winningSide: boolean;
  targetPrice: bigint;
  aggregatedHandles: `0x${string}`;
  inputProof: `0x${string}`;
}

// Cache to store market data across component remounts
const marketCache = new Map<string, { data: Market[]; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for faster updates

/**
 * Optimized hook that fetches ALL markets in a single batched multicall
 * instead of making individual calls per market.
 * Implements caching to avoid refetching on every page visit.
 */
export const useMarkets = (marketCount?: bigint) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: contractInfo } = useDeployedContractInfo({ contractName: "PredictionMarketV3" });
  const selectedNetwork = useSelectedNetwork();
  const publicClient = usePublicClient({ chainId: selectedNetwork.id });
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!contractInfo?.address || !publicClient) {
      setIsLoading(false);
      return;
    }

    if (marketCount === undefined) {
      return;
    }

    const count = Number(marketCount);
    if (count === 0) {
      setMarkets([]);
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `${contractInfo.address}-${count}`;
    const cached = marketCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setMarkets(cached.data);
      setIsLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return;
    }

    setIsLoading(true);
    isFetchingRef.current = true;

    // Fetch in batches for faster perceived performance
    const BATCH_SIZE = 5;
    const batches = [];
    
    for (let i = 0; i < count; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, count);
      const batchCalls = Array.from({ length: batchEnd - i }, (_, j) => ({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "getMarket",
        args: [BigInt(i + j)],
      }));
      batches.push(batchCalls);
    }

    // Process batches in parallel
    const allMarketsData: Market[] = [];
    
    Promise.all(
      batches.map(batchCalls =>
        publicClient.multicall({ contracts: batchCalls as any })
      )
    )
      .then(batchResults => {
        // Flatten and process all results
        batchResults.forEach(batchResult => {
          batchResult.forEach((result: any, localIndex: number) => {
            if (result.status === "success" && result.result) {
              const [question, categoryId, deadline, creator, resolved, winningSide, targetPrice, participantCount, aggregatedHandles, inputProof] = result.result as [
                string, bigint, bigint, `0x${string}`, boolean, boolean, bigint, bigint, `0x${string}`, `0x${string}`
              ];

              allMarketsData.push({
                id: allMarketsData.length,
                question,
                categoryId,
                deadline,
                creator,
                resolved,
                winningSide,
                targetPrice,
                aggregatedHandles,
                inputProof,
              });
            }
          });
        });

        setMarkets(allMarketsData);
        marketCache.set(cacheKey, { data: allMarketsData, timestamp: Date.now() });
      })
      .catch(error => {
        console.error("Error fetching markets:", error);
        setMarkets([]);
      })
      .finally(() => {
        setIsLoading(false);
        isFetchingRef.current = false;
      });
  }, [contractInfo, publicClient, marketCount, selectedNetwork.id]);

  return { markets, isLoading };
};
