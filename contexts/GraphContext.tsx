"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  GraphData,
  GraphFilters,
  GraphSettings,
  GraphStats,
  GraphNode,
  ViewMode,
  NodeProfile,
  DEFAULT_FILTERS,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
} from "@/lib/graph/types";
import { filterGraphData, calculateStats } from "@/lib/graph/transformers";
import { calculateTrustScore } from "@/lib/graph/colors";
import {
  getCachedProfile,
  cacheProfiles as cacheProfilesToStorage,
} from "@/lib/cache/profileCache";

// State
interface GraphState {
  data: GraphData;
  filters: GraphFilters;
  settings: GraphSettings;
  viewMode: ViewMode;
  selectedNode: GraphNode | null;
  hoveredNode: GraphNode | null;
  rootPubkey: string | null;
  isLoading: boolean;
  error: string | null;
  profiles: Map<string, NodeProfile>;
  expandedNodes: Set<string>;
}

// Actions
type GraphAction =
  | { type: "SET_DATA"; payload: GraphData }
  | { type: "SET_FILTERS"; payload: Partial<GraphFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "SET_SETTINGS"; payload: Partial<GraphSettings> }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "SELECT_NODE"; payload: GraphNode | null }
  | { type: "HOVER_NODE"; payload: GraphNode | null }
  | { type: "SET_ROOT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_PROFILES"; payload: Map<string, NodeProfile> }
  | { type: "EXPAND_NODE"; payload: string }
  | { type: "COLLAPSE_NODE"; payload: string }
  | { type: "MERGE_DATA"; payload: GraphData }
  | { type: "RESET_GRAPH" };

// Initial state
const initialState: GraphState = {
  data: { nodes: [], links: [] },
  filters: DEFAULT_FILTERS,
  settings: DEFAULT_SETTINGS,
  viewMode: "graph",
  selectedNode: null,
  hoveredNode: null,
  rootPubkey: null,
  isLoading: false,
  error: null,
  profiles: new Map(),
  expandedNodes: new Set(),
};

// Reducer
function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, data: action.payload };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case "RESET_FILTERS":
      return { ...state, filters: DEFAULT_FILTERS };

    case "SET_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "SELECT_NODE":
      return { ...state, selectedNode: action.payload };

    case "HOVER_NODE":
      return { ...state, hoveredNode: action.payload };

    case "SET_ROOT":
      return { ...state, rootPubkey: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "ADD_PROFILES": {
      const newProfiles = new Map(state.profiles);
      const profilesToCache: NodeProfile[] = [];
      action.payload.forEach((profile, key) => {
        newProfiles.set(key, profile);
        profilesToCache.push(profile);
      });
      // Also cache to localStorage
      if (profilesToCache.length > 0) {
        cacheProfilesToStorage(profilesToCache);
      }
      return { ...state, profiles: newProfiles };
    }

    case "EXPAND_NODE": {
      const newExpanded = new Set(state.expandedNodes);
      newExpanded.add(action.payload);
      return { ...state, expandedNodes: newExpanded };
    }

    case "COLLAPSE_NODE": {
      const collapsedPubkey = action.payload;
      const newExpanded = new Set(state.expandedNodes);
      newExpanded.delete(collapsedPubkey);

      // Remove all nodes that were discovered via this node (expandedFrom === collapsedPubkey)
      // and recursively remove any nodes that were expanded from those as well.
      const toRemove = new Set<string>();

      const collectToRemove = (gatewayId: string) => {
        for (const node of state.data.nodes) {
          if (node.expandedFrom === gatewayId && !node.isRoot) {
            if (!toRemove.has(node.id)) {
              toRemove.add(node.id);
              newExpanded.delete(node.id);
              // Recurse — remove nodes expanded from this node too
              collectToRemove(node.id);
            }
          }
        }
      };
      collectToRemove(collapsedPubkey);

      const filteredNodes = state.data.nodes.filter((n) => !toRemove.has(n.id));
      const filteredLinks = state.data.links.filter((l) => {
        const sourceId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
        const targetId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
        return !toRemove.has(sourceId) && !toRemove.has(targetId);
      });

      return {
        ...state,
        expandedNodes: newExpanded,
        data: { nodes: filteredNodes, links: filteredLinks },
      };
    }

    case "MERGE_DATA": {
      const existingNodeMap = new Map(state.data.nodes.map((n) => [n.id, n]));
      const existingLinkKeys = new Set(
        state.data.links.map((l) => `${l.source}-${l.target}`)
      );

      // Track which nodes get new incoming paths
      const nodePathIncrements = new Map<string, number>();

      // Filter new links and track path increments for existing nodes
      const newLinks = action.payload.links.filter((l) => {
        const key = `${l.source}-${l.target}`;
        if (existingLinkKeys.has(key)) {
          return false;
        }
        // If target node exists, increment its path count
        const targetId = typeof l.target === "string" ? l.target : l.target.id;
        if (existingNodeMap.has(targetId)) {
          const current = nodePathIncrements.get(targetId) || 0;
          nodePathIncrements.set(targetId, current + 1);
        }
        return true;
      });

      // Build distance correction map: nodes in payload that already exist
      // and have a SHORTER distance than what's currently in state
      const distanceUpdateMap = new Map<string, GraphNode>();
      for (const node of action.payload.nodes) {
        const existing = existingNodeMap.get(node.id);
        if (existing && node.distance < existing.distance) {
          distanceUpdateMap.set(node.id, node);
        }
      }

      // Get new nodes (not already existing)
      const newNodes = action.payload.nodes.filter(
        (n) => !existingNodeMap.has(n.id)
      );

      // Update existing nodes: apply distance corrections AND path count increments
      const updatedNodes = state.data.nodes.map((node) => {
        const distUpdate = distanceUpdateMap.get(node.id);
        const pathIncrement = nodePathIncrements.get(node.id);

        let result = node;

        // Apply distance correction first (shorter real distance found)
        if (distUpdate) {
          result = {
            ...result,
            distance: distUpdate.distance,
            pathCount: distUpdate.pathCount ?? result.pathCount,
            trustScore: distUpdate.trustScore ?? result.trustScore,
          };
        }

        // Then apply path count increment from new incoming links
        if (pathIncrement) {
          const newPathCount = result.pathCount + pathIncrement;
          const newTrustScore = calculateTrustScore(result.distance, newPathCount);
          result = { ...result, pathCount: newPathCount, trustScore: newTrustScore };
        }

        return result;
      });

      return {
        ...state,
        data: {
          nodes: [...updatedNodes, ...newNodes],
          links: [...state.data.links, ...newLinks],
        },
      };
    }

    case "RESET_GRAPH":
      return {
        ...initialState,
        // preserve settings (layout prefs etc)
        settings: state.settings,
      };

    default:
      return state;
  }
}

