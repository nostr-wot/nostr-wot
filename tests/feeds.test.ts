import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml, toRfc822, absoluteUrl } from '../lib/feeds';

test('escapes the five XML entities', () => {
  assert.equal(escapeXml('a & b'), 'a &amp; b');
  assert.equal(escapeXml('<tag>'), '&lt;tag&gt;');
  assert.equal(escapeXml(`it's "quoted"`), 'it&apos;s &quot;quoted&quot;');
});

test('escapes ampersand first so entities are not double-escaped', () => {
  assert.equal(escapeXml('&lt;'), '&amp;lt;');
});

test('handles empty and undefined input without throwing', () => {
  assert.equal(escapeXml(''), '');
  assert.equal(escapeXml(undefined as unknown as string), '');
});

test('produces an RFC 822 date RSS readers accept', () => {
  const out = toRfc822('2026-08-21T00:00:00.000Z');
  assert.match(out, /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
  assert.match(out, /21 Aug 2026/);
});

test('absoluteUrl leaves absolute URLs alone and prefixes relative ones', () => {
  assert.equal(absoluteUrl('https://x/y'), 'https://x/y');
  assert.ok(absoluteUrl('/images/a.svg').startsWith('https://'));
});
