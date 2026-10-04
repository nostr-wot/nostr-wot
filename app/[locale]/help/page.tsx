import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { generateAlternates, generateOpenGraph, generateTwitter } from '@/lib/metadata';
import { getAllGuides } from '@/lib/guides';
import type { Locale } from '@/i18n/config';
import { HelpVideoLibrary } from '@/components/help/HelpVideoLibrary';
import { HelpCenter } from '@/components/help/HelpCenter';

type Props = { params: Promise<{ locale: string }> };

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help' });
  const title = t('title');
  const description = t('description');
  return { title, description, alternates: generateAlternates('/help', locale as Locale),
    openGraph: generateOpenGraph({ title, description, path: '/help', locale: locale as Locale }),
    twitter: generateTwitter({ title, description }) };
}

export default async function HelpPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('help');
  const guides = getAllGuides(locale as Locale).map(guide => ({ key: guide.translationKey, title: guide.title, href: `/guides/${guide.slug}` }));
  return <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
    <header className="mb-10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t('title')}</h1>
      <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">{t('description')}</p>
    </header>
    <HelpCenter guides={guides} />
    <HelpVideoLibrary />
  </main>;
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
