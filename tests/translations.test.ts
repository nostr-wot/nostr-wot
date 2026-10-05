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
    // A `*Plural` object holds one noun form per CLDR plural category, selected
    // at runtime by lib/plural.ts. Its KEYS are a property of the language, not
    // of the message: Russian needs `few` and `many` where English needs
    // neither. So the parity check below compares the map's existence, and the
    // separate test under it checks each map's categories against the locale.
    const pluralCategory = /^(zero|one|two|few|many|other)$/;
    const isPluralForm = (key: string) => {
      const parts = key.split('.');
      return parts.length > 1 && parts[parts.length - 2].endsWith('Plural')
        && pluralCategory.test(parts[parts.length - 1]);
    };
    // Collapse `a.rolesPlural.few` to `a.rolesPlural` so a locale that omits
    // the whole map still fails, while its choice of categories does not.
    const comparable = (keys: string[]) => [...new Set(keys.map(key =>
      isPluralForm(key) ? key.split('.').slice(0, -1).join('.') : key))].sort();
    for (const locale of locales.slice(1)) {
      const messages = read(locale, file);
      assert.deepEqual(comparable(Object.keys(messages)), comparable(Object.keys(english)), locale);
      for (const [key, value] of Object.entries(english)) {
        if (isPluralForm(key)) continue;
        assert.deepEqual(argumentsOf(messages[key]), argumentsOf(value), `${locale}/${file}:${key}`);
        const tags = (text: string) => [...new Set([...text.matchAll(/<([a-zA-Z]\w*)>/g)].map(match => match[1]))].sort();
        // Pitch emphasis can move between title lines to follow local word order.
        if (file !== "pitch.json") assert.deepEqual(tags(messages[key]), tags(value), `${locale}/${file}:${key} rich-text tags`);
      }
    }
  });
}
test('every plural-form map covers its locale and no invalid category', () => {
  const pluralCategory = /^(zero|one|two|few|many|other)$/;
  for (const locale of locales) {
    const valid = new Set<string>(new Intl.PluralRules(locale).resolvedOptions().pluralCategories);
    for (const file of readdirSync(join(root, locale)).filter(file => file.endsWith('.json'))) {
      const maps = new Map<string, string[]>();
      for (const key of Object.keys(read(locale, file))) {
        const parts = key.split('.');
        const category = parts[parts.length - 1];
        if (parts.length < 2 || !parts[parts.length - 2].endsWith('Plural') || !pluralCategory.test(category)) continue;
        const prefix = parts.slice(0, -1).join('.');
        maps.set(prefix, [...(maps.get(prefix) ?? []), category]);
      }
      for (const [prefix, categories] of maps) {
        // `other` is what lib/plural.ts falls back to, so a map without it can
        // return undefined and render "undefined" into a sentence.
        assert.ok(categories.includes('other'), `${locale}/${file}:${prefix} has no 'other' form`);
        for (const category of categories) {
          assert.ok(valid.has(category),
            `${locale}/${file}:${prefix}.${category} is not a plural category in ${locale} (it has ${[...valid].sort().join(', ')}), so it can never be selected`);
        }
      }
    }
  }
});

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
