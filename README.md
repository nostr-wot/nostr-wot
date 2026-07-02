# Nostr Web of Trust

Open infrastructure for trust-based filtering on Nostr.

## The Problem

Nostr has no central authority to filter spam or verify identity. Web of Trust solves this by measuring social distance—how many hops separate you from someone in the follow graph.

## Projects

### Browser Extension

The Nostr WoT Extension is an all-in-one identity provider for your browser — a NIP-07 signer with an encrypted key vault, a built-in Lightning wallet, and management for your profile, relays, and mute list. It exposes the standard `window.nostr` NIP-07 API for any Nostr client to use. (Web of Trust distance and trust-score queries live in the SDK and Oracle below, not the extension.)

- **Repository:** [github.com/nostr-wot/nostr-wot-extension](https://github.com/nostr-wot/nostr-wot-extension)
- **Features:** NIP-07 signing (NIP-04/NIP-44 encryption), multi-account encrypted vault, NIP-46 remote signer, Lightning/WebLN wallet, profile (kind:0), NIP-65 relays, NIP-51 mute list, granular per-site permissions
- **Browsers:** Chrome, Brave, Edge, Opera, Firefox

### JavaScript SDK

The nostr-wot-sdk provides a lightweight JavaScript/TypeScript library for integrating Web of Trust directly into your applications without requiring the browser extension.

- **Repository:** [github.com/nostr-wot/nostr-wot-sdk](https://github.com/nostr-wot/nostr-wot-sdk)
- **NPM:** [npmjs.com/package/nostr-wot-sdk](https://www.npmjs.com/package/nostr-wot-sdk)
- **Features:** TypeScript support, React hooks, configurable trust scoring

### WoT Oracle

A high-performance Rust backend that maintains a real-time graph of the Nostr follow network and provides instant distance/trust queries via REST API.

- **Repository:** [github.com/nostr-wot/nostr-wot-oracle](https://github.com/nostr-wot/nostr-wot-oracle)
- **Public Instance:** `https://wot-oracle.mappingbitcoin.com`
- **Features:** Bidirectional BFS, LRU caching, <1ms cached queries, self-hostable

## How It Works

1. Your pubkey is the center
2. People you follow = 1 hop
3. People they follow = 2 hops
4. Beyond 3 hops = likely noise

## Use Cases

- Spam filtering without centralized blocklists
- Trust scores for marketplace/reviews
- Tiered notifications by social proximity
- Client-side content filtering

## API

```js
// SDK (client-side)
import { NostrWoT } from 'nostr-wot-sdk'
const wot = new NostrWoT({ userPubkey: '...' })
await wot.getDistance(pubkey)
await wot.getTrustScore(pubkey)

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
