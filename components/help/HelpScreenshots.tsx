import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

/** Real demo captures; full-size links work without JavaScript. */
export async function HelpScreenshots({ screenshots }: { screenshots: string[] }) {
  const t = await getTranslations('guides.media');
  return <>
    <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t('screenshotNote')}</p>
    <div className="grid items-start gap-8 sm:grid-cols-2">
      {screenshots.map(id => <figure key={id}>
        <a href={`/images/guides/extension/${id}.png`} target="_blank" rel="noopener noreferrer" aria-label={`${t('openImage')}: ${t(`captions.${id}`)}`} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <Image src={`/images/guides/extension/${id}.png`} alt={t(`captions.${id}`)} width={760} height={1200} sizes="(max-width:640px) 85vw, 320px" className="mx-auto h-auto w-full max-w-80 rounded-xl border border-gray-200 transition-transform duration-200 hover:scale-[1.015] motion-reduce:transform-none dark:border-gray-800" />
        </a>
        <figcaption className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(`captions.${id}`)}</figcaption>
      </figure>)}
    </div>
  </>;
}
