import type { GuideVideo } from './guide-media';

export const HELP_CATEGORIES = ['accounts', 'permissions', 'payments', 'settings', 'troubleshooting'] as const;
export type HelpCategory = typeof HELP_CATEGORIES[number];

export const HELP_VIDEOS: { id: GuideVideo; duration: string }[] = [
  { id: 'account', duration: '1:59' },
  { id: 'subAccounts', duration: '1:30' },
  { id: 'backup', duration: '1:19' },
  { id: 'remove', duration: '1:08' },
  { id: 'approvals', duration: '1:48' },
  { id: 'permissions', duration: '1:48' },
  { id: 'authentication', duration: '1:43' },
  { id: 'wallet', duration: '1:33' },
  { id: 'zaps', duration: '1:49' },
  { id: 'appearance', duration: '0:59' },
  { id: 'language', duration: '0:47' },
  { id: 'security', duration: '1:07' },
];

export type HelpTopic = { id: string; category: HelpCategory; video?: GuideVideo; screenshot?: string; related?: string[]; guides: string[] };
export const HELP_TOPICS: HelpTopic[] = [
  { id: 'account', related: ['import', 'backup'], category: 'accounts', video: 'account', guides: ['create-nostr-account', 'import-nostr-account', 'connect-nostr-signer'] },
  { id: 'subAccounts', related: ['backup', 'switch'], screenshot: 'sub-account', category: 'accounts', video: 'subAccounts', guides: ['custom-identity-paths'] },
  { id: 'backup', related: ['import', 'remove'], category: 'accounts', video: 'backup', guides: ['import-nostr-account'] },
  { id: 'remove', related: ['backup', 'switch'], category: 'accounts', video: 'remove', guides: ['removing-accounts'] },
  { id: 'approvals', related: ['permissions', 'denied'], category: 'permissions', video: 'approvals', guides: ['site-permissions'] },
  { id: 'permissions', related: ['approvals', 'authentication'], screenshot: 'global-rules', category: 'permissions', video: 'permissions', guides: ['site-permissions'] },
  { id: 'authentication', related: ['permissions', 'loginFailed'], category: 'permissions', video: 'authentication', guides: ['backend-authentication', 'relay-authentication'] },
  { id: 'wallet', related: ['receive', 'walletFailed'], screenshot: 'wallet-setup', category: 'payments', video: 'wallet', guides: ['setting-up-wallet'] },
  { id: 'zaps', related: ['limits', 'zapFailed'], category: 'payments', video: 'zaps', guides: ['zapping-auto-approve'] },
  { id: 'appearance', related: ['language', 'security'], category: 'settings', video: 'appearance', guides: [] },
  { id: 'language', related: ['appearance', 'security'], category: 'settings', video: 'language', guides: ['change-language'] },
  { id: 'security', related: ['backup', 'loginFailed'], screenshot: 'security', category: 'settings', video: 'security', guides: ['managing-identity'] },
  { id: 'import', related: ['backup', 'switch'], screenshot: 'import-key', category: 'accounts', guides: ['import-nostr-account'] },
  { id: 'switch', related: ['subAccounts', 'loginFailed'], category: 'accounts', guides: ['managing-identity'] },
  { id: 'receive', related: ['wallet', 'zaps'], category: 'payments', guides: ['setting-up-wallet'] },
  { id: 'limits', related: ['zaps', 'permissions'], screenshot: 'zap-limit', category: 'payments', guides: ['zapping-auto-approve'] },
  { id: 'loginFailed', related: ['authentication', 'denied'], category: 'troubleshooting', guides: ['backend-authentication'] },
  { id: 'denied', related: ['permissions', 'approvals'], category: 'troubleshooting', guides: ['site-permissions'] },
  { id: 'walletFailed', related: ['wallet', 'receive'], category: 'troubleshooting', guides: ['setting-up-wallet'] },
  { id: 'zapFailed', related: ['walletFailed', 'limits'], category: 'troubleshooting', guides: ['zapping-auto-approve'] },
];

export function matchesHelpQuery(query: string, text: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
  return normalize(query).trim().split(/\s+/).every(word => normalize(text).includes(word));
}
