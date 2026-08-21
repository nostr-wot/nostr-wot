import { getAllNews } from '@/lib/news';
import { getFullUrl } from '@/lib/metadata';
import { escapeXml, toRfc822 } from '@/lib/feeds';
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
  const self = getFullUrl('/news/feed.xml', l);

  const items = posts
    .map((p) => {
      const url = getFullUrl(`/news/${p.slug}`, l);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(p.excerpt || p.description)}</description>
      <pubDate>${toRfc822(p.publishedAt)}</pubDate>
${p.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml('Nostr WoT News')}</title>
    <link>${escapeXml(getFullUrl('/news', l))}</link>
    <description>${escapeXml('What is actually happening across the Nostr ecosystem')}</description>
    <language>${l}</language>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
