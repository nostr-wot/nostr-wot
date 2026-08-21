#!/usr/bin/env node
/**
 * Proves the unified cache generator reproduces the output of the original
 * per-collection generators exactly.
 *
 *   node scripts/verify-cache-parity.mjs --snapshot   capture baseline from current generators
 *   node scripts/verify-cache-parity.mjs              regenerate and compare against baseline
 *
 * `generatedAt` is normalised before comparison: it is a fresh timestamp on
 * every run and can never match.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_DIR = path.join(ROOT, '.parity-baseline');
const GENERATED_DIR = path.join(ROOT, 'lib', 'generated');
const COLLECTIONS = ['blog', 'guides'];

function normalise(jsonText) {
  const data = JSON.parse(jsonText);
  data.generatedAt = 'NORMALISED';
  return JSON.stringify(data, null, 2);
}

function readGenerated(name) {
  return normalise(fs.readFileSync(path.join(GENERATED_DIR, `${name}-cache.json`), 'utf8'));
}

function run(script) {
  execFileSync('node', [path.join(ROOT, 'scripts', script)], { stdio: 'inherit' });
}

const snapshot = process.argv.includes('--snapshot');

if (snapshot) {
  run('generate-blog-cache.mjs');
  run('generate-guides-cache.mjs');
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  for (const name of COLLECTIONS) {
    fs.writeFileSync(path.join(BASELINE_DIR, `${name}-cache.json`), readGenerated(name));
    console.log(`  ✓ baseline captured: ${name}`);
  }
  console.log('✅ Baseline snapshot written to .parity-baseline/');
  process.exit(0);
}

for (const name of COLLECTIONS) {
  const baselinePath = path.join(BASELINE_DIR, `${name}-cache.json`);
  if (!fs.existsSync(baselinePath)) {
    console.error(`❌ No baseline for "${name}". Run: node scripts/verify-cache-parity.mjs --snapshot`);
    process.exit(1);
  }
}

run('generate-content-cache.mjs');

let failed = false;
for (const name of COLLECTIONS) {
  const expected = fs.readFileSync(path.join(BASELINE_DIR, `${name}-cache.json`), 'utf8');
  const actual = readGenerated(name);
  if (expected === actual) {
    console.log(`  ✓ ${name}: identical`);
    continue;
  }
  failed = true;
  console.error(`  ✗ ${name}: MISMATCH`);
  const e = expected.split('\n');
  const a = actual.split('\n');
  let shown = 0;
  for (let i = 0; i < Math.max(e.length, a.length) && shown < 20; i++) {
    if (e[i] !== a[i]) {
      console.error(`    line ${i + 1}:\n      expected: ${e[i]}\n      actual:   ${a[i]}`);
      shown++;
    }
  }
}

if (failed) {
  console.error('\n❌ Parity check FAILED. The refactor changed output. Do not merge.');
  process.exit(1);
}
console.log('\n✅ Parity check passed: blog and guides output unchanged.');
