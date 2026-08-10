"use client";

/**
 * Two-party post-quantum chat, for the /pqc/chat demonstration.
 *
 * Both identities are generated in the browser and never leave it. Messages are real
 * NIP-59 gift wraps published to public relays, so what you see here is exactly what
 * traverses the network — no simulation.
 *
 * Every step is recorded in a transcript so the event shapes can be inspected. The point
 * of the page is not that messages arrive; it is that you can look at what actually got
 * published and confirm it is an ordinary gift wrap.
 */

import { SimplePool, generateSecretKey, getPublicKey, nip19, nip44, finalizeEvent, type Event } from "nostr-tools";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { HDKey } from "@scure/bip32";
import {
  derivePqKeys,
  createPqDirectMessage,
  openPqDirectMessage,
  buildAttestationTags,
  inboxFilter,
  PQC_KIND,
  type PqKeys,
} from "@nostr-wot/pq";
import { checkPqcSupport } from "./pqcCheck";

export const CHAT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
  "wss://relay.snort.social",
];

let pool: SimplePool | null = null;
function getPool(): SimplePool {
  if (!pool) {
    pool = new SimplePool();
    // Record which relay served each event. Without this the page can say a message
    // arrived but not where from, which is exactly the thing worth being able to check.
    pool.trackRelays = true;
  }
  return pool;
}

// ── Relay activity ──────────────────────────────────────────────────────────

/**
 * A running account of what the relay connections are doing.
 *
 * The page's whole claim is that nothing is displayed until the network hands it back.
 * That claim is unfalsifiable unless the network is visible, so every inbound event,
 * every end-of-stored-events marker and every connection state change is recorded here
 * and surfaced in the UI.
 */
export type RelayActivity = {
  /** relay url → connected. */
  status: Record<string, boolean>;
  /** Inbound events accepted from a subscription, ever. */
  received: number;
  /** When the last inbound event landed, and which relays had it. */
  last: { at: number; relays: string[]; kind: number; id: string } | null;
  /** Inboxes whose subscription has finished replaying stored events. */
  caughtUp: string[];
};

let activity: RelayActivity = { status: {}, received: 0, last: null, caughtUp: [] };
const activityListeners = new Set<(a: RelayActivity) => void>();

function emitActivity(next: Partial<RelayActivity>) {
  activity = { ...activity, ...next };
  for (const fn of activityListeners) fn(activity);
}

export function subscribeRelayActivity(fn: (a: RelayActivity) => void): () => void {
  activityListeners.add(fn);
  fn(activity);

  // Connection state has no callback on the pool once it is built, so poll it. Cheap:
  // it reads a map the pool already maintains.
  const tick = () => {
    const status: Record<string, boolean> = {};
    for (const url of CHAT_RELAYS) status[url] = false;
    for (const [url, connected] of getPool().listConnectionStatus()) status[url] = connected;
    if (CHAT_RELAYS.some(u => status[u] !== activity.status[u])) emitActivity({ status });
  };
  tick();
  const timer = setInterval(tick, 2000);

  return () => {
    activityListeners.delete(fn);
    clearInterval(timer);
  };
}

/** Which relays handed us this event, as recorded by the pool. */
function relaysFor(eventId: string): string[] {
  return [...(getPool().seenOn.get(eventId) ?? [])].map(r => r.url);
}

/** The one pool everything shares, so there is a single set of connections to watch. */
export function getChatPool(): SimplePool {
  return getPool();
}

/** Record an inbound event from a subscription driven elsewhere (the extension pane). */
export function noteExtensionInbound(evt: Event): string[] {
  return noteInbound(evt);
}

export function noteExtensionCaughtUp(label: string): void {
  noteCaughtUp(label);
}

function noteInbound(evt: Event): string[] {
  const relays = relaysFor(evt.id);
  emitActivity({
    received: activity.received + 1,
    last: { at: Date.now(), relays, kind: evt.kind, id: evt.id },
  });
  return relays;
}

function noteCaughtUp(label: string) {
  if (activity.caughtUp.includes(label)) return;
  emitActivity({ caughtUp: [...activity.caughtUp, label] });
}

export type Identity = {
  label: string;
  mnemonic: string;
  secretKey: Uint8Array;
  pubkey: string;
  npub: string;
  pq: PqKeys;
};

