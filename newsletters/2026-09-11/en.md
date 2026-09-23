---
issue: "2026-09-11"
locale: en
status: approved
subject: "Nostr WoT 0.7.0: more control over your identities"
preheader: "Custom identity paths, clearer approvals, and six projects to explore."
coverageStart: "2026-09-04T08:07:05.572Z"
coverageEnd: "2026-09-11T08:07:05.572Z"
timezone: Europe/Zurich
---

## Your identities, with more control

Nostr WoT extension **0.7.0** is available as a [GitHub download](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0), published on **10 September 2026 at 22:29 UTC**. The live [Chrome listing](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) also shows **0.7.0**, updated **11 September**. Firefox store availability remains **unknown**: both the listing and its API returned 404. A Firefox ZIP on GitHub does not establish store approval or installation compatibility.

The [released changelog](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) includes editable account names, custom derivation paths under Advanced, and public-key previews before creating a sub-account. Existing standard keys remain unchanged. Keep the exact custom path with your seed backup: a local account name is not a recovery secret.

Other changes include restoring encrypted seed and PQ backups, clearer one-time versus persistent approvals, and wallet cache encryption. The release notes require Firefox desktop **140+** or Android **142+** and describe new consent prompts on upgrade. Check those requirements before choosing a download.

## Beyond the extension

**relayer 2.2.19**, [published on 8 September](https://github.com/fiatjaf/relayer/releases/tag/v2.2.19), adds an exact union-count interface for overlapping filters. The [diff](https://github.com/fiatjaf/relayer/compare/v2.2.18...v2.2.19) shows an important limit: storage backends must implement it; older backends still add separate counts and can overcount overlapping results.

On **9 September**, [NIP-A3’s payment-type clarification](https://github.com/nostr-protocol/nips/pull/2463) added `bitcoincash` and `tron` and clarified URI schemes for ambiguous unknown types. This is a specification change, not evidence that every client already supports it.

We checked the official npm records for all **12 non-private SDK workspace packages**. No version publication fell within this issue’s window. The [umbrella package](https://registry.npmjs.org/nostr-wot-sdk) remains **1.0.1**, published **16 August**, so it is background rather than a new weekly release.

## Six new directory entries, not six new launches

Our [project index](https://nostr-wot.com/projects) gained **Damus, Amethyst, Primal, Coracle, Amber and Nostur** on [8 September](https://github.com/nostr-wot/nostr-wot/commit/979e9e7cb4130cceddd518fc394d5a649ad891f7). These are established projects newly indexed here. Each record links its sources and any verified people/profile attribution. Development status is not a security rating.

## Security: hardening, not a reported hack

The 0.7.0 changelog documents tighter account/session authorization and cancellation of stale operations after locking or switching accounts. These are released fixes and hardening measures. The reviewed evidence does not establish exploitation, affected victims, or a complete incident survey.

## One useful next step

Read the [identity-path guide](https://nostr-wot.com/guides/custom-identity-paths) before using Advanced. Understand how the seed and exact path recover an identity, and why changing its local name does not change its public key.
