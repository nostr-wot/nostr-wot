# News Collection and Routes Implementation Plan (Phase 2a of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working, SEO-correct `/news` section — collection library, shared JSON-LD builders, article/index/archive routes, and 7-locale UI copy — with no content in it yet.

**Architecture:** `news` becomes the third collection on phase 1's `createContentCollection` factory. JSON-LD moves out of the blog page into typed builders in `lib/jsonld.tsx` shared by blog and news. Routes mirror the existing blog routes' structure and components.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5.9, next-intl 4.8, MDX via next-mdx-remote, Tailwind 4, `node:test` via the existing `tsx` devDependency.

**Spec:** `docs/superpowers/specs/2026-08-21-news-section-design.md`

**Branch:** `feat/news-routes`, branched from `feat/news-section` (phase 1, PR #21). Phase 1 is NOT merged — do not rebase onto `main`.

## Global Constraints

- **No new dependencies.** Everything needed is already installed.
- **Test command:** `node --import tsx --test tests/*.test.ts` (`npm test`). Tests live FLAT in `tests/`; fixtures may nest under `tests/fixtures/`. Test imports must NOT use a `.ts` extension (tsc rejects it with TS5097).
- **Package manager is npm.** Never pnpm.
- **Locales:** `['en','es','pt','ru','it','fr','de']`, default `en`. Import from `@/i18n/config`; never re-declare. `localePrefix: 'as-needed'` — the default locale has NO prefix.
- **Every new page needs 7 message files and 7 registrations.** A missing locale is a build error.
- **`date` vs `publishedAt` are distinct and must never be conflated.** `date` is the EVENT date — it drives the slug prefix, the displayed date, and sort order. `publishedAt` is when the file actually shipped and is the ONLY value permitted to appear as `datePublished` in structured data. For a normally-published post they coincide; for a retrofilled one they do not.
- **Slugs are date-prefixed:** `YYYY-MM-DD-<kebab-title>`; digests are `YYYY-MM-DD-week-in-review`.
- **Author is an Organization, never a Person.** `author.name` defaults to `Nostr WoT Newsroom`. A visible AI-disclosure line appears under the byline on every news article.
- **Do not modify** `lib/content/collection.ts`, `lib/content/build.ts`, `lib/blog.ts`, `lib/guides.ts` behaviour. You may ADD to `lib/content/shapes.ts` and `scripts/generate-content-cache.mjs`.
- **`npm run test:parity` must stay green.** It compares generator output against `tests/fixtures/content-cache-golden.json`.
- **`lib/generated/*.json` show timestamp churn.** Never stage or revert them.
- **Commit after every task. Do not push** (the controller handles that).

### Verification gates — all four must pass before any task reports DONE

```
npx tsc --noEmit        # clean
npm test                # all pass
npm run test:parity     # golden matches
npm run build           # succeeds
```

---

## File Structure

**Create:**
- `lib/news.ts` — the news collection shim (mirrors `lib/blog.ts`)
- `lib/jsonld.tsx` — typed structured-data builders, shared
- `app/[locale]/news/page.tsx` — index
- `app/[locale]/news/[slug]/page.tsx` — article
- `app/[locale]/news/[slug]/opengraph-image.tsx` — dynamic OG image
- `app/[locale]/news/archive/[year]/[month]/page.tsx` — month archive
- `components/news/NewsCard.tsx`, `components/news/NewsMeta.tsx`, `components/news/index.ts`
- `messages/<locale>/news.json` × 7
- `tests/jsonld.test.ts`
- `tests/fixtures/content/parity/news/en/*.mdx` — news parity fixtures
- `public/images/news/default-featured.svg`, `default-preview.svg`

**Modify:**
- `lib/content/shapes.ts` — add `newsShape`, `newsSort`, `NewsExtras`
- `scripts/generate-content-cache.mjs` — turn on news `emitTypes`; add news to the parity fixture set
- `tests/content-mapper-parity.test.ts` — cover the news shape
- `tests/fixtures/content-cache-golden.json` — regenerate to include news
- `messages/<locale>/index.ts` × 7 — register `news`
- `app/[locale]/blog/[slug]/page.tsx` — use the shared JSON-LD builders

---

### Task 1: News collection library

**Files:**
- Modify: `lib/content/shapes.ts`
- Create: `lib/news.ts`
- Create: `public/images/news/default-featured.svg`, `public/images/news/default-preview.svg`

**Interfaces:**
- Consumes: `createContentCollection` from `@/lib/content/collection`, `CollectionShape`/`ContentMeta`/`ContentDoc` from `@/lib/content/types`
- Produces: `NewsSource`, `NewsDigestItem`, `NewsExtras`, `NewsPostMeta`, `NewsPost`, `newsShape`, `newsSort`, and `getNewsSlugs`, `getNewsPost`, `getAllNews`, `getNewsByTag`, `getAllNewsTags`, `getRelatedNews`, `getNewsTranslations`

- [ ] **Step 1: Add the news shape to `lib/content/shapes.ts`**

Append (do not disturb the existing blog/guides exports):

```ts
export interface NewsSource {
  title: string;
  url: string;
  publisher?: string;
  date?: string;
}

export interface NewsDigestItem {
  title: string;
  url: string;
  summary: string;
}

export interface NewsExtras {
  /** 'digest' = weekly round-up, 'story' = a single notable event. */
  type: 'digest' | 'story';
  /** Primary sources. Required and non-empty for real content. */
  sources: NewsSource[];
  /** Real dateModified. Absent means never revised. */
  updated?: string;
  /**
   * When the file actually shipped. This is the ONLY value permitted to appear
   * as `datePublished` in structured data. `date` is the EVENT date and drives
   * the slug, the displayed date and sort order. For a retrofilled post the two
   * deliberately differ.
   */
  publishedAt: string;
  /** True for entries written retrospectively as part of the archive. */
  backfilled: boolean;
  /** Digest-only: the week's items, for the ItemList JSON-LD. */
  items: NewsDigestItem[];
}

export const newsShape: CollectionShape<NewsExtras> = {
  defaults: {
    featuredImage: '/images/news/default-featured.svg',
    previewImage: '/images/news/default-preview.svg',
    authorName: 'Nostr WoT Newsroom',
  },
  includeAuthorSocials: false,
  parseExtra: (data) => ({
    type: data.type || 'story',
    sources: data.sources || [],
    updated: data.updated ? new Date(data.updated).toISOString() : undefined,
    publishedAt: data.publishedAt
      ? new Date(data.publishedAt).toISOString()
      : data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
    backfilled: data.backfilled === true,
    items: data.items || [],
  }),
};

export const newsSort = (a: ContentMeta, b: ContentMeta): number =>
  new Date(b.date).getTime() - new Date(a.date).getTime();
```

**Critical:** these values must match `scripts/generate-content-cache.mjs`'s news block EXACTLY. Read that block first and copy from it. `tests/content-mapper-parity.test.ts` will fail if they diverge. The one permitted difference is the clock fallback: the generator uses its injectable `now()`, this uses `new Date()`.

- [ ] **Step 2: Create `lib/news.ts`**

```ts
import path from 'path';
import { createContentCollection } from '@/lib/content/collection';
import { newsShape, newsSort } from '@/lib/content/shapes';
import type { ContentMeta, ContentDoc } from '@/lib/content/types';
import newsCache from '@/lib/generated/news-cache.json';
import type { Locale } from '@/i18n/config';

export type {
  NewsSource,
  NewsDigestItem,
  NewsExtras,
} from '@/lib/content/shapes';
import type { NewsExtras } from '@/lib/content/shapes';

export type NewsPostMeta = ContentMeta & NewsExtras;
export type NewsPost = ContentDoc & NewsExtras;

const collection = createContentCollection<NewsExtras>({
  name: 'news',
  contentDir: path.join(process.cwd(), 'content', 'news'),
  cache: newsCache as never,
  shape: newsShape,
  sort: newsSort,
});

export const getNewsSlugs = (locale?: Locale) => collection.getSlugs(locale);
export const getNewsPost = (slug: string, locale?: Locale) => collection.getPost(slug, locale);
export const getAllNews = (locale?: Locale) => collection.getAll(locale);
export const getNewsByTag = (tag: string, locale?: Locale) => collection.getByTag(tag, locale);
export const getAllNewsTags = (locale?: Locale) => collection.getAllTags(locale);
export const getRelatedNews = (slug: string, limit?: number, locale?: Locale) =>
  collection.getRelated(slug, limit, locale);
export const getNewsTranslations = (key: string) => collection.getTranslations(key);

/** Posts whose event date falls in the given UTC year and month (month is 1-12). */
export function getNewsForMonth(year: number, month: number, locale?: Locale): NewsPostMeta[] {
  return getAllNews(locale).filter((p) => {
    const d = new Date(p.date);
    return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
  });
}

/** Distinct {year, month} buckets that contain at least one post, newest first. */
export function getNewsArchiveMonths(locale?: Locale): { year: number; month: number; count: number }[] {
  const buckets = new Map<string, { year: number; month: number; count: number }>();
  for (const p of getAllNews(locale)) {
    const d = new Date(p.date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const key = `${year}-${month}`;
    const existing = buckets.get(key);
    if (existing) existing.count += 1;
    else buckets.set(key, { year, month, count: 1 });
  }
  return [...buckets.values()].sort((a, b) => (b.year - a.year) || (b.month - a.month));
}
```

- [ ] **Step 3: Create the default images**

`public/images/news/default-featured.svg` (1200×630):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="Nostr WoT News">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="600" y="300" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="72" font-weight="700" fill="#ffffff">Nostr WoT</text>
  <text x="600" y="380" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="36" fill="#a5b4fc" letter-spacing="8">NEWS</text>
</svg>
```

`public/images/news/default-preview.svg` — identical content; copy the file.

- [ ] **Step 4: Verify the collection resolves with no content**

The news content dirs exist but hold only `.gitkeep`. Confirm the library returns empty rather than throwing:

```bash
cat > /tmp/news-probe.ts <<'EOF'
import { getAllNews, getAllNewsTags, getNewsArchiveMonths, getNewsPost } from '@/lib/news';
console.log('all:', getAllNews('en').length);
console.log('tags:', getAllNewsTags('en').length);
console.log('months:', getNewsArchiveMonths('en').length);
console.log('missing post:', getNewsPost('nope', 'en'));
EOF
NODE_ENV=development node --import tsx /tmp/news-probe.ts && rm /tmp/news-probe.ts
```

Expected: `all: 0`, `tags: 0`, `months: 0`, `missing post: null`. No exception.

- [ ] **Step 5: Run the four gates**

Run: `npx tsc --noEmit && npm test && npm run test:parity && npm run build`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add lib/content/shapes.ts lib/news.ts public/images/news
git commit -m "Add the news collection library"
```

---

### Task 2: News in the generator, fixtures and parity golden

Phase 1 deliberately left news out of the parity golden because `lib/news.ts` did not exist. It does now, so news must join the drift protection blog and guides already have — otherwise the news mapper can drift silently. This is the carry-forward recorded in the spec.

**Files:**
- Modify: `scripts/generate-content-cache.mjs`
- Create: `tests/fixtures/content/parity/news/en/2026-01-05-week-in-review.mdx`, `2026-01-07-a-story.mdx`, `2026-01-09-minimal.md`
- Modify: `tests/content-mapper-parity.test.ts`
- Modify: `tests/fixtures/content-cache-golden.json` (regenerated)

**Interfaces:**
- Consumes: `newsShape` from Task 1
- Produces: `lib/generated/news-cache.ts` emitting interface `NewsCache`; news covered by the mapper-parity test and the golden

- [ ] **Step 1: Turn on the news type file**

In `scripts/generate-content-cache.mjs`, the news collection's `emitTypes` is `null` with a comment saying phase 2 turns it on. Replace it with:

```js
    emitTypes: { typeName: 'NewsPost', typeImport: "import type { NewsPost } from '@/lib/news';", interfaceName: 'NewsCache' },
```

The generator destructures `const { typeName, typeImport, interfaceName } = collection.emitTypes;` (line ~233), so those three field names are required and are what the blog entry uses. Delete the now-stale comment about phase 2.

- [ ] **Step 2: Add news parity fixtures**

`tests/fixtures/content/parity/news/en/2026-01-05-week-in-review.mdx`:

```mdx
---
title: "Week in review"
description: "A digest fixture"
excerpt: "Digest excerpt"
date: "2026-01-05"
type: "digest"
publishedAt: "2026-01-05"
tags: ["Digest"]
translationKey: "2026-01-05-week-in-review"
sources:
  - title: "Example source"
    url: "https://example.com/a"
    publisher: "Example"
    date: "2026-01-04"
items:
  - title: "Item one"
    url: "https://example.com/one"
    summary: "First item"
---

Digest body.
```

`tests/fixtures/content/parity/news/en/2026-01-07-a-story.mdx`:

```mdx
---
title: "A story"
description: "A story fixture"
excerpt: "Story excerpt"
date: "2026-01-07"
type: "story"
publishedAt: "2026-08-21"
backfilled: true
updated: "2026-08-22"
tags: ["Story", "Shared"]
translationKey: "2026-01-07-a-story"
sources:
  - title: "Primary source"
    url: "https://example.com/b"
---

Story body. This one is backfilled, so `date` and `publishedAt` differ deliberately.
```

`tests/fixtures/content/parity/news/en/2026-01-09-minimal.md`:

```mdx
---
title: "Minimal"
date: "2026-01-09"
translationKey: "2026-01-09-minimal"
---

Minimal body exercising every default.
```

- [ ] **Step 3: Confirm the parity fixture run includes news**

`scripts/verify-cache-parity.mjs:37` declares `const COLLECTIONS = ['blog', 'guides'];` and passes it through as `CONTENT_CACHE_ONLY`. Add `'news'` to that array.

**The clock:** news's `publishedAt` falls back to the current time when frontmatter omits it, which would make the golden non-deterministic. The generator already has an injectable `now()` (`CONTENT_CACHE_NOW`) for exactly this. Ensure the parity run sets it to a fixed value. The `2026-01-09-minimal.md` fixture omits `publishedAt` specifically to exercise that fallback — if the golden turns out non-deterministic, that is the fixture proving it, and the fix is to pin the clock, NOT to delete the fixture.

- [ ] **Step 4: Extend the mapper-parity test to news**

In `tests/content-mapper-parity.test.ts`, add news alongside the existing blog and guides cases: same fixtures through both `newsShape` (via `buildDocument`) and the generator's news `COLLECTIONS` entry, asserting identical keys, key order, and values, plus equality of `defaults` and `parseExtra` output.

Follow the file's existing structure exactly — read it first.

- [ ] **Step 5: Regenerate the golden deliberately**

Run: `npm run test:parity:update`
Then: `git diff tests/fixtures/content-cache-golden.json`

**Review that diff before accepting it.** It must show news being ADDED and must show NO change to any blog or guides entry. If a blog or guides value changed, something regressed — stop and report BLOCKED.

- [ ] **Step 6: Prove the news drift protection actually works**

Temporarily change the news `type` default in `lib/content/shapes.ts` from `'story'` to `'note'` WITHOUT touching the generator. Run `npm test`. It MUST fail. Revert, re-run, confirm it passes. Report the observed failure output — this is the evidence the task worked.

- [ ] **Step 7: Run the four gates**

Run: `npx tsc --noEmit && npm test && npm run test:parity && npm run build`
Expected: all pass. Confirm `lib/generated/news-cache.ts` now exists.

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-content-cache.mjs tests/ lib/generated/news-cache.ts
git commit -m "Cover the news collection with mapper-parity and the cache golden"
```

---

### Task 3: Shared JSON-LD builders

**Files:**
- Create: `lib/jsonld.tsx` (it renders JSX, so `.tsx` from the start)
- Create: `tests/jsonld.test.ts`
- Modify: `app/[locale]/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getFullUrl` from `@/lib/metadata`
- Produces: `ORG`, `PUBLISHER`, `JsonLd`, `newsArticleJsonLd`, `blogPostingJsonLd`, `breadcrumbJsonLd`, `collectionPageJsonLd`, `itemListJsonLd`

- [ ] **Step 1: Write the failing test**

Create `tests/jsonld.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newsArticleJsonLd,
  breadcrumbJsonLd,
  itemListJsonLd,
  collectionPageJsonLd,
} from '../lib/jsonld';

