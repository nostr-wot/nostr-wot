import {parseRelays} from './events.js';

/** Validate a pasted connection URI without network requests or side effects. */
export function parseBunkerLink(value:string){
 let url:URL;
 try{url=new URL(value.trim())}catch{throw Error('Pegá un enlace bunker:// válido de tu firmante.')}
 if(url.protocol!=='bunker:'||! /^[a-f0-9]{64}$/i.test(url.hostname)||url.username||url.password||url.port||url.hash||(url.pathname&&url.pathname!=='/'))throw Error('El enlace Bunker debe incluir una clave pública válida.');
 const relays=parseRelays(url.searchParams.getAll('relay').join('\n'));
 return {pubkey:url.hostname.toLowerCase(),relays,secret:url.searchParams.get('secret')};
}
