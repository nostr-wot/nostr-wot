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
