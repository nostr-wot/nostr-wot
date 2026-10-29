import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseBunkerLink} from '../lib/labs/bunker-link';
const key='ab'.repeat(32);
test('pasted bunker URI is trimmed and its signer, relays and secret are preserved',()=>{
 assert.deepEqual(parseBunkerLink(`  bunker://${key}?relay=wss%3A%2F%2Frelay.example&secret=demo  `),{pubkey:key,relays:['wss://relay.example/'],secret:'demo'});
});
test('invalid input is rejected before connecting or replacing an active QR',()=>{
 for(const uri of ['hello',`https://${key}?relay=wss://relay.example`,`bunker://bad?relay=wss://relay.example`,`bunker://${key}`,`bunker://${key}?relay=https://relay.example`,`bunker://user@${key}?relay=wss://relay.example`,`bunker://${key}/wrong?relay=wss://relay.example`,`bunker://${key}?relay=wss://user:password@relay.example`])assert.throws(()=>parseBunkerLink(uri));
});
