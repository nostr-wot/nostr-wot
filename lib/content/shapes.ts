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

export interface NewsSource {
  title: string;
  url: string;
  publisher?: string;
  date?: string;
}

export interface NewsDigestItem {
  title: string;
  url: string;
  summary: string;
}

export interface NewsExtras {
  /** 'digest' = weekly round-up, 'story' = a single notable event. */
  type: 'digest' | 'story';
  /** Primary sources. Required and non-empty for real content. */
  sources: NewsSource[];
  /** Real dateModified. Absent means never revised. */
  updated?: string;
  /**
   * When the file actually shipped. This is the ONLY value permitted to appear
   * as `datePublished` in structured data. `date` is the EVENT date and drives
   * the slug, the displayed date and sort order. For a retrofilled post the two
   * deliberately differ.
   */
  publishedAt: string;
  /** True for entries written retrospectively as part of the archive. */
  backfilled: boolean;
  /** Digest-only: the week's items, for the ItemList JSON-LD. */
  items: NewsDigestItem[];
}

/**
 * Builds the message thrown when a backfilled entry omits `publishedAt`.
 *
 * Duplicated verbatim in `scripts/generate-content-cache.mjs`; the parity test
 * asserts both sides throw the same text, so edit them together.
 */
export function backfilledWithoutPublishedAtMessage(data: Record<string, any>): string {
  const name = data.translationKey || data.title || 'untitled news entry';
  return (
    `news: "${name}" is marked \`backfilled: true\` but has no \`publishedAt\`. ` +
    'A backfilled entry must state its real publication date: `date` is the EVENT ' +
    'date (slug, displayed date, sort, archive bucketing) and `publishedAt` is the ' +
    'ship date, the only value permitted as `datePublished` in structured data. ' +
    'Falling back to `date` would make the article claim it shipped on the day the ' +
    'event happened. Add `publishedAt` to the frontmatter.'
  );
}

export const newsShape: CollectionShape<NewsExtras> = {
  defaults: {
    featuredImage: '/images/news/default-featured.svg',
    previewImage: '/images/news/default-preview.svg',
    authorName: 'Nostr WoT Newsroom',
  },
  includeAuthorSocials: false,
  parseExtra: (data) => {
    // A backfilled entry that omits `publishedAt` would silently inherit the
    // event date and then assert it as `datePublished`. Refuse loudly instead.
    if (data.backfilled === true && !data.publishedAt) {
      throw new Error(backfilledWithoutPublishedAtMessage(data));
    }
    return {
      type: data.type || 'story',
      sources: data.sources || [],
      updated: data.updated ? new Date(data.updated).toISOString() : undefined,
      // Non-backfilled posts legitimately ship on their event date, so the
      // fallback stays for them.
      publishedAt: data.publishedAt
        ? new Date(data.publishedAt).toISOString()
        : data.date
          ? new Date(data.date).toISOString()
          : new Date().toISOString(),
      backfilled: data.backfilled === true,
      items: data.items || [],
    };
  },
};

export const newsSort = (a: ContentMeta, b: ContentMeta): number =>
  new Date(b.date).getTime() - new Date(a.date).getTime();
