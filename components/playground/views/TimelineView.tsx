"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { formatPubkey } from "@/lib/graph/transformers";
import { getTrustClass } from "@/lib/graph/colors";

export default function TimelineView() {
  const t = useTranslations("playground");
  const { filteredData, getProfile } = useGraph();
  const { select } = useNodeSelection();

  // Group nodes by distance
  const nodesByDistance = useMemo(() => {
    const groups = new Map<number, typeof filteredData.nodes>();

    for (const node of filteredData.nodes) {
      const distance = node.distance;
      if (!groups.has(distance)) {
        groups.set(distance, []);
      }
      groups.get(distance)!.push(node);
    }

    // Sort each group by trust score
    for (const nodes of groups.values()) {
      nodes.sort((a, b) => b.trustScore - a.trustScore);
    }

    return groups;
  }, [filteredData.nodes]);

  // Get sorted distances
  const distances = Array.from(nodesByDistance.keys()).sort((a, b) => a - b);

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {distances.map((distance) => {
          const nodes = nodesByDistance.get(distance) || [];
          const distanceLabel =
            distance === 0
              ? t("graph.timelineYou")
              : distance === 1
              ? t("graph.timelineDirectFollows")
              : t("graph.timelineHops", { count: distance });

          return (
            <div key={distance} className="relative mb-8 last:mb-0">
              {/* Distance header */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    distance === 0
                      ? "bg-primary"
                      : distance === 1
                      ? "bg-trust-green"
                      : distance === 2
                      ? "bg-blue-500"
                      : "bg-trust-yellow"
                  }`}
                >
                  {distance}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {distanceLabel}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {nodes.length} {nodes.length === 1 ? "node" : "nodes"}
                  </p>
                </div>
              </div>

              {/* Vertical line connector */}
              {distance < distances[distances.length - 1] && (
                <div className="absolute left-5 top-14 bottom-0 w-px bg-gray-300 dark:bg-gray-700" />
              )}

              {/* Nodes grid */}
              <div className="ml-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {nodes.slice(0, 12).map((node) => {
                  const profile = getProfile(node.id);
                  const trustClass = getTrustClass(node.trustScore);

                  return (
                    <button
                      key={node.id}
                      onClick={() => select(node)}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors text-left"
                    >
                      {/* Avatar */}
                      {node.picture || profile?.picture ? (
                        <img
                          src={node.picture || profile?.picture}
                          alt={`${profile?.displayName || profile?.name || node.label || "User"} avatar`}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 dark:text-gray-400">
                            {(node.label || "?")[0].toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {profile?.displayName ||
                            profile?.name ||
                            node.label ||
                            formatPubkey(node.id)}
                        </p>
                        <span
                          className={`text-xs font-medium ${trustClass}`}
                        >
                          {Math.round(node.trustScore * 100)}% trust
                        </span>
                      </div>

                      {/* Mutual badge */}
                      {node.isMutual && (
                        <span className="text-xs text-trust-green" aria-label="Mutual follow">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Show more indicator */}
              {nodes.length > 12 && (
                <p className="ml-14 mt-3 text-sm text-gray-500">
                  +{nodes.length - 12} more
                </p>
              )}
            </div>
          );
        })}

        {distances.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t("graph.noNodes")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
