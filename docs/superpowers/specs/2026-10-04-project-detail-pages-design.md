# Per-project evidence pages for the ecosystem directory

Date: 2026-10-04
Status: approved design, not yet implemented
Branch: `feat/project-detail-pages` (stacked on `feat/ecosystem-directory-batch`)

## Problem

`/projects` lists 41 projects and is the only page in the directory. A reader who
wants to know *why* a project is marked active, archived or unknown has to expand
an inline `<details>` block, and there is no addressable URL for a single project
to link, cite or share.

The dataset is also the only place project facts live, and it carries just what a
person wrote down: a summary, a status, a prose status note and a few source
links. There is no machine-derived evidence, and no way to refresh any of it
without redoing the research by hand. That is the actual blocker on growing the
directory past 41.

## Goal and non-goals

The page is an **evidence record**: it shows the full verification trail for one
project. Unique content comes from structured, machine-derived facts rather than
from written prose, because that is what this dataset honestly is.

Non-goals:

- Editorial profiles. No "what it's for", "who should use it" or feature prose.
  Every such claim would need sourcing under the rules in `AGENTS.md`, and 41
  projects times 7 locales of original writing is a separate project.
- Star counts, follower counts or any popularity metric. They change daily, go
  stale the moment they are committed, and say nothing about verification.
- Live API calls at request time. The evidence model is "checked on this date",
  which a live fetch destroys.

## Architecture

Three pieces, deliberately separated by who owns the data:

| Layer | Owner | Lives in |
|---|---|---|
| Status judgement, summaries, sources, people | a person | `data/ecosystem-projects*.json` |
| Machine-derived repository facts | the generator | `lib/generated/ecosystem-snapshot.json` |
| Presentation | the route and component | `app/[locale]/projects/[id]/`, `components/projects/` |

The dataset is **not modified by this change**. That keeps the seven-locale
parity contract in `tests/ecosystem-data.test.ts` untouched, and it keeps human
judgement separable from machine facts.

## 1. Snapshot generator

`scripts/generate-ecosystem-snapshot.mjs`, modelled on
`scripts/generate-route-modified.mjs` (bracket-tag logging, trailing newline,
2-space JSON, idempotent output, no emoji).

Reads `data/ecosystem-projects.json`, parses the `owner/repo` slug out of each
`repository` URL, and for each project issues:

- `GET /repos/{slug}` for `archived`, `created_at`, `pushed_at`,
  `license.spdx_id`, `language`, `topics`, `full_name`
- `GET /repos/{slug}/releases?per_page=10` for release history

Output `lib/generated/ecosystem-snapshot.json`:

```json
{
  "generatedAt": "2026-10-04",
  "projects": {
    "snort": {
      "slug": "v0l/snort",
      "canonicalSlug": "v0l/snort",
      "archived": false,
      "createdAt": "2022-12-18",
      "pushedAt": "2026-09-30",
      "license": "MIT",
      "language": "TypeScript",
      "topics": ["nostr", "react"],
      "releases": [
        { "tag": "v0.5.3", "date": "2026-04-08", "url": "https://github.com/v0l/snort/releases/tag/v0.5.3", "prerelease": false }
      ]
    }
  }
}
```

Decisions:

- **`canonicalSlug` is recorded separately.** The API resolves renames, so a moved
  repository shows up as a reviewable diff instead of a silently redirecting link.
  This is not hypothetical: `rust-nostr/nostr` is now `nostrdevkit/nostr`,
  `bitvora/haven` is now `barrydeen/haven`, and `PlebeianTech/plebeian-market` is
  now `PlebeianApp/plebeian-market-old`.
- **`prerelease` is recorded per release.** Zeus's newest tag is
  `v13.2.3-alpha1`. Without the flag a page would present an alpha as the current
  version. Drafts are excluded entirely; prereleases are kept and labelled.
- **Releases are capped at 5 after filtering drafts**, newest first, to bound page
  and file size.
- **Not wired into `prebuild`.** Nothing in `prebuild` touches the network today
  and both existing prebuild generators are hermetic. The committed JSON is the
  build input. Exposed as `npm run ecosystem:snapshot`, matching the
  `<domain>:<verb>` convention of `test:parity` and `social:post`.
- **Authentication.** 41 projects is about 82 requests and unauthenticated GitHub
  allows 60 per hour, so the script reads `GITHUB_TOKEN`, falls back to shelling
  out to `gh auth token`, and exits non-zero with a clear message if it has
  neither. It must never write a partially populated snapshot: facts are collected
  in memory and the file is written only after every project resolves.
