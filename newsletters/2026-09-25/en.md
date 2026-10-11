---
issue: "2026-09-25"
locale: "en"
status: "prepared"
subject: "Nostr WoT adds bounded app wallet connections"
preheader: "Extension 0.8.3, npm graph releases and Amber 6.6.5, verified for 18 to 25 September."
coverageStart: "2026-09-18T08:00:00Z"
coverageEnd: "2026-09-25T08:00:00Z"
timezone: "Europe/Zurich"
---

## Separate wallet access for each app

[Nostr WoT Extension 0.8.3](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.3), published on 23 September at 07:28 UTC, can create multiple Nostr Wallet Connect connections for the extension's LNbits wallet. Each app can receive its own named connection, daily spending limit and expiry date. Wallet settings show active connections and budget use, and let the user copy a connection string, display its QR code or revoke it without replacing every other app's access.

The release notes say connection secrets remain encrypted locally and interrupted registrations can be recovered. Their validation used an empty LNbits wallet to create, list and revoke connections and to complete a signed NWC `get_info` exchange. No real payment was sent. Custom LNbits servers need a compatible management adapter, so this is not a promise that every NWC service offers the same controls.

Version 0.8.3 includes the preceding 0.8 releases. [Version 0.8.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.0) restored the experimental `window.nostr.wot` API as an explicit, disabled-by-default option and added bounded graph synchronization, follow-list replacement warnings and account-mute scoring. GitHub provides Chrome, Firefox and source ZIPs with recorded SHA-256 digests. These downloads establish GitHub distribution. They do not establish browser-store publication. The current Chrome listing was checked during recovery, but it cannot reconstruct the store version at the 25 September cutoff. No matching Nostr WoT listing was found in Firefox Add-ons, so this issue makes no Firefox-store claim.

## Graph packages reach npm

The npm registry records [`@nostr-wot/graph` 0.3.0](https://www.npmjs.com/package/@nostr-wot/graph) at 20 September, 00:17 UTC, and the umbrella [`nostr-wot-sdk` 1.0.2](https://www.npmjs.com/package/nostr-wot-sdk) one minute later. The graph release batches relay crawls, adds an explicit hop bound, preserves deterministic replaceable-event versions and compresses persisted follow rows. It also bounds batch distance queries and retains pending writes after a failed flush.

There is one migration limit to plan for: the graph database moves to IndexedDB schema 2, and older SDK versions cannot reopen an upgraded namespace. Test the update with a disposable profile or a rebuildable cache before deploying it to stored user data. Version 0.3.1 followed at 10:47 UTC and is the latest graph version at this issue's cutoff. Its package changelog describes documentation changes only and states that it has no runtime changes.

## Amber narrows a backup-permission boundary

[Amber 6.6.5](https://github.com/greenart7c3/Amber/releases/tag/v6.6.5), published on 21 September at 14:32 UTC, encrypts signer backups with a dedicated HKDF-derived key outside the NIP-44 derive-key namespace. According to the release notes, this prevents an app with remembered `nip44_decrypt` permission from using that permission to read backup payloads containing per-app NIP-46 secrets and local keys.

Old identity-key-encrypted backups can still be restored until a later backup publication overwrites them. The release provides Android APKs plus a signed checksum manifest. That establishes available artifacts and a verification path, not installation on a particular device or rollout through every store. The project reports a fixed boundary, not an exploited incident or affected-user count.

## A practical upgrade check

Give each wallet app a separate connection with the smallest useful daily limit and an expiry date, then confirm that revoking one leaves the others intact. For the SDK, test schema migration and cache rebuilding before using the new graph package with persistent data. For Amber, verify the installed version and publish a fresh backup if you rely on relay-backed recovery. These checks reduce shared access and stale-format surprises without treating a release note as proof of every deployment.
