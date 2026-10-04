import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HELP_TOPICS, HELP_VIDEOS, HELP_CATEGORIES, matchesHelpQuery } from '../lib/help-topics';
import { GUIDE_MEDIA, GUIDE_VIDEOS, youtubeUrls } from '../lib/guide-media';

test('help tasks are independent of the complete published video library', () => {
  assert.ok(HELP_TOPICS.length > HELP_VIDEOS.length);
  assert.ok(HELP_TOPICS.some(topic => !topic.video && topic.category === 'troubleshooting'));
  assert.equal(new Set(HELP_TOPICS.map(topic => topic.id)).size, HELP_TOPICS.length);
  assert.equal(new Set(HELP_VIDEOS.map(video => GUIDE_VIDEOS[video.id].id)).size, 12);
  for (const locale of ['en', 'es', 'pt', 'fr', 'de', 'it', 'ru']) {
    const copy = JSON.parse(fs.readFileSync(`messages/${locale}/help.json`, 'utf8'));
    for (const topic of HELP_TOPICS) {
      assert.ok(HELP_CATEGORIES.includes(topic.category));
      assert.ok(copy.topics[topic.id].title);
      for (const related of topic.related ?? []) assert.ok(HELP_TOPICS.some(item => item.id === related));
      if (topic.screenshot) {
        assert.ok(fs.existsSync(`public/images/guides/extension/${topic.screenshot}.png`));
        const media = JSON.parse(fs.readFileSync(`messages/${locale}/guides.json`, 'utf8')).media;
        assert.ok(media.captions[topic.screenshot]);
      }
      assert.ok(copy.topics[topic.id].steps.length >= 2);
      assert.ok(copy.topics[topic.id].steps.every((step: string) => step.trim().length > 20));
      if (topic.video) assert.match(youtubeUrls(GUIDE_VIDEOS[topic.video].id).embed, /^https:\/\/www.youtube-nocookie.com\/embed\//);
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
