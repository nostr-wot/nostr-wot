import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { FeaturedArtwork } from '@/components/illustrations/FeaturedArtwork';
import { generateAlternates } from '@/lib/metadata';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import type { Locale } from '@/i18n/config';
import UninstallForm from './UninstallForm';

async function pageMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('uninstall');
  return { title: t('title'), description: t('intro'), alternates: generateAlternates('/uninstall', locale as Locale) };
}
export const generateMetadata = withMetadataPolicy(pageMetadata);

export default async function UninstallPage() {
  const t = await getTranslations('uninstall');
  return (
    <main className="px-6 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <FeaturedArtwork art="community" priority className="mb-8" />
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t('title')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{t('intro')}</p>
        </header>
        <UninstallForm />
      </div>
    </main>
  );
}
