import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { IDBFactory } from "fake-indexeddb";
import { finalizeEvent, getPublicKey } from "nostr-tools";
import type { CrawlPool } from "@nostr-wot/graph";
import { LocalGraphSource, closeSavedGraph, ExtensionGraphSource } from "../lib/graph/sources";
import { deleteSavedGraph, discoverSavedGraphs, listSavedGraphs, saveGraphRecord, DATABASE_PREFIX } from "../lib/graph/databases";
import { connectGraphExtension } from "../lib/graph/extension";

const secret = (n: number) => Uint8Array.from({ length: 32 }, (_, i) => i === 31 ? n : 0);
const keys = Array.from({ length: 9 }, (_, i) => getPublicKey(secret(i + 1)));
const event = (index: number, follows: string[], at = 100) => finalizeEvent({ kind: 3, content: "", tags: follows.map(key => ["p", key]), created_at: at }, secret(index + 1));
function transport(events: ReturnType<typeof event>[]): CrawlPool {
  return { subscribe(filter, handlers) {
    let closed = false;
    queueMicrotask(() => { for (const e of events) if (!closed && filter.authors?.includes(e.pubkey)) handlers.onEvent({ ...e }); if (!closed) handlers.onEose?.(); });
    return { close() { closed = true; } };
  } };
}
beforeEach(() => {
  Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: new IDBFactory() });
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    get length() { return data.size; }, key: (n: number) => [...data.keys()][n] ?? null,
    getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key), clear: () => data.clear(),
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: new EventTarget() });
});

test("SDK builds eight follows including self, persists metrics and reopens without fetching", async () => {
  const follows = keys.slice(0, 8);
  const graph = new LocalGraphSource(keys[0], transport([event(0, follows)]));
  await graph.ready;
  assert.deepEqual((await graph.follows(keys[0], new AbortController().signal)).sort(), [...follows].sort());
  const metrics = await graph.metrics(keys.slice(1, 8), new AbortController().signal);
  assert.equal(metrics.size, 7);
  for (const metric of metrics.values()) assert.equal(metric.hops, 1);
  const saved = listSavedGraphs()[0];
  assert.equal(saved.edges, 8); assert.equal(saved.nodes, 8); assert.equal(saved.status, "ready"); assert.ok(saved.lastSync);
  await graph.close();
  const reopened = new LocalGraphSource(keys[0], { subscribe() { throw new Error("Must not refetch cached graph"); } });
  await reopened.ready;
  assert.equal((await reopened.follows(keys[0], new AbortController().signal)).length, 8);
  assert.equal(reopened.updatedAt(), saved.lastSync);
  await reopened.close();
});

test("SDK refresh replaces follows, retains last successful sync on failure, and can be cancelled", async () => {
  const events = [event(0, [keys[1]])];
  const graph = new LocalGraphSource(keys[0], transport(events));
  await graph.follows(keys[0], new AbortController().signal);
  events[0] = event(0, [keys[2]], 200);
  await graph.sync(1, new AbortController().signal);
  assert.deepEqual(await graph.follows(keys[0], new AbortController().signal), [keys[2]]);
  const last = graph.updatedAt();
  events.length = 0;
  await assert.rejects(graph.sync(1, new AbortController().signal), /No follow list/);
  assert.equal(graph.updatedAt(), last); assert.equal(listSavedGraphs()[0].status, "error");
  events.push(event(0, [keys[2]], 300));
  const abort = new AbortController();
  await graph.sync(2, abort.signal, () => abort.abort());
  assert.equal(listSavedGraphs()[0].status, "stopped"); assert.equal(graph.updatedAt(), last);
  await graph.close();
});

test("deleting selected databases preserves other graphs and unrelated databases", async () => {
  const a = new LocalGraphSource(keys[0], transport([event(0, [])]));
  const b = new LocalGraphSource(keys[1], transport([event(1, [])]));
  await Promise.all([a.ready, b.ready]);
  await new Promise<void>(resolve => { const request = indexedDB.open("unrelated-wallet"); request.onsuccess = () => { request.result.close(); resolve(); }; });
  await closeSavedGraph(keys[0]); await deleteSavedGraph(keys[0]);
  assert.deepEqual(listSavedGraphs().map(x => x.pubkey), [keys[1]]);
  assert.deepEqual((await indexedDB.databases()).map(x => x.name).sort(), [DATABASE_PREFIX + keys[1], "unrelated-wallet"].sort());
  await b.close(); localStorage.clear();
  assert.deepEqual((await discoverSavedGraphs()).map(x => x.pubkey), [keys[1]]);
  await deleteSavedGraph(keys[1]);
  assert.deepEqual((await indexedDB.databases()).map(x => x.name), ["unrelated-wallet"]);
});

