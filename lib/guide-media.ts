/** Published videos verified on youtube.com/@nostr-wot; see docs/guide-media.md. */
export const GUIDE_VIDEOS = {
  account: { id: 'pUBd2rgmhNc', title: 'How to Create a Nostr Account with Nostr WoT' },
  subAccounts: { id: '5nk687W76hE', title: 'How to Create Multiple Nostr Identities from One Seed' },
  permissions: { id: 'Iu11fK9juzU', title: 'How to Change Nostr Site Permissions & Global Rules' },
  security: { id: 'pnOollWgs7g', title: 'Nostr WoT Security: Passwords & Auto-Lock' },
  backup: { id: '2-oTsMLWEd8', title: 'How to Export and Re-Import Your Nostr Keys' },
  appearance: { id: '-bIhd8BU3kU', title: 'How to Change the Appearance of Nostr WoT' },
  authentication: { id: '4TmndKyE8D4', title: 'Nostr Backend and Relay Authentication: Choose Who Can Log You In' },
} as const;

export type GuideVideo = keyof typeof GUIDE_VIDEOS;
export interface GuideMedia {
  screenshots: string[];
  videos?: GuideVideo[];
}

// Key by translationKey so every localized guide gets the same verified media.
export const GUIDE_MEDIA: Record<string, GuideMedia> = {
  'create-extension-theme': { screenshots: [], videos: ['appearance'] },
  'getting-started': { screenshots: ['account-methods'], videos: ['account'] },
  'create-nostr-account': { screenshots: ['account-methods', 'security'], videos: ['account'] },
  'import-nostr-account': { screenshots: ['import-key'], videos: ['backup'] },
  'connect-nostr-signer': { screenshots: ['remote-signer'] },
  'watch-only-nostr-account': { screenshots: ['watch-only'] },
  'custom-identity-paths': { screenshots: ['sub-account'], videos: ['subAccounts'] },
  'managing-identity': { screenshots: ['security'], videos: ['security', 'backup'] },
  'site-permissions': { screenshots: ['permissions', 'global-rules'], videos: ['permissions'] },
  'backend-authentication': { screenshots: ['backend-review', 'permissions'], videos: ['authentication'] },
  'relay-authentication': { screenshots: ['relay-review', 'relay-permissions'], videos: ['authentication'] },
  'setting-up-wallet': { screenshots: ['wallet-setup', 'wallet-nwc', 'wallet-lnbits'] },
  'alby-hub-nwc': { screenshots: ['wallet-nwc'] },
  'lnbits-wallet-setup': { screenshots: ['wallet-lnbits'] },
  'nwc-app-connections': { screenshots: ['app-connection'] },
  'lightning-address': { screenshots: ['lightning-address'] },
  'zapping-auto-approve': { screenshots: ['zap-review', 'zap-limit'] },
  'post-quantum-key': { screenshots: ['post-quantum'] },
  'turn-on-post-quantum-keys': { screenshots: ['post-quantum'] },
  'understanding-wot': { screenshots: ['web-of-trust'] },
  'change-language': { screenshots: [], videos: ['appearance'] },
};

export function youtubeUrls(id: string) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('Invalid YouTube video ID');
  return {
    embed: `https://www.youtube-nocookie.com/embed/${id}`,
    watch: `https://www.youtube.com/watch?v=${id}`,
  };
}
