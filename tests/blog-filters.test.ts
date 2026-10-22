import test from 'node:test';
import assert from 'node:assert/strict';
import { blogFilterUrl, matchesBlogTopics, visibleBlogTopics } from '../lib/blog-filters';

test('topic URLs preserve multiple tags, special characters and keyword search', () => {
  const url = new URL(blogFilterUrl(['Keys, seeds', 'NIP-07', 'NIP-07'], '  wallet & keys  '), 'https://example.com');
  assert.deepEqual(url.searchParams.getAll('tag'), ['Keys, seeds', 'NIP-07']);
  assert.equal(url.searchParams.get('q'), 'wallet & keys');
  assert.equal(blogFilterUrl([]), '/blog');
  assert.equal(blogFilterUrl(['Wallet'], 'keys', 'guides'), '/guides?q=keys&tag=Wallet');
});

test('compact topics keep selected search results visible after clearing or changing search', () => {
  const tags = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  assert.equal(visibleBlogTopics(tags, [], '').length, 6);
  assert.deepEqual(visibleBlogTopics(tags, ['h'], 'b'), ['h', 'b']);
  assert.equal(visibleBlogTopics(tags, ['h'], '')[0], 'h');
  assert.deepEqual(visibleBlogTopics(tags, [], 'missing'), []);
});

test('multiple topics match any selected topic and support old single-tag links', () => {
  assert.equal(matchesBlogTopics(['Wallet'], []), true);
  assert.equal(matchesBlogTopics(['Wallet'], ['wallet', 'Keys']), true);
  assert.equal(matchesBlogTopics(['Wallet'], ['Keys']), false);
});
