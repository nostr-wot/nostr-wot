#!/usr/bin/env node
import { readFile, readdir, lstat, mkdir, open, rename, rmdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { recordSentReceipt, validateReceipt } from './record-sent.mjs';
import { editorialHtml, escapeHtml } from './format.mjs';
const locales=['en','es','pt','ru','it','fr','de'];
const footers={en:'Unsubscribe',es:'Cancelar suscripción',pt:'Cancelar inscrição',ru:'Отписаться',it:'Annulla iscrizione',fr:'Se désabonner',de:'Abbestellen'};
const digest=s=>createHash('sha256').update(s).digest('hex');
async function json(path, fallback) { try { return JSON.parse(await readFile(path,'utf8')); } catch(e) { if(e.code==='ENOENT' && fallback!==undefined)return fallback;throw e; } }
async function save(path,value) { const temp=path+'.'+randomUUID()+'.tmp'; const h=await open(temp,'wx',0o600);try{await h.writeFile(JSON.stringify(value)+'\n');await h.sync();}finally{await h.close();}await rename(temp,path);const d=await open(dirname(path),'r');try{await d.sync();}finally{await d.close();} }
export function validateIssue(issue) {
 if(!issue || !/^[a-z0-9]+(?:-[a-z0-9]+)*-v[1-9][0-9]*$/.test(issue.id) || issue.id.length>100 || !Number.isSafeInteger(issue.version) || issue.version<1 || !issue.id.endsWith('-v'+issue.version) || issue.status!=='approved')throw Error('An approved, versioned issue is required');
 for(const k of ['coverageStart','coverageEnd'])if(typeof issue[k]!=='string'||!Number.isFinite(Date.parse(issue[k]))||Date.parse(issue[k])>Date.now())throw Error('Invalid coverage');
 if(Date.parse(issue.coverageStart)>Date.parse(issue.coverageEnd))throw Error('Invalid coverage order');
 if(!issue.editions || Object.keys(issue.editions).sort().join()!==[...locales].sort().join())throw Error('All seven editions are required');
 for(const l of locales){const e=issue.editions[l];if(!e||typeof e.subject!=='string'||!e.subject.trim()||e.subject.length>500||/[\r\n]/.test(e.subject)||typeof e.preheader!=='string'||e.preheader.length>2000||/[\r\n]/.test(e.preheader)||typeof e.body!=='string'||!e.body.trim()||e.body.length>120000)throw Error('Invalid edition');}
 for(const locale of locales)validateReceipt({issueId:issue.id,version:issue.version,locale,acceptedAt:new Date().toISOString(),providerMessageId:'validation-only-not-a-send',...issue.editions[locale],coverageStart:issue.coverageStart,coverageEnd:issue.coverageEnd});
 if(Buffer.byteLength(JSON.stringify(issue))>900000)throw Error('Issue exceeds archive budget');
 return issue;
}
function subscribers(data) {
 if(data.version!==1||!Array.isArray(data.subscribers))throw Error('Invalid subscriber store');
 const seen=new Set();
 for(const r of data.subscribers){if(typeof r.email!=='string'||r.email!==r.email.trim().toLowerCase()||r.email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(r.email)||seen.has(r.email)||!locales.includes(r.locale)||!['active','inactive'].includes(r.status)||r.consent?.source!=='newsletter-form')throw Error('Invalid subscriber record');seen.add(r.email);}
 return data.subscribers.filter(r=>r.status==='active');
}
export async function sendIssue({issue,dataDir,apiKey,unsubscribeSecret=apiKey,send=false,transport=fetch,pause=async ms=>{await delay(ms);}}) {
 validateIssue(issue);
 const audience=subscribers(await json(join(dataDir,'subscribers.json'),{version:1,subscribers:[]}));
 const summary={issue:issue.id,audience:audience.length,byLocale:Object.fromEntries(locales.map(l=>[l,audience.filter(r=>r.locale===l).length])),accepted:0,alreadyAccepted:0,failed:0,uncertain:0,unsubscribed:0};
 if(!send)return {...summary,dryRun:true,mailConfigured:!!apiKey};
 if(!apiKey||!unsubscribeSecret)throw Error('Mail configuration missing');
 await mkdir(dataDir,{recursive:true,mode:0o700});
 const st=await lstat(dataDir);if(!st.isDirectory()||st.isSymbolicLink()||(st.mode&0o077)!==0||(typeof process.getuid==='function'&&st.uid!==process.getuid()))throw Error('Unsafe newsletter storage permissions');
 const dir=join(dataDir,'deliveries',issue.id);await mkdir(dir,{recursive:true,mode:0o700});
 const lock=join(dir,'send.lock');try{await mkdir(lock,{mode:0o700});}catch{throw Error('Issue sender is locked; inspect before retrying');}
 try{
  const snapshot=join(dir,'issue.json'); const previous=await json(snapshot,null);
  const archived=await json(join(dataDir,'sent',issue.id+'.json'),null);
  if(archived && !previous)throw Error('Archive already exists without delivery ledger; reconcile before sending');
  if(previous && JSON.stringify(previous)!==JSON.stringify(issue))throw Error('Issue changed after delivery began; use a new version');
  if(!previous)await save(snapshot,issue);
  for(const f of await readdir(dir)){if(!/^[a-f0-9]{64}\.json$/.test(f))continue;const r=await json(join(dir,f));if(r.status==='accepted')await recordSentReceipt(r.receipt,{dataDir});}
  for(const initial of audience){
   const current=subscribers(await json(join(dataDir,'subscribers.json'))).find(r=>r.email===initial.email);
   if(!current){summary.unsubscribed++;continue;}
   const key=digest(initial.email),path=join(dir,key+'.json'),record=await json(path,null);
   // Acceptance persists before archiving. Replays recover the archive without sending again.
   if(record?.status==='accepted'){await recordSentReceipt(record.receipt,{dataDir});summary.alreadyAccepted++;continue;}
   if(record && ['pending','uncertain'].includes(record.status)){summary.uncertain++;continue;}
   const locale=record?.locale || current.locale,e=issue.editions[locale];
   const payload=Buffer.from(current.email).toString('base64url');
   const signature=createHmac('sha256',unsubscribeSecret).update('newsletter-unsubscribe:'+payload).digest('base64url');
   const url='https://nostr-wot.com/api/newsletter/unsubscribe?token='+payload+'.'+signature+'&lang='+locale;
   const footer=footers[locale];
   const message={from:'Nostr WoT <noreply@nostr-wot.com>',to:[current.email],subject:e.subject,text:e.preheader+'\n\n'+e.body+'\n\n'+footer+': '+url,html:`<!doctype html><html lang="${locale}"><body><div style="max-width:640px;margin:auto;font-family:Arial,sans-serif;line-height:1.7;color:#172033"><p>${escapeHtml(e.preheader)}</p><h1>${escapeHtml(e.subject)}</h1>${editorialHtml(e.body)}<hr><p><a href="${escapeHtml(url)}">${footer}</a></p></div></body></html>`,headers:{'List-Unsubscribe':`<${url}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}};
   const idempotencyKey=`newsletter-${issue.id}-${key}`;
   // Pin the exact payload for safe provider retries, including secret rotation.
   const envelope=record?.message || message;
   await save(path,{status:'pending',locale,message:envelope,attemptedAt:new Date().toISOString()});
   let response,result;
   try{response=await transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(envelope),signal:AbortSignal.timeout(30000)});result=await response.json();}
   catch{await save(path,{status:'uncertain',locale,message:envelope});summary.uncertain++;continue;}
   if(!response.ok || typeof result.id!=='string' || !result.id.trim()){
    const uncertain=response.status>=500 || response.ok || response.status===409;
    await save(path,{status:uncertain?'uncertain':'failed',locale,message:envelope,httpStatus:response.status});summary[uncertain?'uncertain':'failed']++;await pause(600);continue;
   }
   const receipt={issueId:issue.id,version:issue.version,locale,acceptedAt:new Date().toISOString(),providerMessageId:result.id,subject:e.subject,preheader:e.preheader,body:e.body,coverageStart:issue.coverageStart,coverageEnd:issue.coverageEnd};
   await save(path,{status:'accepted',locale,receipt});
   await recordSentReceipt(receipt,{dataDir});summary.accepted++;await pause(600);
  }
  return summary;
 }finally{await rmdir(lock);}
}
async function main(){
 try{
  const [file,mode,...extra]=process.argv.slice(2);if(!file||!['--dry-run','--send'].includes(mode)||extra.length)throw Error('Usage: send.mjs <issue.json> --dry-run|--send');
  const result=await sendIssue({issue:await json(resolve(file)),dataDir:process.env.NEWSLETTER_DATA_DIR || resolve('data/newsletter'),apiKey:process.env.RESEND_API_KEY,unsubscribeSecret:process.env.NEWSLETTER_UNSUBSCRIBE_SECRET||process.env.RESEND_API_KEY,send:mode==='--send'});
  console.log(JSON.stringify(result));if(result.failed||result.uncertain)process.exitCode=1;
 }catch{console.error('Newsletter operation failed. Inspect private state; do not blindly resend.');process.exitCode=1;}
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main();
