"use client";

import { NostrSdkProvider } from "nostr-wot-sdk/react";
import { ReactNode } from "react";

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
  return (
    <NostrSdkProvider
      cache={{ namespace: "nostr-wot", ttlMs: 24 * 3600_000 }}
      wot={{ enabled: true }}
    >
      {children}
    </NostrSdkProvider>
  );
}
