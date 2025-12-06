import { useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

// V3: Individual bet details are encrypted and not publicly readable
// Only participant list is available
export interface MarketBet {
  bettor: string;
  // amount, side, timestamp are encrypted in V3
}

export const useMarketBets = (marketId: number) => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV3.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV3.abi;

  // V3: Only get list of bettors, not bet details
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getMarketBettors",
    args: [BigInt(marketId)],
    query: {
      refetchInterval: false, // Disable auto-refetch
      staleTime: 30000, // Cache for 30 seconds
      retry: 1,
      retryDelay: 1000,
    },
  });

  let bets: MarketBet[] = [];
  if (data) {
    // V3: data is just an array of addresses
    const bettors = data as string[];
    bets = bettors.map(bettor => ({ bettor }));
  }

  return {
    bets,
    isLoading,
    error,
    refetch,
  };
};

export const useUserBet = (marketId: number, userAddress: string | undefined) => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV3.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV3.abi;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getUserBet",
    args: userAddress ? [BigInt(marketId), userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
      staleTime: 30000,
      retry: 1,
      retryDelay: 1000,
    },
  });

  let userBet:
    | {
        exists: boolean;
        timestamp: bigint;
        claimed: boolean;
        // V3: amount and side are encrypted, not readable
      }
    | undefined;

  if (data) {
    // V3: only returns exists, timestamp, claimed
    const [exists, timestamp, claimed] = data as [boolean, bigint, boolean];
    userBet = { exists, timestamp, claimed };
  }

  return {
    userBet,
    isLoading,
    error,
    refetch,
  };
};
