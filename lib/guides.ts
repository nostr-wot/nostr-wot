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