/** A step in the pipeline, kept so the UI can show what happened and with what bytes. */
export type TraceEntry = {
  id: string;
  at: number;
  from: string;
  kind: "info" | "event" | "error";
  label: string;
  detail?: string;
  /** A full Nostr event, when this step produced one. */
  event?: Event;
  /** Serialized size in bytes, for the event steps. */
  bytes?: number;
  /** Whose transcript this belongs to, so the explorer can filter by account. */
  owner?: string;
  /** Relays that served or accepted it. */
  relays?: string[];
};

export type ChatMessage = {
  id: string;
  from: string;
  to: string;
  content: string;
  at: number;
  /** Wire size of the gift wrap that carried it. */
  bytes: number;
  /** The equivalent classic NIP-17 size, for comparison. */
  classicBytes: number;
  /** Which relays handed this event over. Empty would mean it did not come from one. */
  relays: string[];
};

/**
 * Someone we can send to: a pubkey plus the ML-KEM key we found for it.
 *
 * Deliberately not `Identity`. A recipient is only ever known through its published
 * attestation, which is the same thing a real client has to work with — so the page
 * cannot accidentally reach into a peer's in-memory key material and skip discovery.
 */
export type Recipient = { label: string; pubkey: string; kem: Uint8Array };

let seq = 0;
const nextId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** Create a fresh 24-word identity with post-quantum keys derived from the same seed. */
export function createIdentity(label: string): Identity {
  return identityFromMnemonic(label, generateMnemonic(wordlist, 256)); // 24 words
}

/**
 * Rebuild an identity from its mnemonic.
 *
 * Which is the whole claim being made: the words are the only thing worth keeping, and
 * both post-quantum key pairs come back from them alone.
 */
export function identityFromMnemonic(label: string, mnemonic: string): Identity {
  const seed = mnemonicToSeedSync(mnemonic);
  const hd = HDKey.fromMasterSeed(seed).derive("m/44'/1237'/0'/0/0");
  const secretKey = hd.privateKey!;
  const pubkey = getPublicKey(secretKey);
  return {
    label,
    mnemonic,
    secretKey,
    pubkey,
    npub: nip19.npubEncode(pubkey),
    pq: derivePqKeys(seed, 0),
  };
}

/**
 * Publish the identity's `kind:10203` attestation.
 *
 * This is what makes the identity reachable at all: there is no other way for a sender
 * to learn its ML-KEM public key. Doing it here rather than passing keys around in
 * memory means the demo exercises the discovery path it is arguing for.
 */
export async function publishAttestation(
  id: Identity,
  trace: (t: Omit<TraceEntry, "id" | "at">) => void,
): Promise<{ event: Event; accepted: string[] }> {
  const event = finalizeEvent(
    {
      kind: PQC_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags: buildAttestationTags({
        pubkey: id.pubkey,
        kem: id.pq.kem.publicKey,
        dsa: id.pq.dsa.publicKey,
        origin: "derived",
        dsaSecretKey: id.pq.dsa.secretKey,
      }),
      content: "",
    },
    id.secretKey,
  );

  const results = await Promise.allSettled(getPool().publish(CHAT_RELAYS, event));
  const accepted = results
    .map((r, i) => (r.status === "fulfilled" ? CHAT_RELAYS[i]! : null))
    .filter(Boolean) as string[];

  trace({
    from: id.label,
    kind: accepted.length ? "event" : "error",
    label: accepted.length
      ? `Attestation published — accepted by ${accepted.length}/${CHAT_RELAYS.length} relays`
      : "No relay accepted the attestation",
    detail: accepted.length
      ? `kind:${PQC_KIND}, carrying the ML-KEM-1024 and ML-DSA-87 public keys plus a proof of possession signed by the ML-DSA key. Until this is on a relay, nobody can send to ${id.label} at all.\n\n${accepted.join("\n")}`
      : "Without this, no one can discover the ML-KEM key, so no message can be encrypted to this identity.",
    event,
    bytes: JSON.stringify(event).length,
    owner: id.pubkey,
    relays: accepted,
  });

  return { event, accepted };
}

