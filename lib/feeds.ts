const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostr-wot.com';

/**
 * Escapes the five XML entities. The ampersand MUST be replaced first,
 * otherwise the ampersands introduced by the later replacements are
 * themselves escaped and the output is corrupt.
 */
export function escapeXml(value: string): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** RFC 822 date, which is what RSS 2.0 requires for pubDate. */
export function toRfc822(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${DAYS[d.getUTCDay()]}, ${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} GMT`;
}

export function absoluteUrl(url: string): string {
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}

/**
 * The only fields the syndication helpers below need from a news entry.
 * Declared structurally so these stay unit-testable without dragging the
 * content collection (and its generated cache) into the test process.
 */
export interface SyndicatablePost {
  publishedAt: string;
  backfilled: boolean;
}

/**
 * Google News accepts articles published in the last 48 hours.
 * See `app/news-sitemap.xml/route.ts` for why that is a specification
 * requirement rather than a self-imposed limit.
 */
export const NEWS_SITEMAP_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Whether an entry belongs in the Google News sitemap.
 *
 * Two conditions, and the second one is the important one:
 *
 * 1. `publishedAt` falls inside the 48-hour window.
 * 2. The entry is NOT backfilled.
 *
 * A backfilled entry is an article about a past event, written retrospectively.
 * Its `publishedAt` is the real ship date, so a whole archive batch passes the
 * 48-hour test on the day it lands — dozens of URLs at once, each declaring a
 * `news:publication_date` of roughly now while describing something that
 * happened months earlier. To Google News that reads as a flood of breaking
 * news that is not breaking and not news, which is precisely the shape of
 * scaled-content abuse.
 *
 * DO NOT REMOVE THE `backfilled` CHECK. It does not suppress valid content:
 * every backfilled entry is still in `sitemap.xml`, still in the RSS and JSON
 * feeds, and still indexable. It is excluded only from the surface that means
 * "this is new reporting", which for a retrospective article is untrue.
 */
export function isNewsSitemapEligible(
  post: SyndicatablePost,
  now: number = Date.now(),
  windowMs: number = NEWS_SITEMAP_WINDOW_MS
): boolean {
  if (post.backfilled) return false;
  const published = new Date(post.publishedAt).getTime();
  if (Number.isNaN(published)) return false;
  return published >= now - windowMs;
}

/**
 * Orders feed items newest-published first.
 *
 * The collection itself sorts by `date`, the EVENT date, which is the right
 * editorial order for `/news` and the archive. A feed advertises `pubDate` /
 * `date_published` = `publishedAt`, so ordering it by event date hands readers
 * a sequence that contradicts the feed's own metadata. This comparator is
 * scoped to the feeds for that reason and must not be pushed into `lib/news`.
 */
export function byPublishedAtDesc(a: SyndicatablePost, b: SyndicatablePost): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

/**
 * Body content for one feed item.
 *
 * A title plus a one-line summary plus a publication date of "now" is not an
 * honest rendering of a retrospective, machine-assembled article. The article
 * page carries an archive notice and an AI-provenance disclosure; a feed reader
 * never sees that page, so both surfaces travel with the item.
 *
 * Text is HTML-escaped here. The RSS route escapes the returned markup a second
 * time, which is correct: it embeds an HTML document inside an XML text node.
 */
export function feedItemContentHtml(parts: {
  excerpt: string;
  /** Localized `news.backfilled`. Pass only for backfilled entries. */
  backfilledLabel?: string;
  /** Localized `news.disclosure`. */
  disclosure: string;
}): string {
  const blocks: string[] = [];
  if (parts.excerpt) blocks.push(`<p>${escapeXml(parts.excerpt)}</p>`);
  if (parts.backfilledLabel) {
    blocks.push(`<p><em>${escapeXml(parts.backfilledLabel)}</em></p>`);
  }
  if (parts.disclosure) blocks.push(`<p><small>${escapeXml(parts.disclosure)}</small></p>`);
  return blocks.join('');
}
