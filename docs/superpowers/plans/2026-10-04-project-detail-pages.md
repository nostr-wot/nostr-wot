# Per-project evidence pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every project in the ecosystem directory an addressable, indexable evidence page at `/projects/<id>` in all seven locales.

**Architecture:** A committed GitHub-derived snapshot in `lib/generated/` supplies machine facts; the hand-curated dataset in `data/` keeps supplying human judgement; a new static route renders both. Presentational primitives currently private to `EcosystemDirectory` are lifted into a shared module so the detail page reuses them instead of duplicating them.

**Tech Stack:** Next.js 16 (App Router, Turbopack), next-intl, TypeScript, Tailwind, `node --test` via tsx, plain ESM generator scripts.

**Spec:** `docs/superpowers/specs/2026-10-04-project-detail-pages-design.md`

## Global Constraints

- **Seven locales, always:** `en, es, pt, ru, it, fr, de`. Any key added to `messages/en/projects.json` MUST be added to all seven files in the same commit, with identical ICU argument names. `tests/translations.test.ts` asserts identical flattened key sets.
- **No em dashes in any locale.** The existing data and message files contain zero. Rephrase; do not substitute hyphens.
- **`ecosystemCopy` falls back to the whole English object only when a locale is missing, never per key.** A key present in English but missing in Russian renders `undefined`, not English.
- **Every rendered `href` from the dataset or snapshot must pass `isSafeExternalUrl` first.** This is the established house rule.
- **SEO limits are enforced by `withMetadataPolicy`:** title 45-57 characters, description 145-157 (`SEO_LIMITS` in `lib/metadata-policy.ts`). Out-of-range copy is silently padded with generic filler or truncated.
- **No network access in tests, and none in `prebuild`.** The committed snapshot is the build input.
- **Commit message convention:** `<type>(<scope>): <lowercase summary>`, no attribution trailers.
- **Dataset files `data/ecosystem-projects*.json` are NOT modified by this plan.**

---

## File Structure

| File | Responsibility |
|---|---|
| `components/projects/shared.tsx` | Create. `ExternalLink`, `focus`, `statusStyles`, `StatusBadge`. Lifted verbatim from `EcosystemDirectory`. |
| `components/projects/EcosystemDirectory.tsx` | Modify. Import the primitives; add a per-card link to the detail page. |
| `components/projects/ProjectDetail.tsx` | Create. Renders one project's evidence record. |
| `lib/ecosystem-projects.ts` | Modify. Add `repositorySlug`, `relatedReports`, `findProject`. |
| `lib/ecosystem-snapshot.ts` | Create. Types and accessors over the generated snapshot. |
| `lib/project-seo.ts` | Create. First-fit title/description composition and the project JSON-LD builder. |
| `scripts/generate-ecosystem-snapshot.mjs` | Create. Writes the snapshot from the GitHub API. |
| `lib/generated/ecosystem-snapshot.json` | Create (generated, committed). |
| `app/[locale]/projects/[id]/page.tsx` | Create. Route, metadata, JSON-LD. |
| `app/sitemap.ts` | Modify. Projects loop with hreflang alternates. |
| `messages/{en,es,pt,ru,it,fr,de}/projects.json` | Modify. New `detail` namespace. |
| `tests/sitemap.test.ts` | Modify. Dynamic allow-list and expected URL set. |
| `tests/ecosystem-detail.test.ts` | Create. Snapshot parity, rendering, matching, SEO bounds. |
| `tests/ecosystem-snapshot-generator.test.ts` | Create. Generator pure functions, no network. |
| `package.json` | Modify. Add `ecosystem:snapshot` script. |
| `.env.example` | Modify. Document `GITHUB_TOKEN`. |

Dependency order: Tasks 1, 2 and 3 are independent of each other and can run in parallel. Task 4 needs 2. Task 5 needs 1, 2, 3 and 4. Task 6 needs 5. Task 7 needs 6. Task 8 is verification and needs everything.

---

### Task 1: Lift shared presentational primitives

Pure refactor. The directory must render byte-identical output afterwards.

**Files:**
- Create: `components/projects/shared.tsx`
- Modify: `components/projects/EcosystemDirectory.tsx` (remove the local `focus`, `statusStyles`, `ExternalLink`; import them instead)
- Test: `tests/ecosystem-detail.test.ts` (new file, first two tests)

**Interfaces:**
- Consumes: `ecosystemCopy`, `isSafeExternalUrl`, `ProjectStatus` from `lib/ecosystem-projects.ts`.
- Produces: `focus: string`, `statusStyles: Record<ProjectStatus, string>`, `ExternalLink({ url, children, locale })`, `StatusBadge({ status, locale })`.

- [ ] **Step 1: Write the failing test**

Create `tests/ecosystem-detail.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('StatusBadge renders the per-status colour and the localised label', async () => {
  const { StatusBadge } = await import('../components/projects/shared');
  const cases: [string, string, string][] = [
    ['active', 'bg-emerald-100', 'Active'],
    ['beta', 'bg-amber-100', 'Beta'],
    ['archived', 'bg-gray-200', 'Archived'],
    ['unknown', 'bg-violet-100', 'Unknown'],
  ];
  for (const [status, className, label] of cases) {
    const html = renderToStaticMarkup(createElement(StatusBadge, { status, locale: 'en' } as never));
    assert.ok(html.includes(className), `${status}: ${className}`);
    assert.ok(html.includes(label), `${status}: ${label}`);
  }
  const spanish = renderToStaticMarkup(createElement(StatusBadge, { status: 'archived', locale: 'es' } as never));
  assert.ok(spanish.includes('En archivo'), spanish);
});

test('ExternalLink degrades to plain text when the URL is unsafe', async () => {
  const { ExternalLink } = await import('../components/projects/shared');
  const safe = renderToStaticMarkup(createElement(ExternalLink, { url: 'https://example.com', locale: 'en' }, 'Label'));
  assert.match(safe, /<a href="https:\/\/example\.com"/);
  assert.doesNotMatch(safe, /target=/);
  for (const url of ['javascript:alert(1)', '/relative', '']) {
    const unsafe = renderToStaticMarkup(createElement(ExternalLink, { url, locale: 'en' }, 'Label'));
    assert.doesNotMatch(unsafe, /<a /);
    assert.match(unsafe, /link unavailable/);
  }
});
```

Before writing it, confirm the Spanish archived label: run
`node -e "console.log(require('./messages/es/projects.json').directory.statuses.archived)"`
and use the exact string it prints in place of `En archivo`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: FAIL, cannot find module `../components/projects/shared`.

- [ ] **Step 3: Create the shared module**

