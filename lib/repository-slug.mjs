// @ts-check
/**
 * The `owner/repo` slug of a GitHub repository URL, or null for anything else.
 *
 * Plain ESM rather than `.ts`, for the same reason `lib/sitemap-routes.mjs` is:
 * `scripts/generate-ecosystem-snapshot.mjs` is invoked directly by `node`,
 * before any TypeScript tooling exists, so it cannot import a `.ts` module.
 * `lib/ecosystem-projects.ts` imports this same file (allowed by `allowJs` in
 * tsconfig.json) and re-exports it, so the snapshot generator and the pages
 * that read the snapshot can never disagree about what a repository is called.
 *
 * They were two byte-identical copies of this regular expression before, which
 * is exactly how a snapshot keyed by one spelling stops matching a lookup by
 * the other.
 *
 * `// @ts-check` is load-bearing: without it `tsc` infers types from usage here
 * and never checks this file against the JSDoc below.
 *
 * @param {string} repository
 * @returns {string | null}
 */
export function repositorySlug(repository) {
  if (typeof repository !== 'string') return null;
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(repository);
  return match ? `${match[1]}/${match[2]}` : null;
}
