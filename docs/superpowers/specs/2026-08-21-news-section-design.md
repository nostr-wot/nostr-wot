# News Section — Design

Date: 2026-08-21
Repo: nostr-wot/nostr-wot
Status: approved, pending implementation plan

## Goal

Add a `/news` section to nostr-wot.com: a news article collection fed by an
automated daily process, with date-based slugs, full SEO and structured data,
and an archive retrofilled across the previous six months.

## Decisions

These were settled during brainstorming and are not open questions.

| Decision | Choice |
|---|---|
| Automation | Scheduled cloud agent, pushes straight to `main` (no review gate) |
| Post cadence | Weekly digest (Monday) + single-story posts only when something notable happens |
| Article locales | All 7, agent-translated |
| Retrofill window | 6 months back (2026-02-21 → 2026-08-21), up to ~12 posts |
| Byline | Organization byline + visible AI disclosure |
| Code reuse | Extract a shared content-collection module; migrate blog, guides and news onto it |
| News sourcing | WoT-weighted relay signal, verified against primary sources |

## Context

The site already runs two near-identical content collections. `lib/guides.ts`
(273 lines) is a near-verbatim copy of `lib/blog.ts` (314 lines), and
`scripts/generate-guides-cache.mjs` copies `scripts/generate-blog-cache.mjs`.
Adding news as a third copy would triple a maintenance surface that is already
doubled, so the shared module is part of this work rather than a follow-up.

Existing behaviour this design depends on and preserves:

- `localePrefix: 'as-needed'`, `localeDetection: false`, `alternateLinks: false`
- Per-post `translations` maps already allow a post to exist in a subset of
  locales; `sitemap.ts` and `generateBlogAlternates` already handle that
- `USE_CACHE` splits production (generated JSON) from development (filesystem)
- `next.config.ts` `outputFileTracingIncludes: {'/*': ['./content/**/*']}`
  already covers a new `content/news/` directory with no config change
- The site has no RSS/Atom/JSON feed of any kind today
- The repo has no test framework and no PR-gating CI

## 1. Content model and routes

Content lives at `content/news/<locale>/<slug>.mdx`, a separate collection from
blog and guides.

Two post types, discriminated by a `type` frontmatter field:

- `type: digest` — Monday week-in-review, slug `YYYY-MM-DD-week-in-review`
- `type: story` — a single notable event, slug `YYYY-MM-DD-<kebab-title>`

Slugs are date-prefixed so the archive sorts lexically and the URL self-dates in
search results. Per-locale slugs keep the date prefix and translate only the
title portion, sharing the English `translationKey`:

```
en: 2026-08-21-ml-dsa-lands-in-damus
es: 2026-08-21-ml-dsa-llega-a-damus
```

### Frontmatter

Base fields match the existing blog schema (`title`, `description`, `excerpt`,
`date`, `author`, `featuredImage`, `previewImage`, `tags`, `published`,
`translationKey`, `seoTitle`, `seoDescription`, `ogImage`). News adds:

| Field | Type | Purpose |
|---|---|---|
| `type` | `digest \| story` | Post type discriminator |
| `sources` | `{title, url, publisher?, date?}[]` | Primary sources; required, non-empty |
| `updated` | ISO date, optional | Real `dateModified`; absent means never revised |
| `publishedAt` | ISO date | Real publication timestamp (see §5 on backdating) |
| `backfilled` | boolean, optional | Marks retrospectively written archive entries |
| `items` | `{title, url, summary}[]`, digests only | The week's items, for `ItemList` |

`date` and `publishedAt` are deliberately distinct and must not be conflated.
`date` is the **event** date — it drives the slug prefix, the displayed date, and
archive ordering. `publishedAt` is when the file actually shipped, and is the
only value permitted to appear as `datePublished` in structured data. For a
normally-published post the two coincide; for a retrofilled one they do not.

### Routes

```
app/[locale]/news/page.tsx                        index, paginated
app/[locale]/news/[slug]/page.tsx                 article
app/[locale]/news/[slug]/opengraph-image.tsx      dynamic OG image
app/[locale]/news/archive/[year]/[month]/page.tsx month archive
```

Month archives are cheap and give a date-sliced news section real crawl depth.

## 2. SEO, structured data and feeds

### JSON-LD

Both post types emit `NewsArticle` (not `BlogPosting`) plus `BreadcrumbList`.
Digests additionally emit an `ItemList` whose entries link to primary sources,
making the roundup machine-readable as a list of linked events.

- `author` — `Organization`, "Nostr WoT Newsroom" (schema-valid; avoids
  asserting a person wrote it)
- `publisher` — `NewsMediaOrganization`
- `datePublished` — the real publication timestamp, never the event date
- `dateModified` — from `updated`, falling back to `publishedAt`

