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
