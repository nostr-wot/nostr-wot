import type { Locale } from '@/i18n/config';

export interface AuthorSocials {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
}

export interface ContentAuthor {
  name: string;
  avatar?: string;
  npub?: string;
  socials?: AuthorSocials;
}

export interface ContentMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  author: ContentAuthor;
  featuredImage: string;
  previewImage: string;
  tags: string[];
  published: boolean;
  readingTime: string;
  locale: Locale;
  translationKey: string;
  availableLocales: Locale[];
  translations: Partial<Record<Locale, string>>;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export interface ContentDoc extends ContentMeta {
  content: string;
}

export interface CollectionDefaults {
  featuredImage: string;
  previewImage: string;
  authorName: string;
}

/** Everything that differs between blog, guides and news. */
export interface CollectionShape<TExtra extends object> {
  defaults: CollectionDefaults;
  includeAuthorSocials: boolean;
  parseExtra: (data: Record<string, any>) => TExtra;
}

export interface LocaleBucket<T> {
  posts: T[];
  tags: string[];
}

export interface CollectionCache<T> {
  generatedAt: string;
  locales: Record<string, LocaleBucket<T>>;
}
