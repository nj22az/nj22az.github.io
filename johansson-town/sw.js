/* Build stamps this identifier; saved games remain in localStorage. */
const VERSION = '174795e5ca6975bec319';
importScripts('./offline/manifest.js','./offline/worker.js');
const CACHE='johansson-town-'+VERSION,SCOPE=new URL('./',self.location.href).href;
const offline=createTownOffline({scope:SCOPE,manifest:TOWN_OFFLINE,notify:status=>{
 self.clients.matchAll({type:'window'}).then(clients=>clients.forEach(client=>client.postMessage({type:'TOWN_OFFLINE_STATUS',status}))).catch(()=>{});
}});
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await Promise.allSettled(['./','./manifest.webmanifest','./assets/icons/town-192.png','./assets/icons/town-512.png'].map(path=>cache.add(new Request(new URL(path,SCOPE),{cache:'reload'}))));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Only the old opportunistic caches are bounded here. Complete downloads have their own lifecycle.
 const names=(await caches.keys()).filter(name=>/^johansson-town-[a-f0-9]{20}$/.test(name));
 const keep=new Set([CACHE,...names.filter(name=>name!==CACHE).slice(-1)]);
 await Promise.all(names.filter(name=>!keep.has(name)).map(name=>caches.delete(name)));await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 const action=event.data?.type;if(!['TOWN_OFFLINE_STATUS','TOWN_OFFLINE_START','TOWN_OFFLINE_PAUSE'].includes(action))return;
 const reply=status=>event.ports[0]?.postMessage({status});
 if(action==='TOWN_OFFLINE_START'){event.waitUntil(offline.start());reply(offline.snapshot());}
 else if(action==='TOWN_OFFLINE_PAUSE'){offline.pause();reply(offline.snapshot());}
 else event.waitUntil(offline.status().then(reply).catch(()=>reply({...offline.snapshot(),stage:'error',error:'Device storage is unavailable. Check Safari website storage, then retry.'})));
});
async function remember(request,response){
 if(!response.ok||response.type==='opaque'||request.headers.has('range'))return;
 try{const cache=await caches.open(CACHE);await cache.put(request,response.clone());const keys=await cache.keys();if(keys.length>512){const removable=keys.find(key=>key.url!==SCOPE&&!/\/manifest\.webmanifest$|\/assets\/icons\//.test(new URL(key.url).pathname));if(removable)await cache.delete(removable);}}catch{/* Full storage must not stop online play. */}
}
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(SCOPE).pathname))return;
 const immutable=/\/runtime\/[^/]+-[a-zA-Z0-9_-]+\.(js|glb|webp|png|jpg)$/.test(url.pathname);
 event.respondWith((async()=>{
  if(immutable){const hit=await (await caches.open(CACHE)).match(req)||await offline.fallback(req);if(hit)return hit;}
  try{const response=await fetch(req,{cache:req.mode==='navigate'?'no-store':immutable?'default':'no-cache'});if(response.ok){event.waitUntil(remember(req,response));return response;}const hit=await offline.fallback(req);return hit||response;}
  catch{const pinned=await offline.fallback(req);if(pinned)return pinned;const hit=await (await caches.open(CACHE)).match(req);if(hit)return hit;if(req.mode==='navigate'){const home=await (await caches.open(CACHE)).match(SCOPE);if(home)return home;}return new Response('This part of the island needs a connection. Reconnect, then finish Download for offline in Settings.',{status:503,headers:{'Content-Type':'text/plain'}});}
 })());
});
