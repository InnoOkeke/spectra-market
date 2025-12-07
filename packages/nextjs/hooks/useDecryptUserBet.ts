import { useState, useEffect, useMemo } from "react";
import { useFHEDecrypt, GenericStringStorage, FhevmInstance } from "@fhevm-sdk";
import { ethers } from "ethers";

// Helper to extract handle from encrypted bytes (removes 0x prefix if present)
const extractHandle = (encryptedBytes: string): string => {
  if (!encryptedBytes || encryptedBytes === "0x") return "";
  return encryptedBytes.startsWith("0x") ? encryptedBytes.slice(2) : encryptedBytes;
};

export const useDecryptUserBet = (params: {
  instance: FhevmInstance | undefined;
  ethersSigner: any; // Use any to avoid ethers version conflict
  chainId: number | undefined;
  contractAddress: `0x${string}` | undefined;
  encryptedAmount: string | undefined;
  encryptedSide: string | undefined;
  enabled: boolean;
}) => {
  const { instance, ethersSigner, chainId, contractAddress, encryptedAmount, encryptedSide, enabled } = params;

  const [decryptedAmount, setDecryptedAmount] = useState<bigint | null>(null);
  const [decryptedSide, setDecryptedSide] = useState<boolean | null>(null);
  const [isManuallyDecrypting, setIsManuallyDecrypting] = useState(false);

  // Create storage for decryption signatures (localStorage)
  const storage = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    // localStorage already implements the GenericStringStorage interface
    return window.localStorage;
  }, []);

  // Build decryption requests
  const requests = useMemo(() => {
    if (!enabled || !contractAddress || !encryptedAmount || !encryptedSide) return undefined;

    const amountHandle = extractHandle(encryptedAmount);
    const sideHandle = extractHandle(encryptedSide);

    if (!amountHandle || !sideHandle) return undefined;

    return [
      { handle: amountHandle, contractAddress },
      { handle: sideHandle, contractAddress },
    ];
  }, [enabled, contractAddress, encryptedAmount, encryptedSide]);

  const { canDecrypt, decrypt, results, isDecrypting, error, message } = useFHEDecrypt({
    instance,
    ethersSigner,
    fhevmDecryptionSignatureStorage: storage!,
    chainId,
    requests,
  });

  // Manual decrypt function
  const manualDecrypt = () => {
    if (!canDecrypt || !enabled || !requests || requests.length === 0) return;
    setIsManuallyDecrypting(true);
    decrypt();
  };

  // Process decryption results
  useEffect(() => {
    if (!results || Object.keys(results).length === 0) return;
    
    if (isManuallyDecrypting) {
      setIsManuallyDecrypting(false);
    }

    if (decryptedAmount !== null && decryptedSide !== null) return;

    const amountHandle = extractHandle(encryptedAmount || "");
    const sideHandle = extractHandle(encryptedSide || "");

    if (amountHandle && results[amountHandle] && decryptedAmount === null) {
      const value = results[amountHandle];
      setDecryptedAmount(typeof value === "bigint" ? value : BigInt(value as string));
    }

    if (sideHandle && results[sideHandle] && decryptedSide === null) {
      const value = results[sideHandle];
      setDecryptedSide(typeof value === "boolean" ? value : Boolean(value));
    }
  }, [results, encryptedAmount, encryptedSide, decryptedAmount, decryptedSide, isManuallyDecrypting]);

  return {
    decryptedAmount,
    decryptedSide,
    isDecrypting: isDecrypting || isManuallyDecrypting,
    error,
    canDecrypt,
    decrypt: manualDecrypt,
  };
};
