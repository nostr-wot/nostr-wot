'use client';

import { HelpVideoLibrary } from './HelpVideoLibrary';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { HELP_CATEGORIES, HELP_TOPICS, helpTopicHref, matchesHelpQuery, type HelpCategory } from '@/lib/help-topics';
import { KeyIcon, LockOutlineIcon, LightningIcon, SettingsIcon, SearchIcon, ChevronRightIcon } from '@/components/icons';

const icons = { accounts: KeyIcon, permissions: LockOutlineIcon, payments: LightningIcon, settings: SettingsIcon, troubleshooting: SearchIcon };
const order = ['account', 'import', 'switch', 'subAccounts', 'backup', 'remove', 'approvals', 'permissions', 'authentication', 'wallet', 'receive', 'zaps', 'limits', 'security', 'appearance', 'language', 'loginFailed', 'denied', 'walletFailed', 'zapFailed'];
const topics = [...HELP_TOPICS].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

export function HelpCenter() {
  const t = useTranslations('help');
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get('q') ?? '');
    // Preserve links shared before help articles had their own URLs.
    const forwardLegacyLink = () => {
      const oldTask = HELP_TOPICS.find(topic => topic.id === window.location.hash.slice(1));
      if (oldTask) router.replace(helpTopicHref(oldTask));
    };
    forwardLegacyLink();
    window.addEventListener('hashchange', forwardLegacyLink);
    return () => window.removeEventListener('hashchange', forwardLegacyLink);
  }, [router]);

  function search(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set('q', value); else url.searchParams.delete('q');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }

  const results = topics.filter(topic => matchesHelpQuery(query, [t(`topics.${topic.id}.title`), t(`categories.${topic.category}`), t(`topics.${topic.id}.overview`), ...(t.raw(`topics.${topic.id}.before`) as string[]), ...(t.raw(`topics.${topic.id}.steps`) as string[]), ...(t.raw(`topics.${topic.id}.checks`) as string[])].join(' ')));
  const returnQuery = query.trim() ? `?q=${encodeURIComponent(query)}` : '';
  const taskLink = (topic: typeof topics[number]) => `${helpTopicHref(topic)}${returnQuery}`;

  function group(category: HelpCategory) {
    const Icon = icons[category];
    return <section key={category} aria-labelledby={`category-${category}`} className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 sm:p-7 dark:border-gray-800 dark:bg-gray-900/30">
      <div className="mb-4 flex items-center gap-3">
        <span aria-hidden="true" className="text-primary"><Icon className="h-6 w-6" /></span>
        <h3 id={`category-${category}`} className="text-xl font-semibold">{t(`categories.${category}`)}</h3>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(`categoryDescriptions.${category}`)}</p>
      <ul className="space-y-1">{topics.filter(topic => topic.category === category).map(topic => <li key={topic.id}>
        <Link href={taskLink(topic)} className="group flex min-h-11 items-center justify-between gap-4 rounded-md py-2 text-gray-800 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary dark:text-gray-200 dark:hover:text-primary">
          <span className="group-hover:underline underline-offset-4">{t(`topics.${topic.id}.title`)}</span>
          <span aria-hidden="true"><ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-400" /></span>
        </Link>
      </li>)}</ul>
    </section>;
  }

  return <>
    <div className="mx-auto mb-12 max-w-2xl">
      <label htmlFor="help-search" className="sr-only">{t('search')}</label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute left-4 top-4 text-gray-500"><SearchIcon className="h-5 w-5" /></span>
        <input id="help-search" type="search" value={query} onChange={event => search(event.target.value)} placeholder={t('searchHint')} className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900" />
      </div>
    </div>
    <p role="status" className="sr-only">{t('results', { count: results.length })}</p>
    {query.trim() ? <section aria-label={t('search')} className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-4"><p className="text-gray-600 dark:text-gray-400">{t('results', { count: results.length })}</p><button type="button" onClick={() => search('')} className="min-h-11 text-sm text-primary hover:underline">{t('clear')}</button></div>
      {!results.length && <p className="py-8 text-gray-600 dark:text-gray-400">{t('noResults')}</p>}
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">{results.map(topic => <li key={topic.id} className="py-5">
        <Link href={taskLink(topic)} className="block rounded focus-visible:outline-2 focus-visible:outline-primary">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{t(`categories.${topic.category}`)}</p>
          <h2 className="mb-2 text-lg font-semibold text-primary hover:underline">{t(`topics.${topic.id}.title`)}</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(`topics.${topic.id}.overview`)}</p>
        </Link>
      </li>)}</ul>
    </section> : <>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
        <span className="font-medium text-gray-500 dark:text-gray-400">{t('quickStart')}</span>
        <Link href="/download" className="text-primary hover:underline">{t('install')}</Link>
        <Link href="/help/create-account" className="text-primary hover:underline">{t('topics.account.title')}</Link>
        <Link href="/help/cannot-sign-in" className="text-primary hover:underline">{t('topics.loginFailed.title')}</Link>
      </div>
      <h2 className="mb-6 text-2xl font-semibold">{t('browseCategories')}</h2>
      <div className="grid items-start gap-5 md:grid-cols-2">
        {HELP_CATEGORIES.map(group)}
        <section className="rounded-2xl bg-primary/5 p-6 sm:p-7">
          <h3 className="mb-3 text-xl font-semibold">{t('supportTitle')}</h3>
          <Link href="/contact" className="inline-flex min-h-11 items-center text-primary hover:underline">{t('supportLink')}<span aria-hidden="true"><ChevronRightIcon className="ml-2 h-4 w-4" /></span></Link>
          <a href="#videos" className="mt-3 block text-sm text-gray-600 hover:text-primary dark:text-gray-400">{t('videosTitle')}</a>
        </section>
      </div>
    </>}
    {!query.trim() && <HelpVideoLibrary />}
  </>;
}
