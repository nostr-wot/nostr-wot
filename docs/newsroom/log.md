# Newsroom run log

One line per run of the daily newsroom agent, including runs that published nothing.

Format:

```
YYYY-MM-DD HH:MM UTC  published|skipped|paused|failed  <detail>
```

A `skipped` line is a normal, healthy outcome: it records that the agent ran, looked,
and found nothing that cleared the bar. An absence of lines means the agent did not
run at all, which is a different problem entirely.

---
2026-08-24 17:40 UTC  published  nip-22-drops-its-kind-1-prohibition  (2 sources)
2026-08-25 13:11 UTC  published  nip-30-extends-custom-emoji-to-comments  (1 source)
2026-08-26 18:06 UTC  skipped    nothing new since last run; considered: #2448 (covered 2026-08-25), #2358 (covered 2026-08-24), Amethyst v1.14.0 (already cited as a source)
2026-08-27 13:10 UTC  published  nip-a3-adds-payto-payment-targets  (2 sources)
2026-08-28 13:10 UTC  published  nip-a3-rewritten-a-day-after-merging  (3 sources)
2026-08-29 13:03 UTC  skipped    nothing new since last run; nips master has no commit after 24b2ae9f (2026-08-27, covered 2026-08-28); no client or relay release since Amethyst v1.14.0 (2026-08-22, already cited)
2026-08-31 13:07 UTC  skipped    Monday digest window (2026-08-25..2026-08-31) holds no uncovered change; all of #2448, #2119 and commit 24b2ae9f already published as stories on 08-25, 08-27 and 08-28; nips master HEAD is still 24b2ae9f (2026-08-27) and no client or relay release since Amethyst v1.14.0 (2026-08-22, already cited)
2026-09-01 13:09 UTC  published  nip-67-adds-an-auth-hint  (3 sources)
2026-09-02 13:20 UTC  published  nip-84-adds-i-tags-to-highlights  (3 sources)
2026-09-03 13:09 UTC  published  strfry-1-1-2-fixes-a-websocket-memory-dos  (4 sources)
2026-09-04 13:20 UTC  published  nip-78-puts-app-data-behind-auth  (4 sources); one story per day, so two other candidates were left uncovered and both remain in the 2026-09-07 Monday digest window: #2460 (NIP-01, limit zero now MUST skip stored events and still send EOSE, merged 04:19 UTC today) and Primal Android 3.5.27 (2026-09-03, rejects local signer requests with a mismatched signing identity and hardens incoming NWC request auth)
2026-09-08 12:54 UTC  published  relayer-2-2-19-fixes-overlapping-count-filters  (3 sources)

2026-09-16 12:44 UTC  pending    nip-22-amethyst-loads-nested-comments (5 sources; seven editions and social copy prepared; PR CI, merge and production verification pending; LinkedIn and Nostr delivery pending scheduled workflow and durable ledger). Recovery: nip-78-puts-app-data-behind-auth has LinkedIn confirmed but no Nostr receipt; preserve its ledger and do not retry the whole article. No unfinished newsroom PR found; unrelated PR #9 excluded.

2026-09-16 12:52 UTC  published  nip-22-amethyst-loads-nested-comments (5 sources); resolves the pending entry above. Content PR #41 merged as 6e03426e0a98ea5139674fec95a9d196ba7f2347 after passing CI 35097630813 (163 tests, TypeScript, parity, social lint, build). Production deployment 35097917324 succeeded; all seven live pages return 200 with correct canonical/hreflang, descriptions, Open Graph and NewsArticle data. LinkedIn and Nostr: pending scheduled social workflow and per-channel durable receipts in data/social-posted.json; verify next run without regenerating or reposting. Recovery clarification: the older nip-78 copy contains LinkedIn only, and its receipt covers that authored channel; no whole-entry retry is needed.

2026-09-20 08:20 UTC  pending    nip-02-gives-petnames-resolvable-paths (3 sources; seven editions, deterministic illustration and social copy prepared; PR CI, merge, production and scheduled social delivery verification pending)
2026-09-22 08:00 UTC  published  amber-6-6-5-separates-backup-encryption-from-app-permissions  (2 sources; fortnightly ecosystem)

2026-09-23 15:25 UTC  published  nip-02-limits-petnames-to-ascii  (3 sources)
2026-09-24 07:59 UTC  published  amethyst-1-16-adds-bolt12-and-fitness  (4 sources; recovered draft PR #53, source claims reverified before publication)
