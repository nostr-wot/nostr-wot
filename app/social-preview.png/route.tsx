import { ImageResponse } from 'next/og';
import { seoText } from '@/lib/metadata-policy';
import { locales, type Locale } from '@/i18n/config';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const requestedLocale = params.get('locale') as Locale;
  const locale = locales.includes(requestedLocale) ? requestedLocale : 'en';
  const { title, description } = seoText(
    (params.get('title') || 'Nostr WoT').slice(0, 500),
    (params.get('description') || '').slice(0, 1000), locale,
  );
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 80px', background: 'linear-gradient(135deg, #1e1b4b, #0f172a)', color: '#fafafa', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', color: '#c4b5fd', fontSize: 26, marginBottom: 32 }}>Nostr WoT</div>
      <div style={{ display: 'flex', fontSize: 54, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
      <div style={{ display: 'flex', fontSize: 26, lineHeight: 1.4, color: '#cbd5e1', marginTop: 28 }}>{description}</div>
      <div style={{ display: 'flex', fontSize: 21, marginTop: 36, color: '#a78bfa' }}>nostr-wot.com</div>
    </div>,
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400', 'X-Robots-Tag': 'noindex' } },
  );
}
