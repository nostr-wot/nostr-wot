import { newsPath } from '@/lib/news-path.mjs';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllNews, getNewsArchiveMonths } from '@/lib/news';
import type { NewsPostMeta } from '@/lib/news';
import { generateOpenGraph, generateTwitter, getFullUrl } from '@/lib/metadata';
import { type Locale, locales, defaultLocale } from '@/i18n/config';
import { NewsCard } from '@/components/news';
import { ScrollReveal } from '@/components/ui';
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/jsonld';
import { NewsletterSection } from '@/components/layout/NewsletterSection';

/** Entries per index page. */
import { PAGE_SIZE, pageCount } from '@/lib/news-pagination';

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

/**
 * Reads `?page=N`.
 *
 * Returns 1 when the parameter is absent, so plain `/news` is always page one,
 * and `null` for anything that is not a positive integer. A malformed page is
 * NOT silently clamped: the route answers 404 rather than serving the first
 * page's content under an arbitrary URL, which would let crawlers mint endless
 * duplicates of it.
 */
function parsePage(raw: string | string[] | undefined): number | null {
  if (raw === undefined) return 1;
  // A repeated `?page=1&page=2` is ambiguous, not a request for either.
  if (Array.isArray(raw)) return null;
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  return page >= 1 ? page : null;
}

/** Total index pages for a locale. Always at least one, so `/news` can render its empty state. */


/** `/news` for page one, `/news?page=N` beyond it. Page one never carries `?page=1`. */
function indexPath(page: number): string {
  return page <= 1 ? '/news' : `/news?page=${page}`;
}

/**
 * Language alternates for one index page.
 *
 * Page one exists in every locale, empty or not. Deeper pages do not: each
 * locale is populated independently, so `/news?page=2` is a 404 in a locale
 * with only nine entries. Advertise a locale only when it actually has that
 * page, the same rule the archive route and `generateBlogAlternates` follow.
 */
function indexAlternates(page: number, currentLocale: Locale): Metadata['alternates'] {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    if (page === 1 || page <= pageCount(getAllNews(locale).length)) {
      languages[locale] = `${getFullUrl('/news', locale)}${page > 1 ? `?page=${page}` : ''}`;
    }
  }

  if (languages[defaultLocale]) {
    languages['x-default'] = languages[defaultLocale];
  }

  return {
    canonical: `${getFullUrl('/news', currentLocale)}${page > 1 ? `?page=${page}` : ''}`,
    languages,
  };
}

