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

The new article is eligible for Nostr only after verified live publication. LinkedIn is intentionally ineligible because this is third-party ecosystem news, not a Nostr WoT platform or team announcement. No sender, email, subscriber, newsletter or schedule action was taken.

## Publication state

Scoped PR, exact-head checks, production deployment and live-page verification are pending.
