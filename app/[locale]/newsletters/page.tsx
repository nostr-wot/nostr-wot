import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listSentNewsletters } from '@/lib/newsletter-archive';
import { isNewsletterLocale, newsletterCopy } from '@/lib/newsletter-copy';
import { generateAlternates, generateOpenGraph, generateTwitter } from '@/lib/metadata';
import { NewsletterSection } from '@/components/layout/NewsletterSection';
import { NewsletterList } from '@/components/newsletters/NewsletterArchive';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isNewsletterLocale(locale)) notFound();
  const { title, description } = newsletterCopy[locale];
  return {
    title, description,
    alternates: generateAlternates('/newsletters', locale),
    openGraph: generateOpenGraph({ title, description, path: '/newsletters', locale }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function NewslettersPage({ params }: Props) {
  const { locale } = await params;
  if (!isNewsletterLocale(locale)) notFound();
  const copy = newsletterCopy[locale];
  const records = await listSentNewsletters();
  return <main lang={locale} className="mx-auto max-w-5xl px-6 py-16">
    <header className="mb-10 max-w-3xl">
      <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{copy.description}</p>
    </header>
    <NewsletterList records={records} locale={locale} />
    <NewsletterSection />
  </main>;
}
