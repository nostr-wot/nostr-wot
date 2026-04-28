"use client";

import { NostrSdkProvider } from "nostr-wot-sdk/react";
import { ReactNode, useMemo } from "react";

const DEV_EXTENSION_ID = "ehhdbbkphncmcpkpeobbbgjnpcfjeamc";
const PROD_EXTENSION_ID = "";

interface WotProviderProps {
  children: ReactNode;
}

/**
 * Top-level Nostr WoT SDK provider. Configures the data layer (relay
 * defaults, profile aggregators, cache namespace) and enables the WoT
 * context so `useWoT`, `useTrustScore`, etc. work throughout the tree.
 *
 * Kept as `WotProvider` for back-compat with existing imports. New code
 * can import `NostrSdkProvider` directly from `nostr-wot-sdk/react`.
 */
export function WotProvider({ children }: WotProviderProps) {
  const wot = useMemo(() => {
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const extensionId = isLocalhost ? DEV_EXTENSION_ID : PROD_EXTENSION_ID;
    return {
      enabled: true as const,
      ...(extensionId ? { options: { extensionId } } : {}),
    };
  }, []);

  return (
    <NostrSdkProvider
      cache={{ namespace: "nostr-wot", ttlMs: 24 * 3600_000 }}
      wot={wot}
    >
      {children}
    </NostrSdkProvider>
  );
}
