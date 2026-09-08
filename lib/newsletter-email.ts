import { Resend } from 'resend';
import { localeNames, type Locale } from '../i18n/config';

const copy: Record<Locale, { subject: string; heading: string; body: string; language: string }> = {
  en: { subject: "Nostr WoT: you're subscribed", heading: 'Thanks for subscribing!', body: 'Your subscription is saved. You will receive Nostr WoT news and updates.', language: 'Newsletter language: English.' },
  es: { subject: 'Nostr WoT: suscripción confirmada', heading: '¡Gracias por suscribirte!', body: 'Tu suscripción está guardada. Recibirás noticias y novedades de Nostr WoT.', language: 'Idioma del boletín: español.' },
  pt: { subject: 'Nostr WoT: inscrição confirmada', heading: 'Obrigado por se inscrever!', body: 'Sua inscrição foi salva. Você receberá notícias e novidades do Nostr WoT.', language: 'Idioma da newsletter: português.' },
  ru: { subject: 'Nostr WoT: подписка оформлена', heading: 'Спасибо за подписку!', body: 'Ваша подписка сохранена. Вы будете получать новости и обновления Nostr WoT.', language: 'Язык рассылки: русский.' },
  it: { subject: 'Nostr WoT: iscrizione confermata', heading: 'Grazie per esserti iscritto!', body: 'La tua iscrizione è stata salvata. Riceverai notizie e aggiornamenti su Nostr WoT.', language: 'Lingua della newsletter: italiano.' },
  fr: { subject: 'Nostr WoT : inscription confirmée', heading: 'Merci pour votre inscription !', body: 'Votre inscription est enregistrée. Vous recevrez les actualités de Nostr WoT.', language: 'Langue de la newsletter : français.' },
  de: { subject: 'Nostr WoT: Anmeldung bestätigt', heading: 'Danke für deine Anmeldung!', body: 'Deine Anmeldung wurde gespeichert. Du erhältst Neuigkeiten und Updates zu Nostr WoT.', language: 'Newsletter-Sprache: Deutsch.' },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function newsletterEmails(email: string, locale: Locale) {
  const c = copy[locale];
  const text = `${c.heading}\n\n${c.body}\n\n${c.language}`;
  const notification = `Newsletter subscription: ${email}\nLanguage: ${localeNames[locale]} (${locale})`;
  return {
    welcome: { subject: c.subject, text, html: `<html lang="${locale}"><body><h1>${escapeHtml(c.heading)}</h1><p>${escapeHtml(c.body)}</p><p>${escapeHtml(c.language)}</p></body></html>` },
    notification: { subject: `Newsletter subscription (${locale})`, text: notification, html: `<p>${escapeHtml(notification).replace(/\n/g, '<br>')}</p>` },
  };
}

/** Separate transport avoids the shared service's raw provider-error logging. */
export async function sendNewsletterEmails(email: string, locale: Locale): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;
    const client = new Resend(apiKey);
    const templates = newsletterEmails(email, locale);
    await Promise.allSettled([
      client.emails.send({ from: 'Nostr WoT <noreply@nostr-wot.com>', to: process.env.CONTACT_EMAIL || 'contact@nostr-wot.com', ...templates.notification }),
      client.emails.send({ from: 'Nostr WoT <noreply@nostr-wot.com>', to: email, ...templates.welcome }),
    ]);
  } catch {
    // Persistence is authoritative. Do not log addresses or provider payloads,
    // or turn a failed confirmation email into a duplicate registration retry.
  }
}
