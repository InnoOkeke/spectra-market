import { useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

export interface Category {
  name: string;
  description: string;
  active: boolean;
  marketCount: bigint;
}

export const useCategories = () => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV3.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV3.abi;

  // Get category count
  const { data: categoryCount } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getCategoryCount",
  });

  // Get all categories
  const { data: categoriesData, refetch: refetchCategories } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "categories",
    args: [0n], // This will need to be called for each category
  });

  return {
    categoryCount: categoryCount as bigint | undefined,
    refetchCategories,
  };
};

export const useCategory = (categoryId: number) => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV3.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV3.abi;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getCategory",
    args: [BigInt(categoryId)],
  });

  return {
    category: data as Category | undefined,
    isLoading,
    error,
    refetch,
  };
};

export const useAllCategories = () => {
  const contractAddress = deployedContracts[11155111].PredictionMarketV3.address;
  const contractAbi = deployedContracts[11155111].PredictionMarketV3.abi;

  const { data: categoryCount } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getCategoryCount",
  });

  const count = Number(categoryCount || 0);
  const categories: Category[] = [];

  // Fetch each category
  for (let i = 0; i < count; i++) {
    const { data } = useReadContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "getCategory",
      args: [BigInt(i)],
    });
    if (data) {
      const [name, description, active, marketCount] = data as [string, string, boolean, bigint];
      categories.push({ name, description, active, marketCount });
    }
  }

  return {
    categories,
    isLoading: categoryCount === undefined,
  };
};
