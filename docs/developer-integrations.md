# Developer integration documentation

The SDK documentation uses eight package pages under `/docs/sdk/<package>` and task pages below each package. The SDK index is a package chooser and migration table. Old `/docs/sdk#section` links remain usable through links with their original IDs. The extension, Oracle and LNbits guides retain their existing URLs.

## Package ownership

`nostr-wot-sdk` owns data, relays, signer clients, uploads and storage. `@nostr-wot/identity` owns accounts, vaults, permissions, signing approvals and the NIP-46 responder. WoT owns Oracle queries and the local graph. DM, wallet, auth, UI and PQ remain separate packages. Eleven old package names forward to the new modules; their migration table distinguishes the package to install from the subpath to import.

## Content and navigation

`lib/sdk-docs.mjs` owns package versions, topic routes, translation keys and compatibility mappings. The SDK index, sidebar, page renderer and sitemap consume this registry. Each route has a small physical page wrapper so the existing git-derived modification-date generator can resolve it. Package pages introduce the domain and link to tasks. Task pages use the existing CodeBlock and TerminalBlock components, with topic-specific content in `components/docs/SdkSection-*.tsx` or the shared integration recipes.

All prose keys live in the seven `messages/*/docs.json` files. Code examples are shared across languages. Sidebar topic links appear for the current package; searching includes all topics. Each new page has one H1, visible breadcrumbs, matching BreadcrumbList JSON-LD, canonical URL and language alternates. Topic pages use TechArticle; package indexes use CollectionPage.

## Examples and dependencies

Examples use the consolidated public import paths and explicit npm package names. React, React DOM and the SDK are listed where a workflow imports them directly. The local graph example installs SDK transport because WoT declares it as an optional peer. Site runtime dependencies are unchanged by this documentation migration; the examples describe consumer integrations, not the site's own runtime.

## Verification and maintenance

`tests/sdk-docs.test.ts` checks eight owners, eleven compatibility names, unique topic routes, physical pages, sitemap registration and translated titles/descriptions. Existing sitemap tests verify every static route resolves to a page. Run these tests and the site typecheck/build after adding topics. Check a rendered topic's navigation, code-block overflow and metadata. Verify exact package versions against npm before deploying documentation that calls them published.

## Further reference expansion

The new pages separate the existing integration workflows. They do not yet provide a dedicated website page for every identity primitive, relay operation or data fetcher. The package API-reference links lead to the maintained detailed README contracts. Expand individual task pages from those contracts as needed, preserving the registry, translations and original anchors rather than creating another large all-purpose page.
