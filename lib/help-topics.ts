import type { GuideVideo } from './guide-media';

export const HELP_CATEGORIES = ['accounts', 'permissions', 'payments', 'settings'] as const;
export type HelpCategory = typeof HELP_CATEGORIES[number];

export const HELP_TOPICS: { id: GuideVideo; category: HelpCategory; duration: string; guides: string[] }[] = [
  { id: 'account', category: 'accounts', duration: '1:59', guides: ['create-nostr-account', 'import-nostr-account', 'connect-nostr-signer'] },
  { id: 'subAccounts', category: 'accounts', duration: '1:30', guides: ['custom-identity-paths'] },
  { id: 'backup', category: 'accounts', duration: '1:19', guides: ['import-nostr-account'] },
  { id: 'remove', category: 'accounts', duration: '1:08', guides: ['removing-accounts'] },
  { id: 'approvals', category: 'permissions', duration: '1:48', guides: ['site-permissions'] },
  { id: 'permissions', category: 'permissions', duration: '1:48', guides: ['site-permissions'] },
  { id: 'authentication', category: 'permissions', duration: '1:43', guides: ['backend-authentication', 'relay-authentication'] },
  { id: 'wallet', category: 'payments', duration: '1:33', guides: ['setting-up-wallet'] },
  { id: 'zaps', category: 'payments', duration: '1:49', guides: ['zapping-auto-approve'] },
  { id: 'appearance', category: 'settings', duration: '0:59', guides: [] },
  { id: 'language', category: 'settings', duration: '0:47', guides: ['change-language'] },
  { id: 'security', category: 'settings', duration: '1:07', guides: ['managing-identity'] },
];

export function matchesHelpQuery(query: string, text: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
  return normalize(query).trim().split(/\s+/).every(word => normalize(text).includes(word));
}
