"use client";

import { useEffect, useState } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: "small" | "medium" | "large";
}

interface Connection {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

export default function HeroAnimation() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    const generatedNodes: Node[] = [];
    const generatedConnections: Connection[] = [];

    const columns = 8;
    const rows = 5;
    const spacingX = 100 / (columns + 1);
    const spacingY = 100 / (rows + 1);

    let nodeId = 0;
    const nodePositions: { x: number; y: number; delay: number }[] = [];

    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const x = spacingX * (col + 1) + (Math.random() - 0.5) * 8;
        const y = spacingY * (row + 1) + (Math.random() - 0.5) * 10;
        const delay = col * 0.3 + Math.random() * 0.2;

        const sizes: ("small" | "medium" | "large")[] = ["small", "medium", "large"];
        const size = sizes[Math.floor(Math.random() * 3)];

        generatedNodes.push({ id: nodeId, x, y, delay, size });
        nodePositions.push({ x, y, delay });
        nodeId++;
      }
    }

    let connectionId = 0;
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const dx = nodePositions[j].x - nodePositions[i].x;
        const dy = nodePositions[j].y - nodePositions[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20 && Math.random() > 0.3) {
          generatedConnections.push({
            id: connectionId,
            x1: nodePositions[i].x,
            y1: nodePositions[i].y,
            x2: nodePositions[j].x,
            y2: nodePositions[j].y,
            delay: Math.min(nodePositions[i].delay, nodePositions[j].delay),
          });
          connectionId++;
        }
      }
    }

    setNodes(generatedNodes);
    setConnections(generatedConnections);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full opacity-70 dark:opacity-40"
      >
        <defs>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </radialGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g>
          {connections.map((conn) => (
            <line
              key={`conn-${conn.id}`}
              x1={`${conn.x1}%`}
              y1={`${conn.y1}%`}
              x2={`${conn.x2}%`}
              y2={`${conn.y2}%`}
              stroke="url(#lineGradient)"
              strokeWidth="0.15"
              className="hero-connection"
              style={{ animationDelay: `${conn.delay}s` }}
            />
          ))}
        </g>

        <g>
          {nodes.map((node) => {
            const radius = node.size === "large" ? 1.2 : node.size === "medium" ? 0.8 : 0.5;
            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={radius * 2}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="0.1"
                  className="hero-node-pulse"
                  style={{ animationDelay: `${node.delay}s` }}
                />
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={radius}
                  fill="url(#nodeGradient)"
                  className="hero-node"
                  style={{ animationDelay: `${node.delay}s` }}
                />
              </g>
            );
          })}
        </g>

        <g>
          {connections.slice(0, 15).map((conn) => (
            <circle
              key={`pulse-${conn.id}`}
              r="0.4"
              fill="#6366f1"
              className="hero-traveling-pulse"
              style={{ animationDelay: `${conn.delay + 1}s` }}
            >
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                begin={`${conn.delay + 1}s`}
                path={`M ${conn.x1} ${conn.y1} L ${conn.x2} ${conn.y2}`}
              />
            </circle>
          ))}
        </g>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-transparent to-gray-100 dark:from-gray-900 dark:via-transparent dark:to-gray-900" />
    </div>
  );
}
