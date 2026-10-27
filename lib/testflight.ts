export function parseTestFlightRequest(value: unknown): { appleId: string } | null {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  if (body.consent !== true || body.website !== '' || typeof body.appleId !== 'string') return null;
  const appleId = body.appleId.trim();
  if (appleId.length > 254 || !/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(appleId)) return null;
  return { appleId };
}
export function testFlightEmail(appleId: string) {
  const safe = appleId.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  return {to:'hello@nostrwot.com',subject:'Nostr WoT TestFlight request',replyTo:appleId,
    text:`Apple ID email: ${appleId}\n\nRequested access to the Nostr WoT iPhone beta. Consent given to send this email to hello@nostrwot.com for managing the TestFlight invitation. This is not a newsletter signup.`,
    html:`<p>Apple ID email: <strong>${safe}</strong></p><p>Requested access to the Nostr WoT iPhone beta. Consent given to send this email to hello@nostrwot.com for managing the TestFlight invitation. This is not a newsletter signup.</p>`};
}
