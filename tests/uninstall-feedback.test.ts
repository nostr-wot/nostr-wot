import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SendEmailOptions } from '../lib/email';
import { parseUninstallFeedback } from '../lib/uninstall-feedback';

test('accepts feedback without identity and trims input', () => {
  assert.deepEqual(parseUninstallFeedback({reason: ' Too complicated ', expectations: '', email: '', website: ''}),
    {reason: 'Too complicated', expectations: '', email: ''});
});
test('accepts an optional reply address and expectations', () => {
  assert.deepEqual(parseUninstallFeedback({reason: 'Other', expectations: 'Signing', email: 'me@example.com'}),
    {reason: 'Other', expectations: 'Signing', email: 'me@example.com'});
});
test('rejects empty, malformed, oversized and bot submissions', () => {
  for (const body of [null, [], {}, {reason:'  '}, {reason:42}, {reason:'x', email:'bad'},
    {reason:'x', email:'a@b.com\r\nBcc: x@y.com'}, {reason:'x'.repeat(3001)},
    {reason:'x', expectations:'x'.repeat(3001)}, {reason:'x', website:'https://spam.test'},
    {reason:'x', email:[]}, {reason:'x', expectations:{}}]) {
    assert.equal(parseUninstallFeedback(body), null, JSON.stringify(body));
  }
});

test('endpoint validates origin and body, escapes feedback, and reports delivery failure', async () => {
  const { mock } = await import('node:test');
  const { NextRequest } = await import('next/server');
  const { emailService } = await import('../lib/email');
  // The shared limiter owns a process timer. Keep it from holding this test open.
  const interval = globalThis.setInterval;
  const timer = mock.method(globalThis, 'setInterval', (...args: Parameters<typeof setInterval>) => {
    const handle = interval(...args); handle.unref(); return handle;
  });
  const { POST } = await import('../app/api/uninstall-feedback/route');
  const sent: SendEmailOptions[] = [];
  const mail = mock.method(emailService, 'send', async (data: SendEmailOptions) => { sent.push(data); return { success: true }; });
  let ip = 0;
  const request = (body: string, origin = 'https://nostr-wot.com', client = String(++ip)) => new NextRequest('https://nostr-wot.com/api/uninstall-feedback', {
    method: 'POST', headers: { origin, 'x-forwarded-for': client, 'Content-Type': 'application/json' }, body,
  });
  try {
    assert.equal((await POST(request('{"reason":"x"}', 'https://other.test'))).status, 403);
    assert.equal((await POST(request('not json'))).status, 400);
    assert.equal((await POST(request(JSON.stringify({ reason: [] })))).status, 400);
    assert.equal((await POST(request('x'.repeat(33000)))).status, 413);
    assert.equal(sent.length, 0);
    const response = await POST(request(JSON.stringify({ reason: '<script>alert(1)</script>' })));
    assert.equal(response.status, 200);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].replyTo, undefined);
    assert.ok(sent[0].html.includes('&lt;script&gt;'));
    assert.ok(!sent[0].html.includes('<script>'));
    assert.equal((await POST(request(JSON.stringify({reason:'Feedback',email:'me@example.com'})))).status,200);
    assert.equal(sent[1].replyTo,'me@example.com');
    mail.mock.mockImplementation(async () => ({ success: false, error: 'Provider unavailable' }));
    assert.equal((await POST(request('{"reason":"x"}'))).status, 503);
    for (let i=0;i<5;i++) await POST(request('{}', 'https://nostr-wot.com', 'rate-test'));
    const limited = await POST(request('{}', 'https://nostr-wot.com', 'rate-test'));
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  } finally { mail.mock.restore(); timer.mock.restore(); }
});
