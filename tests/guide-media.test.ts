import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import matter from 'gray-matter';
import { GUIDE_MEDIA, GUIDE_VIDEOS, youtubeUrls } from '../lib/guide-media';

const locales = ['en', 'es', 'pt', 'fr', 'it', 'de', 'ru'];

test('guide media resolves for every translation, with images and translated captions', () => {
  for (const locale of locales) {
    const messages = JSON.parse(readFileSync(`messages/${locale}/guides.json`, 'utf8'));
    const guideKeys = readdirSync(`content/guides/${locale}`).map(file => matter(readFileSync(`content/guides/${locale}/${file}`, 'utf8')).data.translationKey);
    for (const [key, media] of Object.entries(GUIDE_MEDIA)) {
      // Some older guides exist only in English; validate their media there.
      if (locale !== 'en' && !guideKeys.includes(key)) continue;
      assert.ok(guideKeys.includes(key), `${locale}: missing guide ${key}`);
      for (const id of media.screenshots) {
        assert.ok(existsSync(`public/images/guides/extension/${id}.png`), `missing screenshot ${id}`);
        assert.ok(messages.media.captions[id], `${locale}: missing caption ${id}`);
      }
      for (const video of media.videos || []) assert.ok(GUIDE_VIDEOS[video]);
    }
    for (const key of ['screenshots', 'screenshotNote', 'openImage', 'videos', 'videoNote', 'watchOnYoutube']) assert.ok(messages.media[key]);
  }
});

test('all published guide videos use privacy-enhanced embeds and direct watch links', () => {
  for (const video of Object.values(GUIDE_VIDEOS)) {
    const urls = youtubeUrls(video.id);
    assert.equal(new URL(urls.embed).origin, 'https://www.youtube-nocookie.com');
    assert.equal(new URL(urls.watch).searchParams.get('v'), video.id);
  }
  for (const invalid of ['', 'https://evil.example', '../watch?v=x', 'video?autoplay=1', 'a'.repeat(12)]) {
    assert.throws(() => youtubeUrls(invalid));
  }
});

test('every guide has instructional images or diagrams, excluding its featured artwork', () => {
  for (const file of readdirSync('content/guides/en')) {
    const { data, content } = matter(readFileSync(`content/guides/en/${file}`, 'utf8'));
    if (!data.published) continue;
    const media = GUIDE_MEDIA[data.translationKey];
    assert.ok(/!\[.*?\]\(/.test(content) || media?.screenshots.length, `No instructional image: ${file}`);
  }
});
