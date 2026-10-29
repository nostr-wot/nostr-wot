import type {Event} from 'nostr-tools';
type Result={status:string;events:Event[]};
/** Temporary identities are created here; their retained list is authoritative. */
export async function resolveFollowList(mode:string,retained:Event|undefined,read:()=>Promise<Result[]>){
 if(mode==='local')return retained;
 const results=await read();
 const events=[...(retained?[retained]:[]),...results.flatMap(r=>r.events)];
 if(!events.length&&!results.some(r=>r.status==='complete'))throw Error('No pudimos cargar tu lista de seguidos. Volvé a intentar en unos segundos.');
 return events.sort((a,b)=>b.created_at-a.created_at||a.id.localeCompare(b.id))[0];
}
