"use client";

import { SimplePool } from "nostr-tools";

let _pool: SimplePool | null = null;

export function getPool(): SimplePool {
  if (!_pool) _pool = new SimplePool();
  return _pool;
}

export const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.primal.net",
];

export const PROFILE_AGGREGATORS = ["wss://purplepag.es"];
