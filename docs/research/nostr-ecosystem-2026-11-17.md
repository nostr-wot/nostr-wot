# Nostr ecosystem watch: 2026-11-17

Evidence window: **2026-11-03 09:00:00 UTC inclusive through 2026-11-17 09:00:00 UTC exclusive**. Both boundaries are 10:00 Europe/Zurich in CET.

## Selected discovery

LNbits confirmed that multiple installations were attacked on 8 November. Its own infrastructure and community-operated systems were affected, funds were stolen and services were disrupted. The project identified SSRF flaws in legacy Python extensions and attacks against extensions with available but unapplied fixes.

LNbits published v1.7.0 on 10 November and v1.7.1 on 11 November. The latest release rotates authentication keys. The project’s recovery guidance says versions before 1.7.0 are affected and that updating alone may not remove an existing server compromise or invalidate exposed credentials.

## Primary evidence

- [November 8th Incident Report](https://news.lnbits.com/news/november-8th-incident-report), published 16 November 2026.
- [LNbits 1.7.0 security update and upgrade guidance](https://news.lnbits.com/news/lnbits-1-7-0-security-update), published 10 November 2026.
- [LNbits v1.7.1 security patch](https://github.com/lnbits/lnbits/releases/tag/v1.7.1), published 11 November 2026 at commit `4fa70f338d274e14fc82746a83fba5c2c658211f`.
- [LNbits v1.7.0 urgent security update](https://github.com/lnbits/lnbits/releases/tag/v1.7.0), published 10 November 2026 at commit `aaeff9a62a9310d9d14c22cc188bbd21c347577d`.

## Classification and limits

This is classified as a confirmed exploited incident because the project reports attacks on multiple installations, stolen funds and server compromise. The project says the activity was consistent with autonomous AI-driven attacks, but it cannot conclusively identify the tools or systems used. The article preserves that uncertainty.

No affected server was inspected and no vulnerability was reproduced. The project has not yet published a complete technical exploit report. The article gives recovery guidance without exploit instructions.

## Other candidates

Nostur v1.35.0, Snort v0.5.6, Amber 7.0.0 prereleases and several other tagged releases were checked. The LNbits incident had greater immediate impact and a clearer operator action. Nostr WoT extension releases 0.8.23 through 0.8.25 and the published SDK package were checked but left to the separate platform and newsroom scope.

## Deduplication and delivery

No relevant ecosystem issue or open PR existed for this window. Open PRs #67 and #61 are unrelated. The prior Amethyst Nostr receipt remains untouched.

The durable social ledger confirms Nostr delivery at 2026-11-17T11:50:36.968Z with [the platform receipt](https://njump.me/nevent1qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hszrthwden5te0dehhxtnvdakqqgrvtr7gfume65gwpe6lpc68497l2de2770ernkdvn7lhgdgqlx4agj5mwpl). The expected alternate Tuesday on 24 November was used only to reconcile that existing delivery. No retry or workflow dispatch was attempted. LinkedIn remains intentionally ineligible because this is third-party ecosystem news, not a Nostr WoT platform or team announcement. No new issue, directory edit, article, illustration, social copy, newsletter, subscriber, email or schedule action was taken.

## Publication state

Published through [PR #163](https://github.com/nostr-wot/nostr-wot/pull/163), merged as `4091ec0ff17777a37ed4b6851e121ece19422171`. Exact-head [PR CI 44053933765](https://github.com/nostr-wot/nostr-wot/actions/runs/44053933765) passed typecheck, unit and workshop tests, cache parity, social lint, the production build and rendered-site audits. Post-merge [CI and deployment 44055903901](https://github.com/nostr-wot/nostr-wot/actions/runs/44055903901) passed on the committed tree.

Verified live pages:

- [English article](https://nostrwot.com/news/2026-11-17/lnbits-1-7-security-incident-recovery)
- [Spanish article](https://nostrwot.com/es/news/2026-11-17/lnbits-1-7-incidente-seguridad-recuperacion)
- [English LNbits directory](https://nostrwot.com/projects/lnbits)
- [Spanish LNbits directory](https://nostrwot.com/es/projects/lnbits)

Both article routes expose localized canonical metadata, NewsArticle and breadcrumb JSON-LD, primary citations and the inspected illustration. Both directory routes show the 17 November evidence, v1.7.1 and the confirmed incident report. Nostr delivery is confirmed by the durable repository ledger. LinkedIn remains intentionally ineligible.
