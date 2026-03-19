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
| 0.1 | [what-is-nostr](https://preview-nostr-wot.fabri.lat/guides/what-is-nostr) | beginner | ❌ Not live | 🟡 New file in PR | 2026-03-19 10:00 | 2 SVG diagrams | ✅ Ready to publish — ⚠️ known issue: text overlaps first 3 relays in relay-nodes.svg (fix deferred) |
| 0.2 | [why-nostr-is-resilient](https://preview-nostr-wot.fabri.lat/guides/why-nostr-is-resilient) | beginner | ❌ Not live | 🟡 New file in PR | 2026-03-19 10:00 | 2 SVG diagrams | ✅ Ready to publish |
| 0.3 | [nostr-for-beginners](https://preview-nostr-wot.fabri.lat/guides/nostr-for-beginners) | beginner | ❌ Not live | 🟡 New file in PR | 2026-03-19 10:40 | 2 SVGs + 4 client logos | ✅ Ready to publish |
| 1 | [getting-started](https://preview-nostr-wot.fabri.lat/guides/getting-started) | beginner | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-19 10:50 | 3 screenshots | ✅ Ready to publish |
| 2 | [managing-identity](https://preview-nostr-wot.fabri.lat/guides/managing-identity) | beginner | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-19 11:00 | 5 screenshots | ✅ Ready to publish |
| 3 | [understanding-wot](https://preview-nostr-wot.fabri.lat/guides/understanding-wot) | beginner | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-19 16:30 | 3 screenshots | ✅ Ready to publish |
| 4 | [customizing-trust](https://preview-nostr-wot.fabri.lat/guides/customizing-trust) | intermediate | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-19 16:45 | 2 screenshots | ✅ Ready to publish |
| 5 | [setting-up-wallet](https://preview-nostr-wot.fabri.lat/guides/setting-up-wallet) | beginner | ✅ Live (unmodified) | — | — | — | ⏸ On hold — waiting for Lightning wallet feature to be production-ready |
| 6 | [zapping-auto-approve](https://preview-nostr-wot.fabri.lat/guides/zapping-auto-approve) | beginner | ✅ Live (unmodified) | — | — | — | ⏸ On hold — waiting for Lightning/zaps feature to be production-ready |
| 7 | [lightning-address](https://preview-nostr-wot.fabri.lat/guides/lightning-address) | beginner | ✅ Live (unmodified) | — | — | — | ⏸ On hold — waiting for Lightning address feature to be production-ready |
| 8 | [site-permissions](https://preview-nostr-wot.fabri.lat/guides/site-permissions) | intermediate | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-19 11:40 | 5 screenshots | ✅ Ready to publish — ⚠️ TODO: add WebLN payments screenshot in future version when feature is more stable |
| 9 | [wot-playground](https://preview-nostr-wot.fabri.lat/guides/wot-playground) | intermediate | ✅ Live (modified by PR) | 🟡 Screenshots added | 2026-03-19 | 2 screenshots | ⚠️ Pending review — ⚠️ NOTE: playground needs significant work, current screenshots are provisional |

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
