"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { GraphNode } from "@/lib/graph/types";
import { formatPubkey } from "@/lib/graph/transformers";

interface TrustPathDisplayProps {
  node: GraphNode;
}

export default function TrustPathDisplay({ node }: TrustPathDisplayProps) {
  const t = useTranslations("playground");
  const { state, getProfile } = useGraph();

  // Build path from root to node (simplified - uses distance as proxy)
  // In a full implementation, this would use BFS to find actual path
  const path = useMemo(() => {
    if (node.isRoot) return [];

    const rootNode = state.data.nodes.find((n) => n.isRoot);
    if (!rootNode) return [];

    // For distance 1, direct connection
    if (node.distance === 1) {
      return [rootNode, node];
    }

    // For distance > 1, show placeholder path
    // A real implementation would trace the actual path through the graph
    const pathNodes: GraphNode[] = [rootNode];

    // Find intermediate nodes at each distance level
    for (let d = 1; d < node.distance; d++) {
      // Find a node at this distance that could be on the path
      const intermediateNode = state.data.nodes.find(
        (n) => n.distance === d && !n.isRoot
      );
      if (intermediateNode) {
        pathNodes.push(intermediateNode);
      }
    }

    pathNodes.push(node);
    return pathNodes;
  }, [node, state.data.nodes]);

  if (path.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">{t("graph.noPath")}</p>
    );
  }

  return (
    <div className="space-y-2">
      {path.map((pathNode, index) => {
        const profile = getProfile(pathNode.id);
        const isLast = index === path.length - 1;

        return (
          <div key={pathNode.id} className="flex items-center gap-2">
            {/* Node */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {pathNode.picture || profile?.picture ? (
                <img
                  src={pathNode.picture || profile?.picture}
                  alt={`${profile?.displayName || profile?.name || pathNode.label || "User"} avatar`}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {(pathNode.label || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-300 truncate">
                {profile?.displayName ||
                  profile?.name ||
                  pathNode.label ||
                  formatPubkey(pathNode.id)}
              </span>
              {pathNode.isRoot && (
                <span className="text-xs text-primary">({t("graph.you")})</span>
              )}
            </div>

            {/* Arrow (if not last) */}
            {!isLast && (
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            )}
          </div>
        );
      })}

      {/* Path summary */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          {t("graph.pathSummary", {
            hops: node.distance,
            trust: Math.round(node.trustScore * 100),
          })}
        </p>
      </div>
    </div>
  );
}
