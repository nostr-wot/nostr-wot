import { isPubkey } from "./oracle";
export const DATABASE_PREFIX = "nostr-wot-graph:playground-v1:";
const REGISTRY_PREFIX = "wot-playground:database:";
export const DATABASE_CHANGE = "wot-playground:databases";
export type SavedGraph = {
  pubkey: string; createdAt: number; updatedAt: number; lastAttempt: number | null;
  lastSync: number | null; durationMs: number | null; nodes: number; edges: number;
  maxHops: number; status: "new" | "syncing" | "ready" | "partial" | "stopped" | "error";
};
export const namespaceFor = (pubkey: string) => {
  if (!isPubkey(pubkey)) throw new Error("Invalid public key");
  return `playground-v1:${pubkey}`;
};
export function listSavedGraphs(): SavedGraph[] {
  const records: SavedGraph[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (!key.startsWith(REGISTRY_PREFIX)) continue;
    try {
      const item = JSON.parse(localStorage.getItem(key)!);
      if (isPubkey(item.pubkey) && key === REGISTRY_PREFIX + item.pubkey &&
        ["new", "syncing", "ready", "partial", "stopped", "error"].includes(item.status) &&
        [item.createdAt, item.updatedAt, item.nodes, item.edges].every(value => Number.isFinite(value) && value >= 0) &&
        [item.lastAttempt, item.lastSync, item.durationMs].every(value => value === null || Number.isFinite(value) && value >= 0) &&
        [1, 2, 3].includes(item.maxHops)) records.push(item);
    } catch { /* Ignore unrelated or malformed entries. */ }
  }
  return records.sort((a, b) => b.updatedAt - a.updatedAt);
}
export function saveGraphRecord(item: SavedGraph): void {
  namespaceFor(item.pubkey);
  localStorage.setItem(REGISTRY_PREFIX + item.pubkey, JSON.stringify(item));
  window.dispatchEvent(new Event(DATABASE_CHANGE));
}
export function registerGraph(pubkey: string): SavedGraph {
  namespaceFor(pubkey);
  const existing = listSavedGraphs().find(item => item.pubkey === pubkey);
  if (existing) return existing;
  const item: SavedGraph = { pubkey, createdAt: Date.now(), updatedAt: Date.now(), lastAttempt: null,
    lastSync: null, durationMs: null, nodes: 0, edges: 0, maxHops: 1, status: "new" };
  saveGraphRecord(item);
  return item;
}
async function savedMetadata(name: string): Promise<SavedGraph | null | undefined> {
  return new Promise(resolve => {
    const request = indexedDB.open(name);
    // A concurrent deletion must not recreate an empty database during discovery.
    request.onupgradeneeded = () => request.transaction?.abort();
    request.onerror = () => resolve(undefined);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("meta")) { db.close(); resolve(null); return; }
      const tx = db.transaction("meta", "readonly");
      const read = tx.objectStore("meta").get("playground");
      tx.oncomplete = () => { const record = read.result?.value ?? null; db.close(); resolve(record); };
      tx.onerror = tx.onabort = () => { db.close(); resolve(null); };
    };
  });
}
/** Recover this app's namespaces if its inventory was cleared separately from IndexedDB. */
export async function discoverSavedGraphs(): Promise<SavedGraph[]> {
  if (typeof indexedDB.databases === "function") {
    for (const db of await indexedDB.databases()) {
      if (db.name?.startsWith(DATABASE_PREFIX)) {
        const pubkey = db.name.slice(DATABASE_PREFIX.length);
        if (isPubkey(pubkey) && !listSavedGraphs().some(item => item.pubkey === pubkey)) {
          const record = await savedMetadata(db.name);
          if (record === undefined) continue;
          if (record?.pubkey === pubkey) saveGraphRecord(record);
          else registerGraph(pubkey);
        }
      }
    }
  }
  return listSavedGraphs();
}
export async function withDatabaseLock<T>(pubkey: string, work: () => Promise<T>): Promise<T> {
  const name = DATABASE_PREFIX + namespaceFor(pubkey).split(":").pop();
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request(name, { ifAvailable: true }, async lock => {
      if (!lock) throw new Error("This graph is open in another tab. Close it there and try again.");
      return work();
    });
  }
  return work();
}
/** Call only after closing this tab's graph session. Never delete other app/extension databases. */
export async function deleteSavedGraph(pubkey: string): Promise<void> {
  namespaceFor(pubkey);
  await withDatabaseLock(pubkey, () => new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DATABASE_PREFIX + pubkey);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Close other tabs using this graph, then try again."));
    request.onsuccess = () => {
      localStorage.removeItem(REGISTRY_PREFIX + pubkey);
      window.dispatchEvent(new Event(DATABASE_CHANGE));
      resolve();
    };
  }));
}
