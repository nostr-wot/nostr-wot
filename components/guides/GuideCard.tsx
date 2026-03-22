'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

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
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  order?: number;
}

function formatDate(dateString: string, locale: string = 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

interface GuideCardProps {
  guide: GuidePostMeta;
  featured?: boolean;
}

const difficultyColors = {
  beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const tagColors: Record<string, string> = {
  'Nostr':            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'Identity':         'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Keys':             'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'NIP-07':           'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Extension':        'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  'Setup':            'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  'Getting Started':  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  'Web of Trust':     'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  'Trust Graph':      'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  'Trust Settings':   'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  'Concepts':         'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  'Playground':       'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
  'Visualization':    'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
  'Lightning':        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'Zaps':             'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'NWC':              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'Wallet':           'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'Lightning Address':'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'WebLN':            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'Security':         'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'Privacy':          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'Permissions':      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'Decentralization': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'Resilience':       'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'Formula':          'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  'Advanced':         'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
};

function getTagColor(tag: string): string {
  return tagColors[tag] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
}

export function GuideCard({ guide, featured = false }: GuideCardProps) {
  const locale = useLocale();
  const t = useTranslations('guides.difficulty');

  if (featured) {
    return (
      <Link href={`/guides/${guide.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
              <Image
                src={guide.featuredImage}
                alt={guide.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                {guide.difficulty && (
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${difficultyColors[guide.difficulty]}`}>
                    {t(guide.difficulty)}
                  </span>
                )}
                {guide.tags.filter((tag) => tag.toLowerCase() !== guide.difficulty).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors">
                {guide.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                {guide.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={guide.date}>{formatDate(guide.date, locale)}</time>
                <span>·</span>
                <span>{guide.readingTime}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/guides/${guide.slug}`} className="group block h-full">
      <article className="h-full overflow-hidden rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={guide.previewImage}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            {guide.difficulty && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${difficultyColors[guide.difficulty]}`}>
                {t(guide.difficulty)}
              </span>
            )}
            {guide.tags.filter((tag) => tag.toLowerCase() !== guide.difficulty).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-xs font-medium rounded ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {guide.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
            {guide.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <time dateTime={guide.date}>{formatDate(guide.date, locale)}</time>
            <span>{guide.readingTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
