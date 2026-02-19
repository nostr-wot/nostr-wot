import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal, LinkButton, Section, SectionHeader, CodeBlock, TerminalBlock, WotGraphIllustration } from "@/components/ui";
import {
  ShieldIcon,
  BellIcon,
  SearchIcon,
  StarIcon,
  ArrowDownIcon,
} from "@/components/icons";
import { ReactNode } from "react";
import { generateAlternates } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("about.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: generateAlternates("/about", locale as Locale),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

const WHY_WORKS_CARDS = ["oneHop", "twoHop", "threeHop"];

const USE_CASES: Array<{ key: string; Icon: (props: { className?: string }) => ReactNode }> = [
  { key: "spamFiltering", Icon: ShieldIcon },
  { key: "trustScores", Icon: StarIcon },
  { key: "smartNotifications", Icon: BellIcon },
  { key: "contentDiscovery", Icon: SearchIcon },
];

const ARCHITECTURE_BLOCKS = [
  {
    key: "yourApp",
    width: "max-w-md",
    classes: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
  },
  {
    key: "extension",
    width: "max-w-md",
    classes: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
  },
];

const ARCHITECTURE_OPTIONS = [
  {
    key: "localIndex",
    width: "w-48",
    classes: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
  },
  {
    key: "oracle",
    width: "w-48",
    classes: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
  },
];

export default async function AboutPage() {
  const t = await getTranslations("about");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Nostr Web of Trust",
    "description": "Learn how Web of Trust uses social distance to filter spam and verify reputation on Nostr without central authorities.",
    "url": "https://nostr-wot.com/about",
    "mainEntity": {
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
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-down">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t("hero.title")}</h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Problem Section */}
      <Section padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("problem.title")} />
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            {t("problem.description")}{" "}
            <strong className="text-gray-900 dark:text-white">{t("problem.socialDistance")}</strong>
            {t("problem.descriptionContinued")}
          </p>
        </ScrollReveal>

        {/* Animated Web of Trust Graph */}
        <ScrollReveal animation="zoom-in">
          <WotGraphIllustration className="mb-12" />
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={400}>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
            <h3 className="font-semibold text-lg mb-4 text-center">{t("whyWorks.title")}</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              {WHY_WORKS_CARDS.map((card) => (
                <div key={card} className="card-interactive p-4 rounded-lg bg-white dark:bg-gray-700">
                  <strong className="block text-gray-900 dark:text-white mb-2">{t(`whyWorks.${card}.title`)}</strong>
                  <p className="text-gray-600 dark:text-gray-400">{t(`whyWorks.${card}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* Architecture Section */}
      <Section background="gray" padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("architecture.title")} />
        </ScrollReveal>
        <div className="space-y-4">
          {ARCHITECTURE_BLOCKS.map((block, i) => (
            <ScrollReveal key={block.key} animation={i === 0 ? "fade-down" : "fade-up"} delay={i * 200}>
              <div className="flex justify-center">
                <div className={`${block.classes} border rounded-lg p-4 text-center ${block.width} w-full card-interactive`}>
                  <strong className="block text-gray-900 dark:text-white">{t(`architecture.${block.key}.title`)}</strong>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t(`architecture.${block.key}.description`)}</span>
                </div>
              </div>
              {i < ARCHITECTURE_BLOCKS.length - 1 && (
                <ScrollReveal animation="zoom-in" delay={(i + 1) * 100}>
                  <div className="text-center text-2xl text-gray-400 mt-4">
                    <ArrowDownIcon className="w-6 h-6 mx-auto animate-bounce" />
                  </div>
                </ScrollReveal>
              )}
            </ScrollReveal>
          ))}

          <ScrollReveal animation="zoom-in" delay={300}>
            <div className="text-center text-2xl text-gray-400">
              <ArrowDownIcon className="w-6 h-6 mx-auto animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={400}>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {ARCHITECTURE_OPTIONS.map((option, i) => (
                <div key={option.key} className="contents">
                  {i > 0 && <span className="text-gray-400 font-medium">{t("architecture.or")}</span>}
                  <div
                    className={`${option.classes} border rounded-lg p-4 text-center ${option.width} card-interactive`}
                  >
                    <strong className="block text-gray-900 dark:text-white">{t(`architecture.${option.key}.title`)}</strong>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t(`architecture.${option.key}.description`)}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="zoom-in" delay={500}>
            <div className="text-center text-2xl text-gray-400">
              <ArrowDownIcon className="w-6 h-6 mx-auto animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={600}>
            <div className="flex justify-center">
              <div className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center max-w-md w-full card-interactive">
                <strong className="block text-gray-900 dark:text-white">{t("architecture.relays.title")}</strong>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t("architecture.relays.description")}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Use Cases Section */}
      <Section padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("useCases.title")} description={t("useCases.subtitle")} />
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((useCase, i) => (
            <ScrollReveal key={useCase.key} animation="fade-up" delay={i * 100}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <useCase.Icon className="w-12 h-12 mb-4" />
                <h3 className="font-semibold mb-2">{t(`useCases.${useCase.key}.title`)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t(`useCases.${useCase.key}.description`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Code Examples Section */}
      <Section background="gray" padding="md">
        <ScrollReveal animation="fade-up">
          <SectionHeader title={t("codeExamples.title")} />
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-6">
          <ScrollReveal animation="fade-right" delay={100}>
            <CodeBlock
              language="javascript"
              code={`// Check if someone is in your web of trust
if (window.nostr?.wot) {
  const distance = await window.nostr.wot.getDistance(pubkey);

  if (distance !== null && distance <= 2) {
    console.log("Trusted! " + distance + " hops away");
  }
}`}
            />
          </ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200}>
            <TerminalBlock
              commands={[
                "# Query social distance between two users",
                'curl "https://wot-oracle.mappingbitcoin.com/distance?from=PUBKEY1&to=PUBKEY2"',
                "",
                "# Response",
                '{ "distance": 2, "paths": 5, "mutual": false }',
              ]}
            />
          </ScrollReveal>
        </div>
      </Section>

      {/* Playground Section */}
      <Section padding="md" className="overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal animation="fade-right" className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40 rounded-3xl p-8 border border-orange-200 dark:border-orange-800">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-3 text-sm font-mono">
                    <p className="text-gray-500 dark:text-gray-400"># {t("playground.notice.steps.step1")}</p>
                    <p className="text-gray-900 dark:text-white">git clone https://github.com/nostr-wot/nostr-wot-extension.git</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-4"># {t("playground.notice.steps.step2")}</p>
                    <p className="text-gray-500 dark:text-gray-400"># {t("playground.notice.steps.step3")}</p>
                    <p className="text-gray-500 dark:text-gray-400"># {t("playground.notice.steps.step4")}</p>
                    <p className="text-gray-500 dark:text-gray-400"># {t("playground.notice.steps.step5")}</p>
                  </div>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-4 text-center font-medium">{t("playground.notice.alternativeTitle")}</p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-2 text-center">{t("playground.notice.note")}</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200} className="order-1 lg:order-2">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("playground.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("playground.title")}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{t("playground.description")}</p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-8">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">{t("playground.notice.title")}</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">{t("playground.notice.description")}</p>
                <a
                  href={t("playground.notice.chromeStoreUrl")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t("playground.notice.chromeStoreButton")}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <LinkButton href="/playground" className="hover-lift">{t("playground.tryButton")}</LinkButton>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" padding="md">
        <ScrollReveal animation="zoom-in">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/docs" className="hover-lift">{t("cta.readDocs")}</LinkButton>
              <LinkButton href="/download" variant="secondary" className="hover-lift">{t("cta.getExtension")}</LinkButton>
            </div>
          </div>
        </ScrollReveal>
      </Section>
      </main>
    </>
  );
}
