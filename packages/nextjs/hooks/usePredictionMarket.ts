import { useReadContract, useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "./helper";

export const usePredictionMarket = () => {
  const { data: contractInfo } = useDeployedContractInfo("PredictionMarket");
  
  const { writeContractAsync } = useWriteContract();

  // Read functions
  const { data: marketCount } = useReadContract({
    address: contractInfo?.address,
    abi: contractInfo?.abi,
    functionName: "getMarketCount",
  });

  const getMarket = (marketId: number) => {
    return useReadContract({
      address: contractInfo?.address,
      abi: contractInfo?.abi,
      functionName: "getMarket",
      args: [BigInt(marketId)],
    });
  };

  const createMarket = async (args: any[]) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "createMarket",
      args,
    });
  };

  const placeBet = async (args: any[]) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "placeBet",
      args,
    });
  };

  const resolveMarket = async (args: any[]) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "resolveMarket",
      args,
    });
  };

  const claimWinnings = async (args: any[]) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "claimWinnings",
      args,
    });
  };

  return {
    contract: contractInfo,
    marketCount,
    getMarket,
    createMarket,
    placeBet,
    resolveMarket,
    claimWinnings,
  };
};
