import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

const CONTENT_DIR = path.join(process.cwd(), 'content/blog');

function getBlogDir(locale: Locale = defaultLocale): string {
  return path.join(CONTENT_DIR, locale);
}

export interface AuthorSocials {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
    npub?: string;
    socials?: AuthorSocials;
  };
  featuredImage: string;
  previewImage: string;
  tags: string[];
  published: boolean;
  readingTime: string;
  locale: Locale;
  translationKey: string;
  availableLocales: Locale[];
  translations: Partial<Record<Locale, string>>; // Maps locale to slug
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

/**
 * Get all blog post slugs for a locale
 */
export function getBlogSlugs(locale: Locale = defaultLocale): string[] {
  const blogDir = getBlogDir(locale);
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  return fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

/**
 * Get the translation key from a post file
 */
function getTranslationKey(slug: string, locale: Locale): string | null {
  const blogDir = getBlogDir(locale);
  const mdxPath = path.join(blogDir, `${slug}.mdx`);
  const mdPath = path.join(blogDir, `${slug}.md`);

  let filePath: string | null = null;
  if (fs.existsSync(mdxPath)) {
    filePath = mdxPath;
  } else if (fs.existsSync(mdPath)) {
    filePath = mdPath;
  }

  if (!filePath) return null;

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);
  return data.translationKey || slug;
}

/**
 * Build a map of all translations by translationKey
 */
function buildTranslationMap(): Map<string, Partial<Record<Locale, string>>> {
  const map = new Map<string, Partial<Record<Locale, string>>>();

  for (const locale of locales) {
    const slugs = getBlogSlugs(locale);
    for (const slug of slugs) {
      const key = getTranslationKey(slug, locale);
      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, {});
      }
      map.get(key)![locale] = slug;
    }
  }

  return map;
}

// Cache for translation map (rebuilt on each request in dev, cached in prod)
let translationMapCache: Map<string, Partial<Record<Locale, string>>> | null = null;

function getTranslationMap(): Map<string, Partial<Record<Locale, string>>> {
  if (!translationMapCache || process.env.NODE_ENV === 'development') {
    translationMapCache = buildTranslationMap();
  }
  return translationMapCache;
}

/**
 * Get translations for a specific translationKey
 */
export function getTranslations(translationKey: string): Partial<Record<Locale, string>> {
  const map = getTranslationMap();
  return map.get(translationKey) || {};
}

/**
 * Get available locales for a specific post by its translationKey
 */
export function getAvailableLocales(translationKey: string): Locale[] {
  const translations = getTranslations(translationKey);
  return Object.keys(translations) as Locale[];
}

/**
 * Get a single blog post by slug and locale
 */
export function getBlogPost(slug: string, locale: Locale = defaultLocale): BlogPost | null {
  const blogDir = getBlogDir(locale);
  const mdxPath = path.join(blogDir, `${slug}.mdx`);
  const mdPath = path.join(blogDir, `${slug}.md`);

  let filePath: string;
  if (fs.existsSync(mdxPath)) {
    filePath = mdxPath;
  } else if (fs.existsSync(mdPath)) {
    filePath = mdPath;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);
  const translationKey = data.translationKey || slug;
  const translations = getTranslations(translationKey);
  const availableLocales = Object.keys(translations) as Locale[];

  return {
    slug,
    title: data.title || 'Untitled',
    description: data.description || '',
    excerpt: data.excerpt || '',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    author: {
      name: data.author?.name || 'Nostr WoT Team',
      avatar: data.author?.avatar,
      npub: data.author?.npub,
      socials: data.author?.socials ? {
        linkedin: data.author.socials.linkedin,
        instagram: data.author.socials.instagram,
        twitter: data.author.socials.twitter,
        github: data.author.socials.github,
      } : undefined,
    },
    featuredImage: data.featuredImage || '/images/blog/default-featured.svg',
    previewImage: data.previewImage || data.featuredImage || '/images/blog/default-preview.svg',
    tags: data.tags || [],
    published: data.published !== false,
    readingTime: stats.text,
    translationKey,
    translations,
    locale,
    availableLocales,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    ogImage: data.ogImage,
    content,
  };
}

/**
 * Get all published blog posts sorted by date for a locale
 */
export function getAllBlogPosts(locale: Locale = defaultLocale): BlogPostMeta[] {
  const slugs = getBlogSlugs(locale);

  const posts = slugs
    .map((slug) => {
      const post = getBlogPost(slug, locale);
      if (!post || !post.published) return null;

      // Return only metadata, not content
      const { content: _, ...meta } = post;
      return meta;
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

/**
 * Get posts by tag for a locale
 */
export function getPostsByTag(tag: string, locale: Locale = defaultLocale): BlogPostMeta[] {
  return getAllBlogPosts(locale).filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get all unique tags for a locale
 */
export function getAllTags(locale: Locale = defaultLocale): string[] {
  const posts = getAllBlogPosts(locale);
  const tags = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Get related posts based on tags for a locale
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3, locale: Locale = defaultLocale): BlogPostMeta[] {
  const currentPost = getBlogPost(currentSlug, locale);
  if (!currentPost) return [];

  const allPosts = getAllBlogPosts(locale).filter((post) => post.slug !== currentSlug);

  // Score posts by number of shared tags
  const scored = allPosts.map((post) => {
    const sharedTags = post.tags.filter((tag) =>
      currentPost.tags.includes(tag)
    ).length;
    return { post, score: sharedTags };
  });

  // Sort by score, then by date
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
  });

  return scored.slice(0, limit).map((s) => s.post);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, locale: string = 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
