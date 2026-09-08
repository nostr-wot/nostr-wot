import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { mkdtemp, readFile, writeFile, stat, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { NextRequest } from 'next/server';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { NewsletterForm } from '../components/ui/NewsletterForm';
import { locales } from '../i18n/config';
import { listActiveSubscribers, subscribe, parseSubscription } from '../lib/newsletter-subscribers';
import { newsletterEmails } from '../lib/newsletter-email';
import { POST } from '../app/api/newsletter/route';

const exec = promisify(execFile);

test('newsletter persistence, validation and delivery boundaries', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'newsletter-test-'));
  const previous = process.env.NEWSLETTER_DATA_DIR;
  const previousKey = process.env.RESEND_API_KEY;
  process.env.NEWSLETTER_DATA_DIR = dir;
  process.env.RESEND_API_KEY = 'test-only-not-a-real-key';
  // Never send real email. The actual transport receives only synthetic inputs.
  let deliveries = 0;
  const transport = mock.method(globalThis, 'fetch', async () => {
    deliveries++;
    return new Response(JSON.stringify({ name: 'validation_error', message: 'synthetic failure' }), { status: 422 });
  });
  const interval = globalThis.setInterval;
  const timer = mock.method(globalThis, 'setInterval', (...args: Parameters<typeof setInterval>) => {
    const handle = interval(...args); handle.unref(); return handle;
  });
  let client = 0;
  function request(body: string, origin = 'https://nostr-wot.com', id = String(++client)) {
    return new NextRequest('https://nostr-wot.com/api/newsletter', {
      method: 'POST', headers: { origin, 'x-forwarded-for': `test-${id}`, 'content-type': 'application/json' }, body,
    });
  }
  try {
    await t.test('missing store is empty; subscriptions survive process restart and have private permissions', async () => {
      assert.deepEqual(await listActiveSubscribers(), []);
      await subscribe({ email: '  Owner@Example.com ', locale: 'es' });
      assert.deepEqual(await listActiveSubscribers(), [{ email: 'owner@example.com', locale: 'es' }]);
      const store = JSON.parse(await readFile(path.join(dir, 'subscribers.json'), 'utf8'));
      const record = store.subscribers[0];
      assert.equal(record.consent.source, 'newsletter-form');
      assert.ok(Date.parse(record.createdAt)); assert.ok(Date.parse(record.updatedAt));
      assert.equal((await stat(path.join(dir, 'subscribers.json'))).mode & 0o777, 0o600);
      const result = await exec(process.execPath, ['--import', 'tsx', '-e',
        "require('./lib/newsletter-subscribers.ts').listActiveSubscribers().then(x=>process.stdout.write(JSON.stringify(x)))"], { cwd: process.cwd(), env: { ...process.env } });
      assert.deepEqual(JSON.parse(result.stdout), [{ email: 'owner@example.com', locale: 'es' }]);
    });
    await t.test('resubmission changes locale without duplicating or resetting creation time', async () => {
      const before = JSON.parse(await readFile(path.join(dir, 'subscribers.json'), 'utf8')).subscribers[0];
      await subscribe({ email: 'OWNER@example.com', locale: 'de' });
      await subscribe({ email: 'owner@example.com', locale: 'de' });
      const after = JSON.parse(await readFile(path.join(dir, 'subscribers.json'), 'utf8')).subscribers;
      assert.equal(after.length, 1); assert.equal(after[0].createdAt, before.createdAt);
      assert.equal(after[0].locale, 'de'); assert.ok(after[0].updatedAt >= before.updatedAt);
    });
    await t.test('separate writers retain every subscription and deduplicate a shared address', async () => {
      await Promise.all(Array.from({ length: 5 }, (_, i) => exec(process.execPath,
        ['--import', 'tsx', '-e', `const {subscribe}=require('./lib/newsletter-subscribers.ts'); Promise.all([subscribe({email:'worker${i}@example.com',locale:'fr'}),subscribe({email:'shared@example.com',locale:'it'})]).catch(()=>process.exit(1))`],
        { cwd: process.cwd(), env: { ...process.env } })));
      const rows = await listActiveSubscribers();
      assert.equal(rows.length, 7); assert.equal(new Set(rows.map(x => x.email)).size, 7);
    });
    await t.test('invalid input is rejected rather than coerced or defaulted', () => {
      for (const value of [null, [], {}, 'email', { email: 123, locale: 'en' }, { email: [], locale: 'en' },
        { email: 'a@example.com' }, { email: 'a@example.com', locale: 'EN' }, { email: 'a@example.com', locale: ['en'] },
        { email: 'a@example.com', locale: 'ja' }, { email: 'a..b@example.com', locale: 'en' },
        { email: 'a\nb@example.com', locale: 'en' }, { email: 'x'.repeat(255) + '@example.com', locale: 'en' }]) {
        assert.throws(() => parseSubscription(value));
      }
      for (const locale of locales) assert.equal(parseSubscription({ email: 'a@example.com', locale }).locale, locale);
    });
    await t.test('route rejects malformed JSON, bad types and invalid locales with 400', async () => {
      for (const body of ['{', 'null', '[]', '{"email":17,"locale":"en"}', '{"email":"a@example.com","locale":"zz"}']) {
        assert.equal((await POST(request(body))).status, 400);
      }
    });
    await t.test('origin and existing rate limit remain enforced', async () => {
      assert.equal((await POST(request('{}', 'https://attacker.example'))).status, 403);
      for (let i = 0; i < 3; i++) assert.equal((await POST(request('{}', undefined, 'rate'))).status, 400);
      const limited = await POST(request('{}', undefined, 'rate'));
      assert.equal(limited.status, 429); assert.ok(limited.headers.get('retry-after'));
    });
    await t.test('mail failure preserves success and retry does not resend or duplicate', async () => {
      const logs: unknown[][] = [];
      const logger = mock.method(console, 'error', (...args: unknown[]) => { logs.push(args); });
      try {
        const body = JSON.stringify({ email: 'delivery@example.com', locale: 'pt' });
        assert.equal((await POST(request(body))).status, 200);
        const count = deliveries; assert.ok(count > 0);
        assert.equal((await POST(request(body))).status, 200); assert.equal(deliveries, count);
        assert.equal((await listActiveSubscribers()).filter(x => x.email === 'delivery@example.com').length, 1);
        assert.ok(!JSON.stringify(logs).includes('delivery@example.com'));
      } finally { logger.mock.restore(); }
    });
    await t.test('corrupt storage fails closed without overwriting it or claiming success', async () => {
      const file = path.join(dir, 'subscribers.json'); const original = await readFile(file, 'utf8');
      await writeFile(file, '{broken');
      const count = deliveries;
      assert.equal((await POST(request('{"email":"fail@example.com","locale":"en"}'))).status, 500);
      assert.equal(await readFile(file, 'utf8'), '{broken'); assert.equal(deliveries, count);
      await assert.rejects(listActiveSubscribers());
      await writeFile(file, original);
    });
    await t.test('an unwritable destination fails without claiming registration', async () => {
      const blocked = path.join(dir, 'blocked'); await writeFile(blocked, 'not a directory');
      process.env.NEWSLETTER_DATA_DIR = blocked;
      try { assert.equal((await POST(request('{"email":"fail@example.com","locale":"en"}'))).status, 500); }
      finally { process.env.NEWSLETTER_DATA_DIR = dir; }
    });
    await t.test('list excludes inactive records and ignores archive files in the shared directory', async () => {
      await mkdir(path.join(dir, 'archive')); await writeFile(path.join(dir, 'archive', 'issue.json'), '{}');
      const file = path.join(dir, 'subscribers.json'); const store = JSON.parse(await readFile(file, 'utf8'));
      store.subscribers[0].status = 'inactive'; await writeFile(file, JSON.stringify(store));
      assert.ok(!(await listActiveSubscribers()).some(x => x.email === 'owner@example.com'));
    });
    await t.test('a held lock fails closed rather than stealing ownership or losing data', async () => {
      const lock = path.join(dir, 'subscribers.lock');
      await writeFile(lock, 'held', { mode: 0o600 });
      const before = await readFile(path.join(dir, 'subscribers.json'), 'utf8');
      try {
        await assert.rejects(subscribe({ email: 'locked@example.com', locale: 'en' }), /busy/);
        assert.equal(await readFile(path.join(dir, 'subscribers.json'), 'utf8'), before);
        assert.equal(await readFile(lock, 'utf8'), 'held');
      } finally { await rm(lock); }
    });
    await t.test('the rendered form discloses both stored fields in every supported language', () => {
      const expected = {
        en: ['email address', 'preferred language'], es: ['correo electrónico', 'idioma preferido'],
        pt: ['endereço de e-mail', 'idioma preferido'], ru: ['адрес электронной почты', 'предпочитаемый язык'],
        it: ['indirizzo email', 'lingua preferita'], fr: ['adresse e-mail', 'langue préférée'],
        de: ['E-Mail-Adresse', 'bevorzugte Sprache'],
      };
      for (const locale of locales) {
        const html = renderToStaticMarkup(createElement(NextIntlClientProvider, {
          locale, timeZone: 'UTC', messages: { home: { newsletter: { placeholder: 'Email', subscribe: 'Subscribe', subscribing: 'Saving', success: 'Saved' } } },
          children: createElement(NewsletterForm),
        }));
        for (const phrase of expected[locale]) assert.ok(html.includes(phrase), `${locale}: ${phrase}`);
        assert.ok(html.includes('newsletter-storage'));
      }
    });
    await t.test('welcome messages cover all locales, include locale in admin mail and escape HTML', () => {
      const subjects = new Set<string>();
      for (const locale of locales) {
        const emails = newsletterEmails("o'connor@example.com", locale);
        subjects.add(emails.welcome.subject);
        assert.match(emails.welcome.html, new RegExp(`lang="${locale}"`));
        assert.ok(emails.notification.text.includes(locale));
        assert.ok(emails.notification.html.includes('&#39;'));
        assert.ok(emails.welcome.text.length > 30);
      }
      assert.equal(subjects.size, 7);
    });
  } finally {
    transport.mock.restore(); timer.mock.restore();
    if (previous === undefined) delete process.env.NEWSLETTER_DATA_DIR; else process.env.NEWSLETTER_DATA_DIR = previous;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previousKey;
    await rm(dir, { recursive: true, force: true });
  }
});
