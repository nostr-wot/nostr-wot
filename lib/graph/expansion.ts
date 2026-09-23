import type { GraphData, GraphNode } from "./types";
import type { GraphMetric } from "./sources";
import { calculateTrustScore } from "./colors";
import { formatPubkey } from "./transformers";

/** Only reachable oracle results become nodes; unknown distance never implies a score. */
export function buildExpansion(parent: GraphNode, root: string, targets: string[],
  distances: Map<string, GraphMetric>, existingNodes: GraphNode[]): GraphData {
  const existing = new Map(existingNodes.map(node => [node.id, node]));
  const nodes: GraphNode[] = [];
  const links: GraphData["links"] = [];
  for (const key of new Set(targets)) {
    if (key === root && parent.id !== root && existing.has(root)) {
      // A mutual direct follow is already represented by a bidirectional root edge.
      if (!parent.isMutual) links.push({ source: parent.id, target: root, type: "follow", strength: 1, bidirectional: false });
      continue;
    }
    const metric = distances.get(key);
    if (key === root || key === parent.id || !metric || metric.hops === null) continue;
    const old = existing.get(key);
    const angle = Math.random() * 2 * Math.PI;
    const score = metric.score ?? calculateTrustScore(metric.hops, metric.pathCount);
    nodes.push({ ...old, id: key, label: old?.label ?? formatPubkey(key),
      distance: metric.hops, pathCount: metric.pathCount, trustScore: score,
      isRoot: false, isMutual: metric.mutual, expandedFrom: old?.expandedFrom ?? parent.id,
      x: old?.x ?? (parent.x ?? 0) + 60 * Math.cos(angle),
      y: old?.y ?? (parent.y ?? 0) + 60 * Math.sin(angle),
      z: old?.z ?? (parent.z ?? 0) });
    links.push({ source: parent.id, target: key, type: "follow",
      strength: score, bidirectional: parent.id === root && metric.mutual });
  }
  return { nodes, links };
}
