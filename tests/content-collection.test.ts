import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createContentCollection } from '../lib/content/collection.ts';

const demo = createContentCollection({
  name: 'demo',
  contentDir: path.join(process.cwd(), 'tests', 'fixtures', 'content', 'demo'),
  cache: { generatedAt: '', locales: {} } as any,
  useCache: false,
  shape: {
    defaults: {
      featuredImage: '/f.svg',
      previewImage: '/p.svg',
      authorName: 'Nostr WoT Team',
    },
    includeAuthorSocials: true,
    parseExtra: () => ({}),
  },
  sort: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
});

test('getSlugs lists every file including unpublished', () => {
  assert.deepEqual(demo.getSlugs('en').sort(), ['alpha', 'beta', 'draft']);
});

test('getAll excludes unpublished and sorts by date descending', () => {
  const posts = demo.getAll('en');
  assert.deepEqual(posts.map((p) => p.slug), ['beta', 'alpha']);
});

test('getPost returns null for a missing slug', () => {
  assert.equal(demo.getPost('nope', 'en'), null);
});

test('getPost resolves cross-locale translations by translationKey', () => {
  const post = demo.getPost('alpha', 'en');
  assert.equal(post?.translations.es, 'alfa');
  assert.deepEqual(post?.availableLocales.sort(), ['en', 'es']);
});

test('getAllTags returns sorted unique tags for published posts only', () => {
  assert.deepEqual(demo.getAllTags('en'), ['one', 'shared', 'two']);
});

test('getByTag is case-insensitive', () => {
  assert.deepEqual(demo.getByTag('SHARED', 'en').map((p) => p.slug), ['beta', 'alpha']);
});

test('getRelated ranks by shared tags and excludes the current post', () => {
  const related = demo.getRelated('alpha', 3, 'en');
  assert.deepEqual(related.map((p) => p.slug), ['beta']);
});

test('getRelated returns empty for an unknown slug', () => {
  assert.deepEqual(demo.getRelated('nope', 3, 'en'), []);
});
