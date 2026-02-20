import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CodeBlock, TerminalBlock } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs");
  const title = `${t("quickStart.title")} | ${t("meta.title")}`;
  const description = "Get started with Nostr Web of Trust in minutes. Quick start guide for browser extension and Oracle API.";

  return {
    title,
    description,
    alternates: generateAlternates("/docs/getting-started", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/docs/getting-started",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function GettingStartedPage() {
  const t = await getTranslations("docs");

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>{t("quickStart.title")}</h1>

      <p className="lead text-xl text-gray-600 dark:text-gray-400">
        Get up and running with Web of Trust in just a few minutes.
      </p>

      <h2>{t("quickStart.browser")}</h2>

      <p>
        For client-side applications, use the browser extension API. Users will need the{" "}
        <Link href="/download">WoT Extension</Link> installed.
      </p>

      <h3>1. Check for Extension</h3>

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

      <h3>2. Query Trust Distance</h3>

      <CodeBlock
        language="javascript"
        code={`// Get distance to a pubkey
const distance = await window.nostr.wot.getDistance(
  "npub1targetpubkey..."
);

if (distance !== null && distance <= 2) {
  // Within web of trust
  console.log(\`Trusted: \${distance} hops away\`);
} else {
  // Outside web of trust or not connected
  console.log("Not in your web of trust");
}`}
      />

      <div className="not-prose my-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Distance values: 0 = yourself, 1 = direct follow, 2 = follow of follow, null = not connected.
        </p>
      </div>

      <h2>{t("quickStart.server")}</h2>

      <p>
        For server-side applications, use the Oracle REST API. No extension required.
      </p>

      <h3>Using fetch</h3>

      <CodeBlock
        language="javascript"
        code={`const response = await fetch(
  \`https://wot-oracle.mappingbitcoin.com/distance?\` +
  \`from=\${fromPubkey}&to=\${toPubkey}\`
);
const data = await response.json();

console.log(\`Distance: \${data.distance}\`);
console.log(\`Paths: \${data.paths}\`);
console.log(\`Mutual follow: \${data.mutual}\`);`}
      />

      <h3>Using cURL</h3>

      <TerminalBlock
        commands={[
          'curl "https://wot-oracle.mappingbitcoin.com/distance?from=82341f...&to=3bf0c6..."',
        ]}
      />

      <h2>Using the SDK</h2>

      <p>
        For TypeScript projects, install our SDK for type-safe Oracle API access:
      </p>

      <TerminalBlock commands={["npm install nostr-wot-sdk"]} />

      <CodeBlock
        language="typescript"
        code={`import { WoTClient } from "nostr-wot-sdk";

const client = new WoTClient({
  baseUrl: "https://wot-oracle.mappingbitcoin.com",
});

const result = await client.getDistance(fromPubkey, toPubkey);
console.log(result.distance);`}
      />

      <h2>Next Steps</h2>

      <div className="not-prose grid md:grid-cols-3 gap-4 my-6">
        <Link
          href="/docs/extension"
          className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors"
        >
          <h4 className="font-semibold mb-1">Extension API</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Full browser extension reference
          </p>
        </Link>

        <Link
          href="/docs/sdk"
          className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors"
        >
          <h4 className="font-semibold mb-1">SDK Reference</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            TypeScript SDK documentation
          </p>
        </Link>

        <Link
          href="/docs/oracle"
          className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors"
        >
          <h4 className="font-semibold mb-1">Oracle API</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            REST API endpoints reference
          </p>
        </Link>
      </div>
    </article>
  );
}
