import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ScrollReveal, LinkButton, ExternalLinkButton, CodeBlock } from "@/components/ui";
import {
  NetworkIcon,
  ServerIcon,
  LockIcon,
  SpeedIcon,
  ShieldIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  GlobeIcon,
  ScaleIcon,
  SettingsIcon,
  ChartIcon,
  CodeBracketsIcon,
} from "@/components/icons";

const apiExample = `// Any Nostr app can use your WoT
const trusted = await window.nostr.wot.isInMyWoT(pubkey);
const distance = await window.nostr.wot.getDistance(pubkey);
const score = await window.nostr.wot.getTrustScore(pubkey);`;

const formulaExample = `Trust Score = Base Score × Distance Multiplier × Relationship Bonus

Where:
  Base Score = 1 / (hops + 1)
  Distance Multiplier = your custom weight for that hop count
  Relationship Bonus = sum of applicable bonuses (mutual, paths, etc.)`;

const relayExample = `wss://relay.damus.io
wss://nos.lol
wss://relay.nostr.band
+ Add custom relay`;

const fullApiExample = `// Check if extension is available
if (window.nostr?.wot) {

  // Simple boolean check
  const inNetwork = await window.nostr.wot.isInMyWoT(pubkey, maxHops);

  // Get exact distance
  const hops = await window.nostr.wot.getDistance(pubkey);

  // Get full trust score (with your custom weights)
  const score = await window.nostr.wot.getTrustScore(pubkey);

  // Batch queries
  const results = await window.nostr.wot.batchCheck([pk1, pk2, pk3]);
}`;

