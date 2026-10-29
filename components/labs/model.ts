import type {Event,EventTemplate,Filter} from 'nostr-tools';
import {nip19,SimplePool} from 'nostr-tools';
import {getCachedProfiles,cacheProfiles} from '@/lib/cache/profileCache';
import {selectProfileEvent,profileFromEvent} from '@/lib/graph/profile-events';
import {relayRequest} from '@/lib/labs/events';
export type Profile={name?:string;display_name?:string;about?:string;picture?:string;banner?:string;website?:string;[key:string]:unknown};
export type Signer={getPublicKey:()=>Promise<string>;signEvent:(e:EventTemplate)=>Promise<Event>;close?:()=>void|Promise<void>};
export type Session={pubkey:string;mode:'extension'|'local'|'mobile';signer:Signer;dispose?:()=>void};
export type Report={url:string;status:string;message:string;events:Event[];truncated?:boolean};
export const request=relayRequest as unknown as (url:string,op:string,args:{filter?:Filter;event?:Event})=>Promise<Report>;
export const DEFAULT_RELAYS=['wss://relay.damus.io','wss://nos.lol'];
export const short=(k:string)=>{const n=nip19.npubEncode(k);return n.slice(0,10)+'…'+n.slice(-6)};
export function imageURL(v:unknown){try{const u=new URL(String(v));return u.protocol==='https:'&&!u.username&&!u.password?u.href:undefined}catch{return undefined}}
export function parseMetadata(e:Event):Profile{try{const p=JSON.parse(e.content);return p&&typeof p==='object'&&!Array.isArray(p)?p:{}}catch{return {}}}
export function newest(events:Event[]){return [...events].sort((a,b)=>b.created_at-a.created_at||a.id.localeCompare(b.id))[0]}
export function publicKey(value:string){let v=value.trim().replace(/^nostr:/,'');if(/^https?:\/\//.test(v))v=new URL(v).pathname.split('/').filter(Boolean).at(-1)||'';if(/^[a-f0-9]{64}$/.test(v))return v;const d=nip19.decode(v);if(d.type==='npub')return d.data;if(d.type==='nprofile')return d.data.pubkey;throw Error('Usá una clave npub o un enlace de perfil.')}
export async function getProfiles(keys:string[],relays:string[],onUpdate?:(p:Record<string,Profile>)=>void){
 const result:Record<string,Profile>={};
 for(const [key,p] of getCachedProfiles(keys))result[key]={...p,display_name:p.displayName};
 if(Object.keys(result).length)onUpdate?.({...result});
 const missing=[...new Set(keys)].filter(k=>!result[k]);if(!missing.length)return result;
 const pool=new SimplePool(),latest=new Map<string,Event>();
 try{await Promise.all(Array.from({length:Math.ceil(missing.length/80)},(_,i)=>new Promise<void>(resolve=>{
 let sub:{close:()=>void}|undefined,done=false;
 const finish=()=>{if(done)return;done=true;clearTimeout(timer);sub?.close();resolve()};const timer=setTimeout(finish,5000);
 try{sub=pool.subscribeMany([...new Set([...relays,'wss://purplepag.es'])],{authors:missing.slice(i*80,(i+1)*80),kinds:[0]},{maxWait:5000,onevent(e){if(done)return;const selected=selectProfileEvent(latest.get(e.pubkey)||null,e,e.pubkey,0);if(!selected||selected===latest.get(e.pubkey))return;latest.set(e.pubkey,selected);result[e.pubkey]=parseMetadata(selected);onUpdate?.({...result})},oneose:finish,onclose:finish});if(done)sub.close()}catch{finish()}
 })));const profiles=[...latest.values()].map(profileFromEvent).filter((p):p is NonNullable<typeof p>=>!!p);if(profiles.length)cacheProfiles(profiles);return result}finally{pool.destroy()}
}