async function pageMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  // A search or tag filter renders its own view of `/news`, not one of the
  // numbered index pages, so it always carries page one's metadata rather
  // than being checked against `?page=`.
  const isFiltered = typeof sp.q === 'string' || typeof sp.tag === 'string';
  const page = isFiltered ? 1 : parsePage(sp.page);
  const t = await getTranslations('news.meta');
  const pageLabel = page && page > 1
    ? (await getTranslations('news'))('pagination.page', { current: page, total: pageCount(getAllNews(locale as Locale).length) })
    : '';
  const title = pageLabel ? `${pageLabel} | ${t('title')}` : t('title');
  const description = pageLabel ? `${pageLabel}. ${t('description')}` : t('description');

  if (!isFiltered && (page === null || page > pageCount(getAllNews(locale as Locale).length))) {
    return { title: 'Not Found' };
  }

  return {
    title,
    description,
    keywords: ['nostr news', 'nostr ecosystem news', 'nostr web of trust news'],
    alternates: indexAlternates(page ?? 1, locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: '/news',
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

function monthName(year: number, month: number, locale: string): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(locale, {
    month: 'long',
    timeZone: 'UTC',
  });
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations('news');
  const allPosts = getAllNews(locale as Locale);
  const totalPages = pageCount(allPosts.length);

  const sp = await searchParams;
  const searchQuery = typeof sp.q === 'string' ? sp.q : undefined;
  const tagFilter = typeof sp.tag === 'string' ? sp.tag : undefined;
  const isFiltered = !!(searchQuery || tagFilter);

  let posts: NewsPostMeta[];
  let page = 1;

  if (isFiltered) {
    // A search or tag filter shows every match at once, not a numbered slice
    // of it — same as the blog's filtered view.
    posts = allPosts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        !tagFilter || post.tags.some((tag) => tag.toLowerCase() === tagFilter.toLowerCase());

      return matchesSearch && matchesTag;
    });
  } else {
    const parsedPage = parsePage(sp.page);
    if (parsedPage === null || parsedPage > totalPages) {
      notFound();
    }
    page = parsedPage;
    posts = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }

  const archiveMonths = getNewsArchiveMonths(locale as Locale);

  // Only the first, unfiltered page has a "latest" entry to lead with; deeper
  // pages and filtered results are a plain grid, so nothing further down the
  // list is dressed up as the newest.
  const featuredPost = !isFiltered && page === 1 ? posts[0] : undefined;
  const supportingPosts = featuredPost ? posts.slice(1, 5) : [];
  const otherPosts = featuredPost ? posts.slice(5) : posts;

  const pageUrl = `${getFullUrl('/news', locale as Locale)}${page > 1 ? `?page=${page}` : ''}`;

  const collectionLd = collectionPageJsonLd({
    // Scoped to this page's slice, so the graph describes what the URL renders.
    name: t('meta.title'),
    description: t('meta.description'),
    url: pageUrl,
    items: posts.map((post) => ({
      name: post.title,
      url: getFullUrl(newsPath(post), locale as Locale),
    })),
  });

  const crumbsLd = breadcrumbJsonLd([
    { name: 'Home', url: getFullUrl('/', locale as Locale) },
    { name: t('title'), url: getFullUrl('/news', locale as Locale) },
  ]);

  return (
    <>
      <JsonLd data={[collectionLd, crumbsLd]} />
      <main>
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-screen-2xl px-6 py-10 lg:px-8">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">{t('title')}</h1>
            <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
          </div>
        </header>

        <div className="mx-auto grid max-w-screen-2xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:px-8 xl:grid-cols-[190px_minmax(0,1fr)_260px]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1 xl:col-start-2">
          {/* Filtered results header */}
          {isFiltered && (
            <ScrollReveal animation="fade-up">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('searchResults', { count: posts.length })}
                </h2>
                <Link href="/news" className="text-sm text-primary hover:underline">
                  {t('clearFilters')}
                </Link>
              </div>
            </ScrollReveal>
          )}

          {/* No results for the current search/tag filter */}
          {isFiltered && posts.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('noResults.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t('noResults.description')}</p>
              <Link href="/news" className="text-primary hover:underline">
                {t('clearFilters')}
              </Link>
            </div>
          )}

          {featuredPost && (
            <section aria-labelledby="featured-news-heading" className="mb-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-300 pb-3 dark:border-gray-700">
                <h2 id="featured-news-heading" className="text-lg font-bold">{t('layout.featured')}</h2>
                <Link href="#news-archive" className="text-sm text-primary hover:underline">{t('archive.browse')}</Link>
              </div>
              <div className="grid gap-6 md:grid-cols-[1.15fr_1fr]">
                <NewsCard post={featuredPost} variant="lead" />
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {supportingPosts.map(post => <NewsCard key={post.slug} post={post} variant="compact" />)}
                </div>
              </div>
            </section>
          )}

          {otherPosts.length > 0 && (
            <section aria-labelledby="more-news-heading">
              <h2 id="more-news-heading" className="mb-3 border-b border-gray-300 pb-3 text-lg font-bold dark:border-gray-700">{t('layout.more')}</h2>
              <div className="grid gap-x-6 sm:grid-cols-2">
                {otherPosts.map(post => (
                  <div key={post.slug} className="border-b border-gray-200 dark:border-gray-800">
                    <NewsCard post={post} variant="compact" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pagination. Page one is reachable at plain /news, never /news?page=1. */}
          {!isFiltered && totalPages > 1 && (
            <ScrollReveal animation="fade-up">
              <nav
                className="mt-12 flex items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6"
                // No dedicated pagination label exists in the message set, and
                // the position string is an accurate accessible name for it.
                aria-label={t('pagination.page', { current: page, total: totalPages })}
              >
                {page > 1 ? (
                  <Link
                    href={indexPath(page - 1)}
                    rel="prev"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
                  >
                    <span aria-hidden="true">←</span>
                    {t('pagination.previous')}
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm text-gray-400 dark:text-gray-600">
                    <span aria-hidden="true">←</span> {t('pagination.previous')}
                  </span>
                )}

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('pagination.page', { current: page, total: totalPages })}
                </span>

                {page < totalPages ? (
                  <Link
                    href={indexPath(page + 1)}
                    rel="next"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
                  >
                    {t('pagination.next')}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm text-gray-400 dark:text-gray-600">
                    {t('pagination.next')} <span aria-hidden="true">→</span>
                  </span>
                )}
              </nav>
            </ScrollReveal>
          )}

          {/* Empty state — the state this section ships in. */}
          {allPosts.length === 0 && (
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="max-w-2xl mx-auto rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30 px-8 py-16 text-center">
                <div
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 5h13a1 1 0 0 1 1 1v12a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5Z" />
                    <path d="M18 8h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2" />
                    <path d="M8 9h6M8 13h6M8 17h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('empty.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  {t('empty.description')}
                </p>
                <p className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {t('disclosure')}
                </p>
              </div>
            </ScrollReveal>
          )}

          </div>

          <aside aria-labelledby="latest-news-heading" className="min-w-0 lg:col-span-2 xl:col-span-1 xl:col-start-1 xl:row-start-1">
            <h2 id="latest-news-heading" className="mb-2 border-b border-gray-300 pb-3 text-base font-bold dark:border-gray-700">{t('latest')}</h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {allPosts.slice(0, 8).map(post => <NewsCard key={post.slug} post={post} variant="headline" />)}
            </div>
          </aside>

          <aside className="min-w-0 space-y-8 lg:col-start-2 lg:row-start-1 xl:col-start-3" aria-label={t('layout.resources')}>
            <NewsletterSection compact />
            {archiveMonths.length > 0 && (
              <section id="news-archive" aria-labelledby="archive-heading" className="scroll-mt-24">
                <h2 id="archive-heading" className="mb-3 border-b border-gray-300 pb-3 text-base font-bold dark:border-gray-700">{t('archive.title')}</h2>
                <ul className="space-y-1">
                  {archiveMonths.map(({ year, month, count }) => (
                    <li key={`${year}-${month}`}>
                      <Link href={`/news/archive/${year}/${String(month).padStart(2, '0')}`} className="flex items-center justify-between gap-3 rounded-lg py-2 text-sm text-gray-600 hover:text-primary dark:text-gray-400">
                        <span>{t('archive.monthTitle', { month: monthName(year, month, locale), year })}</span>
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
