import { getAllNews } from '@/lib/news';
import { getFullUrl } from '@/lib/metadata';
import { escapeXml } from '@/lib/feeds';
import { locales, type Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

/**
 * Google News sitemap.
 *
 * By specification this contains ONLY articles published in the last 48 hours.
 * That is not a limitation of this implementation — an article older than that
 * does not belong in a news sitemap, and including it does not help it rank.
 * The regular sitemap.xml carries the full archive.
 */
const WINDOW_MS = 48 * 60 * 60 * 1000;

export async function GET() {
  const cutoff = Date.now() - WINDOW_MS;
  const entries: string[] = [];

  for (const locale of locales) {
    const l = locale as Locale;
    for (const post of getAllNews(l)) {
      if (new Date(post.publishedAt).getTime() < cutoff) continue;
      const url = getFullUrl(`/news/${post.slug}`, l);
      entries.push(`  <url>
    <loc>${escapeXml(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>Nostr WoT News</news:name>
        <news:language>${l}</news:language>
      </news:publication>
      <news:publication_date>${post.publishedAt}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
