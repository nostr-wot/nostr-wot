"use client";

import { useTranslations } from "next-intl";

import { ScrollReveal } from "@/components/ui";

export default function ScoringDetailsGrid() {
  const t = useTranslations("features");
  const u = useTranslations("ui");
  const PERMISSION_SCOPES = [
    { hops: t("trustScoring.distance.rows.hop1"), weight: "100%", color: "bg-emerald-500" },
    { hops: t("trustScoring.distance.rows.hop2"), weight: "75%", color: "bg-amber-500" },
    { hops: t("trustScoring.distance.rows.hop3"), weight: "50%", color: "bg-orange-500" },
    { hops: t("trustScoring.distance.rows.hop4"), weight: "25%", color: "bg-red-500" },
  ];

  const APPROVAL_MODES = [
    { signal: t("trustScoring.bonuses.rows.hop2Paths"), bonus: t("trustScoring.bonuses.rows.hop2Bonus"), desc: u("everyRequest") },
    { signal: t("trustScoring.bonuses.rows.hop3Paths"), bonus: t("trustScoring.bonuses.rows.hop3Bonus"), desc: u("untilClose") },
    { signal: t("trustScoring.bonuses.rows.hop4Paths"), bonus: t("trustScoring.bonuses.rows.hop4Bonus"), desc: u("trustedSite") },
    { signal: u("revoke"), bonus: u("instant"), desc: u("revokeSettings") },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <ScrollReveal animation="fade-up" delay={200}>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
          <h3 className="text-lg font-bold mb-2">{t("trustScoring.distance.title")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t("trustScoring.distance.description")}</p>
          <div className="space-y-4">
            {PERMISSION_SCOPES.map((item) => (
              <div key={item.hops} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">{item.hops}</div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.weight }} />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-bold text-gray-900 dark:text-white">{item.weight}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 italic">{u("scopeNote")}</p>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={300}>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
          <h3 className="text-lg font-bold mb-2">{t("trustScoring.bonuses.title")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t("trustScoring.bonuses.description")}</p>
          <div className="space-y-4">
            {APPROVAL_MODES.map((item) => (
              <div key={item.signal} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.signal}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.bonus}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
