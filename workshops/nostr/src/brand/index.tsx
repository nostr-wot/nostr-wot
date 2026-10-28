// Original website components, copied from nostr-wot/nostr-wot (f5b501a).
import {createRoot} from 'react-dom/client';
import {useEffect,useState} from 'react';
import AnimatedWotLogo from './AnimatedWotLogo';
import HeroAnimation from './HeroAnimation';
function BrandLogo(){
  const [reduce,setReduce]=useState(matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduce(q.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
  return reduce?<img src="assets/nostr-wot-mark.svg" width="96" height="96" alt="Nostr WoT"/>:<AnimatedWotLogo size={96}/>;
}
createRoot(document.getElementById('brand-background')!).render(<HeroAnimation/>);
for(const el of document.querySelectorAll('.animated-brand'))createRoot(el).render(<BrandLogo/>);
