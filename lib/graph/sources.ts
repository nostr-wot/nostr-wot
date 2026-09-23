import { GraphStorage, LocalGraph, GraphCrawler, calculateScore, type CrawlPool, type CrawlProgress } from "@nostr-wot/graph";
import { SimplePool } from "nostr-tools";
import { isPubkey, type OracleDistance } from "./oracle";
import { namespaceFor, registerGraph, saveGraphRecord, withDatabaseLock, type SavedGraph } from "./databases";
import type { GraphExtension } from "./extension";

import { discoveryPool, GRAPH_RELAYS } from "./discovery";
export type GraphMetric = OracleDistance & { score?: number };
export interface GraphSource {
  kind: "local" | "extension";
  ready: Promise<void>;
  follows(pubkey: string, signal: AbortSignal): Promise<string[]>;
  metrics(pubkeys: string[], signal: AbortSignal): Promise<Map<string, GraphMetric>>;
  sync(maxHops: number, signal: AbortSignal, progress?: (p: CrawlProgress) => void): Promise<void>;
  updatedAt(): number | null;
  close(): Promise<void>;
}
const active = new Map<string, LocalGraphSource>();
export async function closeSavedGraph(pubkey: string): Promise<void> { await active.get(pubkey)?.close(); }

export class LocalGraphSource implements GraphSource {
  readonly kind = "local";
  readonly ready: Promise<void>;
  private storage: GraphStorage;
  private graph: LocalGraph;
  private pool = new SimplePool();
  private crawler: GraphCrawler;
  private record!: SavedGraph;
  private closed = false;
  private inFlight: Promise<void> | null = null;
  private controller: AbortController | null = null;
  private unlock = () => {};
  private lockDone: Promise<void>;

  constructor(readonly root: string, customPool?: CrawlPool) {
    this.storage = new GraphStorage(namespaceFor(root));
    this.graph = new LocalGraph(this.storage);
    const pool: CrawlPool = customPool ?? discoveryPool(this.pool);
    this.crawler = new GraphCrawler({ pool, storage: this.storage, relays: GRAPH_RELAYS, requestTimeoutMs: 7500 });
    let resolve!: () => void, reject!: (error: unknown) => void;
    this.ready = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
    const release = new Promise<void>(done => { this.unlock = done; });
    this.lockDone = (async () => {
      // Strict-mode remounts and rapid changes wait for the preceding session to close.
      await active.get(root)?.close();
      if (this.closed) { resolve(); return; }
      active.set(root, this);
      await withDatabaseLock(root, async () => {
        if (typeof indexedDB === "undefined") throw new Error("Local graph storage is unavailable in this browser.");
        this.record = registerGraph(root);
        await this.storage.open();
        const saved = this.storage.getMeta<SavedGraph>("playground");
        if (saved?.pubkey === root && (this.record.status === "new" || (saved.lastAttempt ?? 0) > (this.record.lastAttempt ?? 0))) this.record = saved;
        if (this.record.status === "syncing") this.record = { ...this.record, status: "stopped", durationMs: null };
        const stats = this.storage.stats();
        this.record = { ...this.record, nodes: stats.uniquePubkeys, edges: stats.edges };
        saveGraphRecord(this.record);
        resolve();
        await release;
        this.storage.close();
      });
    })().catch(error => { reject(error); this.storage.close(); }).finally(() => {
      if (active.get(root) === this) active.delete(root);
    });
  }

