import Link from "next/link";
import { getTranslations } from "next-intl/server";
import HeroAnimation from "@/components/HeroAnimation";
import { ScrollReveal, AnimatedCounter, LinkButton, ExternalLinkButton } from "@/components/ui";
import {
  ShieldIcon,
  SpeedIcon,
  LockIcon,
  NetworkIcon,
  PuzzleIcon,
  ServerIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  NostrLogo,
  ExtensionIllustration,
  OracleIllustration,
} from "@/components/icons";

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <HeroAnimation />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <ScrollReveal animation="fade-down" delay={100}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t("hero.badge")}
            </div>
          </ScrollReveal>
          <ScrollReveal animation="zoom-in" delay={200}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              {t("hero.title")}
              <br />
              <span className="text-primary">{t("hero.titleHighlight")}</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <LinkButton href="/download" className="hover-lift">
                {t("hero.downloadButton")}
              </LinkButton>
              <LinkButton href="/docs" variant="secondary" className="hover-lift">
                {t("hero.docsButton")}
              </LinkButton>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={500}>
            <a
              href="https://nostr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-nostr transition-colors text-sm"
            >
              <span>{t("hero.builtFor")}</span>
              <NostrLogo className="w-6 h-6 text-nostr" />
              <span>Nostr</span>
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <ScrollReveal animation="fade-up" delay={0}>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {t("stats.license")}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("stats.licenseLabel")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={100}>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {t("stats.responseTime")}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("stats.responseTimeLabel")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={200}>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={10} suffix="K+" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("stats.requestsPerSecondLabel")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={100} suffix="%" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("stats.selfHostableLabel")}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("howItWorks.title")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t("howItWorks.description")}
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal animation="zoom-in" delay={100}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("howItWorks.step1.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("howItWorks.step1.description")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="zoom-in" delay={200}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("howItWorks.step2.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("howItWorks.step2.description")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="zoom-in" delay={300}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("howItWorks.step3.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("howItWorks.step3.description")}
                </p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="text-center mt-12">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline link-underline"
              >
                {t("howItWorks.learnMoreLink")}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Value Props Section */}
      <section id="features" className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("whyWot.title")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t("whyWot.description")}
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <ShieldIcon className="w-16 h-16 mb-6" />
                <h3 className="text-xl font-semibold mb-3">
                  {t("whyWot.decentralized.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("whyWot.decentralized.description")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <SpeedIcon className="w-16 h-16 mb-6" />
                <h3 className="text-xl font-semibold mb-3">{t("whyWot.fast.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("whyWot.fast.description")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <LockIcon className="w-16 h-16 mb-6" />
                <h3 className="text-xl font-semibold mb-3">{t("whyWot.privacy.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("whyWot.privacy.description")}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WoT Extension Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal animation="fade-right">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <PuzzleIcon className="w-4 h-4" />
                  {t("extension.badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t("extension.title")}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {t.rich("extension.description", {
                    apiCode: () => (
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                        window.nostr.wot
                      </code>
                    ),
                  })}
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{t("extension.features.clientSide.title")}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("extension.features.clientSide.description")}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{t("extension.features.mode.title")}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("extension.features.mode.description")}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{t("extension.features.privacy.title")}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("extension.features.privacy.description")}</p>
                    </div>
                  </li>
                </ul>
                <LinkButton href="/download" className="hover-lift">
                  {t("extension.downloadButton")}
                </LinkButton>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-3xl p-8 border border-purple-200 dark:border-purple-800">
                  <ExtensionIllustration />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WoT Oracle Section */}
      <section className="py-24 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal animation="fade-right" className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/40 dark:to-purple-900/40 rounded-3xl p-8 border border-violet-200 dark:border-violet-800">
                  <OracleIllustration />
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200} className="order-1 lg:order-2">
              <div>
                <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <ServerIcon className="w-4 h-4" />
                  {t("oracle.badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t("oracle.title")}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {t("oracle.description")}
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{t("oracle.features.api.title")}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("oracle.features.api.description")}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{t("oracle.features.performance.title")}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("oracle.features.performance.description")}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{t("oracle.features.selfHost.title")}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("oracle.features.selfHost.description")}</p>
                    </div>
                  </li>
                </ul>
                <LinkButton href="/oracle" className="hover-lift">
                  {t("oracle.learnMoreButton")}
                </LinkButton>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="zoom-in">
            <NetworkIcon className="w-20 h-20 mx-auto mb-8 opacity-90" />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t("cta.title")}
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {t("cta.description")}
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/download" variant="white" className="hover-lift">
                {t("cta.getExtensionButton")}
              </LinkButton>
              <ExternalLinkButton
                href="https://github.com/mappingbitcoin/nostr-wot-extension"
                variant="white-outline"
                className="hover-lift"
              >
                {t("cta.viewGithubButton")}
              </ExternalLinkButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
