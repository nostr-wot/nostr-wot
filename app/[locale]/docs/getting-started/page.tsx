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
  const description = t("labels.startDescription");

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

        <p className="lead text-xl text-gray-600 dark:text-gray-400">{t("start.intro")}</p>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={100}>
        <h2>{t("start.queryTitle")}</h2>

      <p>{t("start.queryDescription")}</p>

      <h3>{t("start.distanceTitle")}</h3>

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
        <p className="text-sm text-blue-800 dark:text-blue-200">{t.rich("start.hopsDescription", { strong: chunks => <strong>{chunks}</strong> })}</p>
      </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={150}>
        <h2>{t("quickStart.server")}</h2>

      <p>{t("start.serverDescription")}</p>

      <h3>{t("start.mutesTitle")}</h3>

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
      <p>{t("start.mutesDescription")}</p>

      <h3>{t("start.curlTitle")}</h3>

      <TerminalBlock
        commands={[
          'curl --fail-with-body "https://wot-oracle.mappingbitcoin.com/health"',
          'curl --fail-with-body "https://wot-oracle.mappingbitcoin.com/ready"',
        ]}
      />
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={200}>
        <h2>{t("start.compatibilityTitle")}</h2>

      <p>{t.rich("start.compatibilityDescription", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>

      <p>{t.rich("start.sdkDescription", { link0: chunks => <Link href="/docs/sdk#wot">{chunks}</Link>, code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
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
        <h2>{t("start.nextSteps")}</h2>

        <div className="not-prose grid md:grid-cols-3 gap-4 my-6">
        <Link
          href="/docs/extension"
          className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors"
        >
          <h4 className="font-semibold mb-1">{t("start.extensionTitle")}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("start.extensionDescription")}</p>
        </Link>

        <Link
          href="/docs/sdk"
          className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors"
        >
          <h4 className="font-semibold mb-1">{t("start.sdkTitle")}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("start.sdkReferenceDescription")}</p>
        </Link>

        <Link
          href="/docs/oracle"
          className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors"
        >
          <h4 className="font-semibold mb-1">{t("start.oracleTitle")}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("start.oracleReferenceDescription")}</p>
        </Link>
        </div>
      </ScrollReveal>
    </article>
  );
}
