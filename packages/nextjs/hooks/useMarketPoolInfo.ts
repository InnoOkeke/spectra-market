import { useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

export interface MarketPoolInfo {
  totalYesBets: bigint;
  totalNoBets: bigint;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
  participantCount: bigint;
}

export const useMarketPoolInfo = (marketId: number) => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV2.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV2.abi;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getMarketPoolInfo",
    args: [BigInt(marketId)],
    query: {
      refetchInterval: false, // Disable auto-refetch for homepage performance
      staleTime: 60000, // Cache for 1 minute
      retry: 1,
      retryDelay: 1000,
    },
  });

  let poolInfo: MarketPoolInfo | undefined;
  if (data) {
    const [totalYesBets, totalNoBets, totalYesAmount, totalNoAmount, participantCount] = data as [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
    ];
    poolInfo = {
      totalYesBets,
      totalNoBets,
      totalYesAmount,
      totalNoAmount,
      participantCount,
    };
  }

  return {
    poolInfo,
    isLoading,
    error,
    refetch,
  };
};
