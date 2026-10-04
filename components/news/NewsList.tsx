'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { NewsCard, type NewsCardMeta } from './NewsCard';
import { PAGE_SIZE } from '@/lib/news-pagination';

export function NewsList({ posts, featured }: { posts: NewsCardMeta[]; featured: boolean }) {
  const t = useTranslations('news');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = posts.slice(0, visibleCount);
  const lead = featured ? visible[0] : undefined;
  const remaining = lead ? visible.slice(5) : visible;

  return <>
    {lead && <section aria-labelledby="featured-news-heading" className="mb-10">
      <h2 id="featured-news-heading" className="mb-6 border-b border-gray-300 pb-3 text-lg font-bold dark:border-gray-700">{t('layout.featured')}</h2>
      <div className="grid gap-6 md:grid-cols-[1.15fr_1fr]">
        <NewsCard post={lead} variant="lead" />
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {visible.slice(1, 5).map(post => <NewsCard key={post.slug} post={post} variant="compact" />)}
        </div>
      </div>
    </section>}
    {remaining.length > 0 && <section aria-labelledby="more-news-heading">
      <h2 id="more-news-heading" className="mb-3 border-b border-gray-300 pb-3 text-lg font-bold dark:border-gray-700">{t('layout.more')}</h2>
      <div className="grid gap-x-6 sm:grid-cols-2">
        {remaining.map(post => <div key={post.slug} className="border-b border-gray-200 dark:border-gray-800"><NewsCard post={post} variant="compact" /></div>)}
      </div>
    </section>}
    {visibleCount < posts.length && <div className="mt-8 text-center">
      <button type="button" onClick={() => setVisibleCount(count => count + PAGE_SIZE)} className="btn btn-primary">{t('showMore')}</button>
    </div>}
  </>;
}
