"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { useGraphData } from "@/hooks/useGraphData";
import { GraphNode } from "@/lib/graph/types";
import { GraphCanvas, GraphCanvas3D, GraphLegend } from "../graph";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import RightPanel from "./RightPanel";
import BottomStatsBar from "./BottomStatsBar";
import ViewModeToggle from "../views/ViewModeToggle";
import ListView from "../views/ListView";
import TimelineView from "../views/TimelineView";
import { NodeProfileModal } from "../profile";

export default function GraphLayout() {
  const t = useTranslations("playground");
  const { state, getProfile } = useGraph();
  const { selectedNode, selectedProfile, clearSelection } = useNodeSelection();
  const { expandNodeFollows } = useGraphData();

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphMode, setGraphMode] = useState<"2d" | "3d">("2d");
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean;
    node: GraphNode | null;
  }>({ isOpen: false, node: null });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Close right panel
  const handleCloseRightPanel = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Open profile modal
  const handleViewProfile = useCallback((node: GraphNode) => {
    setProfileModal({ isOpen: true, node });
  }, []);

  // Close profile modal
  const handleCloseProfileModal = useCallback(() => {
    setProfileModal({ isOpen: false, node: null });
  }, []);

  // Expand node from profile modal
  const handleExpandFromProfile = useCallback(() => {
    if (profileModal.node && !profileModal.node.isRoot) {
      expandNodeFollows(profileModal.node.id);
    }
  }, [profileModal.node, expandNodeFollows]);

  // Calculate canvas dimensions (accounting for panels)
  const canvasWidth = dimensions.width;
  const canvasHeight = dimensions.height - 44; // Account for stats bar

  return (
    <div className="flex flex-col h-full">
      {/* Top bar with search, filters, and view toggle */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>
        <FilterDropdown />

        {/* 2D/3D toggle */}
        {state.viewMode === "graph" && (
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setGraphMode("2d")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                graphMode === "2d"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setGraphMode("3d")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                graphMode === "3d"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              3D
            </button>
          </div>
        )}

        <ViewModeToggle />
      </div>

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        {state.viewMode === "graph" && (
          <>
            {/* Graph canvas - 2D or 3D */}
            {graphMode === "2d" ? (
              <GraphCanvas width={canvasWidth} height={canvasHeight} />
            ) : (
              <GraphCanvas3D width={canvasWidth} height={canvasHeight} />
            )}

            {/* Legend */}
            <GraphLegend />

            {/* Right panel (node details) */}
            <RightPanel
              isOpen={!!selectedNode}
              onClose={handleCloseRightPanel}
              onViewProfile={handleViewProfile}
            />

            {/* Bottom stats bar */}
            <BottomStatsBar />
          </>
        )}

        {state.viewMode === "list" && <ListView />}

        {state.viewMode === "timeline" && <TimelineView />}

        {/* Error display */}
        {state.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-30">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md text-center">
              <svg
                className="w-12 h-12 text-trust-red mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">
                {t("graph.errorTitle")}
              </h3>
              <p className="text-gray-400 text-sm">{state.error}</p>
            </div>
          </div>
        )}

        {/* Loading overlay for initial load */}
        {state.isLoading && state.data.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-30">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-primary animate-spin mx-auto mb-4"
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
              <p className="text-gray-400">{t("graph.loadingGraph")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile modal */}
      <NodeProfileModal
        isOpen={profileModal.isOpen}
        node={profileModal.node}
        profile={profileModal.node ? getProfile(profileModal.node.id) : undefined}
        onClose={handleCloseProfileModal}
        onExpand={handleExpandFromProfile}
      />
    </div>
  );
}
