import { pageCount } from '@/lib/news-pagination';
import { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllGuides } from "@/lib/guides";
import { getAllNews, getNewsArchiveMonths, getNewsForMonth } from "@/lib/news";
import { routes, resolveRouteLastModified } from "@/lib/sitemap-routes.mjs";
import routeModified from "@/lib/generated/route-modified.json";
import { listSentNewsletters } from "@/lib/newsletter-archive";

// Sent editions are runtime records and can appear without a code deployment.
export const dynamic = "force-dynamic";

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

// Static route path/changeFrequency/priority list lives in
// lib/sitemap-routes.mjs, shared with scripts/generate-route-modified.mjs,
// so the two never drift into two different route lists.

// `lib/generated/route-modified.json` maps a subset of route paths (only
// the ones a git commit date could honestly be determined for — see
// scripts/generate-route-modified.mjs) to an ISO commit date.
const routeModifiedDates: Record<string, string> = routeModified;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const issue of await listSentNewsletters()) {
    const languages = Object.keys(issue.translations);
    const alternates = Object.fromEntries(languages.map(locale => [locale, getLocalizedUrl(`/newsletters/${issue.id}`, locale)]));
    for (const locale of languages) {
      const edition = issue.translations[locale as keyof typeof issue.translations];
      if (!edition) continue;
      sitemapEntries.push({ url: alternates[locale], lastModified: edition.sentAt, changeFrequency: "never", priority: 0.6, alternates: { languages: alternates } });
    }
  }

  // Generate entries for each static route in each locale
  for (const route of routes) {
    for (const locale of locales) {
      const url = getLocalizedUrl(route.path, locale);

      // Static routes are locale-invariant content-wise (the same page
      // component backs every locale), so the git-derived date is per path,
      // not per locale. Only set lastModified when a date was actually
      // resolved for this route — omit the key entirely otherwise rather
      // than fabricate one. See lib/sitemap-routes.mjs and
      // scripts/generate-route-modified.mjs.
      const lastModified = resolveRouteLastModified(route.path, routeModifiedDates);

      sitemapEntries.push({
        url,
        ...(lastModified ? { lastModified } : {}),
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

  // Enumerate each locale's published inventory, rather than using English
  // translation links as the inventory. A locale can publish independently,
  // and a translation link alone does not guarantee a published destination.
  for (const { section, getAll, priority } of [
    { section: "blog", getAll: getAllBlogPosts, priority: 0.7 },
    { section: "guides", getAll: getAllGuides, priority: 0.7 },
    { section: "news", getAll: getAllNews, priority: 0.8 },
  ]) {
    const published = locales.flatMap(locale =>
      getAll(locale).map(post => ({ locale, post }))
    );
    const translations = new Map<string, Record<string, string>>();
    for (const { locale, post } of published) {
      const alternates = translations.get(post.translationKey) || {};
      alternates[locale] = getLocalizedUrl(`/${section}/${post.slug}`, locale);
      translations.set(post.translationKey, alternates);
    }
    for (const { locale, post } of published) {
      const modified = "publishedAt" in post
        ? post.updated || post.publishedAt
        : post.date;
      sitemapEntries.push({
        url: getLocalizedUrl(`/${section}/${post.slug}`, locale),
        lastModified: new Date(modified),
        changeFrequency: "monthly",
        priority,
        alternates: { languages: translations.get(post.translationKey)! },
      });
    }
  }

  // Numbered news pages are self-canonical public collections, not filters.
  const counts = new Map(locales.map(locale => [locale, pageCount(getAllNews(locale).length)]));
  for (let page = 2; page <= Math.max(...counts.values()); page++) {
    const available = locales.filter(locale => counts.get(locale)! >= page);
    const path = `/news?page=${page}`;
    const languages = Object.fromEntries(available.map(locale => [locale, getLocalizedUrl(path, locale)]));
    for (const locale of available) {
      sitemapEntries.push({ url: languages[locale], changeFrequency: "daily", priority: 0.6, alternates: { languages } });
    }
  }

  // Generate entries for news archive month pages
  // Only emit a locale's archive URL for months where that locale actually has
  // posts — the archive route notFound()s otherwise, and a sitemap listing a
  // 404 is worse than one that omits it. Months are collected per locale
  // (rather than from the default locale alone) so a month with posts only in
  // a non-default locale is not silently dropped.
  const archiveMonthKeys = new Set<string>();
  for (const locale of locales) {
    for (const { year, month } of getNewsArchiveMonths(locale)) {
      archiveMonthKeys.add(`${year}-${month}`);
    }
  }
  const archiveMonths = [...archiveMonthKeys].map((key) => {
    const [year, month] = key.split("-").map(Number);
    return { year, month };
  });
  for (const { year, month } of archiveMonths) {
    const monthPath = `/news/archive/${year}/${String(month).padStart(2, "0")}`;

    const alternateLanguages: Record<string, string> = {};
    for (const locale of locales) {
      if (getNewsForMonth(year, month, locale).length > 0) {
        alternateLanguages[locale] = getLocalizedUrl(monthPath, locale);
      }
    }

    for (const locale of locales) {
      const monthPosts = getNewsForMonth(year, month, locale);
      if (monthPosts.length === 0) continue;

      const url = getLocalizedUrl(monthPath, locale);

      // Derived from the content, never from the clock. `new Date()` here told
      // every crawler that every archive month had changed on every deploy,
      // which is both false and a reason to stop trusting the whole sitemap.
      // An archive month page changes when one of its posts does, so its
      // lastmod is the newest real ship-or-edit date among that locale's posts
      // for that month.
      const lastModified = new Date(
        Math.max(
          ...monthPosts.map((post) =>
            new Date(post.updated || post.publishedAt).getTime()
          )
        )
      );

      sitemapEntries.push({
        url,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: alternateLanguages,
        },
      });
    }
  }

  return sitemapEntries;
}
