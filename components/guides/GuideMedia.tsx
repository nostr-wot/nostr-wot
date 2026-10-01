import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { GUIDE_MEDIA, GUIDE_VIDEOS, youtubeUrls } from '@/lib/guide-media';

/** Shared across all translations; captures show a disposable demo account. */
export async function GuideMedia({ guideKey }: { guideKey: string }) {
  const media = GUIDE_MEDIA[guideKey];
  if (!media) return null;
  const t = await getTranslations('guides.media');

  return (
    <div className="mt-12 space-y-12">
      {media.screenshots.length > 0 && (
        <section aria-label={t('screenshots')}>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('screenshots')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('screenshotNote')}</p>
          <div className="grid sm:grid-cols-2 gap-6 items-start">
            {media.screenshots.map((id) => (
              <figure key={id} className="min-w-0">
                <a href={`/images/guides/extension/${id}.png`} target="_blank" rel="noopener noreferrer" aria-label={`${t('openImage')}: ${t(`captions.${id}`)}`}>
                  <Image
                    src={`/images/guides/extension/${id}.png`}
                    alt={t(`captions.${id}`)}
                    width={760}
                    height={1200}
                    sizes="(max-width: 640px) 90vw, 320px"
                    className="w-full max-w-80 h-auto mx-auto rounded-xl border border-gray-200 dark:border-gray-800"
                  />
                </a>
                <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400">{t(`captions.${id}`)}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      {media.videos && media.videos.length > 0 && (
        <section aria-label={t('videos')}>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('videos')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('videoNote')}</p>
          <div className="space-y-8">
            {media.videos.map((key) => {
              const video = GUIDE_VIDEOS[key];
              const urls = youtubeUrls(video.id);
              return (
                <figure key={key}>
                  <iframe
                    src={urls.embed}
                    title={video.title}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="aspect-video w-full rounded-xl border-0"
                  />
                  <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="block mb-1" lang="en">{video.title}</span>
                    <a href={urls.watch} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('watchOnYoutube')}</a>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
