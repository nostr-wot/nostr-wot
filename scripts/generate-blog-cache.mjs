#!/usr/bin/env node
/**
 * Pre-generates blog data as JSON for production builds.
 * This ensures blog content is available even when fs access is limited.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog');
const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'generated');
const locales = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'];
const defaultLocale = 'en';

function getBlogDir(locale) {
  return path.join(CONTENT_DIR, locale);
}

function getBlogSlugs(locale) {
  const blogDir = getBlogDir(locale);
  if (!fs.existsSync(blogDir)) {
    return [];
  }
  return fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

function getTranslationKey(slug, locale) {
  const blogDir = getBlogDir(locale);
  const mdxPath = path.join(blogDir, `${slug}.mdx`);
  const mdPath = path.join(blogDir, `${slug}.md`);

  let filePath = null;
  if (fs.existsSync(mdxPath)) {
    filePath = mdxPath;
  } else if (fs.existsSync(mdPath)) {
    filePath = mdPath;
  }

  if (!filePath) return null;

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);
  return data.translationKey || slug;
}

function buildTranslationMap() {
  const map = new Map();

  for (const locale of locales) {
    const slugs = getBlogSlugs(locale);
    for (const slug of slugs) {
      const key = getTranslationKey(slug, locale);
      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, {});
      }
      map.get(key)[locale] = slug;
    }
  }

  return map;
}

function getBlogPost(slug, locale, translationMap) {
  const blogDir = getBlogDir(locale);
  const mdxPath = path.join(blogDir, `${slug}.mdx`);
  const mdPath = path.join(blogDir, `${slug}.md`);

  let filePath;
  if (fs.existsSync(mdxPath)) {
    filePath = mdxPath;
  } else if (fs.existsSync(mdPath)) {
    filePath = mdPath;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);
  const translationKey = data.translationKey || slug;
  const translations = translationMap.get(translationKey) || {};
  const availableLocales = Object.keys(translations);

  return {
    slug,
    title: data.title || 'Untitled',
    description: data.description || '',
    excerpt: data.excerpt || '',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    author: {
      name: data.author?.name || 'Nostr WoT Team',
      avatar: data.author?.avatar,
      npub: data.author?.npub,
      socials: data.author?.socials ? {
        linkedin: data.author.socials.linkedin,
        instagram: data.author.socials.instagram,
        twitter: data.author.socials.twitter,
        github: data.author.socials.github,
      } : undefined,
    },
    featuredImage: data.featuredImage || '/images/blog/default-featured.svg',
    previewImage: data.previewImage || data.featuredImage || '/images/blog/default-preview.svg',
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
    content,
  };
}

function generateCache() {
  console.log('📝 Generating blog cache...');

  const translationMap = buildTranslationMap();
  const cache = {
    generatedAt: new Date().toISOString(),
    locales: {},
  };

  for (const locale of locales) {
    const slugs = getBlogSlugs(locale);
    const posts = slugs
      .map((slug) => getBlogPost(slug, locale, translationMap))
      .filter((post) => post !== null && post.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    cache.locales[locale] = {
      posts,
      tags: [...new Set(posts.flatMap((p) => p.tags))].sort(),
    };

    console.log(`  ✓ ${locale}: ${posts.length} posts, ${cache.locales[locale].tags.length} tags`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write cache file
  const outputPath = path.join(OUTPUT_DIR, 'blog-cache.json');
  fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2));
  console.log(`✅ Blog cache written to ${outputPath}`);

  // Also generate TypeScript type file
  const typesPath = path.join(OUTPUT_DIR, 'blog-cache.ts');
  fs.writeFileSync(typesPath, `// Auto-generated - do not edit
import type { Locale } from '@/i18n/config';
import type { BlogPost } from '@/lib/blog';
import cache from './blog-cache.json';

export interface BlogCache {
  generatedAt: string;
  locales: Record<Locale, {
    posts: BlogPost[];
    tags: string[];
  }>;
}

export const blogCache = cache as BlogCache;
export default blogCache;
`);
  console.log(`✅ TypeScript types written to ${typesPath}`);
}

generateCache();
