import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {sdkPackages,sdkTopics,sdkDocPaths,sdkMoves} from '../lib/sdk-docs.mjs';
import {routes} from '../lib/sitemap-routes.mjs';
test('SDK docs cover eight owners and eleven compatibility imports',()=>{
  assert.equal(sdkPackages.length,8);assert.equal(sdkMoves.length,11);
  assert.equal(new Set(sdkDocPaths).size,sdkDocPaths.length);
  assert.equal(new Set(sdkTopics.map(t=>t.id)).size,sdkTopics.length);
  for(const path of sdkDocPaths){assert.ok(existsSync(`app/[locale]${path}/page.tsx`),path);assert.ok(routes.some(r=>r.path===path),path);}
});
test('every package and topic has copy in all supported locales',()=>{
  for(const locale of ['en','es','pt','fr','de','it','ru']){
    const copy=JSON.parse(readFileSync(`messages/${locale}/docs.json`,'utf8'));
    for(const key of [...sdkPackages.map(p=>`sdk.roles.${p.role}`),...sdkTopics.flatMap(t=>[t.title,t.intro]),...Object.keys(copy.packageDocs).map(k=>`packageDocs.${k}`)]){
      const value=key.split('.').reduce((o,k)=>o?.[k],copy);assert.equal(typeof value,'string',`${locale}:${key}`);assert.ok(value.length>0,`${locale}:${key}`);
    }
  }
});
