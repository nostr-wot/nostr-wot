import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CodeBlock, InlineCode, TerminalBlock, ScrollReveal } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs");
  const title = `${t("sidebar.lnbitsProxy")} | ${t("meta.title")}`;
  const description = t("labels.lnbitsProxyDescription");

  return {
    title,
    description,
    keywords: ["lnbits proxy", "lightning address self hosting", "nostr wallet connect", "nip-98"],
    alternates: generateAlternates("/docs/lnbits-proxy", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/docs/lnbits-proxy",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

const repoUrl = "https://github.com/nostr-wot/LNbits-proxy";
const exampleDomain = "zaps.example.com";
const clientPubkey = "a".repeat(64);
const json = (value: unknown) => JSON.stringify(value, null, 2);

function Endpoint({ id, method, path, description, children }: {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  children?: React.ReactNode;
}) {
  const tone = {
    GET: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    POST: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    PUT: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  }[method];

  return (
    <section id={id} className="mb-10 scroll-mt-24 pb-6 border-b border-gray-200 dark:border-gray-800">
      <h3 className="flex flex-wrap items-center gap-3 mb-3">
        <span className={`px-2 py-1 text-xs font-bold rounded ${tone}`}>{method}</span>
        <code className="text-lg font-semibold">{path}</code>
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      {children}
    </section>
  );
}

function Callout({ tone, title, children }: {
  tone: "warning" | "info";
  title: string;
  children: React.ReactNode;
}) {
  const styles = tone === "warning"
    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
    : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900";

  return (
    <div className={`not-prose my-6 p-4 rounded-lg border ${styles}`}>
      <p className="font-semibold mb-2">{title}</p>
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">{children}</div>
    </div>
  );
}

export default async function LnbitsProxyDocsPage() {
  const t = await getTranslations("docs");

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <ScrollReveal animation="fade-up">
        <h1>{t("lnbitsProxy.title")}</h1>
        <p className="lead text-xl text-gray-600 dark:text-gray-400">{t("lnbitsProxy.intro")}</p>
      </ScrollReveal>

      <section id="why" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.whyTitle")}</h2>
        <p>{t("lnbitsProxy.whyDescription")}</p>
        <p>{t("lnbitsProxy.whyNote")}</p>
      </section>

      <section id="architecture" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.architectureTitle")}</h2>
        <p>{t("lnbitsProxy.architectureDescription")}</p>
        <CodeBlock
          language="text"
          code={`Nostr client
     |  HTTPS
     v
Reverse proxy (TLS, ${exampleDomain})
     |  HTTP, loopback
     v
LNbits proxy  :3003  --- reads ---> database.sqlite3
     |  HTTP                        ext_lnurlp.sqlite3
     v
LNbits  :5000
     |
     v
Lightning backend (phoenixd, LND, ...)`}
        />
        <p>{t("lnbitsProxy.architectureLoopback")}</p>
        <p>{t("lnbitsProxy.architectureDatabases")}</p>
      </section>

      <section id="prerequisites" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.prerequisitesTitle")}</h2>
        <ul>
          <li>{t("lnbitsProxy.prerequisitesNode")}</li>
          <li>{t.rich("lnbitsProxy.prerequisitesLnbits", { code: chunks => <InlineCode>{chunks}</InlineCode> })}</li>
          <li>{t("lnbitsProxy.prerequisitesBackend")}</li>
          <li>{t("lnbitsProxy.prerequisitesKey")}</li>
        </ul>
      </section>

      <section id="install" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.installTitle")}</h2>
        <p>{t("lnbitsProxy.installDescription")}</p>
        <TerminalBlock
          commands={[
            `git clone ${repoUrl}.git`,
            "cd LNbits-proxy",
            "npm ci",
            "npm test",
          ]}
        />

        <h3>{t("lnbitsProxy.envTitle")}</h3>
        <p>{t("lnbitsProxy.envDescription")}</p>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold">Variable</th>
                <th className="text-left py-2 pr-4 font-semibold">Default</th>
                <th className="text-left py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <td className="py-2 pr-4"><InlineCode>LNBITS_URL</InlineCode></td>
                <td className="py-2 pr-4"><InlineCode>http://127.0.0.1:5000</InlineCode></td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{t("lnbitsProxy.envLnbitsUrl")}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <td className="py-2 pr-4"><InlineCode>LNBITS_ADMIN_KEY</InlineCode></td>
                <td className="py-2 pr-4 italic text-gray-500">{t("lnbitsProxy.envRequired")}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{t("lnbitsProxy.envAdminKey")}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <td className="py-2 pr-4"><InlineCode>LNBITS_DB_PATH</InlineCode></td>
                <td className="py-2 pr-4"><InlineCode>.../data/database.sqlite3</InlineCode></td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{t("lnbitsProxy.envDbPath")}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <td className="py-2 pr-4"><InlineCode>LNURLP_DB_PATH</InlineCode></td>
                <td className="py-2 pr-4"><InlineCode>.../data/ext_lnurlp.sqlite3</InlineCode></td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{t("lnbitsProxy.envLnurlpPath")}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <td className="py-2 pr-4"><InlineCode>PROVISION_DB_PATH</InlineCode></td>
                <td className="py-2 pr-4"><InlineCode>.../provisioning.sqlite3</InlineCode></td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{t("lnbitsProxy.envProvisionDb")}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><InlineCode>PORT</InlineCode></td>
                <td className="py-2 pr-4"><InlineCode>3003</InlineCode></td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{t("lnbitsProxy.envPort")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="warning" title={t("lnbitsProxy.domainWarningTitle")}>
          <p>{t("lnbitsProxy.domainWarningBody")}</p>
          <CodeBlock language="javascript" code={`const DOMAIN = '${exampleDomain}';`} />
        </Callout>
      </section>

      <section id="endpoints" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.endpointsTitle")}</h2>
        <p>{t("lnbitsProxy.endpointsDescription")}</p>

        <h3 id="provisioning" className="scroll-mt-24">{t("lnbitsProxy.provisioningTitle")}</h3>

        <Endpoint
          id="challenge"
          method="GET"
          path="/api/provision/challenge"
          description={t("lnbitsProxy.challengeDescription")}
        >
          <CodeBlock language="json" code={json({ challenge: "7f3a…" })} />
        </Endpoint>

        <Endpoint
          id="provision"
          method="POST"
          path="/api/provision"
          description={t("lnbitsProxy.provisionDescription")}
        >
          <p>{t("lnbitsProxy.provisionBody")}</p>
          <CodeBlock
            language="json"
            code={json({ event: { kind: 27235, "…": "signed NIP-98 event" }, name: "My Wallet" })}
          />
          <CodeBlock
            language="json"
            code={json({ walletId: "…", adminkey: "…", inkey: "…", lightningAddress: null })}
          />
        </Endpoint>

        <h3 id="lightning-address" className="scroll-mt-24">{t("lnbitsProxy.addressTitle")}</h3>

        <Endpoint
          id="claim-username"
          method="POST"
          path="/api/claim-username"
          description={t("lnbitsProxy.claimDescription")}
        />

        <Endpoint
          id="lightning-address-lookup"
          method="GET"
          path="/api/lightning-address?pubkey={hex}"
          description={t("lnbitsProxy.lookupDescription")}
        >
          <CodeBlock language="json" code={json({ lightningAddress: `alice@${exampleDomain}` })} />
        </Endpoint>

        <Endpoint
          id="release-username"
          method="POST"
          path="/api/release-username"
          description={t("lnbitsProxy.releaseDescription")}
        />

        <h3 id="nwc" className="scroll-mt-24">{t("lnbitsProxy.nwcTitle")}</h3>
        <p>{t("lnbitsProxy.nwcDescription")}</p>

        <Endpoint
          id="nwc-list"
          method="GET"
          path="/api/nwc/connections"
          description={t("lnbitsProxy.nwcListDescription")}
        >
          <CodeBlock
            language="json"
            code={json({
              connections: [],
              provider: { pubkey: "b".repeat(64), relay: "wss://relay.example.com" },
            })}
          />
        </Endpoint>

        <Endpoint
          id="nwc-create"
          method="PUT"
          path="/api/nwc/connections/{clientPubkey}"
          description={t("lnbitsProxy.nwcPutDescription")}
        >
          <CodeBlock language="json" code={json({ name: "My phone", dailyLimit: 10000, days: 90 })} />
          <CodeBlock
            language="bash"
            code={`curl -X PUT "https://${exampleDomain}/api/nwc/connections/${clientPubkey}" \\
  -H "X-Api-Key: $WALLET_ADMIN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My phone","dailyLimit":10000,"days":90}'`}
          />
        </Endpoint>

        <Endpoint
          id="nwc-revoke"
          method="DELETE"
          path="/api/nwc/connections/{clientPubkey}"
          description={t("lnbitsProxy.nwcDeleteDescription")}
        />

        <Callout tone="info" title={t("lnbitsProxy.nwcTitle")}>
          <p>{t("lnbitsProxy.nwcSecretsNote")}</p>
          <p>{t("lnbitsProxy.nwcPermissionsNote")}</p>
        </Callout>

        <h3 id="healthz" className="scroll-mt-24">{t("lnbitsProxy.healthzTitle")}</h3>

        <Endpoint
          id="healthz-endpoint"
          method="GET"
          path="/healthz"
          description={t("lnbitsProxy.healthzDescription")}
        >
          <CodeBlock
            language="json"
            code={json({ ok: true, checks: { lnbitsDb: "ok", lnurlpDb: "ok", adminKey: "set", lnbits: "ok" } })}
          />
        </Endpoint>

        <h3 id="passthrough" className="scroll-mt-24">{t("lnbitsProxy.passthroughTitle")}</h3>
        <p>{t("lnbitsProxy.passthroughDescription")}</p>
        <p>{t("lnbitsProxy.passthroughPublic")}</p>
        <CodeBlock
          language="text"
          code={`GET  /.well-known/lnurlp/{username}
GET  /lnurlp/api/v1/lnurl/cb/{id}`}
        />
        <p>{t("lnbitsProxy.passthroughWallet")}</p>
        <CodeBlock
          language="text"
          code={`GET|POST  /api/v1/wallet
GET|POST  /api/v1/payments`}
        />
      </section>

      <section id="nip98" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.nip98Title")}</h2>
        <p>{t("lnbitsProxy.nip98Description")}</p>
        <ol>
          <li>{t("lnbitsProxy.nip98Step1")}</li>
          <li>{t("lnbitsProxy.nip98Step2")}</li>
          <li>{t("lnbitsProxy.nip98Step3")}</li>
          <li>{t("lnbitsProxy.nip98Step4")}</li>
        </ol>

        <h3>{t("lnbitsProxy.nip98TagsTitle")}</h3>
        <p>{t("lnbitsProxy.nip98TagsDescription")}</p>
        <CodeBlock
          language="javascript"
          code={`const { challenge } = await fetch(
  "https://${exampleDomain}/api/provision/challenge"
).then(r => r.json());

const event = await window.nostr.signEvent({
  kind: 27235,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ["u", "https://${exampleDomain}/api/provision"],
    ["method", "POST"],
    ["challenge", challenge],
  ],
  content: "",
});

const wallet = await fetch("https://${exampleDomain}/api/provision", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ event, name: "My Wallet" }),
}).then(r => r.json());`}
        />

        <h3>{t("lnbitsProxy.nip98WindowsTitle")}</h3>
        <p>{t("lnbitsProxy.nip98WindowsDescription")}</p>
      </section>

      <section id="nginx" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.nginxTitle")}</h2>
        <p>{t("lnbitsProxy.nginxDescription")}</p>
        <CodeBlock
          language="nginx"
          code={`server {
    listen 443 ssl;
    server_name ${exampleDomain};

    ssl_certificate     /etc/letsencrypt/live/${exampleDomain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${exampleDomain}/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
    }
}

server {
    listen 80;
    server_name ${exampleDomain};
    return 301 https://$host$request_uri;
}`}
        />

        <Callout tone="warning" title={t("lnbitsProxy.realIpTitle")}>
          <p>{t("lnbitsProxy.realIpDescription")}</p>
          <CodeBlock
            language="nginx"
            code={`# Inside the server block, before location /
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
# ... the rest of your CDN's published ranges
real_ip_header CF-Connecting-IP;
real_ip_recursive on;`}
          />
          <p>{t("lnbitsProxy.realIpNote")}</p>
        </Callout>
      </section>

      <section id="process" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.processTitle")}</h2>
        <p>{t("lnbitsProxy.processDescription")}</p>
        <TerminalBlock
          commands={[
            "pm2 start server.js --name lnbits-proxy",
            "pm2 save",
            "pm2 startup",
            "pm2 logs lnbits-proxy",
          ]}
        />
        <p>{t("lnbitsProxy.processEnvNote")}</p>
      </section>

      <section id="monitoring" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.monitoringTitle")}</h2>
        <p>{t("lnbitsProxy.monitoringDescription")}</p>

        <h3>{t("lnbitsProxy.watchdogTitle")}</h3>
        <p>{t("lnbitsProxy.watchdogDescription")}</p>
        <CodeBlock
          language="ini"
          code={`# /etc/systemd/system/check-phoenixd.timer
[Unit]
Description=Run phoenixd health check every 2 minutes

[Timer]
OnBootSec=60
OnUnitActiveSec=120
AccuracySec=10

[Install]
WantedBy=timers.target`}
        />
        <p>{t("lnbitsProxy.watchdogRetryNote")}</p>

        <h3>{t("lnbitsProxy.healthTitle")}</h3>
        <p>{t("lnbitsProxy.healthDescription")}</p>
        <CodeBlock language="text" code={`*/5 * * * * /usr/bin/node /srv/monitor/monitor.mjs >> /srv/monitor/cron.log 2>&1`} />
        <Callout tone="warning" title={t("lnbitsProxy.healthTitle")}>
          <p>{t("lnbitsProxy.healthInvoiceNote")}</p>
        </Callout>
      </section>

      <section id="ownership" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.ownershipTitle")}</h2>
        <p>{t("lnbitsProxy.ownershipDescription")}</p>
        <p>{t("lnbitsProxy.ownershipMirror")}</p>
        <Callout tone="warning" title={t("lnbitsProxy.ownershipPermissionTitle")}>
          <p>{t("lnbitsProxy.ownershipPermission")}</p>
          <CodeBlock language="bash" code={`chown root:root provisioning.sqlite3\nchmod 600 provisioning.sqlite3`} />
        </Callout>
        <p>{t("lnbitsProxy.ownershipMigrate")}</p>
        <TerminalBlock
          commands={[
            "node scripts/backfill-provisioned.mjs --dry-run",
            "node scripts/backfill-provisioned.mjs",
          ]}
        />
        <p>{t("lnbitsProxy.ownershipMigrateNote")}</p>
      </section>

      <section id="limits" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.limitsTitle")}</h2>

        <h3>{t("lnbitsProxy.rateLimitsTitle")}</h3>
        <p>{t("lnbitsProxy.rateLimitsDescription")}</p>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold">Route</th>
                <th className="text-left py-2 font-semibold">Requests / minute</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["/api/nwc/connections", "60"],
                ["/api/v1/wallet, /api/v1/payments", "120"],
                ["LNURL passthrough", "60"],
                ["/api/provision/challenge", "10"],
                ["/api/provision", "5"],
                ["/api/claim-username", "3"],
                ["/api/release-username", "3"],
              ].map(([route, limit]) => (
                <tr key={route} className="border-b border-gray-200 dark:border-gray-800">
                  <td className="py-2 pr-4"><InlineCode>{route}</InlineCode></td>
                  <td className="py-2">{limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>{t("lnbitsProxy.usernameTitle")}</h3>
        <p>{t("lnbitsProxy.usernameDescription")}</p>
        <CodeBlock language="javascript" code={`/^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/`} />
        <p>{t("lnbitsProxy.usernameReserved")}</p>
        <CodeBlock
          language="text"
          code={`admin  support  help  info  noreply
postmaster  webmaster  abuse  root  system`}
        />

        <h3>{t("lnbitsProxy.nwcLimitsTitle")}</h3>
        <ul>
          <li>{t("lnbitsProxy.nwcLimitsName")}</li>
          <li>{t("lnbitsProxy.nwcLimitsBudget")}</li>
          <li>{t("lnbitsProxy.nwcLimitsDays")}</li>
          <li>{t("lnbitsProxy.nwcLimitsMax")}</li>
        </ul>

        <h3>{t("lnbitsProxy.bodyLimitsTitle")}</h3>
        <p>{t("lnbitsProxy.bodyLimitsDescription")}</p>
      </section>

      <section id="source" className="scroll-mt-24">
        <h2>{t("lnbitsProxy.sourceTitle")}</h2>
        <p>
          {t("lnbitsProxy.sourceDescription")}{" "}
          <a href={repoUrl} target="_blank" rel="noopener noreferrer">{repoUrl.replace("https://", "")}</a>
        </p>
      </section>
    </article>
  );
}
