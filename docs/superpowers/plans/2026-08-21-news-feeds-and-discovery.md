# News Feeds and Discovery Implementation Plan (Phase 2b of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/news` discoverable — sitemap entries, RSS and JSON feeds, a Google News sitemap, feed autodiscovery, and links from the nav, footer and homepage.

**Architecture:** Feeds are Next.js route handlers under the existing `[locale]` segment, so each locale gets its own feed at its own prefix. The Google News sitemap is a single root-level route covering all locales. Sitemap entries reuse the per-locale `translations` pattern `app/sitemap.ts` already applies to blog and guides.

**Tech Stack:** Next.js 16 (App Router route handlers), TypeScript 5.9, next-intl 4.8, `node:test` via the existing `tsx` devDependency.

**Spec:** `docs/superpowers/specs/2026-08-21-news-section-design.md`

**Branch:** `feat/news-feeds`, branched from `feat/news-routes` (phase 2a, PR #24). Neither phase 1 nor 2a is merged — do not rebase onto `main`.

## Global Constraints

- **No new dependencies.** Build XML with template strings; do not add a feed library.
- **Test command:** `node --import tsx --test tests/*.test.ts` (`npm test`). Tests FLAT in `tests/`. Test imports must NOT use a `.ts`/`.tsx` extension (TS5097).
- **Package manager is npm.** Never pnpm.
- **Locales:** `['en','es','pt','ru','it','fr','de']`, default `en`. Import from `@/i18n/config`. `localePrefix: 'as-needed'` — the default locale has NO prefix, so `en` feeds live at `/news/feed.xml` and Spanish at `/es/news/feed.xml`.
- **THE DATE RULE, again.** `date` is the EVENT date. `publishedAt` is the real ship date. RSS `<pubDate>`, JSON Feed `date_published`, and `<news:publication_date>` MUST all use `publishedAt`. The event date belongs only in human-visible text. Getting this wrong tells aggregators a backfilled article is breaking news.
- **XML escaping is a correctness requirement, not a nicety.** Titles and excerpts contain `&`, `<`, `>`, `'`, `"`. An unescaped ampersand makes the whole feed unparseable. Escape every interpolated value.
- **All four gates must pass before any task reports DONE:** `npx tsc --noEmit`, `npm test`, `npm run test:parity`, `npm run build`.
- **`content/news/` must contain only `.gitkeep` when committing.** Verify with temporary probes, then delete them.
- **`lib/generated/*.json` show timestamp churn.** Never stage or revert them.
- **Commit after every task. Do not push.**

---

## File Structure

**Create:**
- `lib/feeds.ts` — shared feed helpers: XML escaping, RFC-822 dates, absolute URLs
- `app/[locale]/news/feed.xml/route.ts` — RSS 2.0, per locale
- `app/[locale]/news/feed.json/route.ts` — JSON Feed 1.1, per locale
- `app/news-sitemap.xml/route.ts` — Google News sitemap, all locales
- `tests/feeds.test.ts`

**Modify:**
- `app/sitemap.ts` — `/news`, articles, archive months
- `app/robots.ts` — reference the news sitemap
- `public/llms.txt` — a news section
- `app/[locale]/layout.tsx` — feed autodiscovery `<link>` tags
- `components/layout/Header.tsx` — nav link
- `components/layout/Footer.tsx` — footer link
- `messages/<locale>/common.json` × 7 — the nav label, if not already present

---

### Task 1: Sitemap, robots and llms.txt

**Files:**
- Modify: `app/sitemap.ts`, `app/robots.ts`, `public/llms.txt`

**Interfaces:**
- Consumes: `getAllNews`, `getNewsArchiveMonths` from `@/lib/news`
- Produces: news URLs in `sitemap.xml`; a `news-sitemap.xml` reference in `robots.txt`

- [ ] **Step 1: Read how blog and guides are already handled**

Open `app/sitemap.ts` and read the blog and guides blocks completely. They build `alternateLanguages` from each post's `translations` map and emit one entry per available translation. News must follow that exact pattern — do not invent a different one.

- [ ] **Step 2: Add `/news` to the static routes list**

In the `routes` array, alongside the existing `/blog` entry:

```ts
  { path: "/news", changeFrequency: "daily", priority: 0.9 },
```

`daily` and a high priority are correct here: the section updates far more often than the blog and is the freshest thing on the site.

- [ ] **Step 3: Add news posts, mirroring the blog block**

After the guides block, add an equivalent block for news using `getAllNews()`. Two differences from blog, both deliberate:

- `lastModified` MUST use `post.updated || post.publishedAt`, NOT `post.date`. The event date is not when the page last changed.
- `changeFrequency` is `"monthly"` and priority `0.8`.

- [ ] **Step 4: Add archive month pages**

For each entry from `getNewsArchiveMonths(locale)`, per locale, emit
`/news/archive/<year>/<MM>` with the month zero-padded to two digits.

**Only emit an entry for a locale that actually has posts in that month** — the archive route `notFound()`s otherwise, and phase 2a specifically fixed the equivalent hreflang bug. Use `getNewsForMonth(year, month, locale)` to decide. A sitemap that lists 404s is worse than one that omits them.

- [ ] **Step 5: Reference the news sitemap from robots.ts**

`app/robots.ts` currently returns a single `sitemap` string. Change it to an array:

```ts
    sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/news-sitemap.xml`],
