import { useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

export interface MarketPoolInfo {
  participantCount: bigint;
  // V3: Pool amounts and bet counts are hidden for privacy
}

export const useMarketPoolInfo = (marketId: number) => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV3.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV3.abi;

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
    // V3 only returns participantCount
    const participantCount = data as bigint;
    poolInfo = {
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
