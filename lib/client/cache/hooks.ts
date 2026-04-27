"use client";

import { useEffect, useSyncExternalStore } from "react";
import { _profileStore, getProfile, type ProfileEntry } from "./profile-cache";
import { _noteStore, getNote, type NoteEntry } from "./note-cache";
import { _authorNotesStore, getAuthorNotes, loadMoreAuthorNotes, type AuthorNotesEntry } from "./notes-by-author-cache";
import { _followsStore, getFollows, type FollowsEntry } from "./follows-cache";
import { _engagementStore, fetchEngagementBatch, getEngagement, type Engagement } from "./engagement-cache";
import { _threadStore, getThread, type ThreadEntry } from "./thread-cache";
import { _relayListStore, getRelayList, type RelayListEntry } from "./relay-list-cache";

export function useProfile(pubkey: string | null): ProfileEntry | null {
  const store = _profileStore();
  useEffect(() => {
    if (pubkey) void getProfile(pubkey).catch(() => null);
  }, [pubkey]);
  return useSyncExternalStore(
    (cb) => (pubkey ? store.subscribe(pubkey, () => cb()) : () => {}),
    () => (pubkey ? store.get(pubkey).value ?? null : null),
    () => null,
  );
}

export function useNote(id: string | null, hintRelays: string[] = []): NoteEntry | null {
  const store = _noteStore();
  useEffect(() => {
    if (id) void getNote(id, hintRelays).catch(() => null);
    // hintRelays intentionally excluded — first call's hints are sufficient
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return useSyncExternalStore(
    (cb) => (id ? store.subscribe(id, () => cb()) : () => {}),
    () => (id ? store.get(id).value ?? null : null),
    () => null,
  );
}

export function useAuthorNotes(pubkey: string | null): {
  entry: AuthorNotesEntry | null;
  loadMore: () => Promise<void>;
  isLoading: boolean;
} {
  const store = _authorNotesStore();
  useEffect(() => {
    if (pubkey) void getAuthorNotes(pubkey).catch(() => null);
  }, [pubkey]);
  const entry = useSyncExternalStore(
    (cb) => (pubkey ? store.subscribe(pubkey, () => cb()) : () => {}),
    () => (pubkey ? store.get(pubkey).value ?? null : null),
    () => null,
  );
  const isLoading = useSyncExternalStore(
    (cb) => (pubkey ? store.subscribe(pubkey, () => cb()) : () => {}),
    () => (pubkey ? store.get(pubkey).status === "loading" : false),
    () => false,
  );
  return {
    entry,
    isLoading,
    loadMore: async () => {
      if (!pubkey) return;
      await loadMoreAuthorNotes(pubkey).catch(() => null);
    },
  };
}

export function useFollows(pubkey: string | null): FollowsEntry | null {
  const store = _followsStore();
  useEffect(() => {
    if (pubkey) void getFollows(pubkey).catch(() => null);
  }, [pubkey]);
  return useSyncExternalStore(
    (cb) => (pubkey ? store.subscribe(pubkey, () => cb()) : () => {}),
    () => (pubkey ? store.get(pubkey).value ?? null : null),
    () => null,
  );
}

export function useEngagement(noteId: string | null): Engagement {
  const store = _engagementStore();
  return useSyncExternalStore(
    (cb) => (noteId ? store.subscribe(noteId, () => cb()) : () => {}),
    () => (noteId ? getEngagement(noteId) : { reactionCount: 0, repostCount: 0, zapTotalSats: 0 }),
    () => ({ reactionCount: 0, repostCount: 0, zapTotalSats: 0 }),
  );
}

/**
 * Hook variant for batch-fetching engagement for a list of note ids.
 * Components rendering a feed call this once with the visible ids; the
 * cache fans out to one observable update per note.
 */
export function useEngagementBatch(noteIds: string[]): void {
  useEffect(() => {
    if (noteIds.length === 0) return;
    void fetchEngagementBatch(noteIds).catch(() => null);
  }, [noteIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useThread(rootId: string | null): ThreadEntry | null {
  const store = _threadStore();
  return useSyncExternalStore(
    (cb) => (rootId ? store.subscribe(rootId, () => cb()) : () => {}),
    () => (rootId ? store.get(rootId).value ?? null : null),
    () => null,
  );
}

export async function loadThread(rootId: string): Promise<void> {
  await getThread(rootId).catch(() => null);
}

export function useRelayList(pubkey: string | null): RelayListEntry | null {
  const store = _relayListStore();
  useEffect(() => {
    if (pubkey) void getRelayList(pubkey).catch(() => null);
  }, [pubkey]);
  return useSyncExternalStore(
    (cb) => (pubkey ? store.subscribe(pubkey, () => cb()) : () => {}),
    () => (pubkey ? store.get(pubkey).value ?? null : null),
    () => null,
  );
}
