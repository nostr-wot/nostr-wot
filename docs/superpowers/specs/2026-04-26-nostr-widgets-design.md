# nostr-widgets — Design Spec

**Date:** 2026-04-26
**Status:** Pending user review
**Repo to create:** `../nostr-widgets` (sibling to `nostr-wot`)

## Goal

Ship server-rendered SVG widgets for Nostr profiles, follow buttons, and recent feeds. Widgets are embedded by third-party sites with a simple `<a><img></a>` snippet; the URL is always `nostr-wot.com/widgets/...` so the resulting backlinks accrue to nostr-wot.com.

## Non-goals

- Auth on `/widgets/*`. Widgets are public, read-only, rate-limited by IP.
- Theming params on day one. One polished default per widget kind. `?theme=light|dark` only if asked for after launch.
- Impression analytics. Would require a tracking pixel and contradict "static SVG."
- Iframe embeds. Iframes don't pass link authority to crawlers; defeats the purpose.

## Architecture

Single VPS. nginx is already terminating TLS for `nostr-wot.com` and proxying to the existing Next.js process on `127.0.0.1:3000` (managed by pm2). The widgets service runs as a second pm2-managed Node process on `127.0.0.1:3001`; nginx proxies `/widgets/*` to it.

```
   browser/crawler
        │
        ▼
   nostr-wot.com   (nginx, 443)
        │
        ├─ /          → 127.0.0.1:3000   (Next.js, pm2 app: nostr-wot)
        └─ /widgets/* → 127.0.0.1:3001   (Hono,    pm2 app: nostr-widgets)
                            │
                            ▼
                         L1 LRU → relay pool (nostr-tools SimplePool)
```

The reverse proxy is the load-bearing piece: to crawlers, the SVG and the surrounding `<a>` both belong to `nostr-wot.com`, so the inbound link attributes correctly. The widgets app is a separate codebase and a separate process — `pm2 reload nostr-widgets` never touches the main site.

## Repo layout

`nostr-widgets/` — pnpm workspace, MIT-licensed, OSS-friendly.

```
nostr-widgets/
├── packages/renderer/                # @nostr-widgets/renderer
│   ├── src/
│   │   ├── profile.ts                # renderProfileBadge(data: ProfileData): string
│   │   ├── follow.ts                 # renderFollowButton(data: FollowData): string
│   │   ├── feed.ts                   # renderFeedStrip(data: FeedData, limit: 1..5): string
│   │   ├── shared/
│   │   │   ├── colors.ts             # nostr-wot brand palette
│   │   │   ├── fonts.ts              # font stack + embedded woff2 subset
│   │   │   ├── escape.ts             # XML-safe text utility
│   │   │   ├── layout.ts             # text fitting, ellipsis, geometry
│   │   │   └── identicon.ts          # fallback avatar from npub bytes
│   │   ├── types.ts                  # ProfileData, FollowData, FeedNote, FeedData
│   │   └── index.ts
│   ├── package.json                  # exports map; zero runtime deps
│   └── tsconfig.json
├── apps/server/                      # the Hono service
│   ├── src/
│   │   ├── index.ts                  # Hono app, route handlers
│   │   ├── routes/
│   │   │   ├── profile.ts
│   │   │   ├── follow.ts
│   │   │   └── feed.ts
│   │   ├── relays.ts                 # SimplePool, npub→hex, batched fetches
│   │   ├── avatar.ts                 # fetch + sharp resize 96² + base64
│   │   ├── cache.ts                  # in-memory LRU
│   │   └── middleware/
│   │       ├── cache-headers.ts
│   │       ├── etag.ts
│   │       ├── rate-limit.ts
│   │       └── request-log.ts
│   ├── test/                         # integration tests vs fake relay pool
│   ├── package.json
│   └── tsconfig.json
├── pnpm-workspace.yaml
├── package.json                      # root workspace
├── README.md                         # what it is + embed examples
├── CONTRIBUTING.md                   # workspace setup, how to add a kind
├── LICENSE                           # MIT
└── .github/workflows/ci.yml          # typecheck + test + build
```

