"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import {
  getTrustCacheLastSyncedAt,
  clearTrustCache,
} from "@/lib/cache/profileCache";

function formatTimeAgo(timestamp: number, t: (key: string, values?: Record<string, string | number>) => string): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return t("graph.cacheJustNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("graph.cacheMinutesAgo", { minutes });
  const hours = Math.floor(minutes / 60);
  return t("graph.cacheHoursAgo", { hours });
}

export default function BottomStatsBar() {
  const t = useTranslations("playground");
  const { stats, state } = useGraph();
  const { isLoading } = state;

  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const [, setTick] = useState(0);

  // Read the sync timestamp on mount and periodically
  useEffect(() => {
    const update = () => setLastSynced(getTrustCacheLastSyncedAt());
    update();
    const interval = setInterval(() => {
      update();
      setTick((t) => t + 1); // force re-render for relative time
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshCache = useCallback(() => {
    clearTrustCache();
    setLastSynced(null);
    // Reload the page so trust data is re-fetched from scratch
    window.location.reload();
  }, []);

  // Only show bar when there's actual graph data
  if (stats.totalNodes <= 1) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur border-t border-gray-700 px-4 py-1.5 z-10">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span><span className="text-white font-medium">{stats.totalNodes}</span> people</span>
          <span><span className="text-white font-medium">{stats.mutualCount}</span> mutuals</span>
          <span>avg trust <span className="text-white font-medium">{Math.round(stats.avgTrustScore * 100)}%</span></span>
        </div>

        <div className="flex items-center gap-3">
          {lastSynced && (
            <span className="text-gray-500">
              synced {formatTimeAgo(lastSynced, t)}
            </span>
          )}
          <button
            onClick={handleRefreshCache}
            disabled={isLoading}
            className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            title={t("graph.cacheRefresh")}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}