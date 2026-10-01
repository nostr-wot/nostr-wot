import fs from 'node:fs/promises';
import sharp from 'sharp';
const jobs=JSON.parse(await fs.readFile('docs/design/illustration-prompts.json','utf8'));
const output='public/images/illustrations';
await fs.mkdir(output,{recursive:true});
for(const {id} of jobs){
 const source=`out/illustration-originals/${id}.png`;
 try {await fs.access(source);} catch {continue;}
 const base=sharp(source).resize(1600,900,{fit:'cover'});
 await base.clone().webp({quality:85,effort:6}).toFile(`${output}/${id}.webp`);
 await base.clone().jpeg({quality:88,mozjpeg:true}).toFile(`${output}/${id}.jpg`);
}
console.log('Exported available artwork as WebP for pages and JPEG for social renderer.');
