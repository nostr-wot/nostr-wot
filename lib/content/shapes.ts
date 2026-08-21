import type { CollectionShape, ContentMeta } from './types';

/**
 * Single source of truth for the TypeScript side of each collection's mapping
 * rules. `lib/blog.ts` and `lib/guides.ts` consume these instead of declaring
 * their own literals.
 *
 * The generator (`scripts/generate-content-cache.mjs`) deliberately duplicates
 * these rules in plain JS, because `prebuild` runs bare node with no TS loader.
 * `tests/content-mapper-parity.test.ts` imports BOTH this module and the
 * generator's `COLLECTIONS` and asserts they map identical input to identical
 * output, so a default changed on only one side fails the test suite.
 */

export interface GuideExtras {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  order?: number;
}

export type BlogExtras = Record<string, never>;

export const blogShape: CollectionShape<BlogExtras> = {
  defaults: {
    featuredImage: '/images/blog/default-featured.svg',
    previewImage: '/images/blog/default-preview.svg',
    authorName: 'Nostr WoT Team',
  },
  includeAuthorSocials: true,
  parseExtra: () => ({}) as BlogExtras,
};

export const blogSort = (a: ContentMeta, b: ContentMeta): number =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

export const guidesShape: CollectionShape<GuideExtras> = {
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
};

export const guidesSort = (
  a: ContentMeta & GuideExtras,
  b: ContentMeta & GuideExtras
): number => (a.order || 99) - (b.order || 99);
