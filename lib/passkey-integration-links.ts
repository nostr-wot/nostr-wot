/** Public intake only. Following these links never grants RP origin access. */
export const PASSKEY_INTEGRATION_LINKS = {
  request: 'https://github.com/nostr-wot/nostr-wot-extension/issues/new?template=passkey_integration.yml',
  guide: 'https://github.com/nostr-wot/nostr-wot-extension/blob/main/docs/passkey-integrations.md',
  security: 'https://github.com/nostr-wot/nostr-wot-extension/security/advisories/new',
} as const;
