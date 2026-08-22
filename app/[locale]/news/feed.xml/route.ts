import { getTranslations } from 'next-intl/server';
import { getAllNews } from '@/lib/news';
import { getFullUrl } from '@/lib/metadata';
import {
  escapeXml,
  toRfc822,
  byPublishedAtDesc,
  feedItemContentHtml,
} from '@/lib/feeds';
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
  // Channel metadata is per-locale: a <language>ru</language> feed titled in
  // English is what a reader actually displays in its subscription list.
  const t = await getTranslations({ locale: l, namespace: 'news' });
  // The collection sorts by event date; a feed advertises `pubDate`, so it has
  // to be ordered by `publishedAt`. Copy before sorting — the collection hands
  // back a cached array.
  const posts = [...getAllNews(l)].sort(byPublishedAtDesc).slice(0, 50);
  const self = getFullUrl('/news/feed.xml', l);
  const disclosure = t('disclosure');
  const backfilledLabel = t('backfilled');

  const items = posts
    .map((p) => {
      const url = getFullUrl(`/news/${p.slug}`, l);
      // HTML body, escaped once by the builder and once more on the way into
      // the XML text node. Both passes are required and neither is redundant.
      const html = feedItemContentHtml({
        excerpt: p.excerpt || p.description,
        backfilledLabel: p.backfilled ? backfilledLabel : undefined,
        disclosure,
      });
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(html)}</description>
      <pubDate>${toRfc822(p.publishedAt)}</pubDate>
${p.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(t('meta.title'))}</title>
    <link>${escapeXml(getFullUrl('/news', l))}</link>
    <description>${escapeXml(t('meta.description'))}</description>
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
