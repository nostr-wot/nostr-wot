import {nip19} from 'nostr-tools';
import {suggestions} from './suggestions.js';
import {escapeHTML as esc,relayRequest,parseRelays,parseProfile,profileAvatar} from './events.js';
export const people=suggestions.flatMap(p=>{try{const key=nip19.decode(p.npub);return key.type==='npub'?[{...p,pubkey:key.data}]:[]}catch{return []}});
export function mergeFollows(previous,keys,now=Math.floor(Date.now()/1000)){
 if(previous&&previous.created_at>=now)throw Error('Tu lista acaba de cambiar. Esperá unos segundos y volvé a revisar.');
 if(keys.some(k=>!/^[a-f0-9]{64}$/.test(k)))throw Error('Hay una identidad inválida.');
 const tags=structuredClone(previous?.tags||[]),known=new Set(tags.filter(t=>t[0]==='p').map(t=>t[1]));
 for(const key of new Set(keys))if(!known.has(key)){tags.push(['p',key]);known.add(key)}
 return {kind:3,created_at:now,content:previous?.content||'',tags};
}
