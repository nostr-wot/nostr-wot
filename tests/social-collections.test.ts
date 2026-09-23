import test from 'node:test';
import assert from 'node:assert/strict';
import { loadNewsIndex, buildEntries } from '../scripts/social/entries.mjs';

test('guide social copy resolves the guide URL, never the news URL', () => {
  const {entries, errors} = buildEntries();
  assert.deepEqual(errors, []);
  const guide = entries.find((e: {slug: string}) => e.slug === 'custom-identity-paths');
  assert.equal(guide?.url, 'https://nostr-wot.com/guides/custom-identity-paths');
});
test('default collection preserves existing news routing', () => {
  for (const entry of loadNewsIndex().values()) assert.match(entry.url, /^https:\/\/nostr-wot.com\/news\//);
});
test('unrecognized collections cannot read arbitrary paths', () => {
  assert.throws(() => loadNewsIndex('../../'), /Unsupported social collection/);
});


test('only the exact verified community URL is allowed in social credits', async () => {
  const { hasUnapprovedLink } = await import('../scripts/social/checks.mjs');
  assert.equal(hasUnapprovedLink('La Crypta: https://lacrypta.ar/'), false);
  assert.equal(hasUnapprovedLink('{url} and {url:/guides/nwc-app-connections}'), false);
  for (const url of ['https://lacrypta.ar.evil.example/', 'https://lacrypta.ar/other', 'https://example.org/', 'https://nostr-wot.com/blog/manual']) {
    assert.equal(hasUnapprovedLink(url), true, url);
  }
  assert.equal(hasUnapprovedLink('https://lacrypta.ar/ https://example.org/'), true);
});
