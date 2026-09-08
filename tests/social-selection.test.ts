import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectPending } from '../scripts/social/selection.mjs';

const entries = [
  { slug: 'old-story', date: '2026-09-01' },
  { slug: 'new-story', date: '2026-09-08' },
];

test('a targeted run cannot publish an older backlog item', () => {
  assert.deepEqual(selectPending(entries, {}, { slug: 'new-story' }), [entries[1]]);
});
test('an unknown target fails instead of falling back to the queue', () => {
  assert.throws(() => selectPending(entries, {}, { slug: 'typo' }), /Unknown social slug/);
});
test('a previously posted target is a no-op', () => {
  assert.deepEqual(selectPending(entries, { 'new-story': {} }, { slug: 'new-story' }), []);
});
test('a deployment selects only copy included in that deployment', () => {
  assert.deepEqual(selectPending(entries, {}, { deployedSlugs: ['new-story'] }), [entries[1]]);
});
test('a deployment with no social copy posts nothing', () => {
  assert.deepEqual(selectPending(entries, {}, { deployedSlugs: [] }), []);
});
test('scheduled runs prioritize the newest unposted article', () => {
  assert.deepEqual(selectPending(entries, {}), [entries[1], entries[0]]);
});
test('when the newest article was posted, the next newest is selected', () => {
  assert.deepEqual(selectPending(entries, { 'new-story': {} }), [entries[0]]);
});
test('publication date takes precedence over the event date for backfilled news', () => {
  const backfill = { slug: 'backfill', date: '2026-01-01', publishedAt: '2026-09-09' };
  assert.deepEqual(selectPending([...entries, backfill], {}), [backfill, entries[1], entries[0]]);
});
