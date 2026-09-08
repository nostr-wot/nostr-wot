import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  listSentNewsletters, getSentNewsletter, validateSentNewsletter,
  type SentNewsletter,
} from '../lib/newsletter-archive';

const edition: SentNewsletter = {
  id: '2026-09-01-v1', version: 1, sentAt: '2026-09-01T10:00:00Z',
  coverageStart: '2026-08-25T00:00:00Z', coverageEnd: '2026-09-01T00:00:00Z',
  translations: { en: { subject: 'Sent issue', preheader: 'What happened', body: 'First paragraph.\n\nRead https://example.com/news.', sentAt: '2026-09-01T10:00:00Z' } },
};
async function withArchive(run: (directory: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), 'newsletter-archive-test-'));
  try { await run(directory); } finally { await rm(directory, { recursive: true, force: true }); }
}

test('absent archive is empty and reads discover new sent editions without caching', async () => withArchive(async directory => {
  assert.deepEqual(await listSentNewsletters(directory), []);
  assert.equal(await getSentNewsletter(edition.id, directory), null);
  await mkdir(join(directory, 'sent'));
  await writeFile(join(directory, 'sent', `${edition.id}.json`), JSON.stringify(edition));
  assert.deepEqual(await listSentNewsletters(directory), [edition]);
  assert.deepEqual(await getSentNewsletter(edition.id, directory), edition);
  assert.equal((await getSentNewsletter(edition.id, directory))?.translations.es, undefined);
}));

test('schema rejects draft fields, private metadata, unsupported locales and malformed evidence', () => {
  for (const value of [
    null, [], {}, { ...edition, status: 'draft' }, { ...edition, providerId: 'private' },
    { ...edition, subscriberCount: 42 }, { ...edition, version: 2 },
    { ...edition, id: '../secret-v1' }, { ...edition, id: '%2e%2e-v1' },
    { ...edition, sentAt: '2026-02-30T10:00:00Z' }, { ...edition, sentAt: '2999-01-01T00:00:00Z' },
    { ...edition, translations: {} }, { ...edition, translations: { xx: edition.translations.en } },
    { ...edition, translations: { en: { ...edition.translations.en, recipient: 'private@example.com' } } },
    { ...edition, translations: { en: { ...edition.translations.en, sentAt: undefined } } },
    { ...edition, translations: { en: { ...edition.translations.en, body: '' } } },
    { ...edition, coverageStart: '2026-09-02T00:00:00Z' },
  ]) assert.equal(validateSentNewsletter(value), null, JSON.stringify(value));
  assert.deepEqual(validateSentNewsletter(edition), edition);
  const dateCoverage = { ...edition, coverageStart: '2026-08-25', coverageEnd: '2026-09-01' };
  assert.deepEqual(validateSentNewsletter(dateCoverage), dateCoverage);
  assert.equal(validateSentNewsletter({ ...edition, coverageStart: '2026-02-30' }), null);
});

test('list ignores drafts, malformed JSON, filename mismatches, oversized files and symlinks', async () => withArchive(async directory => {
  const sent = join(directory, 'sent');
  await mkdir(sent);
  await mkdir(join(directory, 'drafts'));
  await writeFile(join(directory, 'drafts', `${edition.id}.json`), JSON.stringify(edition));
  await writeFile(join(sent, 'broken-v1.json'), '{broken');
  await writeFile(join(sent, 'mismatch-v1.json'), JSON.stringify(edition));
  await writeFile(join(sent, 'huge-v1.json'), ' '.repeat(1_048_577));
  await writeFile(join(directory, 'outside.json'), JSON.stringify(edition));
  await symlink(join(directory, 'outside.json'), join(sent, `${edition.id}.json`));
  assert.deepEqual(await listSentNewsletters(directory), []);
  assert.equal(await getSentNewsletter(edition.id, directory), null);
  for (const id of ['../outside', '%2e%2e', 'a/b-v1', 'a\\b-v1', '.', 'draft', 'a-v01']) assert.equal(await getSentNewsletter(id, directory), null);
}));

test('sent directory symlinks are never followed', async () => withArchive(async directory => {
  const outside = join(directory, 'outside');
  await mkdir(outside);
  await writeFile(join(outside, `${edition.id}.json`), JSON.stringify(edition));
  await symlink(outside, join(directory, 'sent'));
  assert.deepEqual(await listSentNewsletters(directory), []);
}));

