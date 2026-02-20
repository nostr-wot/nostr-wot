"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { sortNodes, formatPubkey } from "@/lib/graph/transformers";
import { getTrustClass } from "@/lib/graph/colors";
import { Badge } from "@/components/ui";

type SortField = "trust" | "distance" | "name";
type SortDirection = "asc" | "desc";

export default function ListView() {
  const t = useTranslations("playground");
  const { filteredData, getProfile } = useGraph();
  const { select } = useNodeSelection();

  const [sortField, setSortField] = useState<SortField>("trust");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedNodes = useMemo(() => {
    const sorted = sortNodes(filteredData.nodes, sortField);
    return sortDirection === "desc" ? sorted : sorted.reverse();
  }, [filteredData.nodes, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left font-medium text-gray-400 hover:text-white transition-colors"
    >
      {children}
      {sortField === field && (
        <svg
          className={`w-4 h-4 transition-transform ${
            sortDirection === "asc" ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
          <tr className="text-sm">
            <th className="px-4 py-3 text-left">
              <SortHeader field="name">{t("graph.colName")}</SortHeader>
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader field="trust">{t("graph.colTrust")}</SortHeader>
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader field="distance">{t("graph.colDistance")}</SortHeader>
            </th>
            <th className="px-4 py-3 text-left text-gray-400">
              {t("graph.colStatus")}
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {sortedNodes.map((node) => {
            const profile = getProfile(node.id);
            const trustClass = getTrustClass(node.trustScore);

            return (
              <tr
                key={node.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => select(node)}
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {node.picture || profile?.picture ? (
                      <img
                        src={node.picture || profile?.picture}
                        alt={`${profile?.displayName || profile?.name || node.label || "User"} avatar`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          {(node.label || "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile?.displayName ||
                          profile?.name ||
                          node.label ||
                          "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {formatPubkey(node.id)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Trust */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${trustClass}`}
                  >
                    {Math.round(node.trustScore * 100)}%
                  </span>
                </td>

                {/* Distance */}
                <td className="px-4 py-3">
                  {node.isRoot ? (
                    <Badge variant="primary" size="sm">
                      {t("graph.you")}
                    </Badge>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">
                      {node.distance} {node.distance === 1 ? "hop" : "hops"}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {node.isMutual && (
                      <Badge variant="success" size="sm">
                        {t("graph.mutual")}
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <Link
                    href={`/profile/${node.id}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary-dark transition-colors"
                    aria-label="Open full profile in new tab"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sortedNodes.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t("graph.noNodes")}</p>
        </div>
      )}
    </div>
  );
}
