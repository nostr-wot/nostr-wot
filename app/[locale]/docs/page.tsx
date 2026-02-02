import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LinkButton } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("docs.meta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function DocsPage() {
  const t = await getTranslations("docs");

  return (
    <main>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">{t("sidebar.gettingStarted")}</h3>
                <ul className="space-y-2">
                  <li><a href="#overview" className="text-gray-600 dark:text-gray-400 hover:text-primary">{t("sidebar.overview")}</a></li>
                  <li><a href="#quick-start" className="text-gray-600 dark:text-gray-400 hover:text-primary">{t("sidebar.quickStart")}</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">{t("sidebar.extensionApi")}</h3>
                <ul className="space-y-2">
                  <li><a href="#ext-setup" className="text-gray-600 dark:text-gray-400 hover:text-primary">{t("sidebar.setup")}</a></li>
                  <li><a href="#ext-getdistance" className="text-gray-600 dark:text-gray-400 hover:text-primary">getDistance</a></li>
                  <li><a href="#ext-isinmywot" className="text-gray-600 dark:text-gray-400 hover:text-primary">isInMyWoT</a></li>
                  <li><a href="#ext-getdistancebetween" className="text-gray-600 dark:text-gray-400 hover:text-primary">getDistanceBetween</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">{t("sidebar.oracleApi")}</h3>
                <ul className="space-y-2">
                  <li><a href="#oracle-distance" className="text-gray-600 dark:text-gray-400 hover:text-primary">GET /distance</a></li>
                  <li><a href="#oracle-batch" className="text-gray-600 dark:text-gray-400 hover:text-primary">POST /distance/batch</a></li>
                  <li><a href="#oracle-stats" className="text-gray-600 dark:text-gray-400 hover:text-primary">GET /stats</a></li>
                  <li><a href="#oracle-health" className="text-gray-600 dark:text-gray-400 hover:text-primary">GET /health</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">{t("sidebar.resources")}</h3>
                <ul className="space-y-2">
                  <li><Link href="/download" className="text-gray-600 dark:text-gray-400 hover:text-primary">{t("sidebar.extensionGuide")}</Link></li>
                  <li><Link href="/oracle" className="text-gray-600 dark:text-gray-400 hover:text-primary">{t("sidebar.oracleGuide")}</Link></li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <section id="overview" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("overview.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("overview.description")}
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                  <li>
                    <strong className="text-gray-900 dark:text-white">{t("overview.extension.title")}</strong> - {t("overview.extension.description")}{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">{t("overview.extension.api")}</code> {t("overview.extension.forClientSide")}
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-white">{t("overview.oracle.title")}</strong> - {t("overview.oracle.description")}
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("overview.fundamentalQuestion")} <em>{t("overview.question")}</em>
                </p>
              </section>

              <section id="quick-start" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("quickStart.title")}</h2>

                <h3 className="text-lg font-semibold mb-3">{t("quickStart.browser")}</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`// Check if extension is available
if (window.nostr?.wot) {
  // Get distance to a pubkey
  const distance = await window.nostr.wot.getDistance(
    "npub1targetpubkey..."
  );

  if (distance !== null && distance <= 2) {
    // Within web of trust
    console.log(\`Trusted: \${distance} hops away\`);
  } else {
    // Outside web of trust or not connected
    console.log("Not in your web of trust");
  }
}`}</code>
                  </pre>
                </div>

                <h3 className="text-lg font-semibold mb-3">{t("quickStart.server")}</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`// Using fetch
const response = await fetch(
  \`https://wot-oracle.mappingbitcoin.com/distance?\` +
  \`from=\${fromPubkey}&to=\${toPubkey}\`
);
const data = await response.json();

console.log(\`Distance: \${data.distance}\`);
console.log(\`Paths: \${data.paths}\`);
console.log(\`Mutual follow: \${data.mutual}\`);`}</code>
                  </pre>
                </div>
              </section>

              <section id="ext-setup" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("extensionSetup.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("extensionSetup.description")} <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">{t("extensionSetup.api")}</code> {t("extensionSetup.objectInto")}
                </p>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`// Feature detection
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
}`}</code>
                  </pre>
                </div>
              </section>

              <section id="ext-getdistance" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{t("getDistance.title")}</code>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("getDistance.description")}
                </p>

                <h3 className="text-lg font-semibold mb-3">{t("getDistance.parameters")}</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 font-semibold">Name</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-sm">targetPubkey</code></td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">string</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Hex or npub format pubkey</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-3">{t("getDistance.returns")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">Promise&lt;number | null&gt;</code> - {t("getDistance.returnsDescription")}{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">{t("getDistance.null")}</code> {t("getDistance.ifNotConnected")}
                </p>

                <h3 className="text-lg font-semibold mb-3">{t("getDistance.example")}</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`const distance = await window.nostr.wot.getDistance(
  "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"
);

switch (distance) {
  case null:
    console.log("Not connected");
    break;
  case 0:
    console.log("This is you");
    break;
  case 1:
    console.log("Direct follow");
    break;
  default:
    console.log(\`\${distance} hops away\`);
}`}</code>
                  </pre>
                </div>
              </section>

              <section id="ext-isinmywot" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{t("isInMyWot.title")}</code>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("isInMyWot.description")}
                </p>

                <h3 className="text-lg font-semibold mb-3">{t("isInMyWot.parameters")}</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 font-semibold">Name</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Default</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-sm">targetPubkey</code></td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">string</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">-</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Hex or npub format pubkey</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-sm">maxHops</code></td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">number</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">3</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Maximum hops to consider &quot;trusted&quot;</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-3">{t("isInMyWot.returns")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">Promise&lt;boolean&gt;</code>
                </p>

                <h3 className="text-lg font-semibold mb-3">{t("isInMyWot.example")}</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`// Check with default threshold (3 hops)
const trusted = await window.nostr.wot.isInMyWoT(pubkey);

// Stricter check (2 hops)
const veryTrusted = await window.nostr.wot.isInMyWoT(pubkey, 2);

// Filter a list of pubkeys
const pubkeys = ["npub1...", "npub2...", "npub3..."];
const trusted = await Promise.all(
  pubkeys.map(p => window.nostr.wot.isInMyWoT(p, 2))
);
const trustedPubkeys = pubkeys.filter((_, i) => trusted[i]);`}</code>
                  </pre>
                </div>
              </section>

              <section id="ext-getdistancebetween" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{t("getDistanceBetween.title")}</code>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("getDistanceBetween.description")}
                </p>

                <h3 className="text-lg font-semibold mb-3">{t("getDistanceBetween.parameters")}</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 font-semibold">Name</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-sm">fromPubkey</code></td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">string</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Source pubkey</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-sm">toPubkey</code></td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">string</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Target pubkey</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-3">Returns</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">Promise&lt;number | null&gt;</code>
                </p>

                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`// Check how connected two other users are
const distance = await window.nostr.wot.getDistanceBetween(
  alicePubkey,
  bobPubkey
);

if (distance === 1) {
  console.log("Alice follows Bob directly");
}`}</code>
                  </pre>
                </div>
              </section>

              <section id="oracle-distance" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{t("oracleDistance.title")}</code>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("oracleDistance.description")}</p>

                <h3 className="text-lg font-semibold mb-3">{t("oracleDistance.queryParameters")}</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 font-semibold">Name</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Required</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-sm">from</code></td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">string</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Source pubkey (hex)</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-sm">to</code></td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">string</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td>
                        <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Target pubkey (hex)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`{
  "from": "3bf0c63f...",
  "to": "82341f88...",
  "distance": 2,
  "paths": 5,
  "mutual": false,
  "bridging_nodes": [
    "a1b2c3d4...",
    "e5f6g7h8..."
  ]
}`}</code>
                  </pre>
                </div>

                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`curl "https://wot-oracle.mappingbitcoin.com/distance?\\
from=3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d&\\
to=82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2"`}</code>
                  </pre>
                </div>
              </section>

              <section id="oracle-batch" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{t("oracleBatch.title")}</code>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("oracleBatch.description")}</p>

                <h3 className="text-lg font-semibold mb-3">{t("oracleBatch.requestBody")}</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`{
  "from": "3bf0c63f...",
  "targets": [
    "82341f88...",
    "a1b2c3d4...",
    "e5f6g7h8..."
  ]
}`}</code>
                  </pre>
                </div>

                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`{
  "from": "3bf0c63f...",
  "results": [
    { "to": "82341f88...", "distance": 2 },
    { "to": "a1b2c3d4...", "distance": 1 },
    { "to": "e5f6g7h8...", "distance": null }
  ]
}`}</code>
                  </pre>
                </div>

                <h3 className="text-lg font-semibold mb-3">Example</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`curl -X POST \\
  "https://wot-oracle.mappingbitcoin.com/distance/batch" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "3bf0c63f...",
    "targets": ["82341f88...", "a1b2c3d4..."]
  }'`}</code>
                  </pre>
                </div>
              </section>

              <section id="oracle-stats" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{t("oracleStats.title")}</code>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("oracleStats.description")}</p>

                <h3 className="text-lg font-semibold mb-3">{t("oracleStats.response")}</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`{
  "total_pubkeys": 1250000,
  "total_follows": 8500000,
  "last_sync": "2024-01-15T10:30:00Z",
  "cache_hit_rate": 0.85,
  "relays_connected": 3
}`}</code>
                  </pre>
                </div>
              </section>

              <section id="oracle-health" className="mb-16">
                <h2 className="text-2xl font-bold mb-4">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{t("oracleHealth.title")}</code>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t("oracleHealth.description")}</p>

                <h3 className="text-lg font-semibold mb-3">{t("oracleHealth.response")}</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`{
  "status": "healthy",
  "uptime": 864000,
  "version": "1.0.0"
}`}</code>
                  </pre>
                </div>
              </section>

              <section className="mb-16">
                <h2 className="text-2xl font-bold mb-4">{t("rateLimits.title")}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("rateLimits.description")}{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">{t("rateLimits.url")}</code> {t("rateLimits.hasLimits")}
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                  <li>{t("rateLimits.limits.requestsPerMinute")}</li>
                  <li>{t("rateLimits.limits.batchCount")}</li>
                  <li>{t("rateLimits.limits.headers")} <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">X-RateLimit-Remaining</code>,{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">X-RateLimit-Reset</code></li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("rateLimits.selfHost")} <Link href="/oracle" className="text-primary hover:underline">{t("rateLimits.selfHostLink")}</Link>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">{t("errorHandling.title")}</h2>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`// Extension API
try {
  const distance = await window.nostr.wot.getDistance(pubkey);
} catch (error) {
  if (error.message.includes("timeout")) {
    // Query took too long
  } else if (error.message.includes("offline")) {
    // Local mode and no cached data
  }
}

// Oracle API - HTTP status codes
// 200 - Success
// 400 - Invalid pubkey format
// 429 - Rate limited
// 500 - Server error`}</code>
                  </pre>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
