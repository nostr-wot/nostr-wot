interface IntegrationExample {
  id: string;
  install?: string;
  code?: string;
  language?: string;
  reference?: string;
}
export type IntegrationArea = 'sdk' | 'extension';
export const integrationExamples: Record<IntegrationArea, IntegrationExample[]> = {
  sdk: [
    {
      id: 'signers', install: 'npm install nostr-wot-sdk@3.0.0 nostr-tools',
      reference: 'https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/signers',
      code: `import { Nip07Signer, isNip07Available } from "nostr-wot-sdk/signers";

// Call from a browser button handler, not during server rendering.
export async function signNote(content: string) {
  if (!isNip07Available()) throw new Error("Install or enable a NIP-07 signer");
  const signer = new Nip07Signer();
  const pubkey = await signer.getPublicKey();
  const event = await signer.signEvent({
    kind: 1, content, tags: [],
    created_at: Math.floor(Date.now() / 1000),
  });
  if (event.pubkey !== pubkey) throw new Error("Account changed; review again");
  return event;
}`,
    },
    {
      id: 'messages', install: 'npm install @nostr-wot/dm@2.0.0 nostr-wot-sdk@3.0.0 nostr-tools',
      reference: 'https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/dm',
      code: `import { buildChatMessage, sealAndGiftWrap, unwrapGiftWrap } from "@nostr-wot/dm";
import type { NostrSigner } from "nostr-wot-sdk/signers";

export async function prepareMessage(signer: NostrSigner, recipient: string, text: string) {
  const me = await signer.getPublicKey();
  const message = buildChatMessage(me, recipient, text);
  return sealAndGiftWrap(signer, recipient, message);
}

// Run with the recipient's signer after receiving a kind-1059 event.
export async function readMessage(signer: NostrSigner, wrap: Parameters<typeof unwrapGiftWrap>[1]) {
  const { message, senderPubkey } = await unwrapGiftWrap(signer, wrap);
  return { from: senderPubkey, text: message.content };
}`,
    },
    {
      id: 'payments', install: 'npm install @nostr-wot/wallet@2.0.0 nostr-wot-sdk@3.0.0 nostr-tools',
      reference: 'https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/wallet',
      code: `import { isWebLNAvailable, zapViaWebLN } from "@nostr-wot/wallet";
import { Nip07Signer } from "nostr-wot-sdk/signers";

// Run once after the user confirms recipient and amount.
export async function sendZap(recipientPubkey: string, lightningAddress: string) {
  if (!isWebLNAvailable()) throw new Error("Connect a WebLN wallet first");
  await zapViaWebLN({
    signer: new Nip07Signer(), recipientPubkey,
    recipientLud16: lightningAddress, amountSats: 21,
    relays: ["wss://nos.lol"],
  });
}`,
    },
    {
      id: 'http-auth', install: 'npm install @nostr-wot/auth@5.0.0 nostr-wot-sdk@3.0.0 nostr-tools',
      reference: 'https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/auth',
      code: `// Server only: lib/auth.ts
import { createAuthService } from "@nostr-wot/auth";
import { createNextHandlers } from "@nostr-wot/auth/next";

const secret = process.env.NOSTR_AUTH_SECRET;
if (!secret) throw new Error("Configure NOSTR_AUTH_SECRET on the server");
export const handlers = createNextHandlers(createAuthService({
  secret, expectedVerifyUrl: "https://example.com/api/auth/verify",
  jwtIssuer: "https://example.com", jwtTtlSec: 3600,
}), { cookie: true, cookieAttrs: { secure: true, sameSite: "Lax" } });

// Each export belongs in its own Next.js route.ts file:
// app/api/auth/challenge/route.ts: export const POST = handlers.challenge;
// app/api/auth/verify/route.ts:    export const POST = handlers.verify;
// app/api/auth/me/route.ts:        export const GET = handlers.me;
// app/api/auth/logout/route.ts:    export const POST = handlers.logout;
// Import { handlers } from "@/lib/auth" in each route.

// Separate browser module, called by a login button:
// import { loginWithSigner } from "@nostr-wot/auth/client";
// import { Nip07Signer } from "nostr-wot-sdk/signers";
// await loginWithSigner({ baseUrl: "/api/auth", signer: new Nip07Signer() });`,
    },
    {
      id: 'uploads', install: 'npm install nostr-wot-sdk@3.0.0 nostr-tools',
      reference: 'https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/blossom',
      code: `import { uploadToBlossom } from "nostr-wot-sdk/blossom";
import { Nip07Signer } from "nostr-wot-sdk/signers";

export async function upload(file: File, signal: AbortSignal) {
  const blob = await uploadToBlossom(file, {
    signer: new Nip07Signer(),
    servers: ["https://blossom.primal.net"],
    signal,
  });
  return { url: blob.url, hash: blob.sha256, bytes: blob.size };
}`,
    },
    { id: 'lifecycle', reference: 'https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/dm#layer-2--cache-cache' },
  ],
  extension: [
    {
      id: 'webln', language: 'javascript',
      code: `// Call from a Pay button after the user reviews the invoice.
export async function payInvoice(paymentRequest) {
  const provider = window.webln;
  if (!provider?.enable || !provider?.sendPayment) {
    throw new Error("A WebLN wallet is required");
  }
  await provider.enable();
  return provider.sendPayment(paymentRequest);
}`,
    },
    { id: 'capabilities', reference: 'https://github.com/nostr-wot/nostr-wot-extension/blob/main/docs/signer.md' },
    {
      id: 'publish', install: 'npm install nostr-tools',
      code: `import { SimplePool, verifyEvent, type Event } from "nostr-tools";

// Pass the event returned by window.nostr.signEvent().
export async function publishNote(event: Event, relays: string[]) {
  if (!verifyEvent(event)) throw new Error("Invalid signed event");
  if (relays.length === 0) throw new Error("Choose at least one relay");
  const pool = new SimplePool();
  try {
    const results = await Promise.allSettled(pool.publish(relays, event));
    return results.map((result, i) => ({
      relay: relays[i], accepted: result.status === "fulfilled",
    }));
  } finally {
    pool.close(relays);
  }
}`,
    },
    {
      id: 'permissions', language: 'javascript',
      code: `// Mount once in your app and call the returned cleanup on unmount.
export function watchAccount(onAccountChanged) {
  const reset = () => onAccountChanged();
  window.addEventListener("nostr:accountChanged", reset);
  return () => window.removeEventListener("nostr:accountChanged", reset);
}

// In onAccountChanged: clear account-specific views and pending drafts,
// stop subscriptions and require a fresh connection before signing.
// Other NIP-07 extensions may not emit this Nostr WoT-specific event.`,
    },
  ],
};