`components/projects/shared.tsx`:

```tsx
import type { ReactNode } from 'react';
import { ecosystemCopy, isSafeExternalUrl, type ProjectStatus } from '@/lib/ecosystem-projects';

// Lifted verbatim from EcosystemDirectory so the detail page reuses one
// implementation instead of a second, drifting copy.
export const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950';

export const statusStyles: Record<ProjectStatus, string> = {
  active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  beta: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  archived: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  unknown: 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200',
};

export function ExternalLink({ url, children, locale }: { url: string; children: ReactNode; locale: string }) {
  const t = ecosystemCopy(locale);
  return isSafeExternalUrl(url)
    ? <a href={url} className={`rounded underline underline-offset-4 hover:text-primary break-words ${focus}`}>{children}</a>
    : <span>{children} ({t.linkUnavailable})</span>;
}

export function StatusBadge({ status, locale }: { status: ProjectStatus; locale: string }) {
  const t = ecosystemCopy(locale);
  return <span className={`rounded-full px-3 py-1 font-semibold capitalize ${statusStyles[status]}`}>{t.statuses[status]}</span>;
}
```

- [ ] **Step 4: Rewire the directory**

In `components/projects/EcosystemDirectory.tsx`, delete the local `focus` constant, the `statusStyles` object and the `ExternalLink` function, then add to the imports:

```tsx
import { ExternalLink, StatusBadge, focus } from './shared';
```

Replace the badge span in the card header with:

```tsx
<StatusBadge status={project.status} locale={locale} />
```

Remove `isSafeExternalUrl` from the import list only if nothing else in the file still uses it. It is still used by the `evidencedPeople` filter, so it stays.

- [ ] **Step 5: Run the full suite to prove the refactor changed no output**

Run: `npm test`
Expected: PASS, 262 existing tests plus the 2 new ones. The existing
`tests/ecosystem-projects.test.ts` render assertions are what prove the
directory markup is unchanged.

- [ ] **Step 6: Commit**

```bash
git add components/projects/shared.tsx components/projects/EcosystemDirectory.tsx tests/ecosystem-detail.test.ts
git commit -m "refactor(projects): lift shared directory primitives into one module"
```

---

### Task 2: Snapshot generator and accessor

**Files:**
- Create: `scripts/generate-ecosystem-snapshot.mjs`
- Create: `lib/ecosystem-snapshot.ts`
- Create: `lib/generated/ecosystem-snapshot.json` (by running the generator)
- Create: `tests/ecosystem-snapshot-generator.test.ts`
- Modify: `package.json`, `.env.example`

**Interfaces:**
- Produces, from the script: `repoSlug(repository: string): string | null`, `toDate(value: unknown): string | null`, `pickReleases(releases: unknown[], max?: number): Release[]`.
- Produces, from `lib/ecosystem-snapshot.ts`: `type Release = { tag: string; date: string; url: string; prerelease: boolean }`, `type ProjectSnapshot = { slug: string; canonicalSlug: string; archived: boolean; createdAt: string; pushedAt: string; license: string | null; language: string | null; topics: string[]; releases: Release[] }`, `getProjectSnapshot(id: string): ProjectSnapshot | undefined`, `snapshotGeneratedAt(): string`.

- [ ] **Step 1: Write the failing generator test**

Create `tests/ecosystem-snapshot-generator.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { repoSlug, toDate, pickReleases } from '../scripts/generate-ecosystem-snapshot.mjs';

const OUT = new URL('../lib/generated/ecosystem-snapshot.json', import.meta.url);

test('repoSlug extracts owner/repo and rejects anything else', () => {
  assert.equal(repoSlug('https://github.com/v0l/snort'), 'v0l/snort');
  assert.equal(repoSlug('https://github.com/v0l/snort/'), 'v0l/snort');
  assert.equal(repoSlug('https://github.com/v0l/snort.git'), 'v0l/snort');
  for (const bad of ['https://gitlab.com/a/b', 'https://github.com/onlyowner', 'not a url', '']) {
    assert.equal(repoSlug(bad), null, bad);
  }
});

test('toDate narrows an API timestamp to a calendar date', () => {
  assert.equal(toDate('2026-09-30T11:22:33Z'), '2026-09-30');
  for (const bad of [null, undefined, 42, {}]) assert.equal(toDate(bad), null);
});

test('importing the generator runs nothing and touches no network or disk', async () => {
  // The script is importable so its pure functions can be tested. The
  // entry-point guard is what keeps an import from firing 82 API requests.
  const before = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  await import('../scripts/generate-ecosystem-snapshot.mjs');
  const after = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  assert.equal(after, before, 'importing the generator rewrote the snapshot');
});

test('pickReleases drops drafts, keeps and flags prereleases, sorts newest first and caps', () => {
  const input = [
    { tag_name: 'v3', published_at: '2026-01-03T00:00:00Z', html_url: 'https://e.com/3', draft: false, prerelease: false },
    { tag_name: 'draft', published_at: '2026-01-09T00:00:00Z', html_url: 'https://e.com/d', draft: true, prerelease: false },
    { tag_name: 'v4-rc', published_at: '2026-01-04T00:00:00Z', html_url: 'https://e.com/4', draft: false, prerelease: true },
    { tag_name: 'v1', published_at: '2026-01-01T00:00:00Z', html_url: 'https://e.com/1', draft: false, prerelease: false },
    { tag_name: 'broken', published_at: null, html_url: 'https://e.com/b', draft: false, prerelease: false },
  ];
  assert.deepEqual(pickReleases(input, 2), [
    { tag: 'v4-rc', date: '2026-01-04', url: 'https://e.com/4', prerelease: true },
    { tag: 'v3', date: '2026-01-03', url: 'https://e.com/3', prerelease: false },
  ]);
  assert.deepEqual(pickReleases([]), []);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test tests/ecosystem-snapshot-generator.test.ts`
Expected: FAIL, cannot find module `../scripts/generate-ecosystem-snapshot.mjs`.

- [ ] **Step 3: Write the generator**

`scripts/generate-ecosystem-snapshot.mjs`:

```js
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'ecosystem-projects.json');
const OUTPUT_PATH = process.env.ECOSYSTEM_SNAPSHOT_OUT
  || path.join(ROOT, 'lib', 'generated', 'ecosystem-snapshot.json');
const MAX_RELEASES = 5;
const API = 'https://api.github.com';

/** @param {string} repository */
export function repoSlug(repository) {
  if (typeof repository !== 'string') return null;
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(repository);
  return match ? `${match[1]}/${match[2]}` : null;
}

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
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
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
```

