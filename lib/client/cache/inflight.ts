"use client";

/**
 * Single-flight: if N concurrent calls arrive for the same key, share one
 * underlying promise. The teardown (delete from map) happens after the
 * promise settles. Used by every per-kind cache to avoid duplicating
 * relay requests.
 */
const inflight = new Map<string, Promise<unknown>>();

export function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const promise = fn().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}
