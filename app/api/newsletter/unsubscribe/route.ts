import { NextRequest } from 'next/server';
import { unsubscribeEmail } from '@/lib/newsletter-unsubscribe';
import { unsubscribe } from '@/lib/newsletter-subscribers';
export const runtime = 'nodejs';
const headers = {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex','Content-Security-Policy':"default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"};
const copy: Record<string, [string,string,string]> = {
 en:['Unsubscribe from the Nostr WoT newsletter?','Unsubscribe','You are unsubscribed.'], es:['¿Quieres dejar de recibir el boletín de Nostr WoT?','Cancelar suscripción','Tu suscripción se ha cancelado.'],
 pt:['Cancelar a inscrição na newsletter Nostr WoT?','Cancelar inscrição','A sua inscrição foi cancelada.'], fr:['Se désabonner de la newsletter Nostr WoT ?','Se désabonner','Votre désabonnement est confirmé.'],
 de:['Den Nostr-WoT-Newsletter abbestellen?','Abbestellen','Sie sind abgemeldet.'], it:['Annullare l’iscrizione alla newsletter Nostr WoT?','Annulla iscrizione','La tua iscrizione è stata annullata.'], ru:['Отписаться от рассылки Nostr WoT?','Отписаться','Вы отписались от рассылки.'],
};
function html(body:string, status=200) { return new Response(`<!doctype html><meta charset="utf-8"><title>Nostr WoT</title><main>${body}</main>`,{status,headers}); }
export async function GET(req:NextRequest) {
 if (!unsubscribeEmail(req.nextUrl.searchParams.get('token') || '')) return html('<p>Invalid unsubscribe link.</p>',400);
 const c=copy[req.nextUrl.searchParams.get('lang') || 'en'] || copy.en;
 // No mutation on GET: link scanners cannot unsubscribe readers.
 return html(`<h1>${c[0]}</h1><form method="post"><button type="submit">${c[1]}</button></form>`);
}
export async function POST(req:NextRequest) {
 const email=unsubscribeEmail(req.nextUrl.searchParams.get('token') || '');
 if (!email) return html('<p>Invalid unsubscribe link.</p>',400);
 try { await unsubscribe(email); } catch { return html('<p>Unable to save. Please try again.</p>',503); }
 return html(`<p>${(copy[req.nextUrl.searchParams.get('lang') || 'en'] || copy.en)[2]}</p>`);
}
