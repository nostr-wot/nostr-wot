"use client";

/**
 * Post-quantum messaging driven by the browser extension.
 *
 * The extension never hands out private key material, so every operation that touches a
 * secret goes through `window.nostr`:
 *
 * - the seal is signed with `signEvent`
 * - the payload is encrypted with `nip44.encrypt(..., { scheme: 'pq', recipientKemKey })`
 * - inbound payloads are decrypted with `nip44.decrypt`, which routes post-quantum
 *   envelopes automatically because they are self-describing
 *
 * The gift wrap's outer layer is done here rather than in the extension: it is signed by a
 * throwaway key this page generates, so there is no secret worth protecting.
 *
 * To *receive*, the sender needs this identity's ML-KEM public key, and there is
 * deliberately no method to read it out of the extension. The designed discovery path is
 * the kind:10203 attestation on relays — so this looks it up exactly as any other client
 * would, and reports honestly when it is missing rather than silently falling back.
 */

import {
  generateSecretKey,
  getPublicKey,
  nip19,
  nip44,
  finalizeEvent,
  verifyEvent,
  type Event,
} from "nostr-tools";
import { isPqEnvelope, inboxFilter, fromBase64, toBase64 } from "@nostr-wot/pq";
import { noteExtensionInbound, noteExtensionCaughtUp, type Recipient } from "./pqChat";
import { CHAT_RELAYS, getPool, acceptedFrom } from "./pqRelays";
import { checkPqcSupport, type PqcResult } from "./pqcCheck";

type Nip44Pq = {
  encrypt: (pubkey: string, plaintext: string, opts?: { scheme: "pq"; recipientKemKey: string }) => Promise<string>;
  decrypt: (pubkey: string, ciphertext: string) => Promise<string>;
};
type NostrProvider = {
  getPublicKey: () => Promise<string>;
  signEvent: (e: { kind: number; created_at: number; tags: string[][]; content: string }) => Promise<Event>;
  nip44?: Nip44Pq;
};

declare global {
  interface Window {
    nostr?: NostrProvider;
  }
}

// The pool is shared with everything else on the page, so the relay activity strip
// covers every subscription rather than just the ones this module happens to own.

export function hasExtension(): boolean {
  return typeof window !== "undefined" && !!window.nostr;
}

export type ExtensionIdentity = {
  pubkey: string;
  npub: string;
  /** Their published attestation, or why we cannot use one. */
  attestation: PqcResult;
};

/** Connect, then look up this identity's own attestation so others can reach it. */
export async function connectExtension(): Promise<ExtensionIdentity> {
  if (!window.nostr) throw new Error("No Nostr extension found");
  if (!window.nostr.nip44) throw new Error("This extension does not expose nip44");

  const pubkey = await window.nostr.getPublicKey();
  return {
    pubkey,
    npub: nip19.npubEncode(pubkey),
    attestation: await checkPqcSupport(pubkey),
  };
}

/**
 * Turn a connected extension identity into something others can send to.
 *
 * Returns null unless a valid attestation was found — the extension will not hand out
 * its ML-KEM public key, so no attestation means genuinely unreachable, not a fallback.
 */
export function extensionRecipient(me: ExtensionIdentity, label: string): Recipient | null {
  if (me.attestation.status !== "found" || me.attestation.problems.length > 0) return null;
  const kem = me.attestation.keys.find(k => k.alg === "ml-kem-1024");
  if (!kem) return null;
  return { label, pubkey: me.pubkey, kem: fromBase64(kem.base64) };
}

function randomPastTimestamp(): number {
  return Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 172800);
}

/**
 * Build and publish a post-quantum gift wrap using the extension for everything secret.
 *
 * Mirrors `createPqDirectMessage` exactly, with the two key-bearing steps delegated.
 */
export async function sendFromExtension(
  senderPubkey: string,
  to: Recipient,
  content: string,
): Promise<{ wrap: Event; accepted: string[] }> {
  const nostr = window.nostr!;
  const recipientPubkey = to.pubkey;

  const rumor = {
    kind: 14,
    pubkey: senderPubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["p", recipientPubkey], ["encrypted", "nip-pqc/v1"]],
    content,
  };

  // The extension holds the ML-KEM secret; it encapsulates and seals for us. The
  // recipient's key was read off their attestation, so this is the same discovery
  // path a real client walks.
  const payload = await nostr.nip44!.encrypt(recipientPubkey, JSON.stringify(rumor), {
    scheme: "pq",
    recipientKemKey: toBase64(to.kem),
  });

  const seal = await nostr.signEvent({
    kind: 13,
    created_at: randomPastTimestamp(),
    tags: [],
    content: payload,
  });

  // The wrap is signed by a throwaway key generated here, so no secret leaves the extension.
  const ephemeral = generateSecretKey();
  const wrap = finalizeEvent(
    {
      kind: 1059,
      created_at: randomPastTimestamp(),
      tags: [["p", recipientPubkey]],
      content: nip44.encrypt(JSON.stringify(seal), nip44.getConversationKey(ephemeral, recipientPubkey)),
    },
    ephemeral,
  );

  const accepted = acceptedFrom(
    await Promise.allSettled(getPool().publish(CHAT_RELAYS, wrap)),
    CHAT_RELAYS,
  );
  return { wrap, accepted };
}

export type ExtensionMessage = {
  id: string;
  sender: string;
  content: string;
  bytes: number;
  at: number;
  /** Which relays served this event. */
  relays: string[];
};

/**
 * Watch this identity's inbox, unwrapping through the extension.
 *
 * The wrap's outer layer is addressed to a throwaway key, so the extension decrypts it
 * against the wrap author; the seal's payload is then routed by the extension without
 * being told which scheme it is.
 */
export function watchExtensionInbox(
  myPubkey: string,
  label: string,
  onMessage: (m: ExtensionMessage) => void,
  onError: (label: string, detail: string) => void,
): () => void {
  const seen = new Set<string>();

  const sub = getPool().subscribe(CHAT_RELAYS, inboxFilter(myPubkey) as never, {
    oneose() {
      noteExtensionCaughtUp(label);
    },
    async onevent(evt: Event) {
      if (seen.has(evt.id)) return;
      seen.add(evt.id);
      const relays = noteExtensionInbound(evt);
      try {
        const sealJson = await window.nostr!.nip44!.decrypt(evt.pubkey, evt.content);
        const seal = JSON.parse(sealJson) as Event;
        if (seal.kind !== 13 || !verifyEvent(seal)) return;
        if (!isPqEnvelope(seal.content)) return; // an ordinary classic message

        const rumorJson = await window.nostr!.nip44!.decrypt(seal.pubkey, seal.content);
        const rumor = JSON.parse(rumorJson) as {
          kind: number;
          pubkey: string;
          content: string;
          created_at: number;
        };
        if (rumor.kind !== 14) return;

        // The rumor is unsigned, so its author is only a claim until checked.
        if (rumor.pubkey !== seal.pubkey) {
          onError("Rejected a forged message", "The rumor claimed an author the seal did not sign.");
          return;
        }
        onMessage({
          id: evt.id,
          sender: rumor.pubkey,
          content: rumor.content,
          bytes: JSON.stringify(evt).length,
          at: rumor.created_at,
          relays,
        });
      } catch {
        // Not for us, or not decryptable by this identity. Ordinary traffic, not an error.
      }
    },
  });

  return () => sub.close();
}

export { getPublicKey };
