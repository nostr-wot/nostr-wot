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
  const title = `Extension API | ${t("meta.title")}`;
  const description = "Complete NIP-07 signer API reference for the Nostr WoT browser extension. Methods for public keys, event signing, and NIP-04/NIP-44 encryption.";

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

function ParamTable({ rows, hasDefault }: { rows: TableRow[]; hasDefault?: boolean }) {
  return (
    <div className="overflow-x-auto mb-6 not-prose">
      <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="text-left p-3 font-semibold">Name</th>
            <th className="text-left p-3 font-semibold">Type</th>
            {hasDefault && <th className="text-left p-3 font-semibold">Default</th>}
            <th className="text-left p-3 font-semibold">Description</th>
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

function MethodSection({ id, title, description, params, returns, example, children }: {
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
  return (
    <section id={id} className="mb-12 scroll-mt-24 pb-8 border-b border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold mb-3">
        <InlineCode>{title}</InlineCode>
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>

      {params && params.length > 0 && (
        <>
          <h4 className="font-semibold mb-2">Parameters</h4>
          <ParamTable rows={params} hasDefault={params.some(p => p.default)} />
        </>
      )}

      <h4 className="font-semibold mb-2">Returns</h4>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        <InlineCode>{returns}</InlineCode>
      </p>

      {children}

      <h4 className="font-semibold mb-2">Example</h4>
      <CodeBlock language="javascript" code={example} />
    </section>
  );
}

export default async function ExtensionDocsPage() {
  const t = await getTranslations("docs");

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <ScrollReveal animation="fade-up">
        <h1>Extension API</h1>

        <p className="lead text-xl text-gray-600 dark:text-gray-400">
          The extension provides the NIP-07 signer API (<InlineCode>window.nostr</InlineCode>) for identity, event signing, and NIP-04/NIP-44 message encryption.
        </p>

        <div className="not-prose my-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Prerequisite:</strong> Users must have the <Link href="/download" className="underline">extension</Link> installed and an account unlocked.
        </p>
        </div>
      </ScrollReveal>

      {/* Setup */}
      <section id="setup" className="mb-12 scroll-mt-24">
        <h2>Setup</h2>
        <p>Always check that a NIP-07 provider is available before using the API:</p>
        <CodeBlock
          language="javascript"
          code={`// Feature detection
function hasNostr() {
  return typeof window !== "undefined" &&
         window.nostr !== undefined;
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
        <h2>NIP-07 Signer API</h2>
        <p>
          The extension implements the <a href="https://github.com/nostr-protocol/nips/blob/master/07.md" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NIP-07 standard</a>,
          making it compatible with any Nostr client that supports <InlineCode>window.nostr</InlineCode>.
        </p>
      </section>

      <MethodSection
        id="getpublickey"
        title="getPublicKey()"
        description="Returns the active account's hex-encoded public key."
        returns="Promise<string>"
        example={`const pubkey = await window.nostr.getPublicKey();
console.log(pubkey); // "3bf0c63f..."`}
      />

      <MethodSection
        id="signevent"
        title="signEvent(event)"
        description="Signs a Nostr event with the active key. Returns the event with id, pubkey, sig, and created_at fields populated."
        params={[{ name: "event", type: "UnsignedEvent", description: "Event object with kind, content, tags, and created_at" }]}
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
        description="Encrypts a message using NIP-04 (legacy DM encryption)."
        params={[
          { name: "pubkey", type: "string", description: "Recipient's hex pubkey" },
          { name: "plaintext", type: "string", description: "Message to encrypt" },
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
        description="Decrypts a NIP-04 encrypted message."
        params={[
          { name: "pubkey", type: "string", description: "Sender's hex pubkey" },
          { name: "ciphertext", type: "string", description: "Encrypted message string" },
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
        description="Encrypts a message using NIP-44 (recommended). NIP-44 provides improved security over NIP-04."
        params={[
          { name: "pubkey", type: "string", description: "Recipient's hex pubkey" },
          { name: "plaintext", type: "string", description: "Message to encrypt" },
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
        description="Decrypts a NIP-44 encrypted message."
        params={[
          { name: "pubkey", type: "string", description: "Sender's hex pubkey" },
          { name: "ciphertext", type: "string", description: "Encrypted message string" },
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
        description="Returns the user's relay list (NIP-65) as a map of relay URLs to read/write policies."
        returns="Promise<Record<string, { read: boolean; write: boolean }>>"
        example={`const relays = await window.nostr.getRelays();

// {
//   "wss://relay.damus.io": { read: true, write: true },
//   "wss://nos.lol": { read: true, write: false }
// }`}
      />

      <div className="not-prose my-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Looking for Web of Trust distance and trust-score queries? Those now live in the{" "}
          <Link href="/docs/sdk" className="underline">nostr-wot-sdk</Link> and the{" "}
          <Link href="/docs/oracle" className="underline">WoT Oracle API</Link>, not the browser extension.
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
          Getting Started
        </Link>
        <Link
          href="/docs/sdk"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          SDK Reference
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
