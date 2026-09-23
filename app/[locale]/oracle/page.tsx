import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge, LinkButton, ExternalLinkButton, Section, SectionHeader, CodeBlock, TerminalBlock, InlineCode } from "@/components/ui";
import { ScrollReveal } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("oracle.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot oracle server", "nostr trust api"],
    alternates: generateAlternates("/oracle", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/oracle",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

const RELEASE_FACTS = [
  { key: "release", value: "0.3.0" },
  { key: "maxHops", value: "1–5" },
  { key: "batchTargets", value: "100" },
  { key: "eventKinds", value: "3 / 10000" },
];

const ARCHITECTURE_CARDS = ["graphStorage", "pathfinding", "caching", "rateLimiting"];

const CONFIG_ROWS = [
  { variable: "RELAYS", default: "wss://relay.damus.io,wss://nos.lol,wss://relay.primal.net/,wss://relay.mostr.pub/", key: "relays" },
  { variable: "HTTP_PORT", default: "8080", key: "httpPort" },
  { variable: "DB_PATH", default: "wot.db", key: "dbPath" },
  { variable: "RATE_LIMIT_PER_MINUTE", default: "100", key: "rateLimit" },
  { variable: "CACHE_SIZE", default: "10000", key: "cacheSize" },
  { variable: "CACHE_TTL_SECS", default: "300", key: "cacheTtl" },
];

const SELF_HOSTING_BLOCKS = [
  {
    key: "docker",
    code: `docker pull ghcr.io/nostr-wot/nostr-wot-oracle:0.3.0

docker run -d --name nostr-wot-oracle \\
  -p 127.0.0.1:8080:8080 \\
  -v wot-data:/app/data \\
  ghcr.io/nostr-wot/nostr-wot-oracle:0.3.0`,
  },
  {
    key: "dockerCompose",
    code: `git clone --branch v0.3.0 --depth 1 https://github.com/nostr-wot/nostr-wot-oracle.git
cd nostr-wot-oracle
docker compose up -d`,
  },
  {
    key: "fromSource",
    code: `git clone --branch v0.3.0 --depth 1 https://github.com/nostr-wot/nostr-wot-oracle.git
cd nostr-wot-oracle
rustup toolchain install 1.93.0
cargo +1.93.0 build --locked --release
./target/release/wot-oracle`,
  },
];

const source = "a".repeat(64);
const target = "b".repeat(64);
const json = (value: unknown) => JSON.stringify(value, null, 2);
const distance = { from: source, to: target, hops: 2, path_count: 1, mutual_follow: false };
const API_ENDPOINTS = [
  {
    key: "distance",
    request: `GET /distance?from=${source}&to=${target}&max_hops=3`,
    response: json(distance),
  },
  {
    key: "batch",
    request: `POST /distance/batch
Content-Type: application/json

${json({ from: source, targets: [target], max_hops: 3 })}`,
    response: json({ from: source, results: [distance] }),
  },
  {
    key: "stats",
    request: "GET /stats",
    response: json({
      node_count: 3, edge_count: 2, nodes_with_follows: 2,
      mute_edge_count: 0, nodes_with_mute_lists: 1,
      sync: { running: true, ready: false, last_event_received_at: 0,
        last_persisted_at: 0, persisted_events: 0, lagged_notifications: 0,
        persistence_errors: 0, coverage: "configured_relays_only" },
      cache: { size: 0, capacity: 10000, ttl_secs: 300 },
      locks: { write_lock_count: 0, write_lock_avg_us: 0, write_lock_max_us: 0,
        read_lock_count: 0, read_lock_avg_us: 0, read_lock_max_us: 0 },
    }),
  },
  {
    key: "health",
    request: "GET /health",
    response: json({ status: "healthy", version: "0.3.0" }),
  },
];

export default async function OraclePage() {
  const t = await getTranslations("oracle");

  // JSON-LD structured data
  // Using WebApplication type for API server (subtype of SoftwareApplication)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "WoT Oracle Server",
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "API Server",
    "operatingSystem": "Linux, Docker",
    "description": t("meta.description"),
    "url": "https://nostr-wot.com/oracle",
    "downloadUrl": "https://github.com/nostr-wot/nostr-wot-oracle/releases",
    "softwareVersion": "0.3.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Directed follow distance",
      "Public mute-list evidence",
      "Graph revision-aware query caching",
      "Self-hostable with Docker",
      "REST API with batch support",
    ],
    "author": {
      "@type": "Organization",
      "name": "Nostr Web of Trust",
      "url": "https://nostr-wot.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge className="mb-4">{t("hero.badge")}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">{t("hero.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ExternalLinkButton href="https://github.com/nostr-wot/nostr-wot-oracle">{t("hero.viewOnGitHub")}</ExternalLinkButton>
            <LinkButton href="/docs/oracle" variant="secondary">{t("hero.apiDocs")}</LinkButton>
          </div>
        </div>
      </section>

      {/* What It Does */}
      <Section padding="md">
        <SectionHeader title={t("whatItDoes.title")} />
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-4">{t("whatItDoes.description")}</p>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
          <strong className="text-gray-900 dark:text-white">{t("whatItDoes.example")}</strong> {t("whatItDoes.exampleText")}
        </p>
      </Section>

      {/* Performance */}
      <Section background="gray" padding="md">
        <SectionHeader title={t("performance.title")} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RELEASE_FACTS.map((stat, i) => (
            <ScrollReveal key={stat.key} animation="fade-up" delay={i * 100}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                <span className="block text-4xl font-bold text-primary mb-2">{stat.value}</span>
                <span className="text-gray-600 dark:text-gray-400">{t(`performance.${stat.key}`)}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* API Endpoints */}
      <Section padding="md">
        <SectionHeader title={t("apiEndpoints.title")} description={t("apiEndpoints.subtitle")} />
        <div className="space-y-8">
          {API_ENDPOINTS.map((endpoint) => (
            <div key={endpoint.key} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">
                <InlineCode>{t(`apiEndpoints.${endpoint.key}.title`)}</InlineCode>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t(`apiEndpoints.${endpoint.key}.description`)}</p>
              <div className="space-y-3">
                {endpoint.request && (
                  <CodeBlock code={endpoint.request} language="http" />
                )}
                <CodeBlock code={endpoint.response} language="json" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Self-Hosting */}
      <Section background="gray" padding="md">
        <SectionHeader title={t("selfHosting.title")} description={t("selfHosting.subtitle")} />
        <div className="space-y-6">
          {SELF_HOSTING_BLOCKS.map((block) => (
            <div key={block.key} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">{t(`selfHosting.${block.key}`)}</h3>
              <TerminalBlock commands={block.code.split("\n")} />
            </div>
          ))}
        </div>
      </Section>

      {/* Configuration */}
      <Section padding="md">
        <SectionHeader title={t("configuration.title")} description={t("configuration.subtitle")} />
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold">{t("configuration.table.variable")}</th>
                <th className="text-left p-4 font-semibold">{t("configuration.table.default")}</th>
                <th className="text-left p-4 font-semibold">{t("configuration.table.description")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {CONFIG_ROWS.map((row) => (
                <tr key={row.variable}>
                  <td className="p-4">
                    <InlineCode>{row.variable}</InlineCode>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 break-all">{row.default}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{t(`configuration.${row.key}.description`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Architecture */}
      <Section background="gray" padding="md">
        <SectionHeader title={t("architecture.title")} />
        <div className="grid md:grid-cols-2 gap-6">
          {ARCHITECTURE_CARDS.map((card, i) => (
            <ScrollReveal key={card} animation="fade-up" delay={i * 100}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-full">
                <h3 className="text-lg font-semibold mb-3">{t(`architecture.${card}.title`)}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t(`architecture.${card}.description`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Public Instance */}
      <Section padding="md">
        <SectionHeader title={t("publicInstance.title")} description={t("publicInstance.subtitle")} />
        <div className="max-w-xl mx-auto">
          <CodeBlock code="https://wot-oracle.mappingbitcoin.com" showCopy={true} />
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">{t("publicInstance.rateLimit")}</p>
      </Section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg text-white/80 mb-8">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ExternalLinkButton href="https://github.com/nostr-wot/nostr-wot-oracle" variant="white">{t("cta.viewSource")}</ExternalLinkButton>
            <LinkButton href="/download" variant="white-outline">{t("cta.learnExtension")}</LinkButton>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
