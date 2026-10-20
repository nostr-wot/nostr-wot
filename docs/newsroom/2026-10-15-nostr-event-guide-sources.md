# Nostr event guide: primary sources

Verified 15 October 2026 against `nostr-protocol/nips` revision `a79e21d90fce5465b50ef385dd368bba99ec4a0b`, resolved from the GitHub commits API. All seven editions use translation key `what-is-a-nostr-event`. The guide date is an editorial date, not a video upload or protocol release date.

| Primary source | Supported claims |
| --- | --- |
| [NIP-01](https://github.com/nostr-protocol/nips/blob/a79e21d90fce5465b50ef385dd368bba99ec4a0b/01.md) | Seven fields; SHA-256 over the exact serialization of `[0, pubkey, created_at, kind, tags, content]`; Schnorr signature over the ID; kind 0 profile metadata; replaceable profile retention. |
| [NIP-10](https://github.com/nostr-protocol/nips/blob/a79e21d90fce5465b50ef385dd368bba99ec4a0b/10.md) | Kind 1 plaintext notes and reply references. |
| [NIP-25](https://github.com/nostr-protocol/nips/blob/a79e21d90fce5465b50ef385dd368bba99ec4a0b/25.md) | Kind 7 reactions to Nostr events, required target `e` tag and `+` as a like. |
| [NIP-92](https://github.com/nostr-protocol/nips/blob/a79e21d90fce5465b50ef385dd368bba99ec4a0b/92.md) | Media URLs, `imeta` and optional file hashes; media are retrieved separately. |
| [Nostr WoT event explainer](https://www.youtube.com/watch?v=JlenrCGN2z8) | Educational sequence: message, fields, kinds, altered data, signature limits, external media and display across apps. |
| [YouTube oEmbed](https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=JlenrCGN2z8&format=json) | Exact published title and attribution to the official `@nostr-wot` channel. No upload date provided. |

The distinction between signature validity and personal identity, truth, trustworthy time or file availability follows from what is signed: author-supplied event fields and references. A signature does not independently attest to those external facts. A changed URL target can leave an event signature valid; an included file hash can detect differing bytes when checked, but does not ensure retrieval. No software release or universal client support is claimed.
