import { useReadContract, useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "./helper";

export const usePredictionMarket = () => {
  const { data: contractInfo } = useDeployedContractInfo({ contractName: "PredictionMarket" });
  
  const { writeContractAsync } = useWriteContract();

  const { data: marketCount } = useReadContract({
    address: contractInfo?.address,
    abi: contractInfo?.abi,
    functionName: "getMarketCount",
    query: {
      enabled: !!contractInfo?.address,
    },
  });

  const getMarketInfo = () => ({
    address: contractInfo?.address,
    abi: contractInfo?.abi,
  });

  const createMarket = async (question: string, deadline: bigint, targetPrice: bigint) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "createMarket",
      gas: 300000n,
      args: [question, deadline, targetPrice] as const,
    });
  };

  const placeBet = async (marketId: bigint, handles: `0x${string}`, inputProof: `0x${string}`) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "placeEncryptedBet",
      args: [marketId, handles, inputProof] as const,
      gas: 500000n, // Set reasonable gas limit for encrypted operations
    });
  };

  const resolveMarket = async (marketId: bigint, aggregatedHandles: `0x${string}`, inputProof: `0x${string}`, winningSide: boolean) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "resolveMarket",
      args: [marketId, aggregatedHandles, inputProof, winningSide] as const,
    });
  };

  const claimWinnings = async (marketId: bigint) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "claimWinnings",
      args: [marketId] as const,
    });
  };

  return {
    contract: contractInfo,
    marketCount,
    getMarketInfo,
    createMarket,
    placeBet,
    resolveMarket,
    claimWinnings,
  };
};
