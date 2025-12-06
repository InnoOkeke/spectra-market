import { useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

export interface MarketBet {
  bettor: string;
  amount: bigint;
  side: boolean;
  timestamp: bigint;
  claimed: boolean;
}

export const useMarketBets = (marketId: number) => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV2.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV2.abi;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getAllMarketBets",
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
    const [bettors, amounts, sides, timestamps, claimed] = data as [
      string[],
      bigint[],
      boolean[],
      bigint[],
      boolean[],
    ];

    bets = bettors.map((bettor, index) => ({
      bettor,
      amount: amounts[index],
      side: sides[index],
      timestamp: timestamps[index],
      claimed: claimed[index],
    }));
  }

  return {
    bets,
    isLoading,
    error,
    refetch,
  };
};

export const useUserBet = (marketId: number, userAddress: string | undefined) => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV2.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV2.abi;

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
        amount: bigint;
        side: boolean;
        timestamp: bigint;
        claimed: boolean;
      }
    | undefined;

  if (data) {
    const [exists, amount, side, timestamp, claimed] = data as [boolean, bigint, boolean, bigint, boolean];
    userBet = { exists, amount, side, timestamp, claimed };
  }

  return {
    userBet,
    isLoading,
    error,
    refetch,
  };
};
