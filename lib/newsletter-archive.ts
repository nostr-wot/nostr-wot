/** Server-side, uncached reads of public newsletter snapshots written by the sender. */
import { constants } from 'node:fs';
import { lstat, open, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { locales, type Locale } from '@/i18n/config';

export type SentNewsletterTranslation = {
  subject: string;
  preheader: string;
  body: string;
  sentAt: string;
};
export type SentNewsletter = {
  id: string;
  version: number;
  sentAt: string;
  coverageStart?: string;
  coverageEnd?: string;
  translations: Partial<Record<Locale, SentNewsletterTranslation>>;
};

const MAX_BYTES = 1_048_576;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-v([1-9][0-9]*)$/;

export function isNewsletterId(id: string): boolean {
  return id.length <= 100 && ID_PATTERN.test(id);
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, required: string[], optional: string[] = []): boolean {
  return required.every(key => Object.hasOwn(value, key)) && Object.keys(value).every(key => required.includes(key) || optional.includes(key));
}
function text(value: unknown, max: number, allowEmpty = false, multiline = false): value is string {
  return typeof value === 'string' && value.length <= max && (allowEmpty || !!value.trim()) &&
    !(multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value);
}
/** ISO timestamps with an explicit timezone. Reject impossible calendar dates. */
function timestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  const day = value.slice(0, 10);
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day && Number.isFinite(Date.parse(value));
}

function coverageDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return timestamp(value);
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Strict allowlist: drafts, delivery/provider metadata and subscriber fields are
 * not part of the public contract. Body is trusted public editorial text only;
 * it is never interpreted as markup. This is schema validation, not PII redaction.
 */
export function validateSentNewsletter(value: unknown): SentNewsletter | null {
  if (!object(value) || !keys(value, ['id', 'version', 'sentAt', 'translations'], ['coverageStart', 'coverageEnd'])) return null;
  if (typeof value.id !== 'string' || !isNewsletterId(value.id) || !Number.isSafeInteger(value.version) || Number(value.id.match(ID_PATTERN)?.[1]) !== value.version) return null;
  if (!timestamp(value.sentAt) || Date.parse(value.sentAt) > Date.now()) return null;
  for (const key of ['coverageStart', 'coverageEnd']) {
    if (Object.hasOwn(value, key) && !coverageDate(value[key])) return null;
  }
  if (typeof value.coverageStart === 'string' && typeof value.coverageEnd === 'string' && Date.parse(value.coverageStart) > Date.parse(value.coverageEnd)) return null;
  if (!object(value.translations) || !Object.keys(value.translations).length) return null;
  for (const [locale, translation] of Object.entries(value.translations)) {
    if (!(locales as readonly string[]).includes(locale) || !object(translation) || !keys(translation, ['subject', 'preheader', 'body', 'sentAt'])) return null;
    if (!text(translation.subject, 500) || !text(translation.preheader, 2000, true) || !text(translation.body, 120_000, false, true) || !timestamp(translation.sentAt) || Date.parse(translation.sentAt) > Date.now()) return null;
  }
  return value as SentNewsletter;
}

function dataDirectory(): string {
  return process.env.NEWSLETTER_DATA_DIR || join(process.cwd(), 'data', 'newsletter');
}
async function sentDirectory(directory: string): Promise<string | null> {
  const sent = join(directory, 'sent');
  try {
    const stat = await lstat(sent);
    return stat.isDirectory() && !stat.isSymbolicLink() ? sent : null;
  } catch { return null; }
}

/** Only sent/<id>.json is public. Missing, invalid and unsafe files fail closed. */
export async function getSentNewsletter(id: string, directory = dataDirectory()): Promise<SentNewsletter | null> {
  if (!isNewsletterId(id)) return null;
  const sent = await sentDirectory(directory);
  if (!sent) return null;
  let file;
  try {
    // NOFOLLOW rejects symlinks; NONBLOCK avoids hanging on a FIFO masquerading as JSON.
    file = await open(join(sent, `${id}.json`), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > MAX_BYTES) return null;
    const buffer = Buffer.alloc(MAX_BYTES + 1);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);
    if (bytesRead > MAX_BYTES) return null;
    const record = validateSentNewsletter(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, bytesRead))));
    return record?.id === id ? record : null;
  } catch { return null; }
  finally { await file?.close(); }
}

/** Fresh full records, newest first. No fixture imports, build cache or locale fallback. */
export async function listSentNewsletters(directory = dataDirectory()): Promise<SentNewsletter[]> {
  const sent = await sentDirectory(directory);
  if (!sent) return [];
  let names;
  try { names = await readdir(sent, { withFileTypes: true }); } catch { return []; }
  const records: SentNewsletter[] = [];
  for (const entry of names) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const record = await getSentNewsletter(entry.name.slice(0, -5), directory);
    if (record) records.push(record);
  }
  return records.sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt) || b.id.localeCompare(a.id));
}
