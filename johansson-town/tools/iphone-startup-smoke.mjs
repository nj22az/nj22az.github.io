// Run in CI with WebKit/Mesa and an iPhone profile; this does not model iOS process limits.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {webkit,chromium,devices} from 'playwright';

const site=resolve(new URL('../..',import.meta.url).pathname);
const out=resolve(process.env.IPHONE_OUTPUT||resolve(site,'johansson-town/output/iphone-startup'));
await mkdir(out,{recursive:true});
const engine=process.env.IPHONE_ENGINE||'webkit';
const report={engine,profile:'iPhone 13',physicalDevice:false,notes:['Desktop WebKit/Chromium with iPhone viewport, DPR, touch and user agent. Not physical iOS Safari or its memory limits.'],steps:[],errors:[],consoleErrors:[],failedRequests:[]};
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wasm':'application/wasm'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const file=resolve(site,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(site+'/'))throw Error('Outside repository');
  const body=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,page;
const started=Date.now();
const step=(name,data={})=>{const item={name,seconds:+((Date.now()-started)/1000).toFixed(2),...data};report.steps.push(item);console.log(JSON.stringify(item));};
const state=()=>page.evaluate(()=>{
 const a=window.__JOHANSSON_AUDIT__,r=a?.renderer;
 return {running:!!window.__JOHANSSON_RUNNING__,safe:window.__JOHANSSON_SAFE_GRAPHICS__,loading:window.__JOHANSSON_LOADING__?.snapshot(),
  room:a?.roomNavigation?.id||null,blocked:a?.blocked,player:a?.player?.position,
  graphics:window.__JOHANSSON_LOOK__?.state,render:a?.renderInfo,frames:r?.info?.render?.frame,
  canvas:{width:document.querySelector('#game')?.width,height:document.querySelector('#game')?.height},
  fatal:document.querySelector('#fatal:not(.hidden)')?.textContent,
  launch:JSON.parse(localStorage.getItem('johansson-loading-report-v1')||'null')};
});
const boot=async(reload=false,natural=false)=>{
 // Finish this page's detail decodes before a planned reload. WebKit otherwise
 // reports the outgoing document's cancelled blob texture as an access-control error.
 // Keep all error assertions: no message is filtered out or discarded.
 if(report.steps.length){
  await page.waitForLoadState('networkidle',{timeout:60000});
  await page.waitForFunction(()=>!window.__JOHANSSON_STREAMING__?.active,null,{timeout:60000});
 }
 if(reload)await page.reload({waitUntil:'domcontentloaded'});
 else await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/${natural?'':'?audit&spawn=ferry&cinematic=off'}`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__JOHANSSON_LOADING__?.snapshot().ready||window.__JOHANSSON_LOADING__?.snapshot().error,null,{timeout:240000});
 const ready=await state();assert.equal(ready.loading?.error,null,JSON.stringify(ready));
 await page.locator('#enter').tap();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_LOADING__?.snapshot().completed===10&&!window.__JOHANSSON_AUDIT__?.blocked.catchingUp,null,{timeout:180000});
 const playing=await state();
 assert.equal(playing.fatal,undefined,'No fatal overlay after START');
 assert.equal(playing.graphics?.ink,true,'Every launch retains the cartoon ink pass');
 assert.equal(playing.graphics?.grade,true,'Every launch retains the cartoon colour grade');
 assert.equal(playing.graphics?.hdr,true,'Every launch retains HDR');
 assert.equal(playing.graphics?.samples,4,'Every launch retains four-sample antialiasing');
};
try{
 browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:false}:{headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const context=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
 await context.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
 await context.addInitScript(()=>{
  if(!localStorage.getItem('johansson-town-clock'))localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:20',speed:1}));
  Element.prototype.requestFullscreen=async()=>{};
  // Exercise a real context loss at the first loading yield, before town construction.
  if(localStorage.getItem('iphone-test-early-loss')==='1'){
   localStorage.removeItem('iphone-test-early-loss');
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(kind,...args){
    const gl=original.call(this,kind,...args);
    if(this.id==='game'&&kind==='webgl2'&&gl&&!window.__IPHONE_CONTEXT_TEST__){
     const extension=gl.getExtension('WEBGL_lose_context');
     const result=window.__IPHONE_CONTEXT_TEST__={supported:!!extension,lost:0,restored:0,prevented:false};
     if(extension){
      this.addEventListener('webglcontextlost',event=>{
       result.lost++;
       queueMicrotask(()=>{result.prevented=event.defaultPrevented;setTimeout(()=>extension.restoreContext(),300);});
      });
      this.addEventListener('webglcontextrestored',()=>result.restored++);
      setTimeout(()=>extension.loseContext(),0);
     }
    }
    return gl;
   };
  }
 });
 page=await context.newPage();
 page.on('pageerror',error=>report.errors.push({message:error.message,stack:error.stack,seconds:+((Date.now()-started)/1000).toFixed(2),lastStep:report.steps.at(-1)?.name}));
 page.on('console',message=>{if(message.type()==='error')report.consoleErrors.push(message.text());});
 page.on('requestfailed',request=>report.failedRequests.push({url:request.url(),failure:request.failure()?.errorText}));
 page.on('crash',()=>report.errors.push('BROWSER PAGE CRASHED'));
 await boot();step('cold-start portrait',await state());
 await page.screenshot({path:resolve(out,'portrait.png')});
 const frame=(await state()).frames;
 await page.waitForFunction(before=>window.__JOHANSSON_AUDIT__.renderer.info.render.frame>before+20,frame,{timeout:60000});
 step('live frame loop advances',await state());
 await page.setViewportSize({width:844,height:390});
 await page.waitForFunction(()=>document.querySelector('#game').width>document.querySelector('#game').height);
 step('landscape',await state());await page.screenshot({path:resolve(out,'landscape.png')});
 await page.setViewportSize({width:390,height:844});
 await page.waitForFunction(()=>document.querySelector('#game').height>document.querySelector('#game').width);
 await boot(true);step('warm reload',await state());
 // Existing audit entry calls the same enterRoom path as the door. No mocked renderer/scene.
 await page.evaluate(async()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(4*1440+20*60+30);await a.enter('izakaya');});
 await page.waitForFunction(()=>window.__JOHANSSON_AUDIT__.roomNavigation?.id==='izakaya'&&!window.__JOHANSSON_AUDIT__.blocked.roomLoading,null,{timeout:120000});
 const room=await state();assert.equal(room.running,true);assert.equal(room.fatal,undefined);step('entered Izakaya',room);
 await page.screenshot({path:resolve(out,'izakaya.png')});
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.save());
 await boot(true);
 assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.state.visited.includes('izakaya')),true,'Room discovery survives reload');
 step('saved room discovery survives reload',await state());
 await page.evaluate(()=>localStorage.setItem('iphone-test-early-loss','1'));
 await boot(true);
 const recovery=await page.evaluate(()=>window.__IPHONE_CONTEXT_TEST__);
 assert.equal(recovery.supported,true,'The simulation must expose real graphics loss');
 assert.equal(recovery.lost,1);assert.equal(recovery.prevented,true,'A loading-screen context loss must permit restoration');
 assert.equal(recovery.restored,1);assert.equal((await state()).graphics.hdr,true,'Full HDR/ink returns after restoration');
 step('real context loss during startup recovers',{recovery,...await state()});
 await page.screenshot({path:resolve(out,'restored-startup.png')});
 await page.evaluate(()=>{
  const a=window.__JOHANSSON_AUDIT__,now=new Date(),real=(now.getTime()-now.getTimezoneOffset()*60000)/60000;
  // Reproduce a twelve-hour return at any time of day, including after midnight.
  a.setTime(real-720);a.activities.state.clockAhead=0;a.activities.save();
  localStorage.setItem('johansson-town-clock',JSON.stringify({start:'real',speed:1}));
 });
 await boot(false,true);
 const natural=await state(),enteringMs=natural.loading.timings.frame.end-natural.loading.timings.frame.start;
 assert.ok(enteringMs<60000,'A twelve-hour return must not strand START for minutes: '+enteringMs+' ms');
 step('ordinary URL with twelve-hour absence and natural opening',{enteringMs,...natural});
 await page.screenshot({path:resolve(out,'natural-opening.png')});
 assert.deepEqual(report.errors,[],'No uncaught errors or page crash');
 assert.deepEqual(report.consoleErrors.filter(m=>/shader error|VALIDATE_STATUS|WebGL.*(?:error|lost)/i.test(m)),[],'No graphics errors');
 report.passed=true;
}catch(error){report.passed=false;report.failure=error.message;process.exitCode=1;
 if(page)try{report.failureState=await state();await page.screenshot({path:resolve(out,'failure.png'),timeout:15000});}catch(diagnostic){report.diagnosticFailure=diagnostic.message;}
}finally{
 console.log(JSON.stringify(report));await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 await browser?.close();await new Promise(resolve=>server.close(resolve));
}
