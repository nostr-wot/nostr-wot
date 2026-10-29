// Local browser verification only: all relay reads/writes stay in this fixture.
import {finalizeEvent,getPublicKey} from 'nostr-tools';
const secret=new Uint8Array(32);secret[31]=17;const pubkey=getPublicKey(secret),otherSecret=new Uint8Array(32);otherSecret[31]=18;const other=getPublicKey(otherSecret);
const now=Math.floor(Date.now()/1000)-60;
const sign=(e,key=secret)=>finalizeEvent(e,key);
const events=[sign({kind:0,created_at:now,tags:[],content:JSON.stringify({name:'Prueba local',display_name:'Prueba local',about:'Perfil de prueba del laboratorio.'})}),sign({kind:1,created_at:now,tags:[],content:'Esta nota solo existe en la prueba local.'}),sign({kind:3,created_at:now,tags:[['p',other]],content:''}),sign({kind:0,created_at:now,tags:[],content:JSON.stringify({name:'Persona de ejemplo'})},otherSecret)];
window.nostr={getPublicKey:async()=>pubkey,signEvent:async e=>sign(e)};
window.WebSocket=class {constructor(url){this.url=url;queueMicrotask(()=>this.onopen?.())}send(raw){const m=JSON.parse(raw);if(m[0]==='REQ'){const f=m[2];for(const e of events.filter(e=>(!f.authors||f.authors.includes(e.pubkey))&&(!f.kinds||f.kinds.includes(e.kind))&&(!f.ids||f.ids.includes(e.id))&&(f.until===undefined||e.created_at<=f.until)).sort((a,b)=>b.created_at-a.created_at).slice(0,f.limit||100))this.onmessage?.({data:JSON.stringify(['EVENT',m[1],e])});this.onmessage?.({data:JSON.stringify(['EOSE',m[1]])})}if(m[0]==='EVENT'){events.push(m[1]);this.onmessage?.({data:JSON.stringify(['OK',m[1].id,true,'Local fixture only'])})}}close(){}};
await import('../src/app.js');
