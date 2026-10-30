// Native sharing is mocked: no external app is contacted. Run with Chromium and software WebGL.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS;if(shots)await mkdir(shots,{recursive:true});
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:402,height:740},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];let checks=0;
page.on('pageerror',e=>errors.push(e.message));
const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
try{
 await page.addInitScript(()=>{
  localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:true}));
  window.shares=[];window.downloads=[];window.prints=0;
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
  Object.defineProperty(navigator,'share',{configurable:true,value:data=>{window.shares.push({active:navigator.userActivation.isActive,type:data.files[0].type,bytes:data.files[0].size});return new Promise((resolve,reject)=>{window.finishShare=resolve;window.failShare=reject;});}});
  const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download)window.downloads.push(this.download);else click.call(this);};
  new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.classList?.contains('printer-scene'))window.prints++;}).observe(document,{subtree:true,childList:true});
 });
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>window.pocketCamera?.state.shots.length>=2);
 const initial=await page.evaluate(()=>window.pocketCamera.state.shots.length);
 await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
 await check('Save persists only in the app album, with no printer, share or download',async()=>{
  await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  const r=await page.evaluate(()=>({count:window.pocketCamera.state.shots.length,prints:window.prints,shares:window.shares.length,downloads:window.downloads.length}));
  assert.deepEqual(r,{count:initial+1,prints:0,shares:0,downloads:0});
 });
 await check('Share opens from the original tap and prints without delaying the share call',async()=>{
  await page.click('#sharePhoto');await page.waitForFunction(()=>window.shares.length===1);
  const r=await page.evaluate(()=>({share:window.shares[0],bytes:window.pocketCamera.state.viewing.photo.size,prints:window.prints,disabled:document.querySelector('#sharePhoto').disabled}));
  assert.equal(r.share.active,true);assert.equal(r.share.type,'image/jpeg');assert.equal(r.share.bytes,r.bytes);assert.equal(r.prints,1);assert.equal(r.disabled,true);
  await page.evaluate(()=>document.querySelector('#sharePhoto').dispatchEvent(new Event('click')));assert.equal(await page.evaluate(()=>window.shares.length),1,'duplicate taps do not open another sheet');
 });
 await check('cancelling Share cleans up the printer without downloading or resaving',async()=>{
  await page.evaluate(()=>window.failShare(new DOMException('Cancelled','AbortError')));await page.waitForFunction(()=>!document.querySelector('#sharePhoto').disabled);
  assert.deepEqual(await page.evaluate(()=>({downloads:window.downloads.length,count:window.pocketCamera.state.shots.length,printer:!!document.querySelector('.printer-scene,.printer-flyer')})),{downloads:0,count:initial+1,printer:false});
 });
 await check('a rejected share is retryable and never triggers a download',async()=>{
  await page.click('#sharePhoto');await page.evaluate(()=>window.failShare(new DOMException('Denied','NotAllowedError')));await page.waitForFunction(()=>!document.querySelector('#sharePhoto').disabled);
  assert.equal(await page.evaluate(()=>window.downloads.length),0);
  await page.evaluate(()=>window.pocketCamera.state.printer=false);const before=await page.evaluate(()=>window.prints);
  await page.click('#sharePhoto');await page.evaluate(()=>window.finishShare());await page.waitForFunction(()=>!document.querySelector('#sharePhoto').disabled);
  assert.equal(await page.evaluate(()=>window.prints),before,'Print off still shares');
 });
 await check('unsupported file sharing offers Download only from the export button',async()=>{
  await page.evaluate(()=>Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false}));
  await page.click('#editPhoto');await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  assert.equal(await page.textContent('#sharePhoto span'),'Download');assert.equal(await page.evaluate(()=>window.downloads.length),0);
  await page.click('#sharePhoto');await page.waitForFunction(()=>window.downloads.length===1);
 });
 await check('album failure preserves the edit and never substitutes a phone download',async()=>{
  await page.click('#editPhoto');
  await page.evaluate(()=>{window.realPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='shots')throw new DOMException('Full','QuotaExceededError');return window.realPut.apply(this,args);};});
  await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.edit?.saving===false);
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.mode),'editor');assert.equal(await page.evaluate(()=>window.downloads.length),1);
  await page.evaluate(()=>IDBObjectStore.prototype.put=window.realPut);await page.click('#cancelEdit');
 });
 await page.waitForTimeout(3000);
 await page.click('#closeViewer');await page.click('#openCardGames');await page.click('#chooseSolitaire');await page.locator('.sol-stock').tap();
 const game=await page.locator('.solitaire-game').evaluate(el=>[el.querySelector('.sol-status').textContent,[...el.querySelectorAll('.sol-tableau-card')].map(c=>c.getAttribute('aria-label'))]);
 for(const [label,width,height] of [['iphone-portrait-browser',402,740],['iphone-portrait-full',402,874],['iphone-landscape',874,340],['small-phone',320,560],['phone',390,664],['tablet',768,1024],['desktop',1280,800]]){
  await page.setViewportSize({width,height});
  await check(`Solitaire fits ${label} and keeps its game during resizing`,async()=>{
   const fit=await page.evaluate(()=>{const s=document.querySelector('.sol-scroll'),r=s.getBoundingClientRect();return {overflow:s.scrollWidth-s.clientWidth,inside:[...document.querySelectorAll('.sol-column,.sol-top .sol-card-button')].every(el=>{const b=el.getBoundingClientRect();return b.left>=r.left-1&&b.right<=r.right+1;}),ratio:[...document.querySelectorAll('.sol-card-button')].every(el=>{const b=el.getBoundingClientRect();return Math.abs(b.height/b.width-1.4)<.02;}),controls:[document.querySelector('.sol-reset'),document.querySelector('#closeCardGame'),document.querySelector('.sol-status')].every(el=>{const b=el.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight&&b.right<=innerWidth;})};});
   assert.ok(fit.overflow<=1&&fit.inside&&fit.ratio&&fit.controls,JSON.stringify(fit));
   assert.deepEqual(await page.locator('.solitaire-game').evaluate(el=>[el.querySelector('.sol-status').textContent,[...el.querySelectorAll('.sol-tableau-card')].map(c=>c.getAttribute('aria-label'))]),game);
   await page.locator('.sol-scroll').evaluate(el=>{el.scrollTop=el.scrollHeight;});
   assert.ok(await page.locator('.sol-column:last-child .sol-card-button:last-child').isVisible());
   if(shots&&label.startsWith('iphone'))await page.screenshot({path:join(shots,label+'.png')});
  });
 }
 await check('no page errors',async()=>assert.deepEqual(errors,[]));console.log(`${checks}/${checks} save/share/layout checks passed`);
}finally{await browser.close();await server.close();}
