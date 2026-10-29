import {validate} from './validation.js';
export const BLOSSOM_SERVER='https://blossom.primal.net';
export function uploadAuthorization(hash,now=Math.floor(Date.now()/1000)){
 if(!/^[a-f0-9]{64}$/.test(hash))throw Error('Archivo inválido');
 return {kind:24242,created_at:now,tags:[['t','upload'],['x',hash],['expiration',String(now+300)]],content:''};
}
export async function preparePhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Elegí una imagen JPG, PNG o WebP.');
 if(file.size>15*1024*1024)throw Error('La imagen debe pesar menos de 15 MB.');
 const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,768/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.85));if(!blob)throw Error('No pudimos preparar la foto. Probá otra imagen.');return blob}finally{bitmap.close()}
}
export async function uploadPhoto(blob,session,{request=fetch}={}){
 const bytes=await blob.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
 const event=uploadAuthorization(hash),signed=await session.signer.signEvent(event);
 if(!validate(signed,event,session.pubkey))throw Error('La autorización de la foto no coincide. No se subió.');
 const response=await request(BLOSSOM_SERVER+'/upload',{method:'PUT',headers:{Authorization:'Nostr '+btoa(JSON.stringify(signed)),'Content-Type':blob.type},body:blob,signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('Blossom no pudo guardar la foto. Podés volver a intentar.');
 const data=await response.json(),url=new URL(data.url);
 if(url.protocol!=='https:'||url.username||url.password||data.sha256&&data.sha256!==hash)throw Error('El servidor devolvió una respuesta inválida.');
 return url.href;
}