/**
 * Find someone's ML-KEM key the way any other client would — by reading their published
 * attestation off relays and validating it.
 *
 * Retries, because a just-published replaceable event takes a moment to be queryable.
 * Returns null when the attestation is missing or fails validation; the caller must not
 * fall back to classic encryption silently, which is the failure this design exists to
 * prevent.
 */
export async function resolveRecipient(
  pubkey: string,
  label: string,
  trace: (t: Omit<TraceEntry, "id" | "at">) => void,
  attempts = 4,
): Promise<Recipient | null> {
  for (let i = 0; i < attempts; i++) {
    const result = await checkPqcSupport(pubkey);

    if (result.status === "found" && result.problems.length === 0) {
      const kem = result.keys.find(k => k.alg === "ml-kem-1024");
      if (kem) {
        trace({
          from: label,
          kind: "info",
          label: `Found ${label}'s ML-KEM key in their attestation`,
          detail: `Read from a relay, not from memory: kind:${PQC_KIND}, ${kem.bytes.toLocaleString()}-byte ML-KEM-1024 key, origin "${result.origin}", proof of possession verified.`,
        });
        return { label, pubkey, kem: Uint8Array.from(atob(kem.base64), c => c.charCodeAt(0)) };
      }
    }

    if (result.status === "found" && result.problems.length > 0) {
      trace({
        from: label,
        kind: "error",
        label: `${label}'s attestation is not usable`,
        detail: result.problems.map(p => p.code).join(", "),
      });
      return null;
    }

    // Not found yet — give propagation another moment before giving up.
    if (i < attempts - 1) await new Promise(r => setTimeout(r, 1200));
  }

  trace({
    from: label,
    kind: "error",
    label: `No attestation found for ${label}`,
    detail:
      "Nothing can be encrypted to this identity until one is published. The page reports this rather than falling back to classic encryption, because a silent downgrade is the exact failure this design is meant to make impossible.",
  });
  return null;
}

/**
 * Estimate what this message would have cost as a classic NIP-17 gift wrap, so the
 * page can show the real overhead rather than quoting a number from the docs.
 */
function classicSize(content: string, senderSecretKey: Uint8Array, recipientPubkey: string): number {
  try {
    // Same three layers, classic encryption throughout.
    const conv = nip44.getConversationKey(senderSecretKey, recipientPubkey);
    const rumor = {
      kind: 14,
      pubkey: getPublicKey(senderSecretKey),
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", recipientPubkey]],
      content,
    };
    const seal = finalizeEvent(
      { kind: 13, created_at: Math.floor(Date.now() / 1000), tags: [], content: nip44.encrypt(JSON.stringify(rumor), conv) },
      senderSecretKey,
    );
    const eph = generateSecretKey();
    const wrap = finalizeEvent(
      {
        kind: 1059,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", recipientPubkey]],
        content: nip44.encrypt(JSON.stringify(seal), nip44.getConversationKey(eph, recipientPubkey)),
      },
      eph,
    );
    return JSON.stringify(wrap).length;
  } catch {
    return 0;
  }
}

export type SendResult = {
  wrap: Event;
  bytes: number;
  classicBytes: number;
  accepted: string[];
  rejected: string[];
};

/** Build a post-quantum gift wrap, publish it, and report which relays took it. */
export async function sendMessage(
  from: Identity,
  to: Recipient,
  content: string,
  trace: (t: Omit<TraceEntry, "id" | "at">) => void,
): Promise<SendResult> {
  trace({
    from: from.label,
    kind: "info",
    label: `Encapsulating to ${to.label}'s ML-KEM-1024 key`,
    detail:
      "The key comes from their published attestation, not from this page's memory. A fresh shared secret is generated against it, then combined with the classic NIP-44 conversation key through HKDF. Neither half alone can decrypt the result.",
  });

  const wrap = createPqDirectMessage({
    content,
    senderSecretKey: from.secretKey,
    recipientPubkey: to.pubkey,
    recipientKemKey: to.kem,
  });

  const bytes = JSON.stringify(wrap).length;
  const classicBytes = classicSize(content, from.secretKey, to.pubkey);

  trace({
    from: from.label,
    kind: "event",
    label: `Gift wrap built — kind ${wrap.kind}`,
    detail:
      "The post-quantum payload sits in the kind:13 seal, wrapped in a kind:1059 signed by a throwaway key. The sender's pubkey appears nowhere on the outside.",
    event: wrap,
    bytes,
    owner: from.pubkey,
  });

  const results = await Promise.allSettled(getPool().publish(CHAT_RELAYS, wrap));
  const accepted: string[] = [];
  const rejected: string[] = [];
  results.forEach((r, i) => (r.status === "fulfilled" ? accepted : rejected).push(CHAT_RELAYS[i]!));

  trace({
    from: from.label,
    kind: accepted.length ? "info" : "error",
    label: accepted.length
      ? `Published — accepted by ${accepted.length}/${CHAT_RELAYS.length} relays`
      : "No relay accepted the event",
    detail: accepted.length ? accepted.join("\n") : rejected.join("\n"),
  });

  return { wrap, bytes, classicBytes, accepted, rejected };
}

