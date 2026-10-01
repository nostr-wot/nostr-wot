import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, validateOrigin } from '@/lib/rate-limit';
import { emailService, emailTemplates } from '@/lib/email';
import { parseUninstallFeedback } from '@/lib/uninstall-feedback';

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const limit = checkRateLimit(`uninstall:${getClientIdentifier(request)}`, RATE_LIMITS.contact);
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests' }, {
    status: 429, headers: { 'Retry-After': String(limit.resetIn) },
  });
  // Bound the actual streamed body, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: 'Missing body' }, { status: 400 });
  let raw = '';
  let bytes = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 32768) {
        await reader.cancel();
        return NextResponse.json({ error: 'Body too large' }, { status: 413 });
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    const feedback = parseUninstallFeedback(JSON.parse(raw));
    if (!feedback) return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 });
    const template = emailTemplates.contactNotification({
      type: 'support', name: 'Extension uninstall feedback',
      email: feedback.email || 'Not provided', subject: 'Extension uninstall feedback',
      message: `Why did you uninstall?\n${feedback.reason}\n\nWhat did you hope it would help with?\n${feedback.expectations || 'Not provided'}`,
    });
    const result = await emailService.send({
      to: process.env.CONTACT_EMAIL || 'contact@nostr-wot.com',
      ...template, ...(feedback.email ? { replyTo: feedback.email } : {}),
    });
    return result.success
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: 'Delivery failed' }, { status: 503 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } finally {
    reader.releaseLock();
  }
}
