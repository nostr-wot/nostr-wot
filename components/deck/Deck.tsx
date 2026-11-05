'use client';
import {useEffect,useRef,useState} from 'react';
import HeroAnimation from '@/components/HeroAnimation';
import AnimatedWotLogo from '@/components/icons/AnimatedWotLogo';
import {CTAIllustration} from '@/components/icons/CTAIllustration';
import {locales,localeNames,type Locale} from '@/i18n/config';
import type {Slide,Resource,DeckMessages} from './types';
import Tour from './Tour';
function Arrow({back=false}:{back?:boolean}){return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={back?{transform:'rotate(180deg)'}:{}}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function Links({items}:{items:Resource[]}){return <div className="link-grid">{items.map(({title,description,href})=><a key={href} href={href} target="_blank" rel="noopener noreferrer"><div><strong>{title}</strong><span>{description}</span></div><Arrow/></a>)}</div>}
function Art({slide,locale,resources}:{slide:Slide;locale:Locale;resources:Resource[]}){
 if(!slide.art)return <AnimatedWotLogo size={340} className="cover-logo"/>;
 if(slide.art==='contact')return <div className="contact-art"><CTAIllustration className="contact-illustration"/><Links items={resources.slice(8)}/></div>;
 if(slide.art==='resources'||slide.art==='sources')return <Links items={resources.slice(slide.art==='resources'?0:4,slide.art==='resources'?4:8)}/>;
 if(slide.art==='apps')return <div className="apps">{[['Obelisk','obelisk-chat.gif','https://obelisk.ar'],['Sky','obelisk-sky.gif','https://sky.obelisk.ar/app'],['La Wallet','lawallet-receive.gif','https://beta.lawallet.io/wallet']].map(([name,img,url])=><a key={name} href={url} target="_blank" rel="noopener noreferrer"><img src={'/deck/assets/'+img} alt={name} decoding="async"/><span>{name}<Arrow/></span></a>)}</div>;
 const vector=slide.art.endsWith('.svg');
 return <img className="illustration" src={`/deck/assets/${vector?locale+'/':''}${slide.art}`} alt={slide.title} decoding="async"/>;
}
export default function Deck({locale,slides,ui,resources}:{locale:Locale;slides:Slide[];ui:DeckMessages['ui'];resources:Resource[]}){
 const [index,setIndex]=useState(0),[modal,setModal]=useState<'info'|'index'|null>(null),[tour,setTour]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),info=useRef<HTMLButtonElement>(null),menu=useRef<HTMLButtonElement>(null),main=useRef<HTMLElement>(null),start=useRef<[number,number]|null>(null);
 const s=slides[index];
 function go(n:number){location.hash=String(Math.max(0,Math.min(slides.length-1,n))+1)}
 function close(){dialog.current?.close();setModal(null);(modal==='info'?info:menu).current?.focus()}
 function finishTour(){setTour(false);try{localStorage.setItem('nostr-guide-tour-v1','seen')}catch{}}
 useEffect(()=>{const read=()=>Math.max(0,Math.min(slides.length-1,Math.floor(Number(location.hash.slice(1))||1)-1));const hash=()=>{setIndex(read());setModal(null);dialog.current?.close()};hash();try{setTour(localStorage.getItem('nostr-guide-tour-v1')!=='seen')}catch{setTour(true)}window.addEventListener('hashchange',hash);return()=>window.removeEventListener('hashchange',hash)},[slides.length]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(tour||dialog.current?.open||e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName))return;if(['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End'].includes(e.key)){e.preventDefault();go(e.key==='Home'?0:e.key==='End'?slides.length-1:index+(['ArrowRight','PageDown'].includes(e.key)?1:-1))}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[index,tour,slides.length]);
 useEffect(()=>{if(modal)dialog.current?.showModal()},[modal]);
 useEffect(()=>{document.title=s.title+' · Nostr WoT';if(main.current)main.current.scrollTop=0},[s.title]);
 return <div className="nostr-deck dark">
 <div className="hero-background" aria-hidden="true"><HeroAnimation/></div>
 <div className="presentation"><header><a className="brand" href={locale==='en'?'/':`/${locale}`} target="_blank" rel="noopener noreferrer"><AnimatedWotLogo size={38}/><span>Nostr WoT</span></a><div className="header-actions">
 <select className="language-selector" aria-label={ui.nav[8]} value={locale} onChange={e=>{location.href=(e.target.value==='en'?'/deck':`/${e.target.value}/deck`)+`#${index+1}`}}>{locales.map(l=><option value={l} key={l}>{localeNames[l]}</option>)}</select>
 <button className="help-button" aria-label={ui.nav[7]} onClick={()=>setTour(true)}>?</button><button ref={menu} className="outline-button slide-selector" onClick={()=>setModal('index')}>{ui.nav[2]} <span aria-hidden="true">☷</span></button></div></header>
 <main ref={main} onTouchStart={e=>start.current=[e.touches[0].clientX,e.touches[0].clientY]} onTouchEnd={e=>{if(!start.current)return;const[x,y]=start.current,dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*2)go(index+(dx<0?1:-1));start.current=null}}>
 <article key={index} className={'slide '+(index===0?'cover':'')} aria-labelledby="slide-title"><div className="copy"><h1 id="slide-title">{s.title}</h1><p className="summary">{s.summary}</p>{s.points.length>0&&<ul className="key-points">{s.points.map(p=><li key={p}>{p}</li>)}</ul>}{s.link&&s.cta&&<a className="text-link" href={s.link} target="_blank" rel="noopener noreferrer">{s.cta}<Arrow/></a>}</div><div className="art"><Art slide={s} locale={locale} resources={resources}/></div></article></main>
 <footer><div className="progress" aria-hidden="true"><span style={{width:`${(index+1)/slides.length*100}%`}}/></div><nav aria-label={ui.nav[9]}><button className="nav-button back" disabled={index===0} onClick={()=>go(index-1)}><Arrow back/><span>{ui.nav[0]}</span></button><span className="count" aria-live="polite">{index+1} <span>/ {slides.length}</span></span><button className="nav-button next" disabled={index===slides.length-1} onClick={()=>go(index+1)}><span>{ui.nav[1]}</span><Arrow/></button></nav><button ref={info} className="info-button" aria-label={ui.nav[3]} aria-haspopup="dialog" onClick={()=>setModal('info')}><span aria-hidden="true">i</span></button></footer></div>
 <dialog ref={dialog} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===dialog.current)close()}}><div className="dialog-inner"><div className="dialog-head"><span>{modal==='index'?ui.nav[2]:ui.nav[6]}</span><button aria-label={ui.nav[4]} onClick={close}>×</button></div><h2 id="dialog-title">{modal==='index'?ui.nav[5]:s.title}</h2>{modal==='index'?<ol className="slide-list">{slides.map((slide,i)=><li key={i}><button aria-current={i===index?'step':undefined} onClick={()=>{go(i);close()}}><span>{String(i+1).padStart(2,'0')}</span>{slide.title}</button></li>)}</ol>:<><div className="detail">{s.body.split('\n\n').map((p,i)=><p key={i}>{p}</p>)}{s.takeaway&&<aside>{s.takeaway}</aside>}</div>{s.link&&<a className="resource-button" href={s.link} target="_blank" rel="noopener noreferrer">{s.cta||ui.nav[10]}<Arrow/></a>}</>}</div></dialog>
 {tour&&<Tour ui={ui} onClose={finishTour}/>}
 </div>;
}