```

`MetadataRoute.Robots` accepts `string | string[]` for `sitemap`. The news sitemap route itself lands in Task 3; referencing it first is harmless because the reference is just a URL.

- [ ] **Step 6: Add a news section to `public/llms.txt`**

Read the file's existing structure first and match it. Add a section describing what `/news` is: ecosystem news assembled by the Nostr WoT Newsroom from cited primary sources, published automatically without individual human review, covering NIP changes, client releases, security disclosures and adoption. State the two post types (weekly digest, single story) and that every entry links its primary sources. Be accurate — this file is read by other models, so an overclaim here propagates.

- [ ] **Step 7: Verify with probe content**

Create three temporary news posts under `content/news/en/` with different months, one of them also translated into `content/news/es/`. Then:

```bash
npm run build
```

Fetch the built sitemap (run `npm start` in the background, then `curl -s localhost:3000/sitemap.xml`), and confirm:
- `/news` appears for all 7 locales
- each probe article appears once per locale that has a translation, and NOT for locales that do not
- archive month URLs appear only for locales with posts in that month
- `curl -s localhost:3000/robots.txt` lists both sitemaps

Then DELETE the probes and confirm `git status --untracked-files=all content/news/` is empty.

- [ ] **Step 8: Run the four gates and commit**

```bash
git add app/sitemap.ts app/robots.ts public/llms.txt
git commit -m "Add news to the sitemap, robots and llms.txt"
```

---

### Task 2: RSS and JSON feeds

**Files:**
- Create: `lib/feeds.ts`, `tests/feeds.test.ts`
- Create: `app/[locale]/news/feed.xml/route.ts`, `app/[locale]/news/feed.json/route.ts`

**Interfaces:**
- Consumes: `getAllNews` from `@/lib/news`, `getFullUrl` from `@/lib/metadata`
- Produces: `escapeXml`, `toRfc822`, `absoluteUrl` from `@/lib/feeds`; two route handlers per locale

- [ ] **Step 1: Write the failing test**

Create `tests/feeds.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml, toRfc822, absoluteUrl } from '../lib/feeds';

test('escapes the five XML entities', () => {
  assert.equal(escapeXml('a & b'), 'a &amp; b');
  assert.equal(escapeXml('<tag>'), '&lt;tag&gt;');
  assert.equal(escapeXml(`it's "quoted"`), 'it&apos;s &quot;quoted&quot;');
});

test('escapes ampersand first so entities are not double-escaped', () => {
  assert.equal(escapeXml('&lt;'), '&amp;lt;');
});

test('handles empty and undefined input without throwing', () => {
  assert.equal(escapeXml(''), '');
  assert.equal(escapeXml(undefined as unknown as string), '');
});

