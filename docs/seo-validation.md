# Sitemap and metadata validation

The sitemap covers every owned, indexable page in every supported locale:

- All static application pages, including all six documentation routes.
- Published blog posts, guides and news, enumerated independently per locale.
- Nonempty news archive months and numbered, self-canonical news index pages.
- Runtime newsletter editions, only in languages with a validated sent record.

The plain playground landing page is public; its interactive state URLs are not sitemap entries. API endpoints, social image endpoints, redirects, search/tag filters, drafts and missing newsletter translations are excluded. Profile and note viewers accept arbitrary relay-backed identifiers and have no finite site-owned inventory to enumerate. They remain accessible and retain their canonical metadata without inventing sitemap URLs.

## Metadata contract

`lib/metadata-policy.ts` is the final boundary around every localized page's metadata generator. The site's editorial limits are **45–57 Unicode characters for titles** and **145–157 for descriptions**, inclusive, for HTML, Open Graph and Twitter metadata. These are project requirements, not search-engine guarantees.

Authored metadata is retained when it fits. Short copy receives localized context; long copy uses a word-boundary excerpt, with Unicode-safe truncation as a last resort for unusually long tokens. Absolute titles prevent parent title templates adding an uncounted suffix. Page headings, article bodies and immutable sent newsletter records are unchanged.

Every page gets a 1200×630 PNG social card. The shared `/social-preview.png` renderer supplies localized text cards without relying on external avatars. Existing article/pitch Open Graph image routes remain available. Image dimensions and MIME types are verified against actual HTTP responses. The preview endpoint is noindex and is not a sitemap page.

JSON-LD serialization escapes HTML-sensitive text. Article images use absolute URLs; guides use Article schema because the collection includes conceptual articles, not only procedures. Unsupported aggregate ratings and unverified software-version claims are omitted. News publication dates retain the actual publication timestamp rather than the underlying event date.

## Reproduce the audit

```sh
npm ci --legacy-peer-deps
npm test
npm run build
npm run start -- --port 3100
```

In another terminal:

```sh
npm run audit:seo -- --origin http://localhost:3100 --output /tmp/seo-audit.json
```

The audit parses the generated XML sitemap, requests every listed URL with a social crawler user agent, checks the final title/description tags, canonicals, noindex rules and JSON-LD, and fetches every referenced preview/article image. The JSON report includes page-level and image-level evidence. CI runs this after the production build.

The unit tests also compare the actual `app/[locale]` page tree with the sitemap policy and compare published content in every locale against generated entries. Fixture tests cover locale-only publications, untranslated editions, draft translations and locale-specific modification dates. New application routes must receive an explicit sitemap policy.

## Actions and deployment

All active workflows share the `nostr-wot-actions` concurrency group with `queue: max` and cancellation disabled. The CI run holds this lock through its reusable deployment job, so builds, deployment, and operational sends cannot overlap. Queueing never interrupts an in-progress send.

Documentation-only pushes are still ignored. Social/test-only changes run the fast checks without a website build or deployment. Website changes build and audit once per checked commit. On main, CI packages that verified output and the deployment workflow downloads it; deployment does not rebuild. Build artifacts exclude `.env` and build caches and expire after one day. Production keeps the runtime newsletter directory.

Deployment checks the live homepage and freshly generated sitemap, then submits changed URLs and the homepage to IndexNow. Undated URLs use a stable cache marker, and each successful run saves a fresh cache key. Indexing requests do not guarantee that a search engine will reindex a URL or when it will do so.

Rollback: if deployment health checks or the public flows fail, revert the release merge on main and let the same verified deployment pipeline restore the previous application. Do not remove or replace `data/newsletter` during rollback.