Note `license` maps `NOASSERTION` to `null`: GitHub returns that for
unrecognised licences (Gossip and Zeus both do), and rendering the literal
string would be worse than rendering "not stated".

- [ ] **Step 4: Run the generator test to verify it passes**

Run: `npx tsx --test tests/ecosystem-snapshot-generator.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Add the npm script and document the variable**

In `package.json` scripts, after `"audit:seo"`:

```json
"ecosystem:snapshot": "node scripts/generate-ecosystem-snapshot.mjs"
```

Append to `.env.example`:

```
# Read-only GitHub token for `npm run ecosystem:snapshot`. Falls back to `gh auth token`.
GITHUB_TOKEN=
```

- [ ] **Step 6: Generate the real snapshot**

Run: `npm run ecosystem:snapshot`
Expected: `[ecosystem-snapshot] wrote 41 projects, N renamed, to .../ecosystem-snapshot.json`.
Read the renamed warnings and keep them: they are the reason the field exists.

- [ ] **Step 7: Write the accessor**

`lib/ecosystem-snapshot.ts`:

```ts
import snapshot from '@/lib/generated/ecosystem-snapshot.json';

export type Release = { tag: string; date: string; url: string; prerelease: boolean };

export type ProjectSnapshot = {
  slug: string;
  canonicalSlug: string;
  archived: boolean;
  createdAt: string;
  pushedAt: string;
  license: string | null;
  language: string | null;
  topics: string[];
  releases: Release[];
};

const projects = snapshot.projects as unknown as Record<string, ProjectSnapshot>;

export function getProjectSnapshot(id: string): ProjectSnapshot | undefined {
  return projects[id];
}

export function snapshotGeneratedAt(): string {
  return snapshot.generatedAt;
}

export function snapshotIds(): string[] {
  return Object.keys(projects);
}
```

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-ecosystem-snapshot.mjs lib/ecosystem-snapshot.ts lib/generated/ecosystem-snapshot.json tests/ecosystem-snapshot-generator.test.ts package.json .env.example
git commit -m "feat(projects): generate a committed repository evidence snapshot"
```

---

### Task 3: Dataset helpers for lookup and related reports

**Files:**
- Modify: `lib/ecosystem-projects.ts` (append)
- Test: `tests/ecosystem-detail.test.ts` (append)

**Interfaces:**
- Produces: `repositorySlug(repository: string): string | null`, `findProject(data: EcosystemData, id: string): EcosystemProject | undefined`, `relatedReports(project: EcosystemProject, data: EcosystemData): { news: EcosystemNews[]; security: EcosystemNews[] }`.

- [ ] **Step 1: Write the failing test**

Append to `tests/ecosystem-detail.test.ts`:

```ts
test('related reports match on repository slug in any evidence URL, never on names', async () => {
  const { relatedReports, repositorySlug, findProject } = await import('../lib/ecosystem-projects');
  assert.equal(repositorySlug('https://github.com/greenart7c3/Amber'), 'greenart7c3/Amber');
  assert.equal(repositorySlug('https://example.com/x'), null);

  const data = {
    checkedAt: '2026-10-04',
    projects: [
      { id: 'amber', name: 'Amber', summary: 's', category: 'signer', status: 'active' as const,
        statusNote: 'n', website: 'https://github.com/greenart7c3/Amber',
        repository: 'https://github.com/greenart7c3/Amber', lastVerified: '2026-10-04',
        people: [], sources: [{ label: 'README', url: 'https://github.com/greenart7c3/Amber' }] },
      { id: 'lonely', name: 'Amber Clone', summary: 's', category: 'signer', status: 'active' as const,
        statusNote: 'n', website: 'https://example.com',
        repository: 'https://github.com/someone/else', lastVerified: '2026-10-04',
        people: [], sources: [{ label: 'README', url: 'https://example.com' }] },
    ],
    news: [
      { title: 'Amber v6.6.5', date: '2026-09-21', summary: 's',
        url: 'https://github.com/greenart7c3/Amber/releases/tag/v6.6.5' },
      { title: 'Unrelated', date: '2026-09-01', summary: 's', url: 'https://example.net/x' },
    ],
    security: [
      { title: 'Amber hardening', date: '2026-09-21', summary: 's', url: 'https://example.net/y',
        sources: [{ label: 'commit', url: 'https://github.com/greenart7c3/Amber/commit/abc' }] },
    ],
  };

  assert.equal(findProject(data, 'amber')?.name, 'Amber');
  assert.equal(findProject(data, 'missing'), undefined);

  const amber = relatedReports(data.projects[0], data);
  assert.deepEqual(amber.news.map(r => r.title), ['Amber v6.6.5']);
  assert.deepEqual(amber.security.map(r => r.title), ['Amber hardening']);

  // "Amber Clone" shares the project NAME but not the repository slug.
  const lonely = relatedReports(data.projects[1], data);
  assert.deepEqual(lonely, { news: [], security: [] });
});

test('matching is case insensitive on the slug and survives real data', async () => {
  const { relatedReports } = await import('../lib/ecosystem-projects');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const matched = data.projects.filter((p: never) => {
    const r = relatedReports(p, data);
    return r.news.length + r.security.length > 0;
  });
  // Measured on the 2026-10-04 dataset. If this number moves, the dataset
  // changed; confirm the new value is right rather than loosening the test.
  assert.equal(matched.length, 5);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: FAIL, `relatedReports is not a function`.

- [ ] **Step 3: Implement the helpers**

Append to `lib/ecosystem-projects.ts`:

```ts
export function repositorySlug(repository: string): string | null {
  if (typeof repository !== 'string') return null;
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(repository);
  return match ? `${match[1]}/${match[2]}` : null;
}

export function findProject(data: EcosystemData, id: string): EcosystemProject | undefined {
  return data.projects.find(project => project.id === id);
}

