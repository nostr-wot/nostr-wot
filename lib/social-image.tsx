import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { SocialLogo } from '@/components/icons/SocialLogo';
import { type SocialArtId } from '@/lib/social-art';

/** Keep branding and translated copy separate from generated illustrations. */
export async function renderSocialImage(title: string, description: string, art: SocialArtId) {
  const artwork = await readFile(path.join(process.cwd(), 'public', 'images', 'illustrations', `${art}.jpg`));
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#f5f3ff', color: '#202035', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <div style={{ display: 'flex', position: 'absolute', width: 580, height: 326, right: 10, top: 195, overflow: 'hidden', borderRadius: 48 }}>
        <img src={`data:image/jpeg;base64,${artwork.toString('base64')}`} alt="" width={580} height={326} style={{ objectFit: 'contain' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', width: 650, padding: '48px 0 42px 55px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 31, fontWeight: 700, marginBottom: 36 }}><SocialLogo />Nostr WoT</div>
        <div style={{ display: 'flex', fontSize: 53, lineHeight: 1.08, fontWeight: 700, letterSpacing: '-1.5px', maxWidth: 555 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 22, lineHeight: 1.35, color: '#57556d', marginTop: 24, maxWidth: 485 }}>{description}</div>
        <div style={{ display: 'flex', fontSize: 18, color: '#6366f1', marginTop: 'auto', paddingTop: 20 }}>nostrwot.com</div>
      </div>
    </div>,
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400', 'X-Robots-Tag': 'noindex' } },
  );
}
