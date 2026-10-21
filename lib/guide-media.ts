/** Published videos verified on youtube.com/@nostr-wot; null IDs reserve upcoming lessons. See docs/guide-media.md. */
export const GUIDE_VIDEOS = {
  passkeyCreate: { id: "q1RiU-VqM_k", title: "Create a Nostr Account with a Passkey" },
  passkeyRecover: { id: null as string | null, title: "Recover a Nostr Account with a Passkey" },
  passkeyProtect: { id: null as string | null, title: "Protect an Existing Nostr Account with a Passkey" },
  nostrBasics: { id: "eFoC8i0G4Fk", title: "What Is Nostr? Keys, Relays and Clients Explained" },
  events: { id: "JlenrCGN2z8", title: "What Is a Nostr Event? Posts, Profiles & Signatures Explained" },
  account: { id: "pUBd2rgmhNc", title: "How to Create a Nostr Account with Nostr WoT" },
  subAccounts: { id: "5nk687W76hE", title: "How to Create Multiple Nostr Identities from One Seed" },
  approvals: { id: "HjK-ygsj4Qs", title: "Nostr Permissions Explained: Approvals & Recent Activity" },
  permissions: { id: "Iu11fK9juzU", title: "How to Change Nostr Site Permissions & Global Rules" },
  wallet: { id: "1WgclSqckIk", title: "How to Set Up a Lightning Wallet in Nostr WoT" },
  zaps: { id: "qxEOM_jAG4I", title: "How to Send Your First Zap on Nostr" },
  appearance: { id: "-bIhd8BU3kU", title: "How to Change the Appearance of Nostr WoT" },
  language: { id: "uK5wQDeWJdA", title: "How to Change the Language in Nostr WoT" },
  security: { id: "pnOollWgs7g", title: "Nostr WoT Security: Passwords & Auto-Lock" },
  backup: { id: "2-oTsMLWEd8", title: "How to Export and Re-Import Your Nostr Keys" },
  remove: { id: "U1LZmgQgURA", title: "How to Remove an Account from Nostr WoT" },
  archive: { id: "He4gz4occgY", title: "How to Back Up and Migrate Nostr Events with Nostr WoT" },
  authentication: { id: "4TmndKyE8D4", title: "Nostr Backend and Relay Authentication: Choose Who Can Log You In" },
  connect: { id: "e-E9u2UyL3E", title: "Nostr Connect: Use Your Remote Signer in the Browser" },
  diceSeed: { id: null as string | null, title: "Create a Nostr Recovery Phrase with Real Dice" },
} as const;

export type GuideVideo = keyof typeof GUIDE_VIDEOS;
export interface GuideMedia {
  screenshots: string[];
  videos?: GuideVideo[];
}

// Key by translationKey so every localized guide gets the same verified media.
export const GUIDE_MEDIA: Record<string, GuideMedia> = {
  'create-nostr-account-with-passkey': { screenshots: [], videos: ['passkeyCreate'] },
  'recover-nostr-account-with-passkey': { screenshots: [], videos: ['passkeyRecover'] },
  'protect-existing-nostr-account-with-passkey': { screenshots: [], videos: ['passkeyProtect'] },
  'what-is-nostr': { screenshots: [], videos: ['nostrBasics'] },
  'what-is-a-nostr-event': { screenshots: [], videos: ['events'] },
  'create-extension-theme': { screenshots: [], videos: ['appearance'] },
  'account-archive': { screenshots: [], videos: ['archive'] },
  'getting-started': { screenshots: ['account-methods'], videos: ['account'] },
  'create-nostr-account': { screenshots: ['account-methods', 'security'], videos: ['account'] },
  'create-recovery-phrase-with-dice': { screenshots: [], videos: ['diceSeed'] },
  'import-nostr-account': { screenshots: ['import-key'], videos: ['backup'] },
  'connect-nostr-signer': { screenshots: ['remote-signer'], videos: ['connect'] },
  'watch-only-nostr-account': { screenshots: ['watch-only'] },
  'custom-identity-paths': { screenshots: ['sub-account'], videos: ['subAccounts'] },
  'managing-identity': { screenshots: ['security'], videos: ['security', 'backup'] },
  'site-permissions': { screenshots: ['permissions', 'global-rules'], videos: ['approvals', 'permissions'] },
  'backend-authentication': { screenshots: ['backend-review', 'permissions'], videos: ['authentication'] },
  'relay-authentication': { screenshots: ['relay-review', 'relay-permissions'], videos: ['authentication'] },
  'setting-up-wallet': { screenshots: ['wallet-setup', 'wallet-nwc', 'wallet-lnbits'], videos: ['wallet'] },
  'alby-hub-nwc': { screenshots: ['wallet-nwc'] },
  'lnbits-wallet-setup': { screenshots: ['wallet-lnbits'] },
  'nwc-app-connections': { screenshots: ['app-connection'] },
  'lightning-address': { screenshots: ['lightning-address'] },
  'zapping-auto-approve': { screenshots: ['zap-review', 'zap-limit'], videos: ['zaps'] },
  'post-quantum-key': { screenshots: ['post-quantum'] },
  'turn-on-post-quantum-keys': { screenshots: ['post-quantum'] },
  'understanding-wot': { screenshots: ['web-of-trust'] },
  'removing-accounts': { screenshots: [], videos: ['remove'] },
  'change-language': { screenshots: [], videos: ['language'] },
};

export function youtubeUrls(id: string) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('Invalid YouTube video ID');
  return {
    embed: `https://www.youtube-nocookie.com/embed/${id}`,
    watch: `https://www.youtube.com/watch?v=${id}`,
  };
}
