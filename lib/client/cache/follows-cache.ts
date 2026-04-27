"use client";

import { type Event } from "nostr-tools";
import { createKeyedObservable } from "./keyed-observable";
import { DEFAULT_RELAYS, getPool } from "./pool";
import { singleFlight } from "./inflight";
import { readPersisted, writePersisted } from "./persistence";
import { relaysForAuthorSync, getRelayList } from "./relay-list-cache";

export type FollowsEntry = {
  pubkey: string;
  follows: string[];
  fetchedAt: number;
};

const TIMEOUT = 4000;
const BUCKET = "follows";

const store = createKeyedObservable<string, FollowsEntry>();

export function _followsStore() {
  return store;
}

function fetchOnce(pubkey: string, relays: string[]): Promise<FollowsEntry | null> {
  return new Promise((resolve) => {
    let newest: Event | null = null;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      try { sub.close(); } catch { /* noop */ }
      if (!newest) {
        resolve(null);
        return;
      }
      const event = newest as Event;
      resolve({
        pubkey: event.pubkey,
        follows: [...new Set(event.tags.filter((t) => t[0] === "p" && t[1]).map((t) => t[1]!))],
        fetchedAt: Date.now(),
      });
    };

    const sub = getPool().subscribeMany(relays, { kinds: [3], authors: [pubkey] }, {
      onevent(event) {
        if (!newest || event.created_at > newest.created_at) newest = event;
      },
      oneose: () => finish(),
    });

    setTimeout(finish, TIMEOUT);
  });
}

export async function getFollows(pubkey: string): Promise<FollowsEntry | null> {
  const slot = store.get(pubkey);
  if (slot.value) return slot.value;

  const persisted = readPersisted<FollowsEntry>(BUCKET, pubkey);
  if (persisted) {
    store.set(pubkey, persisted);
    void singleFlight(`${BUCKET}:${pubkey}`, async () => {
      void getRelayList(pubkey).catch(() => null);
      const fresh = await fetchOnce(pubkey, relaysForAuthorSync(pubkey));
      if (fresh) {
        store.set(pubkey, fresh);
        writePersisted(BUCKET, pubkey, fresh);
      }
      return fresh;
    });
    return persisted;
  }

  store.setStatus(pubkey, "loading");
  return singleFlight(`${BUCKET}:${pubkey}`, async () => {
    void getRelayList(pubkey).catch(() => null);
    const fresh = await fetchOnce(pubkey, relaysForAuthorSync(pubkey));
    if (fresh) {
      store.set(pubkey, fresh);
      writePersisted(BUCKET, pubkey, fresh);
    } else {
      store.setStatus(pubkey, "error");
    }
    return fresh;
  });
}