test("close during initialization leaves no blocked database handle", async () => {
  const graph = new LocalGraphSource(keys[0], transport([]));
  await graph.close();
  await deleteSavedGraph(keys[0]);
  assert.equal((await indexedDB.databases()).length, 0);
});

test("extension uses its local graph and score, creates no website database, and detects account changes", async () => {
  let identity = keys[0];
  const provider = { getPublicKey: async () => identity, wot: {
    getStatus: async () => ({ mode: "local", hasLocalGraph: true, updatedAt: 123 }),
    getFollows: async () => [keys[1]],
    getDistanceBatch: async () => ({ [keys[1]]: { hops: 1, paths: 1, score: 0.6 } }),
  } };
  assert.equal(await connectGraphExtension(provider), keys[0]);
  const graph = new ExtensionGraphSource(keys[0], provider);
  assert.deepEqual(await graph.follows(keys[0], new AbortController().signal), [keys[1]]);
  assert.equal((await graph.metrics([keys[1]], new AbortController().signal)).get(keys[1])?.score, 0.6);
  assert.equal(graph.updatedAt(), 123); assert.deepEqual(listSavedGraphs(), []);
  identity = keys[2];
  await assert.rejects(graph.follows(keys[0], new AbortController().signal), /account changed/);
  await assert.rejects(connectGraphExtension(), /extensionMissing/);
  await assert.rejects(connectGraphExtension({ getPublicKey: async () => "invalid" }), /extensionInvalid/);
  const remote = new ExtensionGraphSource(keys[0], { ...provider, getPublicKey: async () => keys[0], wot: { ...provider.wot, getStatus: async () => ({ mode: "remote" }) } });
  await assert.rejects(remote.ready, /Local mode/);
});


test("inventory recovery retains sync metadata stored inside the graph database", async () => {
  const graph = new LocalGraphSource(keys[0], transport([event(0, [keys[1]])]));
  await graph.follows(keys[0], new AbortController().signal);
  const saved = listSavedGraphs()[0];
  await graph.close();
  localStorage.clear();
  assert.deepEqual(await discoverSavedGraphs(), [saved]);
  await deleteSavedGraph(keys[0]);
});


test("reset during an initial crawl retries missing data instead of caching a false empty graph", async () => {
  let calls = 0;
  let started!: () => void;
  const waiting = new Promise<void>(resolve => { started = resolve; });
  const pool: CrawlPool = { subscribe(_filter, handlers) {
    calls++;
    if (calls === 1) started();
    else queueMicrotask(() => { handlers.onEvent({ ...event(0, [keys[1]]) }); handlers.onEose?.(); });
    return { close() {} };
  } };
  const graph = new LocalGraphSource(keys[0], pool), abort = new AbortController();
  const initial = graph.follows(keys[0], abort.signal);
  const rejected = assert.rejects(initial, { name: "AbortError" });
  await waiting; abort.abort();
  const next = graph.follows(keys[0], new AbortController().signal);
  await rejected;
  assert.deepEqual(await next, [keys[1]]);
  assert.equal(calls, 2);
  await graph.close();
});


test("a crashed sync retains its last attempt and the preceding successful sync time", async () => {
  const first = new LocalGraphSource(keys[0], transport([event(0, [keys[1]])]));
  await first.follows(keys[0], new AbortController().signal);
  const saved = listSavedGraphs()[0];
  await first.close();
  saveGraphRecord({ ...saved, status: "syncing", lastAttempt: saved.lastAttempt! + 100 });
  const next = new LocalGraphSource(keys[0], transport([]));
  await next.ready;
  const recovered = listSavedGraphs()[0];
  assert.equal(recovered.status, "stopped"); assert.equal(recovered.lastAttempt, saved.lastAttempt! + 100);
  assert.equal(recovered.lastSync, saved.lastSync); assert.equal(recovered.durationMs, null);
  await next.close();
});
