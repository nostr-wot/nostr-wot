---
issue: "2026-10-09"
locale: "en"
status: "prepared"
subject: "Account Archive reaches Chrome and Firefox"
preheader: "Extension 0.8.12 and SDK 1.0.4, verified for 2 to 9 October."
coverageStart: "2026-10-02T08:00:00Z"
coverageEnd: "2026-10-09T08:00:00Z"
timezone: "Europe/Zurich"
---

## Account Archive reaches both browser stores

[Nostr WoT Extension 0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12) is now listed as version 0.8.12 in both the [Chrome Web Store](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/nostr-wot-extension/). Both stores show an update date of 7 October. The GitHub release was published on 6 October at 22:22 UTC and provides separate Chrome, Firefox and matching-source archives plus recorded SHA-256 digests.

The preceding 0.8.11 release introduced Account Archive in Settings. It can synchronize selected relays manually or on an hourly, daily or weekly schedule, keep encrypted local storage, group relays and resume from checkpoints. It shows event counts, archive size, progress and per-relay errors. Migration checks a destination before confirmation, preserves original signatures, skips ineligible events and keeps failed-event details available for review.

Version 0.8.12 adds download and import of ordinary signed-event NDJSON without a file password, while retaining support for older encrypted exports. Imported events are checked for account ownership and valid signatures before they are merged. The import and download dialogs also open above the full popup instead of inside the settings card.

## SDK 1.0.4 publishes shared protocol building blocks

The npm registry records [nostr-wot-sdk 1.0.3](https://www.npmjs.com/package/nostr-wot-sdk) at 8 October, 13:41 UTC and 1.0.4 at 16:23 UTC. Version 1.0.3 moved reusable relay, wallet, data and direct-message responsibilities into scoped packages. The shared NIP-47 client negotiates encryption, validates replies, uses bounded waits and distinguishes definite payment failure from an uncertain payment outcome. Native NIP-46 connection options provide translated actions and platform handoff without application-specific DOM patches.

Version 1.0.4 adds managed Blossom uploads with stable copied input bytes, caller cancellation and active-session checks. Redirects are rejected before fallback to another configured server. Encrypted uploads use a fresh disposable signing identity and authorization bound to each server. The data package can also clear keyed observable caches without removing subscribers.

The repository's root changelog still ends at SDK 1.0.2. The detailed source record for these two registry releases is therefore the merged [protocol PR](https://github.com/nostr-wot/nostr-wot-sdk/pull/12), the merged [Blossom and cache PR](https://github.com/nostr-wot/nostr-wot-sdk/pull/13) and the published package contents. A registry release does not prove that every consuming application has upgraded.

## Boundaries worth keeping visible

An unencrypted NDJSON archive should be handled as sensitive local data even though its events retain signatures. Ownership and signature checks protect integrity; they do not make the file confidential. Relay synchronization depends on the relays selected by the user and does not promise permanent retention or complete history.

For Blossom, disposable identities and HTTPS reduce linkability and transport exposure for encrypted uploads, but a server can still observe ciphertext size, hash, IP address and timing. Rejecting redirects keeps bytes and authorization within the configured server list; it does not make an untrusted server private.

## A practical upgrade check

Confirm that the installed extension reports 0.8.12 before testing Archive. Start with a manual synchronization against a small, known relay set, inspect counts and errors, and keep exported files in protected storage. Developers adopting SDK 1.0.4 should pin the published integrity value, test cancellation and session changes, and keep uncertain payment outcomes separate from confirmed failures.
