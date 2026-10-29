import {verifyEvent} from 'nostr-tools';
import {relayRequest,parseRelays,escapeHTML as esc} from './events.js';
export const ARCHIVE_LIMIT=5000;
export function readArchive(value,pubkey){
 const list=Array.isArray(value)?value:value?.events;
 if(!Array.isArray(list)||!list.length||list.length>ARCHIVE_LIMIT)throw Error('El archivo debe contener entre 1 y 5000 eventos.');
 const unique=new Map();
 for(const raw of list){const e=JSON.parse(JSON.stringify(Object.fromEntries(['id','pubkey','created_at','kind','tags','content','sig'].map(k=>[k,raw?.[k]]))));if(e.kind>=20000&&e.kind<30000)throw Error('El archivo contiene solicitudes temporales de conexión, firma o pago. No se reenvían como publicaciones.');if(e.pubkey!==pubkey)throw Error('Hay eventos de otra identidad. Conectá la cuenta que creó este archivo.');if(!verifyEvent(e))throw Error('Hay un evento con firma inválida o contenido alterado. No se enviará el archivo.');unique.set(e.id,e)}
 return [...unique.values()];
}
export async function collectArchive(pubkey,urls,{request=relayRequest,onProgress=(_count)=>{},cancelled=()=>false,limit=ARCHIVE_LIMIT}={}){
 const events=new Map(),reports=[];let size=0;
 for(const url of urls){let until,complete=false,message='';
  for(let page=0;page<100&&!cancelled();page++){
   const r=await request(url,'read',{filter:{authors:[pubkey],limit:100,...(until===undefined?{}:{until})}});
   let added=0;
   for(const e of r.events){if(events.has(e.id))continue;if(events.size>=limit||size+JSON.stringify(e).length>18000000){message='Se alcanzó el límite de esta descarga.';break}events.set(e.id,e);size+=JSON.stringify(e).length;added++}
   onProgress(events.size);
   if(message)break;
   if(r.status!=='complete'){message=r.message;break}
   if(r.truncated){message='El relay devolvió eventos que exceden el tamaño admitido.';break}
   if(r.events.length<100){complete=true;break}
   const oldest=Math.min(...r.events.map(e=>e.created_at));
   if(oldest===until){message='Hay demasiados eventos con la misma fecha para continuar sin saltar datos.';break}
   until=oldest;
  }
  reports.push({url,complete,message:message||(cancelled()?'Consulta cancelada':complete?'Consulta terminada':'Límite de consultas alcanzado')});
  if(cancelled())break;
 }
 return {format:'nostrwot-lab-archive-v1',pubkey,exported_at:new Date().toISOString(),reports,events:[...events.values()].sort((a,b)=>b.created_at-a.created_at||a.id.localeCompare(b.id))};
}
