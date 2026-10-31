// Atomic, verified offline bundle. Regenerate with node tools/build-camera-offline.mjs.
const BUILD='32bcbea0aff8ff28af599464e0514416595f26feeae06f506f9f857a66b71d45';
const CACHE='pocket-camera-'+BUILD.slice(0,20),META='/camera/offline.json';
const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
let manifest;
const bundle=()=>manifest??=(async()=>{const c=await caches.open(CACHE),r=await c.match(META);if(!r)throw Error('Offline download is incomplete');return r.json();})().catch(error=>{manifest=null;throw error;});
async function remoteManifest(){
 const response=await fetch(META,{cache:'no-store'});if(!response.ok)throw Error('Offline manifest unavailable');
 const bytes=await response.arrayBuffer();if(await digest(bytes)!==BUILD)throw Error('Offline manifest is from another release');
 return {bytes,m:JSON.parse(new TextDecoder().decode(bytes))};
}
async function download(m,cache,missingOnly=false){
 const queue=[...m.files];
 await Promise.all(Array.from({length:6},async()=>{
  while(queue.length){const file=queue.shift(),url=new URL(file.url,self.location.origin);
   if(url.origin!==self.location.origin||url.search||url.hash||!/^\/(camera\/|johansson-town\/src\/render\/)/.test(url.pathname))throw Error('Invalid offline asset');
   if(missingOnly&&await cache.match(url))continue;
   const r=await fetch(url,{cache:'reload'});if(!r.ok||r.type==='opaque')throw Error('Offline asset unavailable: '+file.url);
   const data=await r.clone().arrayBuffer();if(await digest(data)!==file.sha256)throw Error('Offline asset is from another release: '+file.url);
   await cache.put(url,r);
  }
 }));
}
async function status(){
 try{const m=await bundle(),c=await caches.open(CACHE),keys=new Set((await c.keys()).map(r=>new URL(r.url).pathname));return {type:'CAMERA_OFFLINE_STATUS',ready:m.files.every(f=>keys.has(f.url)),version:m.version,bytes:m.bytes};}
 catch{return {type:'CAMERA_OFFLINE_STATUS',ready:false};}
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 try{
  const {bytes,m}=await remoteManifest(),cache=await caches.open(CACHE);await download(m,cache);
  await cache.put(META,new Response(bytes,{headers:{'Content-Type':'application/json'}}));manifest=Promise.resolve(m);await self.skipWaiting();
 }catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith('pocket-camera-')&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();const message=await status();for(const client of await self.clients.matchAll())client.postMessage(message);
})()));
self.addEventListener('message',event=>{
 if(!['CAMERA_OFFLINE_STATUS','CAMERA_OFFLINE_REPAIR'].includes(event.data?.type))return;
 event.waitUntil((async()=>{
  if(event.data.type==='CAMERA_OFFLINE_REPAIR')try{
   const cache=await caches.open(CACHE);let m;try{m=await bundle();}catch{const remote=await remoteManifest();m=remote.m;await download(m,cache,true);await cache.put(META,new Response(remote.bytes,{headers:{'Content-Type':'application/json'}}));manifest=Promise.resolve(m);}
   await download(m,cache,true);
  }catch{/* Ready stays false until every asset is present. */}
  event.source?.postMessage(await status());
 })());
});
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin||!/^\/(camera\/|johansson-town\/src\/render\/)/.test(u.pathname))return;
 event.respondWith((async()=>{
  const m=await bundle(),path=r.mode==='navigate'&&u.pathname==='/camera/'?'/camera/index.html':u.pathname;
  if(!m.files.some(f=>f.url===path))return fetch(r);
  const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),3000);
  try{const response=await fetch(r,{signal:abort.signal});if(response.ok)return response;throw Error('Network response unavailable');}
  catch(error){const cached=await (await caches.open(CACHE)).match(path);if(cached)return cached;throw error;}
  finally{clearTimeout(timer);}
 })());
});
