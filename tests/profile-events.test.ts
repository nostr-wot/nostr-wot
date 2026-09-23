import assert from "node:assert/strict";
import test from "node:test";
import { finalizeEvent, getPublicKey, type Event } from "nostr-tools";
import { selectProfileEvent, profileFromEvent, followingCountFromEvent } from "../lib/graph/profile-events";

const secret = new Uint8Array(32).fill(1);
const pubkey = getPublicKey(secret);
const other = new Uint8Array(32).fill(2);
function event(created_at: number, kind = 0, content = '{}', tags: string[][] = []): Event {
  return finalizeEvent({ kind, content, tags, created_at }, secret);
}

test("profile selection rejects wrong authors, kinds and invalid signatures", () => {
  const current = event(10);
  const wrongAuthor = finalizeEvent({ kind: 0, content: '{}', tags: [], created_at: 20 }, other);
  const invalid = JSON.parse(JSON.stringify(event(20))) as Event;
  invalid.content = '{"name":"forged"}';
  assert.equal(selectProfileEvent(current, wrongAuthor, pubkey, 0), current);
  assert.equal(selectProfileEvent(current, event(20, 3), pubkey, 0), current);
  assert.equal(selectProfileEvent(current, invalid, pubkey, 0), current);
});

test("profile selection uses newest timestamp then lowest id regardless of arrival order", () => {
  const oldest = event(1);
  const newer = event(2);
  const tied = event(2, 0, '{"name":"tie"}');
  const winner = newer.id < tied.id ? newer : tied;
  for (const events of [[oldest, newer, tied], [tied, newer, oldest]]) {
    const result = events.reduce<Event | null>((current, incoming) => selectProfileEvent(current, incoming, pubkey, 0), null);
    assert.equal(result, winner);
  }
});

test("metadata only exposes string fields and safely rejects malformed content", () => {
  assert.deepEqual(profileFromEvent(event(1, 0, '{"name":{"bad":true},"display_name":"Alice","picture":2}')), {
    pubkey, name: undefined, displayName: 'Alice', picture: undefined, about: undefined, nip05: undefined,
  });
  for (const content of ['null', '[]', 'broken']) assert.equal(profileFromEvent(event(1, 0, content)), null);
});

test("following count deduplicates valid public keys and ignores malformed tags", () => {
  assert.equal(followingCountFromEvent(event(1, 3, '', [['p', pubkey], ['p', pubkey], ['p', getPublicKey(other)], ['p', 'bad'], ['e', pubkey], ['p']])), 2);
  assert.equal(followingCountFromEvent(event(2, 3)), 0);
});
