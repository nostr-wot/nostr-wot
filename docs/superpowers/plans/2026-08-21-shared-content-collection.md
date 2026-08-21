# Shared Content Collection Implementation Plan (Phase 1 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated `lib/blog.ts` / `lib/guides.ts` content logic with one shared, tested module — proving byte-for-byte that existing blog and guides output is unchanged — so a third collection (news) can be added without a third copy.

**Architecture:** A `createContentCollection(config)` factory holds all read logic; per-collection differences (content dir, image defaults, author shape, extra frontmatter fields, sort order) become config. `lib/blog.ts` and `lib/guides.ts` become thin re-export shims so no call site changes. One parameterised cache generator replaces the two scripts. A parity harness snapshots the *current* generators' output and asserts the new one reproduces it exactly.

**Tech Stack:** Next.js 16, TypeScript 5.9, next-intl 4.8, gray-matter, reading-time, Node 20.19, `node:test` via the existing `tsx` devDependency (no new packages).

**Spec:** `docs/superpowers/specs/2026-08-21-news-section-design.md`

## Global Constraints

- **No new runtime dependencies.** Tests use `node:test` + the existing `tsx` devDependency.
- **Test command:** `node --import tsx --test tests/*.test.ts` — run from repo root. Node 20 does *not* auto-discover `.ts` test files and `sh` has no globstar, so tests live **flat** in `tests/` and the glob is single-level. Both facts verified on this machine.
- **Package manager is npm.** Never pnpm.
- **`lib/blog.ts` and `lib/guides.ts` must keep their exact current export names and signatures.** No call site in `app/` or `components/` may be edited in this phase.
- **Parity is the gate.** Blog and guides cache JSON must match pre-refactor output exactly, after normalising the `generatedAt` timestamp (which is regenerated every run and can never match).
- **Locales:** `['en','es','pt','ru','it','fr','de']`, default `en`. Import from `@/i18n/config`; never re-declare.
- **Commit after every task.** Do not push.

### Parity-critical differences (getting any of these wrong fails Task 3)

| | blog | guides |
|---|---|---|
| `featuredImage` default | `/images/blog/default-featured.svg` | `/images/guides/default-featured.svg` |
| `previewImage` default | `/images/blog/default-preview.svg` | `/images/guides/default-preview.svg` |
| `author.name` default | `Nostr WoT Team` | `Nostr WoT Team` |
| `author` keys | `name, avatar, npub, socials` | `name, avatar, npub` (**no socials**) |
| Extra fields | none | `difficulty` (default `'beginner'`), `order` (default `99`) |
| Extra field position | — | between `ogImage` and `content` |
| Sort | `date` descending | `order` ascending |
| Related-post tiebreak | `date` descending | `order` ascending |

**Key insertion order is load-bearing.** `JSON.stringify` preserves it, so the object literal must be built in exactly this order:
`slug, title, description, excerpt, date, author, featuredImage, previewImage, tags, published, readingTime, locale, translationKey, translations, availableLocales, seoTitle, seoDescription, ogImage, <extras>, content`

---

## File Structure

**Create:**
- `lib/content/types.ts` — shared types only, no logic
- `lib/content/collection.ts` — the `createContentCollection` factory
- `lib/content/build.ts` — the pure frontmatter→document mapper, shared by the runtime lib and the build script
- `scripts/generate-content-cache.mjs` — one parameterised generator
- `scripts/verify-cache-parity.mjs` — the regression proof
- `tests/content-build.test.ts` — unit tests for the mapper
- `tests/content-collection.test.ts` — unit tests for the factory
- `tests/fixtures/content/<collection>/<locale>/*.mdx` — test fixtures
- `.github/workflows/ci.yml` — build + parity + tests on PRs

**Modify:**
- `lib/blog.ts` — becomes a re-export shim
- `lib/guides.ts` — becomes a re-export shim
- `package.json` — `test`, `test:parity` scripts; `prebuild` calls the unified generator

**Delete (Task 3, only once parity is green):**
- `scripts/generate-blog-cache.mjs`
- `scripts/generate-guides-cache.mjs`

---

### Task 1: Parity harness and test infrastructure

Locks in current behaviour *before* anything is refactored. If this task is skipped, the rest of the plan has no safety net.

**Files:**
- Create: `scripts/verify-cache-parity.mjs`
- Modify: `package.json`
- Create: `tests/.gitkeep`

**Interfaces:**
- Consumes: nothing
- Produces: `npm run test:parity` — exits 0 when current and new generator output match; exits 1 and prints a diff otherwise. Baseline snapshots at `.parity-baseline/{blog,guides}-cache.json` (gitignored).

- [ ] **Step 1: Write the parity script**

Create `scripts/verify-cache-parity.mjs`:

