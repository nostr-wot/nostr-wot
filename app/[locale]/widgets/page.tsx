import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal, LinkButton, ExternalLinkButton, Section, CodeBlock } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

const REPO_URL = "https://github.com/nostr-wot/nostr-widgets";
const DEMO_NPUB = "npub1gxdhmu9swqduwhr6zptjy4ya693zp3ql28nemy4hd97kuufyrqdqwe5zfk";
const SITE_URL = "https://nostr-wot.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("widgets.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: [
      "nostr widgets",
      "embed nostr profile",
      "nostr follow button",
      "nostr feed widget",
      "server-rendered svg",
      "nostr web of trust",
    ],
    alternates: generateAlternates("/widgets", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/widgets",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

const KINDS = [
  {
    key: "profile",
    width: 320,
    height: 220,
    color: "from-orange-500/10 to-amber-500/10",
    borderColor: "border-orange-200 dark:border-orange-800",
    src: `${SITE_URL}/widgets/profile/${DEMO_NPUB}`,
  },
  {
    key: "follow",
    width: 220,
    height: 44,
    color: "from-violet-500/10 to-indigo-500/10",
    borderColor: "border-violet-200 dark:border-violet-800",
    src: `${SITE_URL}/widgets/follow/${DEMO_NPUB}`,
  },
  {
    key: "feed",
    width: 320,
    height: 280,
    color: "from-emerald-500/10 to-teal-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    src: `${SITE_URL}/widgets/feed/${DEMO_NPUB}?limit=3`,
  },
] as const;

const HTML_SNIPPET = `<a href="${SITE_URL}/profile/${DEMO_NPUB}"
   target="_blank" rel="noopener">
  <img
    src="${SITE_URL}/widgets/profile/${DEMO_NPUB}"
    alt="Profile on Nostr"
    width="320"
    height="220"
  />
</a>`;

export default async function WidgetsPage() {
  const t = await getTranslations("widgets");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": "Nostr Widgets",
    "description": t("meta.description"),
    "codeRepository": REPO_URL,
    "programmingLanguage": "TypeScript",
    "license": "https://opensource.org/licenses/MIT",
    "url": `${SITE_URL}/widgets`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Hero */}
        <section className="pt-12 pb-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal animation="fade-down">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={100}>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {t("hero.subtitle")}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Widget kinds with live previews */}
        <Section padding="md" className="!pt-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {KINDS.map((kind, i) => (
                <ScrollReveal key={kind.key} animation="fade-up" delay={i * 120}>
                  <div
                    className={`rounded-2xl p-6 border ${kind.borderColor} bg-gradient-to-br ${kind.color} h-full flex flex-col`}
                  >
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="text-xl font-bold">{t(`kinds.${kind.key}.name`)}</h3>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {t(`kinds.${kind.key}.size`)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-1">
                      {t(`kinds.${kind.key}.description`)}
                    </p>
                    <div className="rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-center min-h-[120px]">
                      {/* Live preview — server proxies /widgets/* to the widgets service */}
                      <a
                        href={`${SITE_URL}/profile/${DEMO_NPUB}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={kind.src}
                          alt={t(`kinds.${kind.key}.name`)}
                          width={kind.width}
                          height={kind.height}
                          loading="lazy"
                          className="max-w-full h-auto"
                        />
                      </a>
                    </div>
                    <div className="mt-3 text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                      {t(`kinds.${kind.key}.path`)}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                <ExternalLinkButton href={REPO_URL} className="hover-lift">
                  {t("hero.github")}
                </ExternalLinkButton>
                <LinkButton href="/blog/introducing-widgets" variant="secondary" className="hover-lift">
                  {t("hero.blog")}
                </LinkButton>
              </div>
            </ScrollReveal>
          </div>
        </Section>

        {/* Highlights */}
        <Section background="gray" padding="md">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">{t("kinds.title")}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{t("kinds.subtitle")}</p>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {(["noJs", "noIframe", "noTracking"] as const).map((key, i) => (
              <ScrollReveal key={key} animation="fade-up" delay={i * 100}>
                <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 h-full bg-white dark:bg-gray-900">
                  <h3 className="text-lg font-semibold mb-2">{t(`highlights.${key}.title`)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(`highlights.${key}.description`)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
            </div>
          </div>
        </Section>

        {/* Snippet */}
        <Section padding="md">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">{t("snippet.title")}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{t("snippet.description")}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={100}>
              <CodeBlock code={HTML_SNIPPET} language="html" />
            </ScrollReveal>
          </div>
        </Section>

        {/* Open source */}
        <Section background="gray" padding="md">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal animation="fade-up">
              <h2 className="text-3xl font-bold mb-3">{t("openSource.title")}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {t("openSource.description")}
              </p>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-8">
                {t("openSource.repo")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ExternalLinkButton href={REPO_URL} className="hover-lift">
                  {t("openSource.github")}
                </ExternalLinkButton>
                <ExternalLinkButton
                  href={`${REPO_URL}#self-hosting`}
                  variant="secondary"
                  className="hover-lift"
                >
                  {t("openSource.selfHost")}
                </ExternalLinkButton>
              </div>
            </ScrollReveal>
          </div>
        </Section>

      </main>
    </>
  );
}
