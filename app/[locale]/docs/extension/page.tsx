import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs");
  const title = `Extension API | ${t("meta.title")}`;
  const description = "Complete API reference for the Nostr Web of Trust browser extension. All methods for trust scoring and graph queries.";

  return {
    title,
    description,
    alternates: generateAlternates("/docs/extension", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/docs/extension",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

interface TableRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

function ParamTable({ rows, hasDefault }: { rows: TableRow[]; hasDefault?: boolean }) {
  return (
    <div className="overflow-x-auto mb-6 not-prose">
      <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="text-left p-3 font-semibold">Name</th>
            <th className="text-left p-3 font-semibold">Type</th>
            {hasDefault && <th className="text-left p-3 font-semibold">Default</th>}
            <th className="text-left p-3 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-primary">{row.name}</code></td>
              <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">{row.type}</td>
              {hasDefault && <td className="p-3 border-t border-gray-200 dark:border-gray-700">{row.default || "-"}</td>}
              <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MethodSection({ id, title, description, params, returns, example, children }: {
  id: string;
  title: string;
  description: string;
  params?: TableRow[];
  hasDefault?: boolean;
  returns: string;
  returnsDesc?: string;
  example: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24 pb-8 border-b border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold mb-3">
        <InlineCode>{title}</InlineCode>
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>

      {params && params.length > 0 && (
        <>
          <h4 className="font-semibold mb-2">Parameters</h4>
          <ParamTable rows={params} hasDefault={params.some(p => p.default)} />
        </>
      )}

      <h4 className="font-semibold mb-2">Returns</h4>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        <InlineCode>{returns}</InlineCode>
      </p>

      {children}

      <h4 className="font-semibold mb-2">Example</h4>
      <CodeBlock language="javascript" code={example} />
    </section>
  );
}

export default async function ExtensionDocsPage() {
  const t = await getTranslations("docs");

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>Extension API</h1>

      <p className="lead text-xl text-gray-600 dark:text-gray-400">
        The WoT Extension injects <InlineCode>window.nostr.wot</InlineCode> into every page for client-side trust queries.
      </p>

      <div className="not-prose my-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Prerequisite:</strong> Users must have the <Link href="/download" className="underline">WoT Extension</Link> installed and configured.
        </p>
      </div>

      {/* Setup */}
      <section id="setup" className="mb-12 scroll-mt-24">
        <h2>Setup</h2>
        <p>Always check for extension availability before using the API:</p>
        <CodeBlock
          language="javascript"
          code={`// Feature detection
function hasWoT() {
  return typeof window !== "undefined" &&
         window.nostr?.wot !== undefined;
}

// Wait for extension to load
async function waitForWoT(timeout = 3000) {
  const start = Date.now();
  while (!hasWoT() && Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 100));
  }
  return hasWoT();
}`}
        />
      </section>

      {/* Core Methods */}
      <h2 className="text-2xl font-bold mt-12 mb-6">Core Methods</h2>

      <MethodSection
        id="getdistance"
        title="getDistance(targetPubkey)"
        description="Returns the number of hops from your pubkey to the target."
        params={[{ name: "targetPubkey", type: "string", description: "Hex or npub format pubkey" }]}
        returns="Promise<number | null>"
        example={`const distance = await window.nostr.wot.getDistance(
  "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"
);

switch (distance) {
  case null: console.log("Not connected"); break;
  case 0: console.log("This is you"); break;
  case 1: console.log("Direct follow"); break;
  default: console.log(\`\${distance} hops away\`);
}`}
      />

      <MethodSection
        id="isinmywot"
        title="isInMyWoT(targetPubkey, maxHops?)"
        description="Boolean check if a pubkey is within your web of trust threshold."
        params={[
          { name: "targetPubkey", type: "string", description: "Hex or npub format pubkey" },
          { name: "maxHops", type: "number", default: "3", description: 'Maximum hops to consider "trusted"' },
        ]}
        returns="Promise<boolean>"
        example={`// Check with default threshold (3 hops)
const trusted = await window.nostr.wot.isInMyWoT(pubkey);

// Stricter check (2 hops)
const veryTrusted = await window.nostr.wot.isInMyWoT(pubkey, 2);`}
      />

      <MethodSection
        id="getdistancebetween"
        title="getDistanceBetween(fromPubkey, toPubkey)"
        description="Get the distance between any two pubkeys (not just from you)."
        params={[
          { name: "fromPubkey", type: "string", description: "Source pubkey" },
          { name: "toPubkey", type: "string", description: "Target pubkey" },
        ]}
        returns="Promise<number | null>"
        example={`const distance = await window.nostr.wot.getDistanceBetween(
  alicePubkey,
  bobPubkey
);

if (distance === 1) {
  console.log("Alice follows Bob directly");
}`}
      />

      <MethodSection
        id="gettrustscore"
        title="getTrustScore(targetPubkey)"
        description="Get a normalized trust score (0-1) based on distance and path count."
        params={[{ name: "targetPubkey", type: "string", description: "Hex or npub format pubkey" }]}
        returns="Promise<number | null>"
        example={`const score = await window.nostr.wot.getTrustScore(pubkey);

if (score === null) {
  console.log("Not connected");
} else if (score >= 0.7) {
  console.log("Highly trusted");
} else if (score >= 0.3) {
  console.log("Somewhat trusted");
} else {
  console.log("Low trust score");
}`}
      >
        <div className="not-prose bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <p className="font-mono text-sm mb-2">score = distanceWeight + pathBonus</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Distance Weights</p>
              <ul className="text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>1 hop: 1.0</li>
                <li>2 hops: 0.5</li>
                <li>3 hops: 0.25</li>
                <li>4+ hops: 0.1</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Path Bonuses</p>
              <ul className="text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>2 hops: +0.05 per path</li>
                <li>3 hops: +0.02 per path</li>
                <li>4+ hops: +0.01 per path</li>
                <li>Max bonus: 0.25</li>
              </ul>
            </div>
          </div>
        </div>
      </MethodSection>

      <MethodSection
        id="getdetails"
        title="getDetails(targetPubkey)"
        description="Get comprehensive trust information including distance, score, paths, and bridging nodes."
        params={[{ name: "targetPubkey", type: "string", description: "Hex or npub format pubkey" }]}
        returns="Promise<TrustDetails | null>"
        example={`const details = await window.nostr.wot.getDetails(pubkey);

if (details) {
  console.log(\`Distance: \${details.distance} hops\`);
  console.log(\`Trust score: \${details.score}\`);
  console.log(\`Connection paths: \${details.paths}\`);
  console.log(\`Mutual follow: \${details.mutual}\`);
  console.log(\`Bridging nodes: \${details.bridgingNodes.join(", ")}\`);
}`}
      />

      <MethodSection
        id="getconfig"
        title="getConfig()"
        description="Get the current extension configuration."
        returns="Promise<WoTConfig>"
        example={`const config = await window.nostr.wot.getConfig();

console.log(\`Mode: \${config.mode}\`); // "remote", "local", or "hybrid"
console.log(\`Max hops: \${config.maxHops}\`);
console.log(\`Timeout: \${config.timeout}ms\`);`}
      />

      {/* Batch Operations */}
      <h2 className="text-2xl font-bold mt-12 mb-6">Batch Operations</h2>

      <MethodSection
        id="getdistancebatch"
        title="getDistanceBatch(targets)"
        description="Get distances for multiple pubkeys in a single call."
        params={[{ name: "targets", type: "string[]", description: "Array of hex pubkeys" }]}
        returns="Promise<Record<string, number | null>>"
        example={`const distances = await window.nostr.wot.getDistanceBatch([
  "pubkey1...",
  "pubkey2...",
  "pubkey3..."
]);

// { "pubkey1...": 1, "pubkey2...": 2, "pubkey3...": null }`}
      />

      <MethodSection
        id="gettrustscorenbatch"
        title="getTrustScoreBatch(targets)"
        description="Get trust scores for multiple pubkeys in a single call."
        params={[{ name: "targets", type: "string[]", description: "Array of hex pubkeys" }]}
        returns="Promise<Record<string, number | null>>"
        example={`const scores = await window.nostr.wot.getTrustScoreBatch([
  "pubkey1...",
  "pubkey2...",
  "pubkey3..."
]);

// { "pubkey1...": 0.95, "pubkey2...": 0.45, "pubkey3...": null }`}
      />

      <MethodSection
        id="filterbywot"
        title="filterByWoT(pubkeys, maxHops?)"
        description="Filter a list of pubkeys to only those within the Web of Trust."
        params={[
          { name: "pubkeys", type: "string[]", description: "Array of hex pubkeys" },
          { name: "maxHops", type: "number", default: "3", description: "Override default max hops" },
        ]}
        returns="Promise<string[]>"
        example={`const allPubkeys = ["pk1...", "pk2...", "pk3...", "pk4..."];

// Filter to only trusted pubkeys (within 3 hops)
const trusted = await window.nostr.wot.filterByWoT(allPubkeys);

// Stricter filtering (2 hops)
const veryTrusted = await window.nostr.wot.filterByWoT(allPubkeys, 2);`}
      />

      {/* User Info */}
      <h2 className="text-2xl font-bold mt-12 mb-6">User Info</h2>

      <MethodSection
        id="getmypubkey"
        title="getMyPubkey()"
        description="Returns the configured user's pubkey."
        returns="Promise<string | null>"
        example={`const myPubkey = await window.nostr.wot.getMyPubkey();

if (myPubkey) {
  console.log(\`Configured as: \${myPubkey}\`);
} else {
  console.log("Extension not configured");
}`}
      />

      <MethodSection
        id="isconfigured"
        title="isConfigured()"
        description="Check if the extension is configured and ready."
        returns="Promise<ConfigStatus>"
        example={`const status = await window.nostr.wot.isConfigured();

if (status.configured) {
  console.log(\`Mode: \${status.mode}\`);
  console.log(\`Has local graph: \${status.hasLocalGraph}\`);
} else {
  console.log("Please configure the extension");
}`}
      />

      {/* Graph Queries */}
      <h2 className="text-2xl font-bold mt-12 mb-6">Graph Queries</h2>

      <MethodSection
        id="getfollows"
        title="getFollows(pubkey?)"
        description="Get the follow list for a pubkey."
        params={[{ name: "pubkey", type: "string", default: "user's pubkey", description: "Hex pubkey (defaults to user's pubkey)" }]}
        returns="Promise<string[]>"
        example={`// Get your own follows
const myFollows = await window.nostr.wot.getFollows();

// Get someone else's follows
const theirFollows = await window.nostr.wot.getFollows("pubkey...");

console.log(\`Following \${myFollows.length} accounts\`);`}
      />

      <MethodSection
        id="getcommonfollows"
        title="getCommonFollows(pubkey)"
        description="Get accounts that both you and the target follow."
        params={[{ name: "pubkey", type: "string", description: "Hex pubkey to compare with" }]}
        returns="Promise<string[]>"
        example={`const common = await window.nostr.wot.getCommonFollows(pubkey);
console.log(\`You both follow \${common.length} accounts\`);`}
      />

      <MethodSection
        id="getstats"
        title="getStats()"
        description="Get statistics about the local graph cache."
        returns="Promise<GraphStats>"
        example={`const stats = await window.nostr.wot.getStats();

console.log(\`Total users: \${stats.totalUsers}\`);
console.log(\`Total follows: \${stats.totalFollows}\`);
console.log(\`Last updated: \${stats.lastUpdated}\`);`}
      />

      <MethodSection
        id="getpath"
        title="getPath(targetPubkey)"
        description="Get the shortest path from you to the target pubkey."
        params={[{ name: "targetPubkey", type: "string", description: "Hex pubkey to find path to" }]}
        returns="Promise<string[] | null>"
        example={`const path = await window.nostr.wot.getPath(targetPubkey);

if (path) {
  console.log("Connection path:");
  path.forEach((pk, i) => {
    console.log(\`  \${i + 1}. \${pk}\`);
  });
} else {
  console.log("No path found");
}`}
      />

      {/* Navigation */}
      <div className="not-prose mt-12 flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/docs/getting-started"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Getting Started
        </Link>
        <Link
          href="/docs/sdk"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          SDK Reference
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
