"use client";

import { useTranslations } from "next-intl";
import { useGraphFilters } from "@/hooks/useGraphFilters";

export default function EdgeTypeFilters() {
  const t = useTranslations("playground");
  const { filters, toggleFollows, toggleMutualsOnly } =
    useGraphFilters();

  return (
    <div className="space-y-3">
      {/* Show follows */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={filters.showFollows}
            onChange={toggleFollows}
            className="sr-only peer"
          />
          <div className="w-5 h-5 border-2 border-gray-600 rounded peer-checked:bg-primary peer-checked:border-primary transition-colors">
            {filters.showFollows && (
              <svg
                className="w-full h-full text-white p-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
          {t("graph.showFollows")}
        </span>
      </label>

      {/* Mutuals only */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={filters.showMutualsOnly}
            onChange={toggleMutualsOnly}
            className="sr-only peer"
          />
          <div className="w-5 h-5 border-2 border-gray-600 rounded peer-checked:bg-trust-green peer-checked:border-trust-green transition-colors">
            {filters.showMutualsOnly && (
              <svg
                className="w-full h-full text-white p-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
          {t("graph.mutualsOnly")}
        </span>
      </label>
    </div>
  );
}
