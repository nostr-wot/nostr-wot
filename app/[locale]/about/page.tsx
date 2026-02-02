import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal, LinkButton } from "@/components/ui";
import {
  ShieldIcon,
  BellIcon,
  SearchIcon,
  StarIcon,
  ArrowDownIcon,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about.meta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-down">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t("hero.title")}
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-center mb-6">{t("problem.title")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-3xl mx-auto">
              {t("problem.description")}{" "}
              <strong className="text-gray-900 dark:text-white">
                {t("problem.socialDistance")}
              </strong>
              {t("problem.descriptionContinued")}
            </p>
          </ScrollReveal>

          {/* Hops Visualization */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-12">
            <ScrollReveal animation="zoom-in" delay={0}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg animate-pulse-glow">
                  {t("hops.you")}
                </div>
                <span className="text-sm text-gray-500 mt-2">{t("hops.center")}</span>
              </div>
            </ScrollReveal>
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700 hidden sm:block" />
            <ScrollReveal animation="zoom-in" delay={100}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-trust-green text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <span className="text-sm text-gray-500 mt-2">{t("hops.following")}</span>
              </div>
            </ScrollReveal>
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700 hidden sm:block" />
            <ScrollReveal animation="zoom-in" delay={200}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-trust-yellow text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <span className="text-sm text-gray-500 mt-2">
                  {t("hops.friendsOfFriends")}
                </span>
              </div>
            </ScrollReveal>
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-700 hidden sm:block" />
            <ScrollReveal animation="zoom-in" delay={300}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-trust-red text-white flex items-center justify-center font-bold text-lg">
                  3+
                </div>
                <span className="text-sm text-gray-500 mt-2">{t("hops.likelyNoise")}</span>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="fade-up" delay={400}>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
              <h3 className="font-semibold text-lg mb-4 text-center">
                {t("whyWorks.title")}
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="card-interactive p-4 rounded-lg bg-white dark:bg-gray-700">
                  <strong className="block text-gray-900 dark:text-white mb-2">
                    {t("whyWorks.oneHop.title")}
                  </strong>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("whyWorks.oneHop.description")}
                  </p>
                </div>
                <div className="card-interactive p-4 rounded-lg bg-white dark:bg-gray-700">
                  <strong className="block text-gray-900 dark:text-white mb-2">
                    {t("whyWorks.twoHop.title")}
                  </strong>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("whyWorks.twoHop.description")}
                  </p>
                </div>
                <div className="card-interactive p-4 rounded-lg bg-white dark:bg-gray-700">
                  <strong className="block text-gray-900 dark:text-white mb-2">
                    {t("whyWorks.threeHop.title")}
                  </strong>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("whyWorks.threeHop.description")}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t("architecture.title")}
            </h2>
          </ScrollReveal>
          <div className="space-y-4">
            <ScrollReveal animation="fade-down" delay={0}>
              <div className="flex justify-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center max-w-md w-full card-interactive">
                  <strong className="block text-gray-900 dark:text-white">
                    {t("architecture.yourApp.title")}
                  </strong>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("architecture.yourApp.description")}
                  </span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="zoom-in" delay={100}>
              <div className="text-center text-2xl text-gray-400">
                <ArrowDownIcon className="w-6 h-6 mx-auto animate-bounce" />
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="flex justify-center">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center max-w-md w-full card-interactive">
                  <strong className="block text-gray-900 dark:text-white">
                    {t("architecture.extension.title")}
                  </strong>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("architecture.extension.description")}
                  </span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="zoom-in" delay={300}>
              <div className="text-center text-2xl text-gray-400">
                <ArrowDownIcon className="w-6 h-6 mx-auto animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={400}>
              <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center w-48 card-interactive">
                  <strong className="block text-gray-900 dark:text-white">
                    {t("architecture.localIndex.title")}
                  </strong>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("architecture.localIndex.description")}
                  </span>
                </div>
                <span className="text-gray-400 font-medium">{t("architecture.or")}</span>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center w-48 card-interactive">
                  <strong className="block text-gray-900 dark:text-white">
                    {t("architecture.oracle.title")}
                  </strong>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("architecture.oracle.description")}
                  </span>
                </div>
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
                  <strong className="block text-gray-900 dark:text-white">
                    {t("architecture.relays.title")}
                  </strong>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("architecture.relays.description")}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-center mb-4">{t("useCases.title")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              {t("useCases.subtitle")}
            </p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal animation="fade-up" delay={0}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <ShieldIcon className="w-12 h-12 mb-4" />
                <h3 className="font-semibold mb-2">{t("useCases.spamFiltering.title")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("useCases.spamFiltering.description")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <StarIcon className="w-12 h-12 mb-4" />
                <h3 className="font-semibold mb-2">{t("useCases.trustScores.title")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("useCases.trustScores.description")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <BellIcon className="w-12 h-12 mb-4" />
                <h3 className="font-semibold mb-2">{t("useCases.smartNotifications.title")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("useCases.smartNotifications.description")}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-interactive h-full">
                <SearchIcon className="w-12 h-12 mb-4" />
                <h3 className="font-semibold mb-2">{t("useCases.contentDiscovery.title")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("useCases.contentDiscovery.description")}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t("codeExamples.title")}
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal animation="fade-right" delay={100}>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden card-interactive">
                <div className="bg-gray-800 dark:bg-gray-700 px-4 py-2 text-sm text-gray-400">
                  {t("codeExamples.javascript")}
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-100">{`// Check if someone is in your web of trust
if (window.nostr?.wot) {
  const distance = await window.nostr.wot.getDistance(pubkey);

  if (distance !== null && distance <= 2) {
    console.log("Trusted! " + distance + " hops away");
  }
}`}</code>
                </pre>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200}>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden card-interactive">
                <div className="bg-gray-800 dark:bg-gray-700 px-4 py-2 text-sm text-gray-400">
                  {t("codeExamples.restApi")}
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-100">{`# Query social distance between two users
curl "https://wot-oracle.example.com/distance?\\
from=PUBKEY1&to=PUBKEY2"

# Response
{
  "distance": 2,
  "paths": 5,
  "mutual": false
}`}</code>
                </pre>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="zoom-in">
            <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t("cta.subtitle")}
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/docs" className="hover-lift">
                {t("cta.readDocs")}
              </LinkButton>
              <LinkButton href="/download" variant="secondary" className="hover-lift">
                {t("cta.getExtension")}
              </LinkButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