- **Rate limits.** `scripts/fetch-retry.mjs` retries 429 and 5xx but with linear
  backoff and no `Retry-After` handling. The script reads `retry-after` and
  `x-ratelimit-remaining` itself rather than changing the shared helper, which has
  two unrelated callers.
- **Testability.** An `ECOSYSTEM_SNAPSHOT_OUT` output override and an injectable
  clock, following `CONTENT_CACHE_OUT` / `CONTENT_CACHE_NOW`, so the generator can
  be exercised without network and without touching the committed file. Entry
  point guarded with the `import.meta.url === pathToFileURL(process.argv[1]).href`
  check so tests can import its pure functions.

`lib/ecosystem-snapshot.ts` owns the types and the accessors
(`getProjectSnapshot(id)`, `snapshotGeneratedAt()`), so no component imports
generated JSON directly.

## 2. Shared component extraction

`ExternalLink`, the `focus` ring constant and the `statusStyles` colour map are
currently module-local and unexported inside
`components/projects/EcosystemDirectory.tsx`. A sibling component cannot reuse
them as they stand.

Lift all three into `components/projects/shared.tsx` and have the directory import
them from there. `ExternalLink` keeps its exact current behaviour, including that
it renders no `target` or `rel` and degrades to a plain `<span>` with
`t.linkUnavailable` when `isSafeExternalUrl` rejects the URL. The status badge
becomes `StatusBadge({ status, locale })` wrapping the existing markup verbatim,
so the directory renders byte-identical output after the move.

This is the only refactor in scope. No other restructuring of the directory.

## 3. Route and page

`app/[locale]/projects/[id]/page.tsx`, following `guides/[slug]`:

- `generateStaticParams()` returns the full `locales × ids` cross product, 287
  entries. Child params do not inherit the parent's, so the locales are enumerated
  again here. The seven locale datasets are asserted to carry identical,
  index-aligned `id` lists, so a single id list is reused across locales.
- `pageMetadata` returns a bare `{ title }` object on a miss rather than calling
  `notFound()`, matching the house pattern. Alternates come from
  ``generateAlternates(`/projects/${id}`, locale)``: the path segment is the
  locale-invariant project `id`, so the simple helper is correct and
  `generateBlogAlternates` would be wrong.
- The default export calls `notFound()` on an unknown id and reads copy through
  `ecosystemCopy(locale)`, matching `EcosystemDirectory`, which does not use
  `useTranslations`.
- JSON-LD: `SoftwareApplication` plus `BreadcrumbList`, each in its own script tag,
  serialised with `serializeJsonLd` imported from **`@/lib/serialize-jsonld`**.
  The variant exported from `lib/ecosystem-projects.ts` does not escape U+2028 or
  U+2029 and is the weaker of the two; it stays where it is because
  `tests/ecosystem-projects.test.ts` pins it.
- Last line is `export const generateMetadata = withMetadataPolicy(pageMetadata);`.

### Title and description length

`withMetadataPolicy` clamps titles to 45-57 characters and descriptions to
145-157, padding short copy with localised filler. A bare project name like
"Damus" would be padded into something no one wrote.

Titles are therefore built from a per-locale template designed to land in range,
for example `"{name}: status and evidence in the Nostr directory"`. A test asserts
that for every project, in every locale, the composed title and description fall
inside `SEO_LIMITS` before the policy runs, so the padding path is never taken.

### Page content

