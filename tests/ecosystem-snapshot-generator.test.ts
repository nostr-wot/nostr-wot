import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { repoSlug, toDate, pickReleases } from '../scripts/generate-ecosystem-snapshot.mjs';

const OUT = new URL('../lib/generated/ecosystem-snapshot.json', import.meta.url);

test('repoSlug extracts owner/repo and rejects anything else', () => {
  assert.equal(repoSlug('https://github.com/v0l/snort'), 'v0l/snort');
  assert.equal(repoSlug('https://github.com/v0l/snort/'), 'v0l/snort');
  assert.equal(repoSlug('https://github.com/v0l/snort.git'), 'v0l/snort');
  for (const bad of ['https://gitlab.com/a/b', 'https://github.com/onlyowner', 'not a url', '']) {
    assert.equal(repoSlug(bad), null, bad);
  }
});

test('toDate narrows an API timestamp to a calendar date', () => {
  assert.equal(toDate('2026-09-30T11:22:33Z'), '2026-09-30');
  for (const bad of [null, undefined, 42, {}]) assert.equal(toDate(bad), null);
});

test('importing the generator runs nothing and touches no network or disk', async () => {
  // The script is importable so its pure functions can be tested. The
  // entry-point guard is what keeps an import from firing 82 API requests.
  const before = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  await import('../scripts/generate-ecosystem-snapshot.mjs');
  const after = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  assert.equal(after, before, 'importing the generator rewrote the snapshot');
});

test('pickReleases drops drafts, keeps and flags prereleases, sorts newest first and caps', () => {
  const input = [
    { tag_name: 'v3', published_at: '2026-01-03T00:00:00Z', html_url: 'https://e.com/3', draft: false, prerelease: false },
    { tag_name: 'draft', published_at: '2026-01-09T00:00:00Z', html_url: 'https://e.com/d', draft: true, prerelease: false },
    { tag_name: 'v4-rc', published_at: '2026-01-04T00:00:00Z', html_url: 'https://e.com/4', draft: false, prerelease: true },
    { tag_name: 'v1', published_at: '2026-01-01T00:00:00Z', html_url: 'https://e.com/1', draft: false, prerelease: false },
    { tag_name: 'broken', published_at: null, html_url: 'https://e.com/b', draft: false, prerelease: false },
  ];
  assert.deepEqual(pickReleases(input, 2), [
    { tag: 'v4-rc', date: '2026-01-04', url: 'https://e.com/4', prerelease: true },
    { tag: 'v3', date: '2026-01-03', url: 'https://e.com/3', prerelease: false },
  ]);
  assert.deepEqual(pickReleases([]), []);
});