```js
#!/usr/bin/env node
/**
 * Proves the unified cache generator reproduces the output of the original
 * per-collection generators exactly.
 *
 *   node scripts/verify-cache-parity.mjs --snapshot   capture baseline from current generators
 *   node scripts/verify-cache-parity.mjs              regenerate and compare against baseline
 *
 * `generatedAt` is normalised before comparison: it is a fresh timestamp on
 * every run and can never match.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_DIR = path.join(ROOT, '.parity-baseline');
const GENERATED_DIR = path.join(ROOT, 'lib', 'generated');
const COLLECTIONS = ['blog', 'guides'];

function normalise(jsonText) {
  const data = JSON.parse(jsonText);
  data.generatedAt = 'NORMALISED';
  return JSON.stringify(data, null, 2);
}

function readGenerated(name) {
  return normalise(fs.readFileSync(path.join(GENERATED_DIR, `${name}-cache.json`), 'utf8'));
}

function run(script) {
  execFileSync('node', [path.join(ROOT, 'scripts', script)], { stdio: 'inherit' });
}

const snapshot = process.argv.includes('--snapshot');

if (snapshot) {
  run('generate-blog-cache.mjs');
  run('generate-guides-cache.mjs');
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  for (const name of COLLECTIONS) {
    fs.writeFileSync(path.join(BASELINE_DIR, `${name}-cache.json`), readGenerated(name));
    console.log(`  ✓ baseline captured: ${name}`);
  }
  console.log('✅ Baseline snapshot written to .parity-baseline/');
  process.exit(0);
}

for (const name of COLLECTIONS) {
  const baselinePath = path.join(BASELINE_DIR, `${name}-cache.json`);
  if (!fs.existsSync(baselinePath)) {
    console.error(`❌ No baseline for "${name}". Run: node scripts/verify-cache-parity.mjs --snapshot`);
    process.exit(1);
  }
}

run('generate-content-cache.mjs');

let failed = false;
for (const name of COLLECTIONS) {
  const expected = fs.readFileSync(path.join(BASELINE_DIR, `${name}-cache.json`), 'utf8');
  const actual = readGenerated(name);
  if (expected === actual) {
    console.log(`  ✓ ${name}: identical`);
    continue;
  }
  failed = true;
  console.error(`  ✗ ${name}: MISMATCH`);
  const e = expected.split('\n');
  const a = actual.split('\n');
  let shown = 0;
  for (let i = 0; i < Math.max(e.length, a.length) && shown < 20; i++) {
    if (e[i] !== a[i]) {
      console.error(`    line ${i + 1}:\n      expected: ${e[i]}\n      actual:   ${a[i]}`);
      shown++;
    }
  }
}

if (failed) {
  console.error('\n❌ Parity check FAILED. The refactor changed output. Do not merge.');
  process.exit(1);
}
console.log('\n✅ Parity check passed: blog and guides output unchanged.');
```

- [ ] **Step 2: Add scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "node --import tsx --test tests/*.test.ts",
"test:parity": "node scripts/verify-cache-parity.mjs",
"test:parity:snapshot": "node scripts/verify-cache-parity.mjs --snapshot"
```

- [ ] **Step 3: Gitignore the baseline**

Append to `.gitignore`:

```
.parity-baseline/
```

- [ ] **Step 4: Capture the baseline and verify it is non-trivial**

Run: `npm run test:parity:snapshot`
Expected: `✓ baseline captured: blog`, `✓ baseline captured: guides`.

Then confirm the baseline actually contains the current content — 10 blog posts in `en`, not an empty array:

```bash
node -e "const c=require('./.parity-baseline/blog-cache.json');console.log('en posts:',c.locales.en.posts.length)"
```

Expected: `en posts: 10`. **If it prints 0, stop** — the baseline is worthless and the rest of the plan proves nothing.

- [ ] **Step 5: Confirm the comparison path fails correctly**

Run: `npm run test:parity`
Expected: FAIL — `generate-content-cache.mjs` does not exist yet. This confirms the check is actually wired up rather than silently passing.

- [ ] **Step 6: Create the tests directory**

```bash
mkdir -p tests && touch tests/.gitkeep
```

- [ ] **Step 7: Commit**

```bash
git add scripts/verify-cache-parity.mjs package.json .gitignore tests/.gitkeep
git commit -m "Add cache parity harness and test runner wiring"
```

---

### Task 2: Shared types and the document mapper

The mapper is the piece parity depends on, so it is built and tested in isolation before anything consumes it.

**Files:**
- Create: `lib/content/types.ts`
- Create: `lib/content/build.ts`
- Create: `tests/content-build.test.ts`

**Interfaces:**
- Consumes: `Locale` from `@/i18n/config`
- Produces:
  - `ContentAuthor`, `AuthorSocials`, `ContentMeta`, `ContentDoc`, `CollectionCache<T>`, `CollectionDefaults`, `CollectionShape<TExtra>`
  - `buildDocument<TExtra>(args: BuildArgs<TExtra>): ContentDoc & TExtra`

- [ ] **Step 1: Write the failing test**

Create `tests/content-build.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDocument } from '../lib/content/build.ts';

const BLOG_SHAPE = {
  defaults: {
    featuredImage: '/images/blog/default-featured.svg',
    previewImage: '/images/blog/default-preview.svg',
    authorName: 'Nostr WoT Team',
  },
  includeAuthorSocials: true,
  parseExtra: () => ({}),
};

const GUIDES_SHAPE = {
  defaults: {
    featuredImage: '/images/guides/default-featured.svg',
    previewImage: '/images/guides/default-preview.svg',
    authorName: 'Nostr WoT Team',
  },
  includeAuthorSocials: false,
  parseExtra: (data: Record<string, any>) => ({
    difficulty: data.difficulty || 'beginner',
    order: data.order || 99,
  }),
};

