"use client";

/**
 * Post-quantum capability check.
 *
 * Looks up an identity's `kind:10203` attestation, validates it against the proposed
 * NIP, and reports what a sender would actually be able to rely on.
 *
 * Deliberately strict: an attestation that fails validation is reported as invalid
 * rather than quietly ignored. The failure mode this whole scheme is trying to avoid
 * is a sender believing a recipient is reachable post-quantum when they are not.
 */

import { SimplePool, nip19, type Event } from "nostr-tools";

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://purplepag.es",
  "wss://relay.primal.net",
];

/** Replaceable kind carrying post-quantum public keys. See the proposed NIP. */
export const PQC_KIND = 10203;

const ALG_KEM = "ml-kem-1024";
const ALG_DSA = "ml-dsa-87";
const KEM_PUBLIC_KEY_BYTES = 1568;
const DSA_PUBLIC_KEY_BYTES = 2592;
const PQ_PROFILE = "nip-pqc/v1";

const TIMEOUT = 5000;

let pool: SimplePool | null = null;
function getPool(): SimplePool {
  if (!pool) pool = new SimplePool();
  return pool;
}

export type PqcKey = {
  alg: string;
  base64: string;
  bytes: number;
  expectedBytes: number | null;
  lengthValid: boolean;
};

/** A validation failure, as a translatable code plus its parameters. */
export type PqcProblem = {
  code:
    | "keyLength"
    | "noAlgTags"
    | "noKem"
    | "derivedWeakSeed"
    | "derivedMissingSeedStrength"
    | "missingPop"
    | "popFailed";
  params?: Record<string, string | number>;
};

export type PqcResult =
  | { status: "invalid-input" }
  | { status: "not-found"; pubkey: string }
  | {
      status: "found";
      pubkey: string;
      npub: string;
      createdAt: number;
      keys: PqcKey[];
      origin: string | null;
      seedStrength: string | null;
      profile: string | null;
      /** null when no `pop` tag is present; true/false once verified. */
      popValid: boolean | null;
      /** Every reason this attestation should not be trusted as-is. */
      problems: PqcProblem[];
    };

function toHexPubkey(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^[0-9a-f]{64}$/i.test(v)) return v.toLowerCase();
  try {
    const decoded = nip19.decode(v);
    if (decoded.type === "npub") return decoded.data as string;
    if (decoded.type === "nprofile") return (decoded.data as { pubkey: string }).pubkey;
  } catch {
    return null;
  }
  return null;
}

function b64Bytes(b64: string): number {
  try {
    if (typeof atob !== "function") return -1;
    return atob(b64).length;
  } catch {
    return -1;
  }
}

function expectedBytesFor(alg: string): number | null {
  if (alg === ALG_KEM) return KEM_PUBLIC_KEY_BYTES;
  if (alg === ALG_DSA) return DSA_PUBLIC_KEY_BYTES;
  return null;
}

function tagValues(event: Event, name: string): string[][] {
  return event.tags.filter((t) => t[0] === name);
}

function firstTagValue(event: Event, name: string): string | null {
  const t = event.tags.find((x) => x[0] === name);
  return t && t[1] ? t[1] : null;
}

/**
 * Verify the proof of possession: the ML-DSA key signs a message binding the npub and
 * both post-quantum keys, proving the publisher holds what it advertises.
 *
 * @noble/post-quantum is imported dynamically so the ~100 kB of lattice code only loads
 * for visitors who actually run a check.
 */
async function verifyPop(
  pubkeyHex: string,
  kemB64: string,
  dsaB64: string,
  popB64: string,
): Promise<boolean> {
  try {
    const { ml_dsa87 } = await import("@noble/post-quantum/ml-dsa.js");
    const bin = (b64: string) =>
      Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const message = new TextEncoder().encode(
      `${PQ_PROFILE}/pop:${pubkeyHex}:${kemB64}:${dsaB64}`,
    );
    return ml_dsa87.verify(bin(popB64), message, bin(dsaB64));
  } catch {
    return false;
  }
}

export async function checkPqcSupport(input: string): Promise<PqcResult> {
  const pubkey = toHexPubkey(input);
  if (!pubkey) return { status: "invalid-input" };

  const pool = getPool();
  let event: Event | null = null;
  try {
    event = await Promise.race([
      pool.get(RELAYS, { kinds: [PQC_KIND], authors: [pubkey] }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT)),
    ]);
  } catch {
    event = null;
  }

  if (!event) return { status: "not-found", pubkey };

  const problems: PqcProblem[] = [];

  const keys: PqcKey[] = tagValues(event, "alg")
    .filter((t) => t.length >= 3)
    .map((t) => {
      const alg = t[1];
      const base64 = t[2];
      const bytes = b64Bytes(base64);
      const expected = expectedBytesFor(alg);
      const lengthValid = expected === null ? true : bytes === expected;
      if (expected !== null && !lengthValid) {
        problems.push({ code: "keyLength", params: { alg, bytes, expected } });
      }
      return { alg, base64, bytes, expectedBytes: expected, lengthValid };
    });

  if (keys.length === 0) problems.push({ code: "noAlgTags" });

  const kem = keys.find((k) => k.alg === ALG_KEM);
  const dsa = keys.find((k) => k.alg === ALG_DSA);
  const origin = firstTagValue(event, "origin");
  const seedStrength = firstTagValue(event, "seed_strength");
  const profile = firstTagValue(event, "v");

  if (!kem) problems.push({ code: "noKem", params: { alg: ALG_KEM } });

  // The spec permits seed-derived keys only from a 256-bit (24-word) mnemonic. A weaker
  // seed must be published as `independent` instead, so the `derived` label keeps meaning
  // exactly one thing to whoever reads it.
  if (origin === "derived") {
    if (!seedStrength) {
      problems.push({ code: "derivedMissingSeedStrength" });
    } else if (seedStrength !== "256") {
      problems.push({ code: "derivedWeakSeed", params: { bits: seedStrength } });
    }
  }

  const popTag = event.tags.find((t) => t[0] === "pop" && t.length >= 3);
  let popValid: boolean | null = null;

  if (dsa && !popTag) {
    problems.push({ code: "missingPop", params: { alg: ALG_DSA } });
  } else if (popTag && dsa && kem) {
    popValid = await verifyPop(event.pubkey, kem.base64, dsa.base64, popTag[2]);
    if (!popValid) {
      problems.push({ code: "popFailed" });
    }
  }

  return {
    status: "found",
    pubkey: event.pubkey,
    npub: nip19.npubEncode(event.pubkey),
    createdAt: event.created_at,
    keys,
    origin,
    seedStrength,
    profile,
    popValid,
    problems,
  };
}
