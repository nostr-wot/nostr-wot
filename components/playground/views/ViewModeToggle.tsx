"use client";

import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { ViewMode } from "@/lib/graph/types";

export default function ViewModeToggle() {
  const t = useTranslations("playground");
  const { state, setViewMode } = useGraph();

  const modes: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      value: "graph",
      label: t("graph.viewGraph"),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth={2} />
          <circle cx="5" cy="5" r="2" strokeWidth={2} />
          <circle cx="19" cy="5" r="2" strokeWidth={2} />
          <circle cx="5" cy="19" r="2" strokeWidth={2} />
          <circle cx="19" cy="19" r="2" strokeWidth={2} />
          <path strokeWidth={2} d="M12 9V7M12 15v2M9 12H7M15 12h2" />
        </svg>
      ),
    },
    {
      value: "list",
      label: t("graph.viewList"),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      value: "timeline",
      label: t("graph.viewTimeline"),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {modes.map((mode) => (
        <button
          key={mode.value}
          aria-label={mode.label}
          aria-pressed={state.viewMode === mode.value}
          onClick={() => setViewMode(mode.value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            state.viewMode === mode.value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
