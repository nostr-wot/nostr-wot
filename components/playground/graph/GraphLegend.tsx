"use client";

import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { calculateTrustScore, getTrustColorHex } from "@/lib/graph/colors";

export default function GraphLegend() {
  const t = useTranslations("playground");
  const { state } = useGraph();
  const items = state.settings.colorMode === "distance"
    ? [1, 2, 3, 4].map(count => ({ label: t("graph.legendHops", { count }), color: getTrustColorHex(calculateTrustScore(count, 1)) }))
    : [{ label: t("graph.legendHigh"), color: getTrustColorHex(0.85) },
       { label: t("graph.legendMedium"), color: getTrustColorHex(0.5) },
       { label: t("graph.legendLow"), color: getTrustColorHex(0.15) }];
  return (
    <div className="absolute top-3 left-3 pointer-events-none rounded-lg border border-gray-700 bg-gray-800/90 p-3 z-10 text-xs text-gray-300">
      <p className="mb-2 font-medium">{t(state.settings.colorMode === "distance" ? "graph.colorByDistance" : "graph.legendTitle")}</p>
      {[{ label: t("graph.legendRoot"), color: "#6366f1" }, ...items].map(item => (
        <div key={item.label} className="flex items-center gap-2 mt-1">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />{item.label}
        </div>
      ))}
    </div>
  );
}
