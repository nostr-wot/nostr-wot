"use client";

/**
 * Peel a captured event apart, layer by layer.
 *
 * A post-quantum DM is three nested events plus a binary envelope, and every write-up
 * of it is a diagram. This turns the diagram into the actual bytes on screen: what each
 * layer hides, what it reveals to a relay, and where the ML-KEM ciphertext sits inside
 * the seal's content.
 *
 * Only layers this browser holds a key for are opened. Everything else is reported as
 * sealed rather than guessed at — the point is to show what an observer can and cannot
 * see, so pretending to read something we cannot would invert the lesson.
 */

import { nip44, verifyEvent, type Event } from "nostr-tools";
import {
  decryptPq,
  fromBase64,
  isPqEnvelope,
  ENVELOPE_VERSION,
  ALG_MLKEM1024_XCHACHA,
  KEM_CIPHERTEXT_BYTES,
  KIND_GIFT_WRAP,
  KIND_SEAL,
  KIND_RUMOR,
  PQC_KIND,
  type PqKeys,
} from "@nostr-wot/pq";

/** Enough of an identity to open something addressed to it. */
export type Keyholder = {
  label: string;
  pubkey: string;
  secretKey: Uint8Array;
  pq: PqKeys;
};

export type LayerField = { label: string; value: string; mono?: boolean };

/** A byte range inside the post-quantum envelope. */
export type Segment = { name: string; offset: number; length: number; note: string };

export type Layer = {
  id: string;
  title: string;
  kind: number | null;
  /** What this layer is for, in one line. */
  what: string;
  /** What a relay storing this event can see of it. */
  visibleToRelay: string;
  state: "plaintext" | "opened" | "sealed";
  bytes: number;
  fields: LayerField[];
  segments?: Segment[];
  json?: unknown;
};

const XCHACHA_NONCE_BYTES = 24;
const POLY1305_TAG_BYTES = 16;

const short = (s: string, head = 16, tail = 8) =>
  s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;

const bytesOf = (v: unknown) => JSON.stringify(v).length;

/**
 * Describe the envelope's byte layout.
 *
 * Parsed from the base64 alone: the framing is public by design, so this works whether
 * or not we can decrypt. Only the payload needs a key.
 */
function envelopeSegments(payloadB64: string): { segments: Segment[]; total: number } | null {
  let raw: Uint8Array;
  try {
    raw = fromBase64(payloadB64);
  } catch {
    return null;
  }
  if (raw.length < 2 + KEM_CIPHERTEXT_BYTES + XCHACHA_NONCE_BYTES) return null;

  const version = raw[0]!;
  const alg = raw[1]!;
  const aeadLength = raw.length - 2 - KEM_CIPHERTEXT_BYTES - XCHACHA_NONCE_BYTES;

  return {
    total: raw.length,
    segments: [
      {
        name: "version",
        offset: 0,
        length: 1,
        note:
          version === ENVELOPE_VERSION
            ? `0x0${version} — nip-pqc/v1. Its own byte, not a NIP-44 version, so this scheme can move without asking for a slot in that registry.`
            : `0x${version.toString(16)} — unrecognised version.`,
      },
      {
        name: "algorithm",
        offset: 1,
        length: 1,
        note:
          alg === ALG_MLKEM1024_XCHACHA
            ? `0x0${alg} — ML-KEM-1024 combined with the NIP-44 conversation key, sealed with XChaCha20-Poly1305.`
            : `0x${alg.toString(16)} — unrecognised algorithm.`,
      },
      {
        name: "ML-KEM-1024 ciphertext",
        offset: 2,
        length: KEM_CIPHERTEXT_BYTES,
        note:
          "The encapsulation, per FIPS 203. This is the whole size story: 1,568 bytes on every message, and the reason a post-quantum DM is several times a classic one.",
      },
      {
        name: "nonce",
        offset: 2 + KEM_CIPHERTEXT_BYTES,
        length: XCHACHA_NONCE_BYTES,
        note: "Random per message. XChaCha20's 24-byte nonce is wide enough that random generation never realistically repeats.",
      },
      {
        name: "ciphertext + tag",
        offset: 2 + KEM_CIPHERTEXT_BYTES + XCHACHA_NONCE_BYTES,
        length: aeadLength,
        note: `The padded rumor, plus a ${POLY1305_TAG_BYTES}-byte Poly1305 tag. Both pubkeys are bound in as associated data, so this will not verify if either party is swapped.`,
      },
    ],
  };
}

