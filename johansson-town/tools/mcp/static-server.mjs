import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';

const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wasm':'application/wasm','.mp4':'video/mp4','.mp3':'audio/mpeg','.woff2':'font/woff2'};

/** A private, ephemeral loopback preview of this game's compiled checkout. */
export async function serveGame(root){
 const server=createServer(async(req,res)=>{
  try{
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
   const url=new URL(req.url,'http://127.0.0.1'),relative=decodeURIComponent(url.pathname).replace(/^\/johansson-town\/?/,'');
   const file=resolve(root,relative==='/'||relative===''?'index.html':relative.replace(/^\//,''));
   if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
   const info=await stat(file);if(!info.isFile()){res.writeHead(404);res.end();return;}
   let start=0,end=info.size-1,status=200;const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
   if(range){start=Number(range[1]);end=range[2]?Math.min(end,Number(range[2])):end;if(start>end){res.writeHead(416);res.end();return;}status=206;}
   res.writeHead(status,{'Content-Type':TYPES[extname(file)]||'application/octet-stream','Content-Length':end-start+1,'Cache-Control':'no-store','Accept-Ranges':'bytes',...(status===206?{'Content-Range':`bytes ${start}-${end}/${info.size}`}:{})});
   if(req.method==='HEAD'){res.end();return;}createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 return {url:`http://127.0.0.1:${server.address().port}/johansson-town/`,close:()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();})};
}
