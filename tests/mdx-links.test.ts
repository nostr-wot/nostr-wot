import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLocaleNeutralPath } from '../lib/mdx-links';

test('only locale-neutral absolute site paths go through locale navigation', () => {
  for (const href of ['/guides', '/blog/hello', '/news?tag=Security']) {
    assert.equal(isLocaleNeutralPath(href), true, href);
  }
  for (const href of ['/it/news/2026-10-06/story', '/en/guides', '/ru', '/es?x=1', '/de#top', 'https://github.com/nostr-protocol/nips/blob/master/42.md', '//example.com/a', 'mailto:hello@example.com', '#references', '?page=2', './42.md']) {
    assert.equal(isLocaleNeutralPath(href), false, href);
  }
});
