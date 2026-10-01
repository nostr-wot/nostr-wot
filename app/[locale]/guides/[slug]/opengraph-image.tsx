import { getGuide } from '@/lib/guides';
import { type Locale } from '@/i18n/config';
import { seoText } from '@/lib/metadata-policy';
import { socialArtForUrl } from '@/lib/social-art';
import { renderSocialImage } from '@/lib/social-image';

export const runtime = 'nodejs';
export const alt = 'Nostr WoT Guide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const guide = getGuide(slug, locale as Locale);
  const { title, description } = seoText(guide?.seoTitle || guide?.title || 'Nostr WoT Guide', guide?.seoDescription || guide?.excerpt || '', locale as Locale);
  return renderSocialImage(title, description, socialArtForUrl(`/guides/${guide?.translations.en || slug}`));
}
