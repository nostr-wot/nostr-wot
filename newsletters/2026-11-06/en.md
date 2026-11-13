---
issue: "2026-11-06"
locale: "en"
status: "prepared"
subject: "Extension 0.8.22 improves remote signing and recovery"
preheader: "Verified downloadable releases from 30 October to 6 November, plus Amethyst 1.21."
coverageStart: "2026-10-30T09:00:00Z"
coverageEnd: "2026-11-06T09:00:00Z"
timezone: "Europe/Zurich"
---

## Extension 0.8.21 adds permission templates and safer recovery

[Nostr WoT Extension 0.8.21](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.21) was published on 2 November at 18:46 UTC. The release includes downloadable Chrome, Firefox and source archives plus SHA-256 digests. These artifacts prove that the version was distributed through GitHub, but they do not prove approval in either browser store.

The release adds optional permission templates when connecting a site, including a preset for the Nostr WoT Playground. It also reorganizes seed phrases, private keys and passkey recovery under Keys & Backups, groups relay-authentication requests, and makes one-time bulk decisions clearer.

Security-related changes recheck graph permissions after approval and serialize consent changes so a newer denial or disconnect is not overwritten by an older pending action. Passkey-provider backups now stay within the provider's 2 KB write limit by storing only the associated key material instead of a growing vault. Existing recovery files and legacy provider backups remain readable.

## Remote signer approvals stay with the signer in 0.8.22

[Version 0.8.22](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.22) followed on 2 November at 19:18 UTC with its own Chrome, Firefox and source archives and SHA-256 digests. Nostr Connect accounts now delegate signing, authentication, follow-list changes and message encryption or decryption to the external signer without adding duplicate extension approval prompts. The extension still enforces site connection, identity access, validation, wallet and graph permissions.

The 5 November browser-store check still showed 0.8.17 in Chrome and Firefox. Versions 0.8.21 and 0.8.22 are therefore described here as downloadable releases, not as browser-store updates. The npm registry still showed [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) and [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk), both published on 23 October. No new SDK package was published in this evidence window.

## Amethyst 1.21 brings small apps into notes

[Amethyst 1.21.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.21.0) was published on 1 November with Android and desktop artifacts. It can run NApplets and WebXDC apps inside notes, adds listening and game formats, and introduces a guided Web of Trust setup card. The release also narrows embedded-app access: private-event reads require a decrypt grant, signed events are verified before delivery, and frames do not receive cookies, WebRTC or identity keys.

This is a released update to an existing client, not a new project launch or evidence of an exploited incident.

Before installing a downloadable extension package, choose the archive for the correct browser and compare its SHA-256 digest with the release metadata. Back up your current account configuration, confirm the public identity before saving a recovery, and verify every request shown by an external signer.
