---
issue: "2026-10-23"
locale: "en"
status: "prepared"
subject: "Extension 0.8.17 ships safer passkeys and local signing"
preheader: "Verified browser packages from 16 to 23 October, plus the exact SDK release boundary."
coverageStart: "2026-10-16T08:00:00Z"
coverageEnd: "2026-10-23T08:00:00Z"
timezone: "Europe/Zurich"
---

## Five verified extension releases

Nostr WoT Extension published versions [0.8.13](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.13) through [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) during this issue's evidence window. Each GitHub release includes separate Chrome and Firefox packages, reproducible source, SHA-256 checksums and a non-draft publication time. The Chrome and Firefox stores both showed 0.8.17 as current on 23 October.

Version 0.8.13 adds passkey-protected vault creation and recovery, encrypted recovery files, explicit relay recovery and an archive explorer. Provider, file and relay recovery are separate choices. A relay acknowledgement is not proof that another device can recover the account, so keep the encrypted file and test the chosen recovery path.

## Phone signing remains experimental

Version [0.8.14](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.14) adds an experimental local bridge to a compatible Nostr WoT phone build over Wi-Fi, or Bluetooth where the browser supports Web Bluetooth. Pairing uses a matching code. The computer receives a temporary Network account and sends signing or encryption approvals to the phone.

The bridge supports NIP-07 signing and classic NIP-04 and NIP-44 encryption. Wallet identity operations, internal publishing and post-quantum operations are unavailable while phone signing is selected. Closing the bridge removes the temporary account, and a disconnected phone never falls back to local keys. Sound pairing is unavailable in this release.

## Dice, coins and clearer permissions

Version [0.8.15](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.15) adds an offline-checkable recovery-phrase flow using 256 coin flips as raw bits or dice input hashed with SHA-256. The separate game tab records the input but does not display the resulting phrase. The release also groups post-quantum keys, Web of Trust and the local bridge under Experimental, adds labels for unnamed accounts and prevents unreachable relays from blocking onboarding indefinitely.

Version [0.8.16](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.16) reduces repeated relay sign-in prompts. An explicit Always choice can cover all waiting relay requests for the selected site or all connected sites. Grants remain visible and revocable under Permissions, so broad access should be reviewed after use.

Version [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) keeps passkey setup mounted while the first account is saved and reuses the recent verification for the initial auto-lock choice. The one-use authorization expires after five minutes and is revoked by locking, switching accounts or reauthentication.

## Release boundary and upgrade check

No new SDK package was published before the 23 October 08:00 UTC cutoff. nostr-wot-sdk 2.0.0 therefore remained the latest verified SDK version inside this window. The pull request for SDK 3.0.1 did not merge until 20:21 UTC that day, so it belongs to the next issue.

Before upgrading, select the package for the correct browser, compare its SHA-256 value with the release checksums and keep a working recovery method. Treat the phone bridge as experimental, review remembered relay grants and confirm that passkey recovery works on a second supported device before depending on it.
