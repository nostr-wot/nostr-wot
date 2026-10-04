'use client';

import { useTranslations } from 'next-intl';
import { GUIDE_VIDEOS, youtubeUrls, type GuideVideo } from '@/lib/guide-media';

/** Only mounted after someone chooses to watch a tutorial. */
export function HelpVideo({ video }: { video: GuideVideo }) {
  const t = useTranslations('help');
  const source = GUIDE_VIDEOS[video];
  const urls = youtubeUrls(source.id);
  return <div className="space-y-3">
    <iframe src={urls.embed} title={source.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="aspect-video w-full rounded-xl border-0" />
    <div className="flex flex-wrap justify-between gap-3 text-sm">
      <p className="text-gray-500 dark:text-gray-400">{t('videoNote')}</p>
      <a href={urls.watch} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('watch')}</a>
    </div>
  </div>;
}