export default async function FeaturesPage() {
  const t = await getTranslations("features");

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-down">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <NetworkIcon className="w-4 h-4" />
              {t("hero.badge")}
            </div>
          </ScrollReveal>
          <ScrollReveal animation="zoom-in" delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              {t("hero.title")}
              <br />
              <span className="text-primary">{t("hero.titleHighlight")}</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("hero.description")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Universal API Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal animation="fade-right">
              <div>
                <div className="inline-flex items-center gap-2 text-primary mb-4">
                  <span className="text-2xl">🔗</span>
                  <span className="font-semibold">{t("universalApi.badge")}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t("universalApi.title")}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {t("universalApi.description")}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">Primal</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">Coracle</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">Snort</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">Habla</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">Yakihonne</span>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">{t("universalApi.compatibleApps")}</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={200}>
              <CodeBlock code={apiExample} language="javascript" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Choose Your Source Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <span className="text-2xl">🌐</span>
                <span className="font-semibold">{t("chooseSource.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("chooseSource.title")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t("chooseSource.description")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Remote Oracle */}
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                <ServerIcon className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t("chooseSource.remote.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("chooseSource.remote.description")}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.remote.features.instant")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.remote.features.noStorage")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.remote.features.default")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.remote.features.selfHosted")}
                  </li>
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  <strong>Best for:</strong> {t("chooseSource.remote.bestFor")}
                </p>
              </div>
            </ScrollReveal>

            {/* Local Graph */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                <LockIcon className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t("chooseSource.local.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("chooseSource.local.description")}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.local.features.privacy")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.local.features.relays")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.local.features.offline")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.local.features.export")}
                  </li>
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  <strong>Best for:</strong> {t("chooseSource.local.bestFor")}
                </p>
              </div>
            </ScrollReveal>

            {/* Hybrid Mode */}
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800 h-full">
                <NetworkIcon className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t("chooseSource.hybrid.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("chooseSource.hybrid.description")}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.hybrid.features.fast")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.hybrid.features.privacy")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.hybrid.features.coverage")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    {t("chooseSource.hybrid.features.fallback")}
                  </li>
                </ul>
                <p className="text-sm font-medium text-primary">
                  {t("chooseSource.hybrid.recommended")}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Custom Trust Scoring Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <span className="text-2xl">⚖️</span>
                <span className="font-semibold">{t("trustScoring.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("trustScoring.title")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t("trustScoring.description")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Distance Multipliers */}
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Distance Multipliers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Assign weights based on how far someone is from you:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 font-medium">Hops</th>
                        <th className="text-left py-2 font-medium">Default</th>
                        <th className="text-left py-2 font-medium">Custom</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2">1 (direct)</td>
                        <td className="py-2">1.0</td>
                        <td className="py-2 text-primary">Adjustable</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2">2 (FoF)</td>
                        <td className="py-2">0.5</td>
                        <td className="py-2 text-primary">Adjustable</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2">3</td>
                        <td className="py-2">0.25</td>
                        <td className="py-2 text-primary">Adjustable</td>
                      </tr>
                      <tr>
                        <td className="py-2">4+</td>
                        <td className="py-2">0.1</td>
                        <td className="py-2 text-primary">Adjustable</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>

            {/* Relationship Bonuses */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Relationship Bonuses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Boost trust for stronger signals:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 font-medium">Signal</th>
                        <th className="text-left py-2 font-medium">Multiplier</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2">Mutual follow</td>
                        <td className="py-2 text-green-600 dark:text-green-400">+50%</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2">Multiple paths</td>
                        <td className="py-2 text-green-600 dark:text-green-400">+10% per path</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2">Recent interaction</td>
                        <td className="py-2 text-green-600 dark:text-green-400">+20%</td>
                      </tr>
                      <tr>
                        <td className="py-2">Long-term (&gt;1yr)</td>
                        <td className="py-2 text-green-600 dark:text-green-400">+30%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>

            {/* Trust Thresholds */}
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Trust Thresholds</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Define your own boundaries:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🟢</span>
                      <span className="font-medium text-green-700 dark:text-green-300">Trusted</span>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400">0.7 – 1.0</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Show content freely</p>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🟡</span>
                      <span className="font-medium text-yellow-700 dark:text-yellow-300">Neutral</span>
                    </div>
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">0.3 – 0.7</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Show with caution</p>

                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔴</span>
                      <span className="font-medium text-red-700 dark:text-red-300">Untrusted</span>
                    </div>
                    <span className="text-sm text-red-600 dark:text-red-400">0 – 0.3</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Hide or flag</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scoring Formula Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <span className="text-2xl">🧮</span>
                <span className="font-semibold">{t("formula.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("formula.title")}
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <CodeBlock code={formulaExample} language="text" />
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
              <h4 className="font-semibold mb-3">Example:</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Alice is 2 hops away, you have mutual friends, and 3 distinct paths connect you.
              </p>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                Score = (1/3) × 0.5 × (1 + 0.5 + 0.2) = <span className="text-primary font-bold">0.28</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                You control every variable.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Advanced Settings Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <span className="text-2xl">🔧</span>
                <span className="font-semibold">{t("settings.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                {t("settings.title")}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Relay Selection */}
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Relay Selection (Local Mode)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose which relays to sync from:
                </p>
                <CodeBlock code={relayExample} language="text" />
              </div>
            </ScrollReveal>

            {/* Sync Depth */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Sync Depth</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  How far to crawl from your pubkey:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 font-medium">Depth</th>
                        <th className="text-left py-2 font-medium">Nodes</th>
                        <th className="text-left py-2 font-medium">Storage</th>
                        <th className="text-left py-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2">1 hop</td>
                        <td className="py-2">~500</td>
                        <td className="py-2">~1 MB</td>
                        <td className="py-2">~30 sec</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2">2 hops</td>
                        <td className="py-2">~50k</td>
                        <td className="py-2">~50 MB</td>
                        <td className="py-2">~5 min</td>
                      </tr>
                      <tr>
                        <td className="py-2">3 hops</td>
                        <td className="py-2">~500k</td>
                        <td className="py-2">~500 MB</td>
                        <td className="py-2">~30 min</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>

            {/* Cache Settings */}
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Cache Settings</h3>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex justify-between">
                    <span><strong>TTL:</strong> How long to cache results</span>
                    <span className="text-primary">default: 5 min</span>
                  </li>
                  <li className="flex justify-between">
                    <span><strong>Max entries:</strong> Limit memory usage</span>
                    <span className="text-primary">default: 10,000</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            {/* Blocklist & Trustlist */}
            <ScrollReveal animation="fade-up" delay={400}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Blocklist & Trustlist</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Blocklist</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Manually exclude pubkeys. Blocked users score 0, regardless of distance.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 text-sm text-gray-500">
                      + Add blocked pubkey
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Trustlist</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Override scoring for specific pubkeys.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 text-sm text-gray-500">
                      + Add trusted pubkey → always score 1.0
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <span className="text-2xl">📊</span>
                <span className="font-semibold">{t("dashboard.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                {t("dashboard.title")}
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">12,847</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nodes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">89,421</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Edges</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">94%</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cache Hit Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">3ms</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Query Time</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last sync: 2 hours ago</span>
                <button className="text-sm text-primary font-medium hover:underline">Sync now</button>
              </div>
              <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  <strong>Visualize</strong> (coming soon)
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Interactive graph showing your trust network
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <span className="text-2xl">🔒</span>
                <span className="font-semibold">{t("privacy.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                {t("privacy.title")}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Remote Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Queries sent to oracle (pubkey pairs visible to server)
                </p>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    No content data shared
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    Only pubkey lookups
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200}>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold mb-4">Local Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Everything stays in your browser
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    No external requests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    No tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    No analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    Export your data anytime
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <span className="text-2xl">🚀</span>
                <span className="font-semibold">{t("getStarted.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                {t("getStarted.title")}
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <div className="space-y-4">
              {[
                { step: 1, title: "Install extension", desc: "Add to Chrome, Firefox, or Brave" },
                { step: 2, title: "Enter your pubkey", desc: "Or connect with nos2x/Alby" },
                { step: 3, title: "Choose mode", desc: "Remote, Local, or Hybrid" },
                { step: 4, title: "Adjust scoring", desc: "Customize trust weights to your preferences" },
                { step: 5, title: "Browse Nostr", desc: "Your WoT follows you everywhere" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="text-center mt-10">
              <LinkButton href="/download" className="hover-lift">
                Download Extension
              </LinkButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* API for Developers Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <CodeBracketsIcon className="w-5 h-5" />
                <span className="font-semibold">{t("api.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                {t("api.title")}
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <CodeBlock code={fullApiExample} language="javascript" />
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="text-center mt-8">
              <Link href="/docs" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                {t("api.viewDocs")}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("pricing.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t("pricing.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/download" className="hover-lift">
                Get the Extension
              </LinkButton>
              <ExternalLinkButton
                href="https://github.com/mappingbitcoin/nostr-wot-extension"
                variant="secondary"
                className="hover-lift"
              >
                View on GitHub
              </ExternalLinkButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
