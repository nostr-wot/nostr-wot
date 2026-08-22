import { getTranslations } from 'next-intl/server';
import { getAllNews } from '@/lib/news';
import { getFullUrl } from '@/lib/metadata';
import { absoluteUrl, byPublishedAtDesc, feedItemContentHtml } from '@/lib/feeds';
import { locales, type Locale } from '@/i18n/config';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const l = locale as Locale;
  // Same reasoning as feed.xml: localized channel metadata, and ordering by
  // `publishedAt` because that is the date every item advertises.
  const t = await getTranslations({ locale: l, namespace: 'news' });
  const posts = [...getAllNews(l)].sort(byPublishedAtDesc).slice(0, 50);
  const disclosure = t('disclosure');
  const backfilledLabel = t('backfilled');

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: t('meta.title'),
    home_page_url: getFullUrl('/news', l),
    feed_url: getFullUrl('/news/feed.json', l),
    description: t('meta.description'),
    language: l,
    items: posts.map((p) => ({
      id: getFullUrl(`/news/${p.slug}`, l),
      url: getFullUrl(`/news/${p.slug}`, l),
      title: p.title,
      summary: p.excerpt || p.description,
      // Carries the archive notice and the AI-provenance disclosure, which a
      // reader would otherwise only ever see on the article page.
      content_html: feedItemContentHtml({
        excerpt: p.excerpt || p.description,
        backfilledLabel: p.backfilled ? backfilledLabel : undefined,
        disclosure,
      }),
      image: absoluteUrl(p.previewImage),
      date_published: p.publishedAt,
      ...(p.updated ? { date_modified: p.updated } : {}),
      tags: p.tags,
      authors: [{ name: 'Nostr WoT Newsroom' }],
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
