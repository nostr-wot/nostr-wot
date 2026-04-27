"use client";

import { type Event } from "nostr-tools";
import { createKeyedObservable } from "./keyed-observable";
import { DEFAULT_RELAYS, getPool } from "./pool";
import { singleFlight } from "./inflight";
import { readPersisted, writePersisted } from "./persistence";

export type RelayListEntry = {
  pubkey: string;
  read: string[];
  write: string[];
  fetchedAt: number;
};

const TIMEOUT = 4000;
const BUCKET = "relay-list";

const store = createKeyedObservable<string, RelayListEntry>();

export function _relayListStore() {
  return store;
}

function parseRelayList(event: Event): RelayListEntry {
  const read = new Set<string>();
  const write = new Set<string>();
  for (const tag of event.tags) {
    if (tag[0] !== "r" || !tag[1]?.startsWith("ws")) continue;
    const url = tag[1];
    const marker = tag[2];
    if (!marker) {
      read.add(url);
      write.add(url);
    } else if (marker === "read") {
      read.add(url);
    } else if (marker === "write") {
      write.add(url);
    }
  }
  return {
    pubkey: event.pubkey,
    read: [...read],
    write: [...write],
    fetchedAt: Date.now(),
  };
}

function fetchOnce(pubkey: string): Promise<RelayListEntry | null> {
  return new Promise((resolve) => {
    let newest: Event | null = null;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      try { sub.close(); } catch { /* noop */ }
      resolve(newest ? parseRelayList(newest) : null);
    };

    const sub = getPool().subscribeMany(DEFAULT_RELAYS, { kinds: [10002], authors: [pubkey] }, {
      onevent(event) {
        if (!newest || event.created_at > newest.created_at) newest = event;
      },
      oneose: () => finish(),
    });

    setTimeout(finish, TIMEOUT);
  });
}

export async function getRelayList(pubkey: string): Promise<RelayListEntry | null> {
  const slot = store.get(pubkey);
  if (slot.value) return slot.value;

  const persisted = readPersisted<RelayListEntry>(BUCKET, pubkey);
  if (persisted) {
    store.set(pubkey, persisted);
    // refresh in background but return cached immediately
    void singleFlight(`${BUCKET}:${pubkey}`, async () => {
      const fresh = await fetchOnce(pubkey);
      if (fresh) {
        store.set(pubkey, fresh);
        writePersisted(BUCKET, pubkey, fresh);
      }
      return fresh;
    });
    return persisted;
  }

  store.setStatus(pubkey, "loading");
  const fresh = await singleFlight(`${BUCKET}:${pubkey}`, () => fetchOnce(pubkey));
  if (fresh) {
    store.set(pubkey, fresh);
    writePersisted(BUCKET, pubkey, fresh);
  } else {
    store.setStatus(pubkey, "error");
  }
  return fresh;
}

/**
 * Outbox-model relay union. For a given author, return the relays where
 * their events are likely to be found: their declared write relays + our
 * defaults. Falls back to defaults if NIP-65 isn't published.
 */
export async function relaysForAuthor(pubkey: string): Promise<string[]> {
  const list = await getRelayList(pubkey);
  if (!list || list.write.length === 0) return DEFAULT_RELAYS;
  return [...new Set([...list.write, ...DEFAULT_RELAYS])];
}

/**
 * Sync version — returns whatever is cached without hitting the network.
 * Use this in fast paths; kick getRelayList in the background to populate
 * the cache for next time.
 */
export function relaysForAuthorSync(pubkey: string): string[] {
  const slot = store.get(pubkey);
  if (slot.value && slot.value.write.length > 0) {
    return [...new Set([...slot.value.write, ...DEFAULT_RELAYS])];
  }
  return DEFAULT_RELAYS;
}
