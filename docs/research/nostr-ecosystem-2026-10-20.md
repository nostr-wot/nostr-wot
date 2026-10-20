# Nostr ecosystem watch: 2026-10-20

Evidence window: **2026-10-06 08:00:00 UTC inclusive through 2026-10-20 08:00:00 UTC exclusive**. Research started at 2026-10-20 08:04:08 UTC.

## Selected discovery

Mostro v0.20.0 was published on 15 October with downloadable binaries, manifest files and signatures. The actual tag resolves to f1f7a62b337e35f345e2056ea99b88988a50afcc. The article covers payment deferral, the distinction between unreachable and unsynced LND, automatic maintenance and the separate kind 38389 health interface. It describes an existing project's released update, not a new exchange launch or an independently proven reliability improvement.

The tagged health document, not a superseded PR description, controls the final behavior described. A node reports its own backend's view; a signed event is not independent proof of synchronization. No trading daemon or target binary was run, no payment was sent and no production traffic was generated. Upstream automated tests and Cashu-mode manual checks are attributed to the upstream record, with Lightning manual-testing gaps retained.

## Directory and security

Mostro and Amber receive current release/status evidence in all seven existing datasets. IDs, enums, names, historical story dates and URLs are preserved. All seven were required because the existing CI compares fixed fields across the datasets; Spanish display text remains authored Spanish, not an English fallback. Separate WoT integrations are untouched.

Mostro's two person credits were removed: its released README gives copyright and links a contributors page, neither of which explicitly proves the recorded creator/maintainer roles. No substitute identity, founder, npub or social URL was inferred.

The three public Amber advisories published 14 October list 6.6.9 as patched. Permission revocation and clipboard cleanup are High, affecting <= 6.6.8. The settings-triggered key-loss bug is Moderate, affecting >= 6.5.0 through 6.6.8. This is advisory/fix coverage, not a claim of exploitation. Already lost secrets cannot be recovered by the key-rotation fix. Older security records remain dated historical baseline entries.

The committed machine snapshot was refreshed only after all 42 repositories and release lists resolved through connected GitHub reads. It is not a manual security review of all 42 projects. No credentials were transferred to the sandbox.

## Deduplication and scope

The October 6 Nostream issue merged as PR #79 and has a confirmed Nostr ledger receipt at 2026-10-06T22:59:31.028Z. Its intentionally omitted LinkedIn channel is healthy. The public event and Nostr-basics tutorials also have confirmed receipts and are not reposted. PR #67 is labeled duplicate; PR #61 is unrelated. Neither is changed. No current ecosystem branch or manifest existed before this run.

Own work was checked first. Extension v0.8.13 has published GitHub downloads and a tagged changelog; Chrome approval was not established because the store page redirected to an inaccessible consent page. The SDK private root is not a published package. npm registry access and fresh YouTube verification were unavailable, so no store, SDK or new-video claim was invented. NIP PRs #2503, #2504 and #2511 were enumerated by merge time. Other client and relay release candidates are recorded in the JSON manifest, not padded into the article.

## Publication state

Seven article editions, one deterministic visually inspected illustration and Nostr-only copy are prepared. Hosted exact-tree typechecking, tests, parity, social lint, build and rendered SEO/preview audit remain required before merge. Deployment, live pages/metadata and the durable Nostr receipt must be verified separately. LinkedIn is explicitly `linkedin_skipped` under the own-platform/team-only policy. No newsletter work, subscriber access, email, social dispatch, credential or schedule change is part of this issue.
