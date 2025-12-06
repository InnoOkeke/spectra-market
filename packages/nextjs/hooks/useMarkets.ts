import { useEffect, useState, useRef } from "react";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo, useSelectedNetwork } from "./helper";

export interface Market {
  id: number;
  question: string;
  deadline: bigint;
  creator: `0x${string}`;
  resolved: boolean;
  winningSide: boolean;
  aggregatedHandles: `0x${string}`;
  inputProof: `0x${string}`;
}

// Cache to store market data across component remounts
const marketCache = new Map<string, { data: Market[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Optimized hook that fetches ALL markets in a single batched multicall
 * instead of making individual calls per market.
 * Implements caching to avoid refetching on every page visit.
 */
export const useMarkets = (marketCount?: bigint) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: contractInfo } = useDeployedContractInfo({ contractName: "PredictionMarket" });
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
      console.log('DEBUG: Using cached market data');
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

    const calls = Array.from({ length: count }, (_, i) => ({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "getMarket",
      args: [BigInt(i)],
    }));

    publicClient
      .multicall({
        contracts: calls as any,
        allowFailure: true,
      })
      .then((results) => {
        console.log('DEBUG: Fetched fresh market data from RPC');
        const formattedMarkets = results
          .map((result: any, index: number) => {
            if (result.status === 'failure' || !result.result) return null;
            
            const [question, deadline, creator, resolved, winningSide, aggregatedHandles, inputProof] = result.result;
            
            return {
              id: index,
              question: question as string,
              deadline: deadline as bigint,
              creator: creator as `0x${string}`,
              resolved: resolved as boolean,
              winningSide: winningSide as boolean,
              aggregatedHandles: aggregatedHandles as `0x${string}`,
              inputProof: inputProof as `0x${string}`,
            };
          })
          .filter((m): m is Market => m !== null);

        // Update cache
        marketCache.set(cacheKey, { data: formattedMarkets, timestamp: now });
        
        setMarkets(formattedMarkets);
        setIsLoading(false);
        isFetchingRef.current = false;
      })
      .catch(() => {
        setMarkets([]);
        setIsLoading(false);
        isFetchingRef.current = false;
      });
  }, [contractInfo, publicClient, marketCount]);

  return { markets, isLoading };
};
