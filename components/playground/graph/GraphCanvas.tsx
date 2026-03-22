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
import { formatPubkey } from "@/lib/graph/transformers";
import NodeContextMenu from "./NodeContextMenu";

// Use 2D graph for much better performance (canvas-based, not WebGL meshes)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-gray-500">Loading graph...</div>
    </div>
  ),
});

interface GraphCanvasProps {
  width: number;
  height: number;
}

// Performance thresholds
const MAX_VISIBLE_NODES = 10000;
const MAX_VISIBLE_LINKS = 20000;
const DISABLE_SIMULATION_THRESHOLD = 2000; // Disable physics above this

export default function GraphCanvas({ width, height }: GraphCanvasProps) {
  const t = useTranslations("playground");
  const { filteredData, state } = useGraph();
  const { settings } = state;
  const { select, setHovered, activeNode } = useNodeSelection();
  const { expandNodeFollows, collapseNodeFollows } = useGraphData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const [showStartPrompt, setShowStartPrompt] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    node: GraphNode;
    position: { x: number; y: number };
  } | null>(null);
  const [clickedNodeId, setClickedNodeId] = useState<string | null>(null);
  const [clickAnimationPhase, setClickAnimationPhase] = useState(0);

  // Preserve node positions across re-renders so the simulation doesn't
  // reset already-settled nodes when new data arrives via mergeData.
  const prevNodePositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Check if we should use static layout (no physics) for performance
  const useStaticLayout = filteredData.nodes.length > DISABLE_SIMULATION_THRESHOLD;

  // Limit data and pre-compute positions for large graphs
  const visibleData = useMemo(() => {
    const nodes = filteredData.nodes.slice(0, MAX_VISIBLE_NODES);
    const nodeIds = new Set(nodes.map(n => n.id));

    // Only include links where both nodes are visible
    const links = filteredData.links
      .filter(l => {
        const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
        const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      })
      .slice(0, MAX_VISIBLE_LINKS);

    // Restore previously simulated positions as hints (x/y only, never fx/fy).
    // Pinning with fx/fy causes new expanded nodes to mix into already-settled
    // groups because there's no room to move. Let the radial force keep structure.
    nodes.forEach((node) => {
      const prev = prevNodePositions.current.get(node.id);
      if (prev) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any).x = prev.x;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any).y = prev.y;
      }
    });

    // Pre-compute positions for large graphs (radial layout by distance)
    if (useStaticLayout) {
      const nodesByDistance = new Map<number, GraphNode[]>();
      for (const node of nodes) {
        const dist = node.distance;
        if (!nodesByDistance.has(dist)) {
          nodesByDistance.set(dist, []);
        }
        nodesByDistance.get(dist)!.push(node);
      }

      // Position nodes in concentric circles
      for (const [distance, distNodes] of nodesByDistance) {
        const radius = distance * 150; // 150px per hop
        const angleStep = (2 * Math.PI) / distNodes.length;

        distNodes.forEach((node, i) => {
          const angle = i * angleStep + (distance * 0.5); // Offset each ring
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (node as any).fx = radius * Math.cos(angle);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (node as any).fy = radius * Math.sin(angle);
        });
      }
    }

    return { nodes, links };
  }, [filteredData, useStaticLayout]);

  // Pre-compute colors for performance - use SDK-provided trustScore directly
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

  // Hide prompt when graph has more than just the root node
  useEffect(() => {
    if (filteredData.nodes.length > 1) {
      setShowStartPrompt(false);
    }
    // When graph is reset (empty), clear pinned positions and show prompt again
    if (filteredData.nodes.length === 0) {
      prevNodePositions.current.clear();
      setShowStartPrompt(true);
    }
  }, [filteredData.nodes.length]);

  // Node click handler - opens sidebar AND shows context menu
  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, event: MouseEvent) => {
      const graphNode = node as GraphNode;

      // Always select node to open sidebar
      select(graphNode);

      // Trigger click animation
      setClickedNodeId(graphNode.id);
      setClickAnimationPhase(0);

      // Auto-expand root node on click if not yet expanded
      if (graphNode.isRoot && !state.expandedNodes.has(graphNode.id)) {
        expandNodeFollows(graphNode.id);
        setShowStartPrompt(false);
        return;
      }

      // Show context menu next to cursor for all nodes
      const container = graphRef.current?.containerEl?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        // Position context menu at cursor, but keep it within bounds
        const menuX = Math.min(event.clientX - rect.left, rect.width - 220);
        const menuY = Math.min(event.clientY - rect.top, rect.height - 200);

        setContextMenu({
          node: graphNode,
          position: {
            x: Math.max(20, menuX),
            y: Math.max(20, menuY),
          },
        });
      }
    },
    [select, expandNodeFollows, filteredData.nodes.length]
  );

  // Animate clicked node with ripple effect
  useEffect(() => {
    if (clickedNodeId) {
      const animationInterval = setInterval(() => {
        setClickAnimationPhase((prev) => {
          if (prev >= 1) {
            clearInterval(animationInterval);
            return 0;
          }
          return prev + 0.05;
        });
      }, 16); // ~60fps

      return () => clearInterval(animationInterval);
    }
  }, [clickedNodeId]);

  // Handle expand from context menu
  const handleExpandFromMenu = useCallback(() => {
    if (contextMenu?.node) {
      expandNodeFollows(contextMenu.node.id);
      setShowStartPrompt(false);
    }
  }, [contextMenu, expandNodeFollows]);

  // Handle collapse from context menu
  const handleCollapseFromMenu = useCallback(() => {
    if (contextMenu?.node) {
      collapseNodeFollows(contextMenu.node.id);
    }
  }, [contextMenu, collapseNodeFollows]);

  // Handle view profile from context menu
  const handleViewProfileFromMenu = useCallback(() => {
    if (contextMenu?.node) {
      // Open profile in new tab
      window.open(`/profile/${contextMenu.node.id}`, "_blank");
    }
  }, [contextMenu]);

  // Close context menu
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

  // Snapshot expandedNodes for paintNode (avoid reading state inside hot loop)
  const expandedNodes = state.expandedNodes;

  // Custom canvas node rendering - much faster than Three.js
  const paintNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const graphNode = node as GraphNode;
      const isSelected = clickedNodeId === graphNode.id;
      const isHovered = activeNode?.id === graphNode.id;
      const baseSize = graphNode.isRoot ? 8 : 4;
      const size = isHovered ? baseSize * 1.3 : baseSize;
      const color = nodeColors.get(graphNode.id) || "#666";

      // Draw click animation (expanding ring)
      if (isSelected && clickAnimationPhase > 0 && clickAnimationPhase < 1) {
        const ringRadius = size + 20 * clickAnimationPhase;
        const ringOpacity = 0.6 * (1 - clickAnimationPhase);
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(99, 102, 241, ${ringOpacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw selection ring for selected node
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw glow for root or hovered
      if (graphNode.isRoot || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
        ctx.fillStyle = graphNode.isRoot
          ? "rgba(99, 102, 241, 0.3)"
          : `${color}40`;
        ctx.fill();
      }

      // Draw expanded (gateway) node distinction
      if (expandedNodes.has(graphNode.id) && !graphNode.isRoot) {
        // Outer yellow ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 220, 50, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Inner glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 220, 50, 0.15)';
        ctx.fill();
      }

      // Draw node (slightly larger for expanded gateway nodes)
      const drawSize = (expandedNodes.has(graphNode.id) && !graphNode.isRoot) ? size + 2 : size;
      ctx.beginPath();
      ctx.arc(node.x, node.y, drawSize, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw label - show name if available, even when zoomed out
      const hasName = graphNode.label && !graphNode.label.startsWith("npub");
      const showLabel = globalScale > 1.2 || hasName || isHovered || isSelected;

      if (showLabel) {
        const label = graphNode.label || formatPubkey(graphNode.id);
        // Truncate long labels
        const displayLabel = label.length > 12 ? label.slice(0, 10) + "..." : label;
        const fontSize = Math.max(8, Math.min(12, 10 / globalScale));
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Add text shadow for better readability
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillText(displayLabel, node.x + 1, node.y + size + 3);
        ctx.fillStyle = "#fff";
        ctx.fillText(displayLabel, node.x, node.y + size + 2);
      }
    },
    [nodeColors, clickedNodeId, clickAnimationPhase, activeNode, expandedNodes]
  );

  // Link color
  const getLinkColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any) => {
      const graphLink = link as GraphEdge;
      const targetNode =
        typeof graphLink.target === "string"
          ? visibleData.nodes.find((n) => n.id === graphLink.target)
          : (graphLink.target as GraphNode);

      if (targetNode) {
        // Use the SDK-provided trustScore from the node directly
        const hex = getTrustColorHex(targetNode.trustScore);
        return hex + "40"; // 25% opacity
      }
      return "#ffffff20";
    },
    [visibleData.nodes]
  );

  // Persist simulated positions every second so settled nodes get pinned on next update
  useEffect(() => {
    const interval = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      visibleData.nodes.forEach((n: any) => {
        if (n.x !== undefined && n.y !== undefined) {
          prevNodePositions.current.set(n.id, { x: n.x, y: n.y });
        }
      });
    }, 1000); // snapshot every 1s (faster = nodes get pinned sooner)
    return () => clearInterval(interval);
  }, [visibleData.nodes]);

  // Tune d3 forces: radial layout by distance + collision + link locality
  useEffect(() => {
    if (graphRef.current && !useStaticLayout) {
      // Strong charge so nodes push each other apart
      graphRef.current.d3Force('charge')?.strength(-120);

      // Collision so nodes don't overlap
      graphRef.current.d3Force('collision', forceCollide(10));

      // Radial force: each hop snaps to its own orbit ring around center
      // hop0=0px, hop1=80px, hop2=160px, hop3=240px — keep layers close
      graphRef.current.d3Force('radial', forceRadial(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any) => (node as GraphNode).distance * 80,
        0, 0
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

      // Weak center gravity to prevent drift
      graphRef.current.d3Force('x', forceX(0).strength(0.02));
      graphRef.current.d3Force('y', forceY(0).strength(0.02));
    }
  }, [visibleData.nodes.length, useStaticLayout]);

  // Center camera on root node after initial load
  useEffect(() => {
    if (graphRef.current && visibleData.nodes.length > 0) {
      const rootNode = visibleData.nodes.find((n) => n.isRoot);

      setTimeout(() => {
        if (rootNode && graphRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const node = rootNode as any;
          if (node.x !== undefined && node.y !== undefined) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(1.5, 1000);
          }
        }
      }, 500);
    }
  }, [visibleData.nodes.length]);

  if (typeof window === "undefined") {
    return (
      <div
        className="flex items-center justify-center bg-gray-900"
        style={{ width, height }}
      >
        <div className="text-gray-500">Loading graph...</div>
      </div>
    );
  }

  const isTruncated = filteredData.nodes.length > MAX_VISIBLE_NODES;

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* eslint-disable @typescript-eslint/no-explicit-any */}
      <ForceGraph2D
        ref={graphRef}
        width={width}
        height={height}
        graphData={visibleData as any}
        nodeId="id"
        nodeCanvasObject={paintNode as any}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const size = (node as GraphNode).isRoot ? 12 : 8;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={handleNodeClick as any}
        onNodeHover={handleNodeHover as any}
        onBackgroundClick={handleBackgroundClick}
        linkColor={getLinkColor as any}
        linkWidth={useStaticLayout ? 0.3 : 0.5}
        linkDirectionalArrowLength={settings.showArrows && !useStaticLayout ? 2 : 0}
        linkDirectionalArrowRelPos={1}
        // Disable simulation for large graphs (positions pre-computed)
        d3AlphaDecay={useStaticLayout ? 1 : 0.03}
        d3VelocityDecay={useStaticLayout ? 1 : 0.3}
        cooldownTicks={useStaticLayout ? 0 : 300}
        warmupTicks={useStaticLayout ? 0 : 30}
        enableNodeDrag={!useStaticLayout}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        backgroundColor="#111827"
        dagMode={!useStaticLayout && settings.layout === "radial" ? "radialout" : undefined}
        dagLevelDistance={50}
        minZoom={0.1}
        maxZoom={10}
      />
      {/* eslint-enable @typescript-eslint/no-explicit-any */}

      {/* Node count indicator */}
      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
        <span className="text-gray-400">Nodes: </span>
        <span className="text-white font-medium">{visibleData.nodes.length.toLocaleString()}</span>
        {isTruncated && (
          <span className="text-yellow-500 ml-1">
            / {filteredData.nodes.length.toLocaleString()}
          </span>
        )}
        <span className="text-gray-400 ml-3">Links: </span>
        <span className="text-white font-medium">{visibleData.links.length.toLocaleString()}</span>
        {useStaticLayout && (
          <span className="text-blue-400 ml-3" title="Physics disabled for performance">
            Static
          </span>
        )}
      </div>

      {/* Tooltip */}
      {activeNode && (
        <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-3 max-w-xs">
          <div className="font-medium text-white truncate">
            {activeNode.label || formatPubkey(activeNode.id)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            <span>{activeNode.distance} hop{activeNode.distance !== 1 ? 's' : ''}</span>
            <span className="mx-1">·</span>
            <span>{activeNode.pathCount || 1} path{(activeNode.pathCount || 1) !== 1 ? 's' : ''}</span>
            <span className="mx-1">·</span>
            <span className="text-trust-green">{Math.round(activeNode.trustScore * 100)}% trust</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 font-mono truncate">
            {formatPubkey(activeNode.id)}
          </div>
        </div>
      )}

      {/* Initial prompt to click root node */}
      {showStartPrompt && filteredData.nodes.length === 1 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-primary/50 rounded-xl px-6 py-4 shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
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

      {/* Context menu */}
      {/* Expanding indicator */}
      {state.isLoading && state.data.nodes.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm border border-primary/40 rounded-full px-4 py-1.5 text-xs text-primary shadow-lg">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Expanding...
        </div>
      )}

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