const base = {
  headline: 'ML-DSA lands in a client',
  description: 'Excerpt here',
  image: '/images/news/default-featured.svg',
  url: 'https://nostr-wot.com/news/2026-08-21-ml-dsa',
  eventDate: '2026-08-21T00:00:00.000Z',
  publishedAt: '2026-08-25T00:00:00.000Z',
  tags: ['Nostr', 'PQC'],
  sources: [{ title: 'Release notes', url: 'https://example.com/r' }],
};

test('datePublished uses publishedAt, never the event date', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.equal(ld.datePublished, '2026-08-25T00:00:00.000Z');
  assert.notEqual(ld.datePublished, base.eventDate);
});

test('dateModified falls back to publishedAt when never revised', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.equal(ld.dateModified, '2026-08-25T00:00:00.000Z');
});

test('dateModified uses updated when present', () => {
  const ld = newsArticleJsonLd({ ...base, updated: '2026-09-01T00:00:00.000Z' }) as any;
  assert.equal(ld.dateModified, '2026-09-01T00:00:00.000Z');
});

test('type is NewsArticle and author is an Organization, never a Person', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.equal(ld['@type'], 'NewsArticle');
  assert.equal(ld.author['@type'], 'Organization');
  assert.notEqual(ld.author['@type'], 'Person');
});

