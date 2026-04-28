import { LRUCache } from "lru-cache";

/**
 * Server-side LRU caches for SSR fetchers. The SDK's data layer caches
 * within a process via keyed observables, but those have aggressive TTLs
 * and reset on cold lambda invocations. This layer keeps a longer hot
 * window so navigating back to a recently viewed profile/note is instant.
 *
 * Single-instance pm2 deploy: every request shares the same LRU.
 * Serverless: each warm container shares its own copy — still much
 * faster than always going to relays.
 */

type Wrapped<V> = { v: V };

const PROFILE_TTL_MS = 10 * 60_000; // 10 min
const PROFILE_MAX = 5000;

const NOTE_TTL_MS = 30 * 60_000; // 30 min — note content is immutable
const NOTE_MAX = 2000;

const profileCache = new LRUCache<string, Wrapped<unknown>>({
  max: PROFILE_MAX,
  ttl: PROFILE_TTL_MS,
});

const noteCache = new LRUCache<string, Wrapped<unknown>>({
  max: NOTE_MAX,
  ttl: NOTE_TTL_MS,
});

/**
 * Memoize an SSR fetch by key. Negative results (null/undefined/empty
 * arrays) are NOT cached so cold-relay misses retry on the next request
 * instead of being stuck for the full TTL.
 */
async function memoize<T>(
  cache: LRUCache<string, Wrapped<unknown>>,
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = cache.get(key);
  if (hit) return hit.v as T;
  const fresh = await fn();
  if (fresh !== null && fresh !== undefined) {
    cache.set(key, { v: fresh });
  }
  return fresh;
}

export function memoizeProfile<T>(key: string, fn: () => Promise<T>): Promise<T> {
  return memoize(profileCache, key, fn);
}

export function memoizeNote<T>(key: string, fn: () => Promise<T>): Promise<T> {
  return memoize(noteCache, key, fn);
}

export function cacheStats(): {
  profile: { size: number; max: number };
  note: { size: number; max: number };
} {
  return {
    profile: { size: profileCache.size, max: PROFILE_MAX },
    note: { size: noteCache.size, max: NOTE_MAX },
  };
}
