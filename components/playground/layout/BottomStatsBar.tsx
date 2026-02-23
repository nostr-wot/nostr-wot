"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import {
  getTrustCacheLastSyncedAt,
  clearTrustCache,
} from "@/lib/cache/profileCache";

function formatTimeAgo(timestamp: number, t: (key: string) => string): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return t("graph.cacheJustNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("graph.cacheMinutesAgo").replace("{minutes}", String(minutes));
  const hours = Math.floor(minutes / 60);
  return t("graph.cacheHoursAgo").replace("{hours}", String(hours));
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

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur border-t border-gray-700 px-4 py-2 z-10">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          {/* Nodes count */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{t("graph.nodes")}:</span>
            <span className="text-white font-medium">{stats.totalNodes}</span>
          </div>

          {/* Edges count */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{t("graph.edges")}:</span>
            <span className="text-white font-medium">{stats.totalEdges}</span>
          </div>

          {/* Average trust */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{t("graph.avgTrust")}:</span>
            <span className="text-white font-medium">
              {Math.round(stats.avgTrustScore * 100)}%
            </span>
          </div>

          {/* Max distance */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{t("graph.maxDistance")}:</span>
            <span className="text-white font-medium">{stats.maxDistance}</span>
          </div>

          {/* Mutuals count */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{t("graph.mutuals")}:</span>
            <span className="text-white font-medium">{stats.mutualCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Last synced + refresh */}
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-xs">
              {lastSynced
                ? `${t("graph.cacheSynced")} ${formatTimeAgo(lastSynced, t)}`
                : t("graph.cacheNotSynced")}
            </span>
            <button
              onClick={handleRefreshCache}
              disabled={isLoading}
              className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t("graph.cacheRefresh")}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-primary">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm">{t("graph.loading")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}