// Context type
interface GraphContextType {
  // State
  state: GraphState;
  filteredData: GraphData;
  stats: GraphStats;

  // Data actions
  setData: (data: GraphData) => void;
  mergeData: (data: GraphData) => void;
  setRoot: (pubkey: string) => void;

  // Filter actions
  setFilters: (filters: Partial<GraphFilters>) => void;
  resetFilters: () => void;

  // Settings actions
  setSettings: (settings: Partial<GraphSettings>) => void;

  // View actions
  setViewMode: (mode: ViewMode) => void;

  // Node actions
  selectNode: (node: GraphNode | null) => void;
  hoverNode: (node: GraphNode | null) => void;
  expandNode: (pubkey: string) => void;
  collapseNode: (pubkey: string) => void;
  isNodeExpanded: (pubkey: string) => boolean;

  // Profile actions
  addProfiles: (profiles: Map<string, NodeProfile>) => void;
  getProfile: (pubkey: string) => NodeProfile | undefined;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Reset graph
  resetGraph: () => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

// Provider
export function GraphProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  // Compute filtered data
  const filteredData = useMemo(
    () => filterGraphData(state.data, state.filters),
    [state.data, state.filters]
  );

  // Compute stats from filtered data
  const stats = useMemo(() => calculateStats(filteredData), [filteredData]);

  // Actions
  const setData = useCallback((data: GraphData) => {
    dispatch({ type: "SET_DATA", payload: data });
  }, []);

  const mergeData = useCallback((data: GraphData) => {
    dispatch({ type: "MERGE_DATA", payload: data });
  }, []);

  const setRoot = useCallback((pubkey: string) => {
    dispatch({ type: "SET_ROOT", payload: pubkey });
  }, []);

  const setFilters = useCallback((filters: Partial<GraphFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSettings = useCallback((settings: Partial<GraphSettings>) => {
    dispatch({ type: "SET_SETTINGS", payload: settings });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const selectNode = useCallback((node: GraphNode | null) => {
    dispatch({ type: "SELECT_NODE", payload: node });
  }, []);

  const hoverNode = useCallback((node: GraphNode | null) => {
    dispatch({ type: "HOVER_NODE", payload: node });
  }, []);

  const expandNode = useCallback((pubkey: string) => {
    dispatch({ type: "EXPAND_NODE", payload: pubkey });
  }, []);

  const collapseNode = useCallback((pubkey: string) => {
    dispatch({ type: "COLLAPSE_NODE", payload: pubkey });
  }, []);

  const isNodeExpanded = useCallback(
    (pubkey: string) => state.expandedNodes.has(pubkey),
    [state.expandedNodes]
  );

  const addProfiles = useCallback((profiles: Map<string, NodeProfile>) => {
    dispatch({ type: "ADD_PROFILES", payload: profiles });
  }, []);

  const getProfile = useCallback(
    (pubkey: string) => {
      // Check memory cache first
      const memProfile = state.profiles.get(pubkey);
      if (memProfile) return memProfile;

      // Fall back to localStorage cache
      return getCachedProfile(pubkey) ?? undefined;
    },
    [state.profiles]
  );

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const resetGraph = useCallback(() => {
    // Single dispatch clears everything including expandedNodes
    dispatch({ type: "RESET_GRAPH" });
  }, []);

  const value = useMemo(
    () => ({
      state,
      filteredData,
      stats,
      setData,
      mergeData,
      setRoot,
      setFilters,
      resetFilters,
      setSettings,
      setViewMode,
      selectNode,
      hoverNode,
      expandNode,
      collapseNode,
      isNodeExpanded,
      addProfiles,
      getProfile,
      setLoading,
      setError,
      resetGraph,
    }),
    [
      state,
      filteredData,
      stats,
      setData,
      mergeData,
      setRoot,
      setFilters,
      resetFilters,
      setSettings,
      setViewMode,
      selectNode,
      hoverNode,
      expandNode,
      collapseNode,
      isNodeExpanded,
      addProfiles,
      getProfile,
      setLoading,
      setError,
      resetGraph,
    ]
  );

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
}

// Hook
export function useGraph() {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return context;
}
