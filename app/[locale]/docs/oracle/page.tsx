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
  const title = `Oracle API | ${t("meta.title")}`;
  const description = "REST API reference for the Nostr Web of Trust Oracle server. Version 0.3.0: follow distance, public mute evidence, readiness, batch operations and graph data.";

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

function DistanceParameters() {
  return (
    <ul>
      <li><InlineCode>from</InlineCode> and <InlineCode>to</InlineCode>: required source and target pubkeys.</li>
      <li><InlineCode>max_hops</InlineCode>: 1–5, default 3.</li>
      <li><InlineCode>include_bridges</InlineCode>: boolean, default false. Includes search meeting nodes when available.</li>
      <li><InlineCode>bypass_cache</InlineCode>: boolean, default false. Recomputes from the current indexed graph; does not fetch new relay data.</li>
    </ul>
  );
}

function PaginationParameters() {
  return (
    <p>
      Required <InlineCode>pubkey</InlineCode>; optional <InlineCode>offset</InlineCode> (default 0)
      and <InlineCode>limit</InlineCode> (default 500, capped at 5000).
      <InlineCode>total</InlineCode> is the full indexed list size, independent of the page size.
    </p>
  );
}

export default async function OracleDocsPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <ScrollReveal animation="fade-up">
        <h1>Oracle API</h1>
        <p className="lead text-xl text-gray-600 dark:text-gray-400">
          Version 0.3.0: directed follow distance and separate public mute evidence over HTTP. No extension required.
        </p>
      </ScrollReveal>

      <section id="servers" className="scroll-mt-24">
        <h2>Public server and request format</h2>
        <p>Base URL: <a href={baseUrl}>{baseUrl}</a>. No API key is required by the Oracle.</p>
        <p>
          Send pubkeys as full 64-character lowercase hexadecimal strings, not npubs.
          The examples use synthetic pubkeys to illustrate response shapes; your graph results will differ.
          POST requests use <InlineCode>Content-Type: application/json</InlineCode>.
        </p>
        <p>
          The root endpoint <InlineCode>GET /</InlineCode> lists the service version, documentation and available endpoints.
          For your own instance, see the <Link href="/oracle">self-hosting guide</Link>.
        </p>
        <p>
          Distances use directed kind-3 follow edges. Public kind-10000 mute lists are separate observations.
          The Oracle does not combine them into a trust score or remove muted accounts from follow paths.
        </p>
      </section>

      <h2>Endpoints</h2>
      <Endpoint id="health" method="GET" path="/health" description="Process liveness and release version.">
        <CodeBlock language="json" code={json({ status: "healthy", version: "0.3.0" })} />
        <TerminalBlock commands={[`curl "${baseUrl}/health"`]} />
        <p>A healthy process can still be waiting for relay events or unable to persist updates. Use <InlineCode>/ready</InlineCode> for ingestion readiness.</p>
      </Endpoint>

      <Endpoint id="ready" method="GET" path="/ready" description="Ingestion snapshot: HTTP 200 when ready, HTTP 503 otherwise.">
        <p>
          Readiness requires running ingestion, no current database failure and a follow or mute event received within five minutes.
          A quiet private relay can therefore yield 503 even while the process is operational.
          Example while waiting for the first event:
        </p>
        <CodeBlock language="json" code={json(syncExample)} />
        <p>
          Timestamps are Unix seconds, with zero meaning not yet observed.
          <InlineCode>persisted_events</InlineCode> counts accepted author updates written to storage after batch coalescing.
          <InlineCode>lagged_notifications</InlineCode> and <InlineCode>persistence_errors</InlineCode> expose ingestion problems.
        </p>
      </Endpoint>

      <Endpoint id="stats" method="GET" path="/stats" description="Indexed graph counts, cache settings, lock metrics and ingestion status.">
        <CodeBlock language="json" code={json({
          node_count: 3, edge_count: 2, nodes_with_follows: 2,
          mute_edge_count: 0, nodes_with_mute_lists: 1,
          sync: syncExample,
          cache: { size: 0, capacity: 100000, ttl_secs: 300 },
          locks: { write_lock_count: 0, write_lock_avg_us: 0, write_lock_max_us: 0,
            read_lock_count: 0, read_lock_avg_us: 0, read_lock_max_us: 0 },
        })} />
        <p>
          Counts and settings above are illustrative. <InlineCode>edge_count</InlineCode> counts follow edges;
          <InlineCode>mute_edge_count</InlineCode> counts public pubkey mute edges.
          <InlineCode>nodes_with_mute_lists</InlineCode> includes known lists with no public pubkey entries.
          Lock timings are in microseconds. The <InlineCode>sync</InlineCode> object has the same fields as <InlineCode>/ready</InlineCode>.
        </p>
      </Endpoint>

      <Endpoint id="distance" method="GET" path="/distance" description="Shortest directed follow distance from one pubkey to another.">
        <DistanceParameters />
        <CodeBlock language="json" code={json(distanceExample)} />
        <p>
          <InlineCode>hops</InlineCode> is zero for self-distance and one for a direct follow.
          A null value means no route was found within the requested depth in the indexed graph.
          It does not prove that no connection exists elsewhere on Nostr.
        </p>
        <p>
          <InlineCode>path_count</InlineCode> counts shortest directed paths, including when bridges are omitted;
          counts saturate at the maximum unsigned 64-bit integer.
          <InlineCode>mutual_follow</InlineCode> indicates a direct follow in both directions.
          Optional <InlineCode>bridges</InlineCode> contains search meeting nodes, not a full path or proof of disjoint paths.
        </p>
        <TerminalBlock commands={[`curl "${baseUrl}/distance?from=${source}&to=${target}&max_hops=3"`]} />
      </Endpoint>

      <Endpoint id="batch" method="POST" path="/distance/batch" description="Query up to 100 targets from one source, preserving target order and duplicates.">
        <p>
          Required JSON fields: <InlineCode>from</InlineCode> and <InlineCode>targets</InlineCode>.
          Optional <InlineCode>max_hops</InlineCode>, <InlineCode>include_bridges</InlineCode> and <InlineCode>bypass_cache</InlineCode>
          use the same defaults as <InlineCode>/distance</InlineCode>.
        </p>
        <h4>Request</h4>
        <CodeBlock language="json" code={json({ from: source, targets: [target], max_hops: 3 })} />
        <h4>Response</h4>
        <CodeBlock language="json" code={json({ from: source, results: [distanceExample] })} />
        <p>Each result includes both <InlineCode>from</InlineCode> and <InlineCode>to</InlineCode>.</p>
      </Endpoint>

      <Endpoint id="path" method="GET" path="/path" description="Return intermediate pubkeys on one shortest directed follow path.">
        <p>Required <InlineCode>from</InlineCode> and <InlineCode>to</InlineCode>; optional <InlineCode>max_hops</InlineCode> (1–5, default 3).</p>
        <CodeBlock language="json" code={json({ from: source, to: target, path: [bridge] })} />
        <p>
          The example represents two follow edges, from source to bridge to target.
          Source and target are excluded from <InlineCode>path</InlineCode>.
          Self and direct-follow paths return an empty array; no route within the requested depth returns null.
          This response has no <InlineCode>hops</InlineCode> field.
        </p>
      </Endpoint>

      <Endpoint id="follows" method="GET" path="/follows" description="Paginate the currently indexed follow list for a pubkey.">
        <PaginationParameters />
        <CodeBlock language="json" code={json({ pubkey: source, follows: [bridge], total: 1 })} />
        <p>An unknown pubkey returns an empty list and <InlineCode>total: 0</InlineCode>.</p>
      </Endpoint>

      <Endpoint id="common-follows" method="GET" path="/common-follows" description="Return pubkeys directly followed by both accounts.">
        <p>Required parameters: <InlineCode>from</InlineCode> and <InlineCode>to</InlineCode>.</p>
        <CodeBlock language="json" code={json({ from: source, to: target, common_follows: [bridge] })} />
        <TerminalBlock commands={[`curl "${baseUrl}/common-follows?from=${source}&to=${target}"`]} />
      </Endpoint>

      <Endpoint id="mutes" method="GET" path="/mutes" description="Paginate public pubkey entries from an indexed kind-10000 mute list.">
        <PaginationParameters />
        <CodeBlock language="json" code={json({ pubkey: source, mutes: [], total: 0, public_list_known: true })} />
        <p>
          <InlineCode>public_list_known: false</InlineCode> means no mute-list event was indexed for this pubkey.
          A known event can have no public pubkey entries, as shown above.
          Encrypted mute entries are unavailable to the Oracle, and a known empty public list may still contain encrypted entries.
          Word, hashtag and thread mute tags are excluded from pubkey evidence.
        </p>
      </Endpoint>

      <Endpoint id="trust" method="GET" path="/trust" description="Return follow distance alongside separate public mute observations.">
        <DistanceParameters />
        <CodeBlock language="json" code={json({
          follow_distance: distanceExample,
          public_mute_evidence: {
            source_mutes_target: false, target_mutes_source: false,
            followed_muters: [bridge], source_mute_list_known: true, target_mute_list_known: false,
          },
        })} />
        <p>
          <InlineCode>followed_muters</InlineCode> lists accounts directly followed by the source whose indexed public mute lists contain the target.
          The two direct-mute booleans describe the source and target relationship;
          the known-list flags distinguish missing lists from known public lists.
        </p>
        <p>
          Mutes can express personal preference. Missing public evidence is not an endorsement.
          Clients decide how to use these observations: the response applies no weight, aggregate score or automatic exclusion.
          Follow distance and mute evidence may be read at slightly different instants during ingestion.
        </p>
      </Endpoint>

      <section id="freshness" className="scroll-mt-24">
        <h2>Coverage and freshness</h2>
        <p>
          <InlineCode>sync.coverage</InlineCode> is <InlineCode>configured_relays_only</InlineCode>.
          Results describe events indexed from the server&apos;s configured relays, with no guarantee of global or complete coverage.
          Cache entries become invalid when the graph revision changes.
          Neither readiness nor bypassing the cache guarantees that relays have returned the latest event.
        </p>
        <p>Kind-0 profile caching, <InlineCode>/profiles</InlineCode> and <InlineCode>include_profiles</InlineCode> are not implemented in v0.3.0.</p>
      </section>

      <section id="errors" className="scroll-mt-24">
        <h2>Limits and errors</h2>
        <p>
          Data endpoints use a per-IP token bucket configured by <InlineCode>RATE_LIMIT_PER_MINUTE</InlineCode>.
          Limits depend on the deployment; requests can be rejected after a burst even before a minute has elapsed.
          The root, <InlineCode>/health</InlineCode> and <InlineCode>/ready</InlineCode> routes are exempt from this limiter.
          Request bodies are capped at 1 MiB. Do not assume rate-limit headers are present on every response.
        </p>
        <p>Application validation and computation errors return JSON with <InlineCode>error</InlineCode> and <InlineCode>code</InlineCode>:</p>
        <CodeBlock language="json" code={json({ error: "Invalid pubkey format", code: "INVALID_PUBKEY" })} />
        <ul>
          <li><strong>400:</strong> <InlineCode>INVALID_PUBKEY</InlineCode>, <InlineCode>INVALID_MAX_HOPS</InlineCode> or <InlineCode>TOO_MANY_TARGETS</InlineCode>.</li>
          <li><strong>413:</strong> request body exceeds the size limit.</li>
          <li><strong>429:</strong> per-IP rate limit exceeded. Back off before retrying; honor retry timing if provided.</li>
          <li><strong>500:</strong> <InlineCode>INTERNAL_ERROR</InlineCode>.</li>
          <li><strong>503:</strong> <InlineCode>QUERY_BUSY</InlineCode> when query capacity is exhausted, or a readiness snapshot with <InlineCode>ready: false</InlineCode> from <InlineCode>/ready</InlineCode>.</li>
        </ul>
        <p>
          Malformed query strings, malformed JSON and middleware rejections may use a different body format.
          Check the HTTP status before parsing a successful response. Use bounded retries with backoff for temporary overload.
        </p>
      </section>

      <div className="not-prose mt-12 flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link href="/docs/sdk" className="text-gray-600 dark:text-gray-400 hover:text-primary">SDK Reference</Link>
        <a href="https://github.com/nostr-wot/nostr-wot-oracle/blob/v0.3.0/docs/API.md" className="text-gray-600 dark:text-gray-400 hover:text-primary">v0.3.0 API source</a>
        <Link href="/oracle" className="text-gray-600 dark:text-gray-400 hover:text-primary">Self-Host Guide</Link>
      </div>
    </article>
  );
}
