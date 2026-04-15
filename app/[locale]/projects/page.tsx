import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal, LinkButton, Section, SectionHeader } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("projects.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot projects", "web of trust integrations", "mapping bitcoin", "obelisk nostr"],
    alternates: generateAlternates("/projects", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/projects",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

const PROJECTS = [
  {
    key: "mappingBitcoin",
    url: "https://mappingbitcoin.com",
    color: "from-orange-500/10 to-amber-500/10",
    borderColor: "border-orange-200 dark:border-orange-800",
    tagColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    iconColor: "text-orange-500",
  },
  {
    key: "obelisk",
    url: "https://obelisk.ar",
    color: "from-violet-500/10 to-indigo-500/10",
    borderColor: "border-violet-200 dark:border-violet-800",
    tagColor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    iconColor: "text-violet-500",
  },
] as const;

export default async function ProjectsPage() {
  const t = await getTranslations("projects");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Projects Built with Nostr Web of Trust",
    "description": "Projects integrating Nostr Web of Trust for decentralized trust, reputation, and spam filtering.",
    "url": "https://nostr-wot.com/projects",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": PROJECTS.map((project, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "WebApplication",
          "name": t(`projects.${project.key}.name`),
          "url": project.url,
          "description": t(`projects.${project.key}.description`),
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal animation="fade-down">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={100}>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
            </ScrollReveal>
          </div>
        </section>

        {/* Projects Grid */}
        <Section padding="md">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PROJECTS.map((project, i) => (
              <ScrollReveal key={project.key} animation="fade-up" delay={i * 150}>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block bg-gradient-to-br ${project.color} rounded-2xl p-8 border ${project.borderColor} hover:shadow-lg transition-all group h-full`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${project.tagColor}`}>
                      {t(`projects.${project.key}.tag`)}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {t(`projects.${project.key}.name`)}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(`projects.${project.key}.description`)}
                  </p>
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {project.url.replace("https://", "")}
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section background="gray" padding="md">
          <ScrollReveal animation="zoom-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("cta.subtitle")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <LinkButton href="/contact" className="hover-lift">{t("cta.contact")}</LinkButton>
                <LinkButton href="/docs" variant="secondary" className="hover-lift">{t("cta.docs")}</LinkButton>
              </div>
            </div>
          </ScrollReveal>
        </Section>
      </main>
    </>
  );
}
