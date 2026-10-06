/** Text-free illustration IDs. Never accept arbitrary paths from image requests. */
export const GUIDE_ART_IDS = [
  'alby-hub-nwc', 'custom-identity-paths', 'customizing-trust', 'getting-started',
  'lightning-address', 'lnbits-wallet-setup', 'managing-identity', 'nostr-for-beginners',
  'nwc-app-connections', 'post-quantum-key', 'removing-accounts', 'setting-up-wallet',
  'site-permissions', 'turn-on-post-quantum-keys', 'understanding-wot', 'what-is-nostr',
  'why-nostr-is-resilient', 'wot-playground', 'zapping-auto-approve',
  'create-nostr-account', 'import-nostr-account', 'watch-only-nostr-account',
  'connect-nostr-signer', 'backend-authentication', 'relay-authentication', 'change-language',
] as const;
export const PAGE_ART_IDS = ['home', 'guides', 'extension', 'oracle', 'developers', 'community', 'editorial', 'privacy'] as const;
export type SocialArtId = typeof GUIDE_ART_IDS[number] | typeof PAGE_ART_IDS[number];
export function isSocialArtId(value: unknown): value is SocialArtId {
  return typeof value === 'string' && [...GUIDE_ART_IDS, ...PAGE_ART_IDS].some(id => id === value);
}
/** Contributor guides can reuse the developer illustration without duplicating assets. */
export const GUIDE_ART_ALIASES: Record<string, SocialArtId> = { 'create-extension-theme': 'developers' };
const routes: Record<string, SocialArtId> = {
  '/': 'home', '/features': 'extension', '/download': 'extension', '/about': 'community',
  '/oracle': 'oracle', '/widgets': 'developers', '/projects': 'community',
  '/playground': 'wot-playground', '/pqc': 'post-quantum-key', '/pqc/chat': 'post-quantum-key',
  '/guides': 'guides', '/blog': 'editorial', '/news': 'editorial', '/newsletters': 'editorial',
  '/docs': 'developers', '/docs/getting-started': 'developers', '/docs/sdk': 'developers',
  '/docs/extension': 'extension', '/docs/oracle': 'oracle', '/docs/lnbits-proxy': 'lnbits-wallet-setup',
  '/media-kit': 'home', '/contact': 'community', '/support': 'community', '/uninstall': 'community', '/privacy': 'privacy', '/terms': 'privacy', '/pitch': 'home',
};
export function socialArtForUrl(value: unknown): SocialArtId {
  if (typeof value !== 'string' && !(value instanceof URL)) return 'home';
  let pathname: string;
  try { pathname = new URL(String(value), 'https://nostrwot.com').pathname; } catch { return 'home'; }
  pathname = pathname.replace(/^\/(en|es|pt|ru|it|fr|de)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  if (routes[pathname]) return routes[pathname];
  if (pathname.startsWith('/guides/')) {
    const id = pathname.slice('/guides/'.length);
    if (Object.hasOwn(GUIDE_ART_ALIASES, id)) return GUIDE_ART_ALIASES[id];
    return GUIDE_ART_IDS.some(candidate => candidate === id) ? id as SocialArtId : 'guides';
  }
  if (/^\/(blog|news|newsletters)(\/|$)/.test(pathname)) return 'editorial';
  if (/^\/(notes|profile)\//.test(pathname)) return 'community';
  return 'home';
}
