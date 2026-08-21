#!/usr/bin/env node
/**
 * Pre-generates content caches as JSON for production builds.
 *
 * Key insertion order below is asserted by scripts/verify-cache-parity.mjs
 * (golden file) and by tests/content-mapper-parity.test.ts (cross-checks this
 * mapper against lib/content/build.ts). Do not reorder.
 *
 * Test hooks. All four are unset in normal use, so `prebuild` behaviour is the
 * historical one; they exist so the parity harness and the unit tests can drive
 * this generator over fixtures deterministically:
 *   CONTENT_CACHE_ROOT  content root to scan          (default <repo>/content)
 *   CONTENT_CACHE_OUT   directory to write caches to  (default <repo>/lib/generated)
 *   CONTENT_CACHE_ONLY  comma-separated collection allow-list (default: all)
 *   CONTENT_CACHE_NOW   fixed "now" for generatedAt and missing dates
 *
 * This module only generates when it is the process entry point, so tests can
 * import COLLECTIONS/buildDocument without writing anything.
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CONTENT_ROOT = process.env.CONTENT_CACHE_ROOT
  ? path.resolve(process.env.CONTENT_CACHE_ROOT)
  : path.join(ROOT, 'content');
const OUTPUT_DIR = process.env.CONTENT_CACHE_OUT
  ? path.resolve(process.env.CONTENT_CACHE_OUT)
  : path.join(ROOT, 'lib', 'generated');
const ONLY = process.env.CONTENT_CACHE_ONLY
  ? new Set(process.env.CONTENT_CACHE_ONLY.split(',').map((s) => s.trim()).filter(Boolean))
  : null;

/** Current time, overridable so fixture runs are byte-stable. */
function now() {
  return process.env.CONTENT_CACHE_NOW ? new Date(process.env.CONTENT_CACHE_NOW) : new Date();
}

const locales = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'];

export const COLLECTIONS = [
  {
    name: 'blog',
    label: '📝',
    noun: 'posts',
    dir: path.join(CONTENT_ROOT, 'blog'),
    defaults: {
      featuredImage: '/images/blog/default-featured.svg',
      previewImage: '/images/blog/default-preview.svg',
      authorName: 'Nostr WoT Team',
    },
    includeAuthorSocials: true,
    parseExtra: () => ({}),
    sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    // Only blog emits a .ts type file today. Preserve that exactly.
    // interfaceName is deliberately separate from typeName: the legacy
    // generator emitted `interface BlogCache`, not `BlogPostCache`.
    emitTypes: {
      typeName: 'BlogPost',
      interfaceName: 'BlogCache',
      typeImport: "import type { BlogPost } from '@/lib/blog';",
    },
  },
  {
    name: 'guides',
    label: '📖',
    noun: 'guides',
    dir: path.join(CONTENT_ROOT, 'guides'),
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
    dir: path.join(CONTENT_ROOT, 'news'),
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
          : now().toISOString(),
      backfilled: data.backfilled === true,
      items: data.items || [],
    }),
    sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    emitTypes: { typeName: 'NewsPost', typeImport: "import type { NewsPost } from '@/lib/news';", interfaceName: 'NewsCache' },
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

export function buildTranslationMap(collection) {
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

export function buildDocument(collection, slug, locale, translationMap) {
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
    date: data.date ? new Date(data.date).toISOString() : now().toISOString(),
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
  const cache = { generatedAt: now().toISOString(), locales: {} };

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

  const { typeName, typeImport, interfaceName } = collection.emitTypes;
  const tsPath = path.join(OUTPUT_DIR, `${collection.name}-cache.ts`);
  fs.writeFileSync(tsPath, `// Auto-generated - do not edit
import type { Locale } from '@/i18n/config';
${typeImport}
import cache from './${collection.name}-cache.json';

export interface ${interfaceName} {
  generatedAt: string;
  locales: Record<Locale, {
    posts: ${typeName}[];
    tags: string[];
  }>;
}

export const ${collection.name}Cache = cache as ${interfaceName};
export default ${collection.name}Cache;
`);
}

const isEntryPoint =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntryPoint) {
  for (const collection of COLLECTIONS) {
    if (ONLY && !ONLY.has(collection.name)) continue;
    generate(collection);
  }
}
