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

The seven authored editions, synchronized directory evidence, deterministic inspected illustration and Nostr-only copy are prepared. Hosted checks, merge, deployment, live routes and a durable Nostr receipt remain pending and must be recorded without blind retries.
