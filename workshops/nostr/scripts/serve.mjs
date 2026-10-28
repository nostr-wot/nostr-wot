import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const args=process.argv.slice(2),option=name=>args.includes(name)?args[args.indexOf(name)+1]:undefined;
const root=fileURLToPath(new URL('../dist/',import.meta.url)),port=Number(option('--port')||process.env.PORT||8765),host=option('--host')||process.env.HOST||'127.0.0.1';
const types={'.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return}const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let path=resolve(root,'.'+pathname);if(!path.startsWith(resolve(root)+sep)&&path!==resolve(root)){res.writeHead(403).end();return}if((await stat(path)).isDirectory())path=resolve(path,'index.html');const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes)}catch{res.writeHead(404).end('Not found')}}).listen(port,host,()=>console.log(`LABITCONF draft decks: http://${host}:${port}`));
