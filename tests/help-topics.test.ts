import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HELP_TOPICS, HELP_CATEGORIES, matchesHelpQuery } from '../lib/help-topics';
import { GUIDE_MEDIA, GUIDE_VIDEOS, youtubeUrls } from '../lib/guide-media';

test('help covers the 12 distinct published videos with complete localized steps', () => {
  assert.equal(HELP_TOPICS.length, 12);
  assert.equal(new Set(HELP_TOPICS.map(topic => GUIDE_VIDEOS[topic.id].id)).size, 12);
  for (const locale of ['en', 'es', 'pt', 'fr', 'de', 'it', 'ru']) {
    const copy = JSON.parse(fs.readFileSync(`messages/${locale}/help.json`, 'utf8'));
    for (const topic of HELP_TOPICS) {
      assert.ok(HELP_CATEGORIES.includes(topic.category));
      assert.ok(copy.topics[topic.id].title);
      assert.equal(copy.topics[topic.id].steps.length, 3);
      assert.ok(copy.topics[topic.id].steps.every((step: string) => step.trim().length > 20));
      assert.match(youtubeUrls(GUIDE_VIDEOS[topic.id].id).embed, /^https:\/\/www.youtube-nocookie.com\/embed\//);
    }
  }
});

test('help search matches words across the task text and ignores accents and case', () => {
  assert.ok(matchesHelpQuery('  SEGURIDAD contraseña ', 'Cambiar la contraseña en Seguridad'));
  assert.ok(matchesHelpQuery('recuperacion', 'Frase de recuperación'));
  assert.ok(matchesHelpQuery('', 'Any task'));
  assert.equal(matchesHelpQuery('wallet password', 'Connect a wallet'), false);
});

test('language guide points to the dedicated language tutorial', () => {
  assert.deepEqual(GUIDE_MEDIA['change-language'].videos, ['language']);
  assert.equal(GUIDE_VIDEOS.language.id, 'uK5wQDeWJdA');
});
