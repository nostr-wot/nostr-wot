#!/usr/bin/env node
/**
 * Golden-file check for scripts/generate-content-cache.mjs.
 *
 *   npm run test:parity          generate over the fixtures, compare to the golden
 *   npm run test:parity:update   OVERWRITE the golden with current output
 *
 * This runs the generator against tests/fixtures/content/parity/ — never against
 * the real content/ tree — and writes into a throwaway temp directory, so the
 * check is content-independent: adding a blog post cannot turn it red, and it is
 * safe to run in CI. The fixtures deliberately exercise the behaviours that the
 * mapper can silently get wrong: image defaults, blog author `socials` vs the
 * guides author that must not have that key at all, difficulty/order defaults
 * and explicit values, blog date-descending vs guides order-ascending sort, an
 * explicitly `published: false` document, `.md` alongside `.mdx`, a document
 * with no `date`, and a cross-locale translation pair.
 *
 * `generatedAt` is normalised before comparison: it is a fresh timestamp on
 * every run and can never match. `CONTENT_CACHE_NOW` additionally pins the
 * fallback used for documents with no `date`.
 *
 * REGENERATING THE GOLDEN IS AN EXPLICIT CHOICE, NOT A REPAIR STEP. `--update`
 * makes this check agree with whatever the generator currently does, which is
 * exactly what it is supposed to catch. Only run it when you intended to change
 * the generator's output, and read the resulting diff of
 * tests/fixtures/content-cache-golden.json line by line in review.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_ROOT = path.join(ROOT, 'tests', 'fixtures', 'content', 'parity');
const GOLDEN_PATH = path.join(ROOT, 'tests', 'fixtures', 'content-cache-golden.json');
const COLLECTIONS = ['blog', 'guides'];
/** Any fixed instant; only stability matters. */
const FIXED_NOW = '2026-06-01T00:00:00.000Z';

const update = process.argv.includes('--update');

function fail(message) {
  console.error(`❌ ${message}`);
  return 1;
}

function run(outDir) {
  execFileSync('node', [path.join(ROOT, 'scripts', 'generate-content-cache.mjs')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      CONTENT_CACHE_ROOT: FIXTURE_ROOT,
      CONTENT_CACHE_OUT: outDir,
      CONTENT_CACHE_ONLY: COLLECTIONS.join(','),
      CONTENT_CACHE_NOW: FIXED_NOW,
    },
  });
}

function collect(outDir) {
  const actual = {};
  for (const name of COLLECTIONS) {
    const file = path.join(outDir, `${name}-cache.json`);

    // Guard: the generator must actually have written the file. Without this a
    // silently no-op generator would compare stale/absent output and pass.
    if (!fs.existsSync(file)) {
      throw new Error(
        `${name}-cache.json was not written. generate-content-cache.mjs produced nothing at ${file}.`
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      throw new Error(`${name}-cache.json is not valid JSON: ${err.message}`);
    }

    // Guard: a cache with no English documents is hollow, and would match a
    // hollow golden vacuously. The fixtures always have English documents.
    if (
      !parsed.locales ||
      !parsed.locales.en ||
      !Array.isArray(parsed.locales.en.posts) ||
      parsed.locales.en.posts.length === 0
    ) {
      throw new Error(
        `${name}-cache.json is degenerate: no "locales.en.posts". Refusing to compare.`
      );
    }

    parsed.generatedAt = 'NORMALISED';
    actual[name] = parsed;
  }
  return `${JSON.stringify(actual, null, 2)}\n`;
}

function diff(expected, actual) {
  const e = expected.split('\n');
  const a = actual.split('\n');
  let shown = 0;
  for (let i = 0; i < Math.max(e.length, a.length) && shown < 20; i++) {
    if (e[i] !== a[i]) {
      console.error(`    line ${i + 1}:\n      expected: ${e[i]}\n      actual:   ${a[i]}`);
      shown++;
    }
  }
  if (shown === 20) console.error('    ... (further differences suppressed)');
}

function main(outDir) {
  if (!fs.existsSync(FIXTURE_ROOT)) {
    return fail(`Fixture root missing: ${FIXTURE_ROOT}`);
  }

  run(outDir);

  let actual;
  try {
    actual = collect(outDir);
  } catch (err) {
    return fail(err.message);
  }

  if (update) {
    fs.writeFileSync(GOLDEN_PATH, actual);
    console.log(`\n✅ Golden REWRITTEN: ${path.relative(ROOT, GOLDEN_PATH)}`);
    console.log('   Review the diff before committing — this file is the check itself.');
    return 0;
  }

  if (!fs.existsSync(GOLDEN_PATH)) {
    return fail(
      `No golden file at ${path.relative(ROOT, GOLDEN_PATH)}. ` +
        'It is committed to git; restore it rather than regenerating blindly ' +
        '(deliberate regeneration: npm run test:parity:update).'
    );
  }

  const expected = fs.readFileSync(GOLDEN_PATH, 'utf8');
  if (expected !== actual) {
    console.error('\n  ✗ MISMATCH against the committed golden file:');
    diff(expected, actual);
    console.error(
      '\n❌ Parity check FAILED. The generator no longer reproduces the golden output.\n' +
        '   If this change was intended, run `npm run test:parity:update` and review the diff.'
    );
    return 1;
  }

  console.log('\n✅ Parity check passed: generator output matches the committed golden.');
  return 0;
}

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-cache-parity-'));
let code = 1;
try {
  code = main(outDir);
} catch (err) {
  code = fail(err.stack || String(err));
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
process.exit(code);
