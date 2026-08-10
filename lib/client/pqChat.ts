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
import { generateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { HDKey } from "@scure/bip32";
import {
  derivePqKeys,
  createPqDirectMessage,
  openPqDirectMessage,
  inboxFilter,
  type PqKeys,
} from "@nostr-wot/pq";

export const CHAT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
  "wss://relay.snort.social",
];

let pool: SimplePool | null = null;
function getPool(): SimplePool {
  if (!pool) pool = new SimplePool();
  return pool;
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
};

let seq = 0;
const nextId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** Create a fresh 24-word identity with post-quantum keys derived from the same seed. */
export function createIdentity(label: string): Identity {
  const mnemonic = generateMnemonic(wordlist, 256); // 24 words
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
  to: Identity,
  content: string,
  trace: (t: Omit<TraceEntry, "id" | "at">) => void,
): Promise<SendResult> {
  trace({
    from: from.label,
    kind: "info",
    label: "Encapsulating to the recipient's ML-KEM-1024 key",
    detail:
      "A fresh shared secret is generated against their public key, then combined with the classic NIP-44 conversation key through HKDF. Neither half alone can decrypt the result.",
  });

  const wrap = createPqDirectMessage({
    content,
    senderSecretKey: from.secretKey,
    recipientPubkey: to.pubkey,
    recipientKemKey: to.pq.kem.publicKey,
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
  peers: Identity[],
  onMessage: (m: ChatMessage) => void,
  trace: (t: Omit<TraceEntry, "id" | "at">) => void,
): () => void {
  const seen = new Set<string>();
  const since = Math.floor(Date.now() / 1000) - 60;

  const sub = getPool().subscribe(CHAT_RELAYS, inboxFilter(me.pubkey, since) as never, {
    onevent(evt: Event) {
      if (seen.has(evt.id)) return;
      seen.add(evt.id);

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

      const peer = peers.find(p => p.pubkey === opened!.sender);
      trace({
        from: me.label,
        kind: "event",
        label: `Decrypted a message from ${peer?.label ?? opened.sender.slice(0, 8)}`,
        detail:
          "The seal's signature authenticated the sender, and the rumor's claimed author was checked against it before the content was trusted.",
        event: evt,
        bytes: JSON.stringify(evt).length,
      });

      onMessage({
        id: evt.id,
        from: opened.sender,
        to: me.pubkey,
        content: opened.content,
        at: opened.createdAt,
        bytes: JSON.stringify(evt).length,
        classicBytes: 0,
      });
    },
  });

  return () => sub.close();
}

export { nextId };
