---
issue: "2026-10-16"
locale: "en"
status: "prepared"
subject: "SDK 2.0.0 ships, Amethyst adds trust tools"
preheader: "Verified SDK, desktop, signer and Web of Trust releases from 9 to 16 October."
coverageStart: "2026-10-09T08:00:00Z"
coverageEnd: "2026-10-16T08:00:00Z"
timezone: "Europe/Zurich"
---

## SDK 2.0.0 is published on npm

The npm registry records [nostr-wot-sdk 2.0.0](https://www.npmjs.com/package/nostr-wot-sdk) at 12 October, 22:32 UTC. The published package points to commit `2937df1`, includes a registry integrity value and moves project-owned code from MIT to GPL-3.0-only. Previously released versions keep their original license. The [published changelog](https://github.com/nostr-wot/nostr-wot-sdk/blob/2937df1b87d0593006b4482d10997cccfac696d1/packages/sdk/CHANGELOG.md) lists matching major versions of the scoped auth, Blossom, data, direct-message, graph, relay, signer, UI, wallet and WoT packages.

This is a licensing release, not evidence of a new runtime feature. Developers should review license compatibility before upgrading, pin the registry integrity value and test the exact package set their application installs. A private monorepo version, tag or build alone would not prove publication; the npm record is the distribution evidence here.

## Amethyst reaches desktop and expands trust support

[Amethyst 1.18.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.18.0) was published on 11 October at 19:27 UTC with Android and desktop artifacts for Linux, macOS and Windows, each carrying a recorded SHA-256 digest. Its release notes include the shared-interface desktop app and a NIP-85 network index and trust-provider integration.

[Amethyst 1.19.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.19.0) followed on 14 October at 13:16 UTC with another complete artifact set. The release adds NIP-46 remote-signer support to the login flow, Calendar Collection and RSVP event support, native Wayland support, per-client relay rate limiting with NIP-01 backoff, and fixes for trust-network synchronization and desktop Web of Trust downloads.

The practical change is separation of concerns. NIP-46 lets a client request signatures from a remote signer instead of holding the signing key itself. NIP-85 gives clients a standard way to consume trust assertions, but those assertions still depend on the provider and its data. Neither feature turns trust scores into objective truth or removes the need to review signing requests.

## Extension release boundary

No Nostr WoT Extension release was published during this evidence window. The last release before the cutoff remained [0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12), which the Chrome and Firefox stores had shown as current on 9 October. The next GitHub release, 0.8.13, was published on 17 October, after this issue's cutoff, so its functionality is deliberately excluded.

## A careful upgrade check

For SDK 2.0.0, review the GPL-3.0-only change, lock the resolved versions and run the application's own build and tests. For Amethyst, download only the artifact that matches the operating system and architecture, compare its recorded digest, back up account configuration, and test NIP-46 pairing with a low-risk account first. Confirm the signer displays the expected event before approving it. Treat NIP-85 results as one input to a decision, not as an authorization boundary.
