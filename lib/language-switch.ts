import type { Locale } from '@/i18n/config';

/** Never synthesize an untranslated article URL; archives remain ordinary routes. */
export function languageSwitchPath(pathname: string, locale: Locale, translations: Partial<Record<Locale, string>> | null): string {
  const article = pathname.match(/^\/(blog|guides)\/[^/]+\/?$/)
    ?? pathname.match(/^\/(news)\/\d{4}-\d{2}-\d{2}\/[^/]+\/?$/);
  if (!article) return pathname;
  const collection = `/${article[1]}`;
  const slug = translations?.[locale];
  return slug ? `${collection}/${slug}` : collection;
}
