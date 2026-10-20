import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import {Card} from '@/components/ui';

type Topic = {id:string; href:string; title:string; intro:string};

/** One full-card link, with matching pointer and keyboard feedback. */
export async function DocTopicCards({topics}:{topics:Topic[]}) {
  const t = await getTranslations('docs');
  return <div className="not-prose grid gap-3 sm:grid-cols-2">
    {topics.map(topic => <Link key={topic.id} href={topic.href} className="group block rounded-xl transition-transform duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-reduce:transition-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 dark:focus-visible:ring-offset-gray-950">
      <Card padding="sm" className="h-full transition-colors duration-150 group-hover:border-primary group-hover:bg-primary/5 group-focus-visible:border-primary">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug text-gray-900 group-hover:text-primary dark:text-white">{t(topic.title)}</h3>
          <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform motion-reduce:transition-none group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(topic.intro)}</p>
      </Card>
    </Link>)}
  </div>;
}
