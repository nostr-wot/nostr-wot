"use client";

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, useRouter} from '@/i18n/routing';
import {type Locale, localeNames, locales} from '@/i18n/config';
import SearchableSelect from '@/components/ui/SearchableSelect';

export function ArticleSidebar({section, tags, currentTag, currentLocale, translations, allPosts=[]}: {
  section: 'blog' | 'guides';
  tags: string[];
  currentTag?: string;
  currentLocale?: Locale;
  translations?: Partial<Record<Locale,string>>;
  allPosts?: {slug:string;title:string;excerpt:string;tags:string[]}[];
}) {
  const locale = useLocale();
  const t = useTranslations(`${section}.sidebar`);
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
        onSelect={value => router.push(translations?.[value as Locale] ? `/${section}/${translations[value as Locale]}` : `/${section}`, { locale: value as Locale })}
      />}
      <SearchableSelect label={t('tags')} value={currentTag || ''}
        options={[{ value: '', label: t('allTags') }, ...tags.map(tag => ({ value: tag, label: tag }))]}
        emptyText={t('noOptions')}
        onSelect={tag => router.push(tag ? `/${section}?tag=${encodeURIComponent(tag)}` : `/${section}`)}
      />
      <form onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setSearchOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); }} className="relative" onSubmit={event => {
        event.preventDefault(); router.push(`/${section}?q=${encodeURIComponent(searchQuery.trim())}`);
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
