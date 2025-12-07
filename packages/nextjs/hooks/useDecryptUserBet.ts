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
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const { canDecrypt, decrypt, results, isDecrypting: hookIsDecrypting, error: hookError } = useFHEDecrypt({
    instance,
    ethersSigner,
    fhevmDecryptionSignatureStorage: storage!,
    chainId,
    requests,
  });

  // Trigger decryption when ready
  useEffect(() => {
    if (canDecrypt && enabled && !isDecrypting && !decryptedAmount && !decryptedSide) {
      setIsDecrypting(true);
      decrypt();
    }
  }, [canDecrypt, enabled, decrypt, isDecrypting, decryptedAmount, decryptedSide]);

  // Update decrypting state
  useEffect(() => {
    setIsDecrypting(hookIsDecrypting);
  }, [hookIsDecrypting]);

  // Update error state
  useEffect(() => {
    if (hookError) {
      setError(hookError);
    }
  }, [hookError]);

  // Process decryption results
  useEffect(() => {
    if (!results || Object.keys(results).length === 0) return;

    const amountHandle = extractHandle(encryptedAmount || "");
    const sideHandle = extractHandle(encryptedSide || "");

    if (amountHandle && results[amountHandle]) {
      const value = results[amountHandle];
      setDecryptedAmount(typeof value === "bigint" ? value : BigInt(value as string));
    }

    if (sideHandle && results[sideHandle]) {
      const value = results[sideHandle];
      setDecryptedSide(typeof value === "boolean" ? value : Boolean(value));
    }
  }, [results, encryptedAmount, encryptedSide]);

  return {
    decryptedAmount,
    decryptedSide,
    isDecrypting,
    error,
  };
};
