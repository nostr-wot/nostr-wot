"use client";

import { type Event } from "nostr-tools";
import { createKeyedObservable } from "./keyed-observable";
import { DEFAULT_RELAYS, getPool } from "./pool";
import { singleFlight } from "./inflight";
import { _noteStore, type NoteEntry } from "./note-cache";
import { _profileStore } from "./profile-cache";
import { fetchEngagementBatch } from "./engagement-cache";

export type ThreadEntry = {
  rootId: string;
  replyIds: string[];
  fetchedAt: number;
};

const TIMEOUT = 5000;

const store = createKeyedObservable<string, ThreadEntry>();
const noteStore = _noteStore();

export function _threadStore() {
  return store;
}

function fetchOnce(rootId: string): Promise<NoteEntry[]> {
  return new Promise((resolve) => {
    const collected = new Map<string, NoteEntry>();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      try { sub.close(); } catch { /* noop */ }
      resolve([...collected.values()].sort((a, b) => a.createdAt - b.createdAt));
    };

    const sub = getPool().subscribeMany(DEFAULT_RELAYS, { kinds: [1], "#e": [rootId] }, {
      onevent(event) {
        if (collected.has(event.id)) return;
        const entry: NoteEntry = {
          id: event.id,
          pubkey: event.pubkey,
          content: event.content,
          createdAt: event.created_at,
          tags: event.tags,
        };
        collected.set(event.id, entry);
        noteStore.set(event.id, entry);
      },
      oneose: () => finish(),
    });

    setTimeout(finish, TIMEOUT);
  });
}

export async function getThread(rootId: string): Promise<ThreadEntry> {
  const cached = store.get(rootId).value;
  if (cached) return cached;

  store.setStatus(rootId, "loading");
  return singleFlight(`thread:${rootId}`, async () => {
    const replies = await fetchOnce(rootId);
    const entry: ThreadEntry = {
      rootId,
      replyIds: replies.map((r) => r.id),
      fetchedAt: Date.now(),
    };
    store.set(rootId, entry);

    if (replies.length > 0) {
      // Kick engagement for the visible replies + their authors' profiles
      void fetchEngagementBatch(replies.map((r) => r.id));
      const profileStore = _profileStore();
      const missingAuthors = [...new Set(replies.map((r) => r.pubkey))].filter(
        (p) => !profileStore.get(p).value,
      );
      if (missingAuthors.length > 0) {
        // Lazy import to avoid a cycle: profile-cache imports thread? no it doesn't, but
        // explicit dynamic import keeps this list lean.
        const { getProfile } = await import("./profile-cache");
        for (const p of missingAuthors) void getProfile(p).catch(() => null);
      }
    }

    return entry;
  });
}
