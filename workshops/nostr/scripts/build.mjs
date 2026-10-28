import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
await build({entryPoints:['src/app.js'],bundle:true,minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},format:'esm',outfile:'dist/app.js'});
let s=readFileSync('dist/app.js','utf8').replaceAll('Install Alby, nos2x, or similar.','Conectá la extensión Nostr WoT.');
if(/alby|nos2x/i.test(s))throw Error('Unexpected signer recommendation');
writeFileSync('dist/app.js',s);
