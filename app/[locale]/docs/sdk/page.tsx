import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CodeBlock, TerminalBlock, ScrollReveal } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

const packages = [
  ["nostr-wot-sdk", "1.0.1"],
  ["@nostr-wot/data", "0.5.1"],
  ["@nostr-wot/relay", "0.1.1"],
  ["@nostr-wot/signers", "1.2.0"],
  ["@nostr-wot/blossom", "0.1.7"],
  ["@nostr-wot/dm", "0.6.2"],
  ["@nostr-wot/wallet", "0.3.4"],
  ["@nostr-wot/wot", "1.0.0"],
  ["@nostr-wot/graph", "0.2.0"],
  ["@nostr-wot/ui", "0.7.1"],
  ["@nostr-wot/auth", "3.0.0"],
  ["@nostr-wot/pq", "0.2.2"],
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs.sdk");
  const title = t("title");
  const description = t("description");
  return {
    title, description,
    keywords: ["nostr sdk", "nostr wot sdk", "nostr data layer", "nostr react hooks"],
    alternates: generateAlternates("/docs/sdk", locale as Locale),
    openGraph: generateOpenGraph({ title, description, path: "/docs/sdk", locale: locale as Locale }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function SDKDocsPage() {
  const t = await getTranslations("docs.sdk");
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <ScrollReveal animation="fade-up">
        <h1>{t("title")}</h1>
        <p className="lead text-xl text-gray-600 dark:text-gray-400">{t("description")}</p>
      </ScrollReveal>

      <section id="packages" className="scroll-mt-24">
        <h2>{t("packagesTitle")}</h2>
        <p>{t("packagesDescription")}</p>
        <div className="not-prose overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800"><tr>
              <th scope="col" className="text-left p-3">{t("package")}</th>
              <th scope="col" className="text-left p-3">{t("version")}</th>
            </tr></thead>
            <tbody>{packages.map(([name, version]) => <tr key={name}>
              <td className="p-3 border-t border-gray-200 dark:border-gray-700"><a className="underline" href={`https://www.npmjs.com/package/${name}/v/${version}`}><code>{name}</code></a></td>
              <td className="p-3 border-t border-gray-200 dark:border-gray-700">{version}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section id="setup" className="scroll-mt-24">
        <h2>{t("installTitle")}</h2>
        <TerminalBlock commands={["npm install nostr-wot-sdk@1.0.1"]} />
        <h3>{t("setupTitle")}</h3>
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
      </section>

      <section id="compatibility" className="scroll-mt-24">
        <h2>{t("compatibilityTitle")}</h2>
        <p>{t("compatibilityDescription")}</p>
        <CodeBlock language="typescript" code={`async function oracleDistance(from: string, to: string) {
  const query = new URLSearchParams({ from, to, max_hops: "2" });
  const response = await fetch(
    "https://wot-oracle.mappingbitcoin.com/distance?" + query,
  );
  if (!response.ok) throw new Error("Oracle HTTP " + response.status);
  const result = await response.json();
  return result.hops as number | null;
}`} />
        <p><Link href="/docs/oracle">{t("oracleLink")}</Link></p>
      </section>

      <section id="data" className="scroll-mt-24">
        <h2>{t("dataTitle")}</h2>
        <p>{t("dataDescription")}</p>
        <TerminalBlock commands={["npm install @nostr-wot/data@0.5.1"]} />
        <CodeBlock language="typescript" code={`import {
  fetchProfile, fetchNotesByAuthor, fetchEngagement, setDefaultRelays,
} from "@nostr-wot/data";

setDefaultRelays(["wss://relay.damus.io", "wss://nos.lol"]);

async function loadAuthor(pubkey: string) {
  const profile = await fetchProfile(pubkey);
  const notes = await fetchNotesByAuthor(pubkey, { limit: 50 });
  const engagement = await fetchEngagement(notes.map(note => note.id));
  return { profile, notes, engagement };
}`} />
        <CodeBlock language="tsx" code={`"use client";
import { useProfile } from "@nostr-wot/data/react";

function ProfileCard({ pubkey }: { pubkey: string }) {
  const profile = useProfile(pubkey);
  if (!profile) return null;
  return <h1>{profile.displayName ?? profile.name ?? pubkey}</h1>;
}`} />
      </section>

      <section id="relay" className="scroll-mt-24">
        <h2>{t("relayTitle")}</h2>
        <p>{t("relayDescription")}</p>
        <TerminalBlock commands={["npm install @nostr-wot/relay@0.1.1"]} />
        <CodeBlock language="typescript" code={`import { RelayPool, type PoolLike, type NostrEvent } from "@nostr-wot/relay";

function watchNotes(transport: PoolLike, onEvent: (event: NostrEvent) => void) {
  const pool = new RelayPool({
    urls: ["wss://relay.damus.io", "wss://nos.lol"],
    pool: transport,
  });
  const sub = pool.subscribe({ kinds: [1], limit: 50 }, { onEvent });
  return () => {
    sub.close();
    pool.destroy();
  };
}`} />
      </section>

      <section id="ui" className="scroll-mt-24">
        <h2>{t("uiTitle")}</h2>
        <p>{t("uiDescription")}</p>
        <TerminalBlock commands={["npm install @nostr-wot/ui@0.7.1"]} />
        <CodeBlock language="tsx" code={`"use client";
import { LoginButton, useSession } from "@nostr-wot/ui";
import { NostrSdkProvider } from "nostr-wot-sdk/react";
import "@nostr-wot/ui/styles.css";

function Account() {
  const { pubkey } = useSession();
  return <><LoginButton /><output>{pubkey}</output></>;
}

function App() {
  return <NostrSdkProvider><Account /></NostrSdkProvider>;
}`} />
      </section>

      <section id="wot" className="scroll-mt-24">
        <h2>{t("wotTitle")}</h2>
        <p>{t("wotDescription")}</p>
        <h3>{t("migrationTitle")}</h3>
        <p>{t("migrationDescription")}</p>
        <h3>{t("localTitle")}</h3>
        <p>{t("localDescription")}</p>
        <TerminalBlock commands={["npm install @nostr-wot/wot@1.0.0 @nostr-wot/graph@0.2.0"]} />
        <CodeBlock language="typescript" code={`import { WotGraph } from "@nostr-wot/graph";
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
import type { WotGraph } from "@nostr-wot/graph";
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
      </section>
      <div className="not-prose mt-12 flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link href="/docs/extension" className="hover:text-primary">{t("previous")}</Link>
        <Link href="/docs/oracle" className="hover:text-primary">{t("next")}</Link>
      </div>
    </article>
  );
}
