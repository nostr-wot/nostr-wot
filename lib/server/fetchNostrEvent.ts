import { SimplePool, nip19, type Event } from "nostr-tools";

export type ServerNostrEvent = {
  id: string;
  nevent: string;
  pubkey: string;
  content: string;
  createdAt: number;
  tags: string[][];
  parent: { id: string; pubkey: string | null } | null;
};

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.primal.net",
];

const TIMEOUT_MS = 4000;

let pool: SimplePool | null = null;
function getPool(): SimplePool {
  if (!pool) pool = new SimplePool();
  return pool;
}

function withTimeout<T>(p: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), TIMEOUT_MS)),
  ]);
}

export type DecodedId =
  | { type: "id"; hex: string; relays: string[]; author: string | null }
  | null;

export function decodeNoteId(input: string): DecodedId {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return { type: "id", hex: trimmed.toLowerCase(), relays: [], author: null };
  }

  try {
    const decoded = nip19.decode(trimmed);
    if (decoded.type === "note") {
      return { type: "id", hex: decoded.data, relays: [], author: null };
    }
    if (decoded.type === "nevent") {
      return {
        type: "id",
        hex: decoded.data.id,
        relays: decoded.data.relays ?? [],
        author: decoded.data.author ?? null,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function buildNeventFromEvent(event: Event): string {
  return nip19.neventEncode({
    id: event.id,
    author: event.pubkey,
    kind: event.kind,
  });
}

function findReplyParent(tags: string[][]): { id: string; pubkey: string | null } | null {
  const eTags = tags.filter((t) => t[0] === "e");
  if (eTags.length === 0) return null;

  const reply = eTags.find((t) => t[3] === "reply");
  const root = eTags.find((t) => t[3] === "root");
  const chosen = reply ?? root ?? eTags[eTags.length - 1];
  if (!chosen || !chosen[1]) return null;

  const pTags = tags.filter((t) => t[0] === "p");
  const lastP = pTags[pTags.length - 1];
  return { id: chosen[1], pubkey: lastP?.[1] ?? null };
}

export async function fetchNostrEventById(input: string): Promise<ServerNostrEvent | null> {
  const decoded = decodeNoteId(input);
  if (!decoded) return null;

  const relays = decoded.relays.length > 0 ? [...new Set([...decoded.relays, ...RELAYS])] : RELAYS;

  const events = await withTimeout(
    getPool().querySync(relays, { ids: [decoded.hex] }),
    [] as Event[],
  );
  const event = events[0];
  if (!event) return null;

  return {
    id: event.id,
    nevent: buildNeventFromEvent(event),
    pubkey: event.pubkey,
    content: event.content,
    createdAt: event.created_at,
    tags: event.tags,
    parent: findReplyParent(event.tags),
  };
}

export async function fetchNoteAuthorMetadata(
  pubkey: string,
): Promise<{ pubkey: string; displayName: string | null; name: string | null; picture: string | null; nip05: string | null } | null> {
  const events = await withTimeout(
    getPool().querySync(RELAYS, { kinds: [0], authors: [pubkey] }),
    [] as Event[],
  );
  const newest = events.reduce<Event | null>(
    (acc, e) => (!acc || e.created_at > acc.created_at ? e : acc),
    null,
  );
  if (!newest) {
    return { pubkey, displayName: null, name: null, picture: null, nip05: null };
  }
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(newest.content) as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  const str = (v: unknown): string | null =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
  return {
    pubkey,
    displayName: str(parsed.display_name),
    name: str(parsed.name),
    picture: str(parsed.picture),
    nip05: str(parsed.nip05),
  };
}
