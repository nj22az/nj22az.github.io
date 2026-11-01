// Real service worker + compiled game. CI's iPad viewport is not a physical iPad Safari test.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,mkdtemp} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import vm from 'node:vm';
import {chromium,webkit,devices} from 'playwright';

const site=resolve(new URL('../..',import.meta.url).pathname),out=resolve(process.env.ISLAND_OUTPUT||resolve(site,'johansson-town/output/offline-island'));
await mkdir(out,{recursive:true});
const engine=process.env.ISLAND_ENGINE||'chromium',profile=await mkdtemp(resolve(tmpdir(),'offline-island-'));
const data={};vm.runInNewContext(await readFile(resolve(site,'johansson-town/offline/manifest.js'),'utf8'),data);const manifest=data.TOWN_OFFLINE;
const report={engine,physicalIPad:false,viewport:{width:744,height:1133},source:process.env.GITHUB_SHA||null,bundle:{version:manifest.version,files:manifest.files.length,bytes:manifest.bytes},steps:[],errors:[],failedLocal:[],offlineResponses:[],notes:['Desktop browser with iPad mini viewport, touch and DPR 2; physical iPadOS memory, installation and eviction remain a human audit.','External Google fonts use the existing system font fallback; live shops, Studio and optional AI model downloads are not island exploration.']};
let online=true,offlineSuccesses=0,context,page,phase='online',failure=null;
// Hold one real response until Pause is exercised: a fast local download must not remove the button mid-tap.
let holdDownload=false,releaseDownload;
const downloadGate=new Promise(resolve=>{releaseDownload=resolve;});
const heldPath='/johansson-town/'+manifest.files[0].url;
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.glb':'model/gltf-binary','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav','.pdf':'application/pdf'};
const server=createServer(async(req,res)=>{
 if(!online){res.writeHead(503);res.end('Network deliberately unavailable');return;}
 try{const path=decodeURIComponent(new URL(req.url,'http://local').pathname),file=resolve(site,'.'+path+(path.endsWith('/')?'index.html':''));if(!file.startsWith(site+'/'))throw Error('Outside repository');const body=await readFile(file);if(holdDownload&&path===heldPath)await downloadGate;if(phase!=='online')offlineSuccesses++;res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/johansson-town/`;
const step=(name,detail={})=>{report.steps.push({name,...detail});console.log(JSON.stringify(report.steps.at(-1)));};
async function launch(offline=false){
 const options={...devices['iPad Mini'],viewport:{width:744,height:1133},screen:{width:744,height:1133},deviceScaleFactor:2,serviceWorkers:'allow',recordVideo:{dir:resolve(out,'video'),size:{width:744,height:1133}},headless:engine!=='webkit'};
 if(engine==='chromium')options.args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'];
 context=await (engine==='webkit'?webkit:chromium).launchPersistentContext(profile,options);
 // Software rendering and the existing synchronous island construction can exceed Playwright's 30 s default.
 context.setDefaultTimeout(120000);
 await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
 await context.setOffline(offline);page=context.pages()[0]||await context.newPage();
 page.on('pageerror',error=>report.errors.push({phase,message:error.message}));
 page.on('response',response=>{if(phase!=='online'&&response.url().startsWith(base)){if(response.status()>=400)report.failedLocal.push({url:response.url(),status:response.status()});else if(response.fromServiceWorker())report.offlineResponses.push(response.url());}});
 page.on('requestfailed',request=>{if(request.url().startsWith(base))report.failedLocal.push({url:request.url(),error:request.failure()?.errorText});});
}
async function settle(){await page.waitForLoadState('networkidle',{timeout:90000});await page.waitForFunction(()=>!window.__JOHANSSON_STREAMING__?.active&&!window.__JOHANSSON_AUDIT__?.blocked.roomLoading,null,{timeout:120000});}
async function waitForDownload(){
 const started=Date.now();let lastProgress=started,lastBytes=-1;
 // WebKit's real hash/cache writes compete with software rendering on CI. Keep a separate stall limit.
 while(Date.now()-started<15*60*1000){
  const state=await page.evaluate(()=>({stage:document.querySelector('#offlineIsland').dataset.stage,bytes:document.querySelector('#offlineProgress').value,detail:document.querySelector('#offlineDetail').textContent}));
  if(state.stage==='ready')return;
  assert.notEqual(state.stage,'error',state.detail);
  if(state.bytes>lastBytes){lastBytes=state.bytes;lastProgress=Date.now();step('download progress',{bytes:state.bytes,elapsedMs:Date.now()-started});}
  assert.ok(Date.now()-lastProgress<180000,'Offline download stalled for three minutes: '+JSON.stringify(state));
  await page.waitForTimeout(10000);
 }
 throw Error('Offline download exceeded fifteen minutes');
}
async function boot(path=''){
 await page.goto(base+path,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__JOHANSSON_LOADING__?.snapshot().ready||window.__JOHANSSON_LOADING__?.snapshot().error,null,{timeout:240000});
 const loading=await page.evaluate(()=>window.__JOHANSSON_LOADING__.snapshot());assert.equal(loading.error,null,JSON.stringify(loading));
 await page.locator('#enter').tap();await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_LOADING__?.snapshot().completed===10&&!window.__JOHANSSON_AUDIT__?.blocked.catchingUp,null,{timeout:180000});
 assert.equal(await page.locator('#fatal:not(.hidden)').count(),0);await settle();
}
try{
 await launch();await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:60000});
 await page.waitForFunction(()=>window.__JOHANSSON_LOADING__?.snapshot().ready||window.__JOHANSSON_LOADING__?.snapshot().error,null,{timeout:240000});
 assert.equal(await page.evaluate(()=>window.__JOHANSSON_LOADING__.snapshot().error),null);
 await page.evaluate(()=>localStorage.setItem('offline-audit-sentinel','keep this save data'));
 await page.locator('#titleOffline').tap();await page.waitForFunction(()=>!document.querySelector('#offlineDownload').disabled);
 await page.screenshot({path:resolve(out,'ipad-download-before.png')});
 holdDownload=true;
 await page.locator('#offlineDownload').tap();await page.waitForFunction(()=>document.querySelector('#offlineProgress').value>0,null,{timeout:60000});
 await page.locator('#offlinePause').tap();await page.waitForFunction(()=>document.querySelector('#offlineIsland').dataset.stage==='paused',null,{timeout:60000});step('download paused without readiness');
 holdDownload=false;releaseDownload();
 await page.locator('#offlineDownload').tap();await waitForDownload();
 assert.equal(await page.locator('#offlineIsland').getAttribute('data-stage'),'ready',await page.locator('#offlineDetail').textContent());
 assert.equal(await page.evaluate(()=>localStorage.getItem('offline-audit-sentinel')),'keep this save data');
 await page.screenshot({path:resolve(out,'ipad-offline-ready.png')});step('entire island verified',report.bundle);
 await page.locator('#offlineClose').tap();await settle();
 phase='offline';online=false;await context.setOffline(true);
 const proof=await page.evaluate(async files=>{
  let bytes=0;for(const file of files){const response=await fetch('./'+file.url+'?offline-audit=1',{cache:'no-store'});if(!response.ok)throw Error(file.url+': '+response.status);const body=await response.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',body)),b=>b.toString(16).padStart(2,'0')).join('');if(body.byteLength!==file.bytes||hash!==file.sha256)throw Error('Offline bytes differ: '+file.url);bytes+=body.byteLength;}return {files:files.length,bytes};
 },manifest.files);
 assert.equal(proof.bytes,manifest.bytes);step('all bundle bytes fetched with network disabled',proof);
 await context.close();context=null;await launch(true);
 await boot();assert.equal(await page.evaluate(()=>!!window.__JOHANSSON_AUDIT__),false,'Ordinary game URL boots without audit hooks');
 assert.equal(await page.evaluate(()=>localStorage.getItem('offline-audit-sentinel')),'keep this save data');
 await page.screenshot({path:resolve(out,'ipad-offline-town-portrait.png')});
 await page.setViewportSize({width:1133,height:744});await page.waitForFunction(()=>document.querySelector('#game').width>document.querySelector('#game').height);await page.screenshot({path:resolve(out,'ipad-offline-town-landscape.png')});
 const run=page.locator('#run'),before=await run.getAttribute('aria-pressed');await run.tap();assert.notEqual(await run.getAttribute('aria-pressed'),before);step('cold offline restart; ordinary URL, rotation and touch control');
 await page.evaluate(()=>dispatchEvent(new Event('johansson-save')));
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('johansson-town-1988-v5')));assert.ok(save&&Number.isFinite(save.yen),'The actual game writes a save');
 await settle();await context.close();context=null;await launch(true);
 const savedAgain=await page.goto(base+'?audit&spawn=ferry&cinematic=off',{waitUntil:'domcontentloaded'}).then(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('johansson-town-1988-v5'))));assert.equal(savedAgain.yen,save.yen);step('saved money survives a second offline browser restart',{yen:save.yen});
 await boot('?audit&spawn=ferry&cinematic=off');
 const graphics=await page.evaluate(()=>window.__JOHANSSON_LOOK__.state);for(const field of ['ink','grade','hdr'])assert.equal(graphics[field],true,field);assert.equal(graphics.samples,4);step('full graphics retained',graphics);
 const position=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.player.position);await page.keyboard.down('w');await page.waitForTimeout(1500);await page.keyboard.up('w');const moved=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.player.position);assert.ok(Math.hypot(moved[0]-position[0],moved[2]-position[2])>.01,'Normal movement works offline');step('normal movement input works',{before:position,after:moved});
 for(const id of ['izakaya','ramen','sakura-office']){
  await page.evaluate(async id=>{const a=window.__JOHANSSON_AUDIT__;if(a.roomNavigation)a.leave();a.setTime(4*1440+20*60+30);if(id==='sakura-office')await a.enterInside(id);else await a.enter(id);},id);
  await page.waitForFunction(id=>window.__JOHANSSON_AUDIT__.roomNavigation?.id===id&&!window.__JOHANSSON_AUDIT__.blocked.roomLoading,id,{timeout:120000});await settle();
  const frame=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.renderer.info.render.frame);await page.waitForFunction(frame=>window.__JOHANSSON_AUDIT__.renderer.info.render.frame>frame+3,frame,{timeout:60000});
  await page.screenshot({path:resolve(out,'ipad-offline-'+id+'.png')});step('previously unvisited room opens offline',{id});
 }
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.leave();a.activities.close();a.frozen=true;a.camera=null;a.setTime(515);a.world.ferry.parkAt('town');a.world.ferry.update(0,515,0);a.step(50);});
 const views=[];
 for(const [id,[X,Y,Z]] of [['engines-aft',[11.1,0,.9]],['control',[9.2,-3.1,.9]],['engines-fore',[13.1,0,.9]],['aux',[16.7,0,.9]],['workshop',[21,0,.9]],['store',[21.4,-1.4,.9]],['electrical',[24,0,.9]],['workshop-entry',[19.3,0,.9]]]){
  const view=await page.evaluate(([X,Y,Z])=>{const a=window.__JOHANSSON_AUDIT__,ship=a.world.ferry.ferry;ship.updateMatrixWorld(true);const p=ship.localToWorld(ship.position.clone().set(Y,Z-1.9,X-17.25));a.stand(p.x,p.y,p.z,0);a.step(20);return a.ferryCamera;},[X,Y,Z]);assert.equal(view.id,id);views.push(id);
  await page.waitForFunction(()=>{const state=window.__JOHANSSON_AUDIT__.world.ferry.ferry.userData.engineRoomH1;return state.loaded||state.error;},null,{timeout:90000});await settle();if(id==='engines-aft'||id==='control')await page.screenshot({path:resolve(out,'ipad-offline-ferry-'+id+'.png')});
 }
 const engineRoom=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,state=a.world.ferry.ferry.userData.engineRoomH1,model=state.group.getObjectByName('Minato Maru H1-F1 / Blender CAD');let meshes=0,triangles=0;model?.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});return {loaded:state.loaded,error:state.error,meshes,triangles,gpuError:a.renderer.getContext().getError()};});
 assert.equal(engineRoom.loaded,true);assert.equal(engineRoom.error,null);assert.equal(engineRoom.meshes,2);assert.equal(engineRoom.triangles,80376);assert.equal(engineRoom.gpuError,0);step('default Blender ferry and all eight cameras work offline',{...engineRoom,views});
 assert.equal(offlineSuccesses,0,'Server supplied no successful response after disconnecting');assert.deepEqual(report.failedLocal,[]);assert.deepEqual(report.errors,[]);assert.ok(report.offlineResponses.some(url=>url.includes('minato-engine-room-h1-f1.glb')));report.passed=true;
}catch(error){failure=error;report.passed=false;report.failure={message:error.message,stack:error.stack};if(page){report.failureUI=await page.evaluate(()=>({loading:window.__JOHANSSON_LOADING__?.snapshot(),dialog:document.querySelector('#offlineIsland')?.outerHTML,buttons:[...document.querySelectorAll('#offlineIsland button')].map(b=>({id:b.id,disabled:b.disabled,hidden:b.hidden,rect:b.getBoundingClientRect().toJSON(),visibility:getComputedStyle(b).visibility,display:getComputedStyle(b).display}))})).catch(()=>null);await page.screenshot({path:resolve(out,'failure.png')}).catch(()=>{});}}
finally{releaseDownload();report.offlineServerSuccesses=offlineSuccesses;report.uniqueOfflineResponses=[...new Set(report.offlineResponses)].length;delete report.offlineResponses;await writeFile(resolve(out,'results.json'),JSON.stringify(report,null,2)+'\n');await context?.close();await new Promise(resolve=>server.close(resolve));}
if(failure)throw failure;
