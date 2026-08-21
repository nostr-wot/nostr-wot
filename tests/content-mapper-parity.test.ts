/**
 * Closes the mapper-drift hole.
 *
 * The frontmatter mapper exists twice on purpose: `lib/content/build.ts` for the
 * dev/runtime path, and a plain-JS copy inside `scripts/generate-content-cache.mjs`
 * because `prebuild` runs bare node with no TS loader. Nothing else in the repo
 * compares the two, so a default changed in only one of them would leave every
 * gate green while dev-mode silently diverged from production.
 *
 * These tests drive BOTH mappers over the same fixture files, with the real
 * production shapes on the TS side (`lib/content/shapes.ts`, which `lib/blog.ts`
 * and `lib/guides.ts` consume) and the real generator config on the JS side
 * (`COLLECTIONS`), and assert identical keys, identical key ORDER, and identical
 * values.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { buildDocument as buildDocumentTs } from '../lib/content/build';
import { blogShape, blogSort, guidesShape, guidesSort, newsShape, newsSort } from '../lib/content/shapes';
import type { CollectionShape } from '../lib/content/types';
import type { Locale } from '@/i18n/config';
import {
  COLLECTIONS,
  buildDocument as buildDocumentJs,
  buildTranslationMap,
} from '../scripts/generate-content-cache.mjs';

const FIXTURE_ROOT = path.join(process.cwd(), 'tests', 'fixtures', 'content', 'parity');

/** The real generator collection, redirected at the fixture tree. */
function jsCollection(name: string) {
  const base = (COLLECTIONS as any[]).find((c) => c.name === name);
  assert.ok(base, `generator has no "${name}" collection`);
  return { ...base, dir: path.join(FIXTURE_ROOT, name) };
}

function readRaw(dir: string, locale: string, slug: string): string {
  for (const ext of ['.mdx', '.md']) {
    const file = path.join(dir, locale, `${slug}${ext}`);
    if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  }
  throw new Error(`fixture not found: ${dir}/${locale}/${slug}`);
}

/**
 * A document with no `date` falls back to "now" on both sides, milliseconds
 * apart. Pin it so everything else can be compared strictly.
 */
function pinNow(doc: Record<string, any>, hasDate: boolean) {
  if (!hasDate) doc.date = '<NOW>';
  return doc;
}

function bothMappers(name: string, shape: CollectionShape<any>, locale: Locale, slug: string) {
  const collection = jsCollection(name);
  const map = buildTranslationMap(collection);

  const fromJs = buildDocumentJs(collection, slug, locale, map) as Record<string, any>;
  assert.ok(fromJs, `generator mapper returned nothing for ${name}/${locale}/${slug}`);

  const raw = readRaw(collection.dir, locale, slug);
  const { data, content } = matter(raw);
  const translations = map.get(data.translationKey || slug) || {};
  const fromTs = buildDocumentTs({
    slug,
    locale,
    data,
    content,
    translations,
    shape,
  }) as unknown as Record<string, any>;

  const hasDate = Boolean(data.date);
  return { fromJs: pinNow(fromJs, hasDate), fromTs: pinNow(fromTs, hasDate) };
}

function assertIdentical(name: string, shape: CollectionShape<any>, locale: Locale, slug: string) {
  const { fromJs, fromTs } = bothMappers(name, shape, locale, slug);
  const where = `${name}/${locale}/${slug}`;
  assert.deepEqual(Object.keys(fromTs), Object.keys(fromJs), `key order diverged for ${where}`);
  assert.deepEqual(
    Object.keys(fromTs.author),
    Object.keys(fromJs.author),
    `author key order diverged for ${where}`
  );
  assert.deepEqual(fromTs, fromJs, `mapped values diverged for ${where}`);
  // JSON is what actually ships, and it is order-sensitive.
  assert.equal(
    JSON.stringify(fromTs),
    JSON.stringify(fromJs),
    `serialised output diverged for ${where}`
  );
}

const BLOG_DOCS: Array<[Locale, string]> = [
  ['en', 'hello-world'], // every optional field present, author with socials
  ['en', 'minimal-post'], // .md, no author, no images -> defaults
  ['en', 'undated-note'], // no date -> "now" fallback
  ['en', 'hidden-post'], // published: false
  ['es', 'hola-mundo'], // translation pair
];

const GUIDES_DOCS: Array<[Locale, string]> = [
  ['en', 'getting-started'], // explicit order/difficulty, socials must be dropped
  ['en', 'middle-guide'],
  ['en', 'defaults-guide'], // .md, order/difficulty defaults
  ['en', 'unpublished-guide'],
  ['es', 'primeros-pasos'],
];