test('sources become citation entries', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.equal(ld.citation.length, 1);
  assert.equal(ld.citation[0].url, 'https://example.com/r');
});

test('digest items become an ItemList with positions starting at 1', () => {
  const ld = itemListJsonLd([
    { title: 'a', url: 'https://x/1', summary: 's' },
    { title: 'b', url: 'https://x/2', summary: 's' },
  ]) as any;
  assert.equal(ld['@type'], 'ItemList');
  assert.equal(ld.itemListElement[0].position, 1);
  assert.equal(ld.itemListElement[1].position, 2);
  assert.equal(ld.itemListElement[1].url, 'https://x/2');
});

test('breadcrumbs number sequentially from 1', () => {
  const ld = breadcrumbJsonLd([
    { name: 'Home', url: 'https://nostr-wot.com' },
    { name: 'News', url: 'https://nostr-wot.com/news' },
  ]) as any;
  assert.deepEqual(ld.itemListElement.map((i: any) => i.position), [1, 2]);
});

test('collection page carries its url and name', () => {
  const ld = collectionPageJsonLd({ name: 'News', description: 'd', url: 'https://nostr-wot.com/news' }) as any;
  assert.equal(ld['@type'], 'CollectionPage');
  assert.equal(ld.url, 'https://nostr-wot.com/news');
});

