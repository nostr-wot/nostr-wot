import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CodeBlock, InlineCode, ScrollReveal } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs");
  const title = `${t("extensionApi.title")} | ${t("meta.title")}`;
  const description = t("extensionApi.metaDescription");

  return {
    title,
    description,
    keywords: ["nostr wot extension api", "NIP-07 wot"],
    alternates: generateAlternates("/docs/extension", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/docs/extension",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

interface TableRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

async function ParamTable({ rows, hasDefault }: { rows: TableRow[]; hasDefault?: boolean }) {
  const t = await getTranslations("docs.extensionApi");
  return (
    <div className="overflow-x-auto mb-6 not-prose">
      <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="text-left p-3 font-semibold">{t("name")}</th>
            <th className="text-left p-3 font-semibold">{t("type")}</th>
            {hasDefault && <th className="text-left p-3 font-semibold">{t("default")}</th>}
            <th className="text-left p-3 font-semibold">{t("description")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="p-3 border-t border-gray-200 dark:border-gray-700"><code className="text-primary">{row.name}</code></td>
              <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">{row.type}</td>
              {hasDefault && <td className="p-3 border-t border-gray-200 dark:border-gray-700">{row.default || "-"}</td>}
              <td className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function MethodSection({ id, title, description, params, returns, example, children }: {
  id: string;
  title: string;
  description: string;
  params?: TableRow[];
  hasDefault?: boolean;
  returns: string;
  returnsDesc?: string;
  example: string;
  children?: React.ReactNode;
}) {
  const t = await getTranslations("docs.extensionApi");
  return (
    <section id={id} className="mb-12 scroll-mt-24 pb-8 border-b border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold mb-3">
        <InlineCode>{title}</InlineCode>
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>

      {params && params.length > 0 && (
        <>
          <h4 className="font-semibold mb-2">{t("parameters")}</h4>
          <ParamTable rows={params} hasDefault={params.some(p => p.default)} />
        </>
      )}

      <h4 className="font-semibold mb-2">{t("returns")}</h4>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        <InlineCode>{returns}</InlineCode>
      </p>

      {children}

      <h4 className="font-semibold mb-2">{t("example")}</h4>
      <CodeBlock language="javascript" code={example} />
    </section>
  );
}

export default async function ExtensionDocsPage() {
  const t = await getTranslations("docs.extensionApi");

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <ScrollReveal animation="fade-up">
        <h1>{t("title")}</h1>

        <p className="lead text-xl text-gray-600 dark:text-gray-400">
          {t.rich("intro", { api: (chunks) => <InlineCode>{chunks}</InlineCode> })}
        </p>

        <div className="not-prose my-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {t.rich("prerequisite", { download: (chunks) => <Link href="/download" className="underline">{chunks}</Link> })}
        </p>
        </div>
      </ScrollReveal>

      {/* Setup */}
      <section id="setup" className="mb-12 scroll-mt-24">
        <h2>{t("setup")}</h2>
        <p>{t("setupDescription")}</p>
        <CodeBlock
          language="javascript"
          code={`// Feature detection
function hasNostr() {
  return typeof window !== "undefined" &&
         typeof window.nostr?.getPublicKey === "function";
}

// Wait for the extension to load
async function waitForNostr(timeout = 3000) {
  const start = Date.now();
  while (!hasNostr() && Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 100));
  }
  return hasNostr();
}`}
        />
      </section>

      {/* NIP-07 Signer API */}
      <section id="nip07" className="mb-12 scroll-mt-24">
        <h2>{t("nip07Title")}</h2>
        <p>
          {t.rich("standard", {
            standard: (chunks) => <a href="https://github.com/nostr-protocol/nips/blob/master/07.md" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{chunks}</a>,
            api: (chunks) => <InlineCode>{chunks}</InlineCode>,
          })}
        </p>
      </section>

      <MethodSection
        id="getpublickey"
        title="getPublicKey()"
        description={t("getPublicKey")}
        returns="Promise<string>"
        example={`const pubkey = await window.nostr.getPublicKey();
console.log(pubkey); // "3bf0c63f..."`}
      />

      <MethodSection
        id="signevent"
        title="signEvent(event)"
        description={t("signEvent")}
        params={[{ name: "event", type: "UnsignedEvent", description: t("event") }]}
        returns="Promise<SignedEvent>"
        example={`const signed = await window.nostr.signEvent({
  kind: 1,
  content: "Hello Nostr!",
  tags: [],
  created_at: Math.floor(Date.now() / 1000),
});
console.log(signed.sig); // schnorr signature`}
      />

      <MethodSection
        id="nip04encrypt"
        title="nip04.encrypt(pubkey, plaintext)"
        description={t("nip04Encrypt")}
        params={[
          { name: "pubkey", type: "string", description: t("recipient") },
          { name: "plaintext", type: "string", description: t("plaintext") },
        ]}
        returns="Promise<string>"
        example={`const encrypted = await window.nostr.nip04.encrypt(
  recipientPubkey,
  "Secret message"
);`}
      />

      <MethodSection
        id="nip04decrypt"
        title="nip04.decrypt(pubkey, ciphertext)"
        description={t("nip04Decrypt")}
        params={[
          { name: "pubkey", type: "string", description: t("sender") },
          { name: "ciphertext", type: "string", description: t("ciphertext") },
        ]}
        returns="Promise<string>"
        example={`const plaintext = await window.nostr.nip04.decrypt(
  senderPubkey,
  ciphertext
);
console.log(plaintext); // "Secret message"`}
      />

      <MethodSection
        id="nip44encrypt"
        title="nip44.encrypt(pubkey, plaintext)"
        description={t("nip44Encrypt")}
        params={[
          { name: "pubkey", type: "string", description: t("recipient") },
          { name: "plaintext", type: "string", description: t("plaintext") },
        ]}
        returns="Promise<string>"
        example={`const encrypted = await window.nostr.nip44.encrypt(
  recipientPubkey,
  "Secret message"
);`}
      />

      <MethodSection
        id="nip44decrypt"
        title="nip44.decrypt(pubkey, ciphertext)"
        description={t("nip44Decrypt")}
        params={[
          { name: "pubkey", type: "string", description: t("sender") },
          { name: "ciphertext", type: "string", description: t("ciphertext") },
        ]}
        returns="Promise<string>"
        example={`const plaintext = await window.nostr.nip44.decrypt(
  senderPubkey,
  ciphertext
);
console.log(plaintext); // "Secret message"`}
      />

      <MethodSection
        id="getrelays"
        title="getRelays()"
        description={t("getRelays")}
        returns="Promise<Record<string, { read: boolean; write: boolean }>>"
        example={`const relays = await window.nostr.getRelays();

// {
//   "wss://relay.damus.io": { read: true, write: true },
//   "wss://nos.lol": { read: true, write: true }
// }`}
      />

      <section id="errors" className="mb-12 scroll-mt-24">
        <h2>{t("errorsTitle")}</h2>
        <p>{t("errorsDescription")}</p>
        <p>{t("errorsDetails")}</p>
        <CodeBlock language="javascript" code={`async function signNote(content) {
  const provider = window.nostr;
  if (typeof provider?.getPublicKey !== "function" ||
      typeof provider?.signEvent !== "function") {
    return { ok: false, reason: "provider-unavailable" };
  }

  try {
    const pubkey = await provider.getPublicKey();
    if (!pubkey) return { ok: false, reason: "no-active-account" };

    const event = await provider.signEvent({
      pubkey,
      kind: 1,
      content,
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
    });
    return { ok: true, event };
  } catch (error) {
    return { ok: false, reason: "request-failed", error };
  }
}`} />
      </section>

      <div className="not-prose my-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {t.rich("trustRedirect", {
            sdk: (chunks) => <Link href="/docs/sdk" className="underline">{chunks}</Link>,
            oracle: (chunks) => <Link href="/docs/oracle" className="underline">{chunks}</Link>,
          })}
        </p>
      </div>

      {/* Navigation */}
      <div className="not-prose mt-12 flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/docs/getting-started"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("gettingStarted")}
        </Link>
        <Link
          href="/docs/sdk"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          {t("sdkReference")}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
