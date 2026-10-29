'use client';
import {useEffect,useMemo,useState} from 'react';
import {verifyEvent,type Event} from 'nostr-tools';
import {Button,Card} from '@/components/ui';
import target from '@/lib/labs/reaction-target.json';
import {getProfiles,type Profile} from './model';
import {Avatar} from './shared';
const reference='nevent1qqsx7gstk2dvvs5ze6van6vwfac7hdk3ypulyeqanhwx2jr3dp7wp8cde5ne3';
const targetID='6f220bb29ac64282ce99d9e98e4f71ebb6d12079f2641d9ddc654871687ce09f';
export default function LabReaction({relays,busy,onReview}:{relays:string[];busy:boolean;onReview:(event:Event,emoji:string)=>void}){
 const [profile,setProfile]=useState<Profile>({name:'Nostr WoT'});
 // Keep the exact signed public note available even if its relay is temporarily offline.
 const note=useMemo(()=>{const e=JSON.parse(JSON.stringify(target)) as Event;return e.id===targetID&&e.kind===1&&verifyEvent(e)?e:null},[]);
 useEffect(()=>{if(!note)return;let alive=true;void getProfiles([note.pubkey],relays,p=>{if(alive&&p[note.pubkey])setProfile(p[note.pubkey])}).catch(()=>{});return()=>{alive=false}},[note,relays]);
 if(!note)return <p role="alert">No pudimos verificar la publicación del taller.</p>;
 return <div className="max-w-2xl mx-auto space-y-4"><p className="text-sm text-gray-600 dark:text-gray-300">Leé la publicación de Nostr WoT y elegí cómo reaccionar.</p><Card className="!p-4"><div className="flex items-center gap-3 mb-4"><Avatar profile={profile}/><div className="flex-1 min-w-0"><strong>{String(profile.display_name||profile.name||'Nostr WoT')}</strong><p className="text-xs text-gray-600 dark:text-gray-300"><time dateTime={new Date(note.created_at*1000).toISOString()}>{new Date(note.created_at*1000).toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'})}</time></p></div><a href={`https://njump.me/${reference}`} target="_blank" rel="noopener noreferrer" aria-label="Ver publicación original" className="p-2 rounded-lg focus-visible:outline-2 focus-visible:outline-primary">↗</a></div><p className="whitespace-pre-wrap break-words text-sm max-h-64 overflow-auto">{note.content}</p></Card><div className="flex flex-wrap gap-2" role="group" aria-label="Elegí tu reacción">{[['+','♡ Me gusta'],['❤️','❤️'],['🤙','🤙'],['🔥','🔥']].map(([value,label])=><Button key={value} variant="outline" disabled={busy} onClick={()=>onReview(note,value)}>{label}</Button>)}</div></div>;
}
