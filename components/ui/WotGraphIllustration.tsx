"use client";

import { useTranslations } from "next-intl";

import { useEffect, useState } from "react";

interface Node {
  id: string;
  x: number;
  y: number;
  distance: number;
  delay: number;
}

interface Edge {
  from: string;
  to: string;
  delay: number;
}

// Graph layout - center node with radiating connections
const NODES: Node[] = [
  // Center (You)
  { id: "you", x: 200, y: 200, distance: 0, delay: 0 },
  // 1-hop (green)
  { id: "1a", x: 120, y: 120, distance: 1, delay: 200 },
  { id: "1b", x: 280, y: 120, distance: 1, delay: 300 },
  { id: "1c", x: 320, y: 200, distance: 1, delay: 400 },
  { id: "1d", x: 280, y: 280, distance: 1, delay: 500 },
  { id: "1e", x: 120, y: 280, distance: 1, delay: 600 },
  { id: "1f", x: 80, y: 200, distance: 1, delay: 700 },
  // 2-hop (yellow)
  { id: "2a", x: 60, y: 60, distance: 2, delay: 800 },
  { id: "2b", x: 200, y: 40, distance: 2, delay: 900 },
  { id: "2c", x: 340, y: 60, distance: 2, delay: 1000 },
  { id: "2d", x: 380, y: 160, distance: 2, delay: 1100 },
  { id: "2e", x: 380, y: 260, distance: 2, delay: 1200 },
  { id: "2f", x: 340, y: 340, distance: 2, delay: 1300 },
  { id: "2g", x: 200, y: 360, distance: 2, delay: 1400 },
  { id: "2h", x: 60, y: 340, distance: 2, delay: 1500 },
  { id: "2i", x: 20, y: 260, distance: 2, delay: 1600 },
  { id: "2j", x: 20, y: 160, distance: 2, delay: 1700 },
  // 3-hop (red) - fewer nodes, outside
  { id: "3a", x: 10, y: 10, distance: 3, delay: 1800 },
  { id: "3b", x: 200, y: 0, distance: 3, delay: 1900 },
  { id: "3c", x: 390, y: 10, distance: 3, delay: 2000 },
  { id: "3d", x: 390, y: 390, distance: 3, delay: 2100 },
  { id: "3e", x: 10, y: 390, distance: 3, delay: 2200 },
];

const EDGES: Edge[] = [
  // You to 1-hop
  { from: "you", to: "1a", delay: 100 },
  { from: "you", to: "1b", delay: 150 },
  { from: "you", to: "1c", delay: 200 },
  { from: "you", to: "1d", delay: 250 },
  { from: "you", to: "1e", delay: 300 },
  { from: "you", to: "1f", delay: 350 },
  // 1-hop to 2-hop
  { from: "1a", to: "2a", delay: 500 },
  { from: "1a", to: "2b", delay: 550 },
  { from: "1b", to: "2b", delay: 600 },
  { from: "1b", to: "2c", delay: 650 },
  { from: "1c", to: "2d", delay: 700 },
  { from: "1c", to: "2e", delay: 750 },
  { from: "1d", to: "2e", delay: 800 },
  { from: "1d", to: "2f", delay: 850 },
  { from: "1e", to: "2g", delay: 900 },
  { from: "1e", to: "2h", delay: 950 },
  { from: "1f", to: "2i", delay: 1000 },
  { from: "1f", to: "2j", delay: 1050 },
  // 2-hop to 3-hop
  { from: "2a", to: "3a", delay: 1200 },
  { from: "2b", to: "3b", delay: 1300 },
  { from: "2c", to: "3c", delay: 1400 },
  { from: "2f", to: "3d", delay: 1500 },
  { from: "2h", to: "3e", delay: 1600 },
];

function getNodeColor(distance: number): string {
  switch (distance) {
    case 0:
      return "#6366f1"; // primary/purple - You
    case 1:
      return "#22c55e"; // green
    case 2:
      return "#eab308"; // yellow
    default:
      return "#ef4444"; // red
  }
}

function getNodeSize(distance: number): number {
  switch (distance) {
    case 0:
      return 20;
    case 1:
      return 12;
    case 2:
      return 8;
    default:
      return 6;
  }
}

