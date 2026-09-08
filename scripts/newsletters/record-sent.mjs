#!/usr/bin/env node
/** Import trusted provider-acceptance receipts. This module never sends mail. */
import { constants } from 'node:fs';
import { mkdir, lstat, open, readdir, rename, link, unlink } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const LOCALES = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'];
const MAX_FILE_BYTES = 1_048_576;
const RECEIPT_KEYS = ['issueId', 'version', 'locale', 'acceptedAt', 'providerMessageId', 'subject', 'preheader', 'body', 'coverageStart', 'coverageEnd'];
const EDITORIAL_KEYS = ['subject', 'preheader', 'body'];
const COVERAGE_KEYS = ['coverageStart', 'coverageEnd'];
const own = (o, k) => Object.hasOwn(o, k);
class ReceiptError extends Error {}
function requireThat(condition, message) {
  if (!condition) throw new ReceiptError(message);
}
function objectWithKeys(value, allowed, required = allowed) {
  requireThat(value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value)), 'Expected a plain object.');
  requireThat(Object.keys(value).every(k => allowed.includes(k))
    && required.every(k => own(value, k)), 'Missing, unknown or unsafe fields.');
}
function dateOnly(value) {
  requireThat(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value), 'Expected a YYYY-MM-DD date.');
  const parsed = new Date(value + 'T00:00:00Z');
  requireThat(Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value, 'Invalid calendar date.');
  return value;
}
function timestamp(value, now) {
  requireThat(typeof value === 'string', 'Expected an acceptance timestamp.');
  const parts = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  requireThat(parts !== null, 'Timestamp must include seconds and an explicit timezone.');
  dateOnly(parts[1]);
  requireThat(+parts[2] < 24 && +parts[3] < 60 && +parts[4] < 60, 'Invalid timestamp clock time.');
  if (parts[5] !== 'Z') requireThat(+parts[5].slice(1, 3) < 24 && +parts[5].slice(4) < 60, 'Invalid timezone offset.');
  const ms = Date.parse(value);
  requireThat(Number.isFinite(ms) && ms <= now, 'Invalid or future acceptance timestamp.');
  return ms;
}
function text(value, limit, field, multiline = false, allowEmpty = false) {
  requireThat(typeof value === 'string' && (allowEmpty || value.trim().length > 0)
    && value.length <= limit, `Invalid ${field}.`);
  requireThat(!(multiline ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/).test(value), `Invalid controls in ${field}.`);
}
function editorial(record) {
  for (const field of EDITORIAL_KEYS) {
    text(record[field], { subject: 500, preheader: 2000, body: 120_000 }[field], field, field === 'body', field === 'preheader');
    // Fail closed on obvious personalization leakage. Arbitrary personal text
    // cannot be detected: the trusted sender must supply only its editorial payload.
    requireThat(!/(?:\{\{|<%=|%EMAIL%|https?:\/\/\S*(?:unsubscribe|opt-out|optout))/i.test(record[field]),
      'Editorial content contains a personalization placeholder or unsubscribe link.');
  }
}
function coverage(record, acceptedMs) {
  for (const field of COVERAGE_KEYS) {
    if (own(record, field)) timestamp(record[field], acceptedMs);
  }
  if (own(record, 'coverageStart') && own(record, 'coverageEnd')) requireThat(Date.parse(record.coverageStart) <= Date.parse(record.coverageEnd), 'Coverage dates are reversed.');
}
function validateReceipt(record, now = Date.now()) {
  objectWithKeys(record, RECEIPT_KEYS, RECEIPT_KEYS.filter(k => !COVERAGE_KEYS.includes(k)));
  requireThat(typeof record.issueId === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*-v([1-9][0-9]*)$/.test(record.issueId)
    && record.issueId.length <= 100, 'Invalid issueId.');
  requireThat(Number.isSafeInteger(record.version) && record.version > 0, 'Version must be a positive safe integer.');
  requireThat(Number(record.issueId.match(/-v([1-9][0-9]*)$/)[1]) === record.version, 'Issue ID version suffix must match version.');
  requireThat(LOCALES.includes(record.locale), 'Unsupported locale.');
  const ms = timestamp(record.acceptedAt, now);
  text(record.providerMessageId, 512, 'providerMessageId');
  editorial(record);
  requireThat(!EDITORIAL_KEYS.some(k => record[k].includes(record.providerMessageId)), 'Editorial content contains the provider message ID.');
  coverage(record, ms);
  // Copy only documented fields. Caller mutations cannot change a pending import.
  return Object.fromEntries(RECEIPT_KEYS.filter(k => own(record, k)).map(k => [k, record[k]]));
}
async function directory(path, mode) {
  await mkdir(path, { recursive: true, mode });
  const st = await lstat(path);
  requireThat(st.isDirectory() && !st.isSymbolicLink(), 'Storage directory must not be a symlink.');
  requireThat(typeof process.getuid !== 'function' || st.uid === process.getuid(), 'Storage must belong to the importing user.');
  requireThat((st.mode & 0o022) === 0 && (mode !== 0o700 || (st.mode & 0o077) === 0), 'Unsafe storage directory permissions.');
  await syncDirectory(dirname(path));
}
async function readJSON(path, { optional = false, privateFile = false } = {}) {
  let handle;
  try {
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const st = await handle.stat();
    requireThat(st.isFile() && st.size <= MAX_FILE_BYTES, 'Expected a bounded regular JSON file.');
    requireThat(!privateFile || (st.mode & 0o077) === 0, 'Receipt files must be private (0600).');
    const buffer = Buffer.alloc(MAX_FILE_BYTES + 1);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    requireThat(bytesRead <= MAX_FILE_BYTES, 'JSON file is too large.');
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, bytesRead));
    try { return JSON.parse(raw); } catch { throw new ReceiptError('Malformed JSON.'); }
  } catch (error) {
    if (optional && error.code === 'ENOENT') return null;
    throw error;
  } finally { await handle?.close(); }
}
async function syncDirectory(path) {
  const handle = await open(path, constants.O_RDONLY);
  try { await handle.sync(); } finally { await handle.close(); }
}
async function atomicJSON(path, value, mode, exclusive = false) {
  const serialized = JSON.stringify(value, null, 2) + '\n';
  requireThat(Buffer.byteLength(serialized) <= MAX_FILE_BYTES, 'Encoded JSON exceeds the 1 MiB archive limit.');
  const temp = join(dirname(path), `.tmp-${process.pid}-${randomUUID()}`);
  let handle;
  try {
    handle = await open(temp, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, mode);
    await handle.writeFile(serialized, 'utf8');
    await handle.chmod(mode);
    await handle.sync();
    await handle.close(); handle = undefined;
    if (exclusive) await link(temp, path); // publish a complete file, never replace evidence
    else await rename(temp, path);
    await syncDirectory(dirname(path));
  } finally {
    await handle?.close();
    await unlink(temp).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}
function processAlive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}
/** Lamport bakery lock: one unique ticket per contender, never steal/unlink
 * another process's lock. Dead-process tickets are ignored, so SIGKILL recovery
 * cannot accidentally remove a new owner's lock. Local single-host filesystem only. */
