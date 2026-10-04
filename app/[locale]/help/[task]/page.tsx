import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { locales, type Locale } from '@/i18n/config';
import { HELP_TOPICS, getHelpTopic, helpTopicHref } from '@/lib/help-topics';
import { getAllGuides } from '@/lib/guides';
import { generateAlternates, generateOpenGraph, generateTwitter } from '@/lib/metadata';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { HelpVideo } from '@/components/help/HelpVideo';
import { ArrowLeftIcon } from '@/components/icons';

type Props = { params: Promise<{ locale: string; task: string }>; searchParams: Promise<{ q?: string }> };
export function generateStaticParams() {
  return locales.flatMap(locale => HELP_TOPICS.map(topic => ({ locale, task: topic.slug })));
}
async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale, task } = await params;
  const topic = getHelpTopic(task);
  if (!topic) notFound();
  const t = await getTranslations({ locale, namespace: 'help' });
  const title = t(`topics.${topic.id}.title`);
  const description = (t.raw(`topics.${topic.id}.steps`) as string[])[0];
  const path = helpTopicHref(topic);
  return { title, description, alternates: generateAlternates(path, locale as Locale), openGraph: generateOpenGraph({ title, description, path, locale: locale as Locale }), twitter: generateTwitter({ title, description }) };
}
export const generateMetadata = withMetadataPolicy(pageMetadata);

export default async function HelpTaskPage({ params, searchParams }: Props) {
  const { locale, task } = await params;
  const topic = getHelpTopic(task);
  if (!topic) notFound();
  const { q } = await searchParams;
  const t = await getTranslations('help');
  const media = await getTranslations('guides.media');
  const guides = getAllGuides(locale as Locale).filter(guide => topic.guides.includes(guide.translationKey));
  const related = HELP_TOPICS.filter(item => topic.related?.includes(item.id));
  return <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
    <Link href={q ? `/help?q=${encodeURIComponent(q)}` : '/help'} className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline"><span aria-hidden="true"><ArrowLeftIcon className="h-4 w-4" /></span>{t('backToHelp')}</Link>
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
      <article className="min-w-0 max-w-3xl">
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{t(`categories.${topic.category}`)}</p>
        <h1 className="mb-10 text-3xl font-bold sm:text-4xl">{t(`topics.${topic.id}.title`)}</h1>
        <h2 className="sr-only">{t('stepsTitle')}</h2>
        <ol className="list-decimal space-y-6 pl-6 text-lg leading-relaxed text-gray-700 marker:font-semibold marker:text-primary dark:text-gray-300">
          {(t.raw(`topics.${topic.id}.steps`) as string[]).map((step, index) => <li key={index} className="pl-3">{step}</li>)}
        </ol>
        {topic.screenshot && <figure className="mt-10">
          <a href={`/images/guides/extension/${topic.screenshot}.png`} target="_blank" rel="noopener noreferrer" aria-label={`${media('openImage')}: ${media(`captions.${topic.screenshot}`)}`}>
            <Image src={`/images/guides/extension/${topic.screenshot}.png`} alt={media(`captions.${topic.screenshot}`)} width={760} height={1200} sizes="(max-width:640px) 80vw, 320px" className="mx-auto h-auto w-full max-w-80 rounded-xl border border-gray-200 dark:border-gray-800" />
          </a>
          <figcaption className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{media('screenshotNote')}</figcaption>
        </figure>}
        {topic.video && <section id="video" className="mt-12 scroll-mt-24 border-t border-gray-200 pt-8 dark:border-gray-800"><h2 className="mb-5 text-xl font-semibold">{t('relatedVideo')}</h2><HelpVideo video={topic.video} /></section>}
      </article>
      <aside className="space-y-8 border-t border-gray-200 pt-8 dark:border-gray-800 lg:sticky lg:top-24 lg:border-t-0 lg:pt-0">
        {related.length > 0 && <section><h2 className="mb-3 font-semibold">{t('relatedTasks')}</h2><ul className="space-y-3">{related.map(item => <li key={item.id}><Link href={`${helpTopicHref(item)}${q ? `?q=${encodeURIComponent(q)}` : ''}`} className="text-sm leading-relaxed text-primary hover:underline">{t(`topics.${item.id}.title`)}</Link></li>)}</ul></section>}
        {guides.length > 0 && <section><h2 className="mb-3 font-semibold">{t('more')}</h2><ul className="space-y-3">{guides.map(guide => <li key={guide.slug}><Link href={`/guides/${guide.slug}`} className="text-sm leading-relaxed text-primary hover:underline">{guide.title}</Link></li>)}</ul></section>}
        <section><h2 className="mb-3 font-semibold">{t('supportTitle')}</h2><Link href="/contact" className="text-sm text-primary hover:underline">{t('supportLink')}</Link></section>
      </aside>
    </div>
  </main>;
}
