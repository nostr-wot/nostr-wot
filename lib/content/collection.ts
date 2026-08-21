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
