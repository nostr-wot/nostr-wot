import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CodeBlock, InlineCode } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: generateAlternates("/docs", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/docs",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function DocsOverviewPage() {
  const t = await getTranslations("docs");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": "Nostr Web of Trust Documentation",
    "description": "Complete API documentation for the Nostr Web of Trust extension, SDK, and Oracle server.",
    "url": "https://nostr-wot.com/docs",
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

      <article className="prose prose-gray dark:prose-invert max-w-none">
        <h1>{t("overview.title")}</h1>

        <p className="lead text-xl text-gray-600 dark:text-gray-400">
          {t("overview.description")}
        </p>

        <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
          <Link
            href="/docs/extension"
            className="block p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">{t("overview.extension.title")}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t("overview.extension.description")} <InlineCode>{t("overview.extension.api")}</InlineCode> {t("overview.extension.forClientSide")}
            </p>
          </Link>

          <Link
            href="/docs/oracle"
            className="block p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">{t("overview.oracle.title")}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t("overview.oracle.description")}
            </p>
          </Link>
        </div>

        <p>
          {t("overview.fundamentalQuestion")} <em>&quot;{t("overview.question")}&quot;</em>
        </p>

        <h2>Choose Your Integration</h2>

        <div className="not-prose space-y-4 my-6">
          <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Browser Extension</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                For client-side web apps. Users need the WoT extension installed.
              </p>
              <Link href="/docs/extension" className="text-sm text-primary hover:underline">
                Extension API Docs →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Oracle REST API</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                For server-side apps. No user extension required. Use our public server or self-host.
              </p>
              <Link href="/docs/oracle" className="text-sm text-primary hover:underline">
                Oracle API Docs →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">JavaScript SDK</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                TypeScript SDK for the Oracle API with React hooks and error handling.
              </p>
              <Link href="/docs/sdk" className="text-sm text-primary hover:underline">
                SDK Docs →
              </Link>
            </div>
          </div>
        </div>

        <h2>Quick Example</h2>

        <p>Here&apos;s a simple example using the browser extension:</p>

        <CodeBlock
          language="javascript"
          code={`// Check if extension is available
if (window.nostr?.wot) {
  // Get distance to a pubkey
  const distance = await window.nostr.wot.getDistance(
    "npub1targetpubkey..."
  );

  if (distance !== null && distance <= 2) {
    console.log(\`Trusted: \${distance} hops away\`);
  } else {
    console.log("Not in your web of trust");
  }
}`}
        />

        <div className="not-prose mt-8 flex gap-4">
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Started
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>
    </>
  );
}
