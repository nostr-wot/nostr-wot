"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { listSavedGraphs } from "@/lib/graph/databases";
import { useGraphData } from "@/hooks/useGraphData";
export default function GraphSyncControls() {
  const t = useTranslations("playground.sync"), locale = useLocale();
  const { sourceKind, lastSync, isLoading, syncing, progress, syncGraph, stopSync, userPubkey } = useGraphData();
  const [depth, setDepth] = useState(() => {
    try { return listSavedGraphs().find(item => item.pubkey === userPubkey)?.maxHops ?? 1; } catch { return 1; }
  });
  return <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-xs">
    <span className="font-medium">{t(sourceKind)}</span>
    <span className="text-gray-500">{t("lastSync", { date: lastSync ? new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(lastSync) : t("never") })}</span>
    {sourceKind === "local" && <label className="flex items-center gap-2">{t("depth")}
      <select aria-label={t("depth")} className="rounded border border-gray-300 bg-transparent p-1 dark:border-gray-600" value={depth} onChange={e => setDepth(Number(e.target.value))} disabled={isLoading}>
        {[1, 2, 3].map(hops => <option key={hops} value={hops}>{t("hops", { count: hops })}</option>)}
      </select>
    </label>}
    {syncing ? <button className="text-red-600" onClick={stopSync}>{t("stop")}</button> :
      <button className="text-primary disabled:opacity-40" disabled={isLoading} onClick={() => void syncGraph(depth)}>{t(sourceKind === "local" ? "refresh" : "reloadExtension")}</button>}
    {progress && <span role="status">{t("progress", { count: progress.fetched, depth: progress.depth + 1 })}</span>}
    {sourceKind === "extension" && <span className="text-gray-500">{t("extensionHelp")}</span>}
  </div>;
}
