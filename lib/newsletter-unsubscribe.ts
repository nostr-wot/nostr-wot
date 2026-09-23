import { createHmac, timingSafeEqual } from 'node:crypto';
import { parseSubscription } from './newsletter-subscribers';

export function unsubscribeEmail(token: string): string | null {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY;
  if (!secret || token.length > 1024) return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !/^[A-Za-z0-9_-]{43}$/.test(signature || '') || extra) return null;
  const expected = createHmac('sha256', secret).update(`newsletter-unsubscribe:${payload}`).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { return parseSubscription({email: Buffer.from(payload, 'base64url').toString('utf8'), locale:'en'}).email; }
  catch { return null; }
}
