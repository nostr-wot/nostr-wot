const key='nostrwot-lab-tour-v1';
const pages=[
 ['Un paso a la vez','Perfil → Publicación → Personas → Archivo → Apps','Usá Atrás y Continuar abajo para avanzar. Podés explorar sin completar todo.','PitchDocsIcon'],
 ['La ayuda está en el ⓘ','Una explicación cuando la necesitás','El icono de cada pantalla explica qué ocurre, con gráficos y ejemplos que podés probar.','PitchNetworkGraph'],
 ['Vos aprobás lo que sale','Revisar → Firmar → Publicar','Editar y elegir personas no publica nada. Primero revisás, después firmás y confirmás el envío. La práctica sin instalar usa una identidad que se pierde al cerrar.','PitchShieldIcon'],
 ['Mirá lo que hiciste','Tu perfil → Otras apps','Tocá tu foto arriba para ver tu perfil, notas y seguidos. Después de publicar, los enlaces te muestran cómo la misma identidad aparece en otras apps.','PitchIdentityIcon']
];
export function setupOnboarding(){
 const dialog=document.createElement('dialog');dialog.id='welcome-tour';dialog.setAttribute('aria-labelledby','tour-title');document.body.append(dialog);let index=0;
 function finish(){try{localStorage.setItem(key,'seen')}catch{}dialog.close()}
 function paint(){const [title,subtitle,text,image]=pages[index];dialog.innerHTML=`<div class="dialog-heading"><span class="caption">Guía rápida · ${index+1} de ${pages.length}</span><button id="tour-skip">Omitir</button></div><img class="tour-art" src="assets/official/${image}.svg" alt=""><h2 id="tour-title">${title}</h2><p class="tour-subtitle">${subtitle}</p><p>${text}</p><div class="tour-actions"><button id="tour-back" ${index===0?'hidden':''}>Atrás</button><button id="tour-next" class="primary">${index===pages.length-1?'Listo, vamos':'Siguiente'}</button></div>`;dialog.querySelector('#tour-skip').onclick=finish;dialog.querySelector('#tour-back').onclick=()=>{index--;paint()};dialog.querySelector('#tour-next').onclick=()=>{if(index===pages.length-1)finish();else{index++;paint()}};dialog.querySelector('#tour-next').focus()}
 function open(){document.querySelectorAll('dialog[open]').forEach(d=>d.close());index=0;paint();dialog.showModal()}
 dialog.addEventListener('cancel',()=>{try{localStorage.setItem(key,'seen')}catch{}});
 for(const parent of [document.querySelector('.intro>div'),document.getElementById('session-dialog')]){const b=document.createElement('button');b.className='text-button';b.textContent='Ver guía rápida';b.onclick=open;parent.append(b)}
 let seen=false;try{seen=localStorage.getItem(key)==='seen'}catch{}if(!seen)open();return {open};
}