test('relative images are absolutised', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.ok(String(ld.image).startsWith('https://'), `expected absolute, got ${ld.image}`);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../lib/jsonld`.

- [ ] **Step 3: Write `lib/jsonld.tsx`**

```ts
import type { NewsSource, NewsDigestItem } from '@/lib/content/shapes';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostr-wot.com';

function absolute(url: string): string {
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}

export const ORG = {
  '@type': 'Organization',
  name: 'Nostr WoT Newsroom',
  url: `${BASE_URL}/news`,
} as const;

export const PUBLISHER = {
  '@type': 'NewsMediaOrganization',
  name: 'Nostr Web of Trust',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/icon-512.png`,
  },
} as const;

export interface NewsArticleArgs {
  headline: string;
  description: string;
  image: string;
  url: string;
  /** The EVENT date. Deliberately NOT used for datePublished. */
  eventDate: string;
  /** When the article actually shipped. The only value allowed as datePublished. */
  publishedAt: string;
  updated?: string;
  tags?: string[];
  sources?: NewsSource[];
}

export function newsArticleJsonLd(args: NewsArticleArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: args.headline,
    description: args.description,
    image: absolute(args.image),
    // datePublished is the real ship date. Using the event date here would
    // misrepresent freshness to search engines for backfilled archive entries.
    datePublished: args.publishedAt,
    dateModified: args.updated || args.publishedAt,
    author: ORG,
    publisher: PUBLISHER,
    mainEntityOfPage: { '@type': 'WebPage', '@id': args.url },
    url: args.url,
    ...(args.tags?.length ? { keywords: args.tags.join(', ') } : {}),
    ...(args.sources?.length
      ? {
          citation: args.sources.map((s) => ({
            '@type': 'CreativeWork',
            name: s.title,
            url: s.url,
            ...(s.publisher ? { publisher: { '@type': 'Organization', name: s.publisher } } : {}),
            ...(s.date ? { datePublished: s.date } : {}),
          })),
        }
      : {}),
  };
}

export interface BlogPostingArgs {
  headline: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  authorSameAs?: string[];
  tags?: string[];
}

export function blogPostingJsonLd(args: BlogPostingArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: args.headline,
    description: args.description,
    image: absolute(args.image),
    datePublished: args.datePublished,
    dateModified: args.dateModified || args.datePublished,
    author: {
      '@type': 'Person',
      name: args.authorName,
      ...(args.authorUrl ? { url: args.authorUrl } : {}),
      affiliation: {
        '@type': 'Organization',
        name: 'Nostr Web of Trust',
        url: BASE_URL,
      },
      ...(args.authorSameAs?.length ? { sameAs: args.authorSameAs } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nostr Web of Trust',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': args.url },
    ...(args.tags?.length ? { keywords: args.tags.join(', ') } : {}),
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function itemListJsonLd(items: NewsDigestItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.title,
      url: it.url,
      ...(it.summary ? { description: it.summary } : {}),
    })),
  };
}

export function collectionPageJsonLd(args: {
  name: string;
  description: string;
  url: string;
  items?: { name: string; url: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: args.name,
    description: args.description,
    url: args.url,
    ...(args.items?.length
      ? {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: args.items.map((it, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: it.name,
              url: it.url,
            })),
          },
        }
      : {}),
  };
}
```

- [ ] **Step 4: Add the `JsonLd` render helper**

Append to `lib/jsonld.tsx`:

```ts
/** Renders one or more JSON-LD graphs as script tags. */
export function JsonLd({ data }: { data: object | object[] }) {
  const graphs = Array.isArray(data) ? data : [data];
  return (
    <>
      {graphs.map((g, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(g) }}
        />
      ))}
    </>
  );
}
```

The file is `.tsx` because of this component. Every import stays extensionless — `@/lib/jsonld` from app code, `../lib/jsonld` from the test. Verified on this machine: tsx resolves an extensionless import to a `.tsx` file, so the test import needs no change.

- [ ] **Step 5: Run to verify the tests pass**

Run: `npm test`
Expected: PASS, 9 new tests.

- [ ] **Step 6: Move the blog page onto the shared builders**

In `app/[locale]/blog/[slug]/page.tsx`, replace the inline `jsonLd` and `breadcrumbJsonLd` object literals with `blogPostingJsonLd(...)` and `breadcrumbJsonLd(...)`, and replace the two `<script type="application/ld+json">` tags with `<JsonLd data={[postLd, crumbsLd]} />`.

**Preserve the emitted JSON exactly — this is a refactor, not a redesign.** Prove it rather than eyeballing it:

1. BEFORE editing, copy the current file: `cp "app/[locale]/blog/[slug]/page.tsx" /tmp/blog-page-before.tsx`
2. Extract the two object literals from the copy into a scratch script, `JSON.stringify` them with a representative post, and save the result to `/tmp/ld-before.json`.
3. After the refactor, call `blogPostingJsonLd` and `breadcrumbJsonLd` with the SAME post and save to `/tmp/ld-after.json`.
4. Run `diff /tmp/ld-before.json /tmp/ld-after.json`. It must produce NO output.

Paste that diff result in your report. If any field differs — `dateModified` is the likely one — change the builder to match the OLD behaviour, not the other way round. Clean up the `/tmp` files when done.

- [ ] **Step 7: Run the four gates**

Run: `npx tsc --noEmit && npm test && npm run test:parity && npm run build`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add lib/jsonld.tsx tests/jsonld.test.ts "app/[locale]/blog/[slug]/page.tsx"
git commit -m "Extract shared JSON-LD builders and use them for blog posts"
```

---

### Task 4: 7-locale message files

**Files:**
- Create: `messages/<locale>/news.json` × 7
- Modify: `messages/<locale>/index.ts` × 7

**Interfaces:**
- Produces: the `news` message namespace, consumed by every route in Task 5

- [ ] **Step 1: Write the English messages**

`messages/en/news.json`:

```json
{
  "meta": {
    "title": "Nostr Ecosystem News",
    "description": "What is actually happening across the Nostr ecosystem: protocol changes, client releases, security disclosures and adoption, with primary sources for every item."
  },
  "title": "News",
  "subtitle": "What is actually happening across the Nostr ecosystem",
  "latest": "Latest",
  "readMore": "Read more",
  "backToNews": "Back to News",
  "types": {
    "digest": "Week in review",
    "story": "Story"
  },
  "sources": {
    "heading": "Sources",
    "intro": "Every claim in this piece links to a primary source."
  },
  "disclosure": "Assembled by the Nostr WoT Newsroom from the cited primary sources, and corrected by a human.",
  "backfilled": "Archive entry, written retrospectively.",
  "publishedOn": "Published {date}",
  "eventDate": "Event date {date}",
  "updatedOn": "Updated {date}",
  "digestItems": "In this digest",
  "archive": {
    "title": "News archive",
    "subtitle": "Every story and digest, by month",
    "monthTitle": "{month} {year}",
    "monthDescription": "Nostr ecosystem news from {month} {year}.",
    "count": "{count, plural, =1 {# entry} other {# entries}}",
    "browse": "Browse the archive"
  },
  "empty": {
    "title": "No news yet",
    "description": "The newsroom publishes when something worth reporting actually happens. Check back soon."
  },
  "relatedNews": "More from the newsroom",
  "pagination": {
    "previous": "Previous",
    "next": "Next",
    "page": "Page {current} of {total}"
  }
}
```

- [ ] **Step 2: Translate into the other six locales**

Create `messages/<locale>/news.json` for `es`, `pt`, `ru`, `it`, `fr`, `de` with the SAME key structure and translated values. Match the register and terminology already used in that locale's `blog.json` and `guides.json` — read them first. Keep ICU placeholders (`{date}`, `{count, plural, ...}`, `{month}`, `{year}`, `{current}`, `{total}`) EXACTLY as they appear in English; translating a placeholder name breaks the build.

- [ ] **Step 3: Register in all seven index files**

In each `messages/<locale>/index.ts`, add `import news from './news.json';` alongside the other imports and add `news,` to the exported `messages` object. Follow the existing ordering convention in each file.

- [ ] **Step 4: Verify every locale loads and has identical keys**

```bash
cat > /tmp/msg-check.ts <<'EOF'
import { locales } from '@/i18n/config';
function keys(o: any, p = ''): string[] {
  return Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]
  );
}
const ref = keys((await import('../messages/en/news.json')).default).sort();
for (const l of locales) {
  const m = (await import(`../messages/${l}/index`)).default;
  if (!m.news) throw new Error(`${l}: news namespace NOT registered`);
  const k = keys(m.news).sort();
  const missing = ref.filter(x => !k.includes(x));
  const extra = k.filter(x => !ref.includes(x));
  console.log(l, 'keys:', k.length, missing.length ? `MISSING ${missing}` : '', extra.length ? `EXTRA ${extra}` : '');
  if (missing.length || extra.length) throw new Error(`${l} key mismatch`);
}
console.log('all 7 locales OK');
EOF
node --import tsx /tmp/msg-check.ts && rm /tmp/msg-check.ts
```

Expected: seven lines then `all 7 locales OK`. Any missing or extra key is a failure — fix before continuing.

- [ ] **Step 5: Run the four gates and commit**

Run: `npx tsc --noEmit && npm test && npm run test:parity && npm run build`

```bash
git add messages/
git commit -m "Add news UI copy in all seven locales"
```

---

### Task 5: News routes

**Files:**
- Create: `components/news/NewsCard.tsx`, `components/news/NewsMeta.tsx`, `components/news/index.ts`
- Create: `app/[locale]/news/page.tsx`
- Create: `app/[locale]/news/[slug]/page.tsx`
- Create: `app/[locale]/news/[slug]/opengraph-image.tsx`
- Create: `app/[locale]/news/archive/[year]/[month]/page.tsx`

**Interfaces:**
- Consumes: `lib/news.ts` (Task 1), `lib/jsonld.tsx` (Task 3), the `news` messages (Task 4), and existing `@/components/ui`, `@/components/blog` (`BlogContent` renders MDX), `@/lib/metadata`
- Produces: the four routes

- [ ] **Step 1: Read the blog routes first and mirror them**

Read `app/[locale]/blog/page.tsx` and `app/[locale]/blog/[slug]/page.tsx` completely before writing anything. The news routes must follow the same structure, the same `generateStaticParams` / `generateMetadata` patterns, the same components (`ScrollReveal`, `Section`, `LinkButton`, `BlogContent`), and the same `generateBlogAlternates` usage for hreflang. Do not invent a different architecture.

- [ ] **Step 2: Build `components/news/NewsMeta.tsx`**

A small server component rendering, for one post: the type badge (`digest` or `story` from `t('types.*')`), the displayed EVENT date as `<time dateTime={post.date}>`, the reading time, the AI-disclosure line from `t('disclosure')`, and — only when `post.backfilled` is true — the `t('backfilled')` notice. Keep it presentational; take the post and the translated strings as props.

- [ ] **Step 3: Build `components/news/NewsCard.tsx`**

Mirror `components/blog/BlogCard.tsx` (read it first). Links to `/news/<slug>`, shows the type badge, title, excerpt, event date and tags.

`components/news/index.ts` re-exports both.

- [ ] **Step 4: Build the index route `app/[locale]/news/page.tsx`**

- `generateMetadata` using `t('meta.title')`, `t('meta.description')`, `generateAlternates('/news', locale)`, plus OpenGraph and Twitter via the existing `generateOpenGraph` / `generateTwitter` helpers.
- Renders the newest 12 posts as `NewsCard`s, newest first.
- Renders the empty state (`t('empty.title')`, `t('empty.description')`) when there are none. **This is the state that ships in this phase, so it must look deliberate, not broken.**
- Links to the archive months from `getNewsArchiveMonths(locale)`.
- Emits `collectionPageJsonLd` (with the listed posts as items) and `breadcrumbJsonLd` (Home → News) via `<JsonLd data={[...]} />`.

- [ ] **Step 5: Build the article route `app/[locale]/news/[slug]/page.tsx`**

- `generateStaticParams` over every locale × `getNewsSlugs(locale)`.
- `generateMetadata`: `seoTitle || title`, `seoDescription || excerpt`, `generateBlogAlternates('/news', post.translations, locale)`, OpenGraph `type: 'article'` with `publishedTime: post.publishedAt`.
- `notFound()` when the post is missing or `published === false`.
- Body via `<BlogContent content={post.content} />`.
- `NewsMeta` under the title.
- For `type === 'digest'`, render the `items` list with outbound links.
- A "Sources" section listing `post.sources` as outbound links with `rel="noopener noreferrer"`, headed by `t('sources.heading')`.
- JSON-LD via `<JsonLd data={[...]} />`: `newsArticleJsonLd` (passing `eventDate: post.date` and `publishedAt: post.publishedAt` — **do not swap these**), `breadcrumbJsonLd` (Home → News → title), and for digests also `itemListJsonLd(post.items)`.

- [ ] **Step 6: Build `app/[locale]/news/[slug]/opengraph-image.tsx`**

Copy `app/[locale]/blog/[slug]/opengraph-image.tsx` and adapt it to `getNewsPost`. Read the original first; keep its `size`, `contentType` and runtime exports identical.

- [ ] **Step 7: Build the archive route `app/[locale]/news/archive/[year]/[month]/page.tsx`**

- `generateStaticParams` over every locale × `getNewsArchiveMonths(locale)`, with `month` zero-padded to two digits.
- Lists that month's posts via `getNewsForMonth`.
- `generateMetadata` with `t('archive.monthTitle')` / `t('archive.monthDescription')` and canonical alternates.
- Emits `collectionPageJsonLd` and `breadcrumbJsonLd` (Home → News → month).
- `notFound()` for a year/month with no posts, or for a non-numeric or out-of-range `month` (must be 1-12) — do not let an arbitrary URL segment render a page.

- [ ] **Step 8: Verify the empty state renders**

```bash
npm run build
```

Then check the index renders with zero posts and does not throw. With no content, `generateStaticParams` returns an empty array for the article and archive routes, which is valid.

- [ ] **Step 9: Verify a real article renders, using a TEMPORARY post**

Create `content/news/en/2026-08-21-verification-probe.mdx` with `type: story`, a `date`, a `publishedAt` that DIFFERS from `date`, `backfilled: true`, two `sources`, and a short body. Also create a digest probe with two `items`.

Start the dev server and confirm, for BOTH probes:
- the page renders at `/news/<slug>`
- the sources block lists both links
- the disclosure line and the backfilled notice appear
- `JSON.parse` of the `application/ld+json` script yields `@type: "NewsArticle"`, `author['@type'] === 'Organization'`, and **`datePublished` equal to `publishedAt`, NOT to `date`**
- the digest additionally emits an `ItemList` with both items
- the index lists both, and the archive page for that month lists both

Record the parsed JSON-LD in your report as evidence.

**Then DELETE both probe files** and re-run `npm run build`. Confirm `git status` shows no leftover files under `content/news/`. Phase 2 ships empty.

- [ ] **Step 10: Run the four gates**

Run: `npx tsc --noEmit && npm test && npm run test:parity && npm run build`
Expected: all pass.

- [ ] **Step 11: Commit**

```bash
git add app components/news
git commit -m "Add /news index, article, archive and OG image routes"
```

---

## Done criteria

- [ ] `npx tsc --noEmit` clean
- [ ] `npm test` passes, including the news mapper-parity cases and the JSON-LD tests
- [ ] `npm run test:parity` passes with news in the golden
- [ ] `npm run build` succeeds
- [ ] `lib/generated/news-cache.ts` exists and compiles
- [ ] All 7 locales expose an identical `news` key set
- [ ] `content/news/<locale>/` contains only `.gitkeep` — no probe files left behind
- [ ] `datePublished` in news JSON-LD comes from `publishedAt`, never from the event date — proven by both a unit test and the rendered-page evidence

## Follow-on

- Phase 2b — RSS/JSON feeds, Google News sitemap, `sitemap.ts` / `robots.ts` / `llms.txt` / IndexNow wiring, nav + footer + homepage surfacing, feed autodiscovery
- Phase 3 — six-month retrofill
- Phase 4 — daily newsroom agent
