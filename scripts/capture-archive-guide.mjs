/** Capture the released extension with a disposable identity and local-only demo relays. */
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
const extension = resolve(process.argv[2] || '../../nostr-wot-extension');
const require = createRequire(join(extension, 'package.json'));
const { chromium } = require('playwright');
const { WebSocketServer } = require('ws');
const { finalizeEvent } = require('nostr-tools');
const { privateKeyFromSeedWords } = require('nostr-tools/nip06');
const out = resolve('public/images/guides/account-archive');
mkdirSync(out, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'archive-guide-'));
let events = [];
const server = new WebSocketServer({ port: 0, host: '127.0.0.1' });
await new Promise(resolve => server.once('listening', resolve));
const relay = `ws://127.0.0.1:${server.address().port}`;
server.on('connection', (socket, request) => socket.on('message', raw => {
 const [type,id,filter] = JSON.parse(raw.toString());
 if(type==='NEG-OPEN') return socket.send(JSON.stringify(['NEG-ERR',id,'unsupported']));
 if(type==='REQ') {
  if(request.url==='/unavailable') return socket.send(JSON.stringify(['CLOSED',id,'error: Demo relay is temporarily unavailable']));
  for(const event of events.filter(e=>(!filter.authors||filter.authors.includes(e.pubkey))&&(!filter.kinds||filter.kinds.includes(e.kind))&&(!filter['#p']||e.tags.some(t=>t[0]==='p'&&filter['#p'].includes(t[1])))&&(!filter.since||e.created_at>=filter.since)&&(!filter.until||e.created_at<=filter.until)).slice(0,filter.limit||100)) socket.send(JSON.stringify(['EVENT',id,event]));
  socket.send(JSON.stringify(['EOSE',id]));
 }
 if(type==='EVENT') socket.send(JSON.stringify(['OK',id.id,true,'']));
}));
const context = await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:{width:380,height:600},deviceScaleFactor:2,args:[`--disable-extensions-except=${extension}/dist`,`--load-extension=${extension}/dist`]});
context.setDefaultTimeout(15000);
let page;
try {
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
 const id=new URL(worker.url()).host;
 page=await context.newPage();
 await page.goto(`chrome-extension://${id}/src/entrypoints/popup/index.html`);
 await page.waitForFunction(()=>!!document.querySelector('#root')?.childElementCount);
 const generated=await page.evaluate(async()=>{
  const rpc=async(method,params={})=>{const r=await chrome.runtime.sendMessage({method,params});if(r.error)throw Error(r.error);return r.result};
  const data=await rpc('onboarding_generateAccount');
  await rpc('onboarding_createVault',{account:data.account,password:'Disposable-Guide-Only!',autoLockMinutes:60});
  return data;
 });
 const key=privateKeyFromSeedWords(generated.mnemonic);
 const now=Math.floor(Date.now()/1000)-60;
 events=Array.from({length:12},(_,i)=>finalizeEvent({kind:i===0?0:1,created_at:now-i*60,tags:[],content:i===0?JSON.stringify({name:'Archive demo'}):`Local demonstration note ${i}`},key));
 key.fill(0);
 const rpc=(method,params={})=>page.evaluate(async({method,params})=>{const r=await chrome.runtime.sendMessage({method,params});if(r.error)throw Error(r.error);return r.result},{method,params});
 await page.reload();
 await page.getByRole('button',{name:'Settings',exact:true}).last().click();
 await page.getByRole('button',{name:/^Archive/}).click();
 const shot=async name=>{await page.waitForTimeout(650);if(['01-overview','02-settings'].includes(name))await page.evaluate(()=>{window.scrollTo(0,0);for(const el of document.querySelectorAll('*')){if(el.scrollTop)el.scrollTop=0;if(el.scrollLeft)el.scrollLeft=0;}});await page.screenshot({path:join(out,`${name}.png`)});};
 await shot('01-overview');
 await page.getByRole('button',{name:'Archive settings',exact:true}).click();
 await shot('02-settings');
 await page.getByRole('button',{name:'Back',exact:true}).last().click();
 const settings={automatic:false,intervalMinutes:1440,includeMessages:true,groups:[{id:'demo',name:'Demo relays',relays:[`${relay}/archive`,`${relay}/unavailable`]}],selectedGroupId:'demo'};
 await rpc('archive_configure',{settings});
 await rpc('archive_sync');
 for(let i=0;i<40;i++){await page.waitForTimeout(500);const state=await rpc('archive_getState');if(['partial','complete','error'].includes(state.progress.phase))break;}
 await page.getByRole('button',{name:'See details',exact:true}).click();
 await shot('03-relay-results');
 await page.getByRole('button',{name:'Close',exact:true}).last().click();
 await page.getByRole('button',{name:'Download archive',exact:true}).click();
 await shot('04-export');
 await page.getByRole('button',{name:'Close',exact:true}).last().click();
 await page.getByRole('button',{name:'Import archive',exact:true}).click();
 await shot('05-import');
 await page.getByRole('button',{name:'Close',exact:true}).last().click();
 await page.getByLabel('Destination relay', { exact: true }).fill(`${relay}/destination`);
 await page.getByRole('button',{name:'Start migration',exact:true}).scrollIntoViewIfNeeded();
 await shot('06-migration');
 await page.getByRole('button',{name:'Start migration',exact:true}).click();
 await shot('07-confirmation');
 writeFileSync(join(out,'capture.json'),JSON.stringify({version:'0.8.11',disposableIdentity:true,localDemoRelays:true,screenshots:7},null,2)+'\n');
 console.log('Captured seven Archive flow screenshots. No public relay publication.');
} catch(error){if(page){await page.screenshot({path:'/tmp/archive-guide-capture-error.png'});writeFileSync('/tmp/archive-guide-capture-error.txt',await page.locator('body').innerText());}throw error;}
finally{await context.close();for(const c of server.clients)c.terminate();await new Promise(resolve=>server.close(resolve));rmSync(profile,{recursive:true,force:true});}
