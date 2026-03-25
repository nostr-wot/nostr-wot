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

  // Build the actual path by following expandedFrom chain back to root
  const path = useMemo(() => {
    if (node.isRoot) return [];

    const nodeMap = new Map(state.data.nodes.map((n) => [n.id, n]));
    const rootNode = state.data.nodes.find((n) => n.isRoot);
    if (!rootNode) return [];

    // Trace back through expandedFrom to build the path
    const pathNodes: GraphNode[] = [];
    let current: GraphNode | undefined = node;

    // Walk up the chain (max depth guard to prevent infinite loops)
    let guard = 0;
    while (current && !current.isRoot && guard < 10) {
      pathNodes.unshift(current);
      const parentId: string | undefined = current.expandedFrom;
      current = parentId ? nodeMap.get(parentId) : undefined;
      guard++;
    }

    // Always prepend root
    pathNodes.unshift(rootNode);
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

      {/* Path summary + extra paths */}
      <div className="mt-3 pt-3 border-t border-gray-700 space-y-1">
        <p className="text-xs text-gray-500">
          {t("graph.pathSummary", {
            hops: node.distance,
            trust: Math.round(node.trustScore * 100),
          })}
        </p>
        {(node.pathCount || 1) > 1 && (
          <p className="text-xs text-primary">
            +{(node.pathCount || 1) - 1} {t("graph.morePaths")}
          </p>
        )}
      </div>
    </div>
  );
}