A visible AI disclosure sits directly under the byline. Every post ends with a
Sources block of outbound links.

The hand-rolled JSON-LD currently inline in `app/[locale]/blog/[slug]/page.tsx`
moves to `lib/jsonld.ts` as typed builders shared by blog, guides and news.

Index emits `CollectionPage` + `ItemList`; archive pages emit `CollectionPage`
scoped to the month.

### Feeds

The site has none today. Adding:

- `/news/feed.xml` — RSS 2.0, per locale (`/es/news/feed.xml`, …)
- `/news/feed.json` — JSON Feed 1.1
- `app/news-sitemap.xml/route.ts` — Google News sitemap with `<news:news>`
  markup, referenced from `robots.ts`

Caveat, recorded so it is not mistaken for a defect later: a Google News sitemap
only ever contains articles from the **last 48 hours** — that is the spec. It
aids fast discovery of fresh articles. It does not guarantee inclusion in Google
News surfaces, and nothing does.

`<link rel="alternate">` autodiscovery tags for both feeds go in the locale
layout head.

### Sitemap, llms.txt, IndexNow

`app/sitemap.ts` gains `/news`, every post in every locale with correct hreflang
alternates, and the month archives — reusing the per-locale `translations`
pattern it already applies to blog and guides.

`public/llms.txt` gains a news section.

`scripts/indexnow.ts` is extended to submit new news URLs. Because publishing is
automated with no human in the loop, the daily agent invokes it after pushing.

## 3. Shared content collection

`lib/content/collection.ts` exports `createContentCollection(config)`, returning
the exact API surface that exists today: `getSlugs`, `getPost`, `getAll`,
`getByTag`, `getAllTags`, `getRelated`, `getTranslations`,
`getAvailableLocales`, `formatDate`.

Config supplies the content directory, the generated cache, and a per-collection
frontmatter extension — guides add `difficulty` and `order`; news adds the
fields in §1.

**`lib/blog.ts` and `lib/guides.ts` remain as thin re-export shims.** Every
existing import across the app keeps resolving to the same names with the same
signatures, so no call site changes. This is what makes migrating all three
tolerable in a repo with no tests: the blast radius is one file's internals, not
every consumer.

The two cache generators collapse into one parameterised
`scripts/generate-content-cache.mjs`, run three times in `prebuild`.

### Regression proof

`scripts/verify-cache-parity.mjs` runs the *current* generators against current
content and snapshots the output, runs the new unified generator, and asserts
the blog and guides JSON are **byte-identical**. If they match, behaviour is
provably preserved for all existing posts and guides across 7 locales. If they
do not, it prints the diff and the refactor does not land.

The script stays in the repo — it makes future edits to this layer cheap to
trust.

### CI

A minimal GitHub Action runs `npm run build` plus the parity check on pull
requests. The repo has no PR-gating CI today; with automation pushing straight
to production, a build break would ship.

### Minor cleanup (optional)

`generatedAt` in the committed cache JSON produces a diff on every local build.
Dropping the field, or gitignoring the caches and generating them at build time,
would remove that churn. Noted, not required.

## 4. The daily newsroom agent

A scheduled cloud agent runs daily at a fixed UTC hour. Its playbook lives at
`docs/newsroom/playbook.md` and is read fresh on every run, so tuning what counts
as news is a commit rather than a schedule edit.

### Run sequence

1. Exit immediately if `content/news/PAUSE` exists
2. Read the last ~20 published posts and their `sources` to dedupe
3. Gather (below)
4. Decide whether to publish at all
5. Write English, then translate to 6 locales
6. Run `npm run build`
7. Commit, push to `main`, ping IndexNow
8. Append the run outcome to `docs/newsroom/log.md`

### Gathering, in priority order

1. **WoT-weighted relay signal** — what high-trust accounts are discussing,
   ranked by the oracle the project already runs. The relevance filter is the
   web of trust itself.
2. **Hard dateable facts** — `nostr-protocol/nips` merges, major client releases
3. **Web search** — used *only* to verify and cite what the first two surfaced

### The publish/skip decision

Monday always produces the week-in-review digest. Every other day publishes a
single story only if an item clears the notability bar and is not already
covered.

Notable: a NIP merged or materially revised; a client release with a
user-visible change; a relay or protocol incident; a security disclosure; a
significant adoption or funding event; a measurable ecosystem milestone.

Not notable: price talk, personality drama, generic advocacy.

**If nothing clears the bar, the agent exits without committing.** This is the
central behaviour of the design, not an edge case.

### Anti-fabrication rules (hard-coded in the playbook)

- Every factual claim carries a source URL
- No item ships on fewer than one primary source
- If verification fails, the item is **dropped**, never softened
- Never invent a quote, version number, or date

