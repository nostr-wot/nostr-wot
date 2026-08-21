// Auto-generated - do not edit
import type { Locale } from '@/i18n/config';
import type { NewsPost } from '@/lib/news';
import cache from './news-cache.json';

export interface NewsCache {
  generatedAt: string;
  locales: Record<Locale, {
    posts: NewsPost[];
    tags: string[];
  }>;
}

export const newsCache = cache as NewsCache;
export default newsCache;
