import { getTranslations } from 'next-intl/server';
import { renderSocialImage } from '@/lib/social-image';

export const runtime = 'nodejs';
export const alt = 'Nostr WoT';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pitch.slide0' });
  const plain = (value: string) => value.replace(/<[^>]+>/g, '');
  return renderSocialImage(`${plain(t.raw('titleLine1'))} ${plain(t.raw('titleLine2'))}`, t('subtitle'), 'home');
}
