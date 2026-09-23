# Custom identity paths: review record

Prepared 11 September 2026. Seven matching editions in content/guides/{en,es,de,fr,it,pt,ru}/custom-identity-paths.mdx, all published: true following explicit user approval to publish the guide and post it to LinkedIn and Nostr. Social copy is in social/custom-identity-paths.json. No newsletter send is attached.

## Release evidence

- Public non-draft v0.7.0 release: https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0, published 2026-09-10T22:29:29Z. Chrome and Firefox ZIP assets are present. This proves download availability, not store approval.
- Release tag d00074612d2c05aa53998a1fcbfd0c1a37d3eca6. Read CHANGELOG.md and src/screens/Wizard/SubAccountStep.tsx at this tag. Changelog explicitly says pending store publication.
- Checked creation.ts, derivation.ts, useSubAccountPreview.ts and constants/crypto/bip32.ts: optional local name, next unused existing path, Advanced field, npub/hex preview, stale-preview protection and exact saved derivationPath.
- Chrome listing returned a stale indexed page; not used as proof of current version. Mozilla public addon endpoint returned 404. Neither channel is claimed to have approved 0.7.0.
- SDK checked separately: @nostr-wot/signers 1.2.0 published 2026-08-16T20:19:08.286Z; @nostr-wot/pq 0.2.2 published 2026-08-16T20:19:07.611Z. The published pq helper uses a numeric account parameter. This guide makes no SDK custom-path or PQ recovery claim.
- NIP-06 source checked: https://github.com/nostr-protocol/nips/blob/master/06.md. Its hardened account increment differs from the extension's retained final-component sequence. Explained explicitly; no universal recovery compatibility claim.

## Publication checklist

All editions reviewed and GitHub release availability verified. Guide collection indexes entries automatically. Images are explanatory diagrams, not screenshots.
