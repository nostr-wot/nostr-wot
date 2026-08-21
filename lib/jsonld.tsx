import type { NewsSource, NewsDigestItem } from '@/lib/content/shapes';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostr-wot.com';

function absolute(url: string): string {
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}

export const ORG = {
  '@type': 'Organization',
  name: 'Nostr WoT Newsroom',
  url: `${BASE_URL}/news`,
} as const;

export const PUBLISHER = {
  '@type': 'NewsMediaOrganization',
  name: 'Nostr Web of Trust',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/icon-512.png`,
  },
} as const;

export interface NewsArticleArgs {
  headline: string;
  description: string;
  image: string;
  url: string;
  /**
   * When the article actually shipped, and the only value allowed as
   * datePublished.
   *
   * The EVENT date (`post.date`) is deliberately NOT an argument here. There is
   * nothing in this graph it may legitimately fill, and accepting it would
   * invite a caller to believe passing it does something.
   */
  publishedAt: string;
  updated?: string;
  tags?: string[];
  sources?: NewsSource[];
}

export function newsArticleJsonLd(args: NewsArticleArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: args.headline,
    description: args.description,
    image: absolute(args.image),
    // datePublished is the real ship date. Using the event date here would
    // misrepresent freshness to search engines for backfilled archive entries.
    datePublished: args.publishedAt,
    dateModified: args.updated || args.publishedAt,
    author: ORG,
    publisher: PUBLISHER,
    mainEntityOfPage: { '@type': 'WebPage', '@id': args.url },
    url: args.url,
    ...(args.tags?.length ? { keywords: args.tags.join(', ') } : {}),
    ...(args.sources?.length
      ? {
          citation: args.sources.map((s) => ({
            '@type': 'CreativeWork',
            name: s.title,
            url: s.url,
            ...(s.publisher ? { publisher: { '@type': 'Organization', name: s.publisher } } : {}),
            ...(s.date ? { datePublished: s.date } : {}),
          })),
        }
      : {}),
  };
}

export interface BlogPostingArgs {
  headline: string;
  description: string;
  /**
   * Rendered as-is (NOT absolutised). Matches the blog page's pre-refactor
   * behaviour, which passed post.featuredImage straight through.
   */
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  /**
   * Pass `undefined` when the author has no socials at all (omits `sameAs`
   * entirely). Pass an array (possibly empty) when the author has a socials
   * object, matching the old behaviour of keying off `post.author.socials`
   * being present rather than off the resulting list being non-empty.
   */
  authorSameAs?: string[];
  tags: string[];
}

export function blogPostingJsonLd(args: BlogPostingArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: args.headline,
    description: args.description,
    image: args.image,
    datePublished: args.datePublished,
    dateModified: args.dateModified || args.datePublished,
    author: {
      '@type': 'Person',
      name: args.authorName,
      ...(args.authorUrl ? { url: args.authorUrl } : {}),
      affiliation: {
        '@type': 'Organization',
        name: 'Nostr Web of Trust',
        url: BASE_URL,
      },
      ...(args.authorSameAs !== undefined ? { sameAs: args.authorSameAs } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nostr Web of Trust',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': args.url },
    keywords: args.tags.join(', '),
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function itemListJsonLd(items: NewsDigestItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.title,
      url: it.url,
      ...(it.summary ? { description: it.summary } : {}),
    })),
  };
}

export function collectionPageJsonLd(args: {
  name: string;
  description: string;
  url: string;
  items?: { name: string; url: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: args.name,
    description: args.description,
    url: args.url,
    ...(args.items?.length
      ? {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: args.items.map((it, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: it.name,
              url: it.url,
            })),
          },
        }
      : {}),
  };
}

/** Renders one or more JSON-LD graphs as script tags. */
export function JsonLd({ data }: { data: object | object[] }) {
  const graphs = Array.isArray(data) ? data : [data];
  return (
    <>
      {graphs.map((g, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(g) }}
        />
      ))}
    </>
  );
}
