import { HELP_TOPICS, helpTopicHref } from '@/lib/help-topics';
import { newsPath } from '@/lib/news-path.mjs';
import { pageCount } from '@/lib/news-pagination';
import { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllGuides } from "@/lib/guides";
import { getAllNews, getNewsArchiveMonths, getNewsForMonth } from "@/lib/news";
import { routes, resolveRouteLastModified } from "@/lib/sitemap-routes.mjs";
import routeModified from "@/lib/generated/route-modified.json";
import { listSentNewsletters } from "@/lib/newsletter-archive";
import ecosystemProjects from "@/data/ecosystem-projects.json";
import { getPeople } from "@/lib/people";
import type { EcosystemData } from "@/lib/ecosystem-projects";

// Sent editions are runtime records and can appear without a code deployment.
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://nostrwot.com";

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

/**
 * An hreflang set with `x-default` added, pointing at the default locale.
 *
 * The page metadata has emitted `x-default` since `generateAlternates` was
 * written; the sitemap's own alternates did not, so the two advertised
 * different hreflang sets for the same URL.
 *
 * Only added when the default locale is actually in the set: a post published
 * in Spanish alone has no English URL, and pointing `x-default` at one that
 * 404s is worse than omitting it.
 */
function withDefault(languages: Record<string, string>): Record<string, string> {
  return languages[defaultLocale]
    ? { ...languages, 'x-default': languages[defaultLocale] }
    : languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const issue of await listSentNewsletters()) {
    const languages = Object.keys(issue.translations);
    const alternates = Object.fromEntries(languages.map(locale => [locale, getLocalizedUrl(`/newsletters/${issue.id}`, locale)]));
    for (const locale of languages) {
      const edition = issue.translations[locale as keyof typeof issue.translations];
      if (!edition) continue;
      sitemapEntries.push({ url: alternates[locale], lastModified: edition.sentAt, changeFrequency: "never", priority: 0.6, alternates: { languages: withDefault(alternates) } });
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
          languages: withDefault(Object.fromEntries(
            locales.map((l) => [l, getLocalizedUrl(route.path, l)])
          )),
        },
      });
    }
  }

  for (const topic of HELP_TOPICS) {
    const path = helpTopicHref(topic);
    const languages = Object.fromEntries(locales.map(locale => [locale, getLocalizedUrl(path, locale)]));
    for (const locale of locales) sitemapEntries.push({ url: languages[locale], changeFrequency: 'monthly', priority: 0.6, alternates: { languages } });
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
      alternates[locale] = getLocalizedUrl(section === "news" && "publishedAt" in post ? newsPath({ slug: post.slug, publishedAt: post.publishedAt }) : `/${section}/${post.slug}`, locale);
      translations.set(post.translationKey, alternates);
    }
    for (const { locale, post } of published) {
      const modified = "publishedAt" in post
        ? post.updated || post.publishedAt
        : post.date;
      sitemapEntries.push({
        url: getLocalizedUrl(section === "news" && "publishedAt" in post ? newsPath({ slug: post.slug, publishedAt: post.publishedAt }) : `/${section}/${post.slug}`, locale),
        lastModified: new Date(modified),
        changeFrequency: "monthly",
        priority,
        alternates: { languages: withDefault(translations.get(post.translationKey)!) },
      });
    }
  }

  // Every project record exists in all seven locales, so each page's hreflang
  // set is the full locale list. Priority sits below /projects (0.6) so the
  // directory stays the primary target and these remain its spokes.
  for (const project of ecosystemProjects.projects) {
    const languages = Object.fromEntries(locales.map(locale => [locale, getLocalizedUrl(`/projects/${project.id}`, locale)]));
    for (const locale of locales) {
      sitemapEntries.push({
        url: languages[locale],
        lastModified: project.lastVerified,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: { languages: withDefault(languages) },
      });
    }
  }

  // One page per credited person, derived from the same records as the project
  // pages above, so a person cannot appear here without the role that evidences
  // them. A person's slug is their kebab-cased name, which is identical in all
  // seven locale datasets, so each page's hreflang set is the full locale list.
  // Priority sits below the project pages (0.5): a person page cites one fact
  // about a project record, so the project record is the better landing page.
  for (const person of getPeople(ecosystemProjects as unknown as EcosystemData)) {
    const languages = Object.fromEntries(locales.map(locale => [locale, getLocalizedUrl(`/people/${person.slug}`, locale)]));
    // Derived, never the clock: a person page says what the project records
    // credit them with, so it changes when one of those records is re-checked.
    // The newest check among their roles is the honest date. Omitted entirely
    // when no role carries one, rather than falling back to today.
    const checked = person.roles
      .map(role => ecosystemProjects.projects.find(project => project.id === role.projectId)?.lastVerified)
      .filter((date): date is string => Boolean(date))
      .sort();
    const lastModified = checked.at(-1);
    for (const locale of locales) {
      sitemapEntries.push({
        url: languages[locale],
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "monthly",
        priority: 0.4,
        alternates: { languages: withDefault(languages) },
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
      sitemapEntries.push({ url: languages[locale], changeFrequency: "daily", priority: 0.6, alternates: { languages: withDefault(languages) } });
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
          languages: withDefault(alternateLanguages),
        },
      });
    }
  }

  return sitemapEntries;
}
