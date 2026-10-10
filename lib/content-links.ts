import type { Locale } from '@/i18n/config';
import { defaultLocale } from '@/i18n/config';
import { getGuide } from '@/lib/guides';
import { getBlogPost } from '@/lib/blog';

/** Resolve locale-neutral editorial links using the destination's translation map. */
export function resolveContentLink(href: string, locale: Locale): string | null {
  const match = href.match(/^\/(guides|blog)\/([^/?#]+)([?#].*)?$/);
  if (!match) return null;
  const [, collection, slug, suffix = ''] = match;
  const getPost = collection === 'guides' ? getGuide : getBlogPost;
  const source = getPost(slug, locale) ?? getPost(slug, defaultLocale);
  if (!source?.published) return null;
  const translatedSlug = source.translations[locale];
  const translated = translatedSlug ? getPost(translatedSlug, locale) : null;
  const targetLocale = translated?.published ? locale : defaultLocale;
  const target = translated?.published ? translated : getPost(source.translations[defaultLocale] ?? slug, defaultLocale);
  if (!target?.published) return null;
  const prefix = targetLocale === defaultLocale ? '' : `/${targetLocale}`;
  return `${prefix}/${collection}/${target.slug}${suffix}`;
}
