---
issue: "2026-09-18"
locale: "en"
status: "prepared"
subject: "Amethyst finds nested comments sooner"
preheader: "A released client fix, plus the extension and SDK baseline for 11–18 September."
coverageStart: "2026-09-11T08:00:00Z"
coverageEnd: "2026-09-18T08:00:00Z"
timezone: "Europe/Zurich"
---

## A released improvement to reply discovery

[Amethyst 1.15.2](https://github.com/vitorpamplona/amethyst/releases/tag/v1.15.2), published on 12 September at 14:42 UTC, includes Android and desktop downloads. Its [NIP-22 filter change](https://github.com/vitorpamplona/amethyst/pull/4095) lets engagement queries discover nested comments through their conversation root, alongside the existing queries for direct replies.

The distinction is small but consequential: a reply to a comment names the original conversation in an uppercase tag, while its lowercase tag points to the immediate parent. Looking only for the parent misses that nested reply when querying the original item. Separate root filters correct the query. Relay availability and time limits still determine which events arrive; the change does not guarantee every reply will load.

The same release corrects discovery of NIP-34 pull request updates. Our [source walkthrough](https://nostr-wot.com/news/nip-22-amethyst-loads-nested-comments) explains both cases. GitHub downloads establish distribution there, not the status of an app-store rollout.

## Our extension and SDK at this issue’s cutoff

This recovered issue covers 11 September, 08:00 UTC, through 18 September, 08:00 UTC. The extension’s [0.7.0 download](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0), published on 10 September at 22:29 UTC, remains the GitHub release baseline at that cutoff. It is background from the previous issue. Its [released changelog](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) describes identity-path and recovery changes; a downloadable Firefox ZIP does not establish Firefox store availability.

Official npm publication records for all 12 non-private SDK packages show no version published in this window. The [umbrella package](https://registry.npmjs.org/nostr-wot-sdk) baseline is 1.0.1, published on 16 August. Releases dated 19–20 September belong to the next issue and are excluded here.

## A useful check for client builders

When a nested reply appears only after opening a thread, compare the direct-parent and root filters before blaming missing content. The Amethyst patch provides a concrete implementation to study. Use disposable test events and inspect the actual relay query; a protocol tag and a client’s handling of it are separate things.
