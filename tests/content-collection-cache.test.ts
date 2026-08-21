/**
 * Coverage for the `useCache: true` branch of createContentCollection.
 *
 * Production runs exclusively this branch (`useCache` defaults to
 * NODE_ENV === 'production'), while every other collection test exercises the
 * filesystem branch. The cache here is hand-built in memory and `contentDir`
 * deliberately points at a directory that does not exist, so any accidental
 * filesystem read would show up as an empty result rather than passing quietly.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createContentCollection } from '../lib/content/collection';
import type { CollectionCache, ContentDoc } from '../lib/content/types';

function doc(
  slug: string,
  over: Partial<ContentDoc> & Pick<ContentDoc, 'date' | 'tags' | 'translationKey'>
): ContentDoc {
  return {
    slug,
    title: over.title ?? slug,
    description: over.description ?? '',
    excerpt: over.excerpt ?? '',
    date: over.date,
    author: over.author ?? { name: 'Cache Author' },
    featuredImage: over.featuredImage ?? '/f.svg',
    previewImage: over.previewImage ?? '/p.svg',
    tags: over.tags,
    published: true,
    readingTime: '1 min read',
    locale: over.locale ?? 'en',
    translationKey: over.translationKey,
    availableLocales: over.availableLocales ?? ['en'],
    translations: over.translations ?? { en: slug },
    content: over.content ?? `${slug} body`,
  };
}

const cacheBeta = doc('cache-beta', {
  date: '2026-03-04T00:00:00.000Z',
  tags: ['two', 'shared'],
  translationKey: 'cb',
});

const cacheAlpha = doc('cache-alpha', {
  date: '2026-01-02T00:00:00.000Z',
  tags: ['one', 'shared'],
  translationKey: 'ca',
  availableLocales: ['en', 'es'],
  translations: { en: 'cache-alpha', es: 'cache-alfa' },
});

const cacheAlfa = doc('cache-alfa', {
  date: '2026-01-02T00:00:00.000Z',
  tags: ['uno', 'shared'],
  translationKey: 'ca',
  locale: 'es',
  availableLocales: ['en', 'es'],
  translations: { en: 'cache-alpha', es: 'cache-alfa' },
});

const CACHE: CollectionCache<ContentDoc> = {
  generatedAt: '2026-06-01T00:00:00.000Z',
  locales: {
    // Posts arrive pre-sorted by the generator; the cache branch must preserve
    // that order rather than re-sorting.
    en: {
      posts: [cacheBeta, cacheAlpha],
      // "precomputed-only" belongs to no post on purpose: it proves getAllTags
      // returns the generator's tag list verbatim instead of recomputing it.
      tags: ['one', 'precomputed-only', 'shared', 'two'],
    },
    es: { posts: [cacheAlfa], tags: ['shared', 'uno'] },
    // pt/ru/it/fr/de are absent entirely - the missing-locale case.
  },
};

const cached = createContentCollection<Record<string, never>>({
  name: 'cached-demo',
  contentDir: path.join(process.cwd(), 'tests', 'fixtures', 'content', '__does-not-exist__'),
  cache: CACHE as never,
  useCache: true,
  shape: {
    defaults: { featuredImage: '/f.svg', previewImage: '/p.svg', authorName: 'Cache Author' },
    includeAuthorSocials: true,
    parseExtra: () => ({}) as Record<string, never>,
  },
  sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
});

test('cache branch: getSlugs reads slugs from the cache in cache order', () => {
  assert.deepEqual(cached.getSlugs('en'), ['cache-beta', 'cache-alpha']);
  assert.deepEqual(cached.getSlugs('es'), ['cache-alfa']);
});

test('cache branch: getSlugs returns empty for a locale missing from the cache', () => {
  assert.deepEqual(cached.getSlugs('de'), []);
});

test('cache branch: getPost returns the cached document including content', () => {
  const post = cached.getPost('cache-alpha', 'en');
  assert.equal(post?.title, 'cache-alpha');
  assert.equal(post?.content, 'cache-alpha body');
  assert.deepEqual(post?.tags, ['one', 'shared']);
});

test('cache branch: getPost returns null for an unknown slug and for a missing locale', () => {
  assert.equal(cached.getPost('nope', 'en'), null);
  assert.equal(cached.getPost('cache-alpha', 'de'), null);
});

test('cache branch: getAll strips content and preserves the cached order', () => {
  const all = cached.getAll('en');
  assert.deepEqual(
    all.map((p) => p.slug),
    ['cache-beta', 'cache-alpha']
  );
  assert.ok(!('content' in all[0]));
});

test('cache branch: getAll returns empty for a locale missing from the cache', () => {
  assert.deepEqual(cached.getAll('de'), []);
});

test('cache branch: getAllTags returns the precomputed tag list verbatim', () => {
  assert.deepEqual(cached.getAllTags('en'), ['one', 'precomputed-only', 'shared', 'two']);
  assert.deepEqual(cached.getAllTags('es'), ['shared', 'uno']);
});

test('cache branch: getAllTags returns empty for a locale missing from the cache', () => {
  assert.deepEqual(cached.getAllTags('de'), []);
});

test('cache branch: getByTag filters cached posts case-insensitively', () => {
  assert.deepEqual(
    cached.getByTag('SHARED', 'en').map((p) => p.slug),
    ['cache-beta', 'cache-alpha']
  );
  assert.deepEqual(
    cached.getByTag('one', 'en').map((p) => p.slug),
    ['cache-alpha']
  );
  assert.deepEqual(cached.getByTag('precomputed-only', 'en'), []);
});

test('cache branch: getByTag returns empty for a locale missing from the cache', () => {
  assert.deepEqual(cached.getByTag('shared', 'de'), []);
});

test('cache branch: getRelated ranks cached posts by shared tags', () => {
  assert.deepEqual(
    cached.getRelated('cache-alpha', 3, 'en').map((p) => p.slug),
    ['cache-beta']
  );
  assert.deepEqual(cached.getRelated('nope', 3, 'en'), []);
});

test('cache branch: getRelated returns empty for a locale missing from the cache', () => {
  assert.deepEqual(cached.getRelated('cache-alpha', 3, 'de'), []);
});

test('cache branch: getTranslations resolves a translationKey across locales', () => {
  assert.deepEqual(cached.getTranslations('ca'), { en: 'cache-alpha', es: 'cache-alfa' });
  assert.deepEqual(cached.getTranslations('cb'), { en: 'cache-beta' });
  assert.deepEqual(cached.getAvailableLocales('ca').sort(), ['en', 'es']);
});

test('cache branch: getTranslations returns empty for an unknown key without throwing', () => {
  assert.deepEqual(cached.getTranslations('no-such-key'), {});
});

test('cache branch: an entirely empty cache returns empty, not a throw', () => {
  const empty = createContentCollection<Record<string, never>>({
    name: 'empty',
    contentDir: path.join(process.cwd(), 'tests', 'fixtures', 'content', '__does-not-exist__'),
    cache: { generatedAt: '', locales: {} } as never,
    useCache: true,
    shape: {
      defaults: { featuredImage: '/f.svg', previewImage: '/p.svg', authorName: 'Cache Author' },
      includeAuthorSocials: true,
      parseExtra: () => ({}) as Record<string, never>,
    },
    sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  });
  assert.deepEqual(empty.getSlugs('en'), []);
  assert.equal(empty.getPost('anything', 'en'), null);
  assert.deepEqual(empty.getAll('en'), []);
  assert.deepEqual(empty.getAllTags('en'), []);
  assert.deepEqual(empty.getByTag('shared', 'en'), []);
  assert.deepEqual(empty.getRelated('anything', 3, 'en'), []);
  assert.deepEqual(empty.getTranslations('ca'), {});
});
