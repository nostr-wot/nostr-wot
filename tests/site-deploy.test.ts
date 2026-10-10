import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';

for (const failure of ['', 'health', 'nginx', 'save']) test(`deployment ${failure || 'success'} preserves the existing server until a healthy switch`, () => {
 const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'site-deploy-'));
 try {
  const sha = 'a'.repeat(40), root = path.join(tmp, 'site'), incoming = path.join(root, 'incoming', sha), bin = path.join(tmp, 'bin'), payload = path.join(tmp, 'payload');
  for (const dir of [bin, path.join(incoming, 'scripts'), path.join(payload, '.next/static'), path.join(payload, 'scripts/newsletters'), path.join(payload, 'newsletters')]) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(payload, 'scripts/newsletters/send.mjs'), 'new sender');
  fs.writeFileSync(path.join(payload, 'newsletters/edition.json'), '{}');
  fs.writeFileSync(path.join(incoming, '.env'), 'EXAMPLE=value');
  fs.writeFileSync(path.join(root, '.env'), 'EXAMPLE=previous');
  fs.copyFileSync('scripts/site-nginx.mjs', path.join(incoming, 'scripts/site-nginx.mjs'));
  execFileSync('tar', ['-czf', path.join(incoming, 'production.tar.gz'), '-C', payload, '.']);
  const config = path.join(tmp, 'nginx.conf');
  const before = 'server {\n  add_header Strict-Transport-Security "max-age=63072000" always;\n  location / { proxy_pass http://127.0.0.1:3000; }\n}\n';
  fs.writeFileSync(config, before);
  const writeCommand = (name: string, body: string) => fs.writeFileSync(path.join(bin, name), '#!/bin/bash\n' + body, { mode: 0o755 });
  writeCommand('npm', 'exit 0\n');
  writeCommand('pm2', 'echo "$*" >> "$TEST_TMP/pm2.log"\ncase "$1" in jlist) echo "[]";; describe) exit 1;; start) touch "$TEST_TMP/started";; delete) rm -f "$TEST_TMP/started";; save) [[ "$TEST_FAILURE" != save ]] || exit 1;; esac\n');
  writeCommand('curl', '[[ -f "$TEST_TMP/started" ]] || exit 7\n[[ "$TEST_FAILURE" != health ]] || exit 22\nwhile (($#)); do if [[ "$1" == -D ]]; then shift; printf "Cache-Control: no-transform\\nX-Deployment-Revision: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\\n" > "$1"; fi; shift; done\n');
  writeCommand('nginx', 'if [[ "$TEST_FAILURE" == nginx && ! -f "$TEST_TMP/nginx-failed" ]]; then touch "$TEST_TMP/nginx-failed"; exit 1; fi\nexit 0\n');
  const run = spawnSync('bash', ['scripts/deploy-site.sh', sha], { encoding: 'utf8', env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, SITE_ROOT: root, SITE_NGINX_CONFIG: config, TEST_TMP: tmp, TEST_FAILURE: failure } });
  assert.equal(run.status, failure ? 1 : 0, run.stdout + run.stderr);
  const commands = fs.readFileSync(path.join(tmp, 'pm2.log'), 'utf8');
  assert.ok(!commands.split('\n').includes('delete nostr-wot'), commands);
  if (failure) {
   assert.equal(fs.readFileSync(config, 'utf8'), before);
   assert.equal(fs.readFileSync(path.join(root, '.env'), 'utf8'), 'EXAMPLE=previous');
   assert.ok(!fs.existsSync(path.join(root, 'current')));
   assert.equal(commands.includes('delete nostr-wot-3100'), failure === 'health');
  } else {
   assert.ok(fs.readFileSync(config, 'utf8').includes(':3100;'));
   assert.equal(fs.readFileSync(path.join(root, '.env'), 'utf8'), 'EXAMPLE=value');
   assert.equal(fs.readlinkSync(path.join(root, 'current')), path.join(root, 'releases', sha));
   assert.equal(fs.readlinkSync(path.join(root, 'releases', sha, 'data/newsletter')), path.join(root, 'data/newsletter'));
   assert.equal(fs.readFileSync(path.join(root, 'scripts/newsletters/send.mjs'), 'utf8'), 'new sender');
  }
 } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
