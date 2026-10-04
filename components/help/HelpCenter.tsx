'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { HELP_CATEGORIES, HELP_TOPICS, matchesHelpQuery } from '@/lib/help-topics';
import { GUIDE_VIDEOS, youtubeUrls } from '@/lib/guide-media';

type GuideLink = { key: string; title: string; href: string };

export function HelpCenter({ guides }: { guides: GuideLink[] }) {
  const t = useTranslations('help');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const readHash = () => {
      const id = window.location.hash.slice(1);
      if (HELP_TOPICS.some(topic => topic.id === id)) {
        setOpen(id);
        setCategory('all');
        setQuery('');
      }
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const topics = HELP_TOPICS.filter(topic => (category === 'all' || topic.category === category) &&
    matchesHelpQuery(query, [t(`topics.${topic.id}.title`), t(`categories.${topic.category}`), ...t.raw(`topics.${topic.id}.steps`) as string[]].join(' ')));

  return <div className="grid gap-8 lg:grid-cols-[208px_minmax(0,1fr)]">
    <aside>
      <div className="lg:sticky lg:top-24">
        <nav aria-label={t('browse')} className="flex flex-wrap gap-2 lg:flex-col">
          {['all', ...HELP_CATEGORIES].map(key => <button key={key} type="button" onClick={() => setCategory(key)} aria-pressed={category === key}
            className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${category === key ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'}`}>
            {key === 'all' ? t('all') : t(`categories.${key}`)}
          </button>)}
        </nav>
        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800 space-y-3 text-sm">
          <Link href="/download" className="block text-primary hover:underline">{t('install')}</Link>
          <Link href="/guides" className="block text-gray-600 dark:text-gray-400 hover:text-primary">{t('guides')}</Link>
          <Link href="/docs" className="block text-gray-600 dark:text-gray-400 hover:text-primary">{t('developers')}</Link>
        </div>
      </div>
    </aside>
    <div className="min-w-0">
      <label className="sr-only" htmlFor="help-search">{t('search')}</label>
      <input id="help-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('search')}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900" />
      <p role="status" className="my-4 text-sm text-gray-500 dark:text-gray-400">{t('results', { count: topics.length })}</p>
      {topics.length === 0 && <div className="py-10">
        <p className="mb-4">{t('noResults')}</p>
        <button type="button" onClick={() => { setQuery(''); setCategory('all'); }} className="text-primary hover:underline">{t('clear')}</button>
      </div>}
      {HELP_CATEGORIES.map(group => {
        const items = topics.filter(topic => topic.category === group);
        if (!items.length) return null;
        return <section key={group} aria-labelledby={`category-${group}`} className="mb-10">
          <h2 id={`category-${group}`} className="mb-3 text-xl font-semibold">{t(`categories.${group}`)}</h2>
          <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {items.map(topic => {
              const expanded = open === topic.id;
              const video = GUIDE_VIDEOS[topic.id];
              const urls = youtubeUrls(video.id);
              const related = topic.guides.map(key => guides.find(guide => guide.key === key)).filter((guide): guide is GuideLink => !!guide);
              return <article key={topic.id} id={topic.id} className="scroll-mt-24">
                <h3>
                  <button type="button" aria-expanded={expanded} aria-controls={`task-${topic.id}`} onClick={() => {
                    setOpen(expanded ? null : topic.id);
                    window.history.replaceState(window.history.state, '', expanded ? window.location.pathname : `#${topic.id}`);
                  }} className="flex w-full items-center gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-primary">
                    <span className="min-w-0 flex-1 font-medium">{t(`topics.${topic.id}.title`)}</span>
                    <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">{topic.duration}</span>
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-5 w-5 shrink-0 text-primary transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                </h3>
                <div id={`task-${topic.id}`} hidden={!expanded} className="pb-8">
                  {expanded && <>
                    <ol className="list-decimal space-y-3 pl-5 leading-relaxed text-gray-600 dark:text-gray-300">
                      {(t.raw(`topics.${topic.id}.steps`) as string[]).map((step, index) => <li key={index} className="pl-1">{step}</li>)}
                    </ol>
                    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                      <iframe src={urls.embed} title={t(`topics.${topic.id}.title`)} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="aspect-video w-full border-0" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">{t('videoNote')}</p>
                      <a href={urls.watch} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('watch')}</a>
                    </div>
                    {related.length > 0 && <div className="mt-6 text-sm">
                      <p className="mb-2 font-medium">{t('more')}</p>
                      <ul className="space-y-2">{related.map(guide => <li key={guide.key}><Link href={guide.href} className="text-primary hover:underline">{guide.title}</Link></li>)}</ul>
                    </div>}
                  </>}
                </div>
              </article>;
            })}
          </div>
        </section>;
      })}
    </div>
  </div>;
}
