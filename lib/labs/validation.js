import {verifyEvent} from 'nostr-tools';
export function validate(event, requested, pubkey) {
  // Fresh object prevents nostr-tools' verification cache hiding a later mutation.
  const fresh=JSON.parse(JSON.stringify(event));
  return fresh.pubkey===pubkey && fresh.kind===requested.kind && fresh.created_at===requested.created_at && fresh.content===requested.content && JSON.stringify(fresh.tags)===JSON.stringify(requested.tags) && verifyEvent(fresh);
}