The renderer package has zero runtime dependencies. Anyone can install `@nostr-widgets/renderer` and host their own widgets endpoint with no coupling to our server, our relays, or our cache.

## URL contracts

```
GET /widgets/profile/{npub}.svg          → 320×96   profile badge
GET /widgets/follow/{npub}.svg           → 220×40   follow button + count
GET /widgets/feed/{npub}.svg?n=3         → 480×(80·n)   recent N notes (n: 1–5, default 3)
```

Inputs are bech32 npubs (`npub1...`). Hex pubkeys rejected with 400 to keep URLs canonical and cacheable.

Embed snippet (always wrapped in `<a>` for the backlink):

```html
<a href="https://nostr-wot.com/p/{npub}" rel="noopener">
  <img src="https://nostr-wot.com/widgets/profile/{npub}.svg"
       alt="{name} on Nostr" width="320" height="96">
</a>
```

The README ships pre-formatted snippets per widget so integrators copy-paste.

## Renderer contracts

Pure functions, deterministic, no I/O. Take fully-resolved data; produce a UTF-8 SVG string.

```ts
type ProfileData = {
  npub: string;
  displayName: string;          // already chosen between display_name | name | pubkey-prefix
  nip05?: string;
  pictureDataUri?: string;      // pre-fetched + base64; renderer never fetches
  wotScore?: number;            // 0..100, optional
  followerCount?: number;
};

renderProfileBadge(data: ProfileData): string;
renderFollowButton(data: FollowData): string;
renderFeedStrip(data: FeedData, limit: 1|2|3|4|5): string;
```

Server is responsible for *all* I/O (relays, avatars). Renderer is testable with snapshot fixtures and runs in any JS runtime.

## Data layer (server)

- `nostr-tools` `SimplePool` over a curated relay set: `relay.damus.io`, `relay.nostr.band`, `nos.lol`, `relay.snort.social`, `relay.primal.net`. Override via `NOSTR_RELAYS` env (comma-separated `wss://` URLs).
- `npub` → hex via `nip19.decode`. Reject anything else with 400.
- Per kind: query for **kind 0** (metadata) + **kind 3** (follow list — for follow count and follower-count proxy) + **kind 1** when feed is needed.
- Time-box every relay query to **2 s**; if no relays answered, return a degraded "unknown" SVG with a 60 s cache so the relay storm clears.

## Avatar handling

Fetched server-side, resized with `sharp` to 96×96, base64-embedded into the SVG `<image>`. Source URL caps:

- Max source bytes: **200 KB**
- Max source dimensions: **2048 × 2048**
- Allowed content types: `image/jpeg`, `image/png`, `image/webp`, `image/gif` (first frame only)
- On miss/timeout/oversize: fall back to a deterministic identicon SVG seeded from the npub bytes

Output SVGs are 25–40 KB depending on avatar; well below CDN size limits.

## Caching (2 layers)

| Layer | Where | Profile | Follow | Feed |
|---|---|---|---|---|
| L1 LRU | server memory | 5 min | 5 min | 60 s |
| L2 HTTP `Cache-Control` | integrator's browser + their CDN if any | `max-age=600, s-maxage=3600, swr=86400` | `300 / 1800 / 86400` | `120 / 600 / 86400` |

`ETag = sha256(svg).slice(0, 16)` → integrators with their own CDN get 304s for free. `stale-while-revalidate` keeps embeds fast even when relays are slow.

Single-process LRU only. pm2 runs one fork; every hit goes through the same memory cache. No Redis, no shared store — keep the runtime dependency-free.

## Rate limiting

Per-IP, per-route, **60 req/min** via in-memory token bucket. Single-process; resets on `pm2 reload`, which is fine for our scale.

