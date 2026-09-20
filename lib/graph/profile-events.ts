import { verifyEvent, type Event } from "nostr-tools";
import type { NodeProfile } from "./types";

/** Select replaceable events by NIP-01 ordering, never relay arrival order. */
export function selectProfileEvent(
  current: Event | null,
  incoming: Event,
  pubkey: string,
  kind: 0 | 3
): Event | null {
  if (incoming.pubkey !== pubkey || incoming.kind !== kind || !verifyEvent(incoming)) return current;
  if (!current || incoming.created_at > current.created_at ||
    (incoming.created_at === current.created_at && incoming.id < current.id)) return incoming;
  return current;
}

export function profileFromEvent(event: Event): NodeProfile | null {
  try {
    const content: unknown = JSON.parse(event.content);
    if (!content || typeof content !== "object" || Array.isArray(content)) return null;
    const metadata = content as Record<string, unknown>;
    const field = (key: string) => typeof metadata[key] === "string" ? metadata[key] as string : undefined;
    return {
      pubkey: event.pubkey,
      name: field("name"),
      displayName: field("display_name"),
      picture: field("picture"),
      about: field("about"),
      nip05: field("nip05"),
    };
  } catch {
    return null;
  }
}

export function followingCountFromEvent(event: Event): number {
  return new Set(event.tags
    .filter(([tag, value]) => tag === "p" && /^[0-9a-f]{64}$/.test(value ?? ""))
    .map(([, value]) => value)).size;
}
