import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CodeBlock, InlineCode, TerminalBlock } from "@/components/ui";
import { generateAlternates } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs");
  return {
    title: `SDK Reference | ${t("meta.title")}`,
    description: "TypeScript SDK for the Nostr Web of Trust Oracle API. Type-safe methods, React hooks, and error handling.",
    alternates: generateAlternates("/docs/sdk", locale as Locale),
  };
}

export default async function SDKDocsPage() {

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>SDK Reference</h1>

      <p className="lead text-xl text-gray-600 dark:text-gray-400">
        TypeScript SDK for the Oracle API with full type safety, React hooks, and comprehensive error handling.
      </p>

      {/* Installation */}
      <section id="setup" className="scroll-mt-24">
        <h2>Installation</h2>
        <TerminalBlock commands={["npm install nostr-wot-sdk"]} />

        <h3>Basic Setup</h3>
        <CodeBlock
          language="typescript"
          code={`import { WoTClient } from "nostr-wot-sdk";

const client = new WoTClient({
  baseUrl: "https://wot-oracle.mappingbitcoin.com",
  timeout: 5000,
  retries: 3,
});`}
        />

        <h3>Configuration Options</h3>
        <div className="not-prose overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Option</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Default</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>baseUrl</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">string</td><td className="p-3 border-t border-gray-200 dark:border-gray-700">-</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Oracle server URL (required)</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>timeout</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">number</td><td className="p-3 border-t border-gray-200 dark:border-gray-700">10000</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Request timeout in ms</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>retries</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">number</td><td className="p-3 border-t border-gray-200 dark:border-gray-700">2</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Number of retry attempts</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>headers</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">object</td><td className="p-3 border-t border-gray-200 dark:border-gray-700">{"{}"}</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Custom headers for requests</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Core Methods */}
      <section id="core" className="scroll-mt-24">
        <h2>Core Methods</h2>

        <h3><InlineCode>getDistance(from, to, options?)</InlineCode></h3>
        <p>Get the hop distance between two pubkeys.</p>
        <CodeBlock
          language="typescript"
          code={`const result = await client.getDistance(fromPubkey, toPubkey);

console.log(result.distance);    // number | null
console.log(result.paths);       // number
console.log(result.mutual);      // boolean

// With options
const result = await client.getDistance(from, to, {
  maxHops: 4,
  includeDetails: true,
});`}
        />

        <h3><InlineCode>isInWoT(from, to, maxHops?)</InlineCode></h3>
        <p>Boolean check if target is within source&apos;s web of trust.</p>
        <CodeBlock
          language="typescript"
          code={`const trusted = await client.isInWoT(fromPubkey, toPubkey);

// With custom threshold
const veryTrusted = await client.isInWoT(fromPubkey, toPubkey, 2);`}
        />

        <h3><InlineCode>getFollows(pubkey)</InlineCode></h3>
        <p>Get the follow list for a pubkey.</p>
        <CodeBlock
          language="typescript"
          code={`const follows = await client.getFollows(pubkey);
console.log(\`Following \${follows.length} accounts\`);`}
        />

        <h3><InlineCode>getCommonFollows(pubkey1, pubkey2)</InlineCode></h3>
        <p>Get accounts that both pubkeys follow.</p>
        <CodeBlock
          language="typescript"
          code={`const common = await client.getCommonFollows(alice, bob);
console.log(\`They both follow \${common.length} accounts\`);`}
        />
      </section>

      {/* Batch Operations */}
      <section id="batch" className="scroll-mt-24">
        <h2>Batch Operations</h2>

        <h3><InlineCode>getDistanceBatch(from, targets)</InlineCode></h3>
        <p>Get distances to multiple targets in a single request.</p>
        <CodeBlock
          language="typescript"
          code={`const results = await client.getDistanceBatch(fromPubkey, [
  "target1...",
  "target2...",
  "target3...",
]);

// Returns array of results
results.forEach(r => {
  console.log(\`\${r.to}: \${r.distance} hops\`);
});`}
        />

        <div className="not-prose my-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Limit:</strong> Maximum 100 targets per batch request.
          </p>
        </div>
      </section>

      {/* Graph Queries */}
      <section id="graph" className="scroll-mt-24">
        <h2>Graph Queries</h2>

        <h3><InlineCode>getPath(from, to)</InlineCode></h3>
        <p>Get the shortest path between two pubkeys.</p>
        <CodeBlock
          language="typescript"
          code={`const path = await client.getPath(fromPubkey, toPubkey);

if (path) {
  console.log("Connection path:", path.join(" → "));
}`}
        />

        <h3><InlineCode>getStats()</InlineCode></h3>
        <p>Get server statistics.</p>
        <CodeBlock
          language="typescript"
          code={`const stats = await client.getStats();

console.log(\`Total users: \${stats.total_users}\`);
console.log(\`Total follows: \${stats.total_follows}\`);
console.log(\`Uptime: \${stats.uptime}\`);`}
        />

        <h3><InlineCode>checkHealth()</InlineCode></h3>
        <p>Check if the server is healthy.</p>
        <CodeBlock
          language="typescript"
          code={`const healthy = await client.checkHealth();
if (!healthy) {
  console.error("Oracle server is down");
}`}
        />
      </section>

      {/* Configuration */}
      <section id="config" className="scroll-mt-24">
        <h2>Configuration</h2>

        <h3>Multiple Servers</h3>
        <p>You can create multiple clients for different servers:</p>
        <CodeBlock
          language="typescript"
          code={`const publicOracle = new WoTClient({
  baseUrl: "https://wot-oracle.mappingbitcoin.com",
});

const privateOracle = new WoTClient({
  baseUrl: "https://my-oracle.example.com",
  headers: { "Authorization": "Bearer my-token" },
});`}
        />

        <h3>Custom Fetch</h3>
        <p>Provide your own fetch implementation:</p>
        <CodeBlock
          language="typescript"
          code={`const client = new WoTClient({
  baseUrl: "https://wot-oracle.mappingbitcoin.com",
  fetch: customFetch,
});`}
        />
      </section>

      {/* Error Handling */}
      <section id="errors" className="scroll-mt-24">
        <h2>Error Handling</h2>

        <p>The SDK throws typed errors for different failure scenarios:</p>
        <CodeBlock
          language="typescript"
          code={`import { WoTError, WoTValidationError, WoTNetworkError } from "nostr-wot-sdk";

try {
  const result = await client.getDistance(from, to);
} catch (error) {
  if (error instanceof WoTValidationError) {
    console.error("Invalid input:", error.message);
  } else if (error instanceof WoTNetworkError) {
    console.error("Network error:", error.message);
    console.log("Retry after:", error.retryAfter);
  } else if (error instanceof WoTError) {
    console.error("WoT error:", error.code, error.message);
  }
}`}
        />

        <h3>Error Types</h3>
        <div className="not-prose overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Error</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>WoTValidationError</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Invalid pubkey format or parameters</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>WoTNetworkError</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Connection timeout, server unreachable</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>WoTRateLimitError</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Rate limit exceeded (429)</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>WoTServerError</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Internal server error (500)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* React Integration */}
      <section id="react" className="scroll-mt-24">
        <h2>React Integration</h2>

        <h3>Provider Setup</h3>
        <CodeBlock
          language="tsx"
          code={`import { WoTProvider } from "nostr-wot-sdk/react";

function App() {
  return (
    <WoTProvider baseUrl="https://wot-oracle.mappingbitcoin.com">
      <MyApp />
    </WoTProvider>
  );
}`}
        />

        <h3><InlineCode>useDistance</InlineCode></h3>
        <CodeBlock
          language="tsx"
          code={`import { useDistance } from "nostr-wot-sdk/react";

function TrustBadge({ from, to }: { from: string; to: string }) {
  const { distance, loading, error } = useDistance(from, to);

  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  if (distance === null) return <span>Not connected</span>;

  return <span>{distance} hops away</span>;
}`}
        />

        <h3><InlineCode>useIsInWoT</InlineCode></h3>
        <CodeBlock
          language="tsx"
          code={`import { useIsInWoT } from "nostr-wot-sdk/react";

function TrustedIndicator({ from, to }: { from: string; to: string }) {
  const { trusted, loading } = useIsInWoT(from, to, 2);

  if (loading) return null;
  return trusted ? <span className="text-green-500">Trusted</span> : null;
}`}
        />

        <h3><InlineCode>useWoTClient</InlineCode></h3>
        <CodeBlock
          language="tsx"
          code={`import { useWoTClient } from "nostr-wot-sdk/react";

function MyComponent() {
  const client = useWoTClient();

  const handleClick = async () => {
    const result = await client.getDistance(from, to);
    // ...
  };

  return <button onClick={handleClick}>Check</button>;
}`}
        />
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
