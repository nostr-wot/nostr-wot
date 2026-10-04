import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HELP_TOPICS, HELP_VIDEOS, HELP_CATEGORIES, matchesHelpQuery, getHelpTopic, helpTopicHref } from '../lib/help-topics';
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
      for (const screenshot of topic.screenshots ?? []) {
        assert.ok(fs.existsSync(`public/images/guides/extension/${screenshot}.png`));
        const media = JSON.parse(fs.readFileSync(`messages/${locale}/guides.json`, 'utf8')).media;
        assert.ok(media.captions[screenshot]);
      }
      assert.ok(copy.topics[topic.id].overview.length > 50);
      assert.equal(copy.topics[topic.id].before.length, 2);
      assert.equal(copy.topics[topic.id].checks.length, 2);
      assert.ok(copy.topics[topic.id].steps.length >= 3);
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

test('every help task has a unique shareable route and every video has a destination', () => {
  assert.equal(new Set(HELP_TOPICS.map(topic => topic.slug)).size, HELP_TOPICS.length);
  for (const topic of HELP_TOPICS) {
    assert.match(topic.slug, /^[a-z]+(?:-[a-z]+)*$/);
    assert.equal(getHelpTopic(topic.slug), topic);
    assert.equal(helpTopicHref(topic), `/help/${topic.slug}`);
  }
  assert.equal(getHelpTopic('missing-task'), undefined);
  for (const video of HELP_VIDEOS) assert.ok(HELP_TOPICS.some(topic => topic.video === video.id));
});