  async follows(pubkey: string, signal: AbortSignal): Promise<string[]> {
    await this.ready; this.check(signal);
    // A reset may have cancelled the preceding crawl. Wait for its flush, then recheck the cache.
    await this.inFlight?.catch(() => {});
    this.check(signal);
    if (!this.storage.getFollowVersion(pubkey)) await this.crawl(pubkey, 1, signal);
    this.check(signal);
    return this.storage.getFollows(pubkey);
  }
  async metrics(pubkeys: string[], signal: AbortSignal): Promise<Map<string, GraphMetric>> {
    await this.ready; this.check(signal);
    const rootFollows = new Set(this.storage.getFollows(this.root));
    return new Map(pubkeys.map(key => {
      const info = this.graph.getDistance(this.root, key, 4);
      return [key, { hops: info?.hops ?? null, pathCount: info?.paths ?? 0,
        score: calculateScore(info?.hops ?? null, info?.paths ?? null),
        mutual: rootFollows.has(key) && this.storage.getFollows(key).includes(this.root) }];
    }));
  }
  async sync(maxHops: number, signal: AbortSignal, progress?: (p: CrawlProgress) => void): Promise<void> {
    await this.ready; this.check(signal);
    if (![1, 2, 3].includes(maxHops)) throw new Error("Invalid sync depth");
    await this.crawl(this.root, maxHops, signal, progress);
  }
  private async crawl(pubkey: string, maxHops: number, signal: AbortSignal, progress?: (p: CrawlProgress) => void): Promise<void> {
    if (this.inFlight) { await this.inFlight; this.check(signal); return; }
    const controller = new AbortController(); this.controller = controller;
    this.inFlight = (async () => {
      const start = Date.now();
      this.record = { ...this.record, lastAttempt: start, status: "syncing" };
      saveGraphRecord(this.record);
      try {
        const result = await this.crawler.crawl(pubkey, { maxHops, signal: AbortSignal.any([signal, controller.signal]), onProgress: progress });
        const stats = this.storage.stats();
        if (result.stoppedEarly) this.record.status = "stopped";
        else if (!result.fetched) throw new Error("No follow list was received from the relays. Your saved graph has been kept; try syncing again.");
        else {
          const authors = new Set([pubkey]);
          let frontier = [pubkey];
          for (let depth = 1; depth < maxHops; depth++) {
            const next: string[] = [];
            for (const author of frontier) for (const key of this.storage.getFollows(author)) {
              if (!authors.has(key)) { authors.add(key); next.push(key); }
            }
            frontier = next;
          }
          this.record.status = result.fetched < authors.size ? "partial" : "ready";
          this.record.updatedAt = Date.now();
          if (pubkey === this.root) {
            if (this.record.status === "ready") this.record.lastSync = Date.now();
            this.record.maxHops = maxHops;
          }
        }
        this.record = { ...this.record, nodes: stats.uniquePubkeys, edges: stats.edges, durationMs: Date.now() - start };
      } catch (error) {
        this.record = { ...this.record, status: signal.aborted || controller.signal.aborted ? "stopped" : "error", durationMs: Date.now() - start };
        throw error;
      } finally {
        this.graph.invalidateCache();
        saveGraphRecord(this.record);
        await this.storage.setMetaBatch({ root: this.root, lastCrawl: this.record.status === "ready" ? this.record.lastSync : null, maxDepth: this.record.maxHops - 1, version: 2, playground: this.record });
      }
    })();
    try { await this.inFlight; } finally { this.inFlight = null; this.controller = null; }
  }
  updatedAt() { return this.record?.lastSync ?? null; }
  private check(signal: AbortSignal) { signal.throwIfAborted(); if (this.closed) throw new DOMException("Graph closed", "AbortError"); }
  async close(): Promise<void> {
    this.closed = true; this.controller?.abort(); this.crawler.stop();
    await this.inFlight?.catch(() => {});
    this.pool.destroy(); this.unlock(); await this.lockDone;
  }
}

export class ExtensionGraphSource implements GraphSource {
  readonly kind = "extension";
  readonly ready: Promise<void>;
  private lastUpdate: number | null = null;
  constructor(readonly root: string, private provider: GraphExtension) { this.ready = this.status(); }
  private async status() {
    if (!this.provider.wot) throw new Error("Enable Web of Trust in your extension, select Local mode, and sync its graph first.");
    await this.identity();
    const status = await this.provider.wot.getStatus();
    if (!status || status.mode !== "local" || !status.hasLocalGraph) throw new Error("Select Local mode and sync the graph in your extension first.");
    this.lastUpdate = typeof status.updatedAt === "number" && Number.isSafeInteger(status.updatedAt) && status.updatedAt >= 0 && status.updatedAt <= Date.now() + 60000 ? status.updatedAt : null;
  }
  private async identity() {
    if (await this.provider.getPublicKey() !== this.root) throw new Error("The extension account changed. Connect again to load its graph.");
  }
  async follows(pubkey: string, signal: AbortSignal) {
    await this.ready; signal.throwIfAborted(); await this.status();
    const keys = await this.provider.wot!.getFollows(pubkey);
    signal.throwIfAborted(); await this.identity();
    if (!Array.isArray(keys) || !keys.every(isPubkey)) throw new Error("Invalid follow list from extension");
    return [...new Set(keys)];
  }
  async metrics(pubkeys: string[], signal: AbortSignal) {
    await this.ready; signal.throwIfAborted(); await this.status();
    const output = new Map<string, GraphMetric>();
    for (let i = 0; i < pubkeys.length; i += 100) {
      const batch = pubkeys.slice(i, i + 100);
      const result = await this.provider.wot!.getDistanceBatch(batch, { includePaths: true, includeScores: true });
      signal.throwIfAborted();
      for (const key of batch) {
        const value = result?.[key];
        if (value === null) { output.set(key, { hops: null, pathCount: 0, mutual: false, score: 0 }); continue; }
        if (!value || !Number.isInteger(value.hops) || value.hops < 0 || value.hops > 4 ||
          !(value.paths === null || Number.isSafeInteger(value.paths) && value.paths >= 0) ||
          typeof value.score !== "number" || !Number.isFinite(value.score) || value.score < 0 || value.score > 1) throw new Error("Invalid graph metrics from extension");
        output.set(key, { hops: value.hops, pathCount: value.paths ?? 1, mutual: false, score: value.score });
      }
    }
    await this.identity(); return output;
  }
  async sync(_depth: number, signal: AbortSignal) { signal.throwIfAborted(); await this.status(); }
  updatedAt() { return this.lastUpdate; }
  async close() { /* The extension owns its database and sync lifecycle. */ }
}
