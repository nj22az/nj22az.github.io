// Real IndexedDB and worker lifecycle in disposable persistent profiles. No personal browser data is accessed.
// Chromium includes the application UI. WebKit runs the same storage/worker checks without claiming iOS/WebGL QA.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createServer,get} from 'node:http';
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';

const require=createRequire(import.meta.url),playwright=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const engineName=process.env.CAMERA_ALBUM_ENGINE||'chromium',browserType=playwright[engineName];
assert.ok(['chromium','webkit'].includes(engineName),'CAMERA_ALBUM_ENGINE must be chromium or webkit');
const root=fileURLToPath(new URL('../../',import.meta.url)),output=process.env.CAMERA_SHOTS||'/tmp/camera-album-'+engineName;
await mkdir(output,{recursive:true});
const appSource=await readFile(join(root,'camera/app.js'),'utf8'),albumAddress='/camera/'+appSource.match(/from '\.\/(album\.js\?v=[\w-]+)'/)[1];
const backupAddress='/camera/'+appSource.match(/from '\.\/(album-backup\.js\?v=[\w-]+)'/)[1];
const candidate={build:(await readFile(join(root,'camera/sw.js'),'utf8')).match(/const BUILD='([^']+)'/)[1],version:JSON.parse(await readFile(join(root,'camera/offline.json'),'utf8')).version};
const reproOnly=process.env.CAMERA_ALBUM_REPRO_ONLY==='1';
const expectBug=process.env.CAMERA_ALBUM_EXPECT_BUG==='1';
const legacySource=process.env.CAMERA_ALBUM_LEGACY_WORKER?await readFile(process.env.CAMERA_ALBUM_LEGACY_WORKER,'utf8'):execFileSync('git',['show','cf86ea2a1e156155185f681007d870fca2161c44:camera/sw.js'],{cwd:root,encoding:'utf8'});
assert.match(legacySource,/const CACHE='pocket-camera-1'/,'use the actual published PR #414 worker');
const baselineApp=process.env.CAMERA_ALBUM_BASELINE_APP?await readFile(process.env.CAMERA_ALBUM_BASELINE_APP,'utf8'):null;
if(expectBug)assert.ok(reproOnly&&baselineApp&&engineName==='chromium','baseline defect mode requires the published app, repro-only mode and Chromium');
const origin=await serveGame({root,mounts:['camera','johansson-town','assets']});
let legacy=false;
const proxy=createServer((req,res)=>{
 const path=new URL(req.url,'http://local').pathname;
 if(path==='/camera/album-harness'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end('<!doctype html><title>Disposable album regression fixture</title>');return;}
 if(path==='/camera/sw.js'&&legacy||path==='/camera/app.js'&&baselineApp){res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});res.end(path.endsWith('sw.js')?legacySource:baselineApp);return;}
 const request=get(new URL(req.url,origin.url),up=>{res.writeHead(up.statusCode,up.headers);up.pipe(res);});request.on('error',()=>res.destroy());
});
await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+proxy.address().port;
const results={engine:engineName,physicalSafari:false,ui:engineName==='chromium',checks:[],workerEvents:[],consoleErrors:[]},profiles=[];
let context,page;
const check=async(name,fn)=>{await fn();results.checks.push(name);console.log('ok '+name);};
const options={viewport:{width:402,height:874},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:reproOnly?'block':'allow',...(engineName==='chromium'?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})};
async function boot(profile){
 context=await browserType.launchPersistentContext(profile,options);
 context.on('serviceworker',worker=>{results.workerEvents.push({event:'created',url:worker.url()});worker.on('close',()=>results.workerEvents.push({event:'closed',url:worker.url()}));});
 context.on('console',message=>{if(message.type()==='error'&&results.consoleErrors.length<100)results.consoleErrors.push(message.text());});
 page=context.pages()[0]||await context.newPage();
}
async function profile(){const dir=await mkdtemp(join(tmpdir(),'camera-album-'));profiles.push(dir);await boot(dir);return dir;}
async function harness(){await page.goto(url+'/camera/album-harness');}
async function seed(version,label){
 return page.evaluate(async({version,label})=>{
  const image=async(colour,w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle=colour;g.fillRect(0,0,w,h);return new Promise(resolve=>c.toBlob(resolve,'image/png'));};
  const [photo,source,thumb]=await Promise.all([image('#3b7189',32,24),image('#bf692f',64,48),image('#758d25',16,12)]);
  const request=indexedDB.open('office-pocket-camera',version);
  request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('shots',{keyPath:'id'});if(version>=2)db.createObjectStore('stickers',{keyPath:'id'});if(version>=3)db.createObjectStore('metadata',{keyPath:'id'});};
  const db=await new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  const tx=db.transaction([...db.objectStoreNames],'readwrite');
  const record={id:label,photo,source,thumb,recipe:{layers:[{look:'none',amount:1}],adjust:{light:.17},enhance:{amount:.35},legacyFixture:version},width:32,height:24,created:1600000000000+version,taken:1599999999000+version};
  tx.objectStore('shots').add(record);
  if(version>=2)tx.objectStore('stickers').add({id:'mine:'+label,blob:thumb,width:16,height:12,created:record.created});
  if(version>=3)tx.objectStore('metadata').add({id:'samples:harbour-adventure:v1'});
  await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error);});db.close();return label;
 },{version,label});
}
async function snapshot(){
 return page.evaluate(async()=>{
  const req=indexedDB.open('office-pocket-camera'),db=await new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  const names=[...db.objectStoreNames],native=window.__albumNativeTransaction||IDBDatabase.prototype.transaction,tx=native.call(db,names,'readonly'),data={};
  for(const name of names){const req=tx.objectStore(name).getAll();req.onsuccess=()=>{data[name]=req.result;};}
  await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error);});const version=db.version;db.close();
  const encode=async value=>{if(value instanceof Blob)return {bytes:value.size,type:value.type,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await value.arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('')};if(Array.isArray(value))return Promise.all(value.map(encode));if(value&&typeof value==='object'){const out={};for(const k of Object.keys(value).sort())out[k]=await encode(value[k]);return out;}return value;};
  return {version,stores:names.sort(),data:await encode(data)};
 });
}
function assertRecords(expected,actual){
 for(const [store,records] of Object.entries(expected.data))for(const row of records){assert.deepEqual(actual.data[store]?.find(r=>r.id===row.id),row,store+'/'+row.id+' retains every field and blob hash');}
}
async function loadModule(){await page.evaluate(address=>import(address).then(m=>m.listShots()),albumAddress);}
async function readyUI(){await page.waitForFunction(()=>!!window.pocketCamera,null,{timeout:60000});}
async function albumUI(){const welcome=page.locator('#welcomeAlbum');if(await welcome.isVisible())await welcome.click();else await page.click('#roll');await page.waitForFunction(()=>window.pocketCamera.state.mode==='album');}
async function uiRecovery(){
 await profile();await harness();const id=await seed(3,'startup-read-failure'),before=await snapshot();
 await context.addInitScript(()=>{
  const original=IDBDatabase.prototype.transaction;window.__albumNativeTransaction=original;window.__albumReadFails=true;window.__albumReadAttempts=0;
  IDBDatabase.prototype.transaction=function(stores,mode,...rest){const names=typeof stores==='string'?[stores]:Array.from(stores);if(mode==='readonly'&&names.includes('shots')){window.__albumReadAttempts++;if(window.__albumReadFails)throw new DOMException('Injected unavailable album read','SecurityError');}return original.call(this,stores,mode,...rest);};
  localStorage.setItem('office-pocket-camera',JSON.stringify({sound:false,printer:false}));
 });
 await page.goto(url+'/camera/');await readyUI();await page.waitForFunction(()=>window.__albumReadAttempts>0);
 if(expectBug){
  await check('published baseline defect confirmed: intact stored photograph stays invisible and Album never retries',async()=>{
   assertRecords(before,await snapshot());
   const attempts=await page.evaluate(()=>{window.__albumReadFails=false;return window.__albumReadAttempts;});
   await albumUI();
   const displayed=await page.evaluate(id=>({present:window.pocketCamera.state.shots.some(s=>s.id===id),attempts:window.__albumReadAttempts}),id);
   assert.equal(displayed.present,false,'the published app leaves the existing photo invisible');
   assert.equal(displayed.attempts,attempts,'opening Album did not attempt another database read');
   assertRecords(before,await snapshot());results.baselineDefectConfirmed=true;
  });
  await context.close();context=null;return;
 }
 await check('startup read failure leaves stored photographs intact and reopening Album retries the read',async()=>{
  assertRecords(before,await snapshot());const attempts=await page.evaluate(()=>{window.__albumReadFails=false;return window.__albumReadAttempts;});await albumUI();
  // This behavioural assertion fails on the published app: openAlbum only re-renders its permanently empty array.
  await page.waitForFunction(id=>window.pocketCamera.state.shots.some(s=>s.id===id),id,{timeout:10000});
  await page.waitForFunction(()=>document.querySelector('#albumStatus')?.dataset.state==='ready');
  assert.ok(await page.evaluate(attempts=>window.__albumReadAttempts>attempts,attempts),'opening Album performs a fresh database read');
  assertRecords(before,await snapshot());
 });
 if(reproOnly){await context.close();context=null;return;}
 await check('a later read error preserves displayed records and offers Retry without an empty-album claim',async()=>{
  await page.evaluate(()=>{window.__albumReadFails=true;});await page.click('#closeAlbum');await albumUI();
  await page.waitForFunction(()=>document.querySelector('#albumStatus').dataset.state==='error');
  assert.ok(await page.locator('#albumRetry').isVisible());assert.equal(await page.locator('#albumEmpty').isVisible(),false);
  assert.ok(await page.evaluate(id=>window.pocketCamera.state.shots.some(s=>s.id===id),id));
  await page.screenshot({path:join(output,'album-read-error-phone.png')});
  assertRecords(before,await snapshot());await page.evaluate(()=>{window.__albumReadFails=false;});await page.click('#albumRetry');await page.waitForFunction(()=>document.querySelector('#albumStatus').dataset.state==='ready');
 });
 await check('failed deletion keeps the photograph and does not announce success',async()=>{
  await page.click('#grid [data-id="'+id+'"]');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  await page.evaluate(()=>{window.__albumNativeDelete=IDBObjectStore.prototype.delete;IDBObjectStore.prototype.delete=function(){throw new DOMException('Injected failed delete','UnknownError');};});
  await page.click('#deletePhoto');await page.click('#deleteConfirm');
  await page.waitForFunction(()=>!document.querySelector('#deleteSheet').open);
  await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('could not')||document.querySelector('[role="status"]')?.textContent.includes('could not'));
  assertRecords(before,await snapshot());assert.ok(await page.evaluate(id=>window.pocketCamera.state.shots.some(s=>s.id===id),id));
  await page.evaluate(()=>{IDBObjectStore.prototype.delete=window.__albumNativeDelete;});await page.click('#closeViewer');
 });
 await check('a malformed thumbnail cannot hide otherwise readable photographs',async()=>{
  await page.evaluate(async address=>{const m=await import(address),s=(await m.listShots()).find(s=>s.id==='startup-read-failure');await m.addShot({...s,thumb:'invalid thumbnail fixture'});},albumAddress);
  await page.click('#closeAlbum');await albumUI();await page.waitForFunction(()=>window.pocketCamera.state.shots.some(s=>s.thumb==='invalid thumbnail fixture'));
  await page.waitForFunction(()=>document.querySelector('#albumStatus').dataset.state==='ready');
  assert.ok(await page.locator('#grid [data-id="'+id+'"]').isVisible());
  assert.equal(await page.locator('#grid button').count(),await page.evaluate(()=>window.pocketCamera.state.shots.length));
  assertRecords(before,await snapshot());
 });
 await check('the album backup controls download a complete file and restore it without duplicate photographs',async()=>{
  const beforeRestore=await snapshot();await page.click('.album-storage summary');await page.click('#albumBackup');
  await page.locator('#albumDownload').waitFor({state:'visible'});await page.locator('.album-storage').scrollIntoViewIfNeeded();
  await page.screenshot({path:join(output,'album-backup-phone.png')});
  const waiting=page.waitForEvent('download');await page.click('#albumDownload');const download=await waiting;
  assert.match(download.suggestedFilename(),/\.pocket-camera\.json$/);const backupPath=join(output,'album-ui-backup.pocket-camera.json');await download.saveAs(backupPath);const buffer=await readFile(backupPath);
  const decoded=await page.evaluate(async({address,data})=>{const m=await import(address),backup=await m.decodeAlbumBackup(new Blob([new Uint8Array(data)],{type:'application/json'}));return {photos:backup.shots.length,stickers:backup.stickers.length};},{address:backupAddress,data:Array.from(buffer)});
  assert.equal(decoded.photos,beforeRestore.data.shots.length);assert.equal(decoded.stickers,beforeRestore.data.stickers.length);
  const choosing=page.waitForEvent('filechooser');await page.click('#albumRestore');await(await choosing).setFiles({name:download.suggestedFilename(),mimeType:'application/json',buffer});
  await page.waitForFunction(()=>document.querySelector('#albumBackupMessage').textContent.startsWith('Restored 0 photos'));
  assert.deepEqual(await snapshot(),beforeRestore);await page.setViewportSize({width:744,height:1133});await page.locator('.album-storage').scrollIntoViewIfNeeded();await page.screenshot({path:join(output,'album-backup-tablet.png')});
 });
 await context.close();context=null;
}
try{
 if(engineName==='chromium')await uiRecovery();
 if(!reproOnly)for(const version of [1,2,3]){
  legacy=version===1;const dir=await profile();await harness();const id=await seed(version,'schema-v'+version),original=await snapshot();
  await check('schema '+version+' opens as v3 without changing old originals, finished images, thumbnails or recipes',async()=>{
   await loadModule();const upgraded=await snapshot();assert.equal(upgraded.version,3);assert.deepEqual(upgraded.stores,['metadata','shots','stickers']);assertRecords(original,upgraded);
  });
  const retained=await snapshot();
  await check('schema '+version+' retains exact records over three ordinary reloads and committed new saves',async()=>{
   for(let visit=0;visit<3;visit++){await page.reload();await loadModule();assertRecords(retained,await snapshot());}
   await page.evaluate(async address=>{const m=await import(address),old=(await m.listShots())[0];await m.addShot({...old,recipe:{...old.recipe,newSessionFixture:true}});},albumAddress);
  });
  let complete=await snapshot();assert.equal(complete.data.shots.length,2);
  await check('schema '+version+' survives three separate browser processes in the same profile',async()=>{
   for(let session=0;session<3;session++){await context.close();await boot(dir);await harness();await loadModule();assertRecords(complete,await snapshot());}
  });
  await check('schema '+version+' rejects an aborted save without losing committed photographs',async()=>{
   const aborted=await page.evaluate(async address=>{
    const m=await import(address),source=(await m.listShots())[0],original=IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add=function(...args){const request=original.apply(this,args);if(this.name==='shots')this.transaction.abort();return request;};
    try{await m.addShot({...source,abortedFixture:true});return false;}catch{return true;}finally{IDBObjectStore.prototype.add=original;}
   },albumAddress);
   assert.equal(aborted,true);assert.deepEqual(await snapshot(),complete);
  });
  await check('schema '+version+' local backup is complete, repeat import is additive and corruption changes nothing',async()=>{
   const stats=await page.evaluate(async address=>{
    const m=await import(address),file=await m.makeAlbumBackup(),decoded=await m.decodeAlbumBackup(file),first=await m.restoreAlbumBackup(file);
    let corruptRejected=false;const json=JSON.parse(await file.text());json.sha256='0'.repeat(64);try{await m.restoreAlbumBackup(new Blob([JSON.stringify(json)],{type:'application/json'}));}catch{corruptRejected=true;}
    window.__albumFixtureBackup=file;return {first,shots:decoded.shots.length,stickers:decoded.stickers.length,corruptRejected,size:file.size};
   },backupAddress);
   assert.equal(stats.shots,complete.data.shots.length);assert.equal(stats.stickers,complete.data.stickers.length);assert.ok(stats.corruptRejected&&stats.size>0);assertRecords(complete,await snapshot());assert.equal((await snapshot()).data.shots.length,complete.data.shots.length);
  });
  const portableBackup=await page.evaluate(async()=>Array.from(new Uint8Array(await window.__albumFixtureBackup.arrayBuffer())));
  if(version===1){
   await check('the actual published PR #414 worker installs without touching existing photographs',async()=>{
    await page.evaluate(async()=>{await navigator.serviceWorker.register('/camera/sw.js',{updateViaCache:'none'});await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await page.evaluate(async()=>{window.__albumLegacyController=navigator.serviceWorker.controller;await fetch('/camera/samples/default-original.png');});assertRecords(complete,await snapshot());
   });
   await check('updating that worker to the candidate verified bundle preserves every old record and other apps caches',async()=>{
    await page.evaluate(async()=>{await(await caches.open('album-unrelated-fixture')).put('/untouched',new Response('untouched'));});
    legacy=false;
    await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration('/camera/');await reg.update();});
    await page.waitForFunction(async expected=>{
     const reg=await navigator.serviceWorker.getRegistration('/camera/'),controller=navigator.serviceWorker.controller;
     if(!reg||reg.installing||reg.waiting||reg.active?.state!=='activated'||controller!==reg.active||controller===window.__albumLegacyController)return false;
     const names=await caches.keys(),name='pocket-camera-'+expected.build.slice(0,20);if(!names.includes(name))return false;
     const cache=await caches.open(name),response=await cache.match('/camera/offline.json');if(!response)return false;
     const manifest=await response.json(),keys=new Set((await cache.keys()).map(k=>new URL(k.url).pathname));return manifest.version===expected.version&&manifest.files.every(f=>keys.has(f.url))&&!names.includes('pocket-camera-1');
    },candidate,{timeout:120000});
    results.workerInspection=await Promise.all(context.serviceWorkers().map(worker=>worker.evaluate(()=>({url:self.location.href,build:typeof BUILD==='string'?BUILD:null,cache:typeof CACHE==='string'?CACHE:null})).catch(error=>({url:worker.url(),error:error.message}))));
    if(engineName==='chromium')assert.ok(results.workerInspection.some(worker=>worker.build===candidate.build),'an inspected worker executes the candidate BUILD');
    await page.goto(url+'/camera/');await readyUI();
    results.updatedController=await page.evaluate(expected=>new Promise((resolve,reject)=>{
     const container=navigator.serviceWorker,observed=[];let settled=false;
     const ask=()=>{const current=container.controller;if(current&&current.state!=='redundant')current.postMessage({type:'CAMERA_OFFLINE_STATUS'});};
     const timer=setTimeout(async()=>{const reg=await container.getRegistration('/camera/'),current=container.controller;finish(new Error('Activated candidate worker did not confirm readiness: '+JSON.stringify({expected,controller:{url:current?.scriptURL,state:current?.state},active:{url:reg?.active?.scriptURL,state:reg?.active?.state},installing:reg?.installing?.state,waiting:reg?.waiting?.state,observed})));},10000);
     const finish=(error,status)=>{if(settled)return;settled=true;clearTimeout(timer);container.removeEventListener('message',reply);container.removeEventListener('controllerchange',ask);if(error)reject(error);else resolve(status);};
     async function reply(event){
      observed.push({source:event.source?.scriptURL,sourceState:event.source?.state,current:event.source===container.controller,data:event.data});
      if(event.source!==container.controller||event.source?.state==='redundant'||event.data?.type!=='CAMERA_OFFLINE_STATUS')return;
      const reg=await container.getRegistration('/camera/'),current=container.controller;
      if(event.source!==current||current!==reg?.active||current?.state!=='activated'){ask();return;}
      const status=event.data;if(!status.ready||status.version!==expected.version){finish(new Error('Activated worker reported the wrong offline release: '+JSON.stringify(observed)));return;}
      finish(null,{...status,observed,controller:{url:current.scriptURL,state:current.state}});
     }
     container.addEventListener('message',reply);container.addEventListener('controllerchange',ask);container.startMessages?.();ask();
    }),candidate);
    await page.waitForFunction(()=>document.querySelector('#offlineSetting').dataset.state==='ready',null,{timeout:60000});
    await context.setOffline(true);await page.goto(url+'/camera/?album-offline-session=warm');await readyUI();
    await page.waitForFunction(id=>window.pocketCamera.state.shots.some(s=>s.id===id),id,{timeout:60000});await context.setOffline(false);
    assertRecords(complete,await snapshot());assert.equal(await page.evaluate(()=>caches.open('album-unrelated-fixture').then(c=>c.match('/untouched')).then(r=>r.text())),'untouched');
   });
   await check('two offline cold starts reopen old photographs and export their originals without network',async()=>{
    for(let session=0;session<2;session++){
     await context.close();await boot(dir);await context.setOffline(true);await page.goto(url+'/camera/?album-offline-session='+session);await readyUI();
     await page.waitForFunction(id=>window.pocketCamera.state.shots.some(s=>s.id===id),id,{timeout:60000});
     assertRecords(complete,await snapshot());
     const bytes=await page.evaluate(address=>import(address).then(m=>m.makeAlbumBackup()).then(f=>f.size),backupAddress);assert.ok(bytes>0);
    }
   });
  }
  await context.close();context=null;legacy=false;
  if(version===2){
   await profile();await harness();await seed(3,'unrelated-destination-photo');await loadModule();const destination=await snapshot();
   await check('a backup restores exact originals and stickers into another profile without overwriting its photographs',async()=>{
    const stats=await page.evaluate(({address,data})=>import(address).then(m=>m.restoreAlbumBackup(new Blob([new Uint8Array(data)],{type:'application/json'}))),{address:backupAddress,data:portableBackup});
    assert.equal(stats.added,complete.data.shots.length);assert.equal(stats.stickersAdded,complete.data.stickers.length);
    const restored=await snapshot();assertRecords(complete,restored);assertRecords(destination,restored);assert.equal(restored.data.shots.length,complete.data.shots.length+destination.data.shots.length);
   });
   await check('a conflicting backup rejects all additions atomically and preserves both existing copies',async()=>{
    const beforeConflict=await snapshot();
    const rejected=await page.evaluate(async({address,data})=>{
     const m=await import(address),incoming=await m.decodeAlbumBackup(new Blob([new Uint8Array(data)],{type:'application/json'}));
     incoming.shots[0]={...incoming.shots[0],conflictingFixture:true};incoming.shots.push({...incoming.shots[0],id:'would-be-new-if-not-atomic'});
     try{await m.restoreAlbumBackup(await m.encodeAlbumBackup(incoming));return false;}catch{return true;}
    },{address:backupAddress,data:portableBackup});
    assert.equal(rejected,true);assert.deepEqual(await snapshot(),beforeConflict);
   });
   await context.close();context=null;
  }
 }
 console.log(results.checks.length+'/'+results.checks.length+' '+engineName+' album checks passed');
}finally{
 await writeFile(join(output,'album-results.json'),JSON.stringify(results,null,2)+'\n');
 await context?.close();await new Promise(resolve=>{proxy.close(resolve);proxy.closeAllConnections();});await origin.close();
 for(const dir of profiles)await rm(dir,{recursive:true,force:true});
}
