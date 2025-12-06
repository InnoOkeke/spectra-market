import { useEffect, useState } from "react";
import { usePublicClient, useReadContract, useWriteContract, useAccount, useChainId } from "wagmi";
import { useDeployedContractInfo, useSelectedNetwork } from "./helper";

export const usePredictionMarket = () => {
  const { data: contractInfo } = useDeployedContractInfo({ contractName: "PredictionMarketV2" });
  const selectedNetwork = useSelectedNetwork();
  const publicClient = usePublicClient({ chainId: selectedNetwork.id });
  const [fallbackMarketCount, setFallbackMarketCount] = useState<bigint | undefined>(undefined);
  const { address: accountAddress, isConnected } = useAccount();
  const connectedChainId = useChainId();
  
  const { writeContractAsync } = useWriteContract();

  console.log('DEBUG usePredictionMarket:', {
    contractAddress: contractInfo?.address,
    networkId: selectedNetwork.id,
    connectedChainId,
    isConnected,
    accountAddress,
    hasPublicClient: !!publicClient,
    networkMismatch: connectedChainId !== selectedNetwork.id,
  });

  const { data: marketCount, isError, error, isLoading } = useReadContract({
    address: contractInfo?.address,
    abi: contractInfo?.abi,
    functionName: "getMarketCount",
    chainId: selectedNetwork.id,
    query: {
      enabled: !!contractInfo?.address && !!publicClient,
      refetchInterval: 60000, // 1 minute instead of 15 seconds
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  });

  useEffect(() => {
    console.log('DEBUG marketCount:', {
      marketCount: marketCount?.toString(),
      isError,
      isLoading,
      error: error?.message,
      chainId: selectedNetwork.id,
      publicClientChain: publicClient?.chain?.id,
    });
  }, [marketCount, isError, error, isLoading, selectedNetwork.id, publicClient]);

  useEffect(() => {
    if (!contractInfo?.address || !publicClient) return;
    
    publicClient
      .readContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "getMarketCount",
      })
      .then(value => {
        console.log('DEBUG fallback read result:', value?.toString());
        setFallbackMarketCount(value as bigint);
      })
      .catch((err) => {
        console.error('DEBUG fallback read error:', err);
      });
  }, [contractInfo, publicClient]);

  const getMarketInfo = () => ({
    address: contractInfo?.address,
    abi: contractInfo?.abi,
  });

  const createMarket = async (question: string, categoryId: bigint, deadline: bigint, targetPrice: bigint) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "createMarket",
      gas: 300000n,
      args: [question, categoryId, deadline, targetPrice] as const,
    });
  };

  const placeBet = async (marketId: bigint, encryptedData: `0x${string}`, inputProof: `0x${string}`, side: boolean) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "placeEncryptedBet",
      args: [marketId, encryptedData, inputProof, side] as const,
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

  const addCategory = async (name: string, description: string) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "addCategory",
      args: [name, description] as const,
    });
  };

  const updateCategory = async (categoryId: bigint, name: string, description: string, active: boolean) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "updateCategory",
      args: [categoryId, name, description, active] as const,
    });
  };

  const setPlatformFee = async (newFeePercent: bigint) => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "setPlatformFee",
      args: [newFeePercent] as const,
    });
  };

  const withdrawFees = async () => {
    if (!contractInfo) throw new Error("Contract not loaded");
    return writeContractAsync({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: "withdrawFees",
      args: [] as const,
    });
  };

  return {
    contract: contractInfo,
    marketCount: marketCount ?? fallbackMarketCount,
    getMarketInfo,
    createMarket,
    placeBet,
    resolveMarket,
    claimWinnings,
    addCategory,
    updateCategory,
    setPlatformFee,
    withdrawFees,
  };
};
