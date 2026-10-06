import { serializeJsonLd } from '@/lib/serialize-jsonld';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ScrollReveal, Section, SectionHeader, AccordionList } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * The app's feedback forms, the same ones its Settings screen opens
 * (nostr-wot-wallet `src/constants/about.ts`): the extension's public tracker,
 * with the title marked as coming from the iOS app.
 */
const ISSUE_FORMS = "https://github.com/nostr-wot/nostr-wot-extension/issues/new";
const BUG_REPORT_URL = `${ISSUE_FORMS}?template=bug_report.yml&title=${encodeURIComponent("[iOS app] ")}`;
const FEATURE_REQUEST_URL = `${ISSUE_FORMS}?template=feature_request.yml&title=${encodeURIComponent("[iOS app] ")}`;

const FAQ_KEYS = [
  "createAccount",
  "backup",
  "pairRemote",
  "sameDevice",
  "lanBridge",
  "permissions",
  "wallet",
  "hostedWallet",
  "tor",
  "archive",
  "forgotPassword",
  "newPhone",
] as const;

const INCLUDE_KEYS = ["version", "os", "device", "language", "steps"] as const;
const DELETE_KEYS = ["account", "everything", "hostedWallet", "relays"] as const;

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("support.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot support", "nostr wot app", "nostr signer ios"],
    alternates: generateAlternates("/support", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/support",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function SupportPage() {
  const t = await getTranslations("support");

  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t("meta.title"),
    "description": t("meta.description"),
    "url": "https://nostrwot.com/support",
    "publisher": {
      "@type": "Organization",
      "name": "Nostr Web of Trust",
      "url": "https://nostrwot.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://nostrwot.com/contact",
      },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": { "@type": "Answer", "text": item.answer },
    })),
  };

  const cardClass =
    "flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <main>
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <ScrollReveal animation="fade-up">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">{t("hero.subtitle")}</p>
            </div>
          </ScrollReveal>
        </section>

        {/* Ways to get help */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6 text-center">{t("channels.title")}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/contact" className={cardClass}>
                <h3 className="font-semibold mb-2">{t("channels.contact.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("channels.contact.description")}</p>
              </Link>
              <a href={BUG_REPORT_URL} target="_blank" rel="noopener noreferrer" className={cardClass}>
                <h3 className="font-semibold mb-2">{t("channels.bug.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("channels.bug.description")}</p>
              </a>
              <a href={FEATURE_REQUEST_URL} target="_blank" rel="noopener noreferrer" className={cardClass}>
                <h3 className="font-semibold mb-2">{t("channels.feature.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("channels.feature.description")}</p>
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-6 text-center">{t("channels.inApp")}</p>
          </div>
        </section>

        {/* What to include */}
        <section className="pb-12">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-4">{t("include.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t("include.description")}</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              {INCLUDE_KEYS.map((key) => (
                <li key={key}>{t(`include.items.${key}`)}</li>
              ))}
            </ul>
            <div className="bg-trust-yellow/5 border border-trust-yellow/20 rounded-xl p-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-0">{t("include.never")}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <Section background="gray" padding="md">
          <ScrollReveal animation="fade-up">
            <SectionHeader title={t("faq.title")} />
          </ScrollReveal>
          <AccordionList items={faqItems} />
        </Section>

        {/* Deleting your data */}
        <section id="delete-data" className="py-12">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-4">{t("deleteData.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t("deleteData.description")}</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              {DELETE_KEYS.map((key) => (
                <li key={key}>
                  <strong className="text-gray-900 dark:text-white">{t(`deleteData.items.${key}.title`)}</strong>{" "}
                  {t(`deleteData.items.${key}.description`)}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 dark:text-gray-400">
              {t("deleteData.contact")}{" "}
              <Link href="/contact" className="text-primary hover:underline">{t("deleteData.contactLink")}</Link>.
            </p>
          </div>
        </section>

        {/* Policies */}
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-4">{t("policies.title")}</h2>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>
                <Link href="/privacy#app" className="text-primary hover:underline">{t("policies.privacy")}</Link>
              </li>
              <li>
                <Link href="/terms#app" className="text-primary hover:underline">{t("policies.terms")}</Link>
              </li>
              <li>
                <Link href="/help" className="text-primary hover:underline">{t("policies.extensionHelp")}</Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
