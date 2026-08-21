import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getNewsArchiveMonths, getNewsForMonth } from '@/lib/news';
import { generateAlternates, generateOpenGraph, generateTwitter, getFullUrl } from '@/lib/metadata';
import { type Locale, locales } from '@/i18n/config';
import { NewsCard } from '@/components/news';
import { ScrollReveal, Section, LinkButton } from '@/components/ui';
import { ArrowLeftIcon } from '@/components/icons';
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/jsonld';

type Props = {
  params: Promise<{ locale: string; year: string; month: string }>;
};

/**
 * Parses the URL segments. Returns null for anything that is not the exact
 * canonical `YYYY/MM` shape with a month in 1-12, so an arbitrary segment can
 * never render a page (and `/2026/8` cannot duplicate `/2026/08`).
 */
function parseSegments(year: string, month: string): { year: number; month: number } | null {
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) return null;
  const y = Number(year);
  const m = Number(month);
  if (m < 1 || m > 12) return null;
  return { year: y, month: m };
}

function monthName(year: number, month: number, locale: string): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(locale, {
    month: 'long',
    timeZone: 'UTC',
  });
}

function archivePath(year: number, month: number): string {
  return `/news/archive/${year}/${String(month).padStart(2, '0')}`;
}

export async function generateStaticParams() {
  const params: { locale: string; year: string; month: string }[] = [];

  for (const locale of locales) {
    for (const { year, month } of getNewsArchiveMonths(locale)) {
      params.push({
        locale,
        year: String(year),
        month: String(month).padStart(2, '0'),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, year, month } = await params;
  const parsed = parseSegments(year, month);

  if (!parsed) {
    return { title: 'Not Found' };
  }

  const posts = getNewsForMonth(parsed.year, parsed.month, locale as Locale);
  if (posts.length === 0) {
    return { title: 'Not Found' };
  }

  const t = await getTranslations('news');
  const values = { month: monthName(parsed.year, parsed.month, locale), year: parsed.year };
  const title = t('archive.monthTitle', values);
  const description = t('archive.monthDescription', values);
  const path = archivePath(parsed.year, parsed.month);

  return {
    title,
    description,
    alternates: generateAlternates(path, locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path,
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function NewsArchiveMonthPage({ params }: Props) {
  const { locale, year, month } = await params;
  const parsed = parseSegments(year, month);

  if (!parsed) {
    notFound();
  }

  const posts = getNewsForMonth(parsed.year, parsed.month, locale as Locale);
  if (posts.length === 0) {
    notFound();
  }

  const t = await getTranslations('news');
  const values = { month: monthName(parsed.year, parsed.month, locale), year: parsed.year };
  const title = t('archive.monthTitle', values);
  const description = t('archive.monthDescription', values);
  const path = archivePath(parsed.year, parsed.month);
  const url = getFullUrl(path, locale as Locale);

  const collectionLd = collectionPageJsonLd({
    name: title,
    description,
    url,
    items: posts.map((post) => ({
      name: post.title,
      url: getFullUrl(`/news/${post.slug}`, locale as Locale),
    })),
  });

  const crumbsLd = breadcrumbJsonLd([
    { name: 'Home', url: getFullUrl('/', locale as Locale) },
    { name: t('title'), url: getFullUrl('/news', locale as Locale) },
    { name: title, url },
  ]);

  return (
    <>
      <JsonLd data={[collectionLd, crumbsLd]} />
      <main>
        <Section padding="lg" className="pt-24">
          <ScrollReveal animation="fade-up" immediate>
            <LinkButton
              href="/news"
              variant="secondary"
              className="mb-8 inline-flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t('backToNews')}
            </LinkButton>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                {t('archive.title')}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{description}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('archive.count', { count: posts.length })}
              </p>
            </div>
          </ScrollReveal>
        </Section>

        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <ScrollReveal key={post.slug} animation="fade-up" delay={100 + index * 50}>
                <NewsCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
