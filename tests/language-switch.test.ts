import { test } from 'node:test';
import assert from 'node:assert/strict';
import { languageSwitchPath } from '../lib/language-switch';

test('switches articles to their translated slug or collection when absent', () => {
  assert.equal(languageSwitchPath('/guides/english-only', 'es', { en: 'english-only' }), '/guides');
  assert.equal(languageSwitchPath('/guides/getting-started', 'es', { es: 'primeros-pasos' }), '/guides/primeros-pasos');
  assert.equal(languageSwitchPath('/blog/post', 'fr', null), '/blog');
  assert.equal(languageSwitchPath('/news/2026-10-06/story', 'it', { it: '2026-10-07/storia' }), '/news/2026-10-07/storia');
  assert.equal(languageSwitchPath('/news/2026-10-06/story', 'ru', {}), '/news');
});

test('preserves non-article navigation even with stale article context', () => {
  for (const pathname of ['/news/archive/2026/10', '/news/archive', '/guides', '/projects/snort', '/']) {
    assert.equal(languageSwitchPath(pathname, 'es', { es: 'historia' }), pathname);
  }
});
