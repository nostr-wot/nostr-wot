import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTestFlightRequest,testFlightEmail} from '../lib/testflight';
test('TestFlight requires email, explicit consent and empty honeypot',()=>{
 const good={appleId:' person@example.com ',consent:true,website:''};assert.deepEqual(parseTestFlightRequest(good),{appleId:'person@example.com'});
 for(const bad of [null,{}, {...good,consent:false},{...good,website:'spam'},{...good,appleId:[]},{...good,appleId:'a@b\r\nBcc:evil@example.com'},{...good,appleId:'a'.repeat(255)+'@example.com'}])assert.equal(parseTestFlightRequest(bad),null);
});
test('TestFlight notification has a fixed recipient and escapes HTML',()=>{const m=testFlightEmail("o'connor@example.com");assert.equal(m.to,'hello@nostrwot.com');assert.equal(m.replyTo,"o'connor@example.com");assert.match(m.html,/o&#39;connor/);assert.match(m.text,/not a newsletter signup/)});
