import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge, LinkButton, ExternalLinkButton } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("oracle.meta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function OraclePage() {
  const t = await getTranslations("oracle");

  return (
    <main>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <Badge className="mb-4">{t("hero.badge")}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ExternalLinkButton href="https://github.com/mappingbitcoin/wot-oracle">
                {t("hero.viewOnGitHub")}
              </ExternalLinkButton>
              <LinkButton href="/docs" variant="secondary">
                {t("hero.apiDocs")}
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">{t("whatItDoes.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-4">
            {t("whatItDoes.description")}
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
            <strong className="text-gray-900 dark:text-white">{t("whatItDoes.example")}</strong> {t("whatItDoes.exampleText")}
          </p>
        </div>
      </section>

      {/* Performance */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">{t("performance.title")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
              <span className="block text-4xl font-bold text-primary mb-2">&lt;1ms</span>
              <span className="text-gray-600 dark:text-gray-400">{t("performance.cachedLatency")}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
              <span className="block text-4xl font-bold text-primary mb-2">&lt;50ms</span>
              <span className="text-gray-600 dark:text-gray-400">{t("performance.uncachedLatency")}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
              <span className="block text-4xl font-bold text-primary mb-2">10,000+</span>
              <span className="text-gray-600 dark:text-gray-400">{t("performance.queriesPerSecond")}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
              <span className="block text-4xl font-bold text-primary mb-2">O(b^d/2)</span>
              <span className="text-gray-600 dark:text-gray-400">{t("performance.bidirectionalBfs")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">{t("apiEndpoints.title")}</h2>
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t("apiEndpoints.distance.title")}</code>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("apiEndpoints.distance.description")}</p>
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">{t("apiEndpoints.distance.request")}</div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`GET /distance?from=PUBKEY1&to=PUBKEY2`}</code>
                  </pre>
                </div>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">{t("apiEndpoints.distance.response")}</div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`{
  "from": "PUBKEY1",
  "to": "PUBKEY2",
  "distance": 2,
  "paths": 5,
  "mutual": false,
  "bridging_nodes": ["PUBKEY3", "PUBKEY4"]
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t("apiEndpoints.batch.title")}</code>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("apiEndpoints.batch.description")}</p>
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">{t("apiEndpoints.distance.request")}</div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`POST /distance/batch
Content-Type: application/json

{
  "from": "PUBKEY1",
  "targets": ["PUBKEY2", "PUBKEY3", "PUBKEY4"]
}`}</code>
                  </pre>
                </div>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">{t("apiEndpoints.distance.response")}</div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{`{
  "from": "PUBKEY1",
  "results": [
    { "to": "PUBKEY2", "distance": 1 },
    { "to": "PUBKEY3", "distance": 2 },
    { "to": "PUBKEY4", "distance": null }
  ]
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t("apiEndpoints.stats.title")}</code>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("apiEndpoints.stats.description")}</p>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-100">{`{
  "total_pubkeys": 1250000,
  "total_follows": 8500000,
  "last_sync": "2024-01-15T10:30:00Z",
  "cache_hit_rate": 0.85
}`}</code>
                </pre>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t("apiEndpoints.health.title")}</code>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("apiEndpoints.health.description")}</p>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-100">{`{ "status": "healthy", "uptime": 864000 }`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Hosting */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("selfHosting.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("selfHosting.subtitle")}
          </p>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">{t("selfHosting.docker")}</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-100">{`# Pull and run the image
docker pull ghcr.io/mappingbitcoin/wot-oracle:v1.0.0

docker run -d \\
  -p 8080:8080 \\
  -v wot-data:/app/data \\
  ghcr.io/mappingbitcoin/wot-oracle:v1.0.0`}</code>
                </pre>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">{t("selfHosting.dockerCompose")}</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-100">{`git clone https://github.com/mappingbitcoin/wot-oracle.git
cd wot-oracle
docker-compose up -d`}</code>
                </pre>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">{t("selfHosting.fromSource")}</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-100">{`git clone https://github.com/mappingbitcoin/wot-oracle.git
cd wot-oracle
cargo build --release
./target/release/wot-oracle`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("configuration.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
            {t("configuration.subtitle")}
          </p>
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
                <tr>
                  <td className="p-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">RELAYS</code></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">damus, nos.lol, nostr.band</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{t("configuration.relays.description")}</td>
                </tr>
                <tr>
                  <td className="p-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">HTTP_PORT</code></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">8080</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{t("configuration.httpPort.description")}</td>
                </tr>
                <tr>
                  <td className="p-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">DB_PATH</code></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">wot.db</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{t("configuration.dbPath.description")}</td>
                </tr>
                <tr>
                  <td className="p-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">RATE_LIMIT_PER_MINUTE</code></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">100</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{t("configuration.rateLimit.description")}</td>
                </tr>
                <tr>
                  <td className="p-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">CACHE_SIZE</code></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">10000</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{t("configuration.cacheSize.description")}</td>
                </tr>
                <tr>
                  <td className="p-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">CACHE_TTL_SECS</code></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">300</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{t("configuration.cacheTtl.description")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">{t("architecture.title")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">{t("architecture.graphStorage.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("architecture.graphStorage.description")}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">{t("architecture.pathfinding.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("architecture.pathfinding.description")}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">{t("architecture.caching.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("architecture.caching.description")}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">{t("architecture.rateLimiting.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("architecture.rateLimiting.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Instance */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("publicInstance.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-6">
            {t("publicInstance.subtitle")}
          </p>
          <div className="bg-gray-900 rounded-lg overflow-hidden max-w-xl mx-auto">
            <pre className="p-4 text-center overflow-x-auto">
              <code className="text-gray-100">https://wot-oracle.mappingbitcoin.com</code>
            </pre>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">
            {t("publicInstance.rateLimit")}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg text-white/80 mb-8">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ExternalLinkButton href="https://github.com/mappingbitcoin/wot-oracle" variant="white">
              {t("cta.viewSource")}
            </ExternalLinkButton>
            <LinkButton href="/download" variant="white-outline">
              {t("cta.learnExtension")}
            </LinkButton>
          </div>
        </div>
      </section>
    </main>
  );
}