async function withIssueLock(dir, action) {
  const name = `${process.pid}-${randomUUID()}.json`, path = join(dir, name);
  const deadline = Date.now() + 30_000;
  async function tickets() {
    const entries = [];
    for (const file of await readdir(dir)) {
      if (file.startsWith('.tmp-')) continue;
      const match = /^(\d+)-[0-9a-f-]{36}\.json$/.exec(file);
      requireThat(match !== null, 'Unrecognized lock entry.');
      const pid = Number(match[1]);
      requireThat(Number.isSafeInteger(pid) && pid > 0, 'Invalid lock process.');
      if (!processAlive(pid)) continue;
      const item = await readJSON(join(dir, file), { optional: true, privateFile: true });
      if (item === null) continue;
      objectWithKeys(item, ['pid', 'ticket']);
      requireThat(item.pid === pid && (item.ticket === null || (Number.isSafeInteger(item.ticket) && item.ticket > 0)), 'Invalid lock ticket.');
      entries.push({ ...item, name: file });
    }
    return entries;
  }
  await atomicJSON(path, { pid: process.pid, ticket: null }, 0o600, true);
  try {
    const ticket = Math.max(0, ...(await tickets()).map(t => t.ticket ?? 0)) + 1;
    requireThat(Number.isSafeInteger(ticket), 'Lock ticket limit reached.');
    await atomicJSON(path, { pid: process.pid, ticket }, 0o600);
    while (true) {
      const peers = await tickets();
      const blocked = peers.some(t => t.name !== name && (t.ticket === null || t.ticket < ticket || (t.ticket === ticket && t.name < name)));
      if (!blocked) return await action();
      requireThat(Date.now() < deadline, 'Timed out waiting for an active import; retry later.');
      await delay(15 + Math.floor(Math.random() * 20));
    }
  } finally {
    await unlink(path);
    await syncDirectory(dir);
  }
}
function sameCoverage(a, b) {
  return COVERAGE_KEYS.every(k => own(a, k) === own(b, k) && a[k] === b[k]);
}
function sameEdition(a, b) {
  return a.issueId === b.issueId && a.version === b.version && a.locale === b.locale
    && sameCoverage(a, b) && EDITORIAL_KEYS.every(k => a[k] === b[k]);
}
function projection(receipts) {
  const first = receipts[0];
  const earliest = [...receipts].sort((a, b) => Date.parse(a.acceptedAt) - Date.parse(b.acceptedAt) || a.locale.localeCompare(b.locale))[0];
  const aggregate = { id: first.issueId, version: first.version, sentAt: earliest.acceptedAt };
  for (const k of COVERAGE_KEYS) if (own(first, k)) aggregate[k] = first[k];
  aggregate.translations = {};
  for (const r of [...receipts].sort((a, b) => a.locale.localeCompare(b.locale))) {
    aggregate.translations[r.locale] = { subject: r.subject, preheader: r.preheader, body: r.body, sentAt: r.acceptedAt };
  }
  return aggregate;
}
function validateExistingPublic(publicRecord, receipts) {
  objectWithKeys(publicRecord, ['id', 'version', 'sentAt', 'coverageStart', 'coverageEnd', 'translations'], ['id', 'version', 'sentAt', 'translations']);
  objectWithKeys(publicRecord.translations, LOCALES, []);
  const locales = Object.keys(publicRecord.translations);
  requireThat(locales.length > 0, 'Existing public record has no editions.');
  const matched = locales.map(locale => {
    const edition = publicRecord.translations[locale];
    objectWithKeys(edition, [...EDITORIAL_KEYS, 'sentAt']);
    const receipt = receipts.find(r => r.locale === locale);
    requireThat(receipt && EDITORIAL_KEYS.every(k => edition[k] === receipt[k]) && edition.sentAt === receipt.acceptedAt,
      'Existing public edition differs from its private receipt or has no receipt.');
    return receipt;
  });
  const expected = projection(matched);
  requireThat(publicRecord.id === expected.id && publicRecord.version === expected.version
    && publicRecord.sentAt === expected.sentAt && sameCoverage(publicRecord, expected), 'Existing issue metadata differs from its receipts.');
}

