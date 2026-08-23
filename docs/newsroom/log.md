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
