import { nip19 } from "nostr-tools";

/** Parse only a public npub or 32-byte hex key. Never decode secret keys. */
export function parseGraphPubkey(input: string): string | null {
  const value = input.trim().replace(/^nostr:/i, "");
  if (/^[0-9a-f]{64}$/i.test(value)) return value.toLowerCase();
  if (!/^npub1/i.test(value)) return null;
  try {
    const decoded = nip19.decode(value);
    return decoded.type === "npub" ? decoded.data : null;
  } catch {
    return null;
  }
}

/**
 * The 32-byte hex pubkey behind any PUBLIC pointer to a person: a hex key, an
 * `npub`, or an `nprofile` (which is an npub plus relay hints). A `nostr:`
 * prefix is accepted and ignored.
 *
 * Separate from `parseGraphPubkey`, which accepts only `npub` because that is
 * what the graph's own inputs are. This one exists to tell whether two links
 * point at the SAME person: the directory cites fiatjaf's profile as an npub,
 * as an nprofile, and as a `nostr:`-prefixed nprofile, which rendered as three
 * identical "Nostr" icons and three `sameAs` entries for one profile.
 *
 * Still never decodes a secret key: `nsec` is not one of the accepted types,
 * so an `nsec` returns null like any other unsupported pointer.
 */
export function parsePublicPubkey(input: string): string | null {
  const value = input.trim().replace(/^nostr:/i, "");
  if (/^[0-9a-f]{64}$/i.test(value)) return value.toLowerCase();
  try {
    const decoded = nip19.decode(value);
    if (decoded.type === "npub") return decoded.data;
    if (decoded.type === "nprofile") return decoded.data.pubkey;
    return null;
  } catch {
    return null;
  }
}