test('applies blog image defaults when frontmatter omits them', () => {
  const doc = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'body',
    translations: { en: 'x' }, shape: BLOG_SHAPE,
  });
  assert.equal(doc.featuredImage, '/images/blog/default-featured.svg');
  assert.equal(doc.previewImage, '/images/blog/default-preview.svg');
});

test('previewImage falls back to featuredImage before its own default', () => {
  const doc = buildDocument({
    slug: 'x', locale: 'en', data: { featuredImage: '/custom.png' }, content: 'body',
    translations: { en: 'x' }, shape: BLOG_SHAPE,
  });
  assert.equal(doc.previewImage, '/custom.png');
});

test('blog author includes socials key, guides author does not', () => {
  const blog = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'b',
    translations: { en: 'x' }, shape: BLOG_SHAPE,
  });
  const guide = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'b',
    translations: { en: 'x' }, shape: GUIDES_SHAPE,
  });
  assert.ok('socials' in blog.author);
  assert.ok(!('socials' in guide.author));
});

test('guides extras default and sit between ogImage and content', () => {
  const guide = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'b',
    translations: { en: 'x' }, shape: GUIDES_SHAPE,
  }) as any;
  assert.equal(guide.difficulty, 'beginner');
  assert.equal(guide.order, 99);
  const keys = Object.keys(guide);
  assert.deepEqual(
    keys.slice(keys.indexOf('ogImage')),
    ['ogImage', 'difficulty', 'order', 'content']
  );
});

test('key order matches the legacy generator exactly', () => {
  const doc = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'b',
    translations: { en: 'x' }, shape: BLOG_SHAPE,
  });
  assert.deepEqual(Object.keys(doc), [
    'slug', 'title', 'description', 'excerpt', 'date', 'author',
    'featuredImage', 'previewImage', 'tags', 'published', 'readingTime',
    'locale', 'translationKey', 'translations', 'availableLocales',
    'seoTitle', 'seoDescription', 'ogImage', 'content',
  ]);
});

test('published is true unless explicitly false', () => {
  const shape = BLOG_SHAPE;
  const base = { slug: 'x', locale: 'en' as const, content: 'b', translations: { en: 'x' }, shape };
  assert.equal(buildDocument({ ...base, data: {} }).published, true);
  assert.equal(buildDocument({ ...base, data: { published: true } }).published, true);
  assert.equal(buildDocument({ ...base, data: { published: false } }).published, false);
});

