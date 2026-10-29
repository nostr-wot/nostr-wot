import {Button} from '@/components/ui';
import AnimatedWotLogo from '@/components/icons/AnimatedWotLogo';

export type Workshop = {
 id:string; date:string; day:string; month:string; year:string; time:string;
 event:string; logo:string; title:string; description:string; location:string;
 facilitator:string; practice:string; presentation:string; agenda:string;
};

export default function WorkshopCard({workshop:w}:{workshop:Workshop}){
 return <article className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 overflow-hidden" aria-labelledby={`workshop-${w.id}`}>
 <div className="grid md:grid-cols-[150px_1fr]">
 <div className="bg-primary/10 border-b md:border-b-0 md:border-r border-primary/20 p-5 md:p-7 flex md:flex-col items-center md:justify-start gap-4 md:gap-3">
 <time dateTime={w.date} aria-label={`${w.day} de ${w.month} de ${w.year}`} className="text-center shrink-0"><span className="block text-5xl sm:text-6xl font-bold tracking-tight leading-none">{w.day}</span><span className="block mt-2 text-lg font-semibold uppercase">{w.month}</span><span className="block text-sm text-gray-600 dark:text-gray-300 mt-1">{w.year}</span></time>
 <div className="md:border-t md:border-primary/20 md:pt-4 md:mt-2 md:text-center"><p className="font-semibold text-sm whitespace-nowrap">{w.time}</p><p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Buenos Aires · UTC−3</p></div>
 </div>
 <div className="p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4 mb-5"><div className="flex items-center gap-2 text-sm font-semibold"><AnimatedWotLogo size={28}/>Taller Nostr WoT</div><a href={w.agenda} target="_blank" rel="noopener noreferrer" aria-label={`Ver agenda oficial de ${w.event}`} className="flex items-center gap-3 rounded-lg bg-gray-950 px-4 py-3 border border-gray-700 hover:border-primary transition-colors"><img src={w.logo} alt={w.event} width="971" height="114" className="w-36 sm:w-40 h-auto"/><span className="text-white" aria-hidden="true">↗</span></a></div>
 <h3 id={`workshop-${w.id}`} className="text-2xl sm:text-3xl font-bold tracking-tight">{w.title}</h3><p className="text-gray-600 dark:text-gray-300 mt-3 max-w-2xl">{w.description}</p>
 <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">{w.location} <span aria-hidden="true">·</span> {w.facilitator}</p>
 <div className="grid sm:grid-cols-2 gap-3 mt-6"><Button as="link" href={w.practice} variant="outline" className="w-full">Acceder a la práctica →</Button><Button as="link" href={w.presentation} external download variant="outline" className="w-full">Descargar presentación ↓</Button></div>
 <a href={w.agenda} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-gray-600 dark:text-gray-300 underline underline-offset-4 mt-4 hover:text-primary">Ver agenda oficial de {w.event} ↗</a>
 </div></div></article>;
}
