"use client";

import { useEffect, useState } from "react";
import { InMemoryStorageProvider } from "@fhevm-sdk";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/helper";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const DappWrapperWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Suppress harmless FHEVM relayer analytics errors
    if (typeof window !== "undefined") {
      const originalError = console.error;
      console.error = (...args: any[]) => {
        const errorMessage = args[0]?.toString() || "";
        // Filter out relayer analytics fetch errors (non-critical)
        if (errorMessage.includes("Analytics SDK") || errorMessage.includes("relayer-sdk-js")) {
          return;
        }
        originalError.apply(console, args);
      };
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ProgressBar height="3px" color="#2299dd" />
          <div className={`flex flex-col min-h-screen`}>
            <Header />
            <main className="relative flex flex-col flex-1">
              <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
            </main>
          </div>
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
