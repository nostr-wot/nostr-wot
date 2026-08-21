import { getAllNews } from '@/lib/news';
import { getFullUrl } from '@/lib/metadata';
import { absoluteUrl } from '@/lib/feeds';
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
  const posts = getAllNews(l).slice(0, 50);

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Nostr WoT News',
    home_page_url: getFullUrl('/news', l),
    feed_url: getFullUrl('/news/feed.json', l),
    description: 'What is actually happening across the Nostr ecosystem',
    language: l,
    items: posts.map((p) => ({
      id: getFullUrl(`/news/${p.slug}`, l),
      url: getFullUrl(`/news/${p.slug}`, l),
      title: p.title,
      summary: p.excerpt || p.description,
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
