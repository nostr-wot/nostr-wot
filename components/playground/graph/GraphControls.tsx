"use client";

import { useCallback, useRef } from "react";
import { useGraph } from "@/contexts/GraphContext";
import { Button } from "@/components/ui";

interface GraphControlsProps {
  graphRef: React.RefObject<any>;
}

export default function GraphControls({ graphRef }: GraphControlsProps) {
  const { state, setSettings } = useGraph();
  const { settings } = state;

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.5, 300);
    }
  }, [graphRef]);

  const handleZoomOut = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.5, 300);
    }
  }, [graphRef]);

  const handleZoomToFit = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  }, [graphRef]);

  const handleCenterOnRoot = useCallback(() => {
    if (graphRef.current) {
      const rootNode = graphRef.current
        .graphData()
        .nodes.find((n: any) => n.isRoot);
      if (rootNode) {
        graphRef.current.centerAt(rootNode.x, rootNode.y, 500);
        graphRef.current.zoom(2, 500);
      }
    }
  }, [graphRef]);

  // Layout toggle
  const handleLayoutToggle = useCallback(() => {
    setSettings({
      layout: settings.layout === "force" ? "radial" : "force",
    });
  }, [settings.layout, setSettings]);

  // Toggle labels
  const handleToggleLabels = useCallback(() => {
    setSettings({ showLabels: !settings.showLabels });
  }, [settings.showLabels, setSettings]);

  // Toggle arrows
  const handleToggleArrows = useCallback(() => {
    setSettings({ showArrows: !settings.showArrows });
  }, [settings.showArrows, setSettings]);

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      {/* Zoom controls */}
      <div className="flex flex-col bg-gray-800/90 backdrop-blur rounded-lg border border-gray-700 overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-700 transition-colors text-white"
          aria-label="Zoom in"
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
              d="M12 6v12M6 12h12"
            />
          </svg>
        </button>
        <div className="border-t border-gray-700" />
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-700 transition-colors text-white"
          aria-label="Zoom out"
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
              d="M6 12h12"
            />
          </svg>
        </button>
      </div>

      {/* View controls */}
      <div className="flex flex-col bg-gray-800/90 backdrop-blur rounded-lg border border-gray-700 overflow-hidden">
        <button
          onClick={handleZoomToFit}
          className="p-2 hover:bg-gray-700 transition-colors text-white"
          aria-label="Fit to view"
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
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
        <div className="border-t border-gray-700" />
        <button
          onClick={handleCenterOnRoot}
          className="p-2 hover:bg-gray-700 transition-colors text-white"
          aria-label="Center on you"
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
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {/* Layout toggle */}
      <button
        onClick={handleLayoutToggle}
        className={`p-2 rounded-lg border transition-colors ${
          settings.layout === "radial"
            ? "bg-primary text-white border-primary"
            : "bg-gray-800/90 text-white border-gray-700 hover:bg-gray-700"
        }`}
        aria-label={`Switch to ${settings.layout === "force" ? "radial" : "force"} layout`}
      >
        {settings.layout === "force" ? (
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <circle cx="12" cy="12" r="8" strokeWidth={2} />
          </svg>
        )}
      </button>

      {/* Toggle buttons */}
      <div className="flex flex-col bg-gray-800/90 backdrop-blur rounded-lg border border-gray-700 overflow-hidden">
        <button
          onClick={handleToggleLabels}
          className={`p-2 transition-colors ${
            settings.showLabels
              ? "bg-primary/20 text-primary"
              : "text-gray-400 hover:bg-gray-700"
          }`}
          aria-label={settings.showLabels ? "Hide labels" : "Show labels"}
          aria-pressed={settings.showLabels}
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
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </button>
        <div className="border-t border-gray-700" />
        <button
          onClick={handleToggleArrows}
          className={`p-2 transition-colors ${
            settings.showArrows
              ? "bg-primary/20 text-primary"
              : "text-gray-400 hover:bg-gray-700"
          }`}
          aria-label={settings.showArrows ? "Hide arrows" : "Show arrows"}
          aria-pressed={settings.showArrows}
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
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
