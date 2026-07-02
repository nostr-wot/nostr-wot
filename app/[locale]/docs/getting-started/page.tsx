import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CodeBlock, TerminalBlock, InlineCode, ScrollReveal } from "@/components/ui";
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
      <ScrollReveal animation="fade-up">
        <h1>{t("quickStart.title")}</h1>

        <p className="lead text-xl text-gray-600 dark:text-gray-400">
          Get up and running with Web of Trust in just a few minutes.
        </p>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={100}>
        <h2>Client-side (with the SDK)</h2>

      <p>
        For client-side applications, use the SDK&apos;s Web of Trust module. Install{" "}
        <InlineCode>nostr-wot-sdk</InlineCode> and query hop distance right in the browser.
      </p>

      <h3>1. Install</h3>

      <TerminalBlock commands={["npm install nostr-wot-sdk"]} />

      <h3>2. Query Trust Distance</h3>

      <CodeBlock
        language="typescript"
        code={`import { WoT } from "@nostr-wot/wot";

const wot = new WoT({ rootPubkey: "hex-your-pubkey", maxHops: 2 });

// Get hop distance to a target pubkey
const result = await wot.getDistance("hex-target-pubkey");

if (result && result.hops <= 2) {
  // Within web of trust
  console.log(\`Trusted: \${result.hops} hops away\`);
} else {
  // Outside web of trust or not connected
  console.log("Not in your web of trust");
}`}
      />

      <div className="not-prose my-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Hop values: 0 = yourself, 1 = direct follow, 2 = follow of follow, null = not connected. If the{" "}
          <Link href="/download">WoT extension</Link> is installed, the module answers queries from its locally-cached follow graph automatically.
        </p>
      </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={150}>
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
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={200}>
        <h2>Using the SDK in React</h2>

      <p>
        For React apps, wrap your tree in <InlineCode>{"<NostrSdkProvider>"}</InlineCode> — it wires up the
        data layer (profiles, notes, threads, engagement) and enables the Web of Trust module when you opt in.
        Trust hooks are then available anywhere.
      </p>

      <CodeBlock
        language="tsx"
        code={`import { NostrSdkProvider, useTrustScore } from "nostr-wot-sdk/react";

function App() {
  return (
    <NostrSdkProvider
      relays={["wss://relay.damus.io", "wss://nos.lol"]}
      wot={{ enabled: true, options: { maxHops: 2 } }}
    >
      <Feed />
    </NostrSdkProvider>
  );
}

function TrustBadge({ pubkey }: { pubkey: string }) {
  const score = useTrustScore(pubkey); // 0..1 or null
  return score !== null ? <span>Trusted</span> : null;
}`}
      />
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={250}>
        <h2>{t("quickStart.buildFromSource.title")}</h2>

        <p>{t("quickStart.buildFromSource.description")}</p>

        <TerminalBlock commands={[
          "git clone https://github.com/nostr-wot/nostr-wot-extension.git",
          "cd nostr-wot-extension && npm install && npm run build",
        ]} />

        <p>{t("quickStart.buildFromSource.loadInstructions")}</p>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={300}>
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
      </ScrollReveal>
    </article>
  );
}
