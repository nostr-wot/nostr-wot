# Nostr ecosystem watch: 2026-10-06

Evidence window: 2026-09-22 08:00 UTC through 2026-10-06 08:00 UTC, matching 10:00 Europe/Zurich boundaries.

## Selected story

Nostream v3.2.0 was published on October 3. It adds an optional two-relay HAProxy topology with readiness checks and rolling replacement, a default-off action for reports from configured trusted moderators, and corrections for multi-tag and multi-filter queries.

This is a maintenance release for an existing project, not a new launch. The directory record was updated in English and Spanish. An unsupported person attribution was removed because repository ownership alone does not establish a creator, founder or maintainer role.

## Evidence boundaries

The deployment PR records successful Compose and HAProxy syntax checks, but says the rolling replacement script was not exercised on a live stack with a WebSocket client connected. The article therefore reports the design and its upstream validation without treating zero downtime as independently demonstrated.

NIP-56 describes kind 1984 reports as subjective signals and warns that automatic relay moderation can be gamed. Nostream leaves hiding off by default and requires both NIP-56 handling and the new hide setting.

## Deduplication

Recent Amber, nak, Nostr WoT, strfry and Amethyst releases were already covered by the separate newsroom. They were not repeated here. Open guide PRs #66 and #67 remain untouched because they are outside the ecosystem routine.

## Limits

No production relay was operated, no traffic was generated, and no deployment behavior was independently reproduced. The release has source archives and repository deployment files, not standalone executable assets.