function attestationLayer(event: Event): Layer {
  const algs = event.tags.filter(t => t[0] === "alg" && t.length >= 3);
  const fields: LayerField[] = [
    { label: "author", value: short(event.pubkey), mono: true },
    { label: "signature", value: verifyEvent(event) ? "valid secp256k1" : "INVALID" },
  ];
  for (const [, alg, key] of algs) {
    let size = 0;
    try {
      size = fromBase64(key!).length;
    } catch {
      size = 0;
    }
    fields.push({ label: alg!, value: `${size.toLocaleString()} bytes · ${short(key!)}`, mono: true });
  }
  const origin = event.tags.find(t => t[0] === "origin")?.[1];
  const strength = event.tags.find(t => t[0] === "seed_strength")?.[1];
  const pop = event.tags.find(t => t[0] === "pop");
  if (origin) fields.push({ label: "origin", value: origin });
  if (strength) fields.push({ label: "seed_strength", value: `${strength} bits` });
  if (pop) fields.push({ label: "proof of possession", value: `${pop[1]} signature over npub + both keys`, mono: true });

  return {
    id: "attestation",
    title: "Attestation",
    kind: PQC_KIND,
    what: "The replaceable event that publishes this identity's post-quantum public keys. Everything in it is public — it has to be, or nobody could send.",
    visibleToRelay: "All of it. This layer is a directory entry, not a secret.",
    state: "plaintext",
    bytes: bytesOf(event),
    fields,
    json: event,
  };
}

/**
 * Decompose a gift wrap.
 *
 * Returns the outer layer alone when we hold no key for it, which is exactly what a
 * relay or a passer-by sees.
 */
