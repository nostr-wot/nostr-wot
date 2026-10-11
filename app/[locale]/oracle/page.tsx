import HeroAnimation from "@/components/HeroAnimation";
import { serializeJsonLd } from '@/lib/serialize-jsonld';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge, LinkButton, ExternalLinkButton, Section, SectionHeader, CodeBlock } from "@/components/ui";
import { ScrollReveal } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

async function pageMetadata({ params }: Props): Promise<Metadata> {
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
    "url": "https://nostrwot.com/oracle",
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
      "url": "https://nostrwot.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <main>
      <section className="relative overflow-hidden -mt-16 pt-40 pb-24 lg:pt-48 lg:pb-32">
        <HeroAnimation color="#6366f1" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-up" immediate>
            <Badge className="mb-6">{t("hero.badge")}</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("hero.title")}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">{t("showcase.intro")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/docs/oracle">{t("hero.apiDocs")}</LinkButton>
              <LinkButton href="#public-instance" variant="secondary">{t("publicInstance.title")}</LinkButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Section padding="md">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t("whatItDoes.title")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{t("showcase.summary")}</p>
          </div>
          <figure className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div aria-hidden="true" className="flex items-center justify-between gap-2 text-sm sm:text-base font-semibold">
              {["Alice", "Bob", "Carol"].map((name, index) => <div key={name} className="contents">
                {index > 0 && <span className="text-primary text-2xl">→</span>}
                <span className="flex flex-col items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">{name[0]}</span>{name}</span>
              </div>)}
            </div>
            <figcaption className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">{t("whatItDoes.exampleText")}</figcaption>
          </figure>
        </div>
      </Section>

      <Section background="gray" padding="md">
        <SectionHeader title={t("showcase.featuresTitle")} />
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {["distance", "mutes", "batch", "hosting"].map(key => <div key={key} className="border-t border-primary/20 pt-6">
            <h3 className="text-xl font-semibold mb-3">{t(`showcase.${key}.title`)}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t(`showcase.${key}.description`)}</p>
          </div>)}
        </div>
      </Section>

      <Section padding="md">
        <div id="public-instance" className="scroll-mt-24 grid gap-12 lg:grid-cols-2 items-start">
          <div>
            <h2 className="text-3xl font-bold mb-4">{t("publicInstance.title")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{t("publicInstance.subtitle")}</p>
            <CodeBlock code="https://wot-oracle.mappingbitcoin.com" showCopy />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t("showcase.instanceNote")}</p>
          </div>
          <div className="lg:border-l border-gray-200 dark:border-gray-800 lg:pl-12">
            <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{t("cta.subtitle")}</p>
            <div className="flex flex-wrap gap-4">
              <LinkButton href="/docs/oracle#self-hosting">{t("selfHosting.title")}</LinkButton>
              <ExternalLinkButton href="https://github.com/nostr-wot/nostr-wot-oracle" variant="secondary">{t("hero.viewOnGitHub")}</ExternalLinkButton>
            </div>
          </div>
        </div>
      </Section>
      </main>
    </>
  );
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
