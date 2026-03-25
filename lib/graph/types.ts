// Graph visualization type definitions

export interface GraphNode {
  id: string; // Pubkey
  label?: string; // Display name
  picture?: string; // Profile pic URL
  distance: number; // Hops from root
  pathCount: number; // Number of paths to this node
  trustScore: number; // 0-1 score (calculated from distance + paths)
  followerCount?: number; // For node sizing
  isRoot: boolean;
  isMutual?: boolean;
  cluster?: string;
  expandedFrom?: string; // pubkey of the node that was expanded to reveal this node
  x?: number;
  y?: number;
  z?: number; // For 3D
  fx?: number; // Fixed x position
  fy?: number; // Fixed y position
  fz?: number; // Fixed z position (3D)
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: "follow" | "mutual" | "mute";
  strength: number;
  bidirectional: boolean;
}

export interface GraphFilters {
  minTrustScore: number; // 0-1
  maxDistance: number; // 1-5
  showFollows: boolean;
  showMutes: boolean;
  showMutualsOnly: boolean;
  searchQuery: string;
}

export interface GraphSettings {
  layout: "force" | "radial";
  colorMode: "trust" | "distance";
  nodeSize: "fixed" | "influence";
  showLabels: boolean;
  showArrows: boolean;
  maxNodes: number;
}

export type ViewMode = "graph" | "list" | "timeline";

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  avgTrustScore: number;
  maxDistance: number;
  mutualCount: number;
}

// Profile data from relays
export interface NodeProfile {
  pubkey: string;
  name?: string;
  displayName?: string;
  picture?: string;
  about?: string;
  nip05?: string;
}

// Trust path between two nodes
export interface TrustPath {
  nodes: string[];
  distance: number;
  score: number;
}

// Nostr note (kind:1 event)
export interface NostrNote {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  tags: string[][];
  kind: 1;
  sig?: string;
}

// Graph context state
export interface GraphState {
  data: GraphData;
  filteredData: GraphData;
  filters: GraphFilters;
  settings: GraphSettings;
  viewMode: ViewMode;
  selectedNode: GraphNode | null;
  hoveredNode: GraphNode | null;
  rootPubkey: string | null;
  isLoading: boolean;
  error: string | null;
  stats: GraphStats;
  profiles: Map<string, NodeProfile>;
}

export const DEFAULT_FILTERS: GraphFilters = {
  minTrustScore: 0,
  maxDistance: 4,
  showFollows: true,
  showMutes: false,
  showMutualsOnly: false,
  searchQuery: "",
};

export const DEFAULT_SETTINGS: GraphSettings = {
  layout: "force",
  colorMode: "trust",
  nodeSize: "fixed",
  showLabels: true,
  showArrows: true,
  maxNodes: 500,
};

export const DEFAULT_STATS: GraphStats = {
  totalNodes: 0,
  totalEdges: 0,
  avgTrustScore: 0,
  maxDistance: 0,
  mutualCount: 0,
};
