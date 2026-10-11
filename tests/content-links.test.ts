import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveContentLink } from '../lib/content-links';

test('resolves English authored slugs to published localized article routes', () => {
  assert.equal(resolveContentLink('/guides/understanding-wot', 'es'), '/es/guides/entendiendo-web-of-trust');
  assert.equal(resolveContentLink('/guides/lightning-address#setup', 'ru'), '/ru/guides/lightning-adres#setup');
});

test('leaves explicit locales, external links and relative references to the caller', () => {
 for (const href of ['/it/news/2026-10-06/story', 'https://example.com/42.md', '//example.com', '#section', './42.md']) assert.equal(resolveContentLink(href, 'es'), null);
});

test('uses the English article when a translation is missing', () => {
  assert.equal(resolveContentLink('/guides/post-quantum-key?from=guide#setup', 'es'), '/guides/post-quantum-key?from=guide#setup');
});

 test('widgets introduction resolves to every published translation', () => {
  const slugs = { en: 'introducing-widgets', es: 'presentamos-los-widgets', pt: 'apresentando-os-widgets', ru: 'predstavlyaem-vidzhety', it: 'presentazione-dei-widget', fr: 'presentation-des-widgets', de: 'vorstellung-der-widgets' } as const;
  for (const [locale, slug] of Object.entries(slugs)) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    assert.equal(resolveContentLink('/blog/introducing-widgets', locale as keyof typeof slugs), `${prefix}/blog/${slug}`);
  }
});
