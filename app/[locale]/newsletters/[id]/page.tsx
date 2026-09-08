import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSentNewsletter } from '@/lib/newsletter-archive';
import { isNewsletterLocale, newsletterAlternates, newsletterCopy } from '@/lib/newsletter-copy';
import { generateOpenGraph, generateTwitter } from '@/lib/metadata';
import { NewsletterEdition } from '@/components/newsletters/NewsletterArchive';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isNewsletterLocale(locale)) notFound();
  const record = await getSentNewsletter(id);
  if (!record) notFound();
  const translation = record.translations[locale];
  const alternates = newsletterAlternates(record, locale);
  if (!translation) return {
    title: `${newsletterCopy[locale].edition} ${id}`,
    description: newsletterCopy[locale].unavailable,
    robots: { index: false, follow: true },
    alternates,
  };
  return {
    title: translation.subject,
    description: translation.preheader,
    alternates,
    openGraph: {
      ...generateOpenGraph({ title: translation.subject, description: translation.preheader, path: `/newsletters/${id}`, locale, type: 'article' }),
      type: 'article', publishedTime: translation.sentAt,
    },
    twitter: generateTwitter({ title: translation.subject, description: translation.preheader }),
  };
}

export default async function NewsletterPage({ params }: Props) {
  const { locale, id } = await params;
  if (!isNewsletterLocale(locale)) notFound();
  const record = await getSentNewsletter(id);
  if (!record) notFound();
  return <main><NewsletterEdition record={record} locale={locale} /></main>;
}
