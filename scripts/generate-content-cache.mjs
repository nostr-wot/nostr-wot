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