test('produces an RFC 822 date RSS readers accept', () => {
  const out = toRfc822('2026-08-21T00:00:00.000Z');
  assert.match(out, /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
  assert.match(out, /21 Aug 2026/);
});

test('absoluteUrl leaves absolute URLs alone and prefixes relative ones', () => {
  assert.equal(absoluteUrl('https://x/y'), 'https://x/y');
  assert.ok(absoluteUrl('/images/a.svg').startsWith('https://'));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../lib/feeds`.

- [ ] **Step 3: Write `lib/feeds.ts`**

```ts
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostr-wot.com';

/**
 * Escapes the five XML entities. The ampersand MUST be replaced first,
 * otherwise the ampersands introduced by the later replacements are
 * themselves escaped and the output is corrupt.
 */
export function escapeXml(value: string): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** RFC 822 date, which is what RSS 2.0 requires for pubDate. */
export function toRfc822(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${DAYS[d.getUTCDay()]}, ${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} GMT`;
}

export function absoluteUrl(url: string): string {
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}
```

- [ ] **Step 4: Run to verify the tests pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Write the RSS route**

`app/[locale]/news/feed.xml/route.ts`:

```ts
import { getAllNews } from '@/lib/news';
import { getFullUrl } from '@/lib/metadata';
import { escapeXml, toRfc822, absoluteUrl } from '@/lib/feeds';
import { locales, type Locale } from '@/i18n/config';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const l = locale as Locale;
  const posts = getAllNews(l).slice(0, 50);
  const self = getFullUrl('/news/feed.xml', l);

  const items = posts
    .map((p) => {
      const url = getFullUrl(`/news/${p.slug}`, l);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(p.excerpt || p.description)}</description>
      <pubDate>${toRfc822(p.publishedAt)}</pubDate>
${p.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml('Nostr WoT News')}</title>
    <link>${escapeXml(getFullUrl('/news', l))}</link>
    <description>${escapeXml('What is actually happening across the Nostr ecosystem')}</description>
    <language>${l}</language>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

Note `pubDate` uses `p.publishedAt`, never `p.date`.

- [ ] **Step 6: Write the JSON Feed route**

`app/[locale]/news/feed.json/route.ts`, same shape, emitting JSON Feed 1.1:

```ts
import { getAllNews } from '@/lib/news';
import { getFullUrl } from '@/lib/metadata';
import { absoluteUrl } from '@/lib/feeds';
import { locales, type Locale } from '@/i18n/config';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const l = locale as Locale;
  const posts = getAllNews(l).slice(0, 50);

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Nostr WoT News',
    home_page_url: getFullUrl('/news', l),
    feed_url: getFullUrl('/news/feed.json', l),
    description: 'What is actually happening across the Nostr ecosystem',
    language: l,
    items: posts.map((p) => ({
      id: getFullUrl(`/news/${p.slug}`, l),
      url: getFullUrl(`/news/${p.slug}`, l),
      title: p.title,
      summary: p.excerpt || p.description,
      image: absoluteUrl(p.previewImage),
      date_published: p.publishedAt,
      ...(p.updated ? { date_modified: p.updated } : {}),
      tags: p.tags,
      authors: [{ name: 'Nostr WoT Newsroom' }],
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

JSON needs no escaping — `JSON.stringify` handles it. That is why only the RSS route uses `escapeXml`.

- [ ] **Step 7: Verify both feeds actually parse**

Create probe content including **one post whose title contains `&`, `<` and an apostrophe** — this is the case that breaks naive feed generation. Build, serve, then:

```bash
curl -s localhost:3000/news/feed.xml -o /tmp/feed.xml
node -e "const s=require('fs').readFileSync('/tmp/feed.xml','utf8'); if(/&(?!amp;|lt;|gt;|quot;|apos;)/.test(s)) throw new Error('unescaped ampersand'); console.log('no raw ampersands')"
curl -s localhost:3000/news/feed.json | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const f=JSON.parse(d);console.log('json feed items:',f.items.length,'version:',f.version)})"
curl -s localhost:3000/es/news/feed.xml | head -8
```

Confirm the XML has no unescaped ampersand, the JSON parses, and the Spanish feed exists at its prefixed path. Confirm `pubDate` matches `publishedAt` and NOT the event date for a backfilled probe. Delete the probes afterwards.

- [ ] **Step 8: Run the four gates and commit**

```bash
git add lib/feeds.ts tests/feeds.test.ts "app/[locale]/news/feed.xml" "app/[locale]/news/feed.json"
git commit -m "Add per-locale RSS and JSON feeds for news"
```

---

### Task 3: Google News sitemap

**Files:**
- Create: `app/news-sitemap.xml/route.ts`

**Interfaces:**
- Consumes: `getAllNews` from `@/lib/news`, `getFullUrl` from `@/lib/metadata`, `escapeXml` from `@/lib/feeds`
- Produces: `/news-sitemap.xml`, already referenced from `robots.ts` in Task 1

- [ ] **Step 1: Write the route**

```ts
import { getAllNews } from '@/lib/news';
import { getFullUrl } from '@/lib/metadata';
import { escapeXml } from '@/lib/feeds';
import { locales, type Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

/**
 * Google News sitemap.
 *
 * By specification this contains ONLY articles published in the last 48 hours.
 * That is not a limitation of this implementation — an article older than that
 * does not belong in a news sitemap, and including it does not help it rank.
 * The regular sitemap.xml carries the full archive.
 */
const WINDOW_MS = 48 * 60 * 60 * 1000;

export async function GET() {
  const cutoff = Date.now() - WINDOW_MS;
  const entries: string[] = [];

  for (const locale of locales) {
    const l = locale as Locale;
    for (const post of getAllNews(l)) {
      if (new Date(post.publishedAt).getTime() < cutoff) continue;
      const url = getFullUrl(`/news/${post.slug}`, l);
      entries.push(`  <url>
    <loc>${escapeXml(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>Nostr WoT News</news:name>
        <news:language>${l}</news:language>
      </news:publication>
      <news:publication_date>${post.publishedAt}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
```

`force-dynamic` is deliberate: the 48-hour window is relative to request time, so a statically generated version would go stale and start advertising articles that have aged out.

- [ ] **Step 2: Verify the window actually works**

Create two probes: one with `publishedAt` set to now, one with `publishedAt` set 5 days ago. Build, serve, and `curl -s localhost:3000/news-sitemap.xml`.

Confirm the recent one appears and the old one does NOT. Confirm the XML is well formed and the `news:` namespace is declared. Confirm an empty result still returns a valid empty `<urlset>` rather than malformed XML — test that by deleting both probes and fetching again.

Delete the probes afterwards.

- [ ] **Step 3: Run the four gates and commit**

```bash
git add app/news-sitemap.xml
git commit -m "Add a Google News sitemap covering the last 48 hours"
```

---

### Task 4: Surfacing

**Files:**
- Modify: `app/[locale]/layout.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `messages/<locale>/common.json` × 7

**Interfaces:**
- Consumes: the `news` message namespace and `common` nav labels
- Produces: `/news` reachable from the nav, the footer, and feed autodiscovery

- [ ] **Step 1: Add the nav label to all 7 locales**

Check `messages/en/common.json` for an existing `nav` object (the header uses `t("nav.features")`, `t("nav.developers")`). Add a `nav.news` key with the translated word for "News" in each of the 7 locales, matching each locale's existing tone. All 7 key sets must stay identical.

- [ ] **Step 2: Add the header link**

In `components/layout/Header.tsx`, add a `/news` link alongside the existing `/features` and `/docs` links, using the same `navLinkStyles` constant and `t("nav.news")`. Keep the existing responsive behaviour — those links are `hidden sm:block`, so match that rather than introducing a link that breaks the mobile header.

- [ ] **Step 3: Add the footer link**

In `components/layout/Footer.tsx`, add `/news` to the column that already contains `/docs`, `/blog` and `/guides`, following the exact markup and classes of the neighbouring links.

- [ ] **Step 4: Add feed autodiscovery**

In `app/[locale]/layout.tsx`'s `<head>`, add for the current locale:

```tsx
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Nostr WoT News"
          href={getFullUrl('/news/feed.xml', locale as Locale)}
        />
        <link
          rel="alternate"
          type="application/feed+json"
          title="Nostr WoT News"
          href={getFullUrl('/news/feed.json', locale as Locale)}
        />
```

Import `getFullUrl` from `@/lib/metadata` and `Locale` from `@/i18n/config` if not already imported. Read the file first to see what `locale` is called in scope.

- [ ] **Step 5: Verify**

Build and serve. Confirm:
- the header shows a News link on a desktop viewport, and the mobile header is not broken
- the footer link works
- `curl -s localhost:3000/ | grep 'application/rss+xml'` finds the autodiscovery tag
- `curl -s localhost:3000/es/ | grep 'feed.xml'` points at `/es/news/feed.xml`, not the English feed
- all 7 locales still build

- [ ] **Step 6: Run the four gates and commit**

```bash
git add app components messages
git commit -m "Surface news in the nav, footer and feed autodiscovery"
```

---

## Done criteria

- [ ] `npx tsc --noEmit` clean
- [ ] `npm test` passes, including the feed helper tests
- [ ] `npm run test:parity` green
- [ ] `npm run build` succeeds
- [ ] `sitemap.xml` contains `/news`, article URLs per available translation, and archive months only for locales that have them
- [ ] `robots.txt` lists both sitemaps
- [ ] `/news/feed.xml` and `/news/feed.json` exist for all 7 locales and parse
- [ ] A title containing `&`, `<` and `'` does not corrupt the RSS feed
- [ ] `/news-sitemap.xml` contains only articles from the last 48 hours and is valid when empty
- [ ] Every feed date comes from `publishedAt`, never the event date
- [ ] `content/news/` contains only `.gitkeep`

## Follow-on

- Phase 3 — six-month retrofill via the four-phase subagent pipeline
- Phase 4 — daily newsroom agent, playbook, PAUSE switch, run log
