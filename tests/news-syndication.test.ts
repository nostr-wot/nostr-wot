import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isNewsSitemapEligible,
  byPublishedAtDesc,
  feedItemContentHtml,
  NEWS_SITEMAP_WINDOW_MS,
} from '../lib/feeds';

const NOW = Date.parse('2026-08-21T12:00:00.000Z');
const hoursAgo = (h: number) => new Date(NOW - h * 60 * 60 * 1000).toISOString();

test('a recent non-backfilled post belongs in the Google News sitemap', () => {
  assert.equal(
    isNewsSitemapEligible({ publishedAt: hoursAgo(3), backfilled: false }, NOW),
    true
  );
});

test('a backfilled post is excluded even though it shipped minutes ago', () => {
  // The whole point of the fix: `publishedAt` is the real ship date, so a
  // retrofill batch passes the 48-hour window on the day it lands.
  assert.equal(
    isNewsSitemapEligible({ publishedAt: hoursAgo(0), backfilled: true }, NOW),
    false
  );
});

test('an old non-backfilled post still falls outside the 48-hour window', () => {
  assert.equal(
    isNewsSitemapEligible({ publishedAt: hoursAgo(49), backfilled: false }, NOW),
    false
  );
  assert.equal(
    isNewsSitemapEligible({ publishedAt: hoursAgo(47), backfilled: false }, NOW),
    true
  );
});

test('the window is exactly 48 hours', () => {
  assert.equal(NEWS_SITEMAP_WINDOW_MS, 48 * 60 * 60 * 1000);
  const edge = new Date(NOW - NEWS_SITEMAP_WINDOW_MS).toISOString();
  assert.equal(isNewsSitemapEligible({ publishedAt: edge, backfilled: false }, NOW), true);
});

test('an unparseable publishedAt is excluded rather than treated as fresh', () => {
  assert.equal(
    isNewsSitemapEligible({ publishedAt: 'not a date', backfilled: false }, NOW),
    false
  );
});

test('feed order follows publishedAt, not the event date', () => {
  const older = { publishedAt: '2026-01-10T00:00:00.000Z', backfilled: true };
  const newer = { publishedAt: '2026-08-20T00:00:00.000Z', backfilled: false };
  assert.deepEqual([older, newer].sort(byPublishedAtDesc), [newer, older]);
  assert.deepEqual([newer, older].sort(byPublishedAtDesc), [newer, older]);
});

test('feed item content carries the excerpt and the AI disclosure', () => {
  const html = feedItemContentHtml({
    excerpt: 'Something happened.',
    disclosure: 'Assembled automatically.',
  });
  assert.match(html, /<p>Something happened\.<\/p>/);
  assert.match(html, /Assembled automatically\./);
  assert.ok(!html.includes('<em>'), 'no archive notice on a non-backfilled entry');
});

test('a backfilled feed item also carries the archive notice', () => {
  const html = feedItemContentHtml({
    excerpt: 'Something happened.',
    backfilledLabel: 'Archive entry, written retrospectively.',
    disclosure: 'Assembled automatically.',
  });
  assert.match(html, /<em>Archive entry, written retrospectively\.<\/em>/);
  assert.match(html, /Assembled automatically\./);
});

test('feed item content escapes markup in the source text', () => {
  const html = feedItemContentHtml({
    excerpt: '<script>alert(1)</script> a & b',
    disclosure: 'x',
  });
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /a &amp; b/);
});