## nginx wiring on `nostr-wot.com`

Add a `location` block to the existing `nostr-wot.com` server block (above the catch-all `location /` that proxies to Next):

```nginx
location /widgets/ {
    proxy_pass         http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;

    # Pass cache headers from upstream untouched
    proxy_cache_bypass     $http_cache_control;
    proxy_pass_request_headers on;

    # Reasonable timeouts; relay fetches bound to 2 s in app, leave buffer
    proxy_connect_timeout  3s;
    proxy_read_timeout     5s;
    proxy_send_timeout     5s;
}
```

The trailing slash on both `source` and `proxy_pass` keeps the path intact (`/widgets/profile/{npub}.svg` → `127.0.0.1:3001/widgets/profile/{npub}.svg`). To browsers and crawlers everything is `nostr-wot.com/widgets/*` — backlinks credit this domain.

After editing: `nginx -t && systemctl reload nginx`.

## Deployment (pm2)

The widgets repo is cloned to `/var/www/nostr-widgets` on the same VPS. pm2 manages the process alongside the existing `nostr-wot` Next app.

`ecosystem.config.cjs` at the root of `nostr-widgets`:

```js
module.exports = {
  apps: [{
    name: 'nostr-widgets',
    script: 'apps/server/dist/index.js',
    cwd: '/var/www/nostr-widgets',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '300M',
    env: { NODE_ENV: 'production', PORT: '3001' }
  }]
};
```

Deploy script (`scripts/deploy.sh`, run on the VPS):

```bash
cd /var/www/nostr-widgets
git pull --ff-only
pnpm install --frozen-lockfile
pnpm -r build
pm2 reload nostr-widgets || pm2 start ecosystem.config.cjs
pm2 save
```

First-time setup: `pm2 start ecosystem.config.cjs && pm2 save && pm2 startup` so the process resurrects on reboot.

## Observability

- Structured one-line log per request: `route, npub-prefix, cache: l1|l2|miss, ms, status`
- Optional `/health` endpoint: 200 if `SimplePool` has at least one healthy relay, 503 otherwise
- No `/metrics` in v0.1 — add prom-client only if needed

## Testing

- **Renderer:** snapshot tests with frozen fixtures (`__fixtures__/profile-leon.json` → expected SVG)
- **Server:** integration tests with a fake `SimplePool` returning recorded JSON; snapshot the final HTTP response (status + headers + body hash)
- CI: `pnpm -r typecheck && pnpm -r test && pnpm -r build` on push and PR

## OSS housekeeping

- MIT license
- README sections: What it is · Embed examples · Self-hosting your own endpoint · API · Contributing
- CONTRIBUTING.md: workspace setup (`pnpm i`, `pnpm dev`), how to add a new widget kind (concrete walkthrough), commit/PR conventions
- Issue + PR templates in `.github/`

## Versioning + release

- Renderer package versions follow semver. Major bump on visual breaking changes.
- Server is not published — deployment artifact only.
- Tag releases (`renderer@v0.1.0`) and publish from CI on tag push.

## Out-of-scope, listed for future reference

- Theming (`?theme=...`)
- Custom widget sizes
- Per-widget-kind A/B variants
- Subscription kinds (zaps, reactions)
- Integration analytics
- A WordPress plugin / Ghost integration that auto-inserts the snippet — would amplify backlinks, not hard, but ship widgets first

## Open questions to resolve in the implementation plan

- WoT score data source — does the score live on `nostr-wot.com`'s own DB, or fetched live? (Likely DB; the widgets server reads it via an internal HTTP route on the same box.) The implementation plan resolves this.
- Identicon generator choice (`@dicebear/core` vs hand-rolled). Hand-rolled keeps deps slim.
- Final default relay set — start with the five named in *Data layer*, may swap based on uptime data.

---

Once approved, next step is the writing-plans skill to produce the implementation plan.
