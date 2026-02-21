import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  // Disable automatic locale detection based on Accept-Language header
  // This prevents redirects that break pages with translated slugs (like blog posts)
  // where /blog/exploring-the-playground would incorrectly redirect to /es/blog/exploring-the-playground
  localeDetection: false,
  alternateLinks: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
