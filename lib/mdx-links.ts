import { locales } from '@/i18n/config';

/** Relative references, protocols and already localized paths keep their authored URL. */
export function isLocaleNeutralPath(href: string): boolean {
  if (!href.startsWith('/') || href.startsWith('//')) return false;
  const firstSegment = href.slice(1).split(/[/?#]/)[0];
  return !locales.some((locale) => locale === firstSegment);
}
