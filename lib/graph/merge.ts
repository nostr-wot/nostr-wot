import type { GraphData, GraphEdge, GraphNode } from './types';

const endpoint = (value: string | GraphNode) => typeof value === 'string' ? value : value.id;

/** Merge authoritative node metrics without treating every new edge as a shortest path. */
export function mergeGraphData(current: GraphData, incoming: GraphData): GraphData {
  const nodes = new Map(current.nodes.map(node => [node.id, node]));
  for (const node of incoming.nodes) nodes.set(node.id, { ...nodes.get(node.id), ...node });
  const links = new Map<string, GraphEdge>();
  for (const edge of [...current.links, ...incoming.links]) {
    const source = endpoint(edge.source), target = endpoint(edge.target);
    if (!nodes.has(source) || !nodes.has(target)) continue;
    links.set(`${source}:${target}:${edge.type}`, { ...edge, source, target });
  }
  return { nodes: [...nodes.values()], links: [...links.values()] };
}

/** Return a directed path using only connections currently shown. */
export function displayedPath(data: GraphData, target: string): GraphNode[] {
  const root = data.nodes.find(node => node.isRoot);
  if (!root || target === root.id) return [];
  const nodes = new Map(data.nodes.map(node => [node.id, node]));
  const adjacency = new Map<string, string[]>();
  const add = (from: string, to: string) => {
    if (nodes.has(from) && nodes.has(to)) adjacency.set(from, [...(adjacency.get(from) ?? []), to]);
  };
  for (const edge of data.links) {
    if (edge.type === 'mute') continue;
    const from = endpoint(edge.source), to = endpoint(edge.target);
    add(from, to);
    if (edge.bidirectional) add(to, from);
  }
  const parents = new Map<string, string | null>([[root.id, null]]);
  const queue = [root.id];
  for (let i = 0; i < queue.length && !parents.has(target); i++) {
    for (const next of adjacency.get(queue[i]) ?? []) {
      if (!parents.has(next)) { parents.set(next, queue[i]); queue.push(next); }
    }
  }
  if (!parents.has(target)) return [];
  const path: GraphNode[] = [];
  for (let id: string | null = target; id !== null; id = parents.get(id) ?? null) path.push(nodes.get(id)!);
  return path.reverse();
}
