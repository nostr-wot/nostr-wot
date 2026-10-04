'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HELP_VIDEOS } from '@/lib/help-topics';
import { GUIDE_VIDEOS, type GuideVideo } from '@/lib/guide-media';
import { HelpVideo } from './HelpVideo';

export function HelpVideoLibrary() {
  const t = useTranslations('help');
  const [playing, setPlaying] = useState<GuideVideo | null>(null);
  return <section id="videos" aria-labelledby="videos-title" className="mt-16 scroll-mt-24 border-t border-gray-200 pt-10 dark:border-gray-800">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h2 id="videos-title" className="mb-2 text-2xl font-semibold">{t('videosTitle')}</h2><p className="text-gray-600 dark:text-gray-400">{t('videosDescription')}</p></div>
      <a href="https://www.youtube.com/@nostr-wot" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{t('channel')}</a>
    </div>
    <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {HELP_VIDEOS.map(video => <article key={video.id} className="min-w-0">
        <button type="button" aria-expanded={playing === video.id} aria-controls={`video-${video.id}`} onClick={() => setPlaying(playing === video.id ? null : video.id)} className="group w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <div className="relative mb-3 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900">
            {/* Public YouTube thumbnails; no player or autoplay until selected. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${GUIDE_VIDEOS[video.id].id}/mqdefault.jpg`} alt="" width="320" height="180" loading="lazy" className="aspect-video w-full object-cover transition-opacity group-hover:opacity-80" />
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">{video.duration}</span>
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center"><svg viewBox="0 0 24 24" className="h-10 w-10 rounded-full bg-black/60 p-2 text-white" fill="currentColor"><path d="m9 5 11 7-11 7z" /></svg></span>
          </div>
          <h3 className="font-medium group-hover:text-primary">{t(`topics.${video.id}.title`)}</h3>
        </button>
        <div id={`video-${video.id}`} hidden={playing !== video.id} className="mt-4">{playing === video.id && <HelpVideo video={video.id} />}</div>
      </article>)}
    </div>
  </section>;
}
