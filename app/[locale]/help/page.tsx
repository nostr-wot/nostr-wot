import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { generateAlternates, generateOpenGraph, generateTwitter } from '@/lib/metadata';
import type { Locale } from '@/i18n/config';
import { JsonLd } from '@/lib/jsonld';
import { helpCollectionJsonLd, helpBreadcrumbJsonLd, type HelpArticleCopy } from '@/lib/help-jsonld';
import { Link } from '@/i18n/routing';
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
  return <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
    <JsonLd data={[helpCollectionJsonLd(locale as Locale, t('search'), t('description'), t.raw('topics') as Record<string, HelpArticleCopy>), helpBreadcrumbJsonLd(locale as Locale, t('title'))]} />
    <nav aria-label={t('breadcrumb')} className="mb-6 flex gap-2 text-sm text-gray-500 dark:text-gray-400"><Link href="/" className="hover:text-primary">Nostr WoT</Link><span aria-hidden="true">/</span><span aria-current="page">{t('title')}</span></nav>
    <header className="mx-auto mb-7 max-w-2xl text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t('search')}</h1>
      <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">{t('description')}</p>
    </header>
    <HelpCenter />
  </main>;
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
