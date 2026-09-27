import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSiteInput } from '../scripts/ci-site-changed.mjs';

test('site changes build while documentation, tests and social-only changes use fast checks', () => {
  for (const file of ['README.md', 'docs/seo-validation.md', 'tests/sitemap.test.ts', 'social/story.json', 'data/social-posted.json']) assert.equal(isSiteInput(file), false, file);
  for (const file of ['content/news/en/story.mdx', 'content/guides/en/guide.md', 'app/[locale]/page.tsx', 'messages/es/news.json', 'public/image.png', 'newsletters/2026-09-28/en.json', 'scripts/newsletters/send.mjs', '.github/workflows/deploy.yml', 'package-lock.json']) assert.equal(isSiteInput(file), true, file);
  assert.equal(['README.md', 'app/sitemap.ts'].some(isSiteInput), true);
});
