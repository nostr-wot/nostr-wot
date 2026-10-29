import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publishWithConfirmation} from '../lib/labs/publish-confirmation';

test('updates following and suggestions at first acceptance while another relay is pending',async()=>{
 let finishSlow!:(value:{status:string})=>void;
 const slow=new Promise<{status:string}>(resolve=>{finishSlow=resolve});
 let applied=0;const following=new Set(['old']);let suggestions=['new','other'];
 const reports:string[]=[];
 const done=publishWithConfirmation(['fast','slow'],url=>url==='fast'?Promise.resolve({status:'accepted'}):slow,()=>{
  applied++;following.add('new');suggestions=suggestions.filter(k=>!following.has(k));
 },report=>reports.push(report.status));
 await Promise.resolve();
 assert.equal(applied,1);assert.deepEqual([...following],['old','new']);assert.deepEqual(suggestions,['other']);assert.equal(reports.length,1);
 finishSlow({status:'accepted'});await done;assert.equal(applied,1);assert.equal(reports.length,2);
});
test('rejected or unconfirmed publications do not mark anyone followed',async()=>{
 let applied=false;
 await publishWithConfirmation(['rejected','unknown'],async status=>({status}),()=>{applied=true},()=>{});
 assert.equal(applied,false);
});
