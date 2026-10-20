// Snapshot selected, reviewed README sections. Never fetch mutable content at request time.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const sdk=process.argv[2];
if(!sdk) throw new Error('Usage: node scripts/docs/sync-sdk-reference.mjs /path/to/sdk');
const revision=execFileSync('git',['rev-parse','HEAD'],{cwd:sdk,encoding:'utf8'}).trim();
const manifest=JSON.parse(readFileSync('scripts/docs/sdk-reference-topics.json','utf8'));
const result={revision,topics:{}};
for(const topic of manifest){
 const sourcePath=`packages/${topic.source}/README.md`;
 const lines=readFileSync(resolve(sdk,sourcePath),'utf8').split('\n');
 const sections=new Map();let current;let fenced=false;
 for(const line of lines){
  if(/^```/.test(line)) fenced=!fenced;
  if(!fenced && line.startsWith('## ')){current=line.slice(3);sections.set(current,[]);}
  if(current) sections.get(current).push(line);
 }
 const body=topic.sections.map(s=>{if(!sections.has(s))throw new Error(`${topic.id}: missing ${s}`);return sections.get(s).join('\n').trim();}).join('\n\n');
 // Resolve relative SDK links against the reviewed revision.
 const content=body.replaceAll('zappedEventId', 'eventId').replace(/\]\((?!https?:|#)([^)]+)\)/g,(_,path)=>`](${new URL(path,`https://github.com/nostr-wot/nostr-wot-sdk/blob/${revision}/${sourcePath}`).href})`);
 result.topics[topic.id]={content,source:`https://github.com/nostr-wot/nostr-wot-sdk/blob/${revision}/${sourcePath}`};
}
writeFileSync('data/docs/sdk-reference.json',JSON.stringify(result,null,2)+'\n');
console.log(`Synced ${manifest.length} focused references from ${revision}`);
