import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { locales, defaultLocale, type Locale } from '@/i18n/config';
import guidesCache from '@/lib/generated/guides-cache.json';

// Use cache in production, filesystem in development for hot reloading
const USE_CACHE = process.env.NODE_ENV === 'production';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'guides');

function getGuidesDir(locale: Locale = defaultLocale): string {
  return path.join(CONTENT_DIR, locale);
}

export interface GuidePostMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
    npub?: string;
  };
  featuredImage: string;
  previewImage: string;
  tags: string[];
  published: boolean;
  readingTime: string;
  locale: Locale;
  translationKey: string;
  availableLocales: Locale[];
  translations: Partial<Record<Locale, string>>;
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  // Guide-specific
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  order?: number;
}

export interface GuidePost extends GuidePostMeta {
  content: string;
}

/**
 * Get all guide slugs for a locale
 */
export function getGuideSlugs(locale: Locale = defaultLocale): string[] {
  if (USE_CACHE) {
    const localeData = (guidesCache.locales as Record<string, { posts: GuidePost[]; tags: string[] }>)[locale];
    return localeData?.posts.map(p => p.slug) || [];
  }

  const guidesDir = getGuidesDir(locale);
  if (!fs.existsSync(guidesDir)) {
    return [];
  }

  return fs
    .readdirSync(guidesDir)
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

/**
 * Get the translation key from a guide file
 */
function getTranslationKey(slug: string, locale: Locale): string | null {
  const guidesDir = getGuidesDir(locale);
  const mdxPath = path.join(guidesDir, `${slug}.mdx`);
  const mdPath = path.join(guidesDir, `${slug}.md`);

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
    const slugs = getGuideSlugs(locale);
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

// Cache for translation map
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
export function getGuideTranslations(translationKey: string): Partial<Record<Locale, string>> {
  if (USE_CACHE) {
    for (const locale of locales) {
      const localeData = (guidesCache.locales as Record<string, { posts: GuidePost[]; tags: string[] }>)[locale];
      const post = localeData?.posts.find(p => p.translationKey === translationKey);
      if (post?.translations) {
        return post.translations as Partial<Record<Locale, string>>;
      }
    }
    return {};
  }

  const map = getTranslationMap();
  return map.get(translationKey) || {};
}

/**
 * Get a single guide by slug and locale
 */
export function getGuide(slug: string, locale: Locale = defaultLocale): GuidePost | null {
  if (USE_CACHE) {
    const localeData = (guidesCache.locales as Record<string, { posts: GuidePost[]; tags: string[] }>)[locale];
    const post = localeData?.posts.find(p => p.slug === slug);
    return post || null;
  }

  const guidesDir = getGuidesDir(locale);
  const mdxPath = path.join(guidesDir, `${slug}.mdx`);
  const mdPath = path.join(guidesDir, `${slug}.md`);

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
  const translations = getGuideTranslations(translationKey);
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
    },
    featuredImage: data.featuredImage || '/images/guides/default-featured.svg',
    previewImage: data.previewImage || data.featuredImage || '/images/guides/default-preview.svg',
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
    difficulty: data.difficulty || 'beginner',
    order: data.order || 99,
    content,
  };
}

/**
 * Get all published guides sorted by order for a locale
 */
export function getAllGuides(locale: Locale = defaultLocale): GuidePostMeta[] {
  if (USE_CACHE) {
    const localeData = (guidesCache.locales as Record<string, { posts: GuidePost[]; tags: string[] }>)[locale];
    if (!localeData) return [];
    return localeData.posts.map(({ content: _, ...meta }) => meta);
  }

  const slugs = getGuideSlugs(locale);

  const posts = slugs
    .map((slug) => {
      const post = getGuide(slug, locale);
      if (!post || !post.published) return null;
      const { content: _, ...meta } = post;
      return meta;
    })
    .filter((post): post is GuidePostMeta => post !== null)
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  return posts;
}

/**
 * Get guides by tag for a locale
 */
export function getGuidesByTag(tag: string, locale: Locale = defaultLocale): GuidePostMeta[] {
  return getAllGuides(locale).filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get all unique tags for a locale
 */
export function getAllGuideTags(locale: Locale = defaultLocale): string[] {
  if (USE_CACHE) {
    const localeData = (guidesCache.locales as Record<string, { posts: GuidePost[]; tags: string[] }>)[locale];
    return localeData?.tags || [];
  }

  const posts = getAllGuides(locale);
  const tags = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

/**
 * Get related guides based on tags
 */
export function getRelatedGuides(currentSlug: string, limit: number = 3, locale: Locale = defaultLocale): GuidePostMeta[] {
  const currentPost = getGuide(currentSlug, locale);
  if (!currentPost) return [];

  const allPosts = getAllGuides(locale).filter((post) => post.slug !== currentSlug);

  const scored = allPosts.map((post) => {
    const sharedTags = post.tags.filter((tag) =>
      currentPost.tags.includes(tag)
    ).length;
    return { post, score: sharedTags };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.post.order || 99) - (b.post.order || 99);
  });

  return scored.slice(0, limit).map((s) => s.post);
}
