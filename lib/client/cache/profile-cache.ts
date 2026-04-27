"use client";

import { type Event } from "nostr-tools";
import { createKeyedObservable } from "./keyed-observable";
import { DEFAULT_RELAYS, getPool, PROFILE_AGGREGATORS } from "./pool";
import { singleFlight } from "./inflight";
import { readPersisted, writePersisted } from "./persistence";
import { getRelayList } from "./relay-list-cache";

export type ProfileEntry = {
  pubkey: string;
  displayName: string | null;
  name: string | null;
  picture: string | null;
  banner: string | null;
  about: string | null;
  nip05: string | null;
  lud16: string | null;
  fetchedAt: number;
};

const TIMEOUT = 4000;
const BUCKET = "profile";

const store = createKeyedObservable<string, ProfileEntry>({
  equal: (a, b) =>
    a.pubkey === b.pubkey &&
    a.displayName === b.displayName &&
    a.name === b.name &&
    a.picture === b.picture &&
    a.banner === b.banner &&
    a.about === b.about &&
    a.nip05 === b.nip05 &&
    a.lud16 === b.lud16,
});

export function _profileStore() {
  return store;
}

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

function parseKind0(event: Event): ProfileEntry {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(event.content) as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  return {
    pubkey: event.pubkey,
    displayName: str(parsed.display_name),
    name: str(parsed.name),
    picture: str(parsed.picture),
    banner: str(parsed.banner),
    about: str(parsed.about),
    nip05: str(parsed.nip05),
    lud16: str(parsed.lud16),
    fetchedAt: Date.now(),
  };
}

function fetchOnce(pubkey: string, relays: string[]): Promise<ProfileEntry | null> {
  return new Promise((resolve) => {
    let newest: Event | null = null;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      try { sub.close(); } catch { /* noop */ }
      resolve(newest ? parseKind0(newest) : null);
    };

    const sub = getPool().subscribeMany(relays, { kinds: [0], authors: [pubkey] }, {
      onevent(event) {
        if (!newest || event.created_at > newest.created_at) {
          newest = event;
          // Update incrementally so the UI shows the freshest copy as it
          // arrives without waiting for EOSE.
          store.set(pubkey, parseKind0(event));
        }
      },
      oneose: () => finish(),
    });

    setTimeout(finish, TIMEOUT);
  });
}

export async function getProfile(pubkey: string): Promise<ProfileEntry | null> {
  const slot = store.get(pubkey);
  if (slot.value) return slot.value;

  const persisted = readPersisted<ProfileEntry>(BUCKET, pubkey);
  if (persisted) {
    store.set(pubkey, persisted);
    void singleFlight(`${BUCKET}:${pubkey}`, async () => {
      const list = await getRelayList(pubkey).catch(() => null);
      const relays = [...new Set([
        ...PROFILE_AGGREGATORS,
        ...DEFAULT_RELAYS,
        ...(list?.write ?? []),
      ])];
      const fresh = await fetchOnce(pubkey, relays);
      if (fresh) writePersisted(BUCKET, pubkey, fresh);
      return fresh;
    });
    return persisted;
  }

  store.setStatus(pubkey, "loading");
  return singleFlight(`${BUCKET}:${pubkey}`, async () => {
    const list = await getRelayList(pubkey).catch(() => null);
    const relays = [...new Set([
      ...PROFILE_AGGREGATORS,
      ...DEFAULT_RELAYS,
      ...(list?.write ?? []),
    ])];
    const fresh = await fetchOnce(pubkey, relays);
    if (fresh) {
      writePersisted(BUCKET, pubkey, fresh);
    } else {
      store.setStatus(pubkey, "error");
    }
    return fresh;
  });
}
