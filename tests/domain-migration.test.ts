import assert from 'node:assert/strict';
import test from 'node:test';
import nextConfig from '../next.config';
import { validateOrigin } from '../lib/rate-limit';

test('legacy website hosts redirect every path with explicit HTTP 301', async () => {
  const redirects = await nextConfig.redirects!();
  for (const host of ['nostr-wot.com', 'www.nostr-wot.com', 'www.nostrwot.com']) {
    const rule = redirects.find(rule => rule.has?.some(condition => condition.type === 'host' && condition.value === host));
    assert.ok(rule, `Missing redirect for ${host}`);
    assert.equal(rule.source, '/:path*');
    assert.equal(rule.destination, 'https://nostrwot.com/:path*');
    assert.equal(rule.statusCode, 301);
  }
  assert.ok(!redirects.some(rule => rule.has?.some(condition => condition.type === 'host' && condition.value === 'nostrwot.com')));
});

test('forms accept the new canonical origin and reject lookalike domains', () => {
  const request = (origin: string) => new Request('https://nostrwot.com/api/contact', { headers: { origin } });
  assert.equal(validateOrigin(request('https://nostrwot.com')), true);
  assert.equal(validateOrigin(request('https://nostrwot.com.evil.example')), false);
});
