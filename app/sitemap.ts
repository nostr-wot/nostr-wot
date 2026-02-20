import { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";
import { getAllBlogPosts } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://nostr-wot.com";

// Helper to generate URL with locale prefix only for non-default locales
// This matches the 'localePrefix: as-needed' routing configuration
// No trailing slashes - Next.js redirects them away (308)
function getLocalizedUrl(path: string, locale: string): string {
  const normalizedPath = path === "" ? "" : path;
  if (locale === defaultLocale) {
    return `${BASE_URL}${normalizedPath}`;
  }
  // No trailing slash for homepage - Next.js handles /es/ -> /es redirect
  if (normalizedPath === "") {
    return `${BASE_URL}/${locale}`;
  }
  return `${BASE_URL}/${locale}${normalizedPath}`;
}

// Define all static routes with their change frequency and priority
const routes: {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/features", changeFrequency: "weekly", priority: 0.9 },
  { path: "/download", changeFrequency: "weekly", priority: 0.9 },
  { path: "/playground", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.8 },
  { path: "/docs/getting-started", changeFrequency: "weekly", priority: 0.8 },
  { path: "/docs/extension", changeFrequency: "weekly", priority: 0.7 },
  { path: "/docs/sdk", changeFrequency: "weekly", priority: 0.7 },
  { path: "/docs/oracle", changeFrequency: "weekly", priority: 0.7 },
  { path: "/oracle", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/media-kit", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each static route in each locale
  for (const route of routes) {
    for (const locale of locales) {
      const url = getLocalizedUrl(route.path, locale);

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, getLocalizedUrl(route.path, l)])
          ),
        },
      });
    }
  }

  // Generate entries for blog posts
  // Get posts from default locale and use their translations to generate correct URLs for each locale
  const blogPosts = getAllBlogPosts();
  for (const post of blogPosts) {
    // Build alternates using correct translated slugs
    const alternateLanguages: Record<string, string> = {};
    for (const locale of locales) {
      const translatedSlug = post.translations[locale];
      if (translatedSlug) {
        alternateLanguages[locale] = getLocalizedUrl(`/blog/${translatedSlug}`, locale);
      }
    }

    // Generate an entry for each available translation
    for (const locale of locales) {
      const translatedSlug = post.translations[locale];
      // Only create entry if translation exists for this locale
      if (!translatedSlug) continue;

      const url = getLocalizedUrl(`/blog/${translatedSlug}`, locale);

      sitemapEntries.push({
        url,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: alternateLanguages,
        },
      });
    }
  }

  return sitemapEntries;
}
