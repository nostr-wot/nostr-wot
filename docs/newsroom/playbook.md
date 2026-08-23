# Newsroom playbook

The daily newsroom agent reads this file at the start of every run. Changing what
counts as news, or how it is written, is a commit to this file. Do not encode
editorial rules in the schedule, where they cannot be reviewed or reverted.

## Before anything else

1. If `content/news/PAUSE` exists, stop immediately. Publish nothing. Append a
   `paused` line to `docs/newsroom/log.md` and exit. That file is the kill switch.
2. Pull `main`. Work from the latest commit, never a stale checkout.

## Where facts come from

**GitHub only.** Query the API. Do not search the web for news, and do not treat
any fetched prose page as a source.

This is not caution for its own sake. During the retrofill, a fetched "newsletter"
page returned content describing a private repository in terms lifted from internal
notes, for a project with no public footprint. Fabricated pages cannot be told apart
from real ones here. Structured API responses cross-check; prose does not.

Permitted sources:

- `nostr-protocol/nips` pull requests and commits
- Tagged releases of major clients and relays (Damus, Amethyst, Primal, Coracle,
  Snort, strfry, khatru and similar), via the releases API
- The diff or file content of the above

If a fact cannot be established from one of those, it does not go in the article.

### Enumerate by MERGE date, never creation date

`gh pr list` orders by when a pull request was **opened**. A long-lived pull request
that merges today will be invisible to it. This exact mistake caused the retrofill to
report eight merges on a day that had nine, missing the largest change of that day.

Use:

```
gh search prs --repo nostr-protocol/nips --merged --merged-at YYYY-MM-DD..YYYY-MM-DD
```

Cross-check the count before writing any sentence that states a number.

## What counts as news

Notable:

- A NIP merged, or an existing NIP materially revised
- A new NIP added
- A client or relay release with a user-visible change
- A security-relevant change to a specification
- A change that breaks or restores compatibility

Not notable, and never a reason to publish:

- Typo fixes, formatting, README link repairs, reworded prose with no normative change
- Price, market or funding commentary
- Personalities, disputes, or anything about who did what to whom
- Opinion, advocacy, or "the ecosystem is growing"

## Deciding whether to publish at all

**Monday**: publish a `digest` covering the previous seven days, if anything notable
merged in that window. If nothing did, publish nothing and log it.

**Every other day**: publish a single `story` only if something notable merged since
the last run AND it is not already covered by an existing article. Check the most
recent 20 articles and their `sources` before deciding.

**Publishing nothing is a correct outcome and requires no justification.** A quiet week
is a fact about the ecosystem, not a failure of the newsroom. Never lower the bar to
produce an article, and never combine unrelated trivia into a digest to fill a slot.

## Writing rules

Read `content/news/en/` for voice before writing. Plain, technical, unhurried: a working
engineer explaining a change, not a press release.

- **Never use an em dash.** Rephrase, or use a comma, colon or full stop. Substituting a
  hyphen is not the fix. This is a firm house rule.
- No hype words. Nothing is revolutionary, exciting, huge or game-changing.
- Do not speculate about maintainer intent, roadmaps, or adoption.
- Do not mention nostr-wot or QuantaKrypto. These are reports, not promotion.
- Link the pull request inline the first time you reference a change.
- State what the diff says. If the diff contradicts your expectation, follow the diff.
- 500 to 900 words for a story. Digests may run longer, with each item treated briefly.

## Frontmatter

```yaml
---
title: "..."
description: "..."
excerpt: "..."
date: "<the event date, YYYY-MM-DD>"
publishedAt: "<today, YYYY-MM-DD>"
backfilled: false
type: "story"        # or "digest"
tags: ["Nostr", "NIP"]
translationKey: "<the English slug>"
sources:
  - title: "..."
    url: "https://github.com/nostr-protocol/nips/pull/NNNN"
    publisher: "nostr-protocol/nips"
    date: "YYYY-MM-DD"
published: true
---
```

Digests add an `items` array of `{title, url, summary}`, one per covered change.

Omit `author`. It defaults to "Nostr WoT Newsroom", which is correct. Never attribute
an article to a person.

`backfilled` is `false` for daily articles, and `date` equals `publishedAt`, because
these report current events. The build throws if `backfilled: true` is set without
`publishedAt`; that guard exists on purpose.

## Locales

Publish in all seven: `en, es, pt, ru, it, fr, de`. `pt` is Brazilian Portuguese.

- Slug: `YYYY-MM-DD-<kebab-title>`; digests `YYYY-MM-DD-week-in-review`.
- Non-English slugs keep the date prefix and translate only the title part.
- `translationKey` is the English slug, identical across all seven files.
- Translate properly, matching each locale's register in `content/blog/<locale>/`.
  Keep technical terms, kind numbers, tag names and JSON in English.
- **French needs its accents.** A French file written without them ships broken.
- An article missing a locale never enters the sitemap for that locale, so it ships
  invisible to search there. All seven, or do not publish.

## Before pushing

Run all four and do not push if any fails:

```
npx tsc --noEmit
npm test
npm run test:parity
npm run build
```

Then verify your own article:

- Every `sources` URL returns 200.
- Every number you state matches the API.
- No em dash in any of the seven files.
- All seven files parse and share one `translationKey`.

## Publishing

Commit and push to `main`. This deploys to production automatically. There is no
review gate, which is a deliberate choice and the reason the rules above are strict.

Then append one line to `docs/newsroom/log.md`:

```
YYYY-MM-DD HH:MM UTC  published  <slug>  (<n> sources)
YYYY-MM-DD HH:MM UTC  skipped    nothing cleared the bar; considered: #NNNN, #NNNN
YYYY-MM-DD HH:MM UTC  paused     PAUSE file present
YYYY-MM-DD HH:MM UTC  failed     <what broke>
```

Log every run, including skips. Without a pre-publish gate, a silent skip and a silent
crash are indistinguishable from outside, and the log is what tells them apart.
