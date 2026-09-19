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
        <h2>Query the Oracle from a browser or server</h2>

      <p>
        Oracle v0.3.0 supports standard fetch requests. Use full 64-character hexadecimal public keys.
        No extension or SDK is required.
      </p>

      <h3>Query follow distance</h3>

      <CodeBlock
        language="typescript"
        code={`async function getFollowDistance(from: string, to: string) {
  const query = new URLSearchParams({ from, to, max_hops: "2" });
  const response = await fetch(
    "https://wot-oracle.mappingbitcoin.com/distance?" + query
  );
  if (!response.ok) throw new Error("Oracle HTTP " + response.status);
  const data = await response.json();
  return data.hops as number | null;
}

// Replace with real public keys before querying.
const hops = await getFollowDistance("a".repeat(64), "b".repeat(64));
console.log(hops === null ? "No indexed path within 2 hops" : hops);`}
      />

      <div className="not-prose my-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Hop values:</strong> 0 = yourself, 1 = direct follow, 2 = follow of follow.
          A null result means no path was found within the requested depth in the indexed graph.
          Coverage depends on the configured relays. The extension provides signing and identity; it does not answer graph queries.
        </p>
      </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={150}>
        <h2>{t("quickStart.server")}</h2>

      <p>
        For server-side applications, use the Oracle REST API. No extension required.
      </p>

      <h3>Include public mute evidence</h3>

      <CodeBlock
        language="javascript"
        code={`const from = "a".repeat(64); // Replace with source pubkey
const to = "b".repeat(64); // Replace with target pubkey
const query = new URLSearchParams({ from, to, max_hops: "3" });
const response = await fetch(
  "https://wot-oracle.mappingbitcoin.com/trust?" + query
);
if (!response.ok) throw new Error("Oracle HTTP " + response.status);
const { follow_distance, public_mute_evidence } = await response.json();
console.log(follow_distance.hops, follow_distance.path_count);
console.log(public_mute_evidence.source_mutes_target);
console.log(public_mute_evidence.source_mute_list_known);`}
      />
      <p>
        Follow distance and public kind-10000 mute observations are separate evidence. The API does not
        combine them into a numeric score or decrypt private mute entries. Unknown mute lists and lists
        with no public entries are different states. Define your application&apos;s policy explicitly.
      </p>

      <h3>Using cURL</h3>

      <TerminalBlock
        commands={[
          'curl --fail-with-body "https://wot-oracle.mappingbitcoin.com/health"',
          'curl --fail-with-body "https://wot-oracle.mappingbitcoin.com/ready"',
        ]}
      />
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={200}>
        <h2>SDK compatibility</h2>

      <p>
        Published <InlineCode>@nostr-wot/wot@1.0.0</InlineCode> uses legacy remote endpoints and response
        fields that Oracle v0.3.0 does not expose. Remote SDK distance queries can report null after a 404,
        so do not interpret that as a verified graph result. Use the fetch examples above for this Oracle.
      </p>

      <p>
        The SDK&apos;s data, relay and identity packages remain useful independently. For local graph queries
        and React integration, see the <Link href="/docs/sdk#wot">verified SDK examples</Link>.
        <InlineCode>useTrustScore</InlineCode> is not part of the published WoT 1.0 API.
      </p>
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