export function analyzeEvent(event: Event, keyholders: Keyholder[]): Layer[] {
  if (event.kind === PQC_KIND) return [attestationLayer(event)];
  if (event.kind !== KIND_GIFT_WRAP) {
    return [
      {
        id: "raw",
        title: `kind ${event.kind}`,
        kind: event.kind,
        what: "Not part of the post-quantum message flow.",
        visibleToRelay: "All of it.",
        state: "plaintext",
        bytes: bytesOf(event),
        fields: [],
        json: event,
      },
    ];
  }

  const recipientHex = event.tags.find(t => t[0] === "p")?.[1] ?? null;
  const me = keyholders.find(k => k.pubkey === recipientHex) ?? null;

  const wrapLayer: Layer = {
    id: "wrap",
    title: "Gift wrap",
    kind: KIND_GIFT_WRAP,
    what: "The only layer a relay stores. Signed by a throwaway key created for this one message, so the sender's identity appears nowhere on the outside.",
    visibleToRelay:
      "The ephemeral author, the recipient's pubkey, a randomised timestamp, and an opaque blob. Not who sent it, and not when they sent it.",
    state: "plaintext",
    bytes: bytesOf(event),
    fields: [
      { label: "author", value: `${short(event.pubkey)} (ephemeral, used once)`, mono: true },
      { label: "recipient (p tag)", value: recipientHex ? short(recipientHex) : "—", mono: true },
      {
        label: "created_at",
        value: `${new Date(event.created_at * 1000).toISOString()} — randomised up to 2 days back, per NIP-59`,
      },
      { label: "content", value: `${event.content.length.toLocaleString()} chars, NIP-44 to the ephemeral key`, mono: true },
    ],
    json: event,
  };

  if (!me) {
    return [
      wrapLayer,
      {
        id: "sealed",
        title: "Everything below",
        kind: null,
        what: "Sealed. This browser holds no key for this recipient.",
        visibleToRelay: "Nothing. This is the view a relay operator has of every message it stores.",
        state: "sealed",
        bytes: 0,
        fields: [],
      },
    ];
  }

  // Layer 2 — unwrap to the seal with the recipient's secp256k1 key.
  let seal: Event;
  try {
    const conversationKey = nip44.getConversationKey(me.secretKey, event.pubkey);
    seal = JSON.parse(nip44.decrypt(event.content, conversationKey)) as Event;
  } catch {
    return [
      wrapLayer,
      {
        id: "sealed",
        title: "Seal",
        kind: KIND_SEAL,
        what: "Could not be opened with this identity's key.",
        visibleToRelay: "Nothing.",
        state: "sealed",
        bytes: 0,
        fields: [],
      },
    ];
  }

  const envelope = envelopeSegments(seal.content);
  const sealLayer: Layer = {
    id: "seal",
    title: "Seal",
    kind: KIND_SEAL,
    what: "Signed by the real sender. This signature is what makes the sender's identity trustworthy — the wrap's says nothing, because anyone can make an ephemeral key.",
    visibleToRelay: "Nothing. It only exists inside the wrap.",
    state: "opened",
    bytes: bytesOf(seal),
    fields: [
      { label: "author", value: short(seal.pubkey), mono: true },
      { label: "signature", value: verifyEvent(seal) ? "valid secp256k1" : "INVALID" },
      {
        label: "content",
        value: isPqEnvelope(seal.content)
          ? "post-quantum envelope (below)"
          : "classic NIP-44 — not a post-quantum message",
        mono: true,
      },
    ],
    json: seal,
  };

  const layers: Layer[] = [wrapLayer, sealLayer];

  if (envelope) {
    layers.push({
      id: "envelope",
      title: "Post-quantum envelope",
      kind: null,
      what: "The part that survives a quantum computer. A fresh ML-KEM secret is combined with the classic NIP-44 conversation key through HKDF, so breaking secp256k1 alone does not open it.",
      visibleToRelay: "Nothing, but note the framing is unencrypted by design: version and algorithm are readable so a client knows what it is holding before it tries a key.",
      state: "opened",
      bytes: envelope.total,
      fields: [
        { label: "total", value: `${envelope.total.toLocaleString()} bytes` },
        {
          label: "overhead",
          value: `${(envelope.total - (envelope.segments[4]!.length - POLY1305_TAG_BYTES)).toLocaleString()} bytes of the above is envelope, not message`,
        },
      ],
      segments: envelope.segments,
    });
  }

  // Layer 1 — the rumor, if the ML-KEM secret opens it.
  try {
    const conversationKey = nip44.getConversationKey(me.secretKey, seal.pubkey);
    const rumorJson = decryptPq(seal.content, me.pq.kem.secretKey, conversationKey, {
      sender: seal.pubkey,
      recipient: me.pubkey,
    });
    const rumor = JSON.parse(rumorJson) as Event;
    const authorMatches = rumor.pubkey === seal.pubkey;

    layers.push({
      id: "rumor",
      title: "Rumor",
      kind: KIND_RUMOR,
      what: "The message itself. Deliberately unsigned: an unsigned rumor cannot be shown to a third party as proof you said it.",
      visibleToRelay: "Nothing.",
      state: "opened",
      bytes: bytesOf(rumor),
      fields: [
        {
          label: "claimed author",
          value: authorMatches
            ? `${short(rumor.pubkey)} — matches the seal's signer`
            : `${short(rumor.pubkey)} — DOES NOT match the seal. Forged.`,
          mono: true,
        },
        { label: "content", value: rumor.content },
      ],
      json: rumor,
    });
  } catch {
    layers.push({
      id: "rumor",
      title: "Rumor",
      kind: KIND_RUMOR,
      what: "The envelope did not open with this identity's ML-KEM key.",
      visibleToRelay: "Nothing.",
      state: "sealed",
      bytes: 0,
      fields: [],
    });
  }

  return layers;
}
