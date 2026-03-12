#!/usr/bin/env node
/**
 * Pre-generates guides data as JSON for production builds.
 * This ensures guides content is available even when fs access is limited.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'guides');
const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'generated');
const locales = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'];

function getGuidesDir(locale) {
  return path.join(CONTENT_DIR, locale);
}

function getGuideSlugs(locale) {
  const guidesDir = getGuidesDir(locale);
  if (!fs.existsSync(guidesDir)) {
    return [];
  }
  return fs
    .readdirSync(guidesDir)
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

function getTranslationKey(slug, locale) {
  const guidesDir = getGuidesDir(locale);
  const mdxPath = path.join(guidesDir, `${slug}.mdx`);
  const mdPath = path.join(guidesDir, `${slug}.md`);

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
    const slugs = getGuideSlugs(locale);
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

function getGuide(slug, locale, translationMap) {
  const guidesDir = getGuidesDir(locale);
  const mdxPath = path.join(guidesDir, `${slug}.mdx`);
  const mdPath = path.join(guidesDir, `${slug}.md`);

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
    },
    featuredImage: data.featuredImage || '/images/guides/default-featured.svg',
    previewImage: data.previewImage || data.featuredImage || '/images/guides/default-preview.svg',
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
    difficulty: data.difficulty || 'beginner',
    order: data.order || 99,
    content,
  };
}

function generateCache() {
  console.log('📖 Generating guides cache...');

  const translationMap = buildTranslationMap();
  const cache = {
    generatedAt: new Date().toISOString(),
    locales: {},
  };

  for (const locale of locales) {
    const slugs = getGuideSlugs(locale);
    const posts = slugs
      .map((slug) => getGuide(slug, locale, translationMap))
      .filter((post) => post !== null && post.published)
      .sort((a, b) => (a.order || 99) - (b.order || 99));

    cache.locales[locale] = {
      posts,
      tags: [...new Set(posts.flatMap((p) => p.tags))].sort(),
    };

    console.log(`  ✓ ${locale}: ${posts.length} guides, ${cache.locales[locale].tags.length} tags`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write cache file
  const outputPath = path.join(OUTPUT_DIR, 'guides-cache.json');
  fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2));
  console.log(`✅ Guides cache written to ${outputPath}`);
}

generateCache();
