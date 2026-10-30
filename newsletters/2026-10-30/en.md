---
issue: "2026-10-30"
locale: "en"
status: "prepared"
subject: "Stable passkey SDK and Extension 0.8.20 are published"
preheader: "Verified npm and browser packages from 23 to 30 October, with recovery and Lightning address changes."
coverageStart: "2026-10-23T08:00:00Z"
coverageEnd: "2026-10-30T09:00:00Z"
timezone: "Europe/Zurich"
---

## Stable passkey packages are on npm

The npm registry published [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) at 20:24 UTC and [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk) at 20:25 UTC on 23 October. Both packages point to commit `384023f` and carry registry integrity values. This is distribution evidence, not just a repository tag or build.

The stable release makes passkey modes explicit. A derived passkey produces the Nostr key from WebAuthn PRF output, while a stored passkey protects an existing key, seed or multi-account vault. Ambiguous legacy credentials are reported as ambiguous instead of being silently interpreted. Encrypted recovery records can use host-controlled local, provider or relay storage, but the host application remains responsible for WebAuthn, consent, transport, signature checks and recovery testing.

SDK 3.0.1 also supports explicit Nosskey backups and a provider signer that pins the iframe window, HTTPS origin and selected account. Protocol support does not prove that every device, browser or provider can recover an account. Developers should test the exact authenticator and storage path they intend to support.

## Extension 0.8.18 unifies import and recovery

[Extension 0.8.18](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.18) was published on 24 October with separate Chrome and Firefox packages, source and SHA-256 checksums. It detects supported passkeys and backups, previews the recovered public identity before saving and can recover compatible Nosskey backups without changing the original identity. It also restores optional Wi-Fi sound pairing on 44.1 kHz audio devices. Listening begins only on request, stops after one attempt or 30 seconds and still requires confirmation on the phone.

[Version 0.8.19](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.19) fixes account-addition errors that incorrectly reopened first-time auto-lock setup. Duplicate accounts and failed vault checks now show the actual error with a retry option while preserving existing protection settings.

## Shorter Lightning addresses in 0.8.20

[Version 0.8.20](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.20) was published on 29 October. Hosted Lightning addresses now use the shorter `@nostrwot.com` domain in wallet settings, copy actions, receive QR codes and optional profile updates. Existing `@zaps.nostr-wot.com` addresses still route to the same wallet. Custom-provider addresses and the wallet API server are unchanged, and profile updates still require confirmation.

Before upgrading, install the package for the correct browser and compare its SHA-256 value with the release checksums. Back up the current account configuration, preview the recovered public key before saving and test recovery on a second supported device. An address display change is not a reason to discard an older working address.
