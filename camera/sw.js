/**
 * Pocket Camera on the Home Screen, with or without a signal (the owner, 29 October 2026: "It should be installable as
 * iPhone app web page too on the Home Screen"). Network first, always: online the camera is exactly the site as
 * published, and each answer is kept; offline the kept copy is served. Kept: the camera's own files (its page, code,
 * stickers, fonts, icons) and the World code the Looks are drawn with. Not kept: anything else of World (its town,
 * models and pictures are for the game, and far too large to keep for a camera).
 */
const CACHE='pocket-camera-1';
const kept=url=>url.origin===location.origin&&(url.pathname.startsWith('/camera/')||url.pathname.startsWith('/johansson-town/src/')||url.pathname==='/johansson-town/vendor/three.module.js');
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('pocket-camera-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 const request=e.request,url=new URL(request.url);
 if(request.method!=='GET'||!kept(url))return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(request);
   if(response.ok&&response.type==='basic')cache.put(request,response.clone()).catch(()=>{});
   return response;
  }catch(error){
   const copy=await cache.match(request)||(request.mode==='navigate'?await cache.match('/camera/'):null);
   if(copy)return copy;
   throw error;
  }
 })());
});