/**
 * @param {{issueId:string, version:number, locale:string, acceptedAt:string,
 * providerMessageId:string, subject:string, preheader:string, body:string,
 * coverageStart?:string, coverageEnd?:string}} receipt
 * @param {{dataDir?:string}} [options]
 * @returns {Promise<{id:string, locale:string, status:'recorded'|'recovered'|'unchanged', path:string}>}
 */
export async function recordSentReceipt(receipt, { dataDir } = {}) {
  const input = validateReceipt(receipt);
  requireThat(dataDir === undefined || (typeof dataDir === 'string' && dataDir.trim().length > 0), 'Invalid dataDir.');
  const root = resolve(dataDir ?? (process.env.NEWSLETTER_DATA_DIR || join(process.cwd(), 'data/newsletter')));
  await directory(root, 0o700);
  for (const sub of ['receipts', 'locks']) await directory(join(root, sub), 0o700);
  await directory(join(root, 'sent'), 0o755);
  const receiptDir = join(root, 'receipts', input.issueId), lockDir = join(root, 'locks', input.issueId);
  await directory(receiptDir, 0o700); await directory(lockDir, 0o700);
  const publicPath = join(root, 'sent', input.issueId + '.json');
  return withIssueLock(lockDir, async () => {
    const receipts = [];
    for (const file of (await readdir(receiptDir)).sort()) {
      if (file.startsWith('.tmp-')) continue; // an interrupted unpublished temporary file
      requireThat(LOCALES.some(l => file === l + '.json'), 'Unexpected private receipt filename.');
      const r = validateReceipt(await readJSON(join(receiptDir, file), { privateFile: true }));
      requireThat(r.issueId === input.issueId && file === r.locale + '.json', 'Receipt identity does not match its path.');
      requireThat(r.version === input.version, 'Issue version mismatch; revisions need a new unique issueId.');
      requireThat(sameCoverage(r, input), 'Issue coverage mismatch.');
      receipts.push(r);
    }
    const existing = await readJSON(publicPath, { optional: true });
    if (existing !== null) validateExistingPublic(existing, receipts);
    const previous = receipts.find(r => r.locale === input.locale);
    requireThat(!previous || sameEdition(previous, input), 'Existing edition is immutable; revisions need a new unique issueId.');
    const aggregate = projection(previous ? receipts : [...receipts, input]);
    requireThat(Buffer.byteLength(JSON.stringify(aggregate, null, 2) + '\n') <= MAX_FILE_BYTES, 'Encoded aggregate exceeds the 1 MiB archive limit.');
    if (!previous) {
      await atomicJSON(join(receiptDir, input.locale + '.json'), input, 0o600, true);
      receipts.push(input);
    }
    // Avoid replacing an existing public file for a deduplicated retry.
    const unchanged = existing !== null && Object.keys(existing.translations).length === receipts.length;
    if (!unchanged) await atomicJSON(publicPath, aggregate, 0o644);
    return { id: input.issueId, locale: input.locale, status: !previous ? 'recorded' : unchanged ? 'unchanged' : 'recovered', path: publicPath };
  });
}

async function main() {
  const args = process.argv.slice(2);
  requireThat(args.length === 2 && args[0] === '--receipt' && !args[1].startsWith('--'), 'Usage: node scripts/newsletters/record-sent.mjs --receipt /private/receipt.json');
  const receipt = await readJSON(resolve(args[1]), { privateFile: true });
  const result = await recordSentReceipt(receipt);
  // No provider IDs, payload text, addresses or private receipt paths in output.
  process.stdout.write(`${result.status}: ${result.id} (${result.locale})\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    process.stderr.write((error instanceof ReceiptError ? error.message : 'Storage operation failed; check paths and permissions.') + '\n');
    process.exitCode = 1;
  });
}
