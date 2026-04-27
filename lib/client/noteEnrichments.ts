"use client";

import { SimplePool, nip19, type Event } from "nostr-tools";

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

const TIMEOUT = 3500;

let pool: SimplePool | null = null;
function getPool(): SimplePool {
  if (!pool) pool = new SimplePool();
  return pool;
}

function withTimeout<T>(p: Promise<T>, fallback: T, ms = TIMEOUT): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export type ParentRef = {
  id: string;
  pubkey: string;
  nevent: string;
  authorName: string;
  preview: string;
};

const TEXT_PREVIEW_MAX = 90;

function neventOf(event: Event): string {
  return nip19.neventEncode({ id: event.id, author: event.pubkey, kind: event.kind });
}

function pickPreview(content: string): string {
  const flat = content.replace(/https?:\/\/\S+/g, "[link]").replace(/\s+/g, " ").trim();
  return flat.length <= TEXT_PREVIEW_MAX ? flat : `${flat.slice(0, TEXT_PREVIEW_MAX - 1).trimEnd()}…`;
}

function findReplyParentId(tags: string[][]): string | null {
  const eTags = tags.filter((t) => t[0] === "e");
  if (eTags.length === 0) return null;
  const reply = eTags.find((t) => t[3] === "reply");
  const root = eTags.find((t) => t[3] === "root");
  return (reply ?? root ?? eTags[eTags.length - 1])?.[1] ?? null;
}

export async function fetchReactionCounts(noteIds: string[]): Promise<Record<string, number>> {
  if (noteIds.length === 0) return {};
  const events = await withTimeout(
    getPool().querySync(RELAYS, { kinds: [7], "#e": noteIds }),
    [] as Event[],
  );
  const counts: Record<string, number> = {};
  for (const id of noteIds) counts[id] = 0;
  for (const e of events) {
    if (e.content === "-") continue;
    const eTag = e.tags.find((t) => t[0] === "e" && t[1] && noteIds.includes(t[1]));
    if (eTag?.[1]) counts[eTag[1]] = (counts[eTag[1]] ?? 0) + 1;
  }
  return counts;
}

export async function fetchReplyParents(notes: { id: string; tags: string[][] }[]): Promise<Record<string, ParentRef>> {
  const wanted: { childId: string; parentId: string }[] = [];
  for (const n of notes) {
    const pid = findReplyParentId(n.tags);
    if (pid) wanted.push({ childId: n.id, parentId: pid });
  }
  if (wanted.length === 0) return {};

  const parentIds = [...new Set(wanted.map((w) => w.parentId))];
  const parentEvents = await withTimeout(
    getPool().querySync(RELAYS, { ids: parentIds }),
    [] as Event[],
  );
  if (parentEvents.length === 0) return {};

  const authorPubkeys = [...new Set(parentEvents.map((e) => e.pubkey))];
  const profileEvents = await withTimeout(
    getPool().querySync(RELAYS, { kinds: [0], authors: authorPubkeys }),
    [] as Event[],
  );

  const nameByPubkey: Record<string, string> = {};
  for (const e of profileEvents) {
    try {
      const m = JSON.parse(e.content) as { display_name?: string; name?: string };
      const n = (m.display_name || m.name || "").trim();
      if (n) nameByPubkey[e.pubkey] = n;
    } catch {
      // skip
    }
  }

  const parentById = new Map<string, Event>();
  for (const e of parentEvents) parentById.set(e.id, e);

  const out: Record<string, ParentRef> = {};
  for (const { childId, parentId } of wanted) {
    const parent = parentById.get(parentId);
    if (!parent) continue;
    out[childId] = {
      id: parent.id,
      pubkey: parent.pubkey,
      nevent: neventOf(parent),
      authorName: nameByPubkey[parent.pubkey] || `${parent.pubkey.slice(0, 12)}…`,
      preview: pickPreview(parent.content),
    };
  }
  return out;
}
