import type {ReactNode} from 'react';
import Image from 'next/image';
import Breadcrumbs, {type Crumb} from '@/components/ui/Breadcrumbs';

/** Shared reading layout for blog articles and guides. */
export function ArticleLayout({crumbs, breadcrumbLabel, image, title, sidebar, children}: {
  crumbs: Crumb[];
  breadcrumbLabel: string;
  image: string;
  title: string;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return <>
    <div className="mx-auto max-w-5xl px-6 pt-4 pb-6">
      <Breadcrumbs items={crumbs} label={breadcrumbLabel}/>
    </div>
    <article>
      <div className="mx-auto max-w-5xl px-6 mb-10">
        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden">
          <Image src={image} alt={title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px"/>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-10 px-6 pb-16 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
        <div className="min-w-0">{children}</div>
        <aside className="min-w-0">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-24">
            {sidebar}
          </div>
        </aside>
      </div>
    </article>
  </>;
}
