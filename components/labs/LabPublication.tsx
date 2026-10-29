'use client';
import type {Event} from 'nostr-tools';
import {nip19} from 'nostr-tools';
import {Button,Card,TextArea} from '@/components/ui';
import {Avatar} from './shared';
import {short,type Profile} from './model';

type Props={pubkey:string;profile:Profile;notes:Event[];loading:boolean;loadError:boolean;note:string;onNote:(text:string)=>void;busy:boolean;onReview:()=>void;};
export default function LabPublication({pubkey,profile,notes,loading,loadError,note,onNote,busy,onReview}:Props){
 const name=String(profile.display_name||profile.name||short(pubkey));
 const history=notes.filter(e=>e.pubkey===pubkey&&e.kind===1);
 return <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-5 items-start">
 <section aria-label="Crear una publicación" className="min-w-0 space-y-2">
 <><TextArea id="lab-note" label="¿Qué querés compartir?" rows={2} className="!py-2" maxLength={2000} value={note} onChange={e=>onNote(e.target.value)}/><section aria-label="Vista previa de tu nota"><div className="flex justify-between items-center mb-2"><h3 className="text-sm font-semibold">Vista previa</h3><span className="text-xs text-gray-600 dark:text-gray-300">Sin publicar</span></div><Card padding="sm" className="!p-3"><div className="flex items-center gap-2 mb-2"><Avatar profile={profile} size={28}/><strong className="text-sm truncate">{name}</strong></div>{note.trim()?<p className="whitespace-pre-wrap break-words text-sm max-h-48 overflow-auto">{note}</p>:<p className="text-sm text-gray-600 dark:text-gray-300">Tu nota aparecerá acá mientras escribís.</p>}</Card></section></>
 <Button className="!py-2" disabled={busy||!note.trim()} onClick={onReview}>Crear evento</Button>
 </section>
 <aside aria-label="Publicaciones anteriores de esta cuenta" className="min-w-0 md:sticky md:top-0 border-t md:border-t-0 md:border-l border-gray-300 dark:border-gray-600 pt-4 md:pt-0 md:pl-5"><div className="flex justify-between items-center gap-2 mb-3"><h3 className="font-semibold">Tus publicaciones</h3>{history.length>0&&<span className="text-xs text-gray-600 dark:text-gray-300">{history.length} recientes</span>}</div><div className="space-y-3 max-h-96 overflow-auto pr-1" aria-busy={loading}>{history.map(e=><Card key={e.id} padding="sm" className="!p-3"><div className="flex items-center gap-2 mb-2"><Avatar profile={profile} size={28}/><div className="min-w-0 flex-1"><strong className="block text-sm truncate">{name}</strong><time dateTime={new Date(e.created_at*1000).toISOString()} className="text-xs text-gray-600 dark:text-gray-300">{new Date(e.created_at*1000).toLocaleString('es-AR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</time></div><a href={`https://njump.me/${nip19.neventEncode({id:e.id,author:e.pubkey})}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg focus-visible:outline-2 focus-visible:outline-primary" aria-label="Abrir publicación en njump">↗</a></div><p className="whitespace-pre-wrap break-words text-sm max-h-40 overflow-auto">{e.content}</p></Card>)}{loading&&<p role="status" className="text-sm text-gray-600 dark:text-gray-300">Buscando publicaciones…</p>}{!loading&&!history.length&&<p className="text-sm text-gray-600 dark:text-gray-300">{loadError?'No pudimos consultar tus publicaciones en los relays.':'No encontramos notas de esta cuenta en tus relays. Cuando publiques, aparecerán acá.'}</p>}{!loading&&loadError&&history.length>0&&<p className="text-xs text-gray-600 dark:text-gray-300">Algunos relays no respondieron. Puede haber más publicaciones.</p>}</div></aside>
 </div>
}
