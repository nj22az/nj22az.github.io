import {createServer} from 'node:http';
import {constants} from 'node:fs';
import {open,realpath} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {pipeline} from 'node:stream/promises';

const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.wasm':'application/wasm','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
const SHARED=new Set(['render/looks.js','render/print-media-shaders.js','render/illustration-modules.js','ui/look-picker.js','ui/icons.js'].map(file=>'/johansson-town/src/'+file));
function publicFile(path){
 if(path.split('/').some(part=>part.startsWith('.')))return false;
 if(SHARED.has(path))return true;
 if(!path.startsWith('/camera/'))return false;
 const parts=path.slice(8).split('/');
 return (parts.length===1?parts[0]==='index.html'||/\.(js|css|png|jpg|webp|wasm|webmanifest)$/.test(parts[0]):['assets','cards','fonts','frames','icons','samples','stickers'].includes(parts[0]))&&!!TYPES[extname(path)];
}
/** Only Camera's public resources, never the repository, dependencies or approved input folder. */
export async function serveCamera({root}){
 root=await realpath(root);let origin,authority;
 const server=createServer(async(req,res)=>{
  let handle;
  try{
   if(req.headers.host!==authority||req.headers.origin&&req.headers.origin!==origin||req.headers['sec-fetch-site']==='cross-site'){res.writeHead(403);res.end();return;}
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
   if(!req.url.startsWith('/')||req.url.startsWith('//')){res.writeHead(403);res.end();return;}
   const url=new URL(req.url,origin),path=decodeURIComponent(url.pathname)==='/camera/'?'/camera/index.html':decodeURIComponent(url.pathname);
   if(!publicFile(path)){res.writeHead(404);res.end();return;}
   const file=resolve(root,'.'+path);
   // Reject symlinks, including ancestor links, before opening; check again against the opened inode.
   if(await realpath(file)!==file)throw Error('Not a public regular file.');
   handle=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
   const info=await handle.stat(),current=await realpath(file);
   if(!info.isFile()||current!==file)throw Error('Not a public regular file.');
   const verify=await open(current,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
   try{const now=await verify.stat();if(info.dev!==now.dev||info.ino!==now.ino)throw Error('File changed while opening.');}finally{await verify.close();}
   res.writeHead(200,{'Content-Type':TYPES[extname(file)],'Content-Length':info.size,'Cache-Control':'no-store','Cross-Origin-Resource-Policy':'same-origin','X-Content-Type-Options':'nosniff','Content-Security-Policy':"frame-ancestors 'none'"});
   if(req.method==='HEAD'){res.end();return;}
   await pipeline(handle.createReadStream({autoClose:false}),res);
  }catch{if(res.headersSent)res.destroy();else{res.writeHead(404);res.end();}}
  finally{await handle?.close();}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 authority=`127.0.0.1:${server.address().port}`;origin=`http://${authority}`;
 return {url:origin+'/',close:()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();})};
}
