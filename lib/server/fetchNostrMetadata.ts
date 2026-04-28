import { fetchProfile, fetchFollows, relaysForAuthor } from "@nostr-wot/data";
import { npubToHex } from "@/lib/graph/transformers";

export type ServerProfileMetadata = {
  pubkey: string;
  npub: string;
  displayName: string | null;
  name: string | null;
  nip05: string | null;
  picture: string | null;
  banner: string | null;
  about: string | null;
  website: string | null;
  lud16: string | null;
  followCount: number | null;
};

/**
 * Server-side profile metadata fetch. Uses @nostr-wot/data which routes
 * through the NIP-65 outbox model and resolves on the first relay
 * response (sub-second cold loads). Concurrent with follow-count.
 */
export async function fetchNostrProfileMetadata(
  pubkeyOrNpub: string,
): Promise<ServerProfileMetadata | null> {
  const hex = npubToHex(pubkeyOrNpub);
  if (hex === pubkeyOrNpub && !/^[a-f0-9]{64}$/i.test(hex)) return null;
  const npub = pubkeyOrNpub.startsWith("npub") ? pubkeyOrNpub : "";

  // Resolve outbox once so both the profile fetch and the follows fetch
  // share the same relay set (the union of defaults + the author's
  // declared write relays).
  const relays = await relaysForAuthor(hex).catch(() => undefined);

  const [profile, follows] = await Promise.all([
    fetchProfile(hex, relays),
    fetchFollows(hex, relays),
  ]);

  if (!profile && !follows) return null;

  return {
    pubkey: hex,
    npub,
    displayName: profile?.displayName ?? null,
    name: profile?.name ?? null,
    nip05: profile?.nip05 ?? null,
    picture: profile?.picture ?? null,
    banner: profile?.banner ?? null,
    about: profile?.about ?? null,
    website: null, // not in @nostr-wot/data's parser; can add later
    lud16: profile?.lud16 ?? null,
    followCount: follows?.follows.length ?? null,
  };
}
