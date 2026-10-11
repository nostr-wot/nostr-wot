import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllNews } from '../lib/news';
import { GET } from '../app/news-sitemap.xml/route';
import sitemap from '../app/sitemap';

test('news sitemap emits dated URLs and reciprocal language alternates', async (t) => {
  const newest = getAllNews('en')[0];
  t.mock.method(Date, 'now', () => new Date(newest.publishedAt).getTime() + 1000);
  const xml = await (await GET()).text();
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1]);
  assert.ok(urls.length > 0);
  for (const entry of urls) {
    assert.match(entry, /<loc>https:\/\/nostrwot.com\/(?:[a-z]{2}\/)?news\/\d{4}-\d{2}-\d{2}\/[^<]+<\/loc>/);
    const loc = entry.match(/<loc>(.*?)<\/loc>/)![1];
    assert.ok(entry.includes(`href="${loc}"`), 'alternates include self');
    assert.match(entry, /hreflang="en"/);
    assert.match(entry, /hreflang="es"/);
    assert.match(entry, /hreflang="x-default"/);
  }
});

test('archive sitemap uses dated news URLs and dated alternates', async () => {
  const entries = (await sitemap()).filter(entry => /\/news\//.test(entry.url) && !entry.url.includes('/archive/'));
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.match(entry.url, /\/news\/\d{4}-\d{2}-\d{2}\//);
    for (const url of Object.values(entry.alternates!.languages!)) assert.match(String(url), /\/news\/\d{4}-\d{2}-\d{2}\//);
  }
});

test('legacy links permanently redirect in the requested language and unknown slugs return 404', async () => {
  const { default: legacy } = await import('../app/[locale]/news/[date]/page');
  for (const [locale, slug, expected] of [
    ['en', 'nostr-wot-0-8-10-isolates-nonstandard-login-approvals', 'https://nostrwot.com/news/2026-10-02/nostr-wot-0-8-10-isolates-nonstandard-login-approvals'],
    ['es', 'nostr-wot-0-8-10-aisla-aprobaciones-de-inicio-no-estandar', 'https://nostrwot.com/es/news/2026-10-02/nostr-wot-0-8-10-aisla-aprobaciones-de-inicio-no-estandar'],
  ]) {
    await assert.rejects(legacy({ params: Promise.resolve({ locale, date: slug }) }), (error: any) => error.digest === `NEXT_REDIRECT;replace;${expected};308;`);
  }
  await assert.rejects(legacy({ params: Promise.resolve({ locale: 'en', date: 'missing-article' }) }), (error: any) => error.digest === 'NEXT_HTTP_ERROR_FALLBACK;404');
});

test('dated paths use first publication in UTC, not the event date', async () => {
  const { newsPath } = await import('../lib/news-path.mjs');
  assert.equal(newsPath({ slug: 'story', publishedAt: '2026-10-02T23:30:00-03:00' }), '/news/2026-10-03/story');
});
