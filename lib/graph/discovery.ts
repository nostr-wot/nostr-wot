import { verifyEvent, type Event, type SimplePool } from "nostr-tools";
import type { CrawlPool } from "@nostr-wot/graph";
import { isPubkey } from "./oracle";
export const DISCOVERY_RELAYS = ["wss://purplepag.es", "wss://relay.damus.io", "wss://nos.lol"];
export const GRAPH_RELAYS = ["wss://purplepag.es", "wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
export function authorWriteRelays(event: Event | null): string[] {
  if (!event) return [];
  const relays: string[] = [];
  for (const [tag, address, mode] of event.tags) {
    if (tag !== "r" || (mode && mode !== "write")) continue;
    try {
      const url = new URL(address);
      if (url.protocol === "wss:" && !url.username && !url.password) relays.push(url.href.replace(/\/$/, ""));
    } catch { /* Ignore malformed URLs. */ }
  }
  return [...new Set(relays)].slice(0, 4);
}
/** The SDK handles crawling/storage/BFS; this verified transport discovers authors' write relays. */
export function discoveryPool(pool: Pick<SimplePool, "subscribeMany">): CrawlPool {
  const cache = new Map<string, { event: Event | null; at: number }>();
  return { subscribe(filter, handlers) {
    const authors = (filter.authors ?? []).filter(isPubkey);
    const allowed = new Set(authors);
    let closed = false;
    const closers = new Set<() => void>();
    const close = () => { if (closed) return; closed = true; for (const stop of closers) stop(); closers.clear(); };
    const query = (urls: string[], keys: string[], kinds: number[], receive: (event: Event) => void, timeout: number) => new Promise<void>(resolve => {
      if (closed || !keys.length) { resolve(); return; }
      let done = false, sub: { close: () => void } | undefined;
      const finish = () => { if (done) return; done = true; clearTimeout(timer); sub?.close(); closers.delete(finish); resolve(); };
      const timer = setTimeout(finish, timeout); closers.add(finish);
      try {
        sub = pool.subscribeMany(urls, { authors: keys, kinds }, {
          maxWait: timeout, oneose: finish, onclose: finish,
          onevent(event) { if (!closed && !done && keys.includes(event.pubkey) && kinds.includes(event.kind) && verifyEvent(event)) receive(event); },
        });
        if (done) sub.close();
      } catch { finish(); }
    });
    void (async () => {
      const missing = authors.filter(key => !cache.has(key) || Date.now() - cache.get(key)!.at > 600000);
      const latest = new Map<string, Event>();
      await query(DISCOVERY_RELAYS, missing, [10002], event => {
        const prior = latest.get(event.pubkey);
        if (!prior || event.created_at > prior.created_at || event.created_at === prior.created_at && event.id < prior.id) latest.set(event.pubkey, event);
      }, 2000);
      if (closed) return;
      for (const key of missing) cache.set(key, { event: latest.get(key) ?? null, at: Date.now() });
      const groups = new Map<string, string[]>();
      for (const key of authors) for (const url of authorWriteRelays(cache.get(key)?.event ?? null)) {
        if (!GRAPH_RELAYS.includes(url)) groups.set(url, [...(groups.get(url) ?? []), key]);
      }
      const receive = (event: Event) => {
        if (allowed.has(event.pubkey)) handlers.onEvent({ ...event, tags: event.tags.filter(([tag, key]) => tag !== "p" || isPubkey(key)) });
      };
      // Bound relay fanout per author batch; defaults still query every requested author.
      await Promise.all([
        query(GRAPH_RELAYS, authors, [3], receive, 4500),
        ...[...groups].sort((a, b) => b[1].length - a[1].length).slice(0, 8).map(([url, keys]) => query([url], keys, [3], receive, 4500)),
      ]);
      if (!closed) handlers.onEose?.();
    })().catch(() => { if (!closed) handlers.onEose?.(); });
    return { close };
  } };
}