These replace the review gate that was deliberately opted out of.

### Safety

- **Kill switch** — commit `content/news/PAUSE`; automation stops on its next run
- **Unpublish** — set `published: false`; the cache generator already filters it
- **Audit trail** — every run appends to `docs/newsroom/log.md`, including
  skipped days and what was considered. Without a pre-publish gate, a silent
  skip and a silent crash are otherwise indistinguishable.

### Accepted risk

Auto-push means unreviewed content reaches production. This was raised during
design and chosen deliberately. The compensating controls are the sourcing
rules, the build gate, the audit log, and the two switches above.

## 5. Retrofill

Window 2026-02-21 → 2026-08-21, up to ~12 posts, density following reality: a
month with three real events gets three, a dead month gets zero.

### The fabrication risk

This is the highest-risk part of the project. Model training data ends May 2026,
so for roughly half the window there is no prior knowledge, and for the other
half what is "known" still needs checking. A subagent told to write a notable
nostr story for a given date will produce something fluent and plausible whether
or not anything happened. Confident fabrication is the default failure mode.

### Four phases — no prose until facts are locked

1. **Discovery** — parallel subagents, one per month, produce a *sourced event
   ledger*, not articles: date, one-line description, at least one primary
   source URL each. No URL, no entry.
2. **Verification** — independent subagents re-check every entry against its
   source: does the URL exist, does it say what is claimed, is the date right?
   Failures are dropped, never rewritten into something vaguer.
3. **Selection** — the strongest verified entries across the window.
4. **Writing, then translation** — one subagent per post, given only verified
   ledger entries and forbidden from adding facts beyond them. Then 6
   translations each.

**The ~12 is a ceiling, not a quota.** If verification yields seven real events,
seven posts ship. Padding to a number is exactly the scaled-content behaviour
that would cost the section its credibility.

### Backdating

Date-based slugs are a requirement and are preserved. But a post *dated*
2026-03-04 that first existed on 2026-08-21 must not claim
`datePublished: 2026-03-04` — that misrepresents freshness to search engines.

- Slug and displayed date use the **event** date
- `datePublished` uses the **real** publication date (`publishedAt`)
- Retrofilled posts carry `backfilled: true` and a visible "archive entry,
  written retrospectively" label

## Discoverability

The section is surfaced in the header nav, the footer, a homepage strip, and via
feed autodiscovery tags.

## Content-quality position

A daily automated news feed is the shape Google's scaled content abuse policy
targets. The defence is structural rather than cosmetic: every post cites
primary sources, adds a viewpoint, discloses how it was produced, and — most
importantly — **the pipeline does not publish when there is nothing worth
saying**. The skip path is the feature.

## Carried forward from phase 1

Phase 1 landed the shared collection. Two things it discovered that phase 2 must handle:

- **News is excluded from the cache-parity golden.** `content/news/` holds only
  placeholders, there is no `lib/news.ts`, and nothing imports `news-cache.json`, so
  news currently has no TypeScript mapper that could drift from the generator's. The
  moment phase 2 adds a news shim, it must also add news fixtures and a news entry to
  `tests/fixtures/content-cache-golden.json`, or news silently loses the drift
  protection blog and guides have. `CONTENT_CACHE_NOW` already exists to pin the
  non-deterministic `publishedAt` fallback, so nothing blocks this.
- **Phase 2 turns on the news `.ts` type file.** The generator's `emitTypes` is
  deliberately `null` for news because `lib/news.ts` does not exist yet; emitting a
  type file that imports from it would break the build.

## Implementation phasing

The work is too large for one undifferentiated pass, and the phases have
genuinely different risk profiles. Each lands independently and leaves the site
in a working state.

1. **Shared collection + parity proof** — `lib/content/collection.ts`, the
   unified generator, blog/guides shims, `verify-cache-parity.mjs`, CI action.
   Touches live code; ships no user-visible change. Parity must be green before
   anything else starts.
2. **`/news` routes, SEO, feeds** — routes, `lib/jsonld.ts`, feeds, news
   sitemap, sitemap/llms.txt/IndexNow wiring, nav and footer surfacing.
   Ships an empty but fully correct section.
3. **Retrofill** — the four-phase subagent pipeline. Fills the archive with
   verified content. Highest fabrication risk, so it runs only once the section
   renders correctly and can be reviewed.
4. **Daily automation** — playbook, scheduled agent, PAUSE switch, run log.
   Last, because it pushes to production unreviewed and should only be armed
   once every surface it writes into is proven.

## Out of scope

- Migrating existing blog posts into news
- Comments, reactions, or Nostr-native publishing of news items
- Paid promotion
- Newsletter integration beyond the existing `NewsletterSection`
