import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDocument } from '../lib/content/build.ts';

const BLOG_SHAPE = {
  defaults: {
    featuredImage: '/images/blog/default-featured.svg',
    previewImage: '/images/blog/default-preview.svg',
    authorName: 'Nostr WoT Team',
  },
  includeAuthorSocials: true,
  parseExtra: () => ({}),
};

const GUIDES_SHAPE = {
  defaults: {
    featuredImage: '/images/guides/default-featured.svg',
    previewImage: '/images/guides/default-preview.svg',
    authorName: 'Nostr WoT Team',
  },
  includeAuthorSocials: false,
  parseExtra: (data: Record<string, any>) => ({
    difficulty: data.difficulty || 'beginner',
    order: data.order || 99,
  }),
};

test('applies blog image defaults when frontmatter omits them', () => {
  const doc = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'body',
    translations: { en: 'x' }, shape: BLOG_SHAPE,
  });
  assert.equal(doc.featuredImage, '/images/blog/default-featured.svg');
  assert.equal(doc.previewImage, '/images/blog/default-preview.svg');
});

test('previewImage falls back to featuredImage before its own default', () => {
  const doc = buildDocument({
    slug: 'x', locale: 'en', data: { featuredImage: '/custom.png' }, content: 'body',
    translations: { en: 'x' }, shape: BLOG_SHAPE,
  });
  assert.equal(doc.previewImage, '/custom.png');
});

test('blog author includes socials key, guides author does not', () => {
  const blog = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'b',
    translations: { en: 'x' }, shape: BLOG_SHAPE,
  });
  const guide = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'b',
    translations: { en: 'x' }, shape: GUIDES_SHAPE,
  });
  assert.ok('socials' in blog.author);
  assert.ok(!('socials' in guide.author));
});

test('guides extras default and sit between ogImage and content', () => {
  const guide = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'b',
    translations: { en: 'x' }, shape: GUIDES_SHAPE,
  }) as any;
  assert.equal(guide.difficulty, 'beginner');
  assert.equal(guide.order, 99);
  const keys = Object.keys(guide);
  assert.deepEqual(
    keys.slice(keys.indexOf('ogImage')),
    ['ogImage', 'difficulty', 'order', 'content']
  );
});

test('key order matches the legacy generator exactly', () => {
  const doc = buildDocument({
    slug: 'x', locale: 'en', data: {}, content: 'b',
    translations: { en: 'x' }, shape: BLOG_SHAPE,
  });
  assert.deepEqual(Object.keys(doc), [
    'slug', 'title', 'description', 'excerpt', 'date', 'author',
    'featuredImage', 'previewImage', 'tags', 'published', 'readingTime',
    'locale', 'translationKey', 'translations', 'availableLocales',
    'seoTitle', 'seoDescription', 'ogImage', 'content',
  ]);
});

test('published is true unless explicitly false', () => {
  const shape = BLOG_SHAPE;
  const base = { slug: 'x', locale: 'en' as const, content: 'b', translations: { en: 'x' }, shape };
  assert.equal(buildDocument({ ...base, data: {} }).published, true);
  assert.equal(buildDocument({ ...base, data: { published: true } }).published, true);
  assert.equal(buildDocument({ ...base, data: { published: false } }).published, false);
});

test('translationKey falls back to slug', () => {
  const doc = buildDocument({
    slug: 'my-slug', locale: 'en', data: {}, content: 'b',
    translations: {}, shape: BLOG_SHAPE,
  });
  assert.equal(doc.translationKey, 'my-slug');
});
