"use client";

import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { forceCollide, forceRadial, forceX, forceY } from "d3-force-3d";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { useGraphData } from "@/hooks/useGraphData";
import { GraphNode, GraphEdge } from "@/lib/graph/types";
import { getTrustColorHex } from "@/lib/graph/colors";
import NodeContextMenu from "./NodeContextMenu";

// Dynamic import for 3D graph (WebGL-based)
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-gray-500">Loading 3D graph...</div>
    </div>
  ),
});

interface GraphCanvas3DProps {
  width: number;
  height: number;
}

// Performance thresholds for 3D (lower than 2D due to WebGL overhead)
const MAX_VISIBLE_NODES_3D = 5000;
const MAX_VISIBLE_LINKS_3D = 10000;

export default function GraphCanvas3D({ width, height }: GraphCanvas3DProps) {
  const t = useTranslations("playground");
  const { filteredData, state } = useGraph();
  const { select, setHovered, activeNode } = useNodeSelection();
  const { expandNodeFollows, collapseNodeFollows } = useGraphData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const hasCenteredRef = useRef(false);
  const [showStartPrompt, setShowStartPrompt] = useState(true);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    node: GraphNode;
    position: { x: number; y: number };
  } | null>(null);

  // Preserve node positions across re-renders so the simulation doesn't
  // reset already-settled nodes when new data arrives via mergeData.
  const prevNodePositions = useRef<Map<string, { x: number; y: number; z: number }>>(new Map());

  // Limit data for performance
  const visibleData = useMemo(() => {
    const nodes = filteredData.nodes.slice(0, MAX_VISIBLE_NODES_3D);
    const nodeIds = new Set(nodes.map((n) => n.id));

    const links = filteredData.links
      .filter((l) => {
        const sourceId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
        const targetId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      })
      .slice(0, MAX_VISIBLE_LINKS_3D);

    // Restore previously simulated positions as hints
    nodes.forEach((node) => {
      const prev = prevNodePositions.current.get(node.id);
      if (prev) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any).x = prev.x;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any).y = prev.y;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any).z = prev.z;
      }
    });

    return { nodes, links };
  }, [filteredData]);

  // Pre-compute colors - use SDK-provided trustScore directly
  const nodeColors = useMemo(() => {
    const colors = new Map<string, string>();
    for (const node of visibleData.nodes) {
      if (node.isRoot) {
        colors.set(node.id, "#6366f1");
      } else {
        // Use the SDK-provided trustScore from the node directly
        colors.set(node.id, getTrustColorHex(node.trustScore));
      }
    }
    return colors;
  }, [visibleData.nodes]);

  // Node click handler — select + auto-expand root
  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, event: MouseEvent) => {
      if (!node) return;

      const graphNode = node as GraphNode;
      select(graphNode);

      // Auto-expand root node on click if not yet expanded (same as 2D)
      if (graphNode.isRoot && !state.expandedNodes.has(graphNode.id)) {
        expandNodeFollows(graphNode.id);
        setShowStartPrompt(false);
        return;
      }

      // Focus camera on node (with coordinate safety check)
      if (graphRef.current && typeof node.x === "number" && typeof node.y === "number" && typeof node.z === "number") {
        try {
          const hyp = Math.hypot(node.x, node.y, node.z);
          if (hyp < 0.001) return;
          const distance = 200;
          const distRatio = 1 + distance / hyp;
          graphRef.current.cameraPosition(
            {
              x: node.x * distRatio,
              y: node.y * distRatio,
              z: node.z * distRatio,
            },
            node,
            2000
          );
        } catch (err) {
          console.warn("Camera position error:", err);
        }
      }
    },
    [select, expandNodeFollows, state.expandedNodes]
  );

  // Right-click handler — show context menu (same as 2D)
  const handleNodeRightClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, event: MouseEvent) => {
      if (!node) return;
      event.preventDefault();

      const graphNode = node as GraphNode;

      // Position context menu at cursor
      const container = (event.target as HTMLElement)?.closest('.relative');
      if (container) {
        const rect = container.getBoundingClientRect();
        const menuX = Math.min(event.clientX - rect.left, rect.width - 220);
        const menuY = Math.min(event.clientY - rect.top, rect.height - 200);

        setContextMenu({
          node: graphNode,
          position: {
            x: Math.max(20, menuX),
            y: Math.max(20, menuY),
          },
        });
      } else {
        // Fallback: position relative to viewport
        setContextMenu({
          node: graphNode,
          position: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      }
    },
    []
  );

  // Context menu handlers
  const handleExpandFromMenu = useCallback(() => {
    if (contextMenu?.node && contextMenu.node.distance < 4) {
      expandNodeFollows(contextMenu.node.id);
    }
  }, [contextMenu, expandNodeFollows]);

  const handleCollapseFromMenu = useCallback(() => {
    if (contextMenu?.node) {
      collapseNodeFollows(contextMenu.node.id);
    }
  }, [contextMenu, collapseNodeFollows]);

  const handleViewProfileFromMenu = useCallback(() => {
    if (contextMenu?.node) {
      window.open(`/profile/${contextMenu.node.id}`, "_blank");
    }
  }, [contextMenu]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Node hover handlers
  const handleNodeHover = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      setHovered(node ? (node as GraphNode) : null);
    },
    [setHovered]
  );

  // Background click to deselect and close context menu
  const handleBackgroundClick = useCallback(() => {
    select(null);
    setContextMenu(null);
  }, [select]);

  // Node color — expanded gateway nodes get gold color
  const getNodeColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      const graphNode = node as GraphNode;
      if (graphNode.isRoot) return "#6366f1";
      const base = nodeColors.get(graphNode.id) || "#666";
      if (state.expandedNodes.has(graphNode.id)) {
        return "#ffd700"; // gold for expanded gateway nodes
      }
      return base;
    },
    [nodeColors, state.expandedNodes]
  );

  // Node size based on distance (root is larger)
  const getNodeSize = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      const graphNode = node as GraphNode;
      if (graphNode.isRoot) return 12;
      // Size decreases with distance
      return Math.max(3, 8 - graphNode.distance * 1.5);
    },
    []
  );

  // Link color based on target trust
  const getLinkColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any) => {
      const graphLink = link as GraphEdge;
      const targetNode =
        typeof graphLink.target === "string"
          ? visibleData.nodes.find((n) => n.id === graphLink.target)
          : (graphLink.target as GraphNode);

      if (targetNode) {
        const hex = getTrustColorHex(targetNode.trustScore);
        return hex + "60"; // 37% opacity
      }
      return "#ffffff30";
    },
    [visibleData.nodes]
  );

  // Persist simulated positions every second
  // Show/hide start prompt based on node count
  useEffect(() => {
    if (filteredData.nodes.length > 1) setShowStartPrompt(false);
    if (filteredData.nodes.length === 0) {
      setShowStartPrompt(true);
      prevNodePositions.current.clear();
      hasCenteredRef.current = false;
    }
  }, [filteredData.nodes.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      visibleData.nodes.forEach((n: any) => {
        if (n.x !== undefined && n.y !== undefined && n.z !== undefined) {
          prevNodePositions.current.set(n.id, { x: n.x, y: n.y, z: n.z });
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visibleData.nodes]);

  // Tune d3 forces: radial layout by distance + collision + centering (3D version)
  useEffect(() => {
    if (graphRef.current) {
      // Strong charge so nodes push each other apart
      graphRef.current.d3Force('charge')?.strength(-120);

      // Collision so nodes don't overlap
      graphRef.current.d3Force('collision', forceCollide(10));

      // Radial force: each hop snaps to its own orbit shell
      graphRef.current.d3Force('radial', forceRadial(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any) => (node as GraphNode).distance * 80,
        0, 0, 0
      )?.strength(0.3));

      // Link force: keep parent-child edges short
      graphRef.current.d3Force('link')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.distance((link: any) => {
          const source = typeof link.source === 'object' ? link.source : null;
          const target = typeof link.target === 'object' ? link.target : null;
          if (!source || !target) return 60;
          if (source.isRoot || target.isRoot) return 90;
          return 50;
        })
        ?.strength(0.5);

      // Weak center gravity to prevent drift (x, y, z)
      graphRef.current.d3Force('x', forceX(0).strength(0.02));
      graphRef.current.d3Force('y', forceY(0).strength(0.02));
      // forceZ not available as named import, use the generic forceX pattern
      // d3-force-3d extends forces to work in 3D automatically, so x/y forces
      // already contribute to z centering via the radial force above
    }
  }, [visibleData.nodes.length]);

  // Center camera on root node — once only
  useEffect(() => {
    if (hasCenteredRef.current) return;
    if (graphRef.current && visibleData.nodes.length > 0) {
      const rootNode = visibleData.nodes.find((n) => n.isRoot);
      if (rootNode) {
        hasCenteredRef.current = true;
        setTimeout(() => {
          if (graphRef.current) {
            graphRef.current.cameraPosition({ x: 0, y: 0, z: 500 }, { x: 0, y: 0, z: 0 }, 1000);
          }
        }, 500);
      }
    }
  }, [visibleData.nodes.length]);

  if (typeof window === "undefined") {
    return (
      <div className="flex items-center justify-center bg-gray-900" style={{ width, height }}>
        <div className="text-gray-500">Loading 3D graph...</div>
      </div>
    );
  }

  const isTruncated = filteredData.nodes.length > MAX_VISIBLE_NODES_3D;

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* eslint-disable @typescript-eslint/no-explicit-any */}
      <ForceGraph3D
        ref={graphRef}
        width={width}
        height={height}
        graphData={visibleData as any}
        nodeId="id"
        nodeColor={getNodeColor as any}
        nodeVal={getNodeSize as any}
        nodeLabel={(node: any) => {
          const n = node as GraphNode;
          const name = n.label || n.id.slice(0, 12) + '...';
          return `${name} (${n.distance} hops)`;
        }}
        onNodeClick={handleNodeClick as any}
        onNodeRightClick={handleNodeRightClick as any}
        onNodeHover={handleNodeHover as any}
        onBackgroundClick={handleBackgroundClick}
        linkColor={getLinkColor as any}
        linkWidth={0.5}
        linkOpacity={0.4}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        backgroundColor="#111827"
        showNavInfo={false}
        enableNodeDrag={false}
        enableNavigationControls={true}
        controlType="orbit"
      />
      {/* eslint-enable @typescript-eslint/no-explicit-any */}

      {/* Expanding indicator */}
      {state.isLoading && state.data.nodes.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm border border-primary/40 rounded-full px-4 py-1.5 text-xs text-primary shadow-lg">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Expanding...
        </div>
      )}

      {/* Node count indicator */}
      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
        <span className="text-blue-400 mr-2">3D</span>
        <span className="text-gray-400">Nodes: </span>
        <span className="text-white font-medium">{visibleData.nodes.length.toLocaleString()}</span>
        {isTruncated && (
          <span className="text-yellow-500 ml-1">
            / {filteredData.nodes.length.toLocaleString()}
          </span>
        )}
        <span className="text-gray-400 ml-3">Links: </span>
        <span className="text-white font-medium">{visibleData.links.length.toLocaleString()}</span>
      </div>

      {/* Initial prompt to click root node */}
      {showStartPrompt && filteredData.nodes.length === 1 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-primary/50 rounded-xl px-6 py-4 shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{t("graph.clickToExplore")}</p>
                <p className="text-gray-400 text-sm">{t("graph.clickToExploreDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-400">
        <div>Left-drag to rotate • Right-drag to pan • Scroll to zoom • Click node to select • Right-click for menu</div>
      </div>

      {/* Tooltip */}
      {activeNode && (
        <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-3 max-w-xs">
          <div className="font-medium text-white truncate">
            {activeNode.label || activeNode.id.slice(0, 16)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            <span>{activeNode.distance} hop{activeNode.distance !== 1 ? "s" : ""}</span>
            <span className="mx-1">·</span>
            <span>{activeNode.pathCount || 1} path{(activeNode.pathCount || 1) !== 1 ? "s" : ""}</span>
            <span className="mx-1">·</span>
            <span className="text-trust-green">{Math.round(activeNode.trustScore * 100)}% trust</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 font-mono truncate">
            {activeNode.id.slice(0, 16)}...
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <NodeContextMenu
          node={contextMenu.node}
          position={contextMenu.position}
          isExpanded={state.expandedNodes.has(contextMenu.node.id)}
          isExpanding={state.isLoading}
          onExpand={handleExpandFromMenu}
          onCollapse={handleCollapseFromMenu}
          onViewProfile={handleViewProfileFromMenu}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
}
