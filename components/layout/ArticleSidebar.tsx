"use client";

import {blogFilterUrl, visibleBlogTopics} from '@/lib/blog-filters';
import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, useRouter} from '@/i18n/routing';
import {type Locale, localeNames, locales} from '@/i18n/config';
import SearchableSelect from '@/components/ui/SearchableSelect';

export function ArticleSidebar({section, tags, currentTags = [], currentQuery = '', currentLocale, translations, allPosts=[]}: {
  section: 'blog' | 'guides';
  tags: string[];
  currentTags?: string[];
  currentQuery?: string;
  currentLocale?: Locale;
  translations?: Partial<Record<Locale,string>>;
  allPosts?: {slug:string;title:string;excerpt:string;tags:string[]}[];
}) {
  const locale = useLocale();
  const t = useTranslations(`${section}.sidebar`);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [topicQuery, setTopicQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const availableLocales = translations ? Object.keys(translations) as Locale[] : [...locales];
  const showLanguageSwitcher = availableLocales.length > 1;

  return (
    <aside className="space-y-5">
      {showLanguageSwitcher && <SearchableSelect
        label={t('language')} value={currentLocale || locale}
        options={availableLocales.map(loc => ({ value: loc, label: localeNames[loc] }))}
        emptyText={t('noOptions')}
        onSelect={value => router.push(translations?.[value as Locale] ? `/${section}/${translations[value as Locale]}` : `/${section}`, { locale: value as Locale })}
      />}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t('tags')}</legend>
        <label htmlFor={`${section}-topic-search`} className="sr-only">{t('searchTopics')}</label>
        <input id={`${section}-topic-search`} type="search" value={topicQuery} onChange={event => setTopicQuery(event.target.value)} placeholder={t('searchTopics')}
          className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto p-1">
          {visibleBlogTopics(tags, currentTags, topicQuery).map(tag => {
            const selected = currentTags.includes(tag);
            return <button key={tag} type="button" aria-pressed={selected}
              onClick={() => router.push(blogFilterUrl(selected ? currentTags.filter(value => value !== tag) : [...currentTags, tag], searchQuery, section))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-gray-100 text-gray-700 hover:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
              {tag}{selected && <span aria-hidden="true" className="ml-1">×</span>}
            </button>;
          })}
          {!visibleBlogTopics(tags, currentTags, topicQuery).length && <p className="text-sm text-gray-500">{t('noOptions')}</p>}
        </div>
      </fieldset>
      <form onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setSearchOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); }} className="relative" onSubmit={event => {
        event.preventDefault(); router.push(blogFilterUrl(currentTags, searchQuery, section));
      }}>
        <label htmlFor={`${section}-sidebar-search`} className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('search')}</label>
        <input id={`${section}-sidebar-search`} type="search" value={searchQuery}
          onFocus={() => setSearchOpen(true)} onChange={event => { setSearchQuery(event.target.value); setSearchOpen(true); }} placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        {searchOpen && searchQuery.trim().length >= 2 && <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {allPosts.filter(post => `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 5).map(post => (
            <Link key={post.slug} href={`/${section}/${post.slug}`} className="block rounded px-3 py-2 text-sm text-gray-900 hover:bg-primary/10 focus:bg-primary/10 dark:text-white">{post.title}</Link>
          ))}
          <button type="submit" className="w-full px-3 py-2 text-left text-sm text-primary">{t('viewAllResults')}</button>
        </div>}
      </form>


    </aside>
  );
}
