import { notFound, permanentRedirect } from 'next/navigation';
import { getNewsPost } from '@/lib/news';
import { newsPath } from '@/lib/news-path.mjs';
import { getFullUrl } from '@/lib/metadata';
import type { Locale } from '@/i18n/config';

// The single segment is a legacy slug; dated articles have two segments.
export default async function LegacyNewsPage({ params }: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { locale, date: slug } = await params;
  const post = getNewsPost(slug, locale as Locale);
  if (!post?.published) notFound();
  permanentRedirect(getFullUrl(newsPath(post), locale as Locale));
}
