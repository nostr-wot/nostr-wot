import assert from "node:assert/strict";
import test from "node:test";
import { nip19 } from "nostr-tools";
import { parseGraphPubkey } from "../lib/graph/parsePubkey";

const pubkey = "ab".repeat(32);

test("normalizes public hex and npub keys including nostr links", () => {
  assert.equal(parseGraphPubkey(` ${pubkey.toUpperCase()} `), pubkey);
  assert.equal(parseGraphPubkey(nip19.npubEncode(pubkey)), pubkey);
  assert.equal(parseGraphPubkey(`nostr:${nip19.npubEncode(pubkey)}`), pubkey);
});

test("rejects secret keys, non-public NIP-19 values and invalid input", () => {
  const secret = nip19.nsecEncode(new Uint8Array(32).fill(1));
  for (const input of [secret, `nostr:${secret}`, "", "a".repeat(63), "g".repeat(64), "npub1broken", nip19.noteEncode(pubkey)]) {
    assert.equal(parseGraphPubkey(input), null);
  }
});
