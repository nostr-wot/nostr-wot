import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { locales, type Locale } from '@/i18n/config';
import { HELP_TOPICS, getHelpTopic, helpTopicHref } from '@/lib/help-topics';
import { getAllGuides } from '@/lib/guides';
import { generateAlternates, generateOpenGraph, generateTwitter } from '@/lib/metadata';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { HelpVideo } from '@/components/help/HelpVideo';
import { HelpScreenshots } from '@/components/help/HelpScreenshots';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { JsonLd } from '@/lib/jsonld';
import { helpArticleJsonLd, helpBreadcrumbJsonLd, type HelpArticleCopy } from '@/lib/help-jsonld';
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
  const description = t(`topics.${topic.id}.overview`);
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
  const copy = t.raw(`topics.${topic.id}`) as HelpArticleCopy;
  const sections = [{ id: 'before', label: t('beforeTitle'), level: 2 }, { id: 'steps', label: t('stepsTitle'), level: 2 }, { id: 'checks', label: t('checksTitle'), level: 2 }, ...(topic.screenshots?.length ? [{ id: 'screenshots', label: t('screenshotsTitle'), level: 2 }] : []), ...(topic.video ? [{ id: 'video', label: t('relatedVideo'), level: 2 }] : [])];
  const guides = getAllGuides(locale as Locale).filter(guide => topic.guides.includes(guide.translationKey));
  const related = HELP_TOPICS.filter(item => topic.related?.includes(item.id));
  return <main className="help-article mx-auto max-w-6xl px-6 py-10 sm:py-14">
    <JsonLd data={[helpArticleJsonLd(locale as Locale, topic, copy), helpBreadcrumbJsonLd(locale as Locale, t('title'), topic, copy.title)]} />
    <nav aria-label={t('breadcrumb')} className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Link href="/" className="hover:text-primary">Nostr WoT</Link><span aria-hidden="true">/</span><Link href="/help" className="hover:text-primary">{t('title')}</Link><span aria-hidden="true">/</span><span aria-current="page">{copy.title}</span>
    </nav>
    <Link href={q ? `/help?q=${encodeURIComponent(q)}` : '/help'} className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline"><span aria-hidden="true"><ArrowLeftIcon className="h-4 w-4" /></span>{t('backToHelp')}</Link>
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
      <article className="min-w-0 max-w-3xl">
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{t(`categories.${topic.category}`)}</p>
        <h1 className="mb-5 text-3xl font-bold sm:text-4xl">{t(`topics.${topic.id}.title`)}</h1>
        <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{copy.overview}</p>
        <nav aria-label={t('onThisPage')} className="mb-8 flex flex-wrap gap-x-4 gap-y-2 border-y border-gray-200 py-4 text-sm dark:border-gray-800 lg:hidden">
          {sections.map(section => <a key={section.id} href={`#${section.id}`} className="py-2 text-primary hover:underline">{section.label}</a>)}
        </nav>
        <section id="before" className="help-section mb-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-4 text-xl font-semibold">{t('beforeTitle')}</h2>
          <ul className="list-disc space-y-3 pl-5 leading-relaxed text-gray-700 dark:text-gray-300">{copy.before.map(item => <li key={item}>{item}</li>)}</ul>
        </section>
        <section id="steps" className="help-section mb-12">
          <h2 className="mb-6 text-2xl font-semibold">{t('stepsTitle')}</h2>
          <ol className="list-decimal space-y-6 pl-6 text-lg leading-relaxed text-gray-700 marker:font-semibold marker:text-primary dark:text-gray-300">
            {copy.steps.map((step, index) => <li id={`step-${index + 1}`} key={index} className="scroll-mt-24 pl-3">{step}</li>)}
          </ol>
        </section>
        <section id="checks" className="help-section mb-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <h2 className="mb-5 text-2xl font-semibold">{t('checksTitle')}</h2>
          <ul className="list-disc space-y-4 pl-5 leading-relaxed text-gray-700 marker:text-primary dark:text-gray-300">{copy.checks.map(item => <li key={item}>{item}</li>)}</ul>
        </section>
        {!!topic.screenshots?.length && <section id="screenshots" className="help-section mb-12 border-t border-gray-200 pt-8 dark:border-gray-800"><h2 className="mb-5 text-2xl font-semibold">{t('screenshotsTitle')}</h2><HelpScreenshots screenshots={topic.screenshots} /></section>}
        {topic.video && <section id="video" className="help-section mt-12 scroll-mt-24 border-t border-gray-200 pt-8 dark:border-gray-800"><h2 className="mb-5 text-xl font-semibold">{t('relatedVideo')}</h2><HelpVideo video={topic.video} /></section>}
      </article>
      <aside className="space-y-8 border-t border-gray-200 pt-8 dark:border-gray-800 lg:sticky lg:top-24 lg:border-t-0 lg:pt-0">
        <div className="hidden lg:block"><TableOfContents items={sections} title={t('onThisPage')} headingLevel={2} /></div>
        {related.length > 0 && <section><h2 className="mb-3 font-semibold">{t('relatedTasks')}</h2><ul className="space-y-3">{related.map(item => <li key={item.id}><Link href={`${helpTopicHref(item)}${q ? `?q=${encodeURIComponent(q)}` : ''}`} className="text-sm leading-relaxed text-primary hover:underline">{t(`topics.${item.id}.title`)}</Link></li>)}</ul></section>}
        {guides.length > 0 && <section><h2 className="mb-3 font-semibold">{t('more')}</h2><ul className="space-y-3">{guides.map(guide => <li key={guide.slug}><Link href={`/guides/${guide.slug}`} className="text-sm leading-relaxed text-primary hover:underline">{guide.title}</Link></li>)}</ul></section>}
        <section><h2 className="mb-3 font-semibold">{t('supportTitle')}</h2><Link href="/contact" className="text-sm text-primary hover:underline">{t('supportLink')}</Link></section>
      </aside>
    </div>
  </main>;
}
