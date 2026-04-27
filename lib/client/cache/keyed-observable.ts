"use client";

/**
 * Keyed observable: a Map<K, Slot<V>> with per-key + global subscribers.
 * Components subscribe to a single key via useSyncExternalStore so they
 * re-render only when THAT key's slot changes.
 *
 * Pattern adapted from obelisk's nostr-store (NDK-based) to be runtime-
 * agnostic — used here under nostr-tools.
 */

export type SlotStatus = "idle" | "loading" | "fresh" | "error";

export interface Slot<V> {
  value: V | undefined;
  status: SlotStatus;
  lastFetched: number;
  error?: Error | undefined;
}

export interface KeyedObservableOptions<V> {
  equal?: (a: V, b: V) => boolean;
}

export interface KeyedObservable<K, V> {
  get(key: K): Slot<V>;
  set(key: K, value: V): void;
  setStatus(key: K, status: SlotStatus, error?: Error): void;
  subscribe(key: K, cb: (slot: Slot<V>) => void): () => void;
  subscribeAll(cb: (key: K, slot: Slot<V>) => void): () => void;
  _reset(): void;
}

const EMPTY: Slot<unknown> = Object.freeze({
  value: undefined,
  status: "idle",
  lastFetched: 0,
});

export function createKeyedObservable<K, V>(
  opts: KeyedObservableOptions<V> = {},
): KeyedObservable<K, V> {
  const slots = new Map<K, Slot<V>>();
  const perKey = new Map<K, Set<(s: Slot<V>) => void>>();
  const all = new Set<(k: K, s: Slot<V>) => void>();

  function notify(key: K, slot: Slot<V>) {
    perKey.get(key)?.forEach((cb) => cb(slot));
    all.forEach((cb) => cb(key, slot));
  }

  return {
    get(key) {
      return slots.get(key) ?? (EMPTY as Slot<V>);
    },
    set(key, value) {
      const prev = slots.get(key);
      if (prev?.value !== undefined && opts.equal && opts.equal(prev.value, value)) {
        const updated: Slot<V> = { ...prev, lastFetched: Date.now(), status: "fresh" };
        slots.set(key, updated);
        return;
      }
      const next: Slot<V> = { value, status: "fresh", lastFetched: Date.now() };
      slots.set(key, next);
      notify(key, next);
    },
    setStatus(key, status, error) {
      const prev = slots.get(key) ?? (EMPTY as Slot<V>);
      const next: Slot<V> = { ...prev, status, ...(error !== undefined ? { error } : {}) };
      slots.set(key, next);
      notify(key, next);
    },
    subscribe(key, cb) {
      let set = perKey.get(key);
      if (!set) {
        set = new Set();
        perKey.set(key, set);
      }
      set.add(cb);
      return () => {
        set!.delete(cb);
        if (set!.size === 0) perKey.delete(key);
      };
    },
    subscribeAll(cb) {
      all.add(cb);
      return () => {
        all.delete(cb);
      };
    },
    _reset() {
      slots.clear();
      perKey.clear();
      all.clear();
    },
  };
}
