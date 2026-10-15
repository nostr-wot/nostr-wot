import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { HelpVideo } from '../components/help/HelpVideo';
import { GUIDE_MEDIA, GUIDE_VIDEOS, type GuideVideo } from '../lib/guide-media';
import { HELP_TOPICS } from '../lib/help-topics';
import matter from 'gray-matter';

const lessons = ['passkeyCreate', 'passkeyRecover', 'passkeyMigrate'] as const;
const locales = ['en', 'es', 'pt', 'fr', 'it', 'de', 'ru'];

test('passkey lessons have complete localized, compilable guides and working media destinations', async () => {
  const { compile } = await import('@mdx-js/mdx');
  for (const key of lessons) {
    const topic = HELP_TOPICS.find(topic => topic.video === key)!;
    assert.ok(topic);
    for (const locale of locales) {
      const file = `content/guides/${locale}/${topic.guides[0]}.mdx`;
      const { data, content } = matter(readFileSync(file, 'utf8'));
      assert.equal(data.translationKey, topic.guides[0]);
      assert.equal(data.published, true);
      assert.deepEqual(GUIDE_MEDIA[data.translationKey].videos, [key]);
      await compile(content);
    }
  }
});

test('pending videos render localized guidance without a player or external media URL', () => {
  for (const locale of locales) {
    const help = JSON.parse(readFileSync(`messages/${locale}/help.json`, 'utf8'));
    for (const video of lessons) {
      if (GUIDE_VIDEOS[video].id !== null) continue;
      const html = renderToStaticMarkup(React.createElement(NextIntlClientProvider, { locale, timeZone: 'UTC', messages: { help }, children: React.createElement(HelpVideo, { video }) }));
      assert.ok(html.includes(help.videoPending));
      assert.doesNotMatch(html, /iframe|youtube|<img/);
    }
  }
});

test('published lessons retain privacy-enhanced players', () => {
  const help = JSON.parse(readFileSync('messages/en/help.json', 'utf8'));
  const html = renderToStaticMarkup(React.createElement(NextIntlClientProvider, { locale: 'en', timeZone: 'UTC', messages: { help }, children: React.createElement(HelpVideo, { video: 'account' as GuideVideo }) }));
  assert.match(html, /www.youtube-nocookie.com\/embed\/pUBd2rgmhNc/);
});
