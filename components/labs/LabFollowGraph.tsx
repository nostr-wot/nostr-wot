'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {Event} from 'nostr-tools';
import {GraphProvider,useGraph} from '@/contexts/GraphContext';
import {GraphDataProvider} from '@/contexts/GraphDataContext';
import {useGraphData} from '@/hooks/useGraphData';
import GraphCanvas from '@/components/playground/graph/GraphCanvas';
import type {GraphExtension} from '@/lib/graph/extension';
import {Button} from '@/components/ui';
import type {Profile,Session} from './model';

function View({onFallback,extension,profiles}:{onFallback:()=>void;extension:boolean;profiles:Record<string,Profile>}){
 const container=useRef<HTMLDivElement>(null),[width,setWidth]=useState(320);
 const [expanding,setExpanding]=useState(false),[requested,setRequested]=useState(false);
 const {expandLevelTwo,nodeLimitReached,error,isLoading,rootFollowCount,loadMoreFollows,hasMoreFollows,userPubkey}=useGraphData();
 const {addProfiles}=useGraph();
 useEffect(()=>{if(extension&&error)onFallback()},[extension,error,onFallback]);
 useEffect(()=>{const el=container.current;if(!el)return;const observer=new ResizeObserver(()=>setWidth(el.clientWidth));observer.observe(el);setWidth(el.clientWidth);return()=>observer.disconnect()},[]);
 useEffect(()=>{addProfiles(new Map(Object.entries(profiles).map(([pubkey,p])=>[pubkey,{pubkey,name:p.name,displayName:p.display_name,picture:p.picture}])));},[profiles,addProfiles]);
 return <div><div ref={container} className="relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-600 h-[300px]" aria-label="Gráfico de las personas que seguís"><GraphCanvas width={width} height={300}/>{!requested&&<div className="absolute bottom-3 right-3 left-3 flex justify-end"><Button size="sm" disabled={isLoading||nodeLimitReached} onClick={async()=>{setRequested(true);setExpanding(true);try{await expandLevelTwo()}finally{setExpanding(false)}}}>Cargar todo el segundo nivel</Button></div>}{(isLoading||expanding)&&<span className="absolute top-3 left-3 rounded-lg bg-white dark:bg-gray-900 px-3 py-2 text-xs text-gray-700 dark:text-gray-200" role="status">{expanding?'Cargando segundo nivel…':'Cargando tu red…'}</span>}</div><div className="flex justify-between gap-3 mt-2 text-xs text-gray-600 dark:text-gray-300"><p>Tocá una persona para explorar sus conexiones.</p>{rootFollowCount!==null&&<span>{rootFollowCount} seguidos</span>}</div>{hasMoreFollows(userPubkey)&&<button className="mt-2 text-sm underline" disabled={isLoading} onClick={()=>void loadMoreFollows(userPubkey)}>Mostrar más personas</button>}{nodeLimitReached&&<p className="text-xs mt-2 text-gray-600 dark:text-gray-300">Mostramos hasta 500 personas para mantener el gráfico fluido.</p>}{error&&!extension&&<p role="status" className="text-xs mt-2 text-gray-600 dark:text-gray-300">Algunas conexiones todavía no están disponibles.</p>}</div>
}
export default function LabFollowGraph({session,following,profiles}:{session:Session;following?:Event;profiles:Record<string,Profile>}){
 const [source,setSource]=useState<'local'|'extension'|null>(null),[provider,setProvider]=useState<GraphExtension>();
 useEffect(()=>{let alive=true;let timer:ReturnType<typeof setTimeout>|undefined;setSource(null);const candidate=session.mode==='extension'?(window as unknown as {nostr?:GraphExtension}).nostr:undefined;
 if(!candidate?.wot){setSource('local');return}
 timer=setTimeout(()=>{if(alive){alive=false;setSource('local')}},1200);
 void candidate.wot.getStatus().then(s=>{if(!alive)return;clearTimeout(timer);setProvider(candidate);setSource(s.mode==='local'&&s.hasLocalGraph?'extension':'local')},()=>{if(alive){clearTimeout(timer);setSource('local')}});
 return()=>{alive=false;clearTimeout(timer)};
 },[session.pubkey,session.mode]);
 const fallback=useCallback(()=>setSource('local'),[]);
 if(!source)return <div className="h-[300px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">Cargando tu red…</div>;
 return <GraphProvider key={`${session.pubkey}:${source}:${following?.id??'empty'}`}><GraphDataProvider rootPubkey={session.pubkey} sourceKind={source} extension={provider} initialFollows={following}><View extension={source==='extension'} onFallback={fallback} profiles={profiles}/></GraphDataProvider></GraphProvider>
}
