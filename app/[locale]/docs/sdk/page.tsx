import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CodeBlock, InlineCode, TerminalBlock, ScrollReveal } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs");
  const title = `SDK Reference | ${t("meta.title")}`;
  const description = "nostr-wot-sdk — a toolkit for building Nostr apps: a pure-function data layer, relay management, headless login UI, and optional Web of Trust scoring.";

  return {
    title,
    description,
    keywords: ["nostr sdk", "nostr wot sdk", "nostr data layer", "nostr react hooks"],
    alternates: generateAlternates("/docs/sdk", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/docs/sdk",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function SDKDocsPage() {

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <ScrollReveal animation="fade-up">
        <h1>SDK Reference</h1>

        <p className="lead text-xl text-gray-600 dark:text-gray-400">
          <InlineCode>nostr-wot-sdk</InlineCode> is a toolkit for building Nostr apps: a pure-function
          data/query layer, relay management, headless login UI, and Web of Trust scoring as one
          optional module — all sharing a single connection pool.
        </p>
      </ScrollReveal>

      {/* Packages */}
      <section id="packages" className="scroll-mt-24">
        <h2>What&apos;s in the box</h2>
        <p>
          The meta-package <InlineCode>nostr-wot-sdk</InlineCode> pulls in the scoped{" "}
          <InlineCode>@nostr-wot/*</InlineCode> family and re-exports it, plus a unified
          React provider. Reach for the individual packages when you only need part of the stack.
        </p>
        <div className="not-prose overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Package</th>
                <th className="text-left p-3 font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>@nostr-wot/data</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Pure-function data layer — profiles, notes, threads, engagement, NIP-65 outbox. Optional SWR cache + React hooks.</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>@nostr-wot/relay</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Relay management — pool, query batcher, per-relay stats.</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>@nostr-wot/ui</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Headless React UI — login modal/widget, session provider, themable via CSS variables.</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>@nostr-wot/wot</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Web of Trust scoring — one optional module, enabled on the provider.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Installation */}
      <section id="setup" className="scroll-mt-24">
        <h2>Installation</h2>
        <TerminalBlock commands={["npm install nostr-wot-sdk"]} />

        <h3>Provider Setup</h3>
        <p>
          Wrap your app in <InlineCode>{"<NostrSdkProvider>"}</InlineCode>. It composes the data layer,
          the session context, and (opt-in) Web of Trust — all over one shared pool of relay connections.
        </p>
        <CodeBlock
          language="tsx"
          code={`import { NostrSdkProvider } from "nostr-wot-sdk/react";

function App() {
  return (
    <NostrSdkProvider
      relays={["wss://relay.damus.io", "wss://nos.lol"]}
      profileAggregators={["wss://purplepag.es"]}
      wot={{ enabled: true, options: { maxHops: 2 } }}
    >
      <MyApp />
    </NostrSdkProvider>
  );
}`}
        />
      </section>

      {/* Data layer */}
      <section id="data" className="scroll-mt-24">
        <h2>Data Layer</h2>
        <p>
          <InlineCode>@nostr-wot/data</InlineCode> is a pure-function Nostr data layer: profiles, notes,
          threads, follows, and engagement (reactions / reposts / zaps), with NIP-65 outbox-model relay
          discovery built in. Fetchers work standalone; the React hooks add an SWR cache.
        </p>

        <h3>Vanilla fetchers</h3>
        <CodeBlock
          language="typescript"
          code={`import {
  fetchProfile,
  fetchNote,
  fetchNotesByAuthor,
  fetchThread,
  fetchEngagement,
  setDefaultRelays,
} from "@nostr-wot/data";

setDefaultRelays(["wss://relay.damus.io", "wss://nos.lol"]);

const profile = await fetchProfile("hex-pubkey");
const notes = await fetchNotesByAuthor("hex-pubkey", { limit: 50 });
const engagement = await fetchEngagement(["id1", "id2"]);
// → Map<id, { reactionCount, repostCount, zapTotalSats }>`}
        />

        <h3>React hooks</h3>
        <CodeBlock
          language="tsx"
          code={`import { useProfile, useThread, useEngagement } from "@nostr-wot/data/react";

function ProfileCard({ pubkey }: { pubkey: string }) {
  const profile = useProfile(pubkey); // SWR — cached + revalidated
  if (!profile) return <Skeleton />;
  return <h1>{profile.displayName ?? profile.name}</h1>;
}`}
        />
      </section>

      {/* Relay management */}
      <section id="relay" className="scroll-mt-24">
        <h2>Relay Management</h2>
        <p>
          <InlineCode>@nostr-wot/relay</InlineCode> provides the low-level relay primitives the data
          layer builds on — a connection pool with reconnect handling, a query batcher that coalesces
          concurrent reads, and a per-relay stats tracker.
        </p>
        <CodeBlock
          language="typescript"
          code={`import { RelayPool } from "@nostr-wot/relay";

const pool = new RelayPool({
  relays: ["wss://relay.damus.io", "wss://nos.lol"],
});

const sub = pool.subscribeMany(
  pool.relays(),
  [{ kinds: [1], limit: 50 }],
  {
    onevent: (e) => { /* ... */ },
    oneose: () => sub.close(),
  },
);`}
        />
      </section>

      {/* Headless UI */}
      <section id="ui" className="scroll-mt-24">
        <h2>Headless Login UI</h2>
        <p>
          <InlineCode>@nostr-wot/ui</InlineCode> ships a headless login modal/widget and session
          provider. It supports NIP-07, NIP-46, generate, and import — and writes to the same session
          context every other hook reads from, so once the user signs in, the whole SDK has the signer.
        </p>
        <CodeBlock
          language="tsx"
          code={`import { LoginButton, useSession } from "@nostr-wot/ui";
import { NostrSdkProvider } from "nostr-wot-sdk/react";
import "@nostr-wot/ui/styles.css";

function App() {
  return (
    <NostrSdkProvider relays={["wss://relay.damus.io"]}>
      <LoginButton />
      <Welcome />
    </NostrSdkProvider>
  );
}

function Welcome() {
  const { pubkey } = useSession();
  return pubkey ? <p>Welcome {pubkey.slice(0, 12)}…</p> : <p>Please sign in</p>;
}`}
        />
      </section>

      {/* Web of Trust */}
      <section id="wot" className="scroll-mt-24">
        <h2>Web of Trust (optional)</h2>
        <p>
          Web of Trust is one opt-in module. Enable it on the provider with{" "}
          <InlineCode>{"wot={{ enabled: true }}"}</InlineCode> and the trust hooks light up anywhere in
          your tree. If the{" "}
          <Link href="/download">WoT browser extension</Link> is installed, queries are answered from
          its locally-cached follow graph; otherwise the SDK falls back to relay-fetched kind-3 events.
        </p>

        <h3>React hooks</h3>
        <CodeBlock
          language="tsx"
          code={`import { useTrustScore, useIsInWoT } from "nostr-wot-sdk/react";

function FollowBadge({ pubkey }: { pubkey: string }) {
  const score = useTrustScore(pubkey);   // 0..1 or null
  const isInWoT = useIsInWoT(pubkey);
  return isInWoT ? <Badge score={score} /> : null;
}`}
        />

        <h3>Vanilla API</h3>
        <CodeBlock
          language="typescript"
          code={`import { WoT } from "@nostr-wot/wot";

const wot = new WoT({ rootPubkey: "hex-pubkey", maxHops: 2 });

const result = await wot.getDistance("hex-target-pubkey");
// → { hops: 1, paths: [...], score: 0.87 } | null

const trusted = await wot.isInWoT("hex-target-pubkey"); // boolean`}
        />

        <div className="not-prose my-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Prefer server-side scoring at scale?</strong> Use the{" "}
            <Link href="/docs/oracle" className="underline">WoT Oracle REST API</Link> — no user
            extension, sub-millisecond cached queries.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className="not-prose mt-12 flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/docs/extension"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Extension API
        </Link>
        <Link
          href="/docs/oracle"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          Oracle API
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
