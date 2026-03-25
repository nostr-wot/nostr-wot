"use client";

import { useTranslations } from "next-intl";
import { GraphNode } from "@/lib/graph/types";
import { getTrustClass, getTrustLabel } from "@/lib/graph/colors";
import { Badge } from "@/components/ui";
import TrustPathDisplay from "../details/TrustPathDisplay";

interface ProfileStatsProps {
  node: GraphNode;
}

/**
 * Trust stats section for profile modal
 */
export default function ProfileStats({ node }: ProfileStatsProps) {
  const t = useTranslations("playground");

  const trustClass = getTrustClass(node.trustScore);
  const trustLabel = getTrustLabel(node.trustScore);

  return (
    <div className="border-b border-gray-700">
      {/* Stats badges */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {/* Trust score */}
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${trustClass}`}
          >
            {Math.round(node.trustScore * 100)}% {trustLabel}
          </span>

          {/* Distance */}
          {node.isRoot ? (
            <Badge variant="primary">{t("graph.you")}</Badge>
          ) : (
            <Badge variant="neutral">
              {node.distance} {node.distance === 1 ? "hop" : "hops"}
            </Badge>
          )}

          {/* Path count */}
          {!node.isRoot && node.pathCount > 1 && (
            <Badge variant="neutral">
              {node.pathCount} {node.pathCount === 1 ? "path" : "paths"}
            </Badge>
          )}

          {/* Mutual */}
          {node.isMutual && <Badge variant="success">{t("graph.mutual")}</Badge>}
        </div>


      </div>

      {/* Trust path */}
      {!node.isRoot && (
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            {t("graph.trustPath")}
          </h4>
          <TrustPathDisplay node={node} />
        </div>
      )}
    </div>
  );
}
