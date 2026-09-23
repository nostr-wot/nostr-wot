#!/usr/bin/env node
import { readFile,open,mkdir,rename,rmdir } from 'node:fs/promises';
import { resolve,join,dirname } from 'node:path';
import { createHash,randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { newsletterTemplate,TEMPLATE_VERSION } from './template.mjs';
import { validateReceipt } from './record-sent.mjs';
const recipient='leon@dandelionlabs.io';
async function save(path,value){const temp=path+'.'+randomUUID()+'.tmp';const h=await open(temp,'wx',0o600);try{await h.writeFile(JSON.stringify(value)+'\n');await h.sync();}finally{await h.close();}await rename(temp,path);const d=await open(dirname(path),'r');try{await d.sync();}finally{await d.close();}}
export async function sendPreview({preview,dataDir,apiKey,transport=fetch}){
 if(!apiKey||!preview||!/^[a-z0-9-]{1,80}$/.test(preview.id)||!Number.isFinite(Date.parse(preview.date)))throw Error('Invalid preview configuration');
 validateReceipt({issueId:preview.id+'-v1',version:1,locale:preview.locale,acceptedAt:new Date().toISOString(),providerMessageId:'validation-only-not-a-send',...preview.edition});
 const rendered=newsletterTemplate({edition:preview.edition,locale:preview.locale,issueId:preview.id,date:preview.date,preview:true});
 const message={from:'Nostr WoT <noreply@nostr-wot.com>',to:[recipient],subject:'[Preview] '+preview.edition.subject,html:rendered.html,text:rendered.text};
 const dir=join(dataDir,'previews',TEMPLATE_VERSION,preview.id);await mkdir(dir,{recursive:true,mode:0o700});
 const lock=join(dir,'send.lock');await mkdir(lock,{mode:0o700});
 try{
  const path=join(dir,createHash('sha256').update(recipient).digest('hex')+'.json');let previous;
  try{previous=JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  if(previous && JSON.stringify(previous.message)!==JSON.stringify(message))throw Error('Preview changed; use a new template version or preview ID');
  if(previous?.status==='accepted')return {preview:preview.id,alreadyAccepted:1,accepted:0};
  if(previous && ['pending','uncertain'].includes(previous.status))throw Error('Uncertain preview; reconcile before retrying');
  const attemptId=randomUUID(),at=new Date().toISOString();const history=[...(previous?.history||[]),{attemptId,at,status:'pending'}];
  const record={recipient,previewId:preview.id,templateVersion:TEMPLATE_VERSION,locale:preview.locale,message,history,status:'pending'};await save(path,record);
  let response,result;try{response=await transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`preview-${TEMPLATE_VERSION}-${preview.id}`},body:JSON.stringify(message),signal:AbortSignal.timeout(30000)});result=await response.json();}
  catch{record.status='uncertain';history.push({attemptId,at:new Date().toISOString(),status:'uncertain'});await save(path,record);throw Error('Uncertain preview response');}
  if(!response.ok||!result.id){record.status=response.status>=500||response.status===409||response.ok?'uncertain':'failed';history.push({attemptId,at:new Date().toISOString(),status:record.status,httpStatus:response.status});await save(path,record);throw Error('Preview was not confirmed accepted');}
  record.status='accepted';history.push({attemptId,at:new Date().toISOString(),status:'accepted',providerMessageId:result.id});await save(path,record);
  return {preview:preview.id,accepted:1,alreadyAccepted:0};
 }finally{await rmdir(lock);}
}
async function main(){try{if(process.argv.length!==3)throw Error('Expected preview JSON');const preview=JSON.parse(await readFile(resolve(process.argv[2]),'utf8'));console.log(JSON.stringify(await sendPreview({preview,dataDir:process.env.NEWSLETTER_DATA_DIR||resolve('data/newsletter'),apiKey:process.env.RESEND_API_KEY})));}catch{console.error('Preview not confirmed. Inspect private preview records before retrying.');process.exitCode=1;}}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main();
