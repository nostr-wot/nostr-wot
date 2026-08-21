/**
 * The news integrity rule, enforced at the mapper.
 *
 * `date` is the EVENT date: it drives the slug, the displayed date, sort order
 * and archive bucketing. `publishedAt` is the REAL ship date and is the only
 * value permitted to appear as `datePublished` in structured data.
 *
 * For a normally-published post the two coincide, so `publishedAt` may be
 * omitted and falls back to `date`. For a BACKFILLED post they deliberately
 * differ by months, and the same fallback would silently make the article claim
 * it shipped on the day the event happened. That case must fail loudly.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newsShape } from '../lib/content/shapes';
import { buildDocument } from '../lib/content/build';

const backfilledNoPublishedAt = {
  title: 'ML-DSA lands in a client',
  translationKey: '2026-03-11-ml-dsa-lands-in-a-client',
  date: '2026-03-11',
  backfilled: true,
};

test('a backfilled entry with no publishedAt is rejected', () => {
  assert.throws(
    () => newsShape.parseExtra(backfilledNoPublishedAt),
    (err: Error) => {
      // The message has to be actionable: it must name the offender and say
      // what to add, not just report that something is wrong.
      assert.match(err.message, /2026-03-11-ml-dsa-lands-in-a-client/);
      assert.match(err.message, /backfilled/);
      assert.match(err.message, /publishedAt/);
      return true;
    }
  );
});

test('the rejection names the title when there is no translationKey', () => {
  const { translationKey: _omitted, ...noKey } = backfilledNoPublishedAt;
  assert.throws(
    () => newsShape.parseExtra(noKey),
    (err: Error) => {
      assert.match(err.message, /ML-DSA lands in a client/);
      return true;
    }
  );
});

test('an empty-string publishedAt counts as absent for a backfilled entry', () => {
  assert.throws(() => newsShape.parseExtra({ ...backfilledNoPublishedAt, publishedAt: '' }), Error);
});

test('a NON-backfilled entry with no publishedAt is fine and falls back to date', () => {
  const extra = newsShape.parseExtra({
    title: 'Routine story',
    translationKey: '2026-03-11-routine-story',
    date: '2026-03-11',
  });
  assert.equal(extra.backfilled, false);
  assert.equal(extra.publishedAt, new Date('2026-03-11').toISOString());
});

test('an explicitly non-backfilled entry with no publishedAt is also fine', () => {
  const extra = newsShape.parseExtra({ date: '2026-03-11', backfilled: false });
  assert.equal(extra.publishedAt, new Date('2026-03-11').toISOString());
});

test('a backfilled entry WITH publishedAt keeps the two dates distinct', () => {
  const extra = newsShape.parseExtra({ ...backfilledNoPublishedAt, publishedAt: '2026-08-21' });
  assert.equal(extra.backfilled, true);
  assert.equal(extra.publishedAt, new Date('2026-08-21').toISOString());
  assert.notEqual(extra.publishedAt, new Date('2026-03-11').toISOString());
});

// The guard has to bite on the real mapping path, not only when parseExtra is
// called directly, or a bad file would still make it into the cache.
test('the guard fires through the real document mapper', () => {
  assert.throws(
    () =>
      buildDocument({
        slug: '2026-03-11-ml-dsa-lands-in-a-client',
        locale: 'en',
        data: backfilledNoPublishedAt,
        content: 'Body.',
        translations: { en: '2026-03-11-ml-dsa-lands-in-a-client' },
        shape: newsShape,
      }),
    /publishedAt/
  );
});

test('the real document mapper still builds a backfilled entry that declares publishedAt', () => {
  const doc = buildDocument({
    slug: '2026-03-11-ml-dsa-lands-in-a-client',
    locale: 'en',
    data: { ...backfilledNoPublishedAt, publishedAt: '2026-08-21' },
    content: 'Body.',
    translations: { en: '2026-03-11-ml-dsa-lands-in-a-client' },
    shape: newsShape,
  });
  assert.equal(doc.date, new Date('2026-03-11').toISOString());
  assert.equal(doc.publishedAt, new Date('2026-08-21').toISOString());
});