const NEWS_DOCS: Array<[Locale, string]> = [
  ['en', '2026-01-05-week-in-review'], // digest, explicit sources + items
  ['en', '2026-01-07-a-story'], // backfilled: date and publishedAt differ, updated set
  ['en', '2026-01-09-minimal'], // .md, no publishedAt/type/sources/items -> defaults
];

for (const [locale, slug] of BLOG_DOCS) {
  test(`blog mapper parity: TS and generator agree on ${locale}/${slug}`, () => {
    assertIdentical('blog', blogShape, locale, slug);
  });
}

for (const [locale, slug] of GUIDES_DOCS) {
  test(`guides mapper parity: TS and generator agree on ${locale}/${slug}`, () => {
    assertIdentical('guides', guidesShape, locale, slug);
  });
}

for (const [locale, slug] of NEWS_DOCS) {
  test(`news mapper parity: TS and generator agree on ${locale}/${slug}`, () => {
    assertIdentical('news', newsShape, locale, slug);
  });
}

test('collection defaults are identical on both sides', () => {
  for (const [name, shape] of [
    ['blog', blogShape],
    ['guides', guidesShape],
    ['news', newsShape],
  ] as Array<[string, CollectionShape<any>]>) {
    const collection = jsCollection(name);
    assert.deepEqual(shape.defaults, collection.defaults, `${name} defaults diverged`);
    assert.equal(
      shape.includeAuthorSocials,
      collection.includeAuthorSocials,
      `${name} includeAuthorSocials diverged`
    );
  }
});

test('parseExtra is identical on both sides for every extras permutation', () => {
  const samples: Array<Record<string, any>> = [
    {},
    { difficulty: 'advanced' },
    { order: 0 },
    { order: 7 },
    { difficulty: 'intermediate', order: 3 },
    { difficulty: '', order: null },
  ];
  for (const [name, shape] of [
    ['blog', blogShape],
    ['guides', guidesShape],
  ] as Array<[string, CollectionShape<any>]>) {
    const collection = jsCollection(name);
    for (const sample of samples) {
      assert.deepEqual(
        shape.parseExtra(sample),
        collection.parseExtra(sample),
        `${name} parseExtra diverged for ${JSON.stringify(sample)}`
      );
    }
  }
});

// News' parseExtra falls back to the real clock when both `publishedAt` and
// `date` are absent, and the TS side's fallback (`new Date()`) is not
// pinnable via CONTENT_CACHE_NOW the way the generator's is. Every sample
// here carries a `date` so neither side ever reaches that branch, keeping
// the comparison deterministic while still exercising every other default.
test('news parseExtra is identical on both sides for every extras permutation', () => {
  const samples: Array<Record<string, any>> = [
    { date: '2026-01-01' },
    { type: 'digest', date: '2026-01-01' },
    { type: 'story', publishedAt: '2026-02-02', date: '2026-01-01' },
    { sources: [{ title: 'Source', url: 'https://example.com/s' }], date: '2026-01-01' },
    { updated: '2026-03-03', date: '2026-01-01' },
    { backfilled: true, date: '2026-01-01' },
    {
      items: [{ title: 'Item', url: 'https://example.com/i', summary: 'Summary' }],
      date: '2026-01-01',
    },
    {
      type: '',
      sources: null,
      updated: '',
      publishedAt: '',
      backfilled: false,
      items: null,
      date: '2026-01-01',
    },
  ];
  const collection = jsCollection('news');
  for (const sample of samples) {
    assert.deepEqual(
      newsShape.parseExtra(sample),
      collection.parseExtra(sample),
      `news parseExtra diverged for ${JSON.stringify(sample)}`
    );
  }
});

test('sort comparators are identical on both sides', () => {
  const blogRows = [
    { date: '2026-01-02T00:00:00.000Z' },
    { date: '2026-03-04T00:00:00.000Z' },
    { date: '2026-02-03T00:00:00.000Z' },
  ];
  const blogJs = jsCollection('blog').sort;
  assert.deepEqual(
    [...blogRows].sort(blogSort as any).map((r) => r.date),
    [...blogRows].sort(blogJs).map((r) => r.date)
  );

  const guideRows = [{ order: 99 }, { order: 1 }, {}, { order: 2 }];
  const guidesJs = jsCollection('guides').sort;
  assert.deepEqual(
    [...guideRows].sort(guidesSort as any).map((r) => (r as any).order),
    [...guideRows].sort(guidesJs).map((r) => (r as any).order)
  );

  const newsRows = [
    { date: '2026-01-02T00:00:00.000Z' },
    { date: '2026-03-04T00:00:00.000Z' },
    { date: '2026-02-03T00:00:00.000Z' },
  ];
  const newsJs = jsCollection('news').sort;
  assert.deepEqual(
    [...newsRows].sort(newsSort as any).map((r) => r.date),
    [...newsRows].sort(newsJs).map((r) => r.date)
  );
});
