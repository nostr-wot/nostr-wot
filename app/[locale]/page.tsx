import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import HeroAnimation from "@/components/HeroAnimation";
import {
  ScrollReveal,
  LinkButton,
  ExternalLinkButton,
  Section,
  SectionHeader,
  FeatureCard,
  FeatureList,
  AccordionList,
} from "@/components/ui";
import {
  ShieldIcon,
  SpeedIcon,
  LockIcon,
  PuzzleIcon,
  ServerIcon,
  ArrowRightIcon,
  NostrLogo,
  ExtensionIllustration,
  ExtensionPopupIllustration,
  OracleIllustration,
  CTAIllustration,
  CodeBracketsIcon,
  LightningIcon,
  KeyIcon,
} from "@/components/icons";
import { CodeBlock } from "@/components/ui";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import { NewsletterSection } from "@/components/layout/NewsletterSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("home.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot", "nostr web of trust", "nostr extension", "nostr identity", "nostr lightning wallet", "nip-07 signer", "trust assertions"],
    alternates: generateAlternates("/", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function Home() {
  const t = await getTranslations("home");

  // JSON-LD structured data
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nostr Web of Trust",
    "alternateName": "Nostr WoT",
    "url": "https://nostr-wot.com",
    "logo": "https://nostr-wot.com/icon-512.png",
    "description": "All-in-one Nostr browser extension — identity provider, NIP-07 signer, encrypted key vault, and Lightning wallet. Manage your profile, relays, and mute list with granular per-site permissions.",
    "sameAs": [
      "https://github.com/nostr-wot",
      "https://twitter.com/nostr_wot",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nostr Web of Trust",
    "url": "https://nostr-wot.com",
    "description": "All-in-one Nostr browser extension — identity provider, NIP-07 signer, encrypted key vault, and Lightning wallet with profile, relay, and mute-list management",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nostr-wot.com/docs?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const navigationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "Download Extension",
        "description": "Download the Nostr WoT extension for Chrome, Brave, Edge, Opera, and Firefox",
        "url": "https://nostr-wot.com/download",
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "Features",
        "description": "Identity provider, NIP-07 signer, encrypted vault, Lightning wallet, profile & relay management, and granular permissions",
        "url": "https://nostr-wot.com/features",
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "Documentation",
        "description": "API documentation, integration guides, and SDK reference",
        "url": "https://nostr-wot.com/docs",
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "Playground",
        "description": "Interactive Web of Trust graph explorer",
        "url": "https://nostr-wot.com/playground",
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://nostr-wot.com",
      },
    ],
  };

  const capabilityCards = [
    { icon: <KeyIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />, title: t("capabilities.identity.title"), description: t("capabilities.identity.description"), iconBg: "bg-indigo-100 dark:bg-indigo-900/40" },
    { icon: <LightningIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />, title: t("capabilities.wallet.title"), description: t("capabilities.wallet.description"), iconBg: "bg-amber-100 dark:bg-amber-900/40" },
    { icon: <ShieldIcon className="w-7 h-7" />, title: t("capabilities.profile.title"), description: t("capabilities.profile.description"), iconBg: "bg-purple-100 dark:bg-purple-900/40" },
    { icon: <SpeedIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />, title: t("capabilities.upcoming.title"), description: t("capabilities.upcoming.description"), iconBg: "bg-emerald-100 dark:bg-emerald-900/40" },
  ];

  const identityFeatures = [
    { title: t("identity.features.signer.title"), description: t("identity.features.signer.description") },
    { title: t("identity.features.multiAccount.title"), description: t("identity.features.multiAccount.description") },
    { title: t("identity.features.vault.title"), description: t("identity.features.vault.description") },
    { title: t("identity.features.permissions.title"), description: t("identity.features.permissions.description") },
  ];

  const walletFeatures = [
    { title: t("wallet.features.nwc.title"), description: t("wallet.features.nwc.description") },
    { title: t("wallet.features.lnbits.title"), description: t("wallet.features.lnbits.description") },
    { title: t("wallet.features.quickSetup.title"), description: t("wallet.features.quickSetup.description") },
    { title: t("wallet.features.webln.title"), description: t("wallet.features.webln.description") },
  ];

  const profileFeatures = [
    { title: t("profile.features.metadata.title"), description: t("profile.features.metadata.description") },
    { title: t("profile.features.relays.title"), description: t("profile.features.relays.description") },
    { title: t("profile.features.mutes.title"), description: t("profile.features.mutes.description") },
    { title: t("profile.features.sync.title"), description: t("profile.features.sync.description") },
  ];

  const howItWorksSteps = [
    { title: t("howItWorks.step1.title"), description: t("howItWorks.step1.description") },
    { title: t("howItWorks.step2.title"), description: t("howItWorks.step2.description") },
    { title: t("howItWorks.step3.title"), description: t("howItWorks.step3.description") },
  ];

  const faqItems = [
    { question: t("faq.items.whatIsExtension.question"), answer: t("faq.items.whatIsExtension.answer") },
    { question: t("faq.items.whatDoesItManage.question"), answer: t("faq.items.whatDoesItManage.answer") },
    { question: t("faq.items.howDoesWalletWork.question"), answer: t("faq.items.howDoesWalletWork.answer") },
    { question: t("faq.items.isItPrivate.question"), answer: t("faq.items.isItPrivate.answer") },
    { question: t("faq.items.whichBrowsers.question"), answer: t("faq.items.whichBrowsers.answer") },
    { question: t("faq.items.whatAreTrustAssertions.question"), answer: t("faq.items.whatAreTrustAssertions.answer") },
    { question: t("faq.items.isFree.question"), answer: t("faq.items.isFree.answer") },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main>
        {/* Hero Section — Extension-focused */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
          <HeroAnimation />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
            <ScrollReveal animation="fade-down" delay={100}>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                {t("hero.badge")}
              </div>
            </ScrollReveal>
            <ScrollReveal animation="zoom-in" delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                <span className="text-primary">{t("hero.titleHighlight")}</span>
                <br />
                {t("hero.title")}
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t("hero.description")}
              </p>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <LinkButton href="/download" className="hover-lift">{t("hero.downloadButton")}</LinkButton>
                <LinkButton href="/playground" variant="secondary" className="hover-lift">{t("hero.playgroundButton")}</LinkButton>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={500}>
              <a href="https://nostr.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-nostr transition-colors text-sm">
                <span>{t("hero.builtFor")}</span>
                <NostrLogo className="w-6 h-6 text-nostr" />
                <span>Nostr</span>
              </a>
            </ScrollReveal>
          </div>
        </section>

        {/* Capabilities Overview — 4 Pillars */}
        <Section background="gray" padding="md">
          <ScrollReveal animation="fade-up">
            <SectionHeader title={t("capabilities.title")} description={t("capabilities.description")} />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilityCards.map((card, i) => (
              <ScrollReveal key={i} animation="zoom-in" delay={100 + i * 80}>
                <FeatureCard
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  iconBg={card.iconBg}
                  className="card-interactive"
                />
              </ScrollReveal>
            ))}
          </div>
        </Section>

        {/* Identity Section */}
        <Section padding="lg" className="overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-center">
            <ScrollReveal animation="fade-right" className="lg:col-span-2">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <KeyIcon className="w-4 h-4" />
                  {t("identity.badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("identity.title")}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {t("identity.description")}
                </p>
                <div className="grid md:grid-cols-2 gap-x-8 mb-8">
                  <FeatureList items={identityFeatures.slice(0, 2)} iconColor="text-indigo-600 dark:text-indigo-400" />
                  <FeatureList items={identityFeatures.slice(2)} iconColor="text-indigo-600 dark:text-indigo-400" />
                </div>
                <LinkButton href="/download" className="hover-lift">{t("hero.downloadButton")}</LinkButton>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-3xl p-8 border border-indigo-200 dark:border-indigo-800">
                  <ExtensionIllustration />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Section>

        {/* Lightning Wallet Section */}
        <Section background="gray" padding="lg" className="overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-center">
            <ScrollReveal animation="fade-right" className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 rounded-3xl p-8 border border-amber-200 dark:border-amber-800">
                  <ExtensionPopupIllustration />
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200} className="order-1 lg:order-2 lg:col-span-2">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <LightningIcon className="w-4 h-4" />
                  {t("wallet.badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("wallet.title")}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {t("wallet.description")}
                </p>
                <div className="grid md:grid-cols-2 gap-x-8 mb-8">
                  <FeatureList items={walletFeatures.slice(0, 2)} iconColor="text-amber-600 dark:text-amber-400" />
                  <FeatureList items={walletFeatures.slice(2)} iconColor="text-amber-600 dark:text-amber-400" />
                </div>
                <LinkButton href="/download" className="hover-lift">{t("hero.downloadButton")}</LinkButton>
              </div>
            </ScrollReveal>
          </div>
        </Section>

        {/* Profile, Relays & Mutes Section */}
        <Section padding="lg" className="overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-center">
            <ScrollReveal animation="fade-right" className="lg:col-span-2">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <ShieldIcon className="w-4 h-4" />
                  {t("profile.badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("profile.title")}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {t("profile.description")}
                </p>
                <div className="grid md:grid-cols-2 gap-x-8 mb-8">
                  <FeatureList items={profileFeatures.slice(0, 2)} iconColor="text-purple-600 dark:text-purple-400" />
                  <FeatureList items={profileFeatures.slice(2)} iconColor="text-purple-600 dark:text-purple-400" />
                </div>
                <LinkButton href="/download" className="hover-lift">{t("profile.downloadButton")}</LinkButton>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-3xl p-8 border border-purple-200 dark:border-purple-800">
                  <OracleIllustration />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Section>

        {/* Coming Soon — Trust Assertions & Services Integration */}
        <Section background="gray" padding="lg">
          <ScrollReveal animation="fade-up">
            <SectionHeader title={t("upcoming.title")} description={t("upcoming.description")} />
          </ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Trust Assertions */}
            <ScrollReveal animation="fade-right" delay={100}>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-emerald-200 dark:border-emerald-800 h-full hover:shadow-lg hover:border-emerald-400/50 transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    In Development
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("upcoming.assertions.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{t("upcoming.assertions.description")}</p>
                <ul className="space-y-3">
                  {["typed", "contextual", "verifiable", "aggregated"].map((key) => (
                    <li key={key} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t(`upcoming.assertions.features.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Services Integration */}
            <ScrollReveal animation="fade-left" delay={200}>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-blue-200 dark:border-blue-800 h-full hover:shadow-lg hover:border-blue-400/50 transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                    </span>
                    Planned
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.928-3.374a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("upcoming.services.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{t("upcoming.services.description")}</p>
                <ul className="space-y-3">
                  {["discovery", "verification", "marketplaces", "ecosystem"].map((key) => (
                    <li key={key} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t(`upcoming.services.features.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </Section>

        {/* How It Works */}
        <Section padding="md">
          <ScrollReveal animation="fade-up">
            <SectionHeader title={t("howItWorks.title")} description={t("howItWorks.description")} />
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, i) => (
              <ScrollReveal key={i} animation="zoom-in" delay={100 + i * 100}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="text-center mt-12">
              <Link href="/about" className="inline-flex items-center gap-2 text-primary font-medium hover:underline link-underline">
                {t("howItWorks.learnMoreLink")}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </Section>

        {/* For Developers — Condensed Oracle + SDK */}
        <Section background="gray" padding="lg">
          <ScrollReveal animation="fade-up">
            <SectionHeader title={t("developers.title")} description={t("developers.description")} />
          </ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Oracle */}
            <ScrollReveal animation="fade-right" delay={100}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full hover:shadow-lg hover:border-violet-400/30 transition-all duration-300">
                <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <ServerIcon className="w-4 h-4" />
                  {t("developers.oracle.badge")}
                </div>
                <h3 className="text-2xl font-bold mb-3">{t("developers.oracle.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t("developers.oracle.description")}</p>
                <LinkButton href="/oracle" variant="secondary" className="hover-lift">{t("developers.oracle.learnMoreButton")}</LinkButton>
              </div>
            </ScrollReveal>

            {/* SDK */}
            <ScrollReveal animation="fade-left" delay={200}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full hover:shadow-lg hover:border-emerald-400/30 transition-all duration-300">
                <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <CodeBracketsIcon className="w-4 h-4" />
                  {t("developers.sdk.badge")}
                </div>
                <h3 className="text-2xl font-bold mb-3">{t("developers.sdk.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t("developers.sdk.description")}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <LinkButton href="/docs#sdk-setup" variant="secondary" className="hover-lift">{t("developers.sdk.viewDocsButton")}</LinkButton>
                  <ExternalLinkButton href="https://www.npmjs.com/package/nostr-wot-sdk" variant="secondary" className="hover-lift">
                    {t("developers.sdk.npmButton")}
                  </ExternalLinkButton>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section padding="lg">
          <ScrollReveal animation="fade-up">
            <SectionHeader title={t("faq.title")} description={t("faq.description")} />
          </ScrollReveal>
          <AccordionList items={faqItems} />
        </Section>

        {/* CTA & Newsletter */}
        <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <ScrollReveal animation="fade-right">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t("cta.title")}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("cta.description")}</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <LinkButton href="/download" className="hover-lift">{t("cta.getExtensionButton")}</LinkButton>
                    <ExternalLinkButton href="https://github.com/nostr-wot/nostr-wot-extension" variant="secondary" className="hover-lift">
                      {t("cta.viewGithubButton")}
                    </ExternalLinkButton>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="fade-left" delay={200}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-nostr/10 rounded-full blur-3xl" />
                  <CTAIllustration className="w-64 h-64 md:w-80 md:h-80 text-primary relative" />
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal animation="fade-up" delay={300}>
              <NewsletterSection />
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
