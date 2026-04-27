"use client";

import { type Event } from "nostr-tools";
import { createKeyedObservable } from "./keyed-observable";
import { DEFAULT_RELAYS, getPool } from "./pool";
import { singleFlight } from "./inflight";
import { _noteStore, type NoteEntry } from "./note-cache";
import { relaysForAuthorSync, getRelayList } from "./relay-list-cache";

export type AuthorNotesEntry = {
  pubkey: string;
  noteIds: string[];
  oldestCreatedAt: number | null;
  fetchedAt: number;
};

const TIMEOUT = 4000;
const PAGE_SIZE = 20;

const store = createKeyedObservable<string, AuthorNotesEntry>();
const noteStore = _noteStore();

export function _authorNotesStore() {
  return store;
}

function toNoteEntry(e: Event): NoteEntry {
  return { id: e.id, pubkey: e.pubkey, content: e.content, createdAt: e.created_at, tags: e.tags };
}

function fetchPage(pubkey: string, until: number | undefined, limit: number, relays: string[]): Promise<NoteEntry[]> {
  return new Promise((resolve) => {
    const collected = new Map<string, NoteEntry>();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      try { sub.close(); } catch { /* noop */ }
      const sorted = [...collected.values()].sort((a, b) => b.createdAt - a.createdAt);
      resolve(sorted.slice(0, limit));
    };

    const filter = {
      kinds: [1],
      authors: [pubkey],
      limit,
      ...(until !== undefined ? { until } : {}),
    };

    const sub = getPool().subscribeMany(relays, filter, {
      onevent(event) {
        if (settled || collected.has(event.id)) return;
        const entry = toNoteEntry(event);
        collected.set(event.id, entry);
        // Push individual notes into the per-id store so /notes/{id}
        // pages and reply previews share the same cached data.
        noteStore.set(event.id, entry);
      },
      oneose() {
        // EOSE from one relay isn't enough; let timeout handle the cap.
      },
    });

    setTimeout(finish, TIMEOUT);
  });
}

export async function getAuthorNotes(pubkey: string, limit = PAGE_SIZE): Promise<AuthorNotesEntry> {
  const cached = store.get(pubkey).value;
  if (cached && cached.noteIds.length >= limit) return cached;

  // Kick NIP-65 lookup so subsequent pagination uses the author's outbox
  void getRelayList(pubkey).catch(() => null);

  store.setStatus(pubkey, "loading");
  return singleFlight(`author-notes:${pubkey}:${limit}`, async () => {
    const relays = relaysForAuthorSync(pubkey);
    const notes = await fetchPage(pubkey, undefined, limit, relays);
    const entry: AuthorNotesEntry = {
      pubkey,
      noteIds: notes.map((n) => n.id),
      oldestCreatedAt: notes.length > 0 ? notes[notes.length - 1]!.createdAt : null,
      fetchedAt: Date.now(),
    };
    store.set(pubkey, entry);
    return entry;
  });
}

export async function loadMoreAuthorNotes(pubkey: string, count = PAGE_SIZE): Promise<AuthorNotesEntry> {
  const current = store.get(pubkey).value;
  if (!current || current.oldestCreatedAt === null) return getAuthorNotes(pubkey, count);

  return singleFlight(`author-notes-more:${pubkey}:${current.oldestCreatedAt}`, async () => {
    const relays = relaysForAuthorSync(pubkey);
    const more = await fetchPage(pubkey, current.oldestCreatedAt! - 1, count, relays);
    const merged = [...new Set([...current.noteIds, ...more.map((n) => n.id)])];
    const entry: AuthorNotesEntry = {
      pubkey,
      noteIds: merged,
      oldestCreatedAt: more.length > 0 ? more[more.length - 1]!.createdAt : current.oldestCreatedAt,
      fetchedAt: Date.now(),
    };
    store.set(pubkey, entry);
    return entry;
  });
}
