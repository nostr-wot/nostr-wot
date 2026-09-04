#!/usr/bin/env node
/**
 * npm run social:lint
 *
 * The CLI over the rules in checks.mjs. Runs in CI on every pull request and
 * on every push to `main` (.github/workflows/ci.yml).
 *
 * The rules themselves live in checks.mjs so that post-social.mjs enforces the
 * identical set before it sends anything. This file only prints and sets the
 * exit code. See docs/social-posting.md section 6.
 *
 * Feed it deliberately bad copy before trusting it (see docs/social-posting.md
 * section 6 for the worked example this is built to catch).
 */
import { collectErrors } from "./checks.mjs";
import { listSocialFiles } from "./entries.mjs";

const { entries, errors } = collectErrors();

for (const { slug, url } of entries) {
  console.log(`checked social/${slug}.json -> ${url}`);
}

for (const e of errors) console.error(`error ${e}`);
console.log(`\n${listSocialFiles().length} file(s) checked, ${errors.length} error(s)`);
process.exit(errors.length ? 1 : 0);
