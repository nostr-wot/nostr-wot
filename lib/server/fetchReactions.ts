import { SimplePool, type Event } from "nostr-tools";

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

const TIMEOUT_MS = 3000;

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

export async function fetchReactionCounts(
  noteIds: string[],
): Promise<Record<string, number>> {
  if (noteIds.length === 0) return {};

  const events = await withTimeout(
    getPool().querySync(RELAYS, {
      kinds: [7],
      "#e": noteIds,
    }),
    [] as Event[],
  );

  const counts: Record<string, number> = {};
  for (const id of noteIds) counts[id] = 0;

  for (const event of events) {
    if (event.content === "-") continue;
    const eTag = event.tags.find((t) => t[0] === "e" && t[1] && noteIds.includes(t[1]));
    if (!eTag || !eTag[1]) continue;
    counts[eTag[1]] = (counts[eTag[1]] ?? 0) + 1;
  }
  return counts;
}
