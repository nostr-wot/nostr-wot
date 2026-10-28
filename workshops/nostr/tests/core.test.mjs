import test from 'node:test';import assert from 'node:assert/strict';
import {PrivateKeySigner,generateSecretKey,template,validate,verifyEvent,trustFixture} from '../src/nostr-core.js';
test('firmar y detectar alteración con SDK publicado',async()=>{const signer=new PrivateKeySigner(generateSecretKey()),p=await signer.getPublicKey(),t=template(),e=await signer.signEvent(t);assert.equal(validate(e,t,p),true);assert.equal(verifyEvent({...JSON.parse(JSON.stringify(e)),content:e.content+'!'}),false);assert.equal(validate(e,{...t,content:'otra solicitud'},p),false)});
test('distancias del grafo sintético',async()=>{const {keys,wot}=trustFixture();assert.equal(await wot.getDistance(keys[1]),1);assert.equal(await wot.getDistance(keys[2]),2);assert.equal(await wot.getDistance(keys[3]),null)});
