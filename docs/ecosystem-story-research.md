# Ecosystem story research: what no source states

Each project page tells its own story from the project's own sources: the
launch date, the origin of the name, why it was built, and the milestones
since. Where a field is missing from `story` in `data/ecosystem-projects.json`,
it is missing because no source states it, not because nobody looked.

This file records what was searched for and not found, so that a later pass
does not fill a gap with a plausible guess. 36 of the 42 projects have no
published explanation of their name anywhere; the six that do are the six that
state it themselves, in a README or an interview.

| Project | What was not found |
| --- | --- |
| `nostrudel` | No dated launch announcement found. The author's own site says only that noStrudel has been 'worked on since late 2022' (https://hzrd149.com/projects/), which matches the repository date but is not a release. The CHANGELOG goes back to 0.2.0 but carries no dates. No published explanation of the name. |
| `jumble` | No dated launch announcement found; the earliest git tag (v26.5.1, 2026-05-02) is far later than the site went live. The README is purely technical. No published explanation of the name. |
| `0xchat` | No published explanation of the name and no statement of motivation beyond a feature description were found. |
| `nsec-app` | No published explanation of the names nsec.app or noauth. |
| `strfry` | No published explanation of the name and no explicit statement of why strfry was built were found; the README and talk abstract describe what it does, not why. |
| `nostream` | README is purely technical; no statement of motivation and no published explanation of the name nostream or of the rename from nostr-ts-relay. |
| `nostr-tools` | The README describes it only as 'Tools for developing Nostr clients' providing lower-level functionality. No launch post, no published explanation of the name, and no statement of motivation. |
| `go-nostr` | No launch announcement, no published name explanation, and no statement of motivation were found. The README describes it only as "A set of useful things for Nostr-related software" and now says the library is in maintenance mode, pointing to fiatjaf.com/nostr, without a date. |
| `nak` | No launch post and no statement of motivation beyond the README's list of what the tool can do. |
| `lnbits` | Bitcoin Magazine (2024-09-24) dates the project to 2019 and the company to 2022, but no source gives a month for the first public release, so launched is omitted. Predates Nostr; it is a Lightning project. |
| `shopstr` | No published explanation of the name. |
| `njump` | The about page frames the service around the verb (visitors 'jump' to a client; newcomers 'jump in' via search) but never states that this is the name's origin, so nameOrigin is omitted. |
| `obelisk` | No published explanation of the name. No launch announcement: the repository dates from 2026-04-08 and the first release is tagged `the-comeback` (2026-07-28), which is not a first launch, so no launch date is recorded. The motivation is the project site's own statement of the premise. |
