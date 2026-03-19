# Guides Status

Last updated: 2026-03-19

## Key

- **Live on nostr-wot.com** = merged into upstream `nostr-wot/nostr-wot`
- **In PR #3** = exists in fork `topolino-claw/nostr-wot` branch `main`, pending merge
- **In PR #3 (new file)** = guide doesn't exist upstream at all yet — new guide added by PR
- Screenshots column counts **inline** images only (not featured/preview/og which all guides have)

---

## Status Table

| # | Guide | Difficulty | Live on nostr-wot.com | PR #3 Status | Last Reviewed | Inline Images | Screenshot Status |
|---|-------|-----------|----------------------|-------------|--------------|---------------|------------------|
| 0.1 | what-is-nostr | beginner | ❌ Not live | 🟡 New file in PR | 2026-03-19 | 2 SVG diagrams | ✅ Ready to publish — ⚠️ known issue: text overlaps first 3 relays in relay-nodes.svg (fix deferred) |
| 0.2 | why-nostr-is-resilient | beginner | ❌ Not live | 🟡 New file in PR | 2026-03-19 | 2 SVG diagrams | ✅ Ready to publish |
| 0.3 | nostr-for-beginners | beginner | ❌ Not live | 🟡 New file in PR | 2026-03-19 | 2 SVGs + 4 client logos | ✅ Ready to publish |
| 1 | getting-started | beginner | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-19 10:50 | 3 screenshots | ✅ Ready to publish |
| 2 | managing-identity | beginner | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-18 | 4 screenshots | ✅ Complete |
| 3 | understanding-wot | beginner | ✅ Live (unmodified) | — | 2026-03-11 | — | ❌ Pending |
| 4 | customizing-trust | intermediate | ✅ Live (unmodified) | — | 2026-03-11 | — | ❌ Pending |
| 5 | setting-up-wallet | beginner | ✅ Live (unmodified) | — | 2026-03-11 | — | ❌ Pending |
| 6 | zapping-auto-approve | beginner | ✅ Live (unmodified) | — | 2026-03-11 | — | ❌ Pending |
| 7 | lightning-address | beginner | ✅ Live (unmodified) | — | 2026-03-11 | — | ❌ Pending |
| 8 | site-permissions | intermediate | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-18 | 5 screenshots | ✅ Complete |
| 9 | wot-playground | intermediate | ✅ Live (unmodified) | — | 2026-03-11 | — | ❌ Pending |

---

## What's in PR #3

PR: https://github.com/nostr-wot/nostr-wot/pull/3
Fork: `topolino-claw/nostr-wot` branch `main`
Preview: https://preview-nostr-wot.fabri.lat/guides

### New guides (don't exist upstream yet)
- `what-is-nostr` — with 2 SVG diagrams + featured images
- `why-nostr-is-resilient` — with 2 SVG diagrams + featured images
- `nostr-for-beginners` — with featured images

### Modified guides (exist upstream, screenshots added)
- `getting-started` — 3 screenshots added (setup wizard, key creation, import key)
- `managing-identity` — 4 screenshots added (extension main, identity tab, edit profile, lock screen)
- `site-permissions` — 5 screenshots added (pending request, request details, permission request, permissions list, permissions detail)

### Firefox URL fix
- `app/[locale]/download/page.tsx` — updated Firefox addon URL to `https://addons.mozilla.org/en-US/firefox/addon/nostr-wot/`

---

## Pending Screenshots (not yet in PR)

| Guide | Screenshots Needed |
|-------|-------------------|
| understanding-wot | Trust graph visualization, extension popup with hop badges |
| customizing-trust | Trust settings panel, hop decay slider |
| setting-up-wallet | Wallet setup (3 options), Quick Setup result, NWC input, LNbits config, balance view |
| zapping-auto-approve | Payment request popup, zap confirmation, auto-approve threshold, transaction history |
| lightning-address | Claim form, add-to-profile prompt, incoming zap notification |
| wot-playground | Graph loading, full graph, node detail, hop filter, search result |

---

## Notes

- All screenshots added on 2026-03-18 are only in the fork — **not live until PR is merged**
- `nostr-for-beginners`, `what-is-nostr`, `why-nostr-is-resilient` will be **new pages** on nostr-wot.com after merge
- wot-playground screenshots can be taken from the preview URL (no extension needed)
