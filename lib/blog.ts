import path from 'path';
import { createContentCollection, formatDate } from '@/lib/content/collection';
import { blogShape, blogSort, type BlogExtras } from '@/lib/content/shapes';
import type { ContentAuthor, AuthorSocials, ContentMeta, ContentDoc } from '@/lib/content/types';
import blogCache from '@/lib/generated/blog-cache.json';
import type { Locale } from '@/i18n/config';

export type { AuthorSocials, ContentAuthor };
export type BlogPostMeta = ContentMeta;
export type BlogPost = ContentDoc;

const collection = createContentCollection<BlogExtras>({
  name: 'blog',
  contentDir: path.join(process.cwd(), 'content', 'blog'),
  cache: blogCache as never,
  shape: blogShape,
  sort: blogSort,
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
