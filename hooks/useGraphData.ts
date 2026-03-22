"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGraph } from "@/contexts/GraphContext";
import { useWoTContext } from "nostr-wot-sdk/react";
import {
  GraphData,
  GraphNode,
  GraphEdge,
  NodeProfile,
} from "@/lib/graph/types";
import { formatPubkey } from "@/lib/graph/transformers";
import {
  getCachedProfiles,
  cacheProfiles,
  getPubkeysToFetch,
  getCachedTrustBatch,
  cacheTrustBatch,
  TrustData,
} from "@/lib/cache/profileCache";

// Relays for profile fetching only
const PROFILE_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
];

/**
 * Hook to fetch and manage graph data
 * Uses WoT extension via SDK for all graph operations
 */
export function useGraphData() {
  const {
    setData,
    mergeData,
    setRoot,
    setLoading,
    setError,
    addProfiles,
    expandNode,
    collapseNode,
    state,
  } = useGraph();

  // Get WoT instance from SDK context
  const { wot, isReady } = useWoTContext();

  // Track user pubkey
  const [userPubkey, setUserPubkey] = useState<string | null>(null);

  // Use refs to avoid stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  const profileCacheRef = useRef<Map<string, NodeProfile>>(new Map());
  const expandingNodesRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  // Full list of root's follows (unpaged) — used to enforce correct hop distances.
  // A pubkey in this set is ALWAYS hop-1, regardless of where it was discovered.
  const rootFollowsRef = useRef<Set<string>>(new Set());
  const wotRef = useRef(wot);
  wotRef.current = wot;

  // Get user pubkey when WoT is ready
  useEffect(() => {
    const getPubkey = async () => {
      console.log("[useGraphData] Checking WoT readiness - wot:", !!wot, "isReady:", isReady);
      if (wot && isReady) {
        try {
          const pubkey = await wot.getMyPubkey();
          console.log("[useGraphData] SDK getMyPubkey response:", pubkey);
          if (pubkey) {
            setUserPubkey(pubkey);
            console.log("[useGraphData] Got user pubkey:", pubkey.slice(0, 8));
          } else {
            console.warn("[useGraphData] getMyPubkey returned null/undefined");
          }
        } catch (err) {
          console.error("[useGraphData] Failed to get pubkey:", err);
        }
      }
    };
    getPubkey();
  }, [wot, isReady]);

  /**
   * Fetch profiles for multiple pubkeys (optional, non-blocking)
   * Uses localStorage cache first
   */
  const fetchProfiles = useCallback(
    async (pubkeys: string[]): Promise<Map<string, NodeProfile>> => {
      // First, get all cached profiles (localStorage + memory ref)
      const cachedFromStorage = getCachedProfiles(pubkeys);
      const profiles = new Map<string, NodeProfile>(cachedFromStorage);

      // Also check memory cache for any additional
      pubkeys.forEach((pk) => {
        if (!profiles.has(pk)) {
          const cached = profileCacheRef.current.get(pk);
          if (cached) profiles.set(pk, cached);
        }
      });

      // Filter to pubkeys that need fetching
      const toFetch = getPubkeysToFetch(pubkeys.filter((pk) => !profiles.has(pk)));
      if (toFetch.length === 0) return profiles;

      return new Promise((resolve) => {
        let resolved = false;
        const newProfiles: NodeProfile[] = [];

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            // Cache new profiles to localStorage
            if (newProfiles.length > 0) {
              cacheProfiles(newProfiles);
            }
            resolve(profiles);
          }
        }, 3000);

        const ws = new WebSocket(PROFILE_RELAYS[0]);

        ws.onopen = () => {
          const batch = toFetch.slice(0, 100);
          ws.send(
            JSON.stringify([
              "REQ",
              `p-${Date.now()}`,
              { kinds: [0], authors: batch, limit: batch.length },
            ])
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data[0] === "EVENT" && data[2]?.kind === 0) {
              const pubkey = data[2].pubkey;
              const content = JSON.parse(data[2].content);
              const profile: NodeProfile = {
                pubkey,
                name: content.name,
                displayName: content.display_name,
                picture: content.picture,
                about: content.about,
                nip05: content.nip05,
              };
              profiles.set(pubkey, profile);
              profileCacheRef.current.set(pubkey, profile);
              newProfiles.push(profile);
            } else if (data[0] === "EOSE") {
              ws.close();
              if (!resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                // Cache new profiles to localStorage
                if (newProfiles.length > 0) {
                  cacheProfiles(newProfiles);
                }
                resolve(profiles);
              }
            }
          } catch {
            // Ignore
          }
        };

        ws.onerror = () => {
          if (!resolved) {
            clearTimeout(timeoutId);
            resolved = true;
            if (newProfiles.length > 0) {
              cacheProfiles(newProfiles);
            }
            resolve(profiles);
          }
        };

        ws.onclose = () => {
          if (!resolved) {
            clearTimeout(timeoutId);
            resolved = true;
            if (newProfiles.length > 0) {
              cacheProfiles(newProfiles);
            }
            resolve(profiles);
          }
        };
      });
    },
    []
  );

  /**
   * Build initial graph with only the root node
   */
  const buildInitialGraph = useCallback(async () => {
    if (!userPubkey || initializedRef.current) return;

    initializedRef.current = true;
    setLoading(true);
    setError(null);

    try {
      setRoot(userPubkey);

      const graphData: GraphData = {
        nodes: [
          {
            id: userPubkey,
            label: formatPubkey(userPubkey),
            distance: 0,
            pathCount: 1,
            trustScore: 1,
            isRoot: true,
            isMutual: false,
          },
        ],
        links: [],
      };

      setData(graphData);

      // Fetch profile in background
      fetchProfiles([userPubkey]).then((profiles) => {
        if (profiles.size > 0) {
          addProfiles(profiles);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load graph");
    } finally {
      setLoading(false);
    }
  }, [
    userPubkey,
    fetchProfiles,
    setData,
    setRoot,
    setLoading,
    setError,
    addProfiles,
  ]);

  /**
   * Expand a node to load its follows using extension
   */
  const expandNodeFollows = useCallback(
    async (pubkey: string) => {
      console.log("[expandNodeFollows] Called for pubkey:", pubkey.slice(0, 8));

      // Capture WoT instance to avoid race conditions
      const wotInstance = wotRef.current;
      if (!wotInstance) {
        console.log("[expandNodeFollows] WoT not available");
        setError("WoT extension required");
        return;
      }

      if (expandingNodesRef.current.has(pubkey)) {
        console.log("[expandNodeFollows] Already expanding, skipping");
        return;
      }

      const currentState = stateRef.current;
      if (currentState.expandedNodes.has(pubkey)) {
        console.log("[expandNodeFollows] Already expanded, skipping");
        return;
      }

      const node = currentState.data.nodes.find((n) => n.id === pubkey);
      const parentDistance = node?.distance ?? 0;
      console.log("[expandNodeFollows] Node distance:", parentDistance);

      if (parentDistance >= 4) {
        console.log("[expandNodeFollows] Distance >= 4, skipping");
        return;
      }

      expandingNodesRef.current.add(pubkey);
      expandNode(pubkey);
      setLoading(true);

      try {
        // Get follows from extension
        console.log("[expandNodeFollows] Fetching follows from extension for pubkey:", pubkey.slice(0, 8));
        const follows = await wotInstance.getFollows(pubkey);
        console.log("[expandNodeFollows] SDK getFollows response - count:", follows?.length || 0, "first 3:", follows?.slice(0, 3).map(f => f.slice(0, 8)));

        if (!follows || follows.length === 0) {
          console.log("[expandNodeFollows] No follows found");
          return;
        }

        // If expanding the root node, store ALL its follows for hop-distance enforcement
        if (parentDistance === 0) {
          rootFollowsRef.current = new Set(follows);
          console.log("[expandNodeFollows] Stored root follows:", follows.length);
        }

        const latestState = stateRef.current;
        const existingIds = new Set(latestState.data.nodes.map((n) => n.id));
        const newPubkeys = follows.filter((pk: string) => !existingIds.has(pk));

        // Get trust data - first from cache, then from extension for uncached
        // SDK now provides score directly, so we cache hops, paths, and score
        const wotData = new Map<string, { distance: number; paths: number | null; score: number | null }>();

        if (newPubkeys.length > 0) {
          // Get cached trust data first
          const cachedTrust = getCachedTrustBatch(newPubkeys);
          cachedTrust.forEach((trust, pk) => {
            wotData.set(pk, {
              distance: trust.distance ?? parentDistance + 1,
              paths: trust.paths,
              score: trust.score,
            });
          });

          // Fetch trust for uncached pubkeys - use getDistanceBatch with includePaths and includeScores
          const uncachedPubkeys = newPubkeys.filter((pk) => !cachedTrust.has(pk));
          if (uncachedPubkeys.length > 0) {
            try {
              console.log("[expandNodeFollows] Getting WoT data for", uncachedPubkeys.length, "pubkeys...");
              const batchResults = await wotInstance.getDistanceBatch(uncachedPubkeys, { includePaths: true, includeScores: true });
              console.log("[expandNodeFollows] SDK getDistanceBatch response (first 3):",
                JSON.stringify(Object.fromEntries(Object.entries(batchResults).slice(0, 3)), null, 2));

              const newTrustData = new Map<string, TrustData>();

              for (const [pk, result] of Object.entries(batchResults)) {
                // Expecting { hops, paths, score } | null from SDK
                if (result === null) {
                  // Not in WoT - use parent distance + 1 as fallback
                  wotData.set(pk, {
                    distance: parentDistance + 1,
                    paths: null,
                    score: null,
                  });
                  newTrustData.set(pk, {
                    distance: parentDistance + 1,
                    paths: null,
                    score: null,
                  });
                } else {
                  const resultData = result as { hops: number; paths: number; score: number };
                  wotData.set(pk, {
                    distance: resultData.hops,
                    paths: resultData.paths,
                    score: resultData.score,
                  });
                  newTrustData.set(pk, {
                    distance: resultData.hops,
                    paths: resultData.paths,
                    score: resultData.score,
                  });
                }
              }

              // Cache the new trust data
              if (newTrustData.size > 0) {
                cacheTrustBatch(newTrustData);
              }
            } catch (err) {
              console.warn("[expandNodeFollows] getDistanceBatch failed:", err);
            }
          }
        }

        const newNodes: GraphNode[] = [];
        const newLinks: GraphEdge[] = [];

        // Get the parent node's current position from the live graph data
        // (react-force-graph mutates node objects with x/y/z during simulation)
        const parentNode = latestState.data.nodes.find((n) => n.id === pubkey);
        const parentX = parentNode?.x ?? 0;
        const parentY = parentNode?.y ?? 0;
        const parentZ = parentNode?.z ?? 0;

        // Count how many new nodes we'll create, for even angular spread
        const newFollowPubkeys = follows.filter((pk: string) => !existingIds.has(pk));
        const totalNew = newFollowPubkeys.length;
        let newNodeIndex = 0;

        for (const followPubkey of follows) {
          const extData = wotData.get(followPubkey);
          const pathCount = extData?.paths ?? 1;
          const trustScore = extData?.score ?? 0;

          // Enforce correct hop distance:
          // If the root directly follows this person, they are ALWAYS hop-1,
          // regardless of where they were discovered during expansion.
          const isRootFollow = rootFollowsRef.current.has(followPubkey);
          const correctDistance = isRootFollow ? 1 : (extData?.distance ?? parentDistance + 1);

          // Skip nodes that the root follows but are being discovered via another expansion —
          // they should only appear when the root is expanded (or already visible as hop-1).
          // This prevents a root follow from appearing as hop-2 under a different node.
          if (isRootFollow && parentDistance > 0) {
            // Don't render this node here — it belongs to hop-1 layer
            continue;
          }

          // Only add links to NEW nodes — skip edges to already-existing nodes
          // to avoid cross-cluster "ray" lines flying across the screen
          if (!existingIds.has(followPubkey)) {
            newLinks.push({
              source: pubkey,
              target: followPubkey,
              type: "follow",
              strength: trustScore,
              bidirectional: false,
            });
          }

          if (!existingIds.has(followPubkey)) {
            const cachedProfile = profileCacheRef.current.get(followPubkey);

            // Seed initial position scattered around the parent node
            // Use random angle + varying radius so nodes don't all appear at once in a visible ring
            const angle = Math.random() * 2 * Math.PI;
            // Scale radius with node count so sparse graphs stay tight, dense ones spread out
            const radius = Math.max(40, Math.sqrt(totalNew) * 4) * (0.6 + Math.random() * 0.8);
            const x = parentX + radius * Math.cos(angle);
            const y = parentY + radius * Math.sin(angle);
            // For 3D: small random z offset
            const z = parentZ + (Math.random() - 0.5) * radius * 0.4;
            newNodeIndex++;

            newNodes.push({
              id: followPubkey,
              label:
                cachedProfile?.displayName ||
                cachedProfile?.name ||
                formatPubkey(followPubkey),
              picture: cachedProfile?.picture,
              distance: correctDistance,
              pathCount,
              trustScore,
              isRoot: false,
              isMutual: false,
              expandedFrom: pubkey, // which gateway node revealed this node
              x,
              y,
              z,
            });
          }
        }

        // UX/perf cap: only render the top 150 new nodes by trust score.
        // Expanding 500-1000 nodes at once causes a visual explosion the
        // force simulation can never settle. The highest-trust nodes are
        // the most relevant anyway; the rest are silently dropped.
        const MAX_NEW_NODES_PER_EXPANSION = 150;
        let cappedNodes = newNodes;
        if (newNodes.length > MAX_NEW_NODES_PER_EXPANSION) {
          cappedNodes = [...newNodes]
            .sort((a, b) => b.trustScore - a.trustScore)
            .slice(0, MAX_NEW_NODES_PER_EXPANSION);
        }

        // Only keep links whose target is in the capped set or already exists
        const cappedNodeIds = new Set(cappedNodes.map(n => n.id));
        const cappedLinks = newLinks.filter(l => {
          const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          return existingIds.has(targetId) || cappedNodeIds.has(targetId);
        });

        // Single mergeData call — batching caused 10 re-renders + 10 simulation
        // reheats per expansion which was the source of lag. forceRadial handles
        // the visual placement of nodes in their orbit rings regardless.
        if (cappedNodes.length > 0 || cappedLinks.length > 0) {
          mergeData({ nodes: cappedNodes, links: cappedLinks });
        }

        if (newPubkeys.length > 0) {
          fetchProfiles(newPubkeys).then((profiles) => {
            if (profiles.size > 0) {
              addProfiles(profiles);
            }
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("not initialized") || msg.toLowerCase().includes("account configured")) {
          // Extension local graph not ready — silently un-mark so user can retry
          console.warn("[expandNodeFollows] Extension local graph not ready:", msg);
        } else {
          console.error("Failed to expand node:", err);
        }
        // Un-mark as expanded on failure so the Expand button reappears
        collapseNode(pubkey);
      } finally {
        expandingNodesRef.current.delete(pubkey);
        setLoading(false);
      }
    },
    [expandNode, collapseNode, fetchProfiles, addProfiles, mergeData, setLoading, setError]
  );

  // Reset refs when user changes or graph is cleared
  useEffect(() => {
    initializedRef.current = false;
    expandingNodesRef.current.clear();
  }, [userPubkey]);

  // Also reset initialized flag when graph data is emptied (manual reset)
  useEffect(() => {
    if (state.data.nodes.length === 0) {
      initializedRef.current = false;
      expandingNodesRef.current.clear();
      rootFollowsRef.current.clear();
    }
  }, [state.data.nodes.length]);

  // Build initial graph when ready
  useEffect(() => {
    if (isReady && userPubkey && state.data.nodes.length === 0) {
      buildInitialGraph();
    }
  }, [isReady, userPubkey, state.data.nodes.length, buildInitialGraph]);

  return {
    buildInitialGraph,
    expandNodeFollows,
    collapseNodeFollows: collapseNode,
    fetchProfiles,
    isLoading: state.isLoading,
    error: state.error,
    isReady,
    userPubkey,
  };
}
