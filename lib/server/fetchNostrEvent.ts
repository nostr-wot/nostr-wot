import { nip19, type Event } from "nostr-tools";
import { fetchNote, fetchProfile, findReplyParentId } from "@nostr-wot/data";

/**
 * Server-side wrappers around @nostr-wot/data fetchers — both already do
 * first-event-wins relay subscription, NIP-65 outbox routing for kind 0,
 * and use the shared SimplePool. We just adapt the shape to what the SSR
 * page components expect.
 */

export type ServerNostrEvent = {
  id: string;
  nevent: string;
  pubkey: string;
  content: string;
  createdAt: number;
  tags: string[][];
  parent: { id: string; pubkey: string | null } | null;
};

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

export function buildNeventFromEvent(event: Pick<Event, "id" | "pubkey" | "kind">): string {
  return nip19.neventEncode({
    id: event.id,
    author: event.pubkey,
    kind: event.kind,
  });
}

function findReplyParentWithPubkey(tags: string[][]): { id: string; pubkey: string | null } | null {
  const id = findReplyParentId(tags);
  if (!id) return null;
  const pTags = tags.filter((t) => t[0] === "p");
  const lastP = pTags[pTags.length - 1];
  return { id, pubkey: lastP?.[1] ?? null };
}

export async function fetchNostrEventById(input: string): Promise<ServerNostrEvent | null> {
  const decoded = decodeNoteId(input);
  if (!decoded) return null;

  const note = await fetchNote(decoded.hex, decoded.relays);
  if (!note) return null;

  return {
    id: note.id,
    nevent: buildNeventFromEvent({ id: note.id, pubkey: note.pubkey, kind: 1 }),
    pubkey: note.pubkey,
    content: note.content,
    createdAt: note.createdAt,
    tags: note.tags,
    parent: findReplyParentWithPubkey(note.tags),
  };
}

export async function fetchNoteAuthorMetadata(pubkey: string): Promise<{
  pubkey: string;
  displayName: string | null;
  name: string | null;
  picture: string | null;
  nip05: string | null;
} | null> {
  const profile = await fetchProfile(pubkey);
  if (!profile) {
    return { pubkey, displayName: null, name: null, picture: null, nip05: null };
  }
  return {
    pubkey: profile.pubkey,
    displayName: profile.displayName,
    name: profile.name,
    picture: profile.picture,
    nip05: profile.nip05,
  };
}
