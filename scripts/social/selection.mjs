/**
 * Select a controlled target without ever falling back to unrelated copy.
 * @param {{slug: string, date?: string, publishedAt?: string}[]} entries
 * @param {Record<string, unknown>} ledger
 * @param {{slug?: string, deployedSlugs?: string[] | null}} options
 */
export function selectPending(entries, ledger, { slug = '', deployedSlugs = null } = {}) {
  if (slug && !entries.some((entry) => entry.slug === slug)) {
    throw new Error(`Unknown social slug: ${slug}`);
  }
  return entries.filter((entry) =>
    !Object.hasOwn(ledger, entry.slug) &&
    (!slug || entry.slug === slug) &&
    (deployedSlugs === null || deployedSlugs.includes(entry.slug))
  ).sort((a, b) =>
    (b.publishedAt || b.date || '').localeCompare(a.publishedAt || a.date || '') ||
    a.slug.localeCompare(b.slug)
  );
}
