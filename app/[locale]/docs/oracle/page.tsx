import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CodeBlock, InlineCode, TerminalBlock } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs");
  const title = `Oracle API | ${t("meta.title")}`;
  const description = "REST API reference for the Nostr Web of Trust Oracle server. Endpoints for distance queries, batch operations, and graph data.";

  return {
    title,
    description,
    alternates: generateAlternates("/docs/oracle", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/docs/oracle",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

function Endpoint({ method, path, description, children }: {
  method: "GET" | "POST";
  path: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 scroll-mt-24 pb-8 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-2 py-1 text-xs font-bold rounded ${
          method === "GET"
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
        }`}>
          {method}
        </span>
        <code className="text-lg font-semibold">{path}</code>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      {children}
    </section>
  );
}

export default async function OracleDocsPage() {

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>Oracle API</h1>

      <p className="lead text-xl text-gray-600 dark:text-gray-400">
        REST API for server-side Web of Trust queries. No extension required.
      </p>

      {/* Public Servers */}
      <section id="servers" className="scroll-mt-24">
        <h2>Public Servers</h2>

        <div className="not-prose overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Server</th>
                <th className="text-left p-3 font-semibold">URL</th>
                <th className="text-left p-3 font-semibold">Rate Limit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-t border-gray-200 dark:border-gray-700">Primary</td>
                <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>https://wot-oracle.mappingbitcoin.com</code></td>
                <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">60 req/min</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          For higher rate limits or custom deployments, <Link href="/oracle">self-host the Oracle server</Link>.
        </p>
      </section>

      {/* Endpoints */}
      <h2 className="text-2xl font-bold mt-12 mb-6">Endpoints</h2>

      <Endpoint
        method="GET"
        path="/health"
        description="Check if the server is running and healthy."
      >
        <h4 className="font-semibold mb-2">Response</h4>
        <CodeBlock
          language="json"
          code={`{
  "status": "ok",
  "version": "1.0.0"
}`}
        />
        <h4 className="font-semibold mt-4 mb-2">Example</h4>
        <TerminalBlock commands={['curl "https://wot-oracle.mappingbitcoin.com/health"']} />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/stats"
        description="Get server statistics about the social graph."
      >
        <h4 className="font-semibold mb-2">Response</h4>
        <CodeBlock
          language="json"
          code={`{
  "total_users": 125000,
  "total_follows": 2500000,
  "last_updated": "2024-01-15T12:00:00Z",
  "uptime": "5d 12h 30m"
}`}
        />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/follows"
        description="Get the follow list for a pubkey."
      >
        <h4 className="font-semibold mb-2">Query Parameters</h4>
        <div className="not-prose overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Parameter</th>
                <th className="text-left p-3 font-semibold">Required</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>pubkey</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">64-character hex pubkey</td></tr>
            </tbody>
          </table>
        </div>
        <h4 className="font-semibold mb-2">Response</h4>
        <CodeBlock
          language="json"
          code={`{
  "pubkey": "82341f...",
  "follows": ["3bf0c6...", "fa984b...", "..."],
  "count": 150
}`}
        />
        <h4 className="font-semibold mt-4 mb-2">Example</h4>
        <TerminalBlock commands={['curl "https://wot-oracle.mappingbitcoin.com/follows?pubkey=82341f..."']} />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/common-follows"
        description="Get accounts that both pubkeys follow."
      >
        <h4 className="font-semibold mb-2">Query Parameters</h4>
        <div className="not-prose overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Parameter</th>
                <th className="text-left p-3 font-semibold">Required</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>pubkey1</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">First pubkey</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>pubkey2</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Second pubkey</td></tr>
            </tbody>
          </table>
        </div>
        <h4 className="font-semibold mb-2">Response</h4>
        <CodeBlock
          language="json"
          code={`{
  "pubkey1": "82341f...",
  "pubkey2": "3bf0c6...",
  "common": ["fa984b...", "..."],
  "count": 25
}`}
        />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/path"
        description="Get the shortest path between two pubkeys."
      >
        <h4 className="font-semibold mb-2">Query Parameters</h4>
        <div className="not-prose overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Parameter</th>
                <th className="text-left p-3 font-semibold">Required</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>from</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Source pubkey</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>to</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Target pubkey</td></tr>
            </tbody>
          </table>
        </div>
        <h4 className="font-semibold mb-2">Response</h4>
        <CodeBlock
          language="json"
          code={`{
  "from": "82341f...",
  "to": "3bf0c6...",
  "path": ["82341f...", "fa984b...", "3bf0c6..."],
  "hops": 2
}`}
        />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/distance"
        description="Get the hop distance between two pubkeys."
      >
        <h4 className="font-semibold mb-2">Query Parameters</h4>
        <div className="not-prose overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Parameter</th>
                <th className="text-left p-3 font-semibold">Required</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>from</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Source pubkey</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>to</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">Yes</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Target pubkey</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>max_hops</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700">No</td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Max hops to search (1-10, default: 4)</td></tr>
            </tbody>
          </table>
        </div>
        <h4 className="font-semibold mb-2">Response</h4>
        <CodeBlock
          language="json"
          code={`{
  "from": "82341f...",
  "to": "3bf0c6...",
  "distance": 2,
  "paths": 3,
  "mutual": false
}`}
        />
        <h4 className="font-semibold mt-4 mb-2">Example</h4>
        <TerminalBlock commands={['curl "https://wot-oracle.mappingbitcoin.com/distance?from=82341f...&to=3bf0c6..."']} />
      </Endpoint>

      <Endpoint
        method="POST"
        path="/distance/batch"
        description="Get distances to multiple targets in a single request."
      >
        <h4 className="font-semibold mb-2">Request Body</h4>
        <CodeBlock
          language="json"
          code={`{
  "from": "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
  "targets": ["3bf0c6...", "fa984b...", "..."]
}`}
        />
        <h4 className="font-semibold mt-4 mb-2">Response</h4>
        <CodeBlock
          language="json"
          code={`{
  "from": "82341f...",
  "results": [
    {
      "to": "3bf0c6...",
      "distance": 2,
      "paths": 1,
      "mutual": false
    },
    {
      "to": "fa984b...",
      "distance": 1,
      "paths": 1,
      "mutual": true
    }
  ]
}`}
        />
        <div className="not-prose my-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Limit:</strong> Maximum 100 targets per request.
          </p>
        </div>
        <h4 className="font-semibold mb-2">Example</h4>
        <TerminalBlock
          commands={[
            'curl -X POST "https://wot-oracle.mappingbitcoin.com/distance/batch" \\',
            '  -H "Content-Type: application/json" \\',
            '  -d \'{"from": "82341f...", "targets": ["3bf0c6...", "fa984b..."]}\''
          ]}
        />
      </Endpoint>

      {/* Error Handling */}
      <section id="errors" className="scroll-mt-24">
        <h2>Error Handling</h2>

        <p>All endpoints return errors in a consistent format:</p>
        <CodeBlock
          language="json"
          code={`{
  "error": "Invalid pubkey length: expected 64, got 32",
  "code": "INVALID_PUBKEY_LENGTH"
}`}
        />

        <h3>Error Codes</h3>
        <div className="not-prose overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold">Code</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>INVALID_PUBKEY_LENGTH</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Pubkey must be 64 characters</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>INVALID_PUBKEY_FORMAT</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Pubkey must be hexadecimal</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>INVALID_MAX_HOPS</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">max_hops must be 1-10</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>TOO_MANY_TARGETS</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Max 100 targets in batch</td></tr>
              <tr><td className="p-3 border-t border-gray-200 dark:border-gray-700"><code>INTERNAL_ERROR</code></td><td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Server error</td></tr>
            </tbody>
          </table>
        </div>

        <h3>HTTP Status Codes</h3>
        <ul>
          <li><strong>200</strong> - Success</li>
          <li><strong>400</strong> - Validation errors (invalid pubkey, parameters)</li>
          <li><strong>429</strong> - Rate limited (check <InlineCode>Retry-After</InlineCode> header)</li>
          <li><strong>500</strong> - Internal server error</li>
        </ul>

        <h3>Rate Limit Headers</h3>
        <p>All responses include rate limit information:</p>
        <ul>
          <li><InlineCode>X-RateLimit-Limit</InlineCode> - Requests per window</li>
          <li><InlineCode>X-RateLimit-Remaining</InlineCode> - Remaining requests</li>
          <li><InlineCode>X-RateLimit-Reset</InlineCode> - Seconds until reset</li>
        </ul>
      </section>

      {/* Navigation */}
      <div className="not-prose mt-12 flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/docs/sdk"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          SDK Reference
        </Link>
        <Link
          href="/oracle"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          Self-Host Guide
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
