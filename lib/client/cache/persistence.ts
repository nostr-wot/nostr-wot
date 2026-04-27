"use client";

const NAMESPACE = "nostr-wot:cache";
const TTL_MS = 24 * 3600_000;

type Persisted<V> = { v: V; t: number };

function isAvailable(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function key(bucket: string, k: string): string {
  return `${NAMESPACE}:${bucket}:${k}`;
}

export function readPersisted<V>(bucket: string, k: string): V | null {
  if (!isAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(key(bucket, k));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted<V>;
    if (Date.now() - parsed.t > TTL_MS) {
      window.localStorage.removeItem(key(bucket, k));
      return null;
    }
    return parsed.v;
  } catch {
    return null;
  }
}

export function writePersisted<V>(bucket: string, k: string, v: V): void {
  if (!isAvailable()) return;
  try {
    const blob: Persisted<V> = { v, t: Date.now() };
    window.localStorage.setItem(key(bucket, k), JSON.stringify(blob));
  } catch {
    // Quota / private mode — fall through silently
  }
}
