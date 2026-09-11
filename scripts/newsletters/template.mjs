import { editorialHtml, escapeHtml } from './format.mjs';
export const TEMPLATE_VERSION='brand-v1';
const copy={
 en:['Weekly newsletter','Read in your browser','Stay connected','You received this because you subscribed to Nostr WoT.','Unsubscribe','Email preview'],
 es:['Boletín semanal','Leer en el navegador','Sigue en contacto','Recibes este correo porque te suscribiste a Nostr WoT.','Cancelar suscripción','Vista previa del correo'],
 pt:['Newsletter semanal','Ler no navegador','Mantenha o contacto','Recebe este email porque se inscreveu no Nostr WoT.','Cancelar inscrição','Pré-visualização do email'],
 fr:['Newsletter hebdomadaire','Lire dans le navigateur','Restons en contact','Vous recevez cet email car vous êtes abonné à Nostr WoT.','Se désabonner','Aperçu de l’email'],
 de:['Wöchentlicher Newsletter','Im Browser lesen','In Verbindung bleiben','Sie erhalten diese E-Mail, weil Sie Nostr WoT abonniert haben.','Abbestellen','E-Mail-Vorschau'],
 it:['Newsletter settimanale','Leggi nel browser','Resta in contatto','Ricevi questa email perché ti sei iscritto a Nostr WoT.','Annulla iscrizione','Anteprima email'],
 ru:['Еженедельная рассылка','Открыть в браузере','Оставайтесь на связи','Вы получили это письмо, потому что подписались на Nostr WoT.','Отписаться','Предпросмотр письма'],
};
// Links match the website footer. X and Nostr currently use the profiles linked there.
export const SOCIAL_LINKS=[['Nostr','https://nostr-wot.com/profile/npub1gxdhmu9swqduwhr6zptjy4ya693zp3ql28nemy4hd97kuufyrqdqwe5zfk'],['GitHub','https://github.com/nostr-wot'],['LinkedIn','https://www.linkedin.com/company/nostr-wot'],['X','https://x.com/leonacosta_'],['Facebook','https://facebook.com/nostr.wot']];
export function newsletterTemplate({edition,locale='en',issueId,date,unsubscribeUrl,preview=false}){
 const c=copy[locale];if(!c)throw Error('Unsupported template locale');
 if(!/^[a-z0-9-]+$/.test(issueId))throw Error('Invalid issue ID');
 if(!preview){const u=new URL(unsubscribeUrl);if(u.origin!=='https://nostr-wot.com'||u.pathname!=='/api/newsletter/unsubscribe')throw Error('Invalid unsubscribe URL');}
 const archive=`https://nostr-wot.com${locale==='en'?'':'/'+locale}/newsletters${preview?'':'/'+issueId}`;
 const formattedDate=new Intl.DateTimeFormat(locale,{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Zurich'}).format(new Date(date));
 const body=editorialHtml(edition.body)
  .replaceAll('<h2>','<h2 style="margin:34px 0 14px;font-size:22px;line-height:1.35;font-weight:700;color:#25234a;">')
  .replaceAll('<p style="white-space:pre-wrap">','<p style="margin:0 0 20px;font-size:16px;line-height:1.75;color:#42435b;white-space:pre-wrap;">')
  .replaceAll('<a href=','<a style="color:#4f46e5;text-decoration:underline;text-underline-offset:3px;" href=')
  .replaceAll('<code>','<code style="font-family:Consolas,monospace;background:#f0eefc;padding:2px 4px;color:#413a79;">');
 const socials=SOCIAL_LINKS.map(([label,url])=>`<a href="${url}" style="display:inline-block;padding:8px 9px;color:#4338ca;font-size:13px;font-weight:600;text-decoration:underline;">${label}</a>`).join(' ');
 const html=`<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(edition.subject)}</title>
<style>@media only screen and (max-width:600px){.outer{padding:16px 8px!important}.inner{padding-left:24px!important;padding-right:24px!important}.headline{font-size:30px!important}.card{width:100%!important}}</style></head>
<body style="margin:0;padding:0;background-color:#f1f0f8;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(edition.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f0f8;"><tr><td class="outer" align="center" style="padding:36px 16px;">
<!--[if mso]><table role="presentation" width="640"><tr><td><![endif]-->
<table class="card" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border:1px solid #e5e3f1;border-radius:16px;overflow:hidden;">
<tr><td style="height:6px;background-color:#6366f1;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="inner" style="padding:28px 40px;background-color:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="54" style="vertical-align:middle;"><a href="https://nostr-wot.com"><img src="https://nostr-wot.com/icon-192.png" width="42" height="42" alt="Nostr WoT" style="display:block;border:0;border-radius:10px;"></a></td><td style="vertical-align:middle;font-size:22px;font-weight:700;letter-spacing:-0.6px;color:#25234a;">Nostr WoT<br><span style="font-size:12px;letter-spacing:0;font-weight:400;color:#73708c;">${c[0]}</span></td></tr></table>
</td></tr>
<tr><td class="inner" style="padding:34px 40px 36px;background-color:#eeecff;border-top:1px solid #e6e2fc;border-bottom:1px solid #e6e2fc;">
<p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:#5b5097;">${preview?c[5]+' · ':''}${escapeHtml(formattedDate)}</p>
<h1 class="headline" style="margin:0 0 18px;font-size:36px;line-height:1.16;letter-spacing:-1px;font-weight:700;color:#242044;">${escapeHtml(edition.subject)}</h1>
<p style="margin:0;font-size:18px;line-height:1.6;color:#5d567d;">${escapeHtml(edition.preheader)}</p>
</td></tr>
<tr><td class="inner" style="padding:8px 40px 28px;background-color:#ffffff;">${body}</td></tr>
<tr><td class="inner" style="padding:0 40px 36px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#4f46e5;border-radius:8px;mso-padding-alt:14px 20px;"><a href="${archive}" style="display:inline-block;padding:14px 20px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">${c[1]}</a></td></tr></table></td></tr>
<tr><td class="inner" align="center" style="padding:28px 32px;background-color:#f7f6fc;border-top:1px solid #e8e5f3;">
<p style="margin:0 0 10px;font-size:16px;font-weight:700;color:#30284e;">${c[2]}</p><p style="margin:0 0 16px;line-height:1.6;">${socials}</p>
<p style="margin:0 0 10px;font-size:12px;line-height:1.7;color:#706c83;">${preview?c[5]:c[3]}</p>
<p style="margin:0;font-size:12px;line-height:1.7;"><a href="https://nostr-wot.com" style="color:#5c5481;">nostr-wot.com</a>${preview?'':` &nbsp;·&nbsp; <a href="${escapeHtml(unsubscribeUrl)}" style="color:#5c5481;">${c[4]}</a>`}</p>
</td></tr></table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
 const text=`${edition.preheader}\n\n${edition.body}\n\n${c[1]}: ${archive}\n\n${c[2]}\n${SOCIAL_LINKS.map(([l,u])=>l+': '+u).join('\n')}\n\n${preview?c[5]:c[3]+'\n'+c[4]+': '+unsubscribeUrl}`;
 return {html,text,templateVersion:TEMPLATE_VERSION};
}
