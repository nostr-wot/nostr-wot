"use client";

import { useTranslations } from "next-intl";

import { ScrollReveal } from "@/components/ui";

const RELAYS = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band", "wss://relay.primal.net"];

const PROFILE_FIELDS = [
  { depth: "name", nodes: "satoshi" },
  { depth: "about", nodes: "building on nostr" },
  { depth: "nip05", nodes: "you@nostr-wot.com" },
];



export default function SettingsPreview() {
  const t = useTranslations("features");
  const u = useTranslations("ui");
  const MUTE_OPTIONS = [
    { title: t("settings.lists.blocklist.title"), desc: t("settings.lists.blocklist.description") },
    { title: t("settings.lists.trustlist.title"), desc: t("settings.lists.trustlist.description") },
    { title: u("synced"), desc: u("syncedDescription") },
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ScrollReveal animation="fade-up" delay={100}>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/50">
          <h3 className="font-bold mb-4">{t("settings.relays.title")}</h3>
          <div className="space-y-2">
            {RELAYS.map((relay) => (
              <div key={relay} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400 truncate">{relay}</span>
              </div>
            ))}
            <button className="w-full p-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 text-sm hover:border-primary hover:text-primary transition-colors">
              {u("addRelay")}
            </button>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={200}>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/50">
          <h3 className="font-bold mb-4">{t("settings.syncDepth.title")}</h3>
          <div className="space-y-3">
            {PROFILE_FIELDS.map((item) => (
              <div key={item.depth} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <span className="font-mono text-sm text-gray-500">{item.depth}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate ml-2">{item.depth === "about" ? u("sampleBio") : item.nodes}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={300}>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/50">
          <h3 className="font-bold mb-4">{t("settings.lists.title")}</h3>
          <div className="space-y-4">
            {MUTE_OPTIONS.map((opt) => (
              <div key={opt.title} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-sm font-medium mb-1">{opt.title}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
