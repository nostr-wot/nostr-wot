import test from 'node:test';
import assert from 'node:assert/strict';
import { loadNewsIndex, buildEntries } from '../scripts/social/entries.mjs';

test('guide social copy resolves the guide URL, never the news URL', () => {
  const {entries, errors} = buildEntries();
  assert.deepEqual(errors, []);
  const guide = entries.find((e: {slug: string}) => e.slug === 'custom-identity-paths');
  assert.equal(guide?.url, 'https://nostrwot.com/guides/custom-identity-paths');
});
test('default collection preserves existing news routing', () => {
  for (const entry of loadNewsIndex().values()) assert.match(entry.url, /^https:\/\/nostrwot.com\/news\//);
});
test('unrecognized collections cannot read arbitrary paths', () => {
  assert.throws(() => loadNewsIndex('../../'), /Unsupported social collection/);
});


test('only the exact verified community URL is allowed in social credits', async () => {
  const { hasUnapprovedLink } = await import('../scripts/social/checks.mjs');
  assert.equal(hasUnapprovedLink('La Crypta: https://lacrypta.ar/'), false);
  assert.equal(hasUnapprovedLink('{url} and {url:/guides/nwc-app-connections}'), false);
  for (const url of ['https://lacrypta.ar.evil.example/', 'https://lacrypta.ar/other', 'https://example.org/', 'https://nostrwot.com/blog/manual']) {
    assert.equal(hasUnapprovedLink(url), true, url);
  }
  assert.equal(hasUnapprovedLink('https://lacrypta.ar/ https://example.org/'), true);
});

test('archive lesson allows only its exact verified YouTube URL', async () => {
  const { hasUnapprovedLink, collectErrors } = await import('../scripts/social/checks.mjs');
  const { buildRequestPosts } = await import('../scripts/social/entries.mjs');
  assert.equal(hasUnapprovedLink('https://youtu.be/He4gz4occgY'), false);
  assert.equal(hasUnapprovedLink('https://youtu.be/e-E9u2UyL3E'), false);
  for (const url of ['https://youtu.be/another1234', 'https://youtu.be/He4gz4occgY?redirect=1', 'https://youtu.be.evil.example/He4gz4occgY']) assert.equal(hasUnapprovedLink(url), true);
  const { entries, errors } = collectErrors();
  assert.deepEqual(errors, []);
  const entry = entries.find((e: {slug: string}) => e.slug === 'account-archive');
  assert.ok(entry);
  const posts = buildRequestPosts(entry);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].channel, 'nostr-wot-li');
  assert.match(posts[0].text, /https:\/\/nostrwot\.com\/guides\/account-archive/);
  assert.match(posts[0].text, /https:\/\/youtu\.be\/He4gz4occgY/);
});
