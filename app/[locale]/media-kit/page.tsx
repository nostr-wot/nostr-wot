import { LogoIcon } from "@/components/icons";
import { BrandLockup } from "@/components/icons/BrandLockup";
import { BrandPatterns } from "@/components/brand/BrandPatterns";
import { serializeJsonLd } from '@/lib/serialize-jsonld';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Badge, LinkButton, ExternalLinkButton, ScrollReveal, focusRing } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("mediaKit.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot media", "nostr wot brand"],
    alternates: generateAlternates("/media-kit", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/media-kit",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function MediaKitPage() {
  const t = await getTranslations("mediaKit");
  const u = await getTranslations("ui");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t("meta.title"),
    "description": t("meta.description"),
    "url": "https://nostrwot.com/media-kit",
    "publisher": {
      "@type": "Organization",
      "name": "Nostr Web of Trust",
      "url": "https://nostrwot.com",
      "logo": "https://nostrwot.com/icon-512.png",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <main>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <ScrollReveal animation="fade-up">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center">
              <Badge className="mb-4">{t("hero.badge")}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t("hero.subtitle")}
              </p>
              <a href="/brand-guidelines.md" className={`mt-6 inline-block rounded text-sm font-medium text-primary-dark dark:text-indigo-300 underline underline-offset-4 ${focusRing}`}>
                {t("hero.agentGuide")}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Integration Notice */}
      <ScrollReveal animation="fade-up" delay={100}>
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-start gap-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="text-3xl">🔧</div>
            <div>
              <h3 className="font-semibold mb-2">{t("integrationNotice.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("integrationNotice.description")}{" "}
                <Link href="/docs" className="text-primary hover:underline">{t("integrationNotice.apiDocs")}</Link> {t("integrationNotice.toGetStarted")}
              </p>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Logo Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("logo.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("logo.subtitle")}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center border border-gray-200">
              <BrandLockup tone="light" className="h-10 max-w-full mb-6" />
              <span className="text-sm text-gray-500">{t("logo.lightBackground")}</span>
            </div>
            <div className="bg-gray-900 rounded-xl p-12 flex flex-col items-center justify-center border border-gray-700">
              <BrandLockup tone="dark" className="h-10 max-w-full mb-6" />
              <span className="text-sm text-gray-400">{t("logo.darkBackground")}</span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{t("logo.specification")}</p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {(["light", "dark"] as const).map(tone => <a key={tone} download href={`/brand/nostr-wot/lockup-${tone}.svg`} className={`rounded-lg px-4 py-3 border border-gray-300 dark:border-gray-600 ${focusRing}`}>{t(`logo.download${tone === "light" ? "Light" : "Dark"}`)}</a>)}
          </div>
          <h3 className="text-xl font-semibold text-center mb-6">{t("logo.variants")}</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center gap-2 mb-4 py-4">
                <BrandLockup />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("logo.logoWordmark")}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center mb-4 py-4">
                <LogoIcon className="w-10 h-10 text-primary dark:text-indigo-300" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("logo.logoOnly")}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center gap-2 mb-4 py-4 bg-trust-green/10 rounded-lg px-4">
                <LogoIcon className="w-6 h-6 text-trust-green" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">{t("logo.integrationLabel")}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("logo.integrationBadge")}</span>
            </div>
          </div>
        </div>
      </section>

      <BrandPatterns />

      {/* Colors Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("colors.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("colors.subtitle")}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-indigo-300" />
              <div className="p-4"><span className="font-semibold block">{t("logo.darkBackground")}</span><code className="text-sm text-gray-600 dark:text-gray-400">#A5B4FC</code><p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t("logo.logoWordmark")}</p></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-primary" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.primaryPurple.name")}</span>
                <code className="text-sm text-gray-500">#6366F1</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.primaryPurple.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-primary-dark" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.primaryDark.name")}</span>
                <code className="text-sm text-gray-500">#4F46E5</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.primaryDark.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-trust-green" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.trustGreen.name")}</span>
                <code className="text-sm text-gray-500">#22C55E</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.trustGreen.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-trust-yellow" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.cautionYellow.name")}</span>
                <code className="text-sm text-gray-500">#EAB308</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.cautionYellow.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-trust-red" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.distantRed.name")}</span>
                <code className="text-sm text-gray-500">#EF4444</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.distantRed.usage")}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-nostr" />
              <div className="p-4">
                <span className="font-semibold block">{t("colors.nostrPurple.name")}</span>
                <code className="text-sm text-gray-500">#8B5CF6</code>
                <span className="text-sm text-gray-400 block mt-1">{t("colors.nostrPurple.usage")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("typography.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("typography.subtitle")}
          </p>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">{t("typography.headings")}</span>
              <p className="text-3xl font-bold mb-2">{t("typography.headingsExample")}</p>
              <code className="text-sm text-gray-500">-apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, sans-serif</code>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">{t("typography.body")}</span>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                {t("typography.bodyExample")}
              </p>
              <code className="text-sm text-gray-500">{u("fontMetrics")}</code>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">{t("typography.code")}</span>
              <p className="font-mono text-lg mb-2">await wot.getDistance(pubkey) // nostr-wot-sdk</p>
              <code className="text-sm text-gray-500">&quot;Fira Code&quot;, Consolas, Monaco, monospace</code>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Examples */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("integrationExamples.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {t("integrationExamples.subtitle")}
          </p>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">{t("integrationExamples.distanceBadge.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("integrationExamples.distanceBadge.description")}</p>
              <div className="flex gap-4 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-trust-green/10 text-green-800 dark:text-green-300 rounded-full">
                  <LogoIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("integrationExamples.distanceBadge.connected")} (2 {t("integrationExamples.distanceBadge.hops")})</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                  <LogoIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("integrationExamples.distanceBadge.unknown")}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">{t("integrationExamples.hopIndicator.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("integrationExamples.hopIndicator.description")}</p>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-trust-green text-gray-950 text-sm font-medium rounded-full">1 {t("integrationExamples.hopIndicator.hop")}</span>
                <span className="px-3 py-1 bg-trust-yellow text-gray-950 text-sm font-medium rounded-full">2 {t("integrationExamples.hopIndicator.hops")}</span>
                <span className="px-3 py-1 bg-trust-red text-gray-950 text-sm font-medium rounded-full">3+ {t("integrationExamples.hopIndicator.hops")}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">{t("integrationExamples.poweredBy.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("integrationExamples.poweredBy.description")}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <LogoIcon className="w-5 h-5 text-primary dark:text-indigo-300" />
                <span className="text-sm">{t("integrationExamples.poweredBy.text")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">{t("usageGuidelines.title")}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-trust-green">
              <h3 className="font-semibold text-trust-green mb-4">{t("usageGuidelines.do.title")}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• {t("usageGuidelines.do.items.useOfficial")}</li>
                <li>• {t("usageGuidelines.do.items.maintainSpacing")}</li>
                <li>• {t("usageGuidelines.do.items.indicateIntegration")}</li>
                <li>• {t("usageGuidelines.do.items.linkBack")}</li>
                <li>• {t("usageGuidelines.do.items.pressCoverage")}</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-trust-red">
              <h3 className="font-semibold text-trust-red mb-4">{t("usageGuidelines.dont.title")}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• {t("usageGuidelines.dont.items.modify")}</li>
                <li>• {t("usageGuidelines.dont.items.outdated")}</li>
                <li>• {t("usageGuidelines.dont.items.endorsement")}</li>
                <li>• {t("usageGuidelines.dont.items.misrepresent")}</li>
                <li>• {t("usageGuidelines.dont.items.busyBackgrounds")}</li>
              </ul>
            </div>
          </div>
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
            <LinkButton href="/contact" variant="white">
              {t("cta.contactUs")}
            </LinkButton>
            <ExternalLinkButton href="https://github.com/nostr-wot" variant="white-outline">
              {t("cta.viewOnGitHub")}
            </ExternalLinkButton>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
