import { SimplePool } from "nostr-tools";
import { npubToHex } from "@/lib/graph/transformers";

export type ServerProfileMetadata = {
  pubkey: string;
  npub: string;
  displayName: string | null;
  name: string | null;
  nip05: string | null;
  picture: string | null;
  banner: string | null;
  about: string | null;
  website: string | null;
  lud16: string | null;
  followCount: number | null;
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

export async function fetchNostrProfileMetadata(
  pubkeyOrNpub: string,
): Promise<ServerProfileMetadata | null> {
  const hex = npubToHex(pubkeyOrNpub);
  if (hex === pubkeyOrNpub && !/^[a-f0-9]{64}$/i.test(hex)) return null;
  const npub = pubkeyOrNpub.startsWith("npub") ? pubkeyOrNpub : "";

  const [meta, follows] = await Promise.all([
    withTimeout(
      getPool().querySync(RELAYS, { kinds: [0], authors: [hex] }),
      [],
    ),
    withTimeout(
      getPool().querySync(RELAYS, { kinds: [3], authors: [hex] }),
      [],
    ),
  ]);

  const newest = meta.reduce<(typeof meta)[number] | null>(
    (acc, e) => (!acc || e.created_at > acc.created_at ? e : acc),
    null,
  );

  let parsed: Record<string, unknown> = {};
  if (newest) {
    try {
      parsed = JSON.parse(newest.content) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }

  const followsEvent = follows.reduce<(typeof follows)[number] | null>(
    (acc, e) => (!acc || e.created_at > acc.created_at ? e : acc),
    null,
  );
  const followCount =
    followsEvent !== null
      ? followsEvent.tags.filter((t) => t[0] === "p").length
      : null;

  const stringOrNull = (v: unknown): string | null =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

  return {
    pubkey: hex,
    npub,
    displayName: stringOrNull(parsed.display_name),
    name: stringOrNull(parsed.name),
    nip05: stringOrNull(parsed.nip05),
    picture: stringOrNull(parsed.picture),
    banner: stringOrNull(parsed.banner),
    about: stringOrNull(parsed.about),
    website: stringOrNull(parsed.website),
    lud16: stringOrNull(parsed.lud16),
    followCount,
  };
}