// A report belongs to a project when the project's repository slug appears in
// the report's own URL or in any of its source URLs. Matching on URLs rather
// than on project names in prose is what keeps this from inventing
// relationships between similarly named projects.
export function relatedReports(project: EcosystemProject, data: EcosystemData) {
  const slug = repositorySlug(project.repository)?.toLowerCase();
  const matches = (report: EcosystemNews) => !!slug && [report.url, ...(report.sources ?? []).map(source => source.url)]
    .some(url => typeof url === 'string' && url.toLowerCase().includes(slug));
  return { news: data.news.filter(matches), security: data.security.filter(matches) };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: PASS. If the real-data count is not 5, stop and reconcile against
the spec's recorded measurement before changing the number.

- [ ] **Step 5: Commit**

```bash
git add lib/ecosystem-projects.ts tests/ecosystem-detail.test.ts
git commit -m "feat(projects): match reports to projects by repository slug"
```

---

### Task 4: SEO copy composition and JSON-LD builder

**Files:**
- Create: `lib/project-seo.ts`
- Modify: `messages/{en,es,pt,ru,it,fr,de}/projects.json`
- Test: `tests/ecosystem-detail.test.ts` (append)

**Interfaces:**
- Consumes: `getProjectSnapshot`, `snapshotGeneratedAt` from Task 2; `categoryLabel`, `ecosystemCopy`, `isSafeExternalUrl` from `lib/ecosystem-projects.ts`.
- Produces: `projectTitle(project, locale): string`, `projectDescription(project, locale): string`, `projectJsonLd({ project, snapshot, url, locale }): object`.

The message `detail` namespace holds `titleTemplates` and `descriptionSuffixes`
as **arrays ordered longest first**. Composition is first-fit: take the first
candidate that is at or under the upper bound. This is required, not defensive:
project names run from 3 to 14 characters, and no single English template keeps
every one inside the 45 to 57 window (one measured template spans 49 to 58,
another 39 to 48).

- [ ] **Step 1: Write the failing test**

Append to `tests/ecosystem-detail.test.ts`:

```ts
test('every project composes a title and description inside the policy window', async () => {
  const { projectTitle, projectDescription } = await import('../lib/project-seo');
  const { SEO_LIMITS } = await import('../lib/metadata-policy');
  const { readFileSync } = await import('node:fs');
  const [titleMin, titleMax] = SEO_LIMITS.title;
  const [descMin, descMax] = SEO_LIMITS.description;

  for (const locale of ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de']) {
    const file = locale === 'en' ? 'ecosystem-projects.json' : `ecosystem-projects.${locale}.json`;
    const data = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
    for (const project of data.projects) {
      const title = projectTitle(project, locale);
      const length = Array.from(title).length;
      assert.ok(length >= titleMin && length <= titleMax,
        `${locale}/${project.id}: title is ${length} chars: ${title}`);

      const description = projectDescription(project, locale);
      const dLength = Array.from(description).length;
      assert.ok(dLength <= descMax, `${locale}/${project.id}: description is ${dLength} chars`);
      // A summary longer than the upper bound is truncated by the policy on a
      // word boundary, which is correct. Everything else must reach the lower
      // bound so the policy never pads with generic filler.
      if (Array.from(project.summary).length <= descMax) {
        assert.ok(dLength >= descMin, `${locale}/${project.id}: description is only ${dLength} chars: ${description}`);
      }
    }
  }
});

test('project JSON-LD describes the software, cites its sources and breadcrumbs correctly', async () => {
  const { projectJsonLd } = await import('../lib/project-seo');
  const project = {
    id: 'snort', name: 'Snort', summary: 'A Nostr web client.', category: 'social-client',
    status: 'active' as const, statusNote: 'note', website: 'https://snort.social',
    repository: 'https://github.com/v0l/snort', lastVerified: '2026-10-04', people: [],
    sources: [{ label: 'README', url: 'https://github.com/v0l/snort/blob/main/README.md' }],
  };
  const snapshot = {
    slug: 'v0l/snort', canonicalSlug: 'v0l/snort', archived: false,
    createdAt: '2022-12-18', pushedAt: '2026-09-30', license: 'MIT', language: 'TypeScript',
    topics: ['nostr'], releases: [
      { tag: 'v0.6.0-rc1', date: '2026-05-01', url: 'https://e.com/rc', prerelease: true },
      { tag: 'v0.5.3', date: '2026-04-08', url: 'https://e.com/5', prerelease: false },
    ],
  };
  const graphs = projectJsonLd({ project, snapshot, url: 'https://nostrwot.com/projects/snort', locale: 'en' }) as any[];
  const app = graphs.find(g => g['@type'] === 'SoftwareApplication');
  const crumbs = graphs.find(g => g['@type'] === 'BreadcrumbList');

  assert.equal(app.name, 'Snort');
  assert.equal(app.url, 'https://snort.social');
  assert.equal(app.codeRepository, 'https://github.com/v0l/snort');
  assert.equal(app.license, 'https://spdx.org/licenses/MIT.html');
  assert.equal(app.programmingLanguage, 'TypeScript');
  assert.equal(app.datePublished, '2022-12-18');
  assert.equal(app.dateModified, '2026-09-30');
  // A prerelease must never be presented as the current version.
  assert.equal(app.softwareVersion, 'v0.5.3');
  assert.deepEqual(app.citation.map((c: any) => c.url), ['https://github.com/v0l/snort/blob/main/README.md']);
  assert.equal(app.mainEntityOfPage['@id'], 'https://nostrwot.com/projects/snort');
  assert.equal(crumbs.itemListElement.length, 3);
  assert.deepEqual(crumbs.itemListElement.map((i: any) => i.name), ['Nostr WoT', 'Projects', 'Snort']);

  // No unsafe or absent values may leak into the graph.
  const archived = projectJsonLd({
    project: { ...project, website: 'javascript:alert(1)' },
    snapshot: { ...snapshot, license: null, language: null, releases: [] },
    url: 'https://nostrwot.com/projects/snort', locale: 'en',
  }) as any[];
  const bare = archived.find(g => g['@type'] === 'SoftwareApplication');
  assert.ok(!('url' in bare), 'unsafe website must be omitted, not rendered');
  assert.ok(!('license' in bare));
  assert.ok(!('programmingLanguage' in bare));
  assert.ok(!('softwareVersion' in bare));
  assert.ok(!JSON.stringify(archived).includes('javascript:'));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: FAIL, cannot find module `../lib/project-seo`.

- [ ] **Step 3: Add the English message keys**

In `messages/en/projects.json`, add a `detail` object as a sibling of
`directory`:

```json
"detail": {
  "backToDirectory": "Back to the directory",
  "evidenceHeading": "Status evidence",
  "repositoryFacts": "Repository facts",
  "license": "License",
  "primaryLanguage": "Primary language",
  "firstPublished": "Repository created",
  "lastPush": "Last public push",
  "topics": "Repository topics",
  "renamedFrom": "Now resolves to",
  "notStated": "Not stated",
  "releaseHistory": "Release history",
  "prerelease": "prerelease",
  "noReleases": "No published releases were found for this repository.",
  "relatedNews": "Related ecosystem news",
  "relatedSecurity": "Related security reports",
  "snapshotTaken": "Repository facts collected",
  "visitWebsite": "Project website",
  "visitRepository": "Source repository",
  "breadcrumbProjects": "Projects",
  "titleTemplates": [
    "{name}: Nostr project status and evidence record",
    "{name}: status and evidence on Nostr WoT",
    "{name} on the Nostr WoT project directory"
  ],
  "descriptionSuffixes": [
    "Status, maintainer evidence, cited sources and release history for this Nostr project, with the date it was last verified.",
    "Status, cited sources and release history for this Nostr project, with the date it was last verified.",
    "Status, sources and release history, with the date this record was last verified.",
    "Status, sources and the date this record was last verified."
  ]
}
```

Then translate the same key set into the six other
`messages/<locale>/projects.json` files. Every locale needs the identical key
set and the identical `{name}` argument, or `tests/translations.test.ts` fails.
Candidate arrays may differ in length between locales, because what fits the
window differs per language; the first-fit test in Step 1 is what proves each
locale's list is sufficient. No em dashes.

- [ ] **Step 4: Write the composer and builder**

`lib/project-seo.ts`:

```ts
import { SEO_LIMITS } from '@/lib/metadata-policy';
import { categoryLabel, ecosystemCopy, isSafeExternalUrl, type EcosystemProject } from '@/lib/ecosystem-projects';
import type { ProjectSnapshot } from '@/lib/ecosystem-snapshot';

const graphemes = (value: string) => Array.from(value).length;

// First fit against an ordered, longest-first candidate list. Project names run
// from 3 to 14 characters and no single template keeps all of them inside the
// 45 to 57 window, so a list is required rather than one format string.
function firstFit(candidates: string[], max: number): string {
  return candidates.find(candidate => graphemes(candidate) <= max) ?? candidates[candidates.length - 1];
}

export function projectTitle(project: EcosystemProject, locale = 'en'): string {
  const templates: string[] = ecosystemDetail(locale).titleTemplates;
  return firstFit(templates.map(template => template.replace('{name}', project.name)), SEO_LIMITS.title[1]);
}

export function projectDescription(project: EcosystemProject, locale = 'en'): string {
  const suffixes: string[] = ecosystemDetail(locale).descriptionSuffixes;
  const candidates = suffixes.map(suffix => `${project.summary} ${suffix}`);
  return firstFit([...candidates, project.summary], SEO_LIMITS.description[1]);
}

export function ecosystemDetail(locale = 'en') {
  // `ecosystemCopy` resolves the whole locale object with an English fallback;
  // `detail` sits beside `directory` in the same file, so it is read the same way.
  return ecosystemCopy(locale, 'detail');
}

export function projectJsonLd({ project, snapshot, url, locale }: {
  project: EcosystemProject;
  snapshot: ProjectSnapshot | undefined;
  url: string;
  locale: string;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostrwot.com';
  const t = ecosystemDetail(locale);
  const stable = snapshot?.releases.find(release => !release.prerelease);

  const application: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: project.summary,
    applicationCategory: categoryLabel(project.category, locale),
    mainEntityOfPage: { '@id': url },
    ...(isSafeExternalUrl(project.website) ? { url: project.website } : {}),
    ...(isSafeExternalUrl(project.repository) ? { codeRepository: project.repository } : {}),
    ...(snapshot?.license ? { license: `https://spdx.org/licenses/${snapshot.license}.html` } : {}),
    ...(snapshot?.language ? { programmingLanguage: snapshot.language } : {}),
    ...(snapshot?.createdAt ? { datePublished: snapshot.createdAt } : {}),
    ...(snapshot?.pushedAt ? { dateModified: snapshot.pushedAt } : {}),
    ...(stable ? { softwareVersion: stable.tag } : {}),
    ...(snapshot?.topics.length ? { keywords: snapshot.topics.join(', ') } : {}),
  };

  const citations = project.sources.filter(source => isSafeExternalUrl(source.url));
  if (citations.length) {
    application.citation = citations.map(source => ({
      '@type': 'CreativeWork', name: source.label, url: source.url,
    }));
  }

  const prefix = locale === 'en' ? '' : `/${locale}`;
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { name: 'Nostr WoT', item: `${base}${prefix}` },
      { name: t.breadcrumbProjects, item: `${base}${prefix}/projects` },
      { name: project.name, item: url },
    ].map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
  };

  return [application, breadcrumbs];
}
```

`ecosystemCopy` currently takes only a locale and returns `directory`. Widen it
to accept an optional namespace, keeping the existing default so every current
caller is unchanged:

```ts
export function ecosystemCopy(locale = "en", namespace: 'directory' | 'detail' = 'directory') {
  const messages = projectMessages[locale as keyof typeof projectMessages] ?? enMessages;
  return (messages as never)[namespace] ?? (enMessages as never)[namespace];
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: PASS. A title or description failure names the locale and project:
add or reorder that locale's candidate templates until every project fits.
Do not widen the assertion.

- [ ] **Step 6: Run the translation suite**

Run: `npx tsx --test tests/translations.test.ts`
Expected: PASS. A failure here means a key or ICU argument is missing from a
locale.

- [ ] **Step 7: Commit**

```bash
git add lib/project-seo.ts lib/ecosystem-projects.ts messages tests/ecosystem-detail.test.ts
git commit -m "feat(projects): compose project page copy and structured data"
```

---

### Task 5: The ProjectDetail component

**Files:**
- Create: `components/projects/ProjectDetail.tsx`
- Test: `tests/ecosystem-detail.test.ts` (append)

**Interfaces:**
- Consumes: `ExternalLink`, `StatusBadge` (Task 1); `relatedReports` (Task 3); `ecosystemDetail` (Task 4); `getProjectSnapshot`, `snapshotGeneratedAt` (Task 2).
- Produces: default export `ProjectDetail({ project, data, locale, directoryHref })`.

- [ ] **Step 1: Write the failing test**

Append to `tests/ecosystem-detail.test.ts`:

```ts
test('the detail page shows every evidence section in each locale and invents nothing', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const { readFileSync } = await import('node:fs');

  for (const locale of ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de']) {
    const file = locale === 'en' ? 'ecosystem-projects.json' : `ecosystem-projects.${locale}.json`;
    const data = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
    const project = data.projects.find((p: { id: string }) => p.id === 'amber');
    const html = renderToStaticMarkup(createElement(ProjectDetail, {
      project, data, locale, directoryHref: locale === 'en' ? '/projects' : `/${locale}/projects`,
    } as never));

    assert.ok(html.includes(project.summary), `${locale}: summary missing`);
    assert.ok(html.includes(project.statusNote), `${locale}: status note missing`);
    assert.ok(html.includes('github.com/greenart7c3/Amber'), `${locale}: repository link missing`);
    assert.ok(html.includes(`href="${locale === 'en' ? '/projects' : `/${locale}/projects`}"`), `${locale}: back link missing`);
    // Amber is one of the five projects with matched reports.
    assert.ok(html.includes('v6.6.5'), `${locale}: related reports missing`);
    if (locale !== 'en') {
      const english = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
      const englishAmber = english.projects.find((p: { id: string }) => p.id === 'amber');
      assert.ok(!html.includes(englishAmber.summary), `${locale}: English summary leaked`);
    }
  }
});

test('a project with no related reports omits those sections entirely', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const project = data.projects.find((p: { id: string }) => p.id === 'shopstr');
  const html = renderToStaticMarkup(createElement(ProjectDetail, {
    project, data, locale: 'en', directoryHref: '/projects',
  } as never));
  assert.doesNotMatch(html, /Related ecosystem news/);
  assert.doesNotMatch(html, /Related security reports/);
  assert.match(html, /Repository facts/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: FAIL, cannot find module `../components/projects/ProjectDetail`.

- [ ] **Step 3: Write the component**

`components/projects/ProjectDetail.tsx`:

```tsx
import { categoryLabel, ecosystemCopy, ecosystemDate, relatedReports, type EcosystemData, type EcosystemNews, type EcosystemProject, isSafeExternalUrl } from '@/lib/ecosystem-projects';
import { ecosystemDetail } from '@/lib/project-seo';
import { getProjectSnapshot, snapshotGeneratedAt } from '@/lib/ecosystem-snapshot';
import { ExternalLink, StatusBadge, focus } from './shared';

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  // The site has no facts-table component; `<p><strong>label</strong> value</p>`
  // is the existing house pattern in the directory cards.
  return <p><strong>{label}</strong> {children}</p>;
}

