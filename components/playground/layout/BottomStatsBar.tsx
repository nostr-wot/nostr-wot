"use client";

import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";

export default function BottomStatsBar() {
  const t = useTranslations("playground");
  const { stats } = useGraph();
  if (stats.totalNodes <= 1) return null;
  return (
    <div className="flex flex-wrap gap-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
      <span>{t("graph.nodes")}: <strong>{stats.totalNodes}</strong></span>
      <span>{t("graph.edges")}: <strong>{stats.totalEdges}</strong></span>
      <span>{t("graph.mutuals")}: <strong>{stats.mutualCount}</strong></span>
      <span>{t("graph.avgTrust")}: <strong>{Math.round(stats.avgTrustScore * 100)}%</strong></span>
    </div>
  );
}