test('translationKey falls back to slug', () => {
  const doc = buildDocument({
    slug: 'my-slug', locale: 'en', data: {}, content: 'b',
    translations: {}, shape: BLOG_SHAPE,
  });
  assert.equal(doc.translationKey, 'my-slug');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../lib/content/build.ts`.

- [ ] **Step 3: Write `lib/content/types.ts`**

```ts
import type { Locale } from '@/i18n/config';

export interface AuthorSocials {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
}

export interface ContentAuthor {
  name: string;
  avatar?: string;
  npub?: string;
  socials?: AuthorSocials;
}

export interface ContentMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  author: ContentAuthor;
  featuredImage: string;
  previewImage: string;
  tags: string[];
  published: boolean;
  readingTime: string;
  locale: Locale;
  translationKey: string;
  availableLocales: Locale[];
  translations: Partial<Record<Locale, string>>;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export interface ContentDoc extends ContentMeta {
  content: string;
}

export interface CollectionDefaults {
  featuredImage: string;
  previewImage: string;
  authorName: string;
}

/** Everything that differs between blog, guides and news. */
export interface CollectionShape<TExtra extends object> {
  defaults: CollectionDefaults;
  includeAuthorSocials: boolean;
  parseExtra: (data: Record<string, any>) => TExtra;
}

export interface LocaleBucket<T> {
  posts: T[];
  tags: string[];
}

export interface CollectionCache<T> {
  generatedAt: string;
  locales: Record<string, LocaleBucket<T>>;
}
```

- [ ] **Step 4: Write `lib/content/build.ts`**

```ts
import readingTime from 'reading-time';
import type { Locale } from '@/i18n/config';
import type { ContentDoc, CollectionShape } from './types';

export interface BuildArgs<TExtra extends object> {
  slug: string;
  locale: Locale;
  data: Record<string, any>;
  content: string;
  translations: Partial<Record<Locale, string>>;
  shape: CollectionShape<TExtra>;
}

/**
 * Maps parsed frontmatter to a content document.
 *
 * Key insertion order is load-bearing: the generated cache JSON is compared
 * byte-for-byte against the legacy generators' output, and JSON.stringify
 * preserves insertion order. Do not reorder these properties.
 */
export function buildDocument<TExtra extends object>({
  slug, locale, data, content, translations, shape,
}: BuildArgs<TExtra>): ContentDoc & TExtra {
  const stats = readingTime(content);
  const translationKey = data.translationKey || slug;
  const availableLocales = Object.keys(translations) as Locale[];

  const author = shape.includeAuthorSocials
    ? {
        name: data.author?.name || shape.defaults.authorName,
        avatar: data.author?.avatar,
        npub: data.author?.npub,
        socials: data.author?.socials
          ? {
              linkedin: data.author.socials.linkedin,
              instagram: data.author.socials.instagram,
              twitter: data.author.socials.twitter,
              github: data.author.socials.github,
            }
          : undefined,
      }
    : {
        name: data.author?.name || shape.defaults.authorName,
        avatar: data.author?.avatar,
        npub: data.author?.npub,
      };

  return {
    slug,
    title: data.title || 'Untitled',
    description: data.description || '',
    excerpt: data.excerpt || '',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    author,
    featuredImage: data.featuredImage || shape.defaults.featuredImage,
    previewImage: data.previewImage || data.featuredImage || shape.defaults.previewImage,
    tags: data.tags || [],
    published: data.published !== false,
    readingTime: stats.text,
    locale,
    translationKey,
    translations,
    availableLocales,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    ogImage: data.ogImage,
    ...shape.parseExtra(data),
    content,
  } as ContentDoc & TExtra;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/content/types.ts lib/content/build.ts tests/content-build.test.ts
git commit -m "Add shared content types and frontmatter document mapper"
```

---

### Task 3: Unified cache generator, parity green

**Files:**
- Create: `scripts/generate-content-cache.mjs`
- Modify: `package.json` (`prebuild`)
- Delete: `scripts/generate-blog-cache.mjs`, `scripts/generate-guides-cache.mjs`

**Interfaces:**
- Consumes: the key order and defaults table from Global Constraints
- Produces: `lib/generated/{blog,guides,news}-cache.json` and matching `.ts` type files; `npm run test:parity` passes

Note: the generator is `.mjs` and cannot import `lib/content/build.ts`. It intentionally duplicates the mapper in plain JS — the parity harness is what keeps the two honest. Any change to `build.ts` key order must be mirrored here, and the tests in Task 2 plus `npm run test:parity` will catch it if it is not.

- [ ] **Step 1: Write `scripts/generate-content-cache.mjs`**

```js
#!/usr/bin/env node
/**
 * Pre-generates content caches as JSON for production builds.
 * Replaces generate-blog-cache.mjs and generate-guides-cache.mjs.
 *
 * Key insertion order below is compared byte-for-byte against the legacy
 * generators by scripts/verify-cache-parity.mjs. Do not reorder.
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'lib', 'generated');
const locales = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'];

const COLLECTIONS = [
  {
    name: 'blog',
    label: '📝',
    noun: 'posts',
    dir: path.join(ROOT, 'content', 'blog'),
    defaults: {
      featuredImage: '/images/blog/default-featured.svg',
      previewImage: '/images/blog/default-preview.svg',
      authorName: 'Nostr WoT Team',
    },
    includeAuthorSocials: true,
    parseExtra: () => ({}),
    sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    // Only blog emits a .ts type file today. Preserve that exactly.
    emitTypes: { typeName: 'BlogPost', typeImport: "import type { BlogPost } from '@/lib/blog';" },
  },
  {
    name: 'guides',
    label: '📖',
    noun: 'guides',
    dir: path.join(ROOT, 'content', 'guides'),
    defaults: {
      featuredImage: '/images/guides/default-featured.svg',
      previewImage: '/images/guides/default-preview.svg',
      authorName: 'Nostr WoT Team',
    },
    includeAuthorSocials: false,
    parseExtra: (data) => ({
      difficulty: data.difficulty || 'beginner',
      order: data.order || 99,
    }),
    sort: (a, b) => (a.order || 99) - (b.order || 99),
    // guides has never emitted a .ts type file. Emitting one would import a
    // `Guide` type that does not exist and break the build.
    emitTypes: null,
  },
  {
    name: 'news',
    label: '📰',
    noun: 'news items',
    dir: path.join(ROOT, 'content', 'news'),
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
    sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    // `lib/news.ts` does not exist until Phase 2. Emitting a type file that
    // imports from it would break the build now. Phase 2 turns this on.
    emitTypes: null,
  },
];

function getSlugs(dir, locale) {
  const localeDir = path.join(dir, locale);
  if (!fs.existsSync(localeDir)) return [];
  return fs
    .readdirSync(localeDir)
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

function readFile(dir, locale, slug) {
  const localeDir = path.join(dir, locale);
  const mdxPath = path.join(localeDir, `${slug}.mdx`);
  const mdPath = path.join(localeDir, `${slug}.md`);
  if (fs.existsSync(mdxPath)) return fs.readFileSync(mdxPath, 'utf8');
  if (fs.existsSync(mdPath)) return fs.readFileSync(mdPath, 'utf8');
  return null;
}

function buildTranslationMap(collection) {
  const map = new Map();
  for (const locale of locales) {
    for (const slug of getSlugs(collection.dir, locale)) {
      const raw = readFile(collection.dir, locale, slug);
      if (!raw) continue;
      const { data } = matter(raw);
      const key = data.translationKey || slug;
      if (!map.has(key)) map.set(key, {});
      map.get(key)[locale] = slug;
    }
  }
  return map;
}

function buildDocument(collection, slug, locale, translationMap) {
  const raw = readFile(collection.dir, locale, slug);
  if (!raw) return null;

  const { data, content } = matter(raw);
  const stats = readingTime(content);
  const translationKey = data.translationKey || slug;
  const translations = translationMap.get(translationKey) || {};
  const availableLocales = Object.keys(translations);

  const author = collection.includeAuthorSocials
    ? {
        name: data.author?.name || collection.defaults.authorName,
        avatar: data.author?.avatar,
        npub: data.author?.npub,
        socials: data.author?.socials
          ? {
              linkedin: data.author.socials.linkedin,
              instagram: data.author.socials.instagram,
              twitter: data.author.socials.twitter,
              github: data.author.socials.github,
            }
          : undefined,
      }
    : {
        name: data.author?.name || collection.defaults.authorName,
        avatar: data.author?.avatar,
        npub: data.author?.npub,
      };

  return {
    slug,
    title: data.title || 'Untitled',
    description: data.description || '',
    excerpt: data.excerpt || '',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    author,
    featuredImage: data.featuredImage || collection.defaults.featuredImage,
    previewImage: data.previewImage || data.featuredImage || collection.defaults.previewImage,
    tags: data.tags || [],
    published: data.published !== false,
    readingTime: stats.text,
    locale,
    translationKey,
    translations,
    availableLocales,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    ogImage: data.ogImage,
    ...collection.parseExtra(data),
    content,
  };
}

function generate(collection) {
  console.log(`${collection.label} Generating ${collection.name} cache...`);

  const translationMap = buildTranslationMap(collection);
  const cache = { generatedAt: new Date().toISOString(), locales: {} };

  for (const locale of locales) {
    const posts = getSlugs(collection.dir, locale)
      .map((slug) => buildDocument(collection, slug, locale, translationMap))
      .filter((doc) => doc !== null && doc.published)
      .sort(collection.sort);

    cache.locales[locale] = {
      posts,
      tags: [...new Set(posts.flatMap((p) => p.tags))].sort(),
    };

    console.log(`  ✓ ${locale}: ${posts.length} ${collection.noun}, ${cache.locales[locale].tags.length} tags`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const jsonPath = path.join(OUTPUT_DIR, `${collection.name}-cache.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(cache, null, 2));
  console.log(`✅ ${collection.name} cache written to ${jsonPath}`);

  if (!collection.emitTypes) return;

  const { typeName, typeImport } = collection.emitTypes;
  const tsPath = path.join(OUTPUT_DIR, `${collection.name}-cache.ts`);
  fs.writeFileSync(tsPath, `// Auto-generated - do not edit
import type { Locale } from '@/i18n/config';
${typeImport}
import cache from './${collection.name}-cache.json';

export interface ${typeName}Cache {
  generatedAt: string;
  locales: Record<Locale, {
    posts: ${typeName}[];
    tags: string[];
  }>;
}

export const ${collection.name}Cache = cache as ${typeName}Cache;
export default ${collection.name}Cache;
`);
}

for (const collection of COLLECTIONS) {
  generate(collection);
}
```

- [ ] **Step 2: Create the news content directories so the generator has somewhere to look**

```bash
for l in en es pt ru it fr de; do mkdir -p "content/news/$l"; touch "content/news/$l/.gitkeep"; done
```

- [ ] **Step 3: Run the parity check**

Run: `npm run test:parity`
Expected: `✓ blog: identical`, `✓ guides: identical`, then `✅ Parity check passed`.

**If it fails,** the printed line diff names the exact mismatching key. Compare against the parity table in Global Constraints — the cause is almost always a wrong default, the `socials` key on guides, extras in the wrong position, or the wrong sort. Fix and re-run. **Do not proceed while this is red.**

- [ ] **Step 4: Point `prebuild` at the unified generator**

In `package.json`, replace the `prebuild` script with:

```json
"prebuild": "node scripts/generate-content-cache.mjs"
```

- [ ] **Step 5: Delete the superseded generators**

```bash
git rm scripts/generate-blog-cache.mjs scripts/generate-guides-cache.mjs
```

Note: `verify-cache-parity.mjs --snapshot` depends on those two files, so re-snapshotting is no longer possible after this step. That is intentional — the baseline in `.parity-baseline/` is the frozen record of pre-refactor behaviour, and Task 4 still compares against it.

- [ ] **Step 6: Re-run parity against the frozen baseline**

Run: `npm run test:parity`
Expected: still passes. The baseline files are untouched by the deletion.

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-content-cache.mjs package.json content/news
git commit -m "Replace per-collection cache generators with one parameterised script"
```

---

### Task 4: Collection factory and shim the existing libs

**Files:**
- Create: `lib/content/collection.ts`
- Create: `tests/content-collection.test.ts`
- Create: `tests/fixtures/content/demo/{en,es}/*.mdx`
- Modify: `lib/blog.ts`, `lib/guides.ts`

**Interfaces:**
- Consumes: `buildDocument`, types from Task 2
- Produces: `createContentCollection<TExtra>(config): ContentCollection<TExtra>` with methods `getSlugs`, `getPost`, `getAll`, `getByTag`, `getAllTags`, `getRelated`, `getTranslations`, `getAvailableLocales`

- [ ] **Step 1: Write the fixtures**

```bash
mkdir -p tests/fixtures/content/demo/en tests/fixtures/content/demo/es
```

`tests/fixtures/content/demo/en/alpha.mdx`:

```mdx
---
title: "Alpha"
excerpt: "First"
date: "2026-01-02"
tags: ["one", "shared"]
translationKey: "alpha"
---

Alpha body.
```

`tests/fixtures/content/demo/en/beta.mdx`:

```mdx
---
title: "Beta"
excerpt: "Second"
date: "2026-03-04"
tags: ["two", "shared"]
translationKey: "beta"
---

Beta body.
```

`tests/fixtures/content/demo/en/draft.mdx`:

```mdx
---
title: "Draft"
excerpt: "Hidden"
date: "2026-04-05"
published: false
translationKey: "draft"
---

Draft body.
```

`tests/fixtures/content/demo/es/alfa.mdx`:

```mdx
---
title: "Alfa"
excerpt: "Primero"
date: "2026-01-02"
tags: ["uno", "shared"]
translationKey: "alpha"
---

Cuerpo alfa.
```

- [ ] **Step 2: Write the failing test**

Create `tests/content-collection.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createContentCollection } from '../lib/content/collection.ts';

const demo = createContentCollection({
  name: 'demo',
  contentDir: path.join(process.cwd(), 'tests', 'fixtures', 'content', 'demo'),
  cache: { generatedAt: '', locales: {} } as any,
  useCache: false,
  shape: {
    defaults: {
      featuredImage: '/f.svg',
      previewImage: '/p.svg',
      authorName: 'Nostr WoT Team',
    },
    includeAuthorSocials: true,
    parseExtra: () => ({}),
  },
  sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
});

test('getSlugs lists every file including unpublished', () => {
  assert.deepEqual(demo.getSlugs('en').sort(), ['alpha', 'beta', 'draft']);
});

test('getAll excludes unpublished and sorts by date descending', () => {
  const posts = demo.getAll('en');
  assert.deepEqual(posts.map((p) => p.slug), ['beta', 'alpha']);
});

test('getPost returns null for a missing slug', () => {
  assert.equal(demo.getPost('nope', 'en'), null);
});

test('getPost resolves cross-locale translations by translationKey', () => {
  const post = demo.getPost('alpha', 'en');
  assert.equal(post?.translations.es, 'alfa');
  assert.deepEqual(post?.availableLocales.sort(), ['en', 'es']);
});

test('getAllTags returns sorted unique tags for published posts only', () => {
  assert.deepEqual(demo.getAllTags('en'), ['one', 'shared', 'two']);
});

test('getByTag is case-insensitive', () => {
  assert.deepEqual(demo.getByTag('SHARED', 'en').map((p) => p.slug), ['beta', 'alpha']);
});

test('getRelated ranks by shared tags and excludes the current post', () => {
  const related = demo.getRelated('alpha', 3, 'en');
  assert.deepEqual(related.map((p) => p.slug), ['beta']);
});

test('getRelated returns empty for an unknown slug', () => {
  assert.deepEqual(demo.getRelated('nope', 3, 'en'), []);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../lib/content/collection.ts`.

- [ ] **Step 4: Write `lib/content/collection.ts`**

```ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { locales, defaultLocale, type Locale } from '@/i18n/config';
import { buildDocument } from './build';
import type { CollectionCache, CollectionShape, ContentDoc, ContentMeta } from './types';

export interface CollectionConfig<TExtra extends object> {
  name: string;
  contentDir: string;
  cache: CollectionCache<ContentDoc & TExtra>;
  shape: CollectionShape<TExtra>;
  sort: (a: ContentDoc & TExtra, b: ContentDoc & TExtra) => number;
  /** Defaults to true in production. Overridable for tests. */
  useCache?: boolean;
}

export function createContentCollection<TExtra extends object>(
  config: CollectionConfig<TExtra>
) {
  type Doc = ContentDoc & TExtra;
  type Meta = ContentMeta & TExtra;

  const useCache = config.useCache ?? process.env.NODE_ENV === 'production';

  const bucket = (locale: Locale) =>
    (config.cache.locales as Record<string, { posts: Doc[]; tags: string[] }>)[locale];

  function localeDir(locale: Locale): string {
    return path.join(config.contentDir, locale);
  }

  function readRaw(slug: string, locale: Locale): string | null {
    const mdx = path.join(localeDir(locale), `${slug}.mdx`);
    const md = path.join(localeDir(locale), `${slug}.md`);
    if (fs.existsSync(mdx)) return fs.readFileSync(mdx, 'utf8');
    if (fs.existsSync(md)) return fs.readFileSync(md, 'utf8');
    return null;
  }

  function getSlugs(locale: Locale = defaultLocale): string[] {
    if (useCache) return bucket(locale)?.posts.map((p) => p.slug) ?? [];
    const dir = localeDir(locale);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .map((f) => f.replace(/\.mdx?$/, ''));
  }

  let translationMapCache: Map<string, Partial<Record<Locale, string>>> | null = null;

  function buildTranslationMap(): Map<string, Partial<Record<Locale, string>>> {
    const map = new Map<string, Partial<Record<Locale, string>>>();
    for (const locale of locales) {
      const dir = localeDir(locale);
      if (!fs.existsSync(dir)) continue;
      const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
        .map((f) => f.replace(/\.mdx?$/, ''));
      for (const slug of files) {
        const raw = readRaw(slug, locale);
        if (!raw) continue;
        const key = matter(raw).data.translationKey || slug;
        if (!map.has(key)) map.set(key, {});
        map.get(key)![locale] = slug;
      }
    }
    return map;
  }

  function getTranslations(translationKey: string): Partial<Record<Locale, string>> {
    if (useCache) {
      for (const locale of locales) {
        const found = bucket(locale)?.posts.find((p) => p.translationKey === translationKey);
        if (found?.translations) return found.translations;
      }
      return {};
    }
    if (!translationMapCache || process.env.NODE_ENV === 'development') {
      translationMapCache = buildTranslationMap();
    }
    return translationMapCache.get(translationKey) ?? {};
  }

  function getAvailableLocales(translationKey: string): Locale[] {
    return Object.keys(getTranslations(translationKey)) as Locale[];
  }

  function getPost(slug: string, locale: Locale = defaultLocale): Doc | null {
    if (useCache) return bucket(locale)?.posts.find((p) => p.slug === slug) ?? null;
    const raw = readRaw(slug, locale);
    if (!raw) return null;
    const { data, content } = matter(raw);
    const translationKey = data.translationKey || slug;
    return buildDocument<TExtra>({
      slug, locale, data, content,
      translations: getTranslations(translationKey),
      shape: config.shape,
    }) as Doc;
  }

  function getAll(locale: Locale = defaultLocale): Meta[] {
    if (useCache) {
      return (bucket(locale)?.posts ?? []).map(({ content: _content, ...meta }) => meta as Meta);
    }
    return getSlugs(locale)
      .map((slug) => getPost(slug, locale))
      .filter((doc): doc is Doc => doc !== null && doc.published)
      .sort(config.sort)
      .map(({ content: _content, ...meta }) => meta as Meta);
  }

  function getByTag(tag: string, locale: Locale = defaultLocale): Meta[] {
    return getAll(locale).filter((p) =>
      p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  function getAllTags(locale: Locale = defaultLocale): string[] {
    if (useCache) return bucket(locale)?.tags ?? [];
    return [...new Set(getAll(locale).flatMap((p) => p.tags))].sort();
  }

  function getRelated(slug: string, limit = 3, locale: Locale = defaultLocale): Meta[] {
    const current = getPost(slug, locale);
    if (!current) return [];
    const others = getAll(locale).filter((p) => p.slug !== slug);
    const scored = others.map((post) => ({
      post,
      score: post.tags.filter((t) => current.tags.includes(t)).length,
    }));
    scored.sort((a, b) =>
      b.score !== a.score ? b.score - a.score : config.sort(a.post as Doc, b.post as Doc)
    );
    return scored.slice(0, limit).map((s) => s.post);
  }

  return {
    getSlugs, getPost, getAll, getByTag, getAllTags,
    getRelated, getTranslations, getAvailableLocales,
  };
}

export function formatDate(dateString: string, locale: string = 'en'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 15 tests total across both files.

- [ ] **Step 6: Rewrite `lib/blog.ts` as a shim**

Replace the entire file with:

```ts
import path from 'path';
import { createContentCollection, formatDate } from '@/lib/content/collection';
import type { ContentAuthor, AuthorSocials, ContentMeta, ContentDoc } from '@/lib/content/types';
import blogCache from '@/lib/generated/blog-cache.json';
import type { Locale } from '@/i18n/config';

export type { AuthorSocials, ContentAuthor };
export type BlogPostMeta = ContentMeta;
export type BlogPost = ContentDoc;

const collection = createContentCollection<Record<string, never>>({
  name: 'blog',
  contentDir: path.join(process.cwd(), 'content', 'blog'),
  cache: blogCache as never,
  shape: {
    defaults: {
      featuredImage: '/images/blog/default-featured.svg',
      previewImage: '/images/blog/default-preview.svg',
      authorName: 'Nostr WoT Team',
    },
    includeAuthorSocials: true,
    parseExtra: () => ({}),
  },
  sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
});

export const getBlogSlugs = (locale?: Locale) => collection.getSlugs(locale);
export const getBlogPost = (slug: string, locale?: Locale) => collection.getPost(slug, locale);
export const getAllBlogPosts = (locale?: Locale) => collection.getAll(locale);
export const getPostsByTag = (tag: string, locale?: Locale) => collection.getByTag(tag, locale);
export const getAllTags = (locale?: Locale) => collection.getAllTags(locale);
export const getRelatedPosts = (slug: string, limit?: number, locale?: Locale) =>
  collection.getRelated(slug, limit, locale);
export const getTranslations = (key: string) => collection.getTranslations(key);
export const getAvailableLocales = (key: string) => collection.getAvailableLocales(key);
export { formatDate };
```

- [ ] **Step 7: Rewrite `lib/guides.ts` as a shim**

Replace the entire file with:

```ts
import path from 'path';
import { createContentCollection } from '@/lib/content/collection';
import type { ContentMeta, ContentDoc } from '@/lib/content/types';
import guidesCache from '@/lib/generated/guides-cache.json';
import type { Locale } from '@/i18n/config';

export interface GuideExtras {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  order?: number;
}

// Names below are the EXACT current exports of lib/guides.ts, verified against
// call sites. Note they differ from the blog naming: GuidePostMeta/GuidePost,
// getGuideTranslations, getAllGuideTags. Renaming any of them breaks the build.
export type GuidePostMeta = ContentMeta & GuideExtras;
export type GuidePost = ContentDoc & GuideExtras;

const collection = createContentCollection<GuideExtras>({
  name: 'guides',
  contentDir: path.join(process.cwd(), 'content', 'guides'),
  cache: guidesCache as never,
  shape: {
    defaults: {
      featuredImage: '/images/guides/default-featured.svg',
      previewImage: '/images/guides/default-preview.svg',
      authorName: 'Nostr WoT Team',
    },
    includeAuthorSocials: false,
    parseExtra: (data) => ({
      difficulty: data.difficulty || 'beginner',
      order: data.order || 99,
    }),
  },
  sort: (a, b) => (a.order || 99) - (b.order || 99),
});

export const getGuideSlugs = (locale?: Locale) => collection.getSlugs(locale);
export const getGuideTranslations = (key: string) => collection.getTranslations(key);
export const getGuide = (slug: string, locale?: Locale) => collection.getPost(slug, locale);
export const getAllGuides = (locale?: Locale) => collection.getAll(locale);
export const getGuidesByTag = (tag: string, locale?: Locale) => collection.getByTag(tag, locale);
export const getAllGuideTags = (locale?: Locale) => collection.getAllTags(locale);
export const getRelatedGuides = (slug: string, limit?: number, locale?: Locale) =>
  collection.getRelated(slug, limit, locale);
```

- [ ] **Step 8: Reconcile the shim exports against real call sites**

The export lists above were written from the current file contents, but any drift breaks the build. Verify every name actually imported anywhere still exists:

```bash
grep -rzoE "import \{[^}]*\} from '@/lib/(blog|guides)'" app components lib \
  --include='*.ts' --include='*.tsx' \
  | tr '\0' '\n' | grep -oE "\{[^}]*\}" | tr -d '{}' | tr ',' '\n' \
  | sed 's/^ *//;s/ *$//' | grep -v '^$' | sort -u
```

Quoting the `--include` globs matters — unquoted, zsh expands them and the
command fails with "no matches found".

At the time this plan was written the command printed exactly:

```
formatDate
getAllBlogPosts
getAllGuideTags
getAllGuides
getAllTags
getBlogPost
getBlogSlugs
getGuide
getGuideSlugs
getRelatedGuides
getRelatedPosts
```

Every one of those must resolve. Note `formatDate` and `getAllTags` come from
`@/lib/blog`, while guides uses the distinct `getAllGuideTags`. If the command
prints a name not in either shim, add it before moving on.

- [ ] **Step 9: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 10: Re-run parity and tests**

Run: `npm run test:parity && npm test`
Expected: both pass.

- [ ] **Step 11: Commit**

```bash
git add lib/content/collection.ts lib/blog.ts lib/guides.ts tests/
git commit -m "Route blog and guides through the shared content collection"
```

---

### Task 5: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm test`, `npm run build` from earlier tasks
- Produces: PR-gating CI

Note: `npm run test:parity` is deliberately **not** in CI — it depends on `.parity-baseline/`, which is gitignored and local. Parity is a one-time refactor gate, not an ongoing check.

- [ ] **Step 1: Check what the existing workflow does, so this one does not duplicate or conflict with it**

```bash
ls .github/workflows/ && cat .github/workflows/*.yml
```

If a workflow already runs build on PRs, extend it with the test step instead of creating a second file, and skip Step 2.

- [ ] **Step 2: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build
```

- [ ] **Step 3: Verify the workflow file parses**

```bash
node -e "const fs=require('fs');const t=fs.readFileSync('.github/workflows/ci.yml','utf8');if(!/on:/.test(t)||!/jobs:/.test(t))throw new Error('malformed');console.log('workflow looks structurally valid')"
```

- [ ] **Step 4: Confirm the commands CI runs actually pass locally first**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: all three succeed. CI must never be the place these are discovered to be broken.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "Add PR-gating CI: typecheck, unit tests, build"
```

---

## Done criteria

- [ ] `npm test` passes
- [ ] `npm run test:parity` passes — blog and guides output provably unchanged
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds
- [ ] No file under `app/` or `components/` was modified
- [ ] `scripts/generate-blog-cache.mjs` and `scripts/generate-guides-cache.mjs` are deleted
- [ ] `lib/generated/news-cache.json` exists with empty locale buckets
- [ ] No `lib/generated/news-cache.ts` or `guides-cache.ts` was created (only `blog-cache.ts` existed before and only it should exist after)

## Follow-on plans

- Phase 2 — `/news` routes, `lib/jsonld.ts`, feeds, news sitemap, nav surfacing, 7-locale messages
- Phase 3 — six-month retrofill via the four-phase subagent pipeline
- Phase 4 — daily newsroom agent, playbook, PAUSE switch, run log
