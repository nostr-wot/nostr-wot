import { getTranslations } from "next-intl/server";
import { TerminalBlock, InlineCode } from "@/components/ui";

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


export async function OracleHosting() {
  const t = await getTranslations("oracle");
  return <>
      {/* Self-Hosting */}
      <section id="self-hosting" className="scroll-mt-24">
        <h2>{t("selfHosting.title")}</h2><p>{t("selfHosting.subtitle")}</p>
        <div className="space-y-6">
          {SELF_HOSTING_BLOCKS.map((block) => (
            <div key={block.key} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">{t(`selfHosting.${block.key}`)}</h3>
              <TerminalBlock commands={block.code.split("\n")} />
            </div>
          ))}
        </div>
      </section>

      {/* Configuration */}
      <section id="configuration" className="scroll-mt-24">
        <h2>{t("configuration.title")}</h2><p>{t("configuration.subtitle")}</p>
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
      </section>

  </>;
}
