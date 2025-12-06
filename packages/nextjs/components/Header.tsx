"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper";
import { useOutsideClick } from "~~/hooks/helper";
import { isAdmin } from "~~/utils/adminConfig";

/**
 * Site header
 */
export const Header = () => {
  const { address } = useAccount();
  const userIsAdmin = isAdmin(address);
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky top-0 z-50 bg-[#1C1C1E] border-b border-[#0FA958]/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0FA958] to-[#19C37D] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#0FA958] to-[#19C37D] bg-clip-text text-transparent">
                Spectra
              </span>
              <div className="text-xs text-gray-400 -mt-1">Encrypted Markets</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
};
