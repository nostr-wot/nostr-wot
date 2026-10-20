# Developer integration documentation

The public documentation keeps its existing `/docs`, `/docs/getting-started`, `/docs/extension`, `/docs/sdk`, `/docs/oracle` and `/docs/lnbits-proxy` routes. Existing section IDs, canonical metadata, language alternates and the overview’s TechArticle JSON-LD are preserved. New integration recipes extend the SDK and extension pages; they do not introduce duplicate landing pages or new sitemap URLs.

## Reader paths

The quick-start page links directly to signing, private messages, payments, HTTP authentication and uploads. The SDK package table describes all eighteen published packages, including the lower-level account, permission, signer, bunker and storage modules. The extension guide separates public NIP-07 and WebLN capabilities from private vault, recovery and archive functionality.

Each recipe explains prerequisites and execution environment, gives an example, states the result and describes the next integration step. Error guidance distinguishes rejected approvals, partial relay acceptance and uncertain payment outcomes. The HTTP-auth example separates server setup from browser code, binds verification to an exact URL and describes the stateless challenge limitation.

## Content ownership

`components/docs/integration-examples.ts` owns shared code examples and stable anchor IDs. `components/docs/IntegrationRecipes.tsx` renders them through the existing CodeBlock and TerminalBlock components. Explanations, headings, package purposes and navigation labels live in all seven `messages/*/docs.json` files. The same recipe IDs drive the sidebar, so new sections remain searchable. Existing translation keys must be preserved when extending the integration namespace used by the overview.

## Version and API evidence

On 2026-10-20 npm reported `nostr-wot-sdk@2.0.0`, `@nostr-wot/signers@2.0.0`, `@nostr-wot/auth@4.0.0`, `@nostr-wot/wot@2.0.0` and `@nostr-wot/vault@1.1.0` as latest; the other listed packages were at 1.0.0. The repository changelogs identify the October 12 major releases as the GPL-3.0-only licensing transition; the vault passkey primitives were published October 15. Package versions were verified against npm rather than inferred from the private monorepo version. Documentation-only version updates do not change this website’s runtime dependencies.

New TypeScript snippets were compiled in an isolated directory against the published signer, DM, wallet, auth, Blossom and vault packages. Extension capabilities and the account-change event were checked against `inject.ts` in the extension source. The signed-event publication example uses `nostr-tools` and reports each relay result instead of treating signing as delivery.

## Maintenance checks

Before publishing a docs update, validate all seven translation files and existing keys, run the site typecheck/build, compile changed snippets against their documented package versions, and inspect desktop/mobile rendering. Check one H1 per page, working sidebar anchors, canonical and language-alternate links, and horizontal overflow. Keep code samples free of real credentials and keep secrets in server-only configuration. Preserve existing URLs and anchors unless redirects are deliberately provided.
