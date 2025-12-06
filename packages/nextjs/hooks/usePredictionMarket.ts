import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "./wagmi";

export const usePredictionMarket = () => {
  const { data: contract } = useScaffoldContract({
    contractName: "PredictionMarket",
  });

  const { writeContractAsync: createMarket } = useScaffoldWriteContract("PredictionMarket");
  const { writeContractAsync: placeBet } = useScaffoldWriteContract("PredictionMarket");
  const { writeContractAsync: resolveMarket } = useScaffoldWriteContract("PredictionMarket");
  const { writeContractAsync: claimWinnings } = useScaffoldWriteContract("PredictionMarket");

  // Read functions
  const { data: marketCount } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "getMarketCount",
  });

  const getMarket = (marketId: number) =>
    useScaffoldReadContract({
      contractName: "PredictionMarket",
      functionName: "getMarket",
      args: [BigInt(marketId)],
    });

  return {
    contract,
    marketCount,
    getMarket,
    createMarket,
    placeBet,
    resolveMarket,
    claimWinnings,
  };
};
