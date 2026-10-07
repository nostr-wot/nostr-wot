'use client';

import { useState } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Link, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { GitHubIcon, LinkedInIcon } from '@/components/icons';
import type { AuthorSocials } from '@/lib/blog';
import { type Locale, localeNames, locales } from '@/i18n/config';

interface SearchablePost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
}

interface BlogSidebarProps {
  tags: string[];
  currentTag?: string;
  authorNpub?: string;
  authorSocials?: AuthorSocials;
  currentLocale?: Locale;
  translations?: Partial<Record<Locale, string>>; // Maps locale to slug
  allPosts?: SearchablePost[]; // For autocomplete search
}

export function BlogSidebar({
  tags,
  currentTag,
  authorSocials,
  currentLocale,
  translations,
  allPosts = []
}: BlogSidebarProps) {
  const locale = useLocale();
  const t = useTranslations('blog.sidebar');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const availableLocales = translations ? Object.keys(translations) as Locale[] : [...locales];
  const showLanguageSwitcher = availableLocales.length > 1;

  return (
    <aside className="space-y-5">
      {showLanguageSwitcher && <SearchableSelect
        label={t('language')} value={currentLocale || locale}
        options={availableLocales.map(loc => ({ value: loc, label: localeNames[loc] }))}
        emptyText={t('noOptions')}
        onSelect={value => router.push(translations?.[value as Locale] ? `/blog/${translations[value as Locale]}` : '/blog', { locale: value as Locale })}
      />}
      <SearchableSelect label={t('tags')} value={currentTag || ''}
        options={[{ value: '', label: t('allTags') }, ...tags.map(tag => ({ value: tag, label: tag }))]}
        emptyText={t('noOptions')}
        onSelect={tag => router.push(tag ? `/blog?tag=${encodeURIComponent(tag)}` : '/blog')}
      />
      <form onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setSearchOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); }} className="relative" onSubmit={event => {
        event.preventDefault(); router.push(`/blog?q=${encodeURIComponent(searchQuery.trim())}`);
      }}>
        <label htmlFor="blog-sidebar-search" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('search')}</label>
        <input id="blog-sidebar-search" type="search" value={searchQuery}
          onFocus={() => setSearchOpen(true)} onChange={event => { setSearchQuery(event.target.value); setSearchOpen(true); }} placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        {searchOpen && searchQuery.trim().length >= 2 && <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {allPosts.filter(post => `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 5).map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block rounded px-3 py-2 text-sm text-gray-900 hover:bg-primary/10 focus:bg-primary/10 dark:text-white">{post.title}</Link>
          ))}
          <button type="submit" className="w-full px-3 py-2 text-left text-sm text-primary">{t('viewAllResults')}</button>
        </div>}
      </form>

      <BlogAuthorFollow authorSocials={authorSocials} />
    </aside>
  );
}

export function BlogAuthorFollow({ authorSocials }: { authorSocials?: AuthorSocials }) {
  const t = useTranslations('blog.sidebar');
  const hasSocials = authorSocials?.linkedin || authorSocials?.github;
  if (!hasSocials) return null;
  return <div className="mt-8">
      {/* Follow Author - only when author info is provided (on post pages) */}
      {hasSocials && (
        <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 rounded-xl border border-primary/20 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            {t('followUs')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('followDescription')}
          </p>
          <div className="flex items-center gap-3">
            {authorSocials?.linkedin && (
              <a
                href={`https://linkedin.com/in/${authorSocials.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#0077B5] hover:bg-[#0077B5]/10 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-5 h-5" />
              </a>
            )}
            {authorSocials?.github && (
              <a
                href={`https://github.com/${authorSocials.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      )}
  </div>;
}
