"use client";

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { SimplePool } from "nostr-tools/pool";
import type { Event } from "nostr-tools";
import { selectProfileEvent, profileFromEvent } from "@/lib/graph/profile-events";
import { useGraph } from "@/contexts/GraphContext";
import { buildExpansion } from "@/lib/graph/expansion";
import { formatPubkey } from "@/lib/graph/transformers";
import { fetchDistances, fetchFollowPage, isPubkey } from "@/lib/graph/oracle";
import type { NodeProfile } from "@/lib/graph/types";

const RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];
interface PageState { offset: number; hasMore: boolean }
interface DataContext {
  expandNodeFollows: (pubkey: string) => Promise<void>;
  loadMoreFollows: (pubkey: string) => Promise<void>;
  collapseNodeFollows: (pubkey: string) => void;
  hasMoreFollows: (pubkey: string) => boolean;
  resetGraph: () => void;
  buildInitialGraph: () => void;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  userPubkey: string;
  nodeLimitReached: boolean;
}
export const GraphDataContext = createContext<DataContext | null>(null);

export function GraphDataProvider({ rootPubkey, children }: { rootPubkey: string; children: ReactNode }) {
  const graph = useGraph();
  const graphRef = useRef(graph);
  graphRef.current = graph;
  const session = useRef<AbortController | null>(null);
  const active = useRef<AbortController | null>(null);
  const pendingInitialization = useRef(false);
  const autoExpand = useRef(false);
  const pagesRef = useRef(new Map<string, PageState>());
  const [pages, setPages] = useState(new Map<string, PageState>());
  const pool = useRef<SimplePool | null>(null);
  const profilesRequested = useRef(new Set<string>());

  const fetchProfiles = useCallback((keys: string[], signal: AbortSignal) => {
    const authors = keys.filter(key => !profilesRequested.current.has(key));
    if (!authors.length || signal.aborted || !pool.current) return;
    authors.forEach(key => profilesRequested.current.add(key));
    for (let index = 0; index < authors.length; index += 100) {
      const batch = authors.slice(index, index + 100);
      const latest = new Map<string, Event>();
      const profiles = new Map<string, NodeProfile>();
      let closed = false;
      let subscription: { close: () => void } | undefined;
      const finish = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timer);
        signal.removeEventListener("abort", finish);
        subscription?.close();
        if (!signal.aborted && profiles.size) graphRef.current.addProfiles(profiles);
      };
      const timer = setTimeout(finish, 4000);
      signal.addEventListener("abort", finish, { once: true });
      // SimplePool verifies event signatures before invoking onevent.
      try {
      subscription = pool.current.subscribeMany(RELAYS, { kinds: [0], authors: batch }, {
        onevent(event) {
          if (closed || signal.aborted || !batch.includes(event.pubkey) || event.content.length > 16384) return;
          const previous = latest.get(event.pubkey) ?? null;
          const selected = selectProfileEvent(previous, event, event.pubkey, 0);
          if (!selected || selected === previous) return;
          const profile = profileFromEvent(selected);
          if (!profile) return;
          latest.set(event.pubkey, selected);
          profiles.set(event.pubkey, { ...profile,
            picture: profile.picture && /^https?:\/\//i.test(profile.picture) ? profile.picture : undefined });
        }, oneose: finish,
      });
      if (closed) subscription.close();
      } catch { finish(); }
    }
  }, []);

  const load = useCallback(async (pubkey: string, more = false) => {
    const current = graphRef.current;
    const lifetime = session.current;
    const node = current.state.data.nodes.find(item => item.id === pubkey);
    if (!lifetime || lifetime.signal.aborted || active.current || !node || node.distance >= 4) return;
    const previous = pagesRef.current.get(pubkey);
    if (previous && (!more || !previous.hasMore)) return;
    const capacity = Math.max(0, Math.min(500, current.state.settings.maxNodes) - current.state.data.nodes.length);
    if (capacity === 0) return;
    const controller = new AbortController();
    active.current = controller;
    const signal = AbortSignal.any([lifetime.signal, controller.signal]);
    current.setLoading(true);
    current.setError(null);
    try {
      const page = await fetchFollowPage(pubkey, previous?.offset ?? 0, signal, Math.min(250, capacity));
      const targets = page.follows.filter(key => key !== rootPubkey && key !== pubkey);
      const distances = await fetchDistances(rootPubkey, targets, signal);
      if (signal.aborted || session.current !== lifetime) return;
      const { nodes, links } = buildExpansion(node, rootPubkey, page.follows, distances, graphRef.current.state.data.nodes);
      current.mergeData({ nodes, links });
      current.expandNode(pubkey);
      pagesRef.current.set(pubkey, { offset: page.nextOffset, hasMore: page.hasMore });
      setPages(new Map(pagesRef.current));
      fetchProfiles(nodes.map(item => item.id), lifetime.signal);
    } catch (error) {
      if (!signal.aborted && session.current === lifetime) {
        current.setError(error instanceof Error ? error.message : "Unable to load public follows");
      }
    } finally {
      if (active.current === controller) {
        active.current = null;
        if (session.current === lifetime && !lifetime.signal.aborted) current.setLoading(false);
      }
    }
  }, [rootPubkey, fetchProfiles]);

  const initialize = useCallback(() => {
    session.current?.abort();
    active.current?.abort();
    active.current = null;
    const lifetime = new AbortController();
    session.current = lifetime;
    pagesRef.current.clear();
    setPages(new Map());
    profilesRequested.current.clear();
    const current = graphRef.current;
    current.setError(null);
    if (!isPubkey(rootPubkey)) { current.setError("Invalid public key"); return; }
    pendingInitialization.current = true;
    autoExpand.current = true;
    current.setLoading(true);
    current.setRoot(rootPubkey);
    current.setData({ nodes: [{ id: rootPubkey, label: formatPubkey(rootPubkey), distance: 0,
      pathCount: 1, trustScore: 1, isRoot: true }], links: [] });
    fetchProfiles([rootPubkey], lifetime.signal);
  }, [rootPubkey, fetchProfiles]);

  useEffect(() => {
    pool.current = new SimplePool();
    initialize();
    return () => {
      session.current?.abort();
      active.current?.abort();
      pool.current?.close(RELAYS);
      pool.current = null;
    };
  }, [initialize]);

  // GraphContext's existing reset button clears its root; reinitialize the same identity.
  useEffect(() => {
    if (!graph.state.rootPubkey && graph.state.data.nodes.length === 0 && session.current && !pendingInitialization.current) initialize();
    else if (graph.state.rootPubkey === rootPubkey) {
      pendingInitialization.current = false;
      if (autoExpand.current && graph.state.data.nodes.length === 1) {
        autoExpand.current = false;
        void load(rootPubkey);
      }
    }
  }, [graph.state.rootPubkey, graph.state.data.nodes.length, graph.state.error, initialize, load, rootPubkey]);

  const resetGraph = useCallback(() => {
    session.current?.abort();
    active.current?.abort();
    active.current = null;
    pendingInitialization.current = false;
    autoExpand.current = false;
    graphRef.current.resetGraph();
  }, []);

  const collapseNodeFollows = useCallback((pubkey: string) => {
    active.current?.abort();
    active.current = null;
    graphRef.current.setLoading(false);
    const removed = new Set([pubkey]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of graphRef.current.state.data.nodes) {
        if (node.expandedFrom && removed.has(node.expandedFrom) && !removed.has(node.id)) {
          removed.add(node.id); changed = true;
        }
      }
    }
    removed.forEach(key => pagesRef.current.delete(key));
    setPages(new Map(pagesRef.current));
    graphRef.current.collapseNode(pubkey);
  }, []);

  return <GraphDataContext.Provider value={{
    expandNodeFollows: key => load(key), loadMoreFollows: key => load(key, true),
    collapseNodeFollows, hasMoreFollows: key => pages.get(key)?.hasMore ?? false,
    resetGraph, buildInitialGraph: resetGraph,
    isLoading: graph.state.isLoading, error: graph.state.error, isReady: isPubkey(rootPubkey),
    userPubkey: rootPubkey,
    nodeLimitReached: graph.state.data.nodes.length >= Math.min(500, graph.state.settings.maxNodes),
  }}>{children}</GraphDataContext.Provider>;
}
