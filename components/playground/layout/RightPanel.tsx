"use client";

import { useTranslations } from "next-intl";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { useGraphData } from "@/hooks/useGraphData";
import { GraphNode } from "@/lib/graph/types";
import NodeDetailCard from "../details/NodeDetailCard";
import TrustPathDisplay from "../details/TrustPathDisplay";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile?: (node: GraphNode) => void;
}

export default function RightPanel({ isOpen, onClose, onViewProfile }: RightPanelProps) {
  const t = useTranslations("playground");
  const { selectedNode, selectedProfile, selectedNeighbors, clearSelection } =
    useNodeSelection();
  const { expandNodeFollows } = useGraphData();

  if (!isOpen || !selectedNode) return null;

  const handleExpand = () => {
    if (selectedNode && !selectedNode.isRoot) {
      expandNodeFollows(selectedNode.id);
    }
  };

  const handleViewProfile = () => {
    if (selectedNode && onViewProfile) {
      onViewProfile(selectedNode);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800/95 backdrop-blur border-l border-gray-700 z-20 transform transition-transform duration-300">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="font-medium text-white">{t("graph.nodeDetails")}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            aria-label="Close details panel"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Node detail card */}
          <NodeDetailCard
            node={selectedNode}
            profile={selectedProfile}
            onExpand={handleExpand}
            onViewProfile={handleViewProfile}
          />

          {/* Trust path */}
          {!selectedNode.isRoot && (
            <div className="p-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                {t("graph.trustPath")}
              </h4>
              <TrustPathDisplay node={selectedNode} />
            </div>
          )}

          {/* Neighbors */}
          {selectedNeighbors.length > 0 && (
            <div className="p-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                {t("graph.connections")} ({selectedNeighbors.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedNeighbors.slice(0, 10).map((neighbor) => (
                  <button
                    key={neighbor.id}
                    onClick={() => {
                      /* Navigate to neighbor */
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {neighbor.picture ? (
                      <img
                        src={neighbor.picture}
                        alt={`${neighbor.label || "User"} avatar`}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-300">
                          {(neighbor.label || "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-300 truncate flex-1 text-left">
                      {neighbor.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {neighbor.distance}h
                    </span>
                  </button>
                ))}
                {selectedNeighbors.length > 10 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    +{selectedNeighbors.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={clearSelection}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            {t("graph.clearSelection")}
          </button>
        </div>
      </div>
    </div>
  );
}
