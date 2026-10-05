// @ts-check
/**
 * Writes lib/generated/ecosystem-snapshot.json: machine-derived repository
 * facts for every project in data/ecosystem-projects.json.
 *
 * Deliberately NOT part of `prebuild`. Nothing in prebuild touches the
 * network and builds must stay hermetic, so the committed JSON is the build
 * input and this script is run on purpose (`npm run ecosystem:snapshot`).
 *
 * HONESTY RULE, mirroring scripts/generate-route-modified.mjs: never write a
 * partially populated snapshot. Facts are collected in memory and the file is
 * written only once every project resolved. A single failure exits non-zero
 * and leaves the previous snapshot untouched, because a half-snapshot would
 * silently present some projects as having no releases.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fetchRetry, sleep } from './fetch-retry.mjs';
import { repositorySlug as repoSlug } from '../lib/repository-slug.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'ecosystem-projects.json');
const OUTPUT_PATH = process.env.ECOSYSTEM_SNAPSHOT_OUT
  || path.join(ROOT, 'lib', 'generated', 'ecosystem-snapshot.json');
const MAX_RELEASES = 5;
const API = 'https://api.github.com';

// One owner, shared with lib/ecosystem-projects.ts. `repoSlug` stays exported
// under its old name because the snapshot tests import it by that name.
export { repoSlug };

/** @param {unknown} value */
export function toDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;
}

/** @param {any[]} releases @param {number} max */
export function pickReleases(releases, max = MAX_RELEASES) {
  return releases
    .filter((release) => release && !release.draft)
    .map((release) => ({
      tag: typeof release.tag_name === 'string' ? release.tag_name : null,
      date: toDate(release.published_at),
      url: typeof release.html_url === 'string' ? release.html_url : null,
      prerelease: Boolean(release.prerelease),
    }))
    .filter((release) => release.tag && release.date && release.url)
    .sort((a, b) => ((a.date ?? '') < (b.date ?? '') ? 1 : (a.date ?? '') > (b.date ?? '') ? -1 : 0))
    .slice(0, max);
}

function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/** @param {string} pathname @param {string} token */
async function api(pathname, token) {
  const res = await fetchRetry(`${API}${pathname}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'nostr-wot-ecosystem-snapshot',
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 403 || res.status === 429) {
    const retryAfter = Number(res.headers.get('retry-after'));
    if (Number.isFinite(retryAfter) && retryAfter > 0 && retryAfter <= 60) {
      console.warn(`[ecosystem-snapshot] secondary rate limit, waiting ${retryAfter}s`);
      await sleep(retryAfter * 1000);
      return api(pathname, token);
    }
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${pathname}`);
  if (res.headers.get('x-ratelimit-remaining') === '0') {
    throw new Error('GitHub rate limit exhausted; rerun after it resets rather than writing a partial snapshot');
  }
  return res.json();
}

async function main() {
  const token = resolveToken();
  if (!token) {
    console.error('[ecosystem-snapshot] no credentials: set GITHUB_TOKEN or run `gh auth login`.');
    console.error('[ecosystem-snapshot] unauthenticated GitHub allows 60 requests per hour and this needs about 82.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  /** @type {Record<string, object>} */
  const projects = {};
  let renamed = 0;

  for (const project of data.projects) {
    const slug = repoSlug(project.repository);
    if (!slug) throw new Error(`${project.id}: repository is not a GitHub URL: ${project.repository}`);
    const repo = await api(`/repos/${slug}`, token);
    const releases = await api(`/repos/${slug}/releases?per_page=10`, token);
    const canonicalSlug = typeof repo.full_name === 'string' ? repo.full_name : slug;
    if (canonicalSlug.toLowerCase() !== slug.toLowerCase()) {
      console.warn(`[ecosystem-snapshot] ${project.id}: ${slug} now resolves to ${canonicalSlug}`);
      renamed += 1;
    }
    projects[project.id] = {
      slug,
      canonicalSlug,
      archived: Boolean(repo.archived),
      createdAt: toDate(repo.created_at),
      pushedAt: toDate(repo.pushed_at),
      license: repo.license && typeof repo.license.spdx_id === 'string' && repo.license.spdx_id !== 'NOASSERTION'
        ? repo.license.spdx_id
        : null,
      language: typeof repo.language === 'string' ? repo.language : null,
      topics: Array.isArray(repo.topics) ? repo.topics.slice().sort() : [],
      releases: pickReleases(Array.isArray(releases) ? releases : []),
    };
  }

  const now = process.env.ECOSYSTEM_SNAPSHOT_NOW || new Date().toISOString();
  const output = { generatedAt: toDate(now), projects };
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`[ecosystem-snapshot] wrote ${Object.keys(projects).length} projects, ${renamed} renamed, to ${OUTPUT_PATH}`);
}

const isEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntryPoint) {
  main().catch((error) => {
    console.error(`[ecosystem-snapshot] ${error.message}`);
    process.exit(1);
  });
}
