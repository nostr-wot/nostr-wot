import { test } from 'node:test';
import assert from 'node:assert/strict';
import { switchSiteUpstream } from '../scripts/site-nginx.mjs';
const revision = 'a'.repeat(40);
const config = `server {
  server_name nostrwot.com;
  add_header Strict-Transport-Security "max-age=63072000" always;
  location / { proxy_pass http://127.0.0.1:3000; }
  location /widgets/ { proxy_pass http://127.0.0.1:3004; }
  location /legacy { proxy_pass http://127.0.0.1:3000; }
}`;
test('switches every website upstream while preserving the widget service and disabling HTML transformation', () => {
 const next = switchSiteUpstream(config, 3100, revision);
 assert.equal((next.match(/http:\/\/127\.0\.0\.1:3100;/g) ?? []).length, 2);
 assert.ok(next.includes('http://127.0.0.1:3004;'));
 assert.ok(next.includes('add_header Cache-Control "no-transform" always;'));
 assert.equal(switchSiteUpstream(next, 3100, revision), next);
 assert.equal((switchSiteUpstream(next, 3101, revision).match(/no-transform/g) ?? []).length, 1);
});
test('rejects unknown ports and configs without a recognized website upstream', () => {
 assert.throws(() => switchSiteUpstream(config, 3004, revision));
 assert.throws(() => switchSiteUpstream('server {}', 3100, revision));
});
