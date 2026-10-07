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
  { id: 'archive', duration: '1:49' },
];

export type HelpTopic = { id: string; slug: string; category: HelpCategory; video?: GuideVideo; screenshots?: string[]; related?: string[]; guides: string[] };
export const HELP_TOPICS: HelpTopic[] = [
  { id: 'account', screenshots: ['account-methods', 'security'], slug: 'create-account', related: ['import', 'backup'], category: 'accounts', video: 'account', guides: ['create-nostr-account', 'import-nostr-account', 'connect-nostr-signer'] },
  { id: 'subAccounts', screenshots: ['sub-account', 'accounts'], slug: 'add-identity', related: ['backup', 'switch'], category: 'accounts', video: 'subAccounts', guides: ['custom-identity-paths'] },
  { id: 'backup', screenshots: ['sub-account'], slug: 'back-up-account', related: ['import', 'remove'], category: 'accounts', video: 'backup', guides: ['import-nostr-account', 'account-archive'] },
  { id: 'archive', slug: 'back-up-and-migrate-events', related: ['backup', 'import'], category: 'accounts', video: 'archive', guides: ['account-archive'] },
  { id: 'remove', screenshots: ['accounts', 'remove-confirmation'], slug: 'remove-account', related: ['backup', 'switch'], category: 'accounts', video: 'remove', guides: ['removing-accounts'] },
  { id: 'approvals', screenshots: ['backend-review', 'relay-review'], slug: 'review-request', related: ['permissions', 'denied'], category: 'permissions', video: 'approvals', guides: ['site-permissions'] },
  { id: 'permissions', screenshots: ['permissions', 'global-rules'], slug: 'site-and-global-rules', related: ['approvals', 'authentication'], category: 'permissions', video: 'permissions', guides: ['site-permissions'] },
  { id: 'authentication', screenshots: ['backend-review', 'relay-permissions'], slug: 'sign-in-permissions', related: ['permissions', 'loginFailed'], category: 'permissions', video: 'authentication', guides: ['backend-authentication', 'relay-authentication'] },
  { id: 'wallet', screenshots: ['wallet-setup', 'wallet-nwc', 'wallet-lnbits'], slug: 'connect-wallet', related: ['receive', 'walletFailed'], category: 'payments', video: 'wallet', guides: ['setting-up-wallet'] },
  { id: 'zaps', screenshots: ['zap-review', 'zap-limit'], slug: 'send-zap', related: ['limits', 'zapFailed'], category: 'payments', video: 'zaps', guides: ['zapping-auto-approve'] },
  { id: 'appearance', screenshots: ['appearance-light', 'appearance-dark'], slug: 'change-appearance', related: ['language', 'security'], category: 'settings', video: 'appearance', guides: [] },
  { id: 'language', screenshots: ['appearance-light', 'language-picker'], slug: 'change-language', related: ['appearance', 'security'], category: 'settings', video: 'language', guides: ['change-language'] },
  { id: 'security', screenshots: ['security'], slug: 'password-and-auto-lock', related: ['backup', 'loginFailed'], category: 'settings', video: 'security', guides: ['managing-identity'] },
  { id: 'import', screenshots: ['import-key', 'account-methods'], slug: 'import-account', related: ['backup', 'switch'], category: 'accounts', guides: ['import-nostr-account'] },
  { id: 'switch', screenshots: ['accounts'], slug: 'switch-accounts', related: ['subAccounts', 'loginFailed'], category: 'accounts', guides: ['managing-identity'] },
  { id: 'receive', slug: 'receive-sats', related: ['wallet', 'zaps'], category: 'payments', guides: ['setting-up-wallet'] },
  { id: 'limits', screenshots: ['zap-limit'], slug: 'payment-auto-approval', related: ['zaps', 'permissions'], category: 'payments', guides: ['zapping-auto-approve'] },
  { id: 'loginFailed', screenshots: ['permissions', 'backend-review'], slug: 'cannot-sign-in', related: ['authentication', 'denied'], category: 'troubleshooting', guides: ['backend-authentication'] },
  { id: 'denied', screenshots: ['global-rules', 'permissions'], slug: 'request-denied', related: ['permissions', 'approvals'], category: 'troubleshooting', guides: ['site-permissions'] },
  { id: 'walletFailed', screenshots: ['wallet-nwc', 'wallet-lnbits'], slug: 'wallet-not-connecting', related: ['wallet', 'receive'], category: 'troubleshooting', guides: ['setting-up-wallet'] },
  { id: 'zapFailed', screenshots: ['zap-review', 'zap-limit'], slug: 'zap-failed', related: ['walletFailed', 'limits'], category: 'troubleshooting', guides: ['zapping-auto-approve'] },
];

export function matchesHelpQuery(query: string, text: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
  return normalize(query).trim().split(/\s+/).every(word => normalize(text).includes(word));
}

export function helpTopicHref(topic: HelpTopic): string {
  return `/help/${topic.slug}`;
}

export function getHelpTopic(slug: string): HelpTopic | undefined {
  return HELP_TOPICS.find(topic => topic.slug === slug);
}
