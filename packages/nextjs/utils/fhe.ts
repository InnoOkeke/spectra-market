"use client";

import { useFHEEncryption } from "../../fhevm-sdk/src/react/useFHEEncryption";
import { ethers } from "ethers";

// Small wrapper hooks file to keep usage consistent in components.
// NOTE: Components should pass the FHEVM instance and signer from top-level providers.

export const useFheHelpers = (params: {
  instance: any;
  signer: ethers.JsonRpcSigner | undefined;
  contractAddress?: `0x${string}`;
}) => {
  const { instance, signer, contractAddress } = params as any;
  const encHook = useFHEEncryption({ instance, ethersSigner: signer, contractAddress });

  const encryptBet = async (buildFn: (builder: any) => void) => {
    if (!encHook.canEncrypt) throw new Error("Cannot encrypt - missing instance/signer/contractAddress");
    const res = await encHook.encryptWith(buildFn);
    return res;
  };

  return { encryptBet };
};
