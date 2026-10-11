import { seoText } from '@/lib/metadata-policy';
import { locales, type Locale } from '@/i18n/config';
import { isSocialArtId } from '@/lib/social-art';
import { renderSocialImage } from '@/lib/social-image';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const requestedLocale = params.get('locale') as Locale;
  const locale = locales.includes(requestedLocale) ? requestedLocale : 'en';
  const { title, description } = seoText(
    (params.get('title') || 'Nostr WoT').slice(0, 500),
    (params.get('description') || '').slice(0, 1000), locale,
  );
  const art = params.get('art');
  return renderSocialImage(title, description, isSocialArtId(art) ? art : 'home');
}
