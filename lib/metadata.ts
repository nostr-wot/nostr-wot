import { Metadata } from 'next';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostr-wot.com';
const DEFAULT_OG_IMAGE = '/icon-512.png';

// Locale to OpenGraph locale format mapping
const ogLocaleMap: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
};

/**
 * Generates the full URL for a given path and locale
 * Uses 'as-needed' locale prefix strategy: default locale has no prefix
 * Ensures no trailing slashes to match Next.js default behavior and avoid 308 redirects
 */
export function getFullUrl(path: string, locale: Locale): string {
  // Normalize path: ensure it starts with / unless empty
  let normalizedPath = path === '/' || path === '' ? '' : path;
  if (normalizedPath && !normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  if (locale === defaultLocale) {
    // Default locale: https://nostr-wot.com or https://nostr-wot.com/about
    return normalizedPath ? `${BASE_URL}${normalizedPath}` : BASE_URL;
  }

  // Non-default locale: https://nostr-wot.com/es or https://nostr-wot.com/es/about
  return `${BASE_URL}/${locale}${normalizedPath}`;
}

/**
 * Generates alternates metadata for canonical URLs and hreflang tags
 * @param path - The path without locale prefix (e.g., '/about', '/docs')
 * @param currentLocale - The current page locale
 */
export function generateAlternates(path: string, currentLocale: Locale): Metadata['alternates'] {
  // Normalize: treat '/' and '' as homepage
  const normalizedPath = path === '/' ? '' : path;

  // Generate language alternates for hreflang
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = getFullUrl(normalizedPath, locale);
  }

  // Add x-default pointing to default locale
  languages['x-default'] = getFullUrl(normalizedPath, defaultLocale);

  return {
    canonical: getFullUrl(normalizedPath, currentLocale),
    languages,
  };
}

/**
 * Gets the current path from params for use in generateMetadata
 * Use this when you need to extract the path from dynamic routes
 */
export function getPathFromSegments(...segments: string[]): string {
  return '/' + segments.filter(Boolean).join('/');
}

/**
 * Generates alternates metadata for blog posts with translated slugs
 * @param basePath - The base path before the slug (e.g., '/blog')
 * @param translations - Map of locale to slug
 * @param currentLocale - The current page locale
 */
export function generateBlogAlternates(
  basePath: string,
  translations: Partial<Record<Locale, string>>,
  currentLocale: Locale
): Metadata['alternates'] {
  const languages: Record<string, string> = {};

  // Generate language alternates using translated slugs
  for (const locale of locales) {
    const slug = translations[locale];
    if (slug) {
      languages[locale] = getFullUrl(`${basePath}/${slug}`, locale);
    }
  }

  // Add x-default pointing to default locale version
  const defaultSlug = translations[defaultLocale];
  if (defaultSlug) {
    languages['x-default'] = getFullUrl(`${basePath}/${defaultSlug}`, defaultLocale);
  }

  // Current locale canonical
  const currentSlug = translations[currentLocale];
  const canonical = currentSlug
    ? getFullUrl(`${basePath}/${currentSlug}`, currentLocale)
    : getFullUrl(basePath, currentLocale);

  return {
    canonical,
    languages,
  };
}

/**
 * Generates complete OpenGraph metadata with all required fields
 * @param options - OpenGraph options
 * @returns Complete OpenGraph metadata object
 */
export function generateOpenGraph(options: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
}): Metadata['openGraph'] {
  const { title, description, path, locale, type = 'website', image, imageAlt } = options;
  const url = getFullUrl(path, locale);
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    url,
    siteName: 'Nostr WoT',
    locale: ogLocaleMap[locale],
    type,
    images: [
      {
        url: ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`,
        width: 1200,
        height: 630,
        alt: imageAlt || title,
      },
    ],
  };
}

/**
 * Generates Twitter card metadata
 * @param options - Twitter card options
 * @returns Twitter metadata object
 */
export function generateTwitter(options: {
  title: string;
  description: string;
  image?: string;
}): Metadata['twitter'] {
  const { title, description, image } = options;
  const twitterImage = image || DEFAULT_OG_IMAGE;

  return {
    card: 'summary_large_image',
    title,
    description,
    images: [twitterImage.startsWith('http') ? twitterImage : `${BASE_URL}${twitterImage}`],
  };
}
