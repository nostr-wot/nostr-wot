import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateOpenGraph } from '../lib/metadata';

test('preview fallback is an actual landscape PNG, not a mislabelled square icon', () => {
  const result = generateOpenGraph({ title: 'News', description: 'Nostr updates', path: '/news', locale: 'en' }) as any;
  assert.notEqual(result.images[0].url, 'https://nostr-wot.com/icon-512.png');
  assert.equal(result.images[0].type, 'image/png');
});

import { normalizeMetadata, seoText } from '../lib/metadata-policy';
import { locales } from '../i18n/config';
import { getAllBlogPosts } from '../lib/blog';
import { getAllGuides } from '../lib/guides';
import { getAllNews } from '../lib/news';

function within(value: string, min: number, max: number) {
  assert.ok(Array.from(value).length >= min && Array.from(value).length <= max, `${Array.from(value).length}: ${value}`);
}

test('strict editorial bounds hold for every locale, short copy and external long tokens', () => {
  for (const locale of locales) {
    for (const value of ['', 'News', 'a'.repeat(500), '🦋'.repeat(200), 'word '.repeat(100)]) {
      const result = seoText(value, value, locale);
      within(result.title, 45, 57);
      within(result.description, 145, 157);
      assert.deepEqual(seoText(result.title, result.description, locale), result, 'normalizing twice is stable');
    }
  }
});

test('every published article has compliant search and social text', () => {
  for (const locale of locales) {
    for (const getAll of [getAllBlogPosts, getAllGuides, getAllNews]) {
      for (const post of getAll(locale)) {
        const meta = normalizeMetadata({ title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt }, locale) as any;
        within(meta.title.absolute, 45, 57);
        within(meta.description, 145, 157);
        assert.equal(meta.openGraph.title, meta.title.absolute);
        assert.equal(meta.twitter.description, meta.description);
        assert.equal(meta.openGraph.images[0].url, meta.twitter.images[0].url);
      }
    }
  }
});

test('metadata normalization preserves article dates, noindex and canonical URLs', () => {
  const result = normalizeMetadata({
    title: 'Newsletter', description: 'Edition', robots: { index: false },
    alternates: { canonical: 'https://nostr-wot.com/es/newsletters/example-v1' },
    openGraph: { type: 'article', publishedTime: '2026-09-01T00:00:00Z' },
  }, 'es') as any;
  assert.equal(result.openGraph.type, 'article');
  assert.equal(result.openGraph.publishedTime, '2026-09-01T00:00:00Z');
  assert.equal(result.openGraph.url, result.alternates.canonical);
  assert.deepEqual(result.robots, { index: false });
});
