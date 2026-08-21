import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllNews, getNewsArchiveMonths } from '@/lib/news';
import { generateAlternates, generateOpenGraph, generateTwitter, getFullUrl } from '@/lib/metadata';
import { type Locale } from '@/i18n/config';
import { NewsCard } from '@/components/news';
import { ScrollReveal, Section } from '@/components/ui';
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/jsonld';
import { NewsletterSection } from '@/components/layout/NewsletterSection';

const LATEST_COUNT = 12;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('news.meta');
  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    keywords: ['nostr news', 'nostr ecosystem news', 'nostr web of trust news'],
    alternates: generateAlternates('/news', locale as Locale),
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

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('news');
  const allPosts = getAllNews(locale as Locale);
  const posts = allPosts.slice(0, LATEST_COUNT);
  const archiveMonths = getNewsArchiveMonths(locale as Locale);

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  const collectionLd = collectionPageJsonLd({
    name: t('meta.title'),
    description: t('meta.description'),
    url: getFullUrl('/news', locale as Locale),
    items: posts.map((post) => ({
      name: post.title,
      url: getFullUrl(`/news/${post.slug}`, locale as Locale),
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
        {/* Hero */}
        <Section padding="lg" className="pt-24">
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
            </div>
          </ScrollReveal>
        </Section>

        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* Featured entry */}
          {featuredPost && (
            <section className="mb-12">
              <ScrollReveal animation="fade-up" delay={100}>
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-6">
                  {t('latest')}
                </h2>
                <NewsCard post={featuredPost} featured />
              </ScrollReveal>
            </section>
          )}

          {/* The rest of the latest batch */}
          {otherPosts.length > 0 && (
            <section>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post, index) => (
                  <ScrollReveal key={post.slug} animation="fade-up" delay={100 + index * 50}>
                    <NewsCard post={post} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {/* Empty state — the state this section ships in. */}
          {posts.length === 0 && (
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

          {/* Archive */}
          {archiveMonths.length > 0 && (
            <section className="mt-16">
              <ScrollReveal animation="fade-up">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('archive.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('archive.subtitle')}</p>
                <ul className="flex flex-wrap gap-3">
                  {archiveMonths.map(({ year, month, count }) => (
                    <li key={`${year}-${month}`}>
                      <Link
                        href={`/news/archive/${year}/${String(month).padStart(2, '0')}`}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
                      >
                        <span>
                          {t('archive.monthTitle', {
                            month: monthName(year, month, locale),
                            year,
                          })}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('archive.count', { count })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </section>
          )}

          {/* Newsletter */}
          <ScrollReveal animation="fade-left" delay={200}>
            <NewsletterSection />
          </ScrollReveal>
        </div>
      </main>
    </>
  );
}
