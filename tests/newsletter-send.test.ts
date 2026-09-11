import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,writeFile,readFile,readdir,rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { sendIssue,validateIssue } from '../scripts/newsletters/send.mjs';
import { editorialHtml } from '../scripts/newsletters/format.mjs';
import { createHmac } from 'node:crypto';
import { unsubscribeEmail } from '../lib/newsletter-unsubscribe';
const locales=['en','es','pt','ru','it','fr','de'];
const issue=()=>({id:'weekly-test-v1',version:1,status:'approved',coverageStart:'2026-01-01T00:00:00Z',coverageEnd:'2026-01-08T00:00:00Z',editions:Object.fromEntries(locales.map(l=>[l,{subject:'Subject '+l,preheader:'Preview',body:'## Heading\n\n[Source](https://example.org) and **bold**.'}]))});
async function fixture(t:any){const dataDir=await mkdtemp(join(tmpdir(),'newsletter-send-'));t.after(()=>rm(dataDir,{recursive:true,force:true}));await writeFile(join(dataDir,'subscribers.json'),JSON.stringify({version:1,subscribers:[{email:'one@example.org',locale:'es',status:'active',consent:{source:'newsletter-form'}},{email:'two@example.org',locale:'en',status:'inactive',consent:{source:'newsletter-form'}}]}),{mode:0o600});return dataDir;}
test('dry run never sends or archives; seven editions required',async t=>{const dataDir=await fixture(t);const a=issue();const result=await sendIssue({issue:a,dataDir,apiKey:'test'});assert.equal(result.audience,1);assert.deepEqual((await readdir(dataDir)),['subscribers.json']);delete a.editions.fr;assert.throws(()=>validateIssue(a));});
test('send selects Spanish, records acceptance once, retries only archive',async t=>{const dataDir=await fixture(t);let calls=0;const transport=async (_u:any,o:any)=>{calls++;const p=JSON.parse(o.body);assert.equal(p.subject,'Subject es');assert.deepEqual(p.to,['one@example.org']);assert.ok(p.headers['List-Unsubscribe']);return new Response(JSON.stringify({id:'provider-test-123'}),{status:200});};const opts={issue:issue(),dataDir,apiKey:'test',send:true,transport,pause:async()=>{}};assert.equal((await sendIssue(opts)).accepted,1);assert.equal((await sendIssue(opts)).alreadyAccepted,1);assert.equal(calls,1);const archive=JSON.parse(await readFile(join(dataDir,'sent/weekly-test-v1.json'),'utf8'));assert.deepEqual(Object.keys(archive.translations),['es']);assert.ok(!JSON.stringify(archive).includes('one@example.org'));assert.ok(!JSON.stringify(archive).includes('unsubscribe'));});
test('uncertain transport is not blindly retried or archived',async t=>{const dataDir=await fixture(t);let calls=0;const opts={issue:issue(),dataDir,apiKey:'test',send:true,transport:async()=>{calls++;throw Error('timeout');},pause:async()=>{}};assert.equal((await sendIssue(opts)).uncertain,1);assert.equal((await sendIssue(opts)).uncertain,1);assert.equal(calls,1);assert.ok(!(await readdir(dataDir)).includes('sent'));});
test('changed issue fails before another send',async t=>{const dataDir=await fixture(t);const opts={issue:issue(),dataDir,apiKey:'test',send:true,transport:async()=>new Response(JSON.stringify({id:'provider-test-123'})),pause:async()=>{}};await sendIssue(opts);opts.issue.editions.es.body='Changed';await assert.rejects(sendIssue(opts),/changed/);});
test('formatter escapes HTML and rejects executable Markdown links',()=>{const rendered=editorialHtml('## Title\n\n<script>alert(1)</script> [bad](javascript:alert) [ok](https://example.org) **bold**');assert.ok(!rendered.includes('<script>'));assert.ok(!rendered.includes('href="javascript:'));assert.ok(rendered.includes('<h2>Title</h2>'));assert.ok(rendered.includes('<strong>bold</strong>'));});
test('unsubscribe requires an authentic token',()=>{const before=process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;process.env.NEWSLETTER_UNSUBSCRIBE_SECRET='test-secret';try{const p=Buffer.from('one@example.org').toString('base64url');const s=createHmac('sha256','test-secret').update('newsletter-unsubscribe:'+p).digest('base64url');assert.equal(unsubscribeEmail(p+'.'+s),'one@example.org');assert.equal(unsubscribeEmail(p+'.'+s.slice(1)),null);}finally{if(before===undefined)delete process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;else process.env.NEWSLETTER_UNSUBSCRIBE_SECRET=before;}});

test('failed attempt history survives a later accepted retry with recipient retained',async t=>{
 const dataDir=await fixture(t);let calls=0;
 const options={issue:issue(),dataDir,apiKey:'test',send:true,pause:async()=>{},transport:async()=>{calls++;return calls===1?new Response(JSON.stringify({error:'rate limited'}),{status:429}):new Response(JSON.stringify({id:'accepted-retry-123'}));}};
 assert.equal((await sendIssue(options)).failed,1);assert.equal((await sendIssue(options)).accepted,1);
 const dir=join(dataDir,'deliveries/weekly-test-v1');const f=(await readdir(dir)).find(f=>/^[a-f0-9]{64}\.json$/.test(f))!;
 const r=JSON.parse(await readFile(join(dir,f),'utf8'));
 assert.equal(r.recipient,'one@example.org');assert.deepEqual(r.history.map((e:any)=>e.status),['pending','failed','pending','accepted']);assert.notEqual(r.history[0].attemptId,r.history[2].attemptId);assert.equal(r.history[3].providerMessageId,'accepted-retry-123');
});

test('legacy audit recovers recipient without sending or inventing past attempts',async t=>{
 const {auditDeliveryRecords}=await import('../scripts/newsletters/send.mjs');
 const dataDir=await fixture(t);await sendIssue({issue:issue(),dataDir,apiKey:'test',send:true,pause:async()=>{},transport:async()=>new Response(JSON.stringify({id:'legacy-provider-123'}))});
 const dir=join(dataDir,'deliveries/weekly-test-v1');const f=(await readdir(dir)).find(f=>/^[a-f0-9]{64}\.json$/.test(f))!;
 const r=JSON.parse(await readFile(join(dir,f),'utf8'));await writeFile(join(dir,f),JSON.stringify({status:'accepted',locale:r.locale,receipt:r.receipt}),{mode:0o600});
 assert.equal((await auditDeliveryRecords({dataDir,issueId:'weekly-test-v1'})).enriched,1);
 const restored=JSON.parse(await readFile(join(dir,f),'utf8'));assert.equal(restored.recipient,'one@example.org');assert.equal(restored.history.length,1);assert.equal(restored.history[0].at,r.receipt.acceptedAt);assert.equal(restored.history[0].source,'legacy-checkpoint');
 assert.equal((await auditDeliveryRecords({dataDir,issueId:'weekly-test-v1'})).enriched,0);
});
