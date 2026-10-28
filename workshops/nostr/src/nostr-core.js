import { Nip07Signer, PrivateKeySigner } from 'nostr-wot-sdk/signers';
import { WoT } from '@nostr-wot/wot';
import { generateSecretKey, verifyEvent, getPublicKey } from 'nostr-tools';
export { Nip07Signer, PrivateKeySigner, WoT, generateSecretKey, verifyEvent, getPublicKey };
export const template = () => ({ kind: 1, created_at: Math.floor(Date.now()/1000), tags: [['t','labitconf-demo']], content: 'LABITCONF 2026: demo local, no publicado' });
export function validate(event, requested, pubkey) {
  // Fresh object prevents nostr-tools' verification cache hiding a later mutation.
  const fresh=JSON.parse(JSON.stringify(event));
  return fresh.pubkey===pubkey && fresh.kind===requested.kind && fresh.created_at===requested.created_at && fresh.content===requested.content && JSON.stringify(fresh.tags)===JSON.stringify(requested.tags) && verifyEvent(fresh);
}
export function trustFixture() {
  const keys=Array.from({length:4},()=>getPublicKey(generateSecretKey()));
  // Synthetic directed follow graph: vos -> Ana -> Bruno; Carla is unobserved.
  const edges=new Map([[keys[0],[keys[1]]],[keys[1],[keys[2]]]]);
  function distance(target) { const seen=new Set([keys[0]]),q=[[keys[0],0]]; while(q.length){const [p,d]=q.shift();if(p===target)return d;if(d===3)continue;for(const next of edges.get(p)||[]){if(!seen.has(next)){seen.add(next);q.push([next,d+1])}}}return null; }
  const source={getDistance:distance,isInMyWoT:(p,max=3)=>{const d=distance(p);return d!==null&&d<=max},filterByWoT:(ps,{maxHops=3}={})=>ps.filter(p=>{const d=distance(p);return d!==null&&d<=maxHops})};
  return { keys, wot:new WoT({myPubkey:keys[0],maxHops:3,source}) };
}
