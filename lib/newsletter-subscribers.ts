import { mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { locales, type Locale } from '../i18n/config';

export interface Subscription { email: string; locale: Locale }
interface Subscriber extends Subscription {
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  consent: { source: 'newsletter-form'; recordedAt: string };
}
interface Store { version: 1; subscribers: Subscriber[] }

export class SubscriptionValidationError extends Error {}

/** Validate at the HTTP boundary and again before any persistence. */
export function parseSubscription(input: unknown): Subscription {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new SubscriptionValidationError('Email and language are required');
  }
  const { email, locale } = input as Record<string, unknown>;
  if (typeof email !== 'string' || typeof locale !== 'string' || !locales.includes(locale as Locale)) {
    throw new SubscriptionValidationError('A valid email and supported language are required');
  }
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');
  const local = parts[0];
  const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
  if (!normalized || normalized.length > 254 || parts.length !== 2 || local.length > 64 ||
      local.startsWith('.') || local.endsWith('.') || local.includes('..') || !emailPattern.test(normalized)) {
    throw new SubscriptionValidationError('Invalid email format');
  }
  return { email: normalized, locale: locale as Locale };
}

function directory(): string {
  return process.env.NEWSLETTER_DATA_DIR || path.join(process.cwd(), 'data', 'newsletter');
}

function hasCode(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

async function readStore(dir: string): Promise<Store> {
  let text: string;
  try { text = await readFile(path.join(dir, 'subscribers.json'), 'utf8'); }
  catch (error) {
    if (hasCode(error, 'ENOENT')) return { version: 1, subscribers: [] };
    throw error;
  }
  const data = JSON.parse(text) as Store;
  if (!data || data.version !== 1 || !Array.isArray(data.subscribers)) throw new Error('Invalid subscriber store');
  const seen = new Set<string>();
  for (const row of data.subscribers) {
    const validated = parseSubscription(row);
    if (validated.email !== row.email || seen.has(row.email) ||
      !['active', 'inactive'].includes(row.status) ||
      typeof row.createdAt !== 'string' || !Number.isFinite(Date.parse(row.createdAt)) ||
      typeof row.updatedAt !== 'string' || !Number.isFinite(Date.parse(row.updatedAt)) ||
      row.consent?.source !== 'newsletter-form' || typeof row.consent.recordedAt !== 'string' ||
      !Number.isFinite(Date.parse(row.consent.recordedAt))) throw new Error('Invalid subscriber store');
    seen.add(row.email);
  }
  return data;
}

/**
 * Dedicated lock, independent of archive files in NEWSLETTER_DATA_DIR.
 * O_EXCL serializes processes sharing this filesystem. Never steal a lock based
 * on its age: a paused writer might still own it. After a crashed writer, an
 * operator must stop writers and remove subscribers.lock before retrying.
 * Use a durable local/shared POSIX volume, not ephemeral serverless storage.
 */
async function acquireLock(dir: string): Promise<() => Promise<void>> {
  const lock = path.join(dir, 'subscribers.lock');
  const deadline = Date.now() + 5000;
  for (;;) {
    try {
      const handle = await open(lock, 'wx', 0o600);
      return async () => {
        try { await handle.close(); } finally { await unlink(lock); }
      };
    } catch (error) {
      if (!hasCode(error, 'EEXIST')) throw error;
      if (Date.now() >= deadline) throw new Error('Subscriber store is busy');
      await delay(20 + Math.floor(Math.random() * 30));
    }
  }
}

async function writeStore(dir: string, store: Store): Promise<void> {
  const temporary = path.join(dir, `.subscribers-${randomUUID()}.tmp`);
  const handle = await open(temporary, 'wx', 0o600);
  try {
    try { await handle.writeFile(JSON.stringify(store) + '\n', 'utf8'); await handle.sync(); }
    finally { await handle.close(); }
    await rename(temporary, path.join(dir, 'subscribers.json'));
    const parent = await open(dir, 'r');
    try { await parent.sync(); } finally { await parent.close(); }
  } finally {
    await unlink(temporary).catch(error => { if (!hasCode(error, 'ENOENT')) throw error; });
  }
}

/** Explicit submission is the existing opt-in; no extra confirmation step. */
export async function subscribe(input: Subscription): Promise<{ created: boolean; localeChanged: boolean }> {
  const subscription = parseSubscription(input);
  const dir = directory();
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const release = await acquireLock(dir);
  try {
    const store = await readStore(dir);
    const existing = store.subscribers.find(row => row.email === subscription.email);
    const now = new Date().toISOString();
    const created = !existing || existing.status !== 'active';
    const localeChanged = !!existing && existing.locale !== subscription.locale;
    if (existing) {
      existing.locale = subscription.locale;
      existing.status = 'active';
      existing.updatedAt = now;
      existing.consent = { source: 'newsletter-form', recordedAt: now };
    } else {
      store.subscribers.push({ ...subscription, status: 'active', createdAt: now, updatedAt: now,
        consent: { source: 'newsletter-form', recordedAt: now } });
    }
    await writeStore(dir, store);
    return { created, localeChanged };
  } finally { await release(); }
}

/** Private server-side contract for the newsletter sender, never a public route. */
export async function listActiveSubscribers(): Promise<Array<{ email: string; locale: Locale }>> {
  // Atomic rename lets readers observe either complete snapshot without locking.
  return (await readStore(directory())).subscribers
    .filter(row => row.status === 'active').map(({ email, locale }) => ({ email, locale }));
}

/** Signed unsubscribe links deactivate an existing opt-in under the subscription lock. */
export async function unsubscribe(email: string): Promise<void> {
  const dir = directory();
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const release = await acquireLock(dir);
  try {
    const store = await readStore(dir);
    const row = store.subscribers.find(r => r.email === email);
    if (row && row.status === 'active') {
      row.status = 'inactive'; row.updatedAt = new Date().toISOString();
      await writeStore(dir, store);
    }
  } finally { await release(); }
}
