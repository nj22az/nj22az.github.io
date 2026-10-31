// Real service worker, cold browser restart and network-off editing. No personal photographs or native Share.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {createServer,get} from 'node:http';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS||'/tmp/camera-offline';await mkdir(shots,{recursive:true});
const origin=await serveGame({root,mounts:['camera','johansson-town','assets']}),profile=await mkdtemp(join(tmpdir(),'camera-offline-'));
let bad='',stall='';const seen=[];
const proxy=createServer((req,res)=>{
 const path=new URL(req.url,'http://local').pathname;seen.push(path);
 if(path==='/camera/offline-seed'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><title>Offline upgrade fixture</title>');return;}
 if(path===bad){res.writeHead(503);res.end('fixture unavailable');return;}
 const forward=()=>{const r=get(new URL(req.url,origin.url),up=>{res.writeHead(up.statusCode,up.headers);up.pipe(res);});r.on('error',()=>res.destroy());};
 if(path===stall)setTimeout(forward,5000);else forward();
});await new Promise(r=>proxy.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+proxy.address().port;
const options={executablePath:process.env.CHROMIUM_EXECUTABLE,viewport:{width:402,height:700},isMobile:true,hasTouch:true,reducedMotion:'reduce',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'],permissions:['camera']};
const errors=[],results={checks:[],physicalSafari:false},check=async(name,fn)=>{await fn();results.checks.push(name);console.log('ok '+name);};let context,page,saved,seed;
const boot=async()=>{context=await chromium.launchPersistentContext(profile,options);page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>errors.push(e.message));};
const ready=()=>page.waitForFunction(()=>window.pocketCamera?.engine&&document.querySelector('#offlineSetting').dataset.state==='ready',null,{timeout:60000});
try{
 await boot();await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},sound:false,printer:false})));
 await page.goto(url+'/camera/offline-seed');
 seed=await page.evaluate(async()=>{
  await(await caches.open('pocket-camera-1')).put('/camera/old',new Response('old'));await(await caches.open('unrelated-app')).put('/keep',new Response('keep'));
  const {addShot}=await import('/camera/album.js?v=20261029c'),c=document.createElement('canvas');c.width=32;c.height=24;c.getContext('2d').fillRect(0,0,32,24);const blob=await new Promise(r=>c.toBlob(r,'image/png'));
  return (await addShot({photo:blob,thumb:blob,source:blob,recipe:{layers:[{look:'none',amount:1}]},width:32,height:24})).id;
 });
 await check('a failed first download does not claim offline readiness or remove previous caches/album',async()=>{
  bad='/camera/stickers/thao-pixar/Peace.webp';await page.goto(url+'/camera/');await page.waitForFunction(()=>document.querySelector('#offlineSetting').dataset.state==='retry',null,{timeout:60000});
  const state=await page.evaluate(async seed=>({old:await caches.has('pocket-camera-1'),other:await caches.has('unrelated-app'),photo:!!(await(await import('/camera/album.js?v=20261029c')).getShot(seed))}),seed);assert.deepEqual(state,{old:true,other:true,photo:true});
 });
 await check('retry downloads a complete verified bundle and preserves other app data',async()=>{
  bad='';await page.click('#settingsToggle');await page.click('#offlineSetting');await ready();
  const state=await page.evaluate(async seed=>({old:await caches.has('pocket-camera-1'),other:await caches.has('unrelated-app'),photo:!!(await(await import('/camera/album.js?v=20261029c')).getShot(seed))}),seed);assert.deepEqual(state,{old:false,other:true,photo:true});
  await page.screenshot({path:join(shots,'phone-ready-offline.png')});await page.click('#settingsDone');
 });
 await check('cold navigation with a query works with the network disabled',async()=>{
  await context.setOffline(true);await page.goto(url+'/camera/?v=airplane');await ready();assert.ok(await page.evaluate(()=>navigator.serviceWorker.controller!==null));
 });
 await check('every offline asset, including never-used stickers/fonts/wasm, has its exact bytes offline',async()=>{
  const report=await page.evaluate(async()=>{
   const m=await(await caches.open((await caches.keys()).find(k=>k.startsWith('pocket-camera-')))).match('/camera/offline.json').then(r=>r.json());
   for(let i=0;i<m.files.length;i+=12)await Promise.all(m.files.slice(i,i+12).map(async f=>{const r=await fetch(f.url+'?offline-check=1'),b=await r.arrayBuffer(),h=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),x=>x.toString(16).padStart(2,'0')).join('');if(!r.ok||h!==f.sha256)throw Error('Offline mismatch: '+f.url);}));
   return {files:m.files.length,bytes:m.bytes};
  });assert.ok(report.files>280);results.bundle=report;
 });
 await check('the camera viewfinder starts offline with a generated test camera',async()=>{
  await page.evaluate(()=>window.pocketCamera.startCamera());await page.waitForFunction(()=>document.querySelector('#video').videoWidth>0);await page.screenshot({path:join(shots,'offline-fake-camera.png')});
 });
 await check('photo import, all Looks, Smart Surprise, crop, overlays and JPEG save-copy work offline',async()=>{
  await page.evaluate(async()=>{const a=window.pocketCamera,b=await(await fetch('/camera/samples/default-original.png')).blob(),file=new File([b],'offline.png',{type:'image/png'});await a.editFile(file);if(a.state.edit.sourceBlob!==file)throw Error('Import failed');});
  await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
  const result=await page.evaluate(async()=>{
   const a=window.pocketCamera,e=a.state.edit,m=await import('/camera/looks-gl.js?v=20261031offline1');
   for(const look of m.LOOK_NAMES){const pixels=a.engine.render(m.normalRecipe({layers:[{look,amount:1}]}),{source:'edit',width:64,height:48});if(pixels.data.length!==64*48*4)throw Error('Failed '+look);}
   const source=e.sourceBlob;const match=await a.shuffle();if(!match)throw Error('No offline match');
   const {loadStickerSets}=await import('/camera/stickers.js?v=20261031-contour1');await loadStickerSets();a.editStickers.add('thao-pixar/Peace');a.editStickers.select(null);e.recipe.crop={x:.1,y:.1,w:.8,h:.8};e.recipe.frame='harbour';e.recipe.paper='warm';a.chooseLook(e.recipe.layers[0].look);
   return {sameSource:e.sourceBlob===source,looks:m.LOOK_NAMES.length,tested:match.tested,recipe:e.recipe};
  });assert.equal(result.sameSource,true);assert.ok(result.looks>=33&&result.tested>0);await page.screenshot({path:join(shots,'phone-offline-edit.png')});
  await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');saved=await page.evaluate(async()=>{const s=window.pocketCamera.state.viewing;return {id:s.id,type:s.photo.type,bytes:s.photo.size,source:s.source.size,data:await s.photo.arrayBuffer().then(b=>Array.from(new Uint8Array(b)))};});assert.equal(saved.type,'image/jpeg');assert.ok(saved.bytes>1000&&saved.source>1000);await writeFile(join(shots,'offline-saved.jpg'),Buffer.from(saved.data));
 });
 await check('Erase worker and its WASM start for the first time while offline',async()=>{
  const result=await page.evaluate(()=>new Promise((resolve,reject)=>{const w=new Worker('/camera/erase-worker.js?v=20261029a',{type:'module'}),width=32,height=32,rgba=new Uint8ClampedArray(width*height*4),mask=new Uint8Array(width*height);for(let i=0;i<width*height;i++){rgba.set([i%32*7,100,160,255],i*4);if(i%32>13&&i%32<18&&Math.floor(i/32)>13&&Math.floor(i/32)<18)mask[i]=255;}w.onerror=reject;w.onmessage=e=>{w.terminate();resolve({error:e.data.error,bytes:e.data.rgba?.length,filled:e.data.filled});};w.postMessage({id:1,width,height,rgba,mask},[rgba.buffer,mask.buffer]);}));assert.equal(result.error,undefined);assert.equal(result.bytes,32*32*4);assert.ok(result.filled);
 });
 await check('card games start and their image sheets decode offline',async()=>{
  await page.click('#closeViewer');await page.click('#openCardGames');await page.click('#chooseBlackjack');await page.waitForFunction(()=>document.querySelectorAll('#cardGameContent .playing-card').length>0);await page.screenshot({path:join(shots,'offline-blackjack.png')});await page.click('#closeCardGame');await page.click('#chooseSolitaire');await page.waitForFunction(()=>document.querySelectorAll('#cardGameContent .playing-card').length>=28);await page.screenshot({path:join(shots,'offline-solitaire.png')});
 });
 await check('a fresh browser process reopens the offline app and retains both saved photos',async()=>{
  await context.close();await boot();await context.setOffline(true);await page.goto(url+'/camera/');await ready();const photos=await page.evaluate(()=>window.pocketCamera.state.shots.map(s=>({id:s.id,bytes:s.photo.size,source:s.source.size})));assert.ok(photos.some(p=>p.id===seed));assert.ok(photos.some(p=>p.id===saved.id&&p.bytes===saved.bytes&&p.source===saved.source));
  await page.setViewportSize({width:744,height:980});await page.click('#settingsToggle');await page.locator('#offlineSetting').scrollIntoViewIfNeeded();const rect=await page.locator('#offlineSetting').boundingBox();assert.ok(rect.width>=44&&rect.height>=44&&rect.x>=0&&rect.x+rect.width<=744);await page.screenshot({path:join(shots,'mini-ready-offline.png')});await page.click('#settingsDone');
 });
 await check('a stalled online request falls back to the installed snapshot',async()=>{
  await context.setOffline(false);stall='/camera/samples/default-adventure.png';const time=Date.now();assert.ok(await page.evaluate(async()=>{const r=await fetch('/camera/samples/default-adventure.png?stall-test');return r.ok&&(await r.blob()).size>0;}));assert.ok(Date.now()-time<4500);stall='';
 });
 await check('missing cached files are detected and repaired without touching the album',async()=>{
  await page.evaluate(async()=>{const c=await caches.open((await caches.keys()).find(k=>k.startsWith('pocket-camera-')));await c.delete('/camera/stickers/thao-pixar/Peace.webp');navigator.serviceWorker.controller.postMessage({type:'CAMERA_OFFLINE_STATUS'});});await page.waitForFunction(()=>document.querySelector('#offlineSetting').dataset.state==='retry');
  await page.click('#settingsToggle');await page.click('#offlineSetting');await ready();assert.ok(await page.evaluate(async id=>!!(await(await import('/camera/album.js?v=20261029c')).getShot(id)),saved.id));
 });
 await check('a removed offline cache is rebuilt and survives another offline browser restart',async()=>{
  await page.evaluate(async()=>{await caches.delete((await caches.keys()).find(k=>k.startsWith('pocket-camera-')));navigator.serviceWorker.controller.postMessage({type:'CAMERA_OFFLINE_STATUS'});});await page.waitForFunction(()=>document.querySelector('#offlineSetting').dataset.state==='retry');await page.click('#offlineSetting');await ready();
  await context.close();await boot();await context.setOffline(true);await page.goto(url+'/camera/?restart=2');await ready();assert.ok(await page.evaluate(id=>window.pocketCamera.state.shots.some(s=>s.id===id),saved.id));
 });
 await check('no uncaught application errors',async()=>assert.deepEqual(errors,[]));
 console.log(results.checks.length+'/'+results.checks.length+' offline checks passed');
}finally{await writeFile(join(shots,'offline-results.json'),JSON.stringify(results,null,2));await context?.close();await new Promise(r=>proxy.close(r));await origin.close();await rm(profile,{recursive:true,force:true});}