export function WotGraphIllustration({ className = "" }: { className?: string }) {
  const g = useTranslations("playground");
  const u = useTranslations("ui");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const nodeMap = new Map(NODES.map((n) => [n.id, n]));

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-md mx-auto"
        style={{ filter: "drop-shadow(0 4px 20px rgba(99, 102, 241, 0.15))" }}
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          {/* Glow filters for each trust level */}
          <filter id="glow-primary" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx="200" cy="200" r="180" fill="url(#bgGradient)" />

        {/* Distance rings */}
        {[1, 2, 3].map((ring) => (
          <circle
            key={ring}
            cx="200"
            cy="200"
            r={ring * 60}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="text-gray-200 dark:text-gray-800"
            style={{
              opacity: isVisible ? 0.5 : 0,
              transition: `opacity 0.5s ease ${ring * 200}ms`,
            }}
          />
        ))}

        {/* Edges */}
        {EDGES.map((edge, i) => {
          const fromNode = nodeMap.get(edge.from)!;
          const toNode = nodeMap.get(edge.to)!;
          // Stagger the pulse animations across edges
          const pulseDuration = 2 + (i % 3) * 0.5; // 2-3.5s
          const pulseDelay = (i * 0.4) % 6; // staggered starts

          return (
            <g key={`${edge.from}-${edge.to}`}>
              {/* Base edge */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gray-300 dark:text-gray-700"
                style={{
                  opacity: isVisible ? 0.6 : 0,
                  transition: `opacity 0.5s ease ${edge.delay}ms`,
                }}
              />
              {/* Continuous animated pulse traveling along edge */}
              {isVisible && (
                <circle r="2.5" fill={getNodeColor(Math.min(fromNode.distance + 1, 3))}>
                  <animateMotion
                    dur={`${pulseDuration}s`}
                    begin={`${pulseDelay}s`}
                    repeatCount="indefinite"
                    path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.8;0.8;0"
                    dur={`${pulseDuration}s`}
                    begin={`${pulseDelay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map((node, nodeIndex) => {
          const color = getNodeColor(node.distance);
          const size = getNodeSize(node.distance);
          const isCenter = node.distance === 0;
          const isFarNode = node.distance >= 2;
          // Stagger heartbeat animations for far nodes
          const heartbeatDelay = isFarNode ? (nodeIndex * 0.3) % 4 : 0;
          const heartbeatDuration = node.distance === 2 ? 3 : 4; // slower for 3-hop

          return (
            <g key={node.id}>
              {/* Pulse ring for center node */}
              {isCenter && isVisible && (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    fill={color}
                    opacity="0.3"
                    className="hero-node-pulse"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    fill={color}
                    opacity="0.2"
                    className="hero-node-pulse"
                    style={{ animationDelay: "1s" }}
                  />
                </>
              )}
              {/* Node circle with heartbeat for far nodes */}
              <circle
                cx={node.x}
                cy={node.y}
                r={size}
                fill={color}
                filter={isCenter ? "url(#glow-primary)" : node.distance === 1 ? "url(#glow-green)" : undefined}
                className="hero-node"
                style={{
                  animationDelay: `${node.delay}ms`,
                }}
              >
                {/* Heartbeat opacity animation for 2-hop and 3-hop nodes */}
                {isVisible && isFarNode && (
                  <animate
                    attributeName="opacity"
                    values={node.distance === 2 ? "1;0.5;1" : "1;0.35;1"}
                    dur={`${heartbeatDuration}s`}
                    begin={`${heartbeatDelay}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                  />
                )}
                {/* Fade in initially */}
                {!isFarNode && (
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    dur="0.5s"
                    begin={`${node.delay / 1000}s`}
                    fill="freeze"
                  />
                )}
                {isFarNode && (
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    dur="0.5s"
                    begin={`${node.delay / 1000}s`}
                    fill="freeze"
                  />
                )}
              </circle>
              {/* Subtle glow ring for far nodes that pulses */}
              {isVisible && isFarNode && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={size + 4}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                >
                  <animate
                    attributeName="opacity"
                    values="0;0.4;0"
                    dur={`${heartbeatDuration}s`}
                    begin={`${heartbeatDelay}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                  />
                  <animate
                    attributeName="r"
                    values={`${size + 2};${size + 6};${size + 2}`}
                    dur={`${heartbeatDuration}s`}
                    begin={`${heartbeatDelay}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                  />
                </circle>
              )}
              {/* Label for center node */}
              {isCenter && (
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: "opacity 0.5s ease 0.5s",
                  }}
                >
                  {u("you")}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div
        className="flex justify-center gap-6 mt-4 text-sm"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.5s ease 2s",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-trust-green" />
          <span className="text-gray-600 dark:text-gray-400">{g("sync.hops", { count: 1 })}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-trust-yellow" />
          <span className="text-gray-600 dark:text-gray-400">{g("sync.hops", { count: 2 })}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-trust-red" />
          <span className="text-gray-600 dark:text-gray-400">{u("distantHops")}</span>
        </div>
      </div>
    </div>
  );
}

export default WotGraphIllustration;
