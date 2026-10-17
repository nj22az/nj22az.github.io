const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'../site'),out=path.resolve(__dirname,'../dist/console-qa');fs.mkdirSync(out,{recursive:true});
 const errors=[],missing=[],remote=[];
 const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav','.mp4':'video/mp4'};
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(url.pathname.endsWith('/'))file=path.join(file,'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){missing.push(url.pathname);res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 let page;
 const browser=await chromium.launch({headless:true,...(process.env.WORLD_CHROME?{executablePath:process.env.WORLD_CHROME}:{}),args:process.platform==='linux'?['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']:[]});
 try{
 console.log('Browser launched');
 const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true});
 await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==url){remote.push(route.request().url());return route.abort();}return route.continue();});
 page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE_ERROR',e.message);});
 await page.addInitScript(()=>{
  window.__pad={id:'Steam Deck test pad',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
  Object.defineProperty(navigator,'getGamepads',{value:()=>window.__pad?[window.__pad]:[],configurable:true});
  window.johanssonDesktop={offline:true,version:'0.2.3',save:async()=>{dispatchEvent(new Event('johansson-desktop-save'));dispatchEvent(new Event('johansson-save'));window.__saved=true;},performance:async()=>[{type:'Renderer',workingSetMiB:120}],checkUpdate:async()=>({available:false}),installUpdate:async()=>({ready:false}),quit:async()=>{window.__quit=true;}};
 });
 const sampled=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const tap=async i=>{await page.evaluate(i=>{window.__pad.buttons[i]={pressed:true,value:1};},i);await sampled();await page.evaluate(i=>{window.__pad.buttons[i]={pressed:false,value:0};},i);await sampled();};
 const axes=async value=>{await page.evaluate(value=>{window.__pad.axes=value;},value);await page.waitForTimeout(250);};
 const state=()=>page.evaluate(()=>window.johanssonDesktopUI.snapshot());
 const click=action=>page.locator(`#desktopMenu [data-action="${action}"]`).last().click();
 console.log('Opening installed site',url);
 await page.goto(url+'/johansson-town/?desktop=1&audit&cinematic=off',{waitUntil:'domcontentloaded'});
 await page.screenshot({path:path.join(out,'00-loading.png')});console.log('Title loading');
 await page.waitForFunction(()=>document.getElementById('title')?.dataset.scene==='ready',null,{timeout:120000});
 await page.screenshot({path:path.join(out,'01-title-1280.png')});
 await page.locator('#title .title-guide').click();assert.equal((await state()).page,'help','Title guide uses console instructions');await tap(9);
 await tap(9);assert.equal((await state()).menu,true,'Start opens menu from title');await click('controls');await page.screenshot({path:path.join(out,'02-controls-title.png')});await tap(1);assert.equal((await state()).page,'pause');await tap(1);assert.equal((await state()).menu,false);
 // A begins the actual world without needing a mouse.
 await tap(0);await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__===true,null,{timeout:120000});
 await page.waitForTimeout(500);assert.equal((await state()).page,'help');assert.equal((await state()).menu,true,'First entry explains what to do');
 await page.screenshot({path:path.join(out,'03-first-steps-1280.png')});await click('resume');
 // Find the same walkable harbour fixture used by the world audit.
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.teleport(-7,-15,0,0));
 let before=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));await axes([0,-1,0,0]);await page.waitForTimeout(500);await axes([0,0,0,0]);
 let after=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));assert.ok(Math.hypot(after.x-before.x,after.z-before.z)>.1,'Left stick moves the actual world player');
 before=after;await axes([0,0,.85,.5]);await page.waitForTimeout(350);await axes([0,0,0,0]);after=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));assert.ok(Math.abs(after.yaw-before.yaw)>.05,'Right stick rotates actual camera');assert.ok(Math.abs(after.pitch-before.pitch)>.02,'Right stick tilts actual camera');
 await tap(11);await page.waitForTimeout(100);assert.ok(Math.abs(await page.evaluate(()=>window.__JOHANSSON_POSE__.pitch))<.01,'R3 centres camera');
 await page.screenshot({path:path.join(out,'04-gameplay-1280.png')});
 await tap(9);assert.equal((await state()).menu,true);before=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));await axes([0,-1,1,1]);await page.waitForTimeout(250);await axes([0,0,0,0]);after=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));assert.equal(after.x,before.x);assert.equal(after.yaw,before.yaw,'Pause blocks movement and camera');
 await click('controls');await page.screenshot({path:path.join(out,'05-controls-1280.png')});
 // D-pad changes a slider and checkbox without pointer input.
 await page.locator('#desktopMenu [name=sensitivity]').focus();const oldSensitivity=await page.locator('#desktopMenu [name=sensitivity]').inputValue();await tap(15);assert.ok(Number(await page.locator('#desktopMenu [name=sensitivity]').inputValue())>Number(oldSensitivity));
 await page.locator('#desktopMenu [name=invertY]').focus();await tap(0);assert.equal(await page.locator('#desktopMenu [name=invertY]').isChecked(),true);
 // Custom remap is exercised through the capture UI, including Start itself.
 await page.locator('[data-bind="9"]').click();await sampled();await tap(6);assert.match(await page.locator('#desktopStatus').textContent(),/assigned to button 6/);
 assert.equal(await page.locator('[data-bind="9"] kbd').textContent(),'6');
 await tap(6);assert.equal((await state()).menu,false,'Remapped Start closes menu');const pitchBefore=await page.evaluate(()=>window.__JOHANSSON_POSE__.pitch);await axes([0,0,0,.8]);await axes([0,0,0,0]);assert.ok(await page.evaluate(()=>window.__JOHANSSON_POSE__.pitch)>pitchBefore,'Invert Y changes actual camera behaviour');await tap(6);assert.equal((await state()).menu,true,'Remapped Start reopens menu');
 await click('controls');await click('swap');await page.screenshot({path:path.join(out,'06-custom-controls.png')});
 await click('resume');before=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));await axes([.8,0,0,0]);await page.waitForTimeout(250);await axes([0,0,0,0]);after=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));assert.ok(Math.abs(after.yaw-before.yaw)>.05,'Swapped look stick changes actual camera');
 await tap(6);await click('controls');await click('reset');
 await click('resume');await tap(10);assert.equal((await state()).hudHidden,true);assert.equal(await page.locator('#desktopOpenMenu').isVisible(),true,'Menu remains accessible with HUD hidden');await tap(10);assert.equal((await state()).hudHidden,false);
 await tap(8);await page.waitForTimeout(150);assert.equal(await page.locator('#directory').isVisible(),true,'View opens town book');await tap(1);assert.equal(await page.locator('#directory').isVisible(),false);
 await tap(3);assert.equal(await page.locator('#activity').isVisible(),true,'Y opens inventory');await tap(1);assert.equal(await page.locator('#activity').isVisible(),false);
 // An unmapped USB controller still drives both sticks and Start.
 await page.evaluate(()=>{window.__pad.mapping='';window.__pad.id='USB custom controller';});await page.waitForTimeout(150);await tap(9);assert.equal((await state()).menu,true);await click('controls');await page.screenshot({path:path.join(out,'07-unmapped-controller.png')});await click('resume');
 // Controller loss stops input and offers a useful recovery screen.
 await page.evaluate(()=>{window.__pad.connected=false;});await page.waitForTimeout(200);assert.equal((await state()).menu,true);assert.equal((await state()).page,'controls');await page.evaluate(()=>{window.__pad.connected=true;});await page.waitForTimeout(150);await tap(1);await click('save');assert.equal(await page.evaluate(()=>window.__saved),true);
 // Four Linux window sizes, including the Deck's touchscreen media queries.
 for(const [width,height] of [[1280,800],[1280,720],[960,540],[800,600]]){
  await page.setViewportSize({width,height});await click('help');await page.screenshot({path:path.join(out,`help-${width}x${height}.png`)});
  const layout=await page.evaluate(()=>{const p=document.getElementById('desktopMenu'),shell=p.querySelector('.console-shell'),footer=p.querySelector('.console-footer');return {width:innerWidth,height:innerHeight,scrollWidth:shell.scrollWidth,shellWidth:shell.clientWidth,bottom:footer.getBoundingClientRect().bottom};});assert.ok(layout.scrollWidth<=layout.shellWidth+1,'No horizontal squashing');assert.ok(layout.bottom<=height,'Footer stays in viewport');
  await tap(1);await click('controls');await page.locator('[data-action=reset]').focus();await page.screenshot({path:path.join(out,`controls-${width}x${height}.png`)});await tap(1);
 }
 await page.setViewportSize({width:1280,height:800});await click('updates');await click('update');assert.match(await page.locator('#desktopStatus').textContent(),/current release/);await tap(1);
 // Settings survive reload at the stable installed origin.
 await click('controls');await page.locator('#desktopMenu [name=invertY]').check();await page.locator('[data-bind="9"]').click();await sampled();await tap(6);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.johanssonDesktopUI);await tap(6);await click('controls');assert.equal(await page.locator('#desktopMenu [name=invertY]').isChecked(),true);assert.equal(await page.locator('[data-bind="9"] kbd').textContent(),'6','Button remap persists');
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,errors,missing:[...new Set(missing)],blockedRemote:remote.length},null,2));
 assert.deepEqual(errors,[],'No page errors');assert.deepEqual([...new Set(missing)].filter(p=>p!=='/favicon.ico'),[],'No missing packaged files');
 console.log(JSON.stringify({passed:true,errors,missing:[...new Set(missing)],blockedRemote:remote.length,out}));
 } catch(error) {if(page){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});console.log('FAILURE_STATE',await page.evaluate(()=>({desktop:window.johanssonDesktopUI?.snapshot(),boot:document.getElementById('bootStatus')?.textContent,fatal:document.getElementById('fatal')?.textContent})).catch(()=>({})));}throw error;} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
