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
