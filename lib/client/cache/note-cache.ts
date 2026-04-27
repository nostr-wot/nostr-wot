"use client";

import { type Event } from "nostr-tools";
import { createKeyedObservable } from "./keyed-observable";
import { DEFAULT_RELAYS, getPool } from "./pool";
import { singleFlight } from "./inflight";
import { readPersisted, writePersisted } from "./persistence";

export type NoteEntry = {
  id: string;
  pubkey: string;
  content: string;
  createdAt: number;
  tags: string[][];
};

const TIMEOUT = 4000;
const BUCKET = "note";

const store = createKeyedObservable<string, NoteEntry>();

export function _noteStore() {
  return store;
}

function toEntry(event: Event): NoteEntry {
  return {
    id: event.id,
    pubkey: event.pubkey,
    content: event.content,
    createdAt: event.created_at,
    tags: event.tags,
  };
}

function fetchOnce(id: string, relays: string[]): Promise<NoteEntry | null> {
  return new Promise((resolve) => {
    let result: NoteEntry | null = null;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      try { sub.close(); } catch { /* noop */ }
      resolve(result);
    };

    const sub = getPool().subscribeMany(relays, { ids: [id] }, {
      onevent(event) {
        if (settled) return;
        result = toEntry(event);
        // First event wins for a single-id query (events for same id are
        // by definition identical, modulo signature).
        finish();
      },
      oneose: () => finish(),
    });

    setTimeout(finish, TIMEOUT);
  });
}

export async function getNote(id: string, hintRelays: string[] = []): Promise<NoteEntry | null> {
  const slot = store.get(id);
  if (slot.value) return slot.value;

  const persisted = readPersisted<NoteEntry>(BUCKET, id);
  if (persisted) {
    store.set(id, persisted);
    return persisted;
  }

  store.setStatus(id, "loading");
  return singleFlight(`${BUCKET}:${id}`, async () => {
    const relays = hintRelays.length > 0
      ? [...new Set([...hintRelays, ...DEFAULT_RELAYS])]
      : DEFAULT_RELAYS;
    const fresh = await fetchOnce(id, relays);
    if (fresh) {
      store.set(id, fresh);
      writePersisted(BUCKET, id, fresh);
    } else {
      store.setStatus(id, "error");
    }
    return fresh;
  });
}
