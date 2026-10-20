import {getTranslations} from "next-intl/server";
import {CodeBlock, TerminalBlock} from "@/components/ui";
export default async function Content(){ const t=await getTranslations("docs.sdk"); return (<section id="setup" className="scroll-mt-24">
        <TerminalBlock commands={["npm install nostr-wot-sdk@3.0.0 nostr-tools react"]} />
        <h2>{t("setupTitle")}</h2>
        <p>{t("setupDescription")}</p>
        <CodeBlock language="tsx" code={`"use client";
import type { ReactNode } from "react";
import { NostrSdkProvider } from "nostr-wot-sdk/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NostrSdkProvider
      relays={["wss://relay.damus.io", "wss://nos.lol"]}
      profileAggregators={["wss://purplepag.es"]}
    >
      {children}
    </NostrSdkProvider>
  );
}`} />
      </section>); }