test('full records are returned newest first, including all actually sent translations', async () => withArchive(async directory => {
  await mkdir(join(directory, 'sent'));
  const next = { ...edition, id: '2026-09-01-v2', version: 2, sentAt: '2026-09-02T10:00:00Z', translations: { en: edition.translations.en!, es: { ...edition.translations.en!, subject: 'Edición enviada' } } };
  for (const record of [edition, next]) await writeFile(join(directory, 'sent', `${record.id}.json`), JSON.stringify(record));
  assert.deepEqual(await listSentNewsletters(directory), [next, edition]);
}));

test('plain text preserves paragraphs and safely links HTTP URLs without executing markup', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { NewsletterBody } = await import('../components/newsletters/NewsletterArchive');
  const body = '<script>alert(1)</script>\n\nhttps://example.com/news.\njavascript:alert(1) https://user:secret@example.com/private';
  const html = renderToStaticMarkup(createElement(NewsletterBody, { body }));
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script|href="javascript:|href="https:\/\/user:/);
  assert.match(html, /href="https:\/\/example.com\/news"/);
  assert.equal((html.match(/<p /g) ?? []).length, 2);
  assert.match(html, /javascript:alert\(1\)/);
});

test('all seven UIs show an honest empty state and available same-edition language links', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { NewsletterEdition, NewsletterList } = await import('../components/newsletters/NewsletterArchive');
  const { newsletterCopy, newsletterPath, newsletterAlternates } = await import('../lib/newsletter-copy');
  const { locales } = await import('../i18n/config');
  for (const locale of locales) {
    const empty = renderToStaticMarkup(createElement(NewsletterList, { records: [], locale }));
    assert.ok(empty.includes(newsletterCopy[locale].empty));
    const html = renderToStaticMarkup(createElement(NewsletterEdition, { record: edition, locale }));
    assert.ok(html.includes(`href="${newsletterPath('en', edition.id)}"`));
    if (locale !== 'en') {
      assert.ok(html.includes(newsletterCopy[locale].unavailable));
      assert.ok(!html.includes(edition.translations.en!.body));
      assert.ok(!html.includes(edition.translations.en!.subject));
    }
  }
  const alternates = newsletterAlternates(edition, 'es');
  assert.equal(alternates.canonical, undefined);
  assert.deepEqual(Object.keys(alternates.languages), ['en', 'x-default']);
  assert.equal(newsletterAlternates({ ...edition, translations: { es: edition.translations.en! } }, 'es').languages['x-default'], undefined);
});

test('routes read the configured archive, mark absent languages noindex and reject invalid IDs', async () => withArchive(async directory => {
  const previous = process.env.NEWSLETTER_DATA_DIR;
  process.env.NEWSLETTER_DATA_DIR = directory;
  try {
    await mkdir(join(directory, 'sent'));
    await writeFile(join(directory, 'sent', `${edition.id}.json`), JSON.stringify(edition));
    assert.deepEqual(await listSentNewsletters(), [edition]);
    assert.deepEqual(await getSentNewsletter(edition.id), edition);
    const { generateMetadata, default: Page } = await import('../app/[locale]/newsletters/[id]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'es', id: edition.id }) });
    assert.deepEqual(metadata.robots, { index: false, follow: true });
    assert.deepEqual(Object.keys(metadata.alternates!.languages!), ['en', 'x-default']);
    const sentMetadata = await generateMetadata({ params: Promise.resolve({ locale: 'en', id: edition.id }) });
    assert.equal(sentMetadata.title, edition.translations.en!.subject);
    for (const params of [{ locale: 'en', id: '../secret' }, { locale: 'xx', id: edition.id }, { locale: 'en', id: 'missing-v1' }]) {
      await assert.rejects(Page({ params: Promise.resolve(params) }), /NEXT_HTTP_ERROR_FALLBACK;404/);
      await assert.rejects(generateMetadata({ params: Promise.resolve(params) }), /NEXT_HTTP_ERROR_FALLBACK;404/);
    }
  } finally {
    if (previous === undefined) delete process.env.NEWSLETTER_DATA_DIR;
    else process.env.NEWSLETTER_DATA_DIR = previous;
  }
}));

test('archive index metadata covers every supported UI locale without claiming sent content', async () => {
  const { generateMetadata } = await import('../app/[locale]/newsletters/page');
  const { locales } = await import('../i18n/config');
  const { newsletterCopy } = await import('../lib/newsletter-copy');
  for (const locale of locales) {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale }) });
    assert.equal(metadata.title, newsletterCopy[locale].title);
    assert.deepEqual(Object.keys(metadata.alternates!.languages!).sort(), [...locales, 'x-default'].sort());
  }
});
