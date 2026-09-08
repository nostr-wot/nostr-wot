import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, readdir, stat, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const cli = resolve('scripts/newsletters/record-sent.mjs');
const sample = (patch: Record<string, unknown> = {}) => ({
  issueId: 'weekly-2026-08-30-v1', version: 1, locale: 'en',
  acceptedAt: '2026-08-30T12:00:00Z', providerMessageId: 'mock-provider-message-001',
  subject: 'Mock weekly issue', preheader: 'Mock preview',
  body: '  Exact editorial text.\n\nSecond paragraph.\n',
  coverageStart: '2026-08-24T00:00:00Z', coverageEnd: '2026-08-30T00:00:00Z', ...patch,
});
async function fixture(t: any) {
  const root = await mkdtemp(join(tmpdir(), 'newsletter-record-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const data = join(root, 'private');
  const input = async (value: unknown, name = 'input.json') => {
    const path = join(root, name);
    await writeFile(path, typeof value === 'string' ? value : JSON.stringify(value), { mode: 0o600 });
    return path;
  };
  return { root, data, input, sent: join(data, 'sent', 'weekly-2026-08-30-v1.json') };
}
function run(receipt: string, data: string | undefined, cwd?: string) {
  return new Promise<{ code: number | null; out: string; err: string }>((done, reject) => {
    const env = { ...process.env };
    if (data) env.NEWSLETTER_DATA_DIR = data; else delete env.NEWSLETTER_DATA_DIR;
    const child = spawn(process.execPath, [cli, '--receipt', receipt], { env, cwd });
    let out = '', err = '';
    child.stdout.on('data', b => out += b); child.stderr.on('data', b => err += b);
    child.on('error', reject); child.on('close', code => done({ code, out, err }));
  });
}
async function ok(result: ReturnType<typeof run>) {
  const r = await result; assert.equal(r.code, 0, r.err); return r;
}

test('records exact editorial text and keeps provider evidence private', async t => {
  const f = await fixture(t), receipt = sample();
  await ok(run(await f.input(receipt), f.data));
  const publicText = await readFile(f.sent, 'utf8');
  assert.deepEqual(JSON.parse(publicText), {
    id: receipt.issueId, version: 1, sentAt: receipt.acceptedAt,
    coverageStart: receipt.coverageStart, coverageEnd: receipt.coverageEnd,
    translations: { en: { subject: receipt.subject, preheader: receipt.preheader, body: receipt.body, sentAt: receipt.acceptedAt } },
  });
  assert(!publicText.includes(receipt.providerMessageId));
  const privatePath = join(f.data, 'receipts', receipt.issueId, 'en.json');
  assert.deepEqual(JSON.parse(await readFile(privatePath, 'utf8')), receipt);
  assert.equal((await stat(privatePath)).mode & 0o777, 0o600);
  assert.equal((await stat(join(f.data, 'receipts'))).mode & 0o777, 0o700);
  assert.equal((await stat(f.sent)).mode & 0o777, 0o644);
});

test('same edition is idempotent and preserves its first receipt and timestamp', async t => {
  const f = await fixture(t);
  await ok(run(await f.input(sample()), f.data));
  const before = await readFile(f.sent, 'utf8'), beforeStat = await stat(f.sent);
  const receiptPath = join(f.data, 'receipts', 'weekly-2026-08-30-v1', 'en.json');
  const evidence = await readFile(receiptPath, 'utf8');
  await ok(run(await f.input(sample({ acceptedAt: '2026-08-30T13:00:00Z', providerMessageId: 'mock-retry-id' })), f.data));
  assert.equal(await readFile(f.sent, 'utf8'), before);
  assert.equal((await stat(f.sent)).mtimeMs, beforeStat.mtimeMs);
  assert.equal(await readFile(receiptPath, 'utf8'), evidence);
});

test('rejects edition mutation, version mismatch and conflicting issue coverage', async t => {
  const f = await fixture(t);
  await ok(run(await f.input(sample()), f.data));
  const before = await readFile(f.sent, 'utf8');
  for (const patch of [{ body: 'Changed' }, { subject: 'Changed' }, { preheader: 'Changed' }, { version: 2 }, { locale: 'es', version: 2 }, { locale: 'es', coverageStart: '2026-08-25T00:00:00Z' }]) {
    const r = await run(await f.input(sample(patch)), f.data);
    assert.notEqual(r.code, 0, JSON.stringify(patch));
    assert.equal(await readFile(f.sent, 'utf8'), before);
  }
  assert.deepEqual(await readdir(join(f.data, 'receipts', 'weekly-2026-08-30-v1')), ['en.json']);
});

test('parallel processes add all seven locales without lost updates; retries do not alter editions', async t => {
  const f = await fixture(t), locales = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'];
  const inputs = await Promise.all(locales.map((locale, i) => f.input(sample({ locale, subject: `Mock ${locale}`, acceptedAt: `2026-08-30T1${i}:00:00Z` }), locale + '.json')));
  await Promise.all([...inputs, ...inputs].map(p => ok(run(p, f.data))));
  const result = JSON.parse(await readFile(f.sent, 'utf8'));
  assert.deepEqual(Object.keys(result.translations).sort(), [...locales].sort());
  assert.equal(result.sentAt, '2026-08-30T10:00:00Z');
  for (const locale of locales) assert.equal(result.translations[locale].subject, `Mock ${locale}`);
});

test('concurrent conflicting content yields exactly one accepted immutable edition', async t => {
  const f = await fixture(t);
  const inputs = await Promise.all(['One', 'Two'].map(body => f.input(sample({ body }), body + '.json')));
  const results = await Promise.all(inputs.map(p => run(p, f.data)));
  assert.equal(results.filter(r => r.code === 0).length, 1);
  const archive = JSON.parse(await readFile(f.sent, 'utf8'));
  const receipt = JSON.parse(await readFile(join(f.data, 'receipts', 'weekly-2026-08-30-v1', 'en.json'), 'utf8'));
  assert.equal(archive.translations.en.body, receipt.body);
});

test('recovers a durable receipt without an aggregate and later a missing locale projection', async t => {
  const f = await fixture(t), dir = join(f.data, 'receipts', 'weekly-2026-08-30-v1');
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const receiptPath = join(dir, 'en.json');
  const original = JSON.stringify(sample(), null, 2) + '\n';
  await writeFile(receiptPath, original, { mode: 0o600 });
  await ok(run(await f.input(sample()), f.data));
  assert.equal(await readFile(receiptPath, 'utf8'), original);
  const es = sample({ locale: 'es', body: 'Texto exacto.', acceptedAt: '2026-08-30T11:00:00Z' });
  await writeFile(join(dir, 'es.json'), JSON.stringify(es), { mode: 0o600 });
  await ok(run(await f.input(es), f.data));
  const archive = JSON.parse(await readFile(f.sent, 'utf8'));
  assert.equal(archive.sentAt, es.acceptedAt);
  assert.equal(archive.translations.es.body, es.body);
  assert.equal(archive.translations.en.body, sample().body);
});

test('receipt recovery cannot change a version or repair a tampered public edition', async t => {
  const f = await fixture(t);
  await ok(run(await f.input(sample()), f.data));
  const archive = JSON.parse(await readFile(f.sent, 'utf8'));
  archive.translations.en.body = 'Tampered';
  await writeFile(f.sent, JSON.stringify(archive));
  const r = await run(await f.input(sample({ locale: 'es' })), f.data);
  assert.notEqual(r.code, 0);
  assert.equal(JSON.parse(await readFile(f.sent, 'utf8')).translations.en.body, 'Tampered');
  assert.deepEqual(await readdir(join(f.data, 'receipts', 'weekly-2026-08-30-v1')), ['en.json']);
});

test('validation rejects unknown fields, unsafe identifiers, invalid dates and private content', async t => {
  const f = await fixture(t);
  const bad = [
    { issueId: '../escape' }, { issueId: 'weekly-2026-08-30' }, { issueId: 'weekly-v2' }, { issueId: 'weekly-v01' }, { issueId: 'constructor' }, { issueId: '__proto__' },
    { locale: 'constructor' }, { locale: 'en-US' }, { locale: '__proto__' },
    { version: '1' }, { version: 0 }, { version: 1.5 }, { version: Number.MAX_SAFE_INTEGER + 1 },
    { acceptedAt: '' }, { acceptedAt: '2099-01-01T00:00:00Z' },
    { acceptedAt: '2026-02-30T12:00:00Z' }, { acceptedAt: '2026-08-30' },
    { acceptedAt: '2026-08-30T25:00:00Z' }, { acceptedAt: '2026-08-30T12:00:00' },
    { providerMessageId: '' }, { providerMessageId: ' \n ' }, { providerMessageId: 123 },
    { subject: ' ' }, { body: '' }, { preheader: null }, { body: 'Hello {{recipient.email}}' },
    { body: 'Unsubscribe: https://example.test/unsubscribe?token=mock' }, { body: 'Hello {{recipient.name}}' },
    { email: 'mock-recipient@example.test' }, { recipients: [] }, { prototype: {} },
    { coverageStart: '2026-02-30' }, { coverageEnd: '2099-01-01' },
    { coverageStart: '2026-08-31' }, { coverageEnd: '2026-08-23' },
  ];
  for (const patch of bad) {
    const r = await run(await f.input(sample(patch)), f.data);
    assert.notEqual(r.code, 0, JSON.stringify(patch));
    assert(!r.err.includes('mock-recipient@example.test'));
  }
  const raw = JSON.stringify(sample()).replace('{', '{"__proto__":{"polluted":true},');
  assert.notEqual((await run(await f.input(raw), f.data)).code, 0);
  await assert.rejects(stat(f.sent), { code: 'ENOENT' });
});

test('supports timezone offsets and omitted coverage using the default private data directory', async t => {
  const f = await fixture(t);
  const { coverageStart, coverageEnd, ...receipt } = sample({ acceptedAt: '2026-08-30T14:00:00+02:00' });
  await ok(run(await f.input(receipt), undefined, f.root));
  const archive = JSON.parse(await readFile(join(f.root, 'data/newsletter/sent/weekly-2026-08-30-v1.json'), 'utf8'));
  assert.equal(archive.sentAt, receipt.acceptedAt);
  assert(!('coverageStart' in archive)); assert(!('coverageEnd' in archive));
});

test('rejects symlink destinations without changing their target', async t => {
  const f = await fixture(t);
  await mkdir(f.data, { mode: 0o700 });
  const outside = join(f.root, 'outside'); await mkdir(outside);
  await symlink(outside, join(f.data, 'sent'));
  assert.notEqual((await run(await f.input(sample()), f.data)).code, 0);
  assert.deepEqual(await readdir(outside), []);
});

test('exported sending hook records directly without invoking a CLI or mailing service', async t => {
  const f = await fixture(t);
  const { recordSentReceipt } = await import('../scripts/newsletters/record-sent.mjs');
  const receipt = sample();
  const first = await recordSentReceipt(receipt, { dataDir: f.data });
  assert.deepEqual(first, { id: receipt.issueId, locale: 'en', status: 'recorded', path: f.sent });
  assert.equal((await recordSentReceipt(receipt, { dataDir: f.data })).status, 'unchanged');
  await assert.rejects(recordSentReceipt({ ...receipt, issueId: 'private-id-leak-v1', body: receipt.providerMessageId }, { dataDir: f.data }));
  await assert.rejects(recordSentReceipt(receipt, { dataDir: '' }));
});

test('receipt-only recovery rejects a different version before creating a public record', async t => {
  const f = await fixture(t), dir = join(f.data, 'receipts', 'weekly-2026-08-30-v1');
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(join(dir, 'en.json'), JSON.stringify(sample()), { mode: 0o600 });
  assert.notEqual((await run(await f.input(sample({ locale: 'es', version: 2 })), f.data)).code, 0);
  await assert.rejects(stat(f.sent), { code: 'ENOENT' });
  assert.deepEqual(await readdir(dir), ['en.json']);
});

test('waits for a live lock contender and recovers safely after its process is killed', async t => {
  const f = await fixture(t), dir = join(f.data, 'locks', 'weekly-2026-08-30-v1');
  await mkdir(dir, { recursive: true, mode: 0o700 });
  // A separate local process pauses in the ticket-selection phase. It is never
  // considered stale merely because another importer has waited for a while.
  const child = spawn(process.execPath, ['--input-type=module', '-e', `
    import {writeFileSync} from 'node:fs'; import {randomUUID} from 'node:crypto';
    import {join} from 'node:path';
    writeFileSync(join(process.argv[1], process.pid+'-'+randomUUID()+'.json'), JSON.stringify({pid:process.pid,ticket:null}), {mode:0o600});
    process.stdout.write('ready\\n'); setInterval(()=>{},1000);
  `, dir]);
  t.after(() => { if (child.exitCode === null) child.kill('SIGKILL'); });
  await new Promise<void>((done, reject) => { child.stdout.once('data', () => done()); child.once('error', reject); });
  const result = run(await f.input(sample()), f.data);
  await new Promise(done => setTimeout(done, 300));
  await assert.rejects(stat(f.sent), { code: 'ENOENT' });
  const exit = new Promise<void>(done => child.once('close', () => done()));
  child.kill('SIGKILL'); await exit;
  await ok(result);
  assert.equal(JSON.parse(await readFile(f.sent, 'utf8')).translations.en.body, sample().body);
  // A dead ticket is not unlinked by another process. A retry ignores it too.
  await ok(run(await f.input(sample()), f.data));
});

test('equal acceptance instants with different timezone strings remain idempotent', async t => {
  const f = await fixture(t);
  const { recordSentReceipt } = await import('../scripts/newsletters/record-sent.mjs');
  const en = sample({ acceptedAt: '2026-08-30T14:00:00+02:00' });
  const de = sample({ locale: 'de', acceptedAt: '2026-08-30T12:00:00Z' });
  await recordSentReceipt(en, { dataDir: f.data });
  await recordSentReceipt(de, { dataDir: f.data });
  const before = await readFile(f.sent, 'utf8');
  assert.equal((await recordSentReceipt(en, { dataDir: f.data })).status, 'unchanged');
  assert.equal((await recordSentReceipt(de, { dataDir: f.data })).status, 'unchanged');
  assert.equal(await readFile(f.sent, 'utf8'), before);
});

test('recorded output is accepted by the real archive validator and file reader', async t => {
  const f = await fixture(t);
  const { recordSentReceipt } = await import('../scripts/newsletters/record-sent.mjs');
  const { validateSentNewsletter, getSentNewsletter } = await import('../lib/newsletter-archive');
  const receipt = sample({ preheader: '', body: 'Public editorial contact: contact@example.test\nNo recipient data.' });
  await recordSentReceipt(receipt, { dataDir: f.data });
  const archive = JSON.parse(await readFile(f.sent, 'utf8'));
  assert.deepEqual(validateSentNewsletter(archive), archive);
  assert.deepEqual(await getSentNewsletter(receipt.issueId, f.data), archive);
  assert.equal(archive.coverageStart, receipt.coverageStart);
  assert.equal(archive.translations.en.body, receipt.body);
});

test('enforces reader content limits and total encoded aggregate bytes without partial additions', async t => {
  const f = await fixture(t);
  const { recordSentReceipt } = await import('../scripts/newsletters/record-sent.mjs');
  const { getSentNewsletter } = await import('../lib/newsletter-archive');
  const big = sample({ subject: 's'.repeat(500), preheader: 'p'.repeat(2000), body: '界'.repeat(120_000) });
  for (const patch of [{ subject: 's'.repeat(501) }, { preheader: 'p'.repeat(2001) }, { body: 'b'.repeat(120_001) }]) {
    await assert.rejects(recordSentReceipt({ ...big, ...patch }, { dataDir: f.data }));
  }
  await recordSentReceipt(big, { dataDir: f.data });
  await recordSentReceipt({ ...big, locale: 'es' }, { dataDir: f.data });
  const before = await readFile(f.sent, 'utf8');
  await assert.rejects(recordSentReceipt({ ...big, locale: 'de' }, { dataDir: f.data }));
  assert.equal(await readFile(f.sent, 'utf8'), before);
  assert.deepEqual(await readdir(join(f.data, 'receipts', big.issueId)), ['en.json', 'es.json']);
  assert.ok(Buffer.byteLength(before) <= 1_048_576);
  assert.deepEqual(await getSentNewsletter(big.issueId, f.data), JSON.parse(before));
});
