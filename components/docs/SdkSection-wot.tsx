import {getTranslations} from "next-intl/server";
import {CodeBlock, TerminalBlock} from "@/components/ui";
export default async function Content(){ const t=await getTranslations("docs.sdk"); return (<section id="wot" className="scroll-mt-24">
        <p>{t("wotDescription")}</p>
        <h2>{t("migrationTitle")}</h2>
        <p>{t("migrationDescription")}</p>
        <h2>{t("localTitle")}</h2>
        <p>{t("localDescription")}</p>
        <TerminalBlock commands={["npm install @nostr-wot/wot@3.0.0 nostr-wot-sdk@3.0.0 nostr-tools"]} />
        <CodeBlock language="typescript" code={`import { WotGraph } from "@nostr-wot/wot/graph";
import { WoT } from "@nostr-wot/wot";

async function prepareGraph(myPubkey: string, targetPubkey: string) {
  const graph = new WotGraph({
    namespace: "my-app",
    relays: ["wss://relay.damus.io", "wss://nos.lol"],
  });
  await graph.load();
  await graph.crawl(myPubkey, { maxDepth: 2 });
  const wot = new WoT({ source: graph.asWoTSource(), maxHops: 2 });
  const distance = await wot.getDistance(targetPubkey);
  const inWoT = await wot.isInMyWoT(targetPubkey);
  return { graph, distance, inWoT };
}`} />
        <CodeBlock language="tsx" code={`"use client";
import type { WotGraph } from "@nostr-wot/wot/graph";
import { NostrSdkProvider, useIsInWoT } from "nostr-wot-sdk/react";

function FollowBadge({ pubkey }: { pubkey: string }) {
  const { inWoT, loading, error } = useIsInWoT(pubkey, { maxHops: 2 });
  if (loading || error || !inWoT) return null;
  return <span>{pubkey}</span>;
}

function LocalTrust({ graph, pubkey }: { graph: WotGraph; pubkey: string }) {
  return (
    <NostrSdkProvider wot={{ enabled: true, options: { source: graph.asWoTSource() } }}>
      <FollowBadge pubkey={pubkey} />
    </NostrSdkProvider>
  );
}`} />
      </section>); }
