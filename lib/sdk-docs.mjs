// Shared SDK documentation route and package inventory.
export const sdkPackages = [
  {
    "slug": "core",
    "name": "nostr-wot-sdk",
    "version": "3.0.0",
    "role": "sdk",
    "topics": [
      {
        "id": "setup",
        "title": "sdk.setupTitle",
        "intro": "sdk.setupDescription",
        "href": "/docs/sdk/core/setup"
      },
      {
        "id": "data",
        "title": "sdk.dataTitle",
        "intro": "sdk.dataDescription",
        "href": "/docs/sdk/core/data"
      },
      {
        "id": "relay",
        "title": "sdk.relayTitle",
        "intro": "sdk.relayDescription",
        "href": "/docs/sdk/core/relay"
      },
      {
        "id": "signers",
        "title": "integration.signers.title",
        "intro": "integration.signers.intro",
        "href": "/docs/sdk/core/signers"
      },
      {
        "id": "uploads",
        "title": "integration.uploads.title",
        "intro": "integration.uploads.intro",
        "href": "/docs/sdk/core/uploads"
      }
    ],
    "href": "/docs/sdk/core"
  },
  {
    "slug": "identity",
    "name": "@nostr-wot/identity",
    "version": "1.0.0",
    "role": "identity",
    "topics": [
      {
        "id": "passkeys",
        "title": "sdk.passkeys.title",
        "intro": "sdk.passkeys.description",
        "href": "/docs/sdk/identity/passkeys"
      },
      {
        "id": "passkey-interoperability",
        "title": "sdk.passkeys.interopTitle",
        "intro": "sdk.passkeys.domain",
        "href": "/docs/sdk/identity/passkey-interoperability"
      }
    ],
    "href": "/docs/sdk/identity"
  },
  {
    "slug": "dm",
    "name": "@nostr-wot/dm",
    "version": "2.0.0",
    "role": "dm",
    "topics": [
      {
        "id": "messages",
        "title": "integration.messages.title",
        "intro": "integration.messages.intro",
        "href": "/docs/sdk/dm/messages"
      },
      {
        "id": "lifecycle",
        "title": "integration.lifecycle.title",
        "intro": "integration.lifecycle.intro",
        "href": "/docs/sdk/dm/lifecycle"
      }
    ],
    "href": "/docs/sdk/dm"
  },
  {
    "slug": "wallet",
    "name": "@nostr-wot/wallet",
    "version": "2.0.0",
    "role": "wallet",
    "topics": [
      {
        "id": "payments",
        "title": "integration.payments.title",
        "intro": "integration.payments.intro",
        "href": "/docs/sdk/wallet/payments"
      }
    ],
    "href": "/docs/sdk/wallet"
  },
  {
    "slug": "auth",
    "name": "@nostr-wot/auth",
    "version": "5.0.0",
    "role": "auth",
    "topics": [
      {
        "id": "http-auth",
        "title": "integration.http-auth.title",
        "intro": "integration.http-auth.intro",
        "href": "/docs/sdk/auth/http-auth"
      }
    ],
    "href": "/docs/sdk/auth"
  },
  {
    "slug": "ui",
    "name": "@nostr-wot/ui",
    "version": "2.0.0",
    "role": "ui",
    "topics": [
      {
        "id": "ui",
        "title": "sdk.uiTitle",
        "intro": "sdk.uiDescription",
        "href": "/docs/sdk/ui/login"
      }
    ],
    "href": "/docs/sdk/ui"
  },
  {
    "slug": "wot",
    "name": "@nostr-wot/wot",
    "version": "3.0.0",
    "role": "wot",
    "topics": [
      {
        "id": "wot",
        "title": "sdk.wotTitle",
        "intro": "sdk.wotDescription",
        "href": "/docs/sdk/wot/local-graph"
      },
      {
        "id": "compatibility",
        "title": "sdk.compatibilityTitle",
        "intro": "sdk.compatibilityDescription",
        "href": "/docs/sdk/wot/compatibility"
      }
    ],
    "href": "/docs/sdk/wot"
  },
  {
    "slug": "pq",
    "name": "@nostr-wot/pq",
    "version": "1.0.0",
    "role": "pq",
    "topics": [
      {
        "id": "pq",
        "title": "packageDocs.pqTitle",
        "intro": "packageDocs.pqIntro",
        "href": "/docs/sdk/pq/attestations"
      }
    ],
    "href": "/docs/sdk/pq"
  }
];
export const sdkTopics = sdkPackages.flatMap(p => p.topics);
export const sdkDocPaths = sdkPackages.flatMap(p => [p.href, ...p.topics.map(t => t.href)]);
export const sdkMoves = [
  {
    "from": "@nostr-wot/relay",
    "to": "nostr-wot-sdk/relay"
  },
  {
    "from": "@nostr-wot/data",
    "to": "nostr-wot-sdk/data"
  },
  {
    "from": "@nostr-wot/signers",
    "to": "nostr-wot-sdk/signers"
  },
  {
    "from": "@nostr-wot/blossom",
    "to": "nostr-wot-sdk/blossom"
  },
  {
    "from": "@nostr-wot/storage",
    "to": "nostr-wot-sdk/storage"
  },
  {
    "from": "@nostr-wot/accounts",
    "to": "@nostr-wot/identity/accounts"
  },
  {
    "from": "@nostr-wot/vault",
    "to": "@nostr-wot/identity/vault"
  },
  {
    "from": "@nostr-wot/permissions",
    "to": "@nostr-wot/identity/permissions"
  },
  {
    "from": "@nostr-wot/signer-core",
    "to": "@nostr-wot/identity/signing"
  },
  {
    "from": "@nostr-wot/bunker",
    "to": "@nostr-wot/identity/bunker"
  },
  {
    "from": "@nostr-wot/graph",
    "to": "@nostr-wot/wot/graph"
  }
];
