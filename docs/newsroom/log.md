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
