"use client";

import { SimplePool, nip19, type Event } from "nostr-tools";

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.primal.net",
];

const TIMEOUT = 5000;

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

export type ThreadAuthor = {
  pubkey: string;
  displayName: string | null;
  name: string | null;
  picture: string | null;
  nip05: string | null;
};

export type ThreadReply = {
  id: string;
  nevent: string;
  pubkey: string;
  content: string;
  createdAt: number;
  reactionCount: number;
  author: ThreadAuthor | null;
};

export type ThreadResult = {
  replies: ThreadReply[];
  totalReactions: number;
};

function neventOf(event: Event): string {
  return nip19.neventEncode({ id: event.id, author: event.pubkey, kind: event.kind });
}

export async function fetchThread(rootId: string): Promise<ThreadResult> {
  const replyEvents = await withTimeout(
    getPool().querySync(RELAYS, { kinds: [1], "#e": [rootId] }),
    [] as Event[],
  );

  if (replyEvents.length === 0) {
    return { replies: [], totalReactions: 0 };
  }

  const sorted = replyEvents.sort((a, b) => a.created_at - b.created_at);
  const ids = sorted.map((e) => e.id);
  const authors = [...new Set(sorted.map((e) => e.pubkey))];

  const [reactions, profiles] = await Promise.all([
    withTimeout(
      getPool().querySync(RELAYS, { kinds: [7], "#e": ids }),
      [] as Event[],
    ),
    withTimeout(
      getPool().querySync(RELAYS, { kinds: [0], authors }),
      [] as Event[],
    ),
  ]);

  const reactionByNote: Record<string, number> = {};
  for (const r of reactions) {
    if (r.content === "-") continue;
    const eTag = r.tags.find((t) => t[0] === "e" && t[1] && ids.includes(t[1]));
    if (eTag?.[1]) reactionByNote[eTag[1]] = (reactionByNote[eTag[1]] ?? 0) + 1;
  }

  const profileByPubkey = new Map<string, ThreadAuthor>();
  for (const p of profiles) {
    try {
      const m = JSON.parse(p.content) as Record<string, unknown>;
      const str = (v: unknown): string | null =>
        typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
      profileByPubkey.set(p.pubkey, {
        pubkey: p.pubkey,
        displayName: str(m.display_name),
        name: str(m.name),
        picture: str(m.picture),
        nip05: str(m.nip05),
      });
    } catch {
      // skip
    }
  }

  const replies: ThreadReply[] = sorted.map((e) => ({
    id: e.id,
    nevent: neventOf(e),
    pubkey: e.pubkey,
    content: e.content,
    createdAt: e.created_at,
    reactionCount: reactionByNote[e.id] ?? 0,
    author: profileByPubkey.get(e.pubkey) ?? null,
  }));

  const totalReactions = Object.values(reactionByNote).reduce((a, b) => a + b, 0);
  return { replies, totalReactions };
}
