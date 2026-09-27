import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sitemap from '../app/sitemap';
import { locales } from '../i18n/config';
import { routes } from '../lib/sitemap-routes.mjs';
import { getAllBlogPosts } from '../lib/blog';
import { getAllGuides } from '../lib/guides';
import { getAllNews, getNewsArchiveMonths } from '../lib/news';

const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostr-wot.com';
const url = (route: string, locale: string) => `${base}${locale === 'en' ? '' : `/${locale}`}${route}`;

test('every application page is covered or has an explicit dynamic-content policy', () => {
  const root = path.join(process.cwd(), 'app/[locale]');
  const dynamic = new Set([
    '/blog/[slug]', '/guides/[slug]', '/news/[slug]',
    '/news/archive/[year]/[month]', '/newsletters/[id]',
    // Relay-backed viewers have no finite, owned inventory of public IDs.
    '/profile/[pubkey]', '/notes/[id]',
  ]);
  const pages = fs.readdirSync(root, { recursive: true }).map(String)
    .filter(file => file === 'page.tsx' || file.endsWith('/page.tsx'))
    .map(file => file === 'page.tsx' ? '' : `/${file.slice(0, -'/page.tsx'.length)}`);
  assert.deepEqual(new Set(pages), new Set([...routes.map(route => route.path), ...dynamic]));
});

test('generated sitemap covers every published locale and contains only public canonical URLs', async () => {
  const entries = await sitemap();
  const actual = new Set(entries.map(entry => entry.url));
  const expected = new Set<string>();
  for (const locale of locales) {
    for (const route of routes) expected.add(url(route.path, locale));
    for (const [section, getAll] of Object.entries({ blog: getAllBlogPosts, guides: getAllGuides, news: getAllNews })) {
      for (const post of getAll(locale)) expected.add(url(`/${section}/${post.slug}`, locale));
    }
    for (let page = 2; page <= Math.ceil(getAllNews(locale).length / 12); page++) expected.add(url(`/news?page=${page}`, locale));
    for (const { year, month } of getNewsArchiveMonths(locale)) {
      expected.add(url(`/news/archive/${year}/${String(month).padStart(2, '0')}`, locale));
    }
  }
  // Sent newsletters are separately validated runtime records, not repository drafts.
  const { listSentNewsletters } = await import('../lib/newsletter-archive');
  for (const issue of await listSentNewsletters()) {
    for (const locale of Object.keys(issue.translations)) expected.add(url(`/newsletters/${issue.id}`, locale));
  }
  assert.deepEqual(actual, expected);
  assert.equal(actual.size, entries.length, 'no duplicate URLs');
  for (const entry of entries) {
    const parsed = new URL(entry.url);
    assert.ok(parsed.search === '' || (/\/news$/.test(parsed.pathname) && /^\?page=[2-9][0-9]*$/.test(parsed.search)));
    assert.equal(parsed.hash, '');
    if (entry.lastModified) assert.ok(Number.isFinite(new Date(entry.lastModified).getTime()));
    for (const alternate of Object.values(entry.alternates?.languages || {})) assert.ok(alternate && actual.has(alternate));
  }
});

test('locale-only publications are included and draft translations are excluded', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-content-'));
  try {
    for (const section of ['blog', 'guides', 'news']) {
      for (const [locale, slug, key, published, date] of [
        ['es', 'solo', 'solo', true, '2026-02-01'],
        ['en', 'shared', 'shared', true, '2026-01-01'],
        ['es', 'compartido', 'shared', true, '2026-02-02'],
        ['fr', 'brouillon', 'shared', false, '2026-02-03'],
      ]) {
        const dir = path.join(directory, 'content', section, String(locale));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `${slug}.mdx`), `---\ntitle: Test\ndate: ${date}\npublishedAt: ${date}\ntranslationKey: ${key}\npublished: ${published}\n---\nTest\n`);
      }
    }
    const script = `process.chdir(${JSON.stringify(directory)}); require(${JSON.stringify(path.resolve('app/sitemap.ts'))}).default().then(entries => console.log(JSON.stringify(entries)))`;
    const entries = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e', script], {
      env: { ...process.env, NODE_ENV: 'test', TSX_TSCONFIG_PATH: path.resolve('tsconfig.json'), NEWSLETTER_DATA_DIR: path.join(directory, 'newsletter') },
      encoding: 'utf8',
    }));
    for (const section of ['blog', 'guides', 'news']) {
      assert.ok(entries.some((entry: { url: string }) => entry.url === url(`/${section}/solo`, 'es')), `${section}: locale-only content missing`);
      assert.ok(!entries.some((entry: { url: string }) => entry.url === url(`/${section}/brouillon`, 'fr')), `${section}: draft leaked`);
      const translated = entries.find((entry: { url: string }) => entry.url === url(`/${section}/compartido`, 'es'));
      assert.equal(translated.lastModified, '2026-02-02T00:00:00.000Z');
      assert.deepEqual(translated.alternates.languages, { en: url(`/${section}/shared`, 'en'), es: url(`/${section}/compartido`, 'es') });
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
