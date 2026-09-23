import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import ReadingTime from '../components/ui/ReadingTime';

function render(locale: string, value: string) {
  const ui = JSON.parse(readFileSync(new URL(`../messages/${locale}/ui.json`, import.meta.url), 'utf8'));
  return renderToStaticMarkup(createElement(NextIntlClientProvider, {
    locale, messages: { ui }, timeZone: 'UTC',
    children: createElement(ReadingTime, { value }),
  }));
}

test('cached reading-time estimates display in every supported locale', () => {
  for (const [locale, expected] of [
    ['en', '4 min read'], ['es', '4 min de lectura'], ['pt', '4 min de leitura'],
    ['de', '4 Min. Lesezeit'], ['fr', '4 min de lecture'], ['it', '4 min di lettura'],
    ['ru', '4 мин чтения'],
  ]) assert.equal(render(locale, '4 min read'), `<span>${expected}</span>`);
  assert.equal(render('es', '1 min read'), '<span>1 min de lectura</span>');
  assert.equal(render('es', '0 min read'), '<span>0 min de lectura</span>');
});

test('invalid cache labels never leak English or misleading reading-time metadata', () => {
  for (const value of ['', 'unknown', 'NaN min read', '-4 min read', '4junk min read', '9007199254740992 min read']) {
    assert.equal(render('es', value), '');
  }
});
