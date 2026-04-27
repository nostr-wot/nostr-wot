"use client";

import { type Event } from "nostr-tools";
import { createKeyedObservable } from "./keyed-observable";
import { DEFAULT_RELAYS, getPool } from "./pool";
import { singleFlight } from "./inflight";

/**
 * Engagement cache: per noteId, holds reactions count + reposts count +
 * sum of zap amounts. Filled in batches keyed by note id.
 *
 * Three concurrent subs for kind 7 / 6 / 9735, all pivoted on the same
 * #e tag set. We don't merge them — each kind updates its slice
 * independently; the observable fires once per kind.
 */

export type Engagement = {
  reactionCount: number;
  repostCount: number;
  zapTotalSats: number;
};

const TIMEOUT = 4000;

const store = createKeyedObservable<string, Engagement>({
  equal: (a, b) =>
    a.reactionCount === b.reactionCount &&
    a.repostCount === b.repostCount &&
    a.zapTotalSats === b.zapTotalSats,
});

export function _engagementStore() {
  return store;
}

function getOrEmpty(noteId: string): Engagement {
  return store.get(noteId).value ?? { reactionCount: 0, repostCount: 0, zapTotalSats: 0 };
}

/**
 * Parse the `bolt11` invoice in a kind-9735 receipt to extract amount in
 * millisatoshis. Conservative: only handles the `lnbc<amount><multiplier>`
 * prefix as that's what every wallet generates.
 */
function parseZapMsats(receipt: Event): number {
  const bolt11Tag = receipt.tags.find((t) => t[0] === "bolt11" && t[1]);
  if (!bolt11Tag || !bolt11Tag[1]) return 0;
  const inv = bolt11Tag[1].toLowerCase();
  const match = inv.match(/^lnbc(\d+)([munp]?)/);
  if (!match) return 0;
  const value = parseInt(match[1]!, 10);
  if (!Number.isFinite(value)) return 0;
  switch (match[2]) {
    case "m": return value * 100_000_000;        // milli-bitcoin → msat
    case "u": return value * 100_000;            // micro-bitcoin → msat
    case "n": return value * 100;                // nano-bitcoin → msat
    case "p": return Math.floor(value / 10);     // pico-bitcoin → msat (10p = 1msat)
    default:  return value * 100_000_000_000;    // whole bitcoin → msat (rare)
  }
}

export function fetchEngagementBatch(noteIds: string[]): Promise<void> {
  if (noteIds.length === 0) return Promise.resolve();
  const key = `engagement:${noteIds.slice().sort().join(",")}`;
  return singleFlight(key, async () => {
    // Initialize empty slots so the UI shows 0 instead of "loading"
    for (const id of noteIds) {
      if (!store.get(id).value) store.set(id, { reactionCount: 0, repostCount: 0, zapTotalSats: 0 });
    }

    const reactionCounts: Record<string, number> = Object.fromEntries(noteIds.map((id) => [id, 0]));
    const repostCounts: Record<string, number> = Object.fromEntries(noteIds.map((id) => [id, 0]));
    const zapMsats: Record<string, number> = Object.fromEntries(noteIds.map((id) => [id, 0]));

    await Promise.all([
      collect(noteIds, [7], (e) => {
        if (e.content === "-") return;
        const tag = e.tags.find((t) => t[0] === "e" && t[1] && noteIds.includes(t[1]));
        if (tag?.[1]) {
          reactionCounts[tag[1]] = (reactionCounts[tag[1]] ?? 0) + 1;
          flush(tag[1]);
        }
      }),
      collect(noteIds, [6], (e) => {
        const tag = e.tags.find((t) => t[0] === "e" && t[1] && noteIds.includes(t[1]));
        if (tag?.[1]) {
          repostCounts[tag[1]] = (repostCounts[tag[1]] ?? 0) + 1;
          flush(tag[1]);
        }
      }),
      collect(noteIds, [9735], (e) => {
        const tag = e.tags.find((t) => t[0] === "e" && t[1] && noteIds.includes(t[1]));
        if (!tag?.[1]) return;
        const msats = parseZapMsats(e);
        if (msats > 0) {
          zapMsats[tag[1]] = (zapMsats[tag[1]] ?? 0) + msats;
          flush(tag[1]);
        }
      }),
    ]);

    function flush(noteId: string) {
      store.set(noteId, {
        reactionCount: reactionCounts[noteId] ?? 0,
        repostCount: repostCounts[noteId] ?? 0,
        zapTotalSats: Math.floor((zapMsats[noteId] ?? 0) / 1000),
      });
    }
  });
}

function collect(noteIds: string[], kinds: number[], onEvent: (e: Event) => void): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      try { sub.close(); } catch { /* noop */ }
      resolve();
    };
    const sub = getPool().subscribeMany(DEFAULT_RELAYS, { kinds, "#e": noteIds }, {
      onevent: onEvent,
      oneose: () => finish(),
    });
    setTimeout(finish, TIMEOUT);
  });
}

export function getEngagement(noteId: string): Engagement {
  return getOrEmpty(noteId);
}