In order: back link to the directory, header with category label and status badge,
summary, status evidence (the dataset's `statusNote`, both verification dates, and
the snapshot's `generatedAt` so a stale snapshot is visible rather than hidden),
repository facts, release history, people, sources, related reports, and the
outbound website and repository links.

Repository facts render as `<p><strong>label</strong> value</p>` pairs, which is
the existing house pattern. The site has **no** facts-table, timeline or
breadcrumb component, and this change does not invent one: release history is an
ordered list of `<time>` elements with links, and the breadcrumb exists only as
JSON-LD plus a plain back link.

People reuse the directory's `evidencedPeople` filter, which drops any person
whose `sourceUrl` fails `isSafeExternalUrl`, and the existing "Founder: not
verified" line. 35 of the 41 records carry no people at all.

### Related reports

A report in `news` or `security` is related to a project when the project's
repository slug appears in the report's `url` or in any of its `sources[].url`.
Matching is on URLs, never on project names in prose, which would invent
relationships.

Measured against the current dataset this reaches **5 of 41 projects**: Amber 8
reports, NIPs 6, strfry 2, Amethyst 1, Nostur 1. The other 36 pages show no
related reports, and the section is omitted entirely rather than rendering an
empty heading. Two known misses are recorded here so they are not rediscovered as
bugs: Primal's reports point at `primal-android-app` while the record tracks
`primal-web-app`, and one report points at `fiatjaf/relayer`, which is not in the
directory.

## 4. Directory integration

Each card in `EcosystemDirectory` gains a link to its project page. The existing
inline `<details>` evidence block **stays exactly as it is**, because readers use
it and replacing it with a link would delete working content.

## 5. Sitemap and SEO

`app/sitemap.ts` gains a projects loop emitting 287 entries, each with all seven
hreflang alternates, `lastModified` from the project's `lastVerified`,
`changeFrequency: "monthly"` and `priority: 0.5`, deliberately below the
directory's 0.6 so the hub page stays the primary target.

`lib/sitemap-routes.mjs` is **not** touched. That list is for static paths only,
and a literal `[id]` segment would pollute the sitemap with a literal URL.

### The test this breaks

`tests/sitemap.test.ts` asserts set equality between every `page.tsx` found under
`app/[locale]` and the union of static routes plus a hardcoded `dynamic`
allow-list. Adding the route fails that assertion immediately. Both sides must be
updated:

1. Add `/projects/[id]` to the `dynamic` set, with a rationale comment, as every
   existing entry there carries one.
2. Extend the sitemap-equality test's expected set to include the 287 project
   URLs, mirroring how the loop builds them.

That second test also asserts every hreflang alternate is itself a URL present in
the sitemap. Listing all seven locales satisfies this; listing only English would
not.

## 6. Localisation

New keys go under a `detail` block in the existing
`messages/<locale>/projects.json`. The `projects` namespace is already registered
in `messages/en/index.ts`, so there is **no new message file and no new
registration**.

`tests/translations.test.ts` asserts identical flattened key sets and identical
ICU argument names across all seven locales, so every new key must be added to all
seven files in the same change. `ecosystemCopy` falls back to the whole English
object only when a locale is missing, never per key, so a key missing from one
locale renders `undefined` rather than English.

No em dashes in any locale, matching the existing files.

## Testing

New `tests/ecosystem-detail.test.ts`:

- every project id resolves to a snapshot entry, and the snapshot contains no id
  absent from the dataset (drift in either direction)
- `generatedAt` and every snapshot date are `YYYY-MM-DD` and not in the future
- every release URL is `https://` and passes `isSafeExternalUrl`
- a project whose `canonicalSlug` differs from `slug` renders the rename, rather
  than silently linking the stale slug
- the page renders in all seven locales with the right `lang` attribute and
  translated labels, and does not leak English into a non-English render
- an unknown id triggers `notFound()`
- related-report matching returns only URL-matched reports, and an empty list when
  nothing matches
- composed titles and descriptions sit inside `SEO_LIMITS` for every project in
  every locale, so `withMetadataPolicy` never pads
- the sitemap contains exactly one entry per project per locale, each with seven
  alternates, and every alternate is itself present

Generator tests run against a fixture with the output path and clock overridden.
No test performs network access.

## Risks

- **Snapshot staleness.** Mitigated by rendering `generatedAt` on the page, so a
  stale snapshot is visible to a reader rather than silently presented as current.
- **Build time.** 287 more statically generated pages. Blog, guides and news
  already generate at comparable scale.
- **Thin content.** This is why the snapshot exists. Each page carries distinct
  license, language, creation date, push date, topics and release history. If a
  page's only unique content turns out to be its name and one summary sentence,
  that is a signal the project record is too thin to publish, not that the page
  needs filler.

## Deliberately out of scope

- **A refresh workflow.** `social.yml` is the model for a generator that commits
  its output, but every Node-using workflow here reads `node-version-file:
  '.nvmrc'` and `.nvmrc` currently says `22`, while the workspace standing rule
  requires Node 24 or newer for workflow Node runtimes. Bumping `.nvmrc` changes
  the Node version for `ci.yml`, `deploy.yml` and `social.yml` at once, which is a
  repo-wide decision that does not belong inside this feature. The generator is
  manual for now and this mismatch is flagged separately.
- Adding the projects the report matcher revealed as missing, such as
  `fiatjaf/relayer`.
- Deduplicating the two `serializeJsonLd` implementations.
