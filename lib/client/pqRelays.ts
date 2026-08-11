"use client";

/**
 * One relay pool, one set of relay lists.
 *
 * Split out of pqChat so the capability checker can share the pool without a circular
 * import. Before this, the checker opened its own six sockets and never closed them, and
 * the page's relay activity strip — which claims to show what the network is doing —
 * could not see the discovery traffic it was reporting on.
 */

import { SimplePool } from "nostr-tools";

/** Where the chat publishes. Kept small: every one of these gets a copy of every event. */
export const CHAT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
  "wss://relay.snort.social",
];

/**
 * Where attestations are looked up.
 *
 * A superset of CHAT_RELAYS by construction, not by coincidence: anything published by
 * this site must be findable by the checker, and letting the two lists drift apart would
 * make a freshly published attestation look missing.
 */
export const DISCOVERY_RELAYS = [
  ...CHAT_RELAYS,
  "wss://relay.nostr.band",
  "wss://purplepag.es",
];

let pool: SimplePool | null = null;

/** The shared pool. Everything that touches a relay goes through this. */
export function getPool(): SimplePool {
  if (!pool) {
    pool = new SimplePool();
    // Record which relay served each event. Without this the page can say a message
    // arrived but not where from, which is exactly the thing worth being able to check.
    pool.trackRelays = true;
  }
  return pool;
}

/**
 * Which relays accepted a publish.
 *
 * `pool.publish` returns one promise per relay, in order, so a settled result maps back
 * to its relay by index.
 */
export function acceptedFrom(
  results: PromiseSettledResult<unknown>[],
  relays: string[],
): string[] {
  return results
    .map((r, i) => (r.status === "fulfilled" ? relays[i]! : null))
    .filter((url): url is string => url !== null);
}
