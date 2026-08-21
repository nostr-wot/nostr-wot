import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newsArticleJsonLd,
  breadcrumbJsonLd,
  itemListJsonLd,
  collectionPageJsonLd,
} from '../lib/jsonld';

const base = {
  headline: 'ML-DSA lands in a client',
  description: 'Excerpt here',
  image: '/images/news/default-featured.svg',
  url: 'https://nostr-wot.com/news/2026-08-21-ml-dsa',
  eventDate: '2026-08-21T00:00:00.000Z',
  publishedAt: '2026-08-25T00:00:00.000Z',
  tags: ['Nostr', 'PQC'],
  sources: [{ title: 'Release notes', url: 'https://example.com/r' }],
};

test('datePublished uses publishedAt, never the event date', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.equal(ld.datePublished, '2026-08-25T00:00:00.000Z');
  assert.notEqual(ld.datePublished, base.eventDate);
});

test('dateModified falls back to publishedAt when never revised', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.equal(ld.dateModified, '2026-08-25T00:00:00.000Z');
});

test('dateModified uses updated when present', () => {
  const ld = newsArticleJsonLd({ ...base, updated: '2026-09-01T00:00:00.000Z' }) as any;
  assert.equal(ld.dateModified, '2026-09-01T00:00:00.000Z');
});

test('type is NewsArticle and author is an Organization, never a Person', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.equal(ld['@type'], 'NewsArticle');
  assert.equal(ld.author['@type'], 'Organization');
  assert.notEqual(ld.author['@type'], 'Person');
});

test('sources become citation entries', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.equal(ld.citation.length, 1);
  assert.equal(ld.citation[0].url, 'https://example.com/r');
});

test('digest items become an ItemList with positions starting at 1', () => {
  const ld = itemListJsonLd([
    { title: 'a', url: 'https://x/1', summary: 's' },
    { title: 'b', url: 'https://x/2', summary: 's' },
  ]) as any;
  assert.equal(ld['@type'], 'ItemList');
  assert.equal(ld.itemListElement[0].position, 1);
  assert.equal(ld.itemListElement[1].position, 2);
  assert.equal(ld.itemListElement[1].url, 'https://x/2');
});

test('breadcrumbs number sequentially from 1', () => {
  const ld = breadcrumbJsonLd([
    { name: 'Home', url: 'https://nostr-wot.com' },
    { name: 'News', url: 'https://nostr-wot.com/news' },
  ]) as any;
  assert.deepEqual(ld.itemListElement.map((i: any) => i.position), [1, 2]);
});

test('collection page carries its url and name', () => {
  const ld = collectionPageJsonLd({ name: 'News', description: 'd', url: 'https://nostr-wot.com/news' }) as any;
  assert.equal(ld['@type'], 'CollectionPage');
  assert.equal(ld.url, 'https://nostr-wot.com/news');
});

test('relative images are absolutised', () => {
  const ld = newsArticleJsonLd(base) as any;
  assert.ok(String(ld.image).startsWith('https://'), `expected absolute, got ${ld.image}`);
});
