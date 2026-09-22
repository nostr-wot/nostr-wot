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
  const title = `${t("sidebar.oracleApi")} | ${t("meta.title")}`;
  const description = t("labels.oracleDescription");

  return {
    title,
    description,
    keywords: ["nostr wot oracle", "nostr trust api"],
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

const source = "a".repeat(64);
const target = "b".repeat(64);
const bridge = "c".repeat(64);
const baseUrl = "https://wot-oracle.mappingbitcoin.com";
const json = (value: unknown) => JSON.stringify(value, null, 2);
const distanceExample = {
  from: source, to: target, hops: 2, path_count: 1, mutual_follow: false,
};
const syncExample = {
  running: true, ready: false, last_event_received_at: 0, last_persisted_at: 0,
  persisted_events: 0, lagged_notifications: 0, persistence_errors: 0,
  coverage: "configured_relays_only",
};

function Endpoint({ id, method, path, description, children }: {
  id: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24 pb-8 border-b border-gray-200 dark:border-gray-800">
      <h3 className="flex items-center gap-3 mb-3">
        <span className={`px-2 py-1 text-xs font-bold rounded ${method === "GET"
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}>
          {method}
        </span>
        <code className="text-lg font-semibold">{path}</code>
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      {children}
    </section>
  );
}

async function DistanceParameters() {
  const t = await getTranslations("docs");
  return (
    <ul>
      <li>{t.rich("oracleApi.distanceKeys", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</li>
      <li>{t.rich("oracleApi.maxHops", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</li>
      <li>{t.rich("oracleApi.includeBridges", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</li>
      <li>{t.rich("oracleApi.bypassCache", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</li>
    </ul>
  );
}

async function PaginationParameters() {
  const t = await getTranslations("docs");
  return (
    <p>{t.rich("oracleApi.pagination", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
  );
}

export default async function OracleDocsPage() {
  const t = await getTranslations("docs");
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <ScrollReveal animation="fade-up">
        <h1>{t("oracleApi.title")}</h1>
        <p className="lead text-xl text-gray-600 dark:text-gray-400">{t("oracleApi.intro")}</p>
      </ScrollReveal>

      <section id="servers" className="scroll-mt-24">
        <h2>{t("oracleApi.serversTitle")}</h2>
        <p>{t.rich("oracleApi.baseUrl", { link0: chunks => <a href={baseUrl}>{chunks}</a> })}</p>
        <p>{t.rich("oracleApi.requestFormat", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <p>{t.rich("oracleApi.rootDescription", { code: chunks => <InlineCode>{chunks}</InlineCode>, link0: chunks => <Link href="/oracle">{chunks}</Link> })}</p>
        <p>{t("oracleApi.distanceEvidence")}</p>
      </section>

      <h2>{t("oracleApi.endpoints")}</h2>
      <Endpoint id="health" method="GET" path="/health" description={t("oracleApi.healthDescription")}>
        <CodeBlock language="json" code={json({ status: "healthy", version: "0.3.0" })} />
        <TerminalBlock commands={[`curl "${baseUrl}/health"`]} />
        <p>{t.rich("oracleApi.healthReadiness", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
      </Endpoint>

      <Endpoint id="ready" method="GET" path="/ready" description={t("oracleApi.readyDescription")}>
        <p>{t("oracleApi.readyDetails")}</p>
        <CodeBlock language="json" code={json(syncExample)} />
        <p>{t.rich("oracleApi.timestamps", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
      </Endpoint>

      <Endpoint id="stats" method="GET" path="/stats" description={t("oracleApi.statsDescription")}>
        <CodeBlock language="json" code={json({
          node_count: 3, edge_count: 2, nodes_with_follows: 2,
          mute_edge_count: 0, nodes_with_mute_lists: 1,
          sync: syncExample,
          cache: { size: 0, capacity: 100000, ttl_secs: 300 },
          locks: { write_lock_count: 0, write_lock_avg_us: 0, write_lock_max_us: 0,
            read_lock_count: 0, read_lock_avg_us: 0, read_lock_max_us: 0 },
        })} />
        <p>{t.rich("oracleApi.statsDetails", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
      </Endpoint>

      <Endpoint id="distance" method="GET" path="/distance" description={t("oracleApi.distanceDescription")}>
        <DistanceParameters />
        <CodeBlock language="json" code={json(distanceExample)} />
        <p>{t.rich("oracleApi.distanceResult", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <p>{t.rich("oracleApi.pathCounts", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <TerminalBlock commands={[`curl "${baseUrl}/distance?from=${source}&to=${target}&max_hops=3"`]} />
      </Endpoint>

      <Endpoint id="batch" method="POST" path="/distance/batch" description={t("oracleApi.batchDescription")}>
        <p>{t.rich("oracleApi.batchFields", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <h4>{t("oracleApi.request")}</h4>
        <CodeBlock language="json" code={json({ from: source, targets: [target], max_hops: 3 })} />
        <h4>{t("oracleApi.response")}</h4>
        <CodeBlock language="json" code={json({ from: source, results: [distanceExample] })} />
        <p>{t.rich("oracleApi.batchResult", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
      </Endpoint>

      <Endpoint id="path" method="GET" path="/path" description={t("oracleApi.pathDescription")}>
        <p>{t.rich("oracleApi.pathParameters", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <CodeBlock language="json" code={json({ from: source, to: target, path: [bridge] })} />
        <p>{t.rich("oracleApi.pathResult", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
      </Endpoint>

      <Endpoint id="follows" method="GET" path="/follows" description={t("oracleApi.followsDescription")}>
        <PaginationParameters />
        <CodeBlock language="json" code={json({ pubkey: source, follows: [bridge], total: 1 })} />
        <p>{t.rich("oracleApi.unknownPubkey", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
      </Endpoint>

      <Endpoint id="common-follows" method="GET" path="/common-follows" description={t("oracleApi.commonFollowsDescription")}>
        <p>{t.rich("oracleApi.commonFollowsParameters", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <CodeBlock language="json" code={json({ from: source, to: target, common_follows: [bridge] })} />
        <TerminalBlock commands={[`curl "${baseUrl}/common-follows?from=${source}&to=${target}"`]} />
      </Endpoint>

      <Endpoint id="mutes" method="GET" path="/mutes" description={t("oracleApi.mutesDescription")}>
        <PaginationParameters />
        <CodeBlock language="json" code={json({ pubkey: source, mutes: [], total: 0, public_list_known: true })} />
        <p>{t.rich("oracleApi.muteListStates", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
      </Endpoint>

      <Endpoint id="trust" method="GET" path="/trust" description={t("oracleApi.trustDescription")}>
        <DistanceParameters />
        <CodeBlock language="json" code={json({
          follow_distance: distanceExample,
          public_mute_evidence: {
            source_mutes_target: false, target_mutes_source: false,
            followed_muters: [bridge], source_mute_list_known: true, target_mute_list_known: false,
          },
        })} />
        <p>{t.rich("oracleApi.followedMuters", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <p>{t("oracleApi.mutePolicy")}</p>
      </Endpoint>

      <section id="freshness" className="scroll-mt-24">
        <h2>{t("oracleApi.freshnessTitle")}</h2>
        <p>{t.rich("oracleApi.freshnessDescription", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <p>{t.rich("oracleApi.profilesUnavailable", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
      </section>

      <section id="errors" className="scroll-mt-24">
        <h2>{t("oracleApi.errorsTitle")}</h2>
        <p>{t.rich("oracleApi.rateLimits", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <p>{t.rich("oracleApi.errorResponse", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</p>
        <CodeBlock language="json" code={json({ error: "Invalid pubkey format", code: "INVALID_PUBKEY" })} />
        <ul>
          <li>{t.rich("oracleApi.badRequest", { strong: chunks => <strong>{chunks}</strong>, code: chunks => <InlineCode>{chunks}</InlineCode> })}</li>
          <li>{t.rich("oracleApi.bodyTooLarge", { strong: chunks => <strong>{chunks}</strong> })}</li>
          <li>{t.rich("oracleApi.rateLimited", { strong: chunks => <strong>{chunks}</strong> })}</li>
          <li>{t.rich("oracleApi.internalError", { strong: chunks => <strong>{chunks}</strong>, code: chunks => <InlineCode>{chunks}</InlineCode> })}</li>
          <li>{t.rich("oracleApi.unavailable", { strong: chunks => <strong>{chunks}</strong>, code: chunks => <InlineCode>{chunks}</InlineCode> })}</li>
        </ul>
        <p>{t("oracleApi.retryAdvice")}</p>
      </section>

      <div className="not-prose mt-12 flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link href="/docs/sdk" className="text-gray-600 dark:text-gray-400 hover:text-primary">{t("oracleApi.sdkReference")}</Link>
        <a href="https://github.com/nostr-wot/nostr-wot-oracle/blob/v0.3.0/docs/API.md" className="text-gray-600 dark:text-gray-400 hover:text-primary">{t("oracleApi.source")}</a>
        <Link href="/oracle" className="text-gray-600 dark:text-gray-400 hover:text-primary">{t("oracleApi.selfHost")}</Link>
      </div>
    </article>
  );
}
