import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const locales = ['en', 'es', 'de', 'fr', 'it', 'pt', 'ru'];
const root = join(process.cwd(), 'messages');
function flatten(value: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) =>
    typeof entry === 'string' ? [[prefix + key, entry]] : Object.entries(flatten(entry as Record<string, unknown>, `${prefix}${key}.`))));
}
const read = (locale: string, file: string) => flatten(JSON.parse(readFileSync(join(root, locale, file), 'utf8')));
for (const file of readdirSync(join(root, 'en')).filter(file => file.endsWith('.json'))) {
  test(`${file}: all locales preserve message keys, interpolation arguments and rich-text tags`, () => {
    const english = read('en', file);
    const argumentsOf = (value: string) => [...new Set([...value.matchAll(/\{(\w+)\s*[,}]/g)].map(match => match[1]))].sort();
    for (const locale of locales.slice(1)) {
      const messages = read(locale, file);
      assert.deepEqual(Object.keys(messages).sort(), Object.keys(english).sort(), locale);
      for (const [key, value] of Object.entries(english)) {
        assert.deepEqual(argumentsOf(messages[key]), argumentsOf(value), `${locale}/${file}:${key}`);
        const tags = (text: string) => [...new Set([...text.matchAll(/<([a-zA-Z]\w*)>/g)].map(match => match[1]))].sort();
        // Pitch emphasis can move between title lines to follow local word order.
        if (file !== "pitch.json") assert.deepEqual(tags(messages[key]), tags(value), `${locale}/${file}:${key} rich-text tags`);
      }
    }
  });
}
for (const file of ['home.json', 'download.json']) {
  test(`${file}: visitor copy is translated, with explicit exceptions for product names and URLs`, () => {
    const allowed = new Set([
      'wallet.features.nwc.title', 'developers.oracle.title', 'developers.sdk.badge', 'developers.sdk.title',
      'playground.notice.chromeStoreUrl',
    ]);
    const english = read('en', file);
    for (const locale of locales.slice(1)) {
      const messages = read(locale, file);
      for (const [key, value] of Object.entries(english)) {
        if (!value || allowed.has(key) || /^browsers\.[^.]+\.(name|description)$/.test(key)) continue;
        assert.notEqual(messages[key], value, `${locale}/${file}:${key} still contains English`);
      }
    }
  });
}

test('every message renders without ICU or rich-text errors in every language', async () => {
  const { createTranslator } = await import('next-intl');
  for (const locale of locales) {
    for (const file of readdirSync(join(root, locale)).filter(file => file.endsWith('.json'))) {
      const messages = read(locale, file);
      for (const [key, value] of Object.entries(messages)) {
        const values: Record<string, any> = {};
        for (const match of value.matchAll(/\{(\w+)\s*[,}]/g)) values[match[1]] = 2;
        for (const match of value.matchAll(/<([a-zA-Z]\w*)>/g)) values[match[1]] = (chunks: unknown) => chunks;
        const t = createTranslator({ locale, messages: { message: value }, onError(error) { throw new Error(`${locale}/${file}:${key}: ${error.message}`); } });
        t.rich('message', values);
      }
    }
  }
});
