import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRequestPosts } from '../scripts/social/entries.mjs';
import { eligibleChannelKeys } from '../scripts/social/channel-policy.mjs';
import { selectPending } from '../scripts/social/selection.mjs';

const article = (data: Record<string, unknown>) => ({
  slug: 'amber-release', url: 'https://nostrwot.com/news/2026-10-06/amber-release', data,
});
test('legacy ecosystem copy cannot send to LinkedIn, even on a targeted run', () => {
  const entry = article({ linkedin: 'Amber update', nostr: 'Amber update' });
  const [selected] = selectPending([entry], {}, { slug: entry.slug });
  assert.deepEqual(buildRequestPosts(selected).map((p: {channel: string}) => p.channel), ['nostr-wot-nostr']);
});
test('Nostr-only copy remains deliverable', () => {
  assert.deepEqual(eligibleChannelKeys({ nostr: 'Release notes' }), ['nostr']);
});
test('LinkedIn requires a platform/team category and a reason', () => {
  for (const metadata of [{}, {linkedinCategory: 'platform-update'}, {linkedinCategory: 'ecosystem-update', linkedinReason: 'Major external release'}, {linkedinCategory: 'team-update', linkedinReason: '  '}]) {
    assert.deepEqual(buildRequestPosts(article({linkedin: 'Old copy', ...metadata})), []);
  }
});
test('explicit platform and team announcements can use LinkedIn', () => {
  for (const category of ['platform-update', 'team-update']) {
    const posts = buildRequestPosts(article({linkedin: 'Our announcement {url}', linkedinCategory: category, linkedinReason: 'Substantive news about our platform or team', nostr: 'Our news'}));
    assert.deepEqual(posts.map((p: {channel: string}) => p.channel), ['nostr-wot-li', 'nostr-wot-nostr']);
    assert.match(posts[0].text, /https:\/\/nostrwot.com/);
  }
});
test('classification does not retry confirmed or uncertain ledger records', () => {
  const entry = article({linkedin: 'News', linkedinCategory: 'platform-update', linkedinReason: 'Platform capability'});
  for (const record of [{channels: ['nostr-wot-nostr']}, {channelsUnverified: true}]) {
    assert.deepEqual(selectPending([entry], {[entry.slug]: record}), []);
  }
});
