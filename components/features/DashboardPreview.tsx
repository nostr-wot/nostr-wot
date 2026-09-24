"use client";

import { useTranslations } from "next-intl";

const ACCOUNT_STATS = [
  { value: "4", label: "nodes", color: "text-cyan-400" },
  { value: "12", label: "edges", color: "text-purple-400" },
  { value: "Unlocked", label: "cacheHitRate", color: "text-emerald-400" },
  { value: "<5ms", label: "avgQueryTime", color: "text-amber-400" },
];

export default function DashboardPreview() {
  const t = useTranslations("features");
  const u = useTranslations("ui");
  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-10 shadow-2xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {ACCOUNT_STATS.map((stat) => (
          <div key={t(`dashboard.${stat.label}`)} className="text-center p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50">
            <div className={`text-2xl lg:text-3xl font-bold ${stat.color}`}>{stat.value === "Unlocked" ? u("unlocked") : stat.value}</div>
            <p className="text-sm text-gray-500 mt-1">{t(`dashboard.${stat.label}`)}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
        <span className="text-sm text-gray-400">{t("dashboard.lastSync", { time: "satoshi" })}</span>
        <button className="text-sm text-primary font-medium hover:underline">{u("switchAccount")}</button>
      </div>
    </div>
  );
}