function Reports({ title, items, locale }: { title: string; items: EcosystemNews[]; locale: string }) {
  if (!items.length) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="mt-3 space-y-3 text-sm">
        {items.map((item, index) => (
          <li key={`${item.url}-${index}`}>
            <time dateTime={item.date}>{ecosystemDate(item.date, locale)}</time>
            {' · '}
            <ExternalLink locale={locale} url={item.url}>{item.title}</ExternalLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProjectDetail({ project, data, locale, directoryHref }: {
  project: EcosystemProject;
  data: EcosystemData;
  locale: string;
  directoryHref: string;
}) {
  const t = ecosystemCopy(locale);
  const d = ecosystemDetail(locale);
  const snapshot = getProjectSnapshot(project.id);
  const reports = relatedReports(project, data);
  const people = project.people.filter(person => isSafeExternalUrl(person.sourceUrl));

  return (
    <article lang={locale} className="mx-auto max-w-3xl px-6 py-12">
      <a href={directoryHref} className={`text-sm underline underline-offset-4 ${focus}`}>{d.backToDirectory}</a>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-gray-600 dark:text-gray-300">{categoryLabel(project.category, locale)}</span>
          <StatusBadge status={project.status} locale={locale} />
        </div>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">{project.name}</h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">{project.summary}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <ExternalLink locale={locale} url={project.website}>{d.visitWebsite}</ExternalLink>
          <ExternalLink locale={locale} url={project.repository}>{d.visitRepository}</ExternalLink>
        </div>
      </header>

      <section className="mt-8 text-sm leading-relaxed">
        <h2 className="text-xl font-bold">{d.evidenceHeading}</h2>
        <p className="mt-3">{project.statusNote || t.notVerified}</p>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          {t.lastChecked}{' '}
          {project.lastVerified
            ? <time dateTime={project.lastVerified}>{ecosystemDate(project.lastVerified, locale)}</time>
            : t.unverified}. {t.statusNotice}
        </p>
      </section>

      {snapshot && (
        <section className="mt-8 space-y-2 text-sm leading-relaxed">
          <h2 className="text-xl font-bold">{d.repositoryFacts}</h2>
          <Fact label={d.license}>{snapshot.license ?? d.notStated}</Fact>
          <Fact label={d.primaryLanguage}>{snapshot.language ?? d.notStated}</Fact>
          <Fact label={d.firstPublished}><time dateTime={snapshot.createdAt}>{ecosystemDate(snapshot.createdAt, locale)}</time></Fact>
          <Fact label={d.lastPush}><time dateTime={snapshot.pushedAt}>{ecosystemDate(snapshot.pushedAt, locale)}</time></Fact>
          {snapshot.topics.length > 0 && <Fact label={d.topics}>{snapshot.topics.join(', ')}</Fact>}
          {snapshot.canonicalSlug.toLowerCase() !== snapshot.slug.toLowerCase() && (
            <Fact label={d.renamedFrom}>
              <ExternalLink locale={locale} url={`https://github.com/${snapshot.canonicalSlug}`}>{snapshot.canonicalSlug}</ExternalLink>
            </Fact>
          )}
          <p className="text-gray-600 dark:text-gray-300">
            {d.snapshotTaken} <time dateTime={snapshotGeneratedAt()}>{ecosystemDate(snapshotGeneratedAt(), locale)}</time>.
          </p>
        </section>
      )}

      <section className="mt-8 text-sm leading-relaxed">
        <h2 className="text-xl font-bold">{d.releaseHistory}</h2>
        {snapshot?.releases.length
          ? <ol className="mt-3 space-y-2">
              {snapshot.releases.map(release => (
                <li key={release.url}>
                  <time dateTime={release.date}>{ecosystemDate(release.date, locale)}</time>
                  {' · '}
                  <ExternalLink locale={locale} url={release.url}>{release.tag}</ExternalLink>
                  {release.prerelease && <span className="ml-2 text-gray-600 dark:text-gray-300">({d.prerelease})</span>}
                </li>
              ))}
            </ol>
          : <p className="mt-3">{d.noReleases}</p>}
      </section>

      <section className="mt-8 text-sm leading-relaxed">
        <h2 className="text-xl font-bold">{t.people}</h2>
        {!people.some(person => person.role === 'founder') && (
          <p className="mt-3 text-gray-600 dark:text-gray-300">{t.unknownFounder}</p>
        )}
        {people.length > 0 && (
          <ul className="mt-3 space-y-3">
            {people.map((person, index) => (
              <li key={`${person.name}-${index}`}>
                <p><strong>{person.name}</strong> <span className="capitalize">· {t.roles[person.role]}</span></p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
                  <ExternalLink locale={locale} url={person.sourceUrl}>{t.roleEvidence}</ExternalLink>
                  {person.profiles.map((profile, i) => (
                    <ExternalLink locale={locale} key={`${profile.url}-${i}`} url={profile.url}>{profile.label}</ExternalLink>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 text-sm leading-relaxed">
        <h2 className="text-xl font-bold">{t.sources}</h2>
        {project.sources.length
          ? <ul className="mt-3 space-y-2">
              {project.sources.map((source, index) => (
                <li key={`${source.url}-${index}`}><ExternalLink locale={locale} url={source.url}>{source.label}</ExternalLink></li>
              ))}
            </ul>
          : <p className="mt-3">{t.noSources}</p>}
      </section>

      <Reports title={d.relatedNews} items={reports.news} locale={locale} />
      <Reports title={d.relatedSecurity} items={reports.security} locale={locale} />
    </article>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/projects/ProjectDetail.tsx tests/ecosystem-detail.test.ts
git commit -m "feat(projects): render a per-project evidence record"
```

---

### Task 6: The route and its sitemap entries

Route and sitemap land in **one** task on purpose. `tests/sitemap.test.ts`
asserts the sitemap URL set exactly equals an independently reconstructed set,
so a route that renders pages which are not yet listed leaves the suite red.
Splitting these would mean committing a failing test.


**Files:**
- Create: `app/[locale]/projects/[id]/page.tsx`
- Modify: `tests/sitemap.test.ts` (the `dynamic` allow-list and the expected URL set)
- Modify: `app/sitemap.ts`
- Test: `tests/ecosystem-detail.test.ts` (append)

**Interfaces:**
- Consumes: everything from Tasks 1 to 5.
- Produces: the route, plus `generateStaticParams` returning 287 entries.

- [ ] **Step 1: Write the failing test**

Append to `tests/ecosystem-detail.test.ts`:

```ts
test('the route enumerates every project in every locale', async () => {
  const { generateStaticParams } = await import('../app/[locale]/projects/[id]/page');
  const { locales } = await import('../i18n/config');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const params = await generateStaticParams();
  assert.equal(params.length, locales.length * data.projects.length);
  assert.equal(new Set(params.map((p: { locale: string; id: string }) => `${p.locale}/${p.id}`)).size, params.length);
  for (const locale of locales) {
    assert.ok(params.some((p: { locale: string; id: string }) => p.locale === locale && p.id === 'amber'), locale);
  }
});

test('every project id has a snapshot entry and the snapshot invents none', async () => {
  const { snapshotIds, snapshotGeneratedAt } = await import('../lib/ecosystem-snapshot');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const ids = new Set<string>(data.projects.map((p: { id: string }) => p.id));
  assert.deepEqual(new Set(snapshotIds()), ids, 'dataset and snapshot have drifted');
  assert.match(snapshotGeneratedAt(), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(snapshotGeneratedAt() <= new Date().toISOString().slice(0, 10), 'snapshot is dated in the future');
});

test('snapshot evidence URLs are https and safe', async () => {
  const { getProjectSnapshot, snapshotIds } = await import('../lib/ecosystem-snapshot');
  const { isSafeExternalUrl } = await import('../lib/ecosystem-projects');
  const today = new Date().toISOString().slice(0, 10);
  for (const id of snapshotIds()) {
    const snapshot = getProjectSnapshot(id)!;
    for (const date of [snapshot.createdAt, snapshot.pushedAt]) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/, id);
      assert.ok(date <= today, `${id}: ${date} is in the future`);
    }
    for (const release of snapshot.releases) {
      assert.ok(release.url.startsWith('https://') && isSafeExternalUrl(release.url), `${id}: ${release.url}`);
      assert.ok(release.date <= today, `${id}: release ${release.tag} is dated in the future`);
    }
  }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: FAIL, cannot find the route module.

- [ ] **Step 3: Write the route**

`app/[locale]/projects/[id]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { generateAlternates, generateOpenGraph, getFullUrl } from '@/lib/metadata';
import { JsonLd } from '@/lib/jsonld';
import { locales, type Locale } from '@/i18n/config';
import { findProject, type EcosystemData } from '@/lib/ecosystem-projects';
import { getProjectSnapshot } from '@/lib/ecosystem-snapshot';
import { projectDescription, projectJsonLd, projectTitle } from '@/lib/project-seo';
import ProjectDetail from '@/components/projects/ProjectDetail';

import ecosystemData from '@/data/ecosystem-projects.json';
import esEcosystemData from '@/data/ecosystem-projects.es.json';
import deEcosystemData from '@/data/ecosystem-projects.de.json';
import frEcosystemData from '@/data/ecosystem-projects.fr.json';
import itEcosystemData from '@/data/ecosystem-projects.it.json';
import ptEcosystemData from '@/data/ecosystem-projects.pt.json';
import ruEcosystemData from '@/data/ecosystem-projects.ru.json';

const byLocale = {
  en: ecosystemData, es: esEcosystemData, de: deEcosystemData, fr: frEcosystemData,
  it: itEcosystemData, pt: ptEcosystemData, ru: ruEcosystemData,
};

function dataFor(locale: string): EcosystemData {
  return (byLocale[locale as Locale] ?? ecosystemData) as unknown as EcosystemData;
}

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  // The seven locale datasets are asserted to carry identical, index-aligned
  // id lists, so one id list is correct for every locale.
  const ids = (ecosystemData as unknown as EcosystemData).projects.map(project => project.id);
  return locales.flatMap(locale => ids.map(id => ({ locale, id })));
}

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const project = findProject(dataFor(locale), id);
  if (!project) return { title: 'Project Not Found' };
  const title = projectTitle(project, locale);
  const description = projectDescription(project, locale);
  return {
    title,
    description,
    alternates: generateAlternates(`/projects/${id}`, locale as Locale),
    openGraph: generateOpenGraph({ title, description, path: `/projects/${id}`, locale: locale as Locale, type: 'article' }),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, id } = await params;
  const data = dataFor(locale);
  const project = findProject(data, id);
  if (!project) notFound();

  const url = getFullUrl(`/projects/${id}`, locale as Locale);
  const graphs = projectJsonLd({ project, snapshot: getProjectSnapshot(id), url, locale });

  return (
    <>
      <JsonLd data={graphs} />
      <main>
        <ProjectDetail
          project={project}
          data={data}
          locale={locale}
          directoryHref={locale === 'en' ? '/projects' : `/${locale}/projects`}
        />
      </main>
    </>
  );
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
```

- [ ] **Step 4: Register the route in the page coverage test**

In `tests/sitemap.test.ts`, inside the `dynamic` set, add with its rationale:

```ts
    // 41 project records times 7 locales, enumerated by generateStaticParams
    // and emitted into the sitemap by app/sitemap.ts, so the path pattern
    // itself is never a URL.
    '/projects/[id]',
```

- [ ] **Step 5: Extend the expected URL set in the same test**

Add the import at the top of `tests/sitemap.test.ts`:

```ts
import ecosystemProjects from '../data/ecosystem-projects.json';
```

and, inside the existing `for (const locale of locales)` loop of the second
test, after the static-route line:

```ts
    for (const project of ecosystemProjects.projects) expected.add(url(`/projects/${project.id}`, locale));
```

- [ ] **Step 6: Run it to verify it fails for the right reason**

Run: `npx tsx --test tests/sitemap.test.ts`
Expected: FAIL, the actual set is missing 287 project URLs. This proves the
test is really checking the sitemap rather than passing vacuously.

- [ ] **Step 7: Emit the entries**

In `app/sitemap.ts`, add the import beside the others:

```ts
import ecosystemProjects from "@/data/ecosystem-projects.json";
```

and, after the blog/guides/news section loop, add:

```ts
  // Every project record exists in all seven locales, so each page's hreflang
  // set is the full locale list. Priority sits below /projects (0.6) so the
  // directory stays the primary target and these remain its spokes.
  for (const project of ecosystemProjects.projects) {
    const languages = Object.fromEntries(locales.map(locale => [locale, getLocalizedUrl(`/projects/${project.id}`, locale)]));
    for (const locale of locales) {
      sitemapEntries.push({
        url: languages[locale],
        lastModified: project.lastVerified,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: { languages },
      });
    }
  }
```

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS, every test. The sitemap test independently verifies that each
hreflang alternate is itself present in the sitemap, which the shared
`languages` object guarantees.

- [ ] **Step 9: Commit**

```bash
git add "app/[locale]/projects/[id]/page.tsx" app/sitemap.ts tests/sitemap.test.ts tests/ecosystem-detail.test.ts
git commit -m "feat(projects): add per-project evidence routes and list them in the sitemap"
```

---

### Task 7: Link the directory to its spokes

**Files:**
- Modify: `components/projects/EcosystemDirectory.tsx`
- Modify: `lib/ecosystem-projects.ts` (`ecosystemJsonLd` item URLs)
- Modify: `messages/{en,es,pt,ru,it,fr,de}/projects.json` (one key)
- Test: `tests/ecosystem-detail.test.ts` (append)

- [ ] **Step 1: Write the failing test**

Append to `tests/ecosystem-detail.test.ts`:

```ts
test('each directory card links to its evidence page and the collection graph points at them', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const { ecosystemJsonLd } = await import('../lib/ecosystem-projects');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));

  const html = renderToStaticMarkup(createElement(Directory, {
    data, locale: 'en', blogHref: '/blog', newsHref: '/news',
  } as never));
  assert.match(html, /href="\/projects\/amber"/);

  const spanish = renderToStaticMarkup(createElement(Directory, {
    data, locale: 'es', blogHref: '/es/blog', newsHref: '/es/news',
  } as never));
  assert.match(spanish, /href="\/es\/projects\/amber"/);

  const ld = ecosystemJsonLd(data, 'https://nostrwot.com/projects', 'en') as never as {
    mainEntity: { itemListElement: { item: { url: string; sameAs?: string } }[] };
  };
  const amber = ld.mainEntity.itemListElement.find(entry => entry.item.url.endsWith('/projects/amber'));
  assert.ok(amber, 'collection graph does not link the project page');
  assert.equal(amber!.item.sameAs, 'https://github.com/greenart7c3/Amber');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test tests/ecosystem-detail.test.ts`
Expected: FAIL on the card link assertion.

- [ ] **Step 3: Add the card link**

Add `"cardEvidence": "Full evidence record"` to the `directory` object of all
seven `messages/<locale>/projects.json` files, translated, no em dashes.

In `EcosystemDirectory.tsx`, add a `projectHref` prop to the card component and
render the link in the card's link row beside Website and Repository:

```tsx
<a href={projectHref} className={`rounded underline underline-offset-4 hover:text-primary ${focus}`}>
  {t.cardEvidence}<span className="sr-only"> {t.for} {project.name}</span>
</a>
```

Build it where the cards are mapped:

```tsx
<ProjectCard
  locale={locale}
  key={project.id}
  project={project}
  projectHref={`${locale === 'en' ? '' : `/${locale}`}/projects/${project.id}`}
/>
```

Keep the existing `<details>` block exactly as it is.

- [ ] **Step 4: Point the collection graph at the pages**

In `ecosystemJsonLd` in `lib/ecosystem-projects.ts`, replace the item body so
the ItemList describes this site's pages and keeps the external site as
`sameAs`:

```ts
        item: {
          '@type': 'CreativeWork',
          name: project.name,
          description: project.summary,
          url: `${url.replace(/\/projects$/, '')}/projects/${project.id}`,
          ...(isSafeExternalUrl(project.website) ? { sameAs: project.website } : {}),
        },
```

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS. `tests/ecosystem-projects.test.ts` has an existing assertion on
the collection graph's item count and names; neither changes.

- [ ] **Step 6: Commit**

```bash
git add components/projects/EcosystemDirectory.tsx lib/ecosystem-projects.ts messages tests/ecosystem-detail.test.ts
git commit -m "feat(projects): link the directory to each project's evidence page"
```

---

### Task 8: Verify in the browser and confirm the structured data

**Files:** none changed unless a defect is found.

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: success, with 287 more static pages than before.

- [ ] **Step 2: Serve and read a page in two locales**

Start the dev server and fetch `/projects/amber` and `/ru/projects/amber`.
Confirm: status badge, repository facts, release history, sources, related
reports, the back link, and no console errors.

- [ ] **Step 3: Extract and inspect the JSON-LD**

For `/projects/amber`, pull every `application/ld+json` block and confirm there
are exactly two graphs, that `SoftwareApplication.softwareVersion` is a stable
tag rather than a prerelease, that `citation` lists the record's sources, and
that `BreadcrumbList` has three correctly ordered items with absolute URLs.
Validate each graph parses as JSON and contains no `<` or raw U+2028/U+2029.

- [ ] **Step 4: Check a renamed repository renders**

Find a project whose `canonicalSlug` differs from `slug` (the generator logged
these in Task 2, Step 6) and confirm its page shows the rename.

- [ ] **Step 5: Confirm the sitemap**

Fetch `/sitemap.xml` and confirm it contains 287 project URLs, each with seven
`xhtml:link` alternates.

- [ ] **Step 6: Open the pull request**

```bash
git push -u origin feat/project-detail-pages
```

Open a PR against `main`. **It depends on #75**, which carries the 41-project
dataset this snapshot was generated from, so note that in the description and
do not merge before it.
