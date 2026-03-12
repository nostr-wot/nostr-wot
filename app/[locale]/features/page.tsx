import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import {
  ScrollReveal,
  LinkButton,
  ExternalLinkButton,
  CodeBlock,
  Section,
  SectionHeader,
  ModeCard,
  StepsList,
} from "@/components/ui";
import {
  NetworkIcon,
  ServerIcon,
  LockIcon,
  ArrowRightIcon,
  CodeBracketsIcon,
  AnimatedLinkIcon,
  AnimatedGlobeIcon,
  AnimatedScaleIcon,
  AnimatedCalculatorIcon,
  AnimatedWrenchIcon,
  AnimatedChartIcon,
  AnimatedLockIcon,
  AnimatedRocketIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import {
  TrustSpectrumVisualization,
  ScoringDetailsGrid,
  DashboardPreview,
  FormulaDisplay,
  SettingsPreview,
} from "@/components/features";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("features.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot features", "nostr trust score"],
    alternates: generateAlternates("/features", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/features",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

// Code examples
const API_EXAMPLE = `// Check trust in any Nostr app
const trusted = await window.nostr.wot.isInMyWoT(pubkey);
const distance = await window.nostr.wot.getDistance(pubkey);
const score = await window.nostr.wot.getTrustScore(pubkey);`;

const FULL_API_EXAMPLE = `// Check if extension is available
if (window.nostr?.wot) {
  // Simple boolean check
  const inNetwork = await window.nostr.wot.isInMyWoT(pubkey, maxHops);

  // Get exact distance (number of hops)
  const hops = await window.nostr.wot.getDistance(pubkey);

  // Get full trust score (0-1 based on distance + bonuses)
  const score = await window.nostr.wot.getTrustScore(pubkey);

  // Get detailed trust info (paths, mutual, bridging nodes)
  const details = await window.nostr.wot.getDetails(pubkey);

  // Get current extension configuration
  const config = await window.nostr.wot.getConfig();
}`;

// Data arrays
const COMPATIBLE_APPS = ["Primal", "Coracle", "Snort", "Habla", "Yakihonne"];

const MODE_CARDS = [
  { key: "remote", icon: ServerIcon, iconColor: "text-blue-500", iconBg: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10" },
  { key: "local", icon: LockIcon, iconColor: "text-emerald-500", iconBg: "bg-gradient-to-br from-emerald-500/10 to-green-500/10" },
  { key: "hybrid", icon: NetworkIcon, iconColor: "text-primary", iconBg: "bg-gradient-to-br from-primary/20 to-purple-500/20", recommended: true },
];

const GET_STARTED_STEPS = [
  { title: "Install the extension", description: "Add to Chrome, Brave, Edge, Opera, or Firefox" },
  { title: "Set up your account", description: "Create new keys, import nsec, add watch-only, or connect via NIP-46" },
  { title: "Choose your WoT mode", description: "Remote for speed, Local for privacy, or Hybrid for both" },
  { title: "Customize settings", description: "Adjust trust scoring, permissions, and auto-lock timer" },
  { title: "Browse Nostr", description: "Your identity and Web of Trust now follow you everywhere" },
];

const PRIVACY_MODES = [
  {
    icon: ServerIcon,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    title: "Remote Mode",
    description: "Queries sent to oracle server",
    features: ["No content data shared", "Only pubkey lookups", "No logging or tracking"],
  },
  {
    icon: LockIcon,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    title: "Local Mode",
    description: "Everything stays in your browser",
    features: ["Zero external requests", "No tracking or analytics", "Export your data anytime", "Works completely offline"],
    featured: true,
    badge: "Maximum Privacy",
  },
];

export default async function FeaturesPage() {
  const t = await getTranslations("features");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Nostr Web of Trust Features",
    "description": "Explore Nostr WoT features: NIP-07 signer, multi-account vault, Lightning wallet, trust scoring, privacy modes, badge injection, and seamless integration with any Nostr app.",
    "url": "https://nostr-wot.com/features",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Nostr Web of Trust",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Chrome, Brave, Edge, Opera, Firefox",
      "featureList": [
        "NIP-07 signer and identity provider",
        "Multi-account management with HD derivation",
        "NIP-46 remote signer support",
        "Encrypted vault with auto-lock",
        "Trust badge injection on Nostr sites",
        "Universal window.nostr.wot API",
        "Customizable trust scoring",
        "Remote, Local, and Hybrid modes",
        "Watch-only accounts",
        "6 languages supported",
        "Built-in Lightning wallet with NWC and LNbits support",
        "WebLN provider for seamless zap payments",
      ],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "ratingCount": "1",
        "bestRating": "5",
        "worstRating": "1",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-down">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
              <NetworkIcon className="w-4 h-4" />
              {t("hero.badge")}
            </div>
          </ScrollReveal>
          <ScrollReveal animation="zoom-in" delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              {t("hero.title")}
              <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Extension Overview Section */}
      <Section background="gradient">
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<NetworkIcon className="w-6 h-6" />}
            badge={t("extensionOverview.badge")}
            title={t("extensionOverview.title")}
            description={t("extensionOverview.description")}
          />
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { key: "signer", color: "text-purple-500", bg: "bg-purple-500/10", icon: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" },
            { key: "vault", color: "text-amber-500", bg: "bg-amber-500/10", icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" },
            { key: "multiAccount", color: "text-blue-500", bg: "bg-blue-500/10", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
            { key: "wallet", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { key: "badges", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" },
            { key: "permissions", color: "text-rose-500", bg: "bg-rose-500/10", icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" },
            { key: "webln", color: "text-orange-500", bg: "bg-orange-500/10", icon: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" },
            { key: "i18n", color: "text-cyan-500", bg: "bg-cyan-500/10", icon: "M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.148 15.584 2 19.116m6.228-1.881a48.48 48.48 0 006.862-4.965" },
          ].map((item, i) => (
            <ScrollReveal key={item.key} animation="fade-up" delay={50 + i * 50}>
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-4`}>
                  <svg className={`w-5 h-5 ${item.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">{t(`extensionOverview.${item.key}.title`)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t(`extensionOverview.${item.key}.description`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Universal API Section */}
      <Section background="gradient">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="fade-right">
            <div>
              <div className="inline-flex items-center gap-2 text-primary mb-6">
                <AnimatedLinkIcon className="w-6 h-6" />
                <span className="font-semibold text-sm uppercase tracking-wider">{t("universalApi.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{t("universalApi.title")}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{t("universalApi.description")}</p>
              <div className="flex flex-wrap gap-2">
                {COMPATIBLE_APPS.map((app) => (
                  <span key={app} className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-700">
                    {app}
                  </span>
                ))}
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {t("universalApi.compatibleApps")}
                </span>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-left" delay={200}>
            <CodeBlock code={API_EXAMPLE} language="javascript" />
          </ScrollReveal>
        </div>
      </Section>

      {/* Choose Your Source Section */}
      <Section>
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedGlobeIcon className="w-6 h-6" />}
            badge={t("chooseSource.badge")}
            title={t("chooseSource.title")}
            description={t("chooseSource.description")}
          />
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {MODE_CARDS.map((card, i) => (
            <ScrollReveal key={card.key} animation="fade-up" delay={100 + i * 100}>
              <ModeCard
                icon={<card.icon className={`w-7 h-7 ${card.iconColor}`} />}
                iconBg={card.iconBg}
                title={t(`chooseSource.${card.key}.title`)}
                description={t(`chooseSource.${card.key}.description`)}
                features={[
                  t(`chooseSource.${card.key}.features.${card.key === "remote" ? "instant" : card.key === "local" ? "privacy" : "fast"}`),
                  t(`chooseSource.${card.key}.features.${card.key === "remote" ? "noStorage" : card.key === "local" ? "relays" : "privacy"}`),
                  t(`chooseSource.${card.key}.features.${card.key === "remote" ? "default" : card.key === "local" ? "offline" : "coverage"}`),
                  t(`chooseSource.${card.key}.features.${card.key === "remote" ? "selfHosted" : card.key === "local" ? "export" : "fallback"}`),
                ]}
                bestFor={card.recommended ? undefined : t(`chooseSource.${card.key}.bestFor`)}
                recommended={card.recommended}
                recommendedLabel={card.recommended ? t("chooseSource.hybrid.recommended") : undefined}
              />
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Trust Scoring Section */}
      <Section background="gradient">
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedScaleIcon className="w-6 h-6" />}
            badge={t("trustScoring.badge")}
            title={t("trustScoring.title")}
            description={t("trustScoring.description")}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <TrustSpectrumVisualization />
        </ScrollReveal>
        <ScoringDetailsGrid />
      </Section>

      {/* Formula Section */}
      <Section>
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedCalculatorIcon className="w-6 h-6" />}
            badge={t("formula.badge")}
            title={t("formula.title")}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <FormulaDisplay />
        </ScrollReveal>
      </Section>

      {/* Settings Preview Section */}
      <Section background="gradient">
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedWrenchIcon className="w-6 h-6" />}
            badge={t("settings.badge")}
            title={t("settings.title")}
          />
        </ScrollReveal>
        <SettingsPreview />
      </Section>

      {/* Dashboard Preview */}
      <Section>
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedChartIcon className="w-6 h-6" />}
            badge={t("dashboard.badge")}
            title={t("dashboard.title")}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <DashboardPreview />
        </ScrollReveal>
      </Section>

      {/* Lightning Wallet Section */}
      <Section background="gradient">
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            badge={t("wallet.badge")}
            title={t("wallet.title")}
            description={t("wallet.description")}
          />
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {[
            { key: "quickSetup", color: "text-amber-500", bg: "bg-amber-500/10" },
            { key: "nwc", color: "text-blue-500", bg: "bg-blue-500/10" },
            { key: "lnbits", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((card, i) => (
            <ScrollReveal key={card.key} animation="fade-up" delay={100 + i * 100}>
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-6`}>
                  <svg className={`w-6 h-6 ${card.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{t(`wallet.${card.key}.title`)}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t(`wallet.${card.key}.description`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { key: "webln", icon: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" },
            { key: "autoApprove", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
          ].map((item, i) => (
            <ScrollReveal key={item.key} animation="fade-up" delay={100 + i * 100}>
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t(`wallet.${item.key}.title`)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t(`wallet.${item.key}.description`)}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Privacy Section */}
      <Section background="gradient">
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedLockIcon className="w-6 h-6" />}
            badge={t("privacy.badge")}
            title={t("privacy.title")}
          />
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRIVACY_MODES.map((mode, i) => (
            <ScrollReveal key={mode.title} animation="fade-up" delay={100 + i * 100}>
              <div className={mode.featured ? "relative bg-gradient-to-br from-primary/5 via-purple-500/5 to-indigo-500/5 rounded-2xl p-8 border-2 border-primary/30 h-full" : "bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full"}>
                {mode.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">{mode.badge}</span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl ${mode.iconBg} flex items-center justify-center mb-6`}>
                  <mode.icon className={`w-6 h-6 ${mode.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{mode.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{mode.description}</p>
                <ul className="space-y-3">
                  {mode.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircleIcon className="w-5 h-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Get Started Section */}
      <Section>
        <ScrollReveal animation="fade-up">
          <SectionHeader
            badgeIcon={<AnimatedRocketIcon className="w-6 h-6" />}
            badge={t("getStarted.badge")}
            title={t("getStarted.title")}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="max-w-4xl mx-auto">
            <StepsList steps={GET_STARTED_STEPS} />
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="text-center mt-12">
            <LinkButton href="/download" size="lg" className="hover-lift shadow-lg shadow-primary/30">
              Download Extension
            </LinkButton>
          </div>
        </ScrollReveal>
      </Section>

      {/* API for Developers Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <SectionHeader
              badgeIcon={<CodeBracketsIcon className="w-5 h-5" />}
              badge={t("api.badge")}
              title={t("api.title")}
              className="text-white"
            />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <CodeBlock code={FULL_API_EXAMPLE} language="javascript" showLineNumbers />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="text-center mt-10">
              <Link href="/docs" className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-lg">
                {t("api.viewDocs")}
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <Section>
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("pricing.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">{t("pricing.description")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/download" size="lg" className="hover-lift shadow-lg shadow-primary/30">
                Get the Extension
              </LinkButton>
              <ExternalLinkButton href="https://github.com/nostr-wot/nostr-wot" variant="secondary" size="lg" className="hover-lift">
                View on GitHub
              </ExternalLinkButton>
            </div>
          </div>
        </ScrollReveal>
      </Section>
      </main>
    </>
  );
}
