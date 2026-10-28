import {generateSecretKey,getPublicKey,finalizeEvent,verifyEvent,SimplePool,nip44} from 'nostr-tools';
const keyPattern=/^[a-f0-9]{64}$/;
export function parseConnectURI(value){
 const u=new URL(value.trim());if(u.protocol!=='nostrconnect:'||!keyPattern.test(u.hostname)||u.username||u.password)throw Error('Pegá el enlace nostrconnect:// que muestra la app.');
 const relays=u.searchParams.getAll('relay');if(!relays.length||relays.length>3)throw Error('La conexión necesita entre uno y tres relays.');
 for(const r of relays){const v=new URL(r);if(v.protocol!=='wss:'||v.username||v.password)throw Error('El relay de conexión debe usar wss://.');}
 const secret=u.searchParams.get('secret');if(!secret||secret.length>256)throw Error('El enlace no tiene un código de conexión válido.');
 return {pubkey:u.hostname,relays,secret};
}
// An opt-in, in-memory signer for the throwaway lab identity only.
// Transport keys and approvals never leave this page or enter browser storage.
export class PracticeBunker{
 constructor({signer,userPubkey,approve,pool=new SimplePool(),onStatus=()=>{},now=()=>Math.floor(Date.now()/1000)}){
  this.signer=signer;this.userPubkey=userPubkey;this.approve=approve;this.pool=pool;this.onStatus=onStatus;this.now=now;this.sk=generateSecretKey();this.pubkey=getPublicKey(this.sk);this.token=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');this.started=now();this.closed=false;this.client=null;this.seen=new Set();this.pending=0;this.chain=Promise.resolve();
 }
 async start(relays=['wss://relay.nsec.app','wss://relay.damus.io']){
  this.relays=relays;await Promise.any(relays.map(r=>this.pool.ensureRelay(r,{connectionTimeout:8000})));if(this.closed)throw Error('Sesión cerrada');
  this.sub=this.pool.subscribeMany(relays,{kinds:[24133],'#p':[this.pubkey],since:this.started-30},{onevent:e=>{void this.receive(e)},onclose:()=>this.onStatus('Se perdió la conexión. Volvé a generar el enlace.')});
  const u=new URL('bunker://'+this.pubkey);for(const r of relays)u.searchParams.append('relay',r);u.searchParams.set('secret',this.token);return u.href;
 }
 async pair(uri){
  const target=parseConnectURI(uri);await this.start(target.relays);if(!await this.approve({method:'connect',client:target.pubkey,params:[]}))throw Error('Conexión rechazada');if(this.closed)throw Error('Sesión cerrada');this.client=target.pubkey;this.token=null;await this.respond(target.pubkey,{id:crypto.randomUUID(),result:target.secret});this.onStatus('App vinculada. Volvé aquí para aprobar sus solicitudes.');
 }
 async respond(client,payload){if(this.closed)return;const content=nip44.encrypt(JSON.stringify(payload),nip44.getConversationKey(this.sk,client));const e=finalizeEvent({kind:24133,created_at:this.now(),tags:[['p',client]],content},this.sk);await Promise.any(this.pool.publish(this.relays,e,{maxWait:8000}));}
 async receive(event){
  if(this.closed||this.pending>=8||event.kind!==24133||event.content.length>100000||event.created_at<this.started-30||event.created_at>this.now()+120||!event.tags.some(t=>t[0]==='p'&&t[1]===this.pubkey)||!verifyEvent(JSON.parse(JSON.stringify(event))))return;
  let request;try{request=JSON.parse(nip44.decrypt(event.content,nip44.getConversationKey(this.sk,event.pubkey)))}catch{return}
  if(typeof request.id!=='string'||request.id.length>128||!Array.isArray(request.params)||request.params.some(p=>typeof p!=='string'))return;
  const id=event.pubkey+':'+request.id;if(this.seen.has(id)||this.seen.size>=2048)return;
  if(event.pubkey!==this.client&&(request.method!=='connect'||!this.token||request.params[0]!==this.pubkey||request.params[1]!==this.token))return;
  this.seen.add(id);this.pending++;
  const work=async()=>{try{if(this.closed)return;const result=await this.handle(event.pubkey,request);if(!this.closed)await this.respond(event.pubkey,{id:request.id,result})}catch{if(!this.closed)await this.respond(event.pubkey,{id:request.id,error:'Solicitud rechazada o no disponible'}).catch(()=>{})}finally{this.pending--}};
  this.chain=this.chain.then(work,work);await this.chain;
 }
 async handle(client,{method,params}){
  if(this.closed)throw Error('Sesión cerrada');
  if(method==='connect'){
   if(this.client===client)return 'ack';
   if(this.client||!this.token||params[0]!==this.pubkey||params[1]!==this.token)throw Error('Enlace usado o inválido');
   if(!await this.approve({method,client,params:[]}))throw Error('Rechazado');if(this.closed)throw Error('Sesión cerrada');this.client=client;this.token=null;this.onStatus('App vinculada. Volvé aquí para aprobar sus solicitudes.');return 'ack';
  }
  if(client!==this.client)throw Error('App no autorizada');
  if(method==='ping')return 'pong';if(method==='get_public_key')return this.userPubkey;if(method==='get_relays')return JSON.stringify(Object.fromEntries(this.relays.map(r=>[r,{read:true,write:true}])));
  if(method==='sign_event'){
   const e=JSON.parse(params[0]);if(!Number.isInteger(e.kind)||e.kind<0||!Number.isInteger(e.created_at)||typeof e.content!=='string'||e.content.length>64000||!Array.isArray(e.tags)||e.tags.length>200||e.tags.some(t=>!Array.isArray(t)||t.some(v=>typeof v!=='string'))||[23194,23195,24133].includes(e.kind)||e.pubkey&&e.pubkey!==this.userPubkey)throw Error('Evento no permitido');
   const template={kind:e.kind,created_at:e.created_at,tags:e.tags,content:e.content};if(!await this.approve({method,client,event:template}))throw Error('Rechazado');if(this.closed)throw Error('Sesión cerrada');return JSON.stringify(await this.signer.signEvent(template));
  }
  const methods={nip04_encrypt:'nip04Encrypt',nip04_decrypt:'nip04Decrypt',nip44_encrypt:'nip44Encrypt',nip44_decrypt:'nip44Decrypt'};
  if(methods[method]){if(params.length!==2||!keyPattern.test(params[0])||params[1].length>64000)throw Error('Solicitud inválida');if(!await this.approve({method,client,params}))throw Error('Rechazado');if(this.closed)throw Error('Sesión cerrada');return this.signer[methods[method]](...params)}
  throw Error('Método no disponible');
 }
 close(){this.closed=true;this.token=null;this.client=null;this.sub?.close();this.pool.destroy();this.sk.fill(0);this.signer=null;this.onStatus('Conexión cerrada.');}
}
