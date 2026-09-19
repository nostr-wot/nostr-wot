# Nostr Web of Trust

Open infrastructure for trust-based filtering on Nostr.

## The Problem

Nostr has no central authority to filter spam or verify identity. Web of Trust solves this by measuring social distance—how many hops separate you from someone in the follow graph.

## Projects

### Browser Extension

The Nostr WoT Extension is an all-in-one identity provider for your browser — a NIP-07 signer with an encrypted key vault, a built-in Lightning wallet, and management for your profile, relays, and mute list. It exposes the standard `window.nostr` NIP-07 API for any Nostr client to use. Follow-graph queries are provided separately by the SDK local graph and the Oracle.

- **Repository:** [github.com/nostr-wot/nostr-wot-extension](https://github.com/nostr-wot/nostr-wot-extension)
- **Features:** NIP-07 signing (NIP-04/NIP-44 encryption), multi-account encrypted vault, NIP-46 remote signer, Lightning/WebLN wallet, profile (kind:0), NIP-65 relays, NIP-51 mute list, granular per-site permissions
- **Browsers:** Chrome, Brave, Edge, Opera, Firefox

### JavaScript SDK

`nostr-wot-sdk@1.0.1` is a TypeScript toolkit for Nostr apps. It includes data fetchers, relay utilities, login UI, and optional follow-graph queries. `NostrSdkProvider` composes data configuration, session state, and an optional WoT context. The data fetchers have their own shared relay pool.

- **Repository:** [github.com/nostr-wot/nostr-wot-sdk](https://github.com/nostr-wot/nostr-wot-sdk)
- **NPM:** [nostr-wot-sdk 1.0.1](https://www.npmjs.com/package/nostr-wot-sdk/v/1.0.1)
- **Documentation:** [SDK reference](https://nostr-wot.com/docs/sdk)
- **Compatibility:** Published `@nostr-wot/wot@1.0.0` uses the older Oracle HTTP contract and is not compatible with Oracle 0.3.0 simply by changing its base URL. Use direct `fetch` for Oracle 0.3.0 or provide a local source from `@nostr-wot/graph`. Version 1.0.0 removed extension detection and the WoT trust-score API.

### WoT Oracle

Oracle v0.3.0 is a Rust service that indexes follow events and public mute entries from configured relays. Its REST API returns follow distance and separate mute evidence; it does not calculate a combined trust score or decrypt private mute entries.

- **Repository:** [github.com/nostr-wot/nostr-wot-oracle](https://github.com/nostr-wot/nostr-wot-oracle)
- **Public Instance:** `https://wot-oracle.mappingbitcoin.com`
- **Features:** Bounded graph queries, revision-aware caching, durable incremental updates, ingestion readiness, self-hosting

## How It Works

1. Your pubkey is the center
2. People you follow = 1 hop
3. People they follow = 2 hops
4. Choose a search depth and filtering policy for your app; distance alone does not establish trust

## Use Cases

- Spam filtering without centralized blocklists
- Connection and public-mute evidence for application-defined review policies
- Tiered notifications by social proximity
- Client-side content filtering

## API

```tsx
// SDK React data and session provider
import { NostrSdkProvider, useProfile } from 'nostr-wot-sdk/react'

<NostrSdkProvider relays={['wss://relay.damus.io', 'wss://nos.lol']}>
  <App />
</NostrSdkProvider>

// Inside a component:
const profile = useProfile(pubkey)
```

```js
// SDK local graph queries (valid 64-character hex pubkeys required)
import { WotGraph } from '@nostr-wot/graph'
import { WoT } from '@nostr-wot/wot'
const graph = new WotGraph({ relays: ['wss://relay.damus.io'] })
await graph.load()
await graph.crawl(myPubkey, { maxDepth: 2 })
const wot = new WoT({ source: graph.asWoTSource(), maxHops: 2 })
const distance = await wot.getDistance(pubkey) // number | null
const inWoT = await wot.isInMyWoT(pubkey)      // boolean

// Oracle (server-side)
GET /distance?from={pubkey}&to={pubkey}
POST /distance/batch
GET /stats
```

## Implementing

Projects currently using Nostr Web of Trust:

| Project | Description |
|---------|-------------|
| [Mapping Bitcoin](https://mappingbitcoin.com) | Bitcoin merchant directory with WoT-based trust filtering |

## Supporters

Organizations supporting the development of Nostr Web of Trust:

| Organization | Website |
|--------------|---------|
| Dandelion Labs | [dandelionlabs.io](https://dandelionlabs.io) |
| We Are Bitcoin | [wearebitcoin.org](https://wearebitcoin.org) |
| Nostr WoT | [nostr-wot.com](https://nostr-wot.com) |

## Run Your Own

All components are fully open source. Run your own oracle, fork the extension, build trust infrastructure for your community.

## License

MIT
