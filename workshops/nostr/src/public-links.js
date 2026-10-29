import {nip19} from 'nostr-tools';
import {escapeHTML as esc} from './events.js';
export function profileLinks(pubkey){
 if(!/^[a-f0-9]{64}$/.test(pubkey||''))return [];
 const npub=nip19.npubEncode(pubkey),pointer=nip19.nprofileEncode({pubkey});
 return [{name:'Nostr WoT',url:`https://nostrwot.com/es/profile/${npub}`,description:'Tu perfil, notas y lista de personas seguidas.'},{name:'njump',url:`https://njump.me/${npub}`,description:'Tu perfil público y publicaciones, sin iniciar sesión.'},{name:'Coracle',url:`https://coracle.social/${pointer}`,description:'Otra vista de tu perfil y tus conexiones.'}];
}
export function publicLinksHTML(pubkey,kind=0){return `<p>${kind===3?'Tu lista de seguidos también viaja con tu identidad. En Nostr WoT buscá “Siguiendo”; en Coracle, abrí las conexiones del perfil.':'El mismo perfil puede verse en distintas apps, sin crear otra cuenta.'}</p><div class="public-links">${profileLinks(pubkey).map(a=>`<a href="${a.url}" target="_blank" rel="noopener noreferrer"><strong>${esc(a.name)} ↗</strong><small>${esc(a.description)}</small></a>`).join('')}</div><p class="caption">Cada app consulta sus relays y puede tardar en actualizarse. Si todavía no aparece el cambio, esperá y recargá la otra app. Abrir estos enlaces no publica nada nuevo.</p>`}
