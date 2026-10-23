import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { locales } from '../i18n/config';
import { routes } from '../lib/sitemap-routes.mjs';
import { PASSKEY_INTEGRATION_LINKS } from '../lib/passkey-integration-links';

test('every supported locale has complete, nonempty passkey integration copy registered', () => {
  const en = JSON.parse(fs.readFileSync('messages/en/passkeyIntegrations.json', 'utf8'));
  for (const locale of locales) {
    const copy = JSON.parse(fs.readFileSync(`messages/${locale}/passkeyIntegrations.json`, 'utf8'));
    assert.deepEqual(Object.keys(copy).sort(), Object.keys(en).sort(), locale);
    for (const [key, value] of Object.entries(copy)) {
      assert.equal(typeof value, 'string', `${locale}:${key}`);
      assert.ok((value as string).trim().length > 0, `${locale}:${key}`);
    }
    const index = fs.readFileSync(`messages/${locale}/index.ts`, 'utf8');
    assert.match(index, /import passkeyIntegrations from '\.\/passkeyIntegrations.json'/);
    assert.match(index, /const messages = \{[\s\S]*?\bpasskeyIntegrations,/);
  }
});

test('public request uses the dedicated form and security reports have a separate destination', () => {
  const request = new URL(PASSKEY_INTEGRATION_LINKS.request);
  assert.equal(request.origin, 'https://github.com');
  assert.equal(request.pathname, '/nostr-wot/nostr-wot-extension/issues/new');
  assert.equal(request.searchParams.get('template'), 'passkey_integration.yml');
  assert.equal(new URL(PASSKEY_INTEGRATION_LINKS.security).pathname, '/nostr-wot/nostr-wot-extension/security/advisories/new');
  assert.ok(routes.some(route => route.path === '/passkey-integrations' && route.messageKey === 'passkeyIntegrations'));
});
