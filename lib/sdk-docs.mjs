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
const referenceTopics = [
  {
    "id": "storage",
    "owner": "core",
    "title": "apiGuides.storage.title",
    "intro": "apiGuides.storage.intro",
    "href": "/docs/sdk/core/storage"
  },
  {
    "id": "data-cache",
    "owner": "core",
    "title": "apiGuides.data-cache.title",
    "intro": "apiGuides.data-cache.intro",
    "href": "/docs/sdk/core/data-cache"
  },
  {
    "id": "data-react",
    "owner": "core",
    "title": "apiGuides.data-react.title",
    "intro": "apiGuides.data-react.intro",
    "href": "/docs/sdk/core/data-react"
  },
  {
    "id": "relay-hub",
    "owner": "core",
    "title": "apiGuides.relay-hub.title",
    "intro": "apiGuides.relay-hub.intro",
    "href": "/docs/sdk/core/relay-hub"
  },
  {
    "id": "relay-management",
    "owner": "core",
    "title": "apiGuides.relay-management.title",
    "intro": "apiGuides.relay-management.intro",
    "href": "/docs/sdk/core/relay-management"
  },
  {
    "id": "blob-management",
    "owner": "core",
    "title": "apiGuides.blob-management.title",
    "intro": "apiGuides.blob-management.intro",
    "href": "/docs/sdk/core/blob-management"
  },
  {
    "id": "accounts",
    "owner": "identity",
    "title": "apiGuides.accounts.title",
    "intro": "apiGuides.accounts.intro",
    "href": "/docs/sdk/identity/accounts"
  },
  {
    "id": "password-vault",
    "owner": "identity",
    "title": "apiGuides.password-vault.title",
    "intro": "apiGuides.password-vault.intro",
    "href": "/docs/sdk/identity/password-vault"
  },
  {
    "id": "permissions",
    "owner": "identity",
    "title": "apiGuides.permissions.title",
    "intro": "apiGuides.permissions.intro",
    "href": "/docs/sdk/identity/permissions"
  },
  {
    "id": "signing",
    "owner": "identity",
    "title": "apiGuides.signing.title",
    "intro": "apiGuides.signing.intro",
    "href": "/docs/sdk/identity/signing"
  },
  {
    "id": "bunker",
    "owner": "identity",
    "title": "apiGuides.bunker.title",
    "intro": "apiGuides.bunker.intro",
    "href": "/docs/sdk/identity/bunker"
  },
  {
    "id": "inbox-cache",
    "owner": "dm",
    "title": "apiGuides.inbox-cache.title",
    "intro": "apiGuides.inbox-cache.intro",
    "href": "/docs/sdk/dm/inbox-cache"
  },
  {
    "id": "messages-react",
    "owner": "dm",
    "title": "apiGuides.messages-react.title",
    "intro": "apiGuides.messages-react.intro",
    "href": "/docs/sdk/dm/messages-react"
  },
  {
    "id": "encrypted-files",
    "owner": "dm",
    "title": "apiGuides.encrypted-files.title",
    "intro": "apiGuides.encrypted-files.intro",
    "href": "/docs/sdk/dm/encrypted-files"
  },
  {
    "id": "nwc",
    "owner": "wallet",
    "title": "apiGuides.nwc.title",
    "intro": "apiGuides.nwc.intro",
    "href": "/docs/sdk/wallet/nwc"
  },
  {
    "id": "zaps",
    "owner": "wallet",
    "title": "apiGuides.zaps.title",
    "intro": "apiGuides.zaps.intro",
    "href": "/docs/sdk/wallet/zaps"
  },
  {
    "id": "server-auth",
    "owner": "auth",
    "title": "apiGuides.server-auth.title",
    "intro": "apiGuides.server-auth.intro",
    "href": "/docs/sdk/auth/server-auth"
  },
  {
    "id": "login-components",
    "owner": "ui",
    "title": "apiGuides.login-components.title",
    "intro": "apiGuides.login-components.intro",
    "href": "/docs/sdk/ui/login-components"
  },
  {
    "id": "theming",
    "owner": "ui",
    "title": "apiGuides.theming.title",
    "intro": "apiGuides.theming.intro",
    "href": "/docs/sdk/ui/theming"
  },
  {
    "id": "oracle",
    "owner": "wot",
    "title": "apiGuides.oracle.title",
    "intro": "apiGuides.oracle.intro",
    "href": "/docs/sdk/wot/oracle"
  },
  {
    "id": "hybrid-messages",
    "owner": "pq",
    "title": "apiGuides.hybrid-messages.title",
    "intro": "apiGuides.hybrid-messages.intro",
    "href": "/docs/sdk/pq/hybrid-messages"
  }
];
for (const pkg of sdkPackages) pkg.topics.push(...referenceTopics.filter(t=>t.owner===pkg.slug));
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
