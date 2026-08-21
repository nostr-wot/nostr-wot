import readingTime from 'reading-time';
import type { Locale } from '@/i18n/config';
import type { ContentDoc, CollectionShape } from './types';

export interface BuildArgs<TExtra extends object> {
  slug: string;
  locale: Locale;
  data: Record<string, any>;
  content: string;
  translations: Partial<Record<Locale, string>>;
  shape: CollectionShape<TExtra>;
}

/**
 * Maps parsed frontmatter to a content document.
 *
 * Key insertion order is load-bearing: the generated cache JSON is compared
 * byte-for-byte against the legacy generators' output, and JSON.stringify
 * preserves insertion order. Do not reorder these properties.
 */
export function buildDocument<TExtra extends object>({
  slug, locale, data, content, translations, shape,
}: BuildArgs<TExtra>): ContentDoc & TExtra {
  const stats = readingTime(content);
  const translationKey = data.translationKey || slug;
  const availableLocales = Object.keys(translations) as Locale[];

  const author = shape.includeAuthorSocials
    ? {
        name: data.author?.name || shape.defaults.authorName,
        avatar: data.author?.avatar,
        npub: data.author?.npub,
        socials: data.author?.socials
          ? {
              linkedin: data.author.socials.linkedin,
              instagram: data.author.socials.instagram,
              twitter: data.author.socials.twitter,
              github: data.author.socials.github,
            }
          : undefined,
      }
    : {
        name: data.author?.name || shape.defaults.authorName,
        avatar: data.author?.avatar,
        npub: data.author?.npub,
      };

  return {
    slug,
    title: data.title || 'Untitled',
    description: data.description || '',
    excerpt: data.excerpt || '',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    author,
    featuredImage: data.featuredImage || shape.defaults.featuredImage,
    previewImage: data.previewImage || data.featuredImage || shape.defaults.previewImage,
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
    ...shape.parseExtra(data),
    content,
  } as ContentDoc & TExtra;
}
