import { test } from 'node:test';
import { readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { GUIDE_ART_IDS, GUIDE_ART_ALIASES, isSocialArtId, socialArtForUrl } from '../lib/social-art';
import { normalizeMetadata } from '../lib/metadata-policy';
import { getAllGuides } from '../lib/guides';
import { locales } from '../i18n/config';

test('every English guide has an explicit illustration or a shared-art mapping', () => {
  const slugs = readdirSync('content/guides/en').filter(file => file.endsWith('.mdx')).map(file => file.slice(0, -4)).sort();
  assert.deepEqual([...GUIDE_ART_IDS, ...Object.keys(GUIDE_ART_ALIASES)].sort(), slugs);
  for (const art of Object.values(GUIDE_ART_ALIASES)) assert.equal(isSocialArtId(art), true);
  assert.equal(new Set(GUIDE_ART_IDS).size, GUIDE_ART_IDS.length);
});

test('only known illustration identifiers are accepted', () => {
  for (const id of GUIDE_ART_IDS) assert.equal(isSocialArtId(id), true);
  for (const id of ['../secret', 'https://example.com/image.jpg', '', 'HOME', null]) assert.equal(isSocialArtId(id), false);
});

test('main pages and locale prefixes select meaningful artwork', () => {
  const examples = { '/': 'home', '/features': 'extension', '/download': 'extension', '/about': 'community', '/oracle': 'oracle', '/widgets': 'developers', '/projects': 'community', '/playground': 'wot-playground', '/pqc': 'post-quantum-key', '/pqc/chat': 'post-quantum-key', '/guides': 'guides', '/blog': 'editorial', '/news': 'editorial', '/newsletters': 'editorial', '/docs': 'developers', '/docs/getting-started': 'developers', '/docs/sdk': 'developers', '/docs/extension': 'extension', '/docs/oracle': 'oracle', '/docs/lnbits-proxy': 'lnbits-wallet-setup', '/media-kit': 'home', '/contact': 'community', '/privacy': 'privacy', '/terms': 'privacy', '/pitch': 'home' };
  for (const locale of locales) for (const [route, art] of Object.entries(examples)) {
    assert.equal(socialArtForUrl(`https://nostrwot.com/${locale}${route}`), art);
  }
});

test('translated guide metadata resolves original English artwork without changing localized text', () => {
  for (const locale of locales) for (const guide of getAllGuides(locale)) {
    const english = guide.translations.en;
    assert.ok(english, `${locale}/${guide.slug} has English translation`);
    const art = GUIDE_ART_ALIASES[english!] ?? english;
    assert.equal(isSocialArtId(art), true, english);
    const result = normalizeMetadata({ title: guide.seoTitle || guide.title, description: guide.seoDescription || guide.excerpt, alternates: { canonical: `https://nostrwot.com/${locale}/guides/${guide.slug}`, languages: { en: `https://nostrwot.com/guides/${english}` } } }, locale) as any;
    const preview = new URL(result.openGraph.images[0].url);
    assert.equal(preview.searchParams.get('art'), art);
    assert.equal(preview.searchParams.get('locale'), locale);
    assert.equal(preview.searchParams.get('title'), result.title.absolute);
    assert.equal(result.twitter.images[0].url, result.openGraph.images[0].url);
  }
});
