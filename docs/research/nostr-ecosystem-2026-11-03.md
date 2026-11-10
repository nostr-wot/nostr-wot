# Nostr ecosystem watch: 2026-11-03

Evidence window: **2026-10-20 08:00:00 UTC inclusive through 2026-11-03 09:00:00 UTC exclusive**. This corresponds to 10:00 Europe/Zurich at both boundaries across the daylight-saving change.

## Selected discovery

Amethyst v1.21.0 was published on 1 November 2026. Its tagged changelog documents inline NApplets, sandboxed WebXDC, a guided Web of Trust setup card, drss.io listening, Pico-8 and broader Home content.

This is an update to an existing active client. It is not a new launch. The active label is grounded in the non-archived public repository and the dated release commit, and does not claim availability, stability or security.

## Primary evidence

- [Amethyst v1.21.0 release](https://github.com/vitorpamplona/amethyst/releases/tag/v1.21.0), published 2026-11-01.
- [Tagged v1.21.0 changelog](https://github.com/vitorpamplona/amethyst/blob/v1.21.0/docs/changelog/v1.21.00.md), blob ef1128bb2bd4730215a28bb7adc353747cef3207.
- [Release commit f3e6a6d](https://github.com/vitorpamplona/amethyst/commit/f3e6a6de6fd52ab182971807304793f266c7b4df), dated 2026-11-01.

Amethyst v1.20.0 also fell inside the window, but v1.21.0 superseded it before the cutoff. It was not padded into a second story.

## Classification and limits

The changelog describes hardening after a security review: a separate decrypt grant for private-event reads, signature checks before events reach apps, removal of cookies and WebRTC from embedded frames, and bounded public-HTTPS prefetching. This is classified as security hardening, not an exploited incident. The source cites no CVE, advisory or observed attack.

No NApplet, WebXDC package or trust provider was executed. Android and desktop behavior was not independently tested. The GitHub release and tagged source establish publication there, not installation or approval in every app store.

Existing founder attribution is preserved unchanged because it already carries a direct self-identification source. No role was inferred from commits.

## Deduplication and delivery

No issue manifest or relevant open publication PR existed for this window. Open PRs #136, #67 and #61 are unrelated or retained records. The earlier Mostro Nostr receipt remains untouched.

The article is Nostr-eligible after verified live publication. LinkedIn is intentionally ineligible because this is third-party client and ecosystem news, not a substantive Nostr WoT platform or team announcement. No sender, email, subscriber, newsletter or schedule action was taken.

## Publication state

[PR #141](https://github.com/nostr-wot/nostr-wot/pull/141) merged as `1c6b42b37f8f0c91b4fb99bf7e4baf500f5a4716`. [Exact-head checks](https://github.com/nostr-wot/nostr-wot/actions/runs/41609170042) passed typecheck, unit and workshop tests, cache parity, social lint, production build, and the rendered sitemap, metadata, JSON-LD and preview-image audit.

[Production run 41611186722](https://github.com/nostr-wot/nostr-wot/actions/runs/41611186722) passed the same exact-tree verification, artifact packaging, healthy release activation, live homepage and refreshed sitemap checks, and IndexNow submission.

The [English article](https://nostrwot.com/news/2026-11-03/amethyst-1-21-napplets-and-web-of-trust) and [Spanish article](https://nostrwot.com/es/news/2026-11-03/amethyst-1-21-napplets-y-web-de-confianza) were opened after deployment and rendered their localized title, publication date, article body, illustration and primary-source links. The [Amethyst directory record](https://nostrwot.com/projects/amethyst) rendered v1.21.0, the 1 November release date and the 3 November evidence refresh.

Nostr is live and queued, but `data/social-posted.json` has no receipt for this slug yet. The existing hosted sender remains authoritative; no manual or uncertain dispatch was attempted. LinkedIn remains intentionally ineligible. No email, subscriber, newsletter or schedule action was taken.

## Receipt reconciliation and alternate-week checkpoint (2026-11-10T08:59:24Z)

The durable social ledger now confirms Nostr delivery at 2026-11-03T10:51:14.893Z with receipt [nevent1qy28…zerf50j42ng](https://njump.me/nevent1qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hszrthwden5te0dehhxtnvdakqqg88c3n3kwwjg6y8crgsvc4fzxest6gq34f2hpada50qcqadmzerf50j42ng). No sender retry or workflow dispatch was performed. LinkedIn remains intentionally ineligible because Amethyst is a third-party client and ecosystem project.

10 November is the expected alternate Tuesday in the fortnightly cadence anchored 8 September. No new ecosystem research issue, directory change, article, illustration, social copy or delivery attempt was created. The next eligible ecosystem slot is 17 November 2026.

Newsletter preparation and delivery systems were untouched. No subscribers, mail credentials, preview or sender workflow, sent archive, email, social announcement or schedule setting was accessed. Newsletter delivery remains blocked pending fresh authorization.