/**
 * Watch an identity's inbox and decrypt anything addressed to it.
 *
 * @returns a function that stops the subscription.
 */
export function watchInbox(
  me: Identity,
  nameFor: (pubkey: string) => string,
  onMessage: (m: ChatMessage) => void,
  trace: (t: Omit<TraceEntry, "id" | "at">) => void,
): () => void {
  const seen = new Set<string>();

  // No `since` filter, deliberately. NIP-59 randomises a gift wrap's created_at up to
  // two days into the past so that wrap timing does not correlate with send timing —
  // so a recent-looking window silently excludes messages that were just published.
  // These identities are freshly generated and have no history, so an unbounded inbox
  // query costs nothing.
  const sub = getPool().subscribe(CHAT_RELAYS, inboxFilter(me.pubkey) as never, {
    oneose() {
      noteCaughtUp(me.label);
    },
    onevent(evt: Event) {
      if (seen.has(evt.id)) return;
      seen.add(evt.id);

      // Recorded before we try to open it: an event we cannot read is still an event
      // the network delivered, and the activity strip should say so.
      const relays = noteInbound(evt);

      let opened;
      try {
        opened = openPqDirectMessage({
          wrap: evt,
          recipientSecretKey: me.secretKey,
          recipientKemSecretKey: me.pq.kem.secretKey,
        });
      } catch (e) {
        trace({
          from: me.label,
          kind: "error",
          label: "Rejected an inbound wrap",
          detail: (e as Error).message,
        });
        return;
      }

      if (!opened) return; // an ordinary classic message, not ours to read

      trace({
        from: me.label,
        kind: "event",
        label: `Decrypted a message from ${nameFor(opened.sender)}`,
        detail: `Served by ${relays.length ? relays.join(", ") : "an unrecorded relay"}. The seal's signature authenticated the sender, and the rumor's claimed author was checked against it before the content was trusted.`,
        event: evt,
        bytes: JSON.stringify(evt).length,
        owner: me.pubkey,
        relays,
      });

      onMessage({
        id: evt.id,
        from: opened.sender,
        to: me.pubkey,
        content: opened.content,
        at: opened.createdAt,
        bytes: JSON.stringify(evt).length,
        classicBytes: 0,
        relays,
      });
    },
  });

  return () => sub.close();
}

// ── Session reuse ───────────────────────────────────────────────────────────

const SESSION_KEY = "nostr-wot:pqc-chat:v1";

/**
 * Remember the demo identities on this machine.
 *
 * Two reasons, and the second is the important one. Each registration publishes two
 * ~12 kB replaceable events, and replaceable only means "replaceable per author" — so a
 * page that minted new keys on every visit would leave another permanent 24 kB on four
 * public relays each time. Reusing the mnemonics means a return visit *replaces* its own
 * attestations instead of adding to them.
 *
 * localStorage rather than sessionStorage, so the identities survive closing the tab and
 * the demo is not rebuilt from scratch every time. These are disposable keys for a
 * public demonstration and hold nothing worth stealing; "Generate new identities"
 * discards them.
 */
export type SavedSession = { alice: string; bob: string; published: boolean };

export function readSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    return validateMnemonic(parsed.alice, wordlist) && validateMnemonic(parsed.bob, wordlist)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function writeSession(session: SavedSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private mode, or storage full. The page works without it.
  }
}

export { nextId };
