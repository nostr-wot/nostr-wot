"use client";

import { useTranslations } from "next-intl";

import { useGraph } from "@/contexts/GraphContext";
import { GraphNode } from "@/lib/graph/types";
import { getTrustClass, getTrustLabel } from "@/lib/graph/colors";
import { formatPubkey } from "@/lib/graph/transformers";

interface NodeTooltipProps {
  node: GraphNode;
  x: number;
  y: number;
}

export default function NodeTooltip({ node, x, y }: NodeTooltipProps) {
  const g = useTranslations("playground");
  const u = useTranslations("ui");
  const { getProfile } = useGraph();
  const profile = getProfile(node.id);

  const trustClass = getTrustClass(node.trustScore);
  const trustLabel = u(getTrustLabel(node.trustScore).toLowerCase());

  // Position tooltip to avoid edges
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    left: x + 15,
    top: y - 10,
    transform: "translateY(-100%)",
    zIndex: 50,
    pointerEvents: "none",
  };

  return (
    <div
      style={tooltipStyle}
      className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 min-w-[200px] max-w-[280px]"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {node.picture || profile?.picture ? (
          <img
            src={node.picture || profile?.picture}
            alt={u("avatar", { name: profile?.displayName || profile?.name || node.label || u("user") })}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-400 text-sm">
              {(node.label || "?")[0].toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Name */}
          <p className="font-medium text-white truncate">
            {profile?.displayName || profile?.name || node.label || u("unknown")}
          </p>

          {/* Pubkey */}
          <p className="text-xs text-gray-500 font-mono truncate">
            {formatPubkey(node.id)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {/* Trust score */}
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${trustClass}`}>
          {Math.round(node.trustScore * 100)}% {trustLabel}
        </span>

        {/* Distance */}
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
          {node.isRoot ? u("you") : g("sync.hops", { count: node.distance })}
        </span>

        {/* Path count */}
        {!node.isRoot && node.pathCount > 1 && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
            {u("paths", { count: node.pathCount })}
          </span>
        )}

        {/* Mutual indicator */}
        {node.isMutual && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-trust-green/20 text-trust-green">
            {g("graph.mutual")}
          </span>
        )}
      </div>

      {/* NIP-05 */}
      {profile?.nip05 && (
        <p className="mt-2 text-xs text-gray-400 truncate">
          {profile.nip05}
        </p>
      )}

      {/* Hint */}
      <p className="mt-2 text-xs text-gray-500 italic">
        {u("detailsHint")}
      </p>
    </div>
  );
}
