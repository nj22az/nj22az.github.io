const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'../site'),out=path.resolve(__dirname,'../dist/console-qa');fs.mkdirSync(out,{recursive:true});
 assert.equal(fs.existsSync(path.join(root,'thuans-storage')),false,'Retired storage game is not bundled');
 const errors=[],missing=[],remote=[],audioRequests=[];
 const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav','.mp4':'video/mp4'};
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(url.pathname.endsWith('/'))file=path.join(file,'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){missing.push(url.pathname);res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 let page;
 const browser=await chromium.launch({headless:true,...(process.env.WORLD_CHROME?{executablePath:process.env.WORLD_CHROME}:{}),args:process.platform==='linux'?['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']:[]});
 try{
 console.log('Browser launched');
 const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true});
 await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==url){remote.push(route.request().url());return route.abort();}return route.continue();});
 page=await context.newPage();page.setDefaultTimeout(120000);page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE_ERROR',e.message);});
 page.on('request',request=>{if(request.url().includes('/audio/'))audioRequests.push(request.url());});
 await page.addInitScript(()=>{
  window.__pad={id:'Steam Deck test pad',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
  Object.defineProperty(navigator,'getGamepads',{value:()=>window.__pad?[window.__pad]:[],configurable:true});
  window.johanssonDesktop={offline:true,version:'0.2.4',save:async()=>{dispatchEvent(new Event('johansson-desktop-save'));dispatchEvent(new Event('johansson-save'));window.__saved=true;},performance:async()=>[{type:'Renderer',workingSetMiB:120}],checkUpdate:async()=>({available:false}),installUpdate:async()=>({ready:false}),quit:async()=>{window.__quit=true;}};
 });
 const sampled=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const tap=async i=>{await sampled();await page.evaluate(i=>{window.__pad.buttons[i]={pressed:true,value:1};},i);await sampled();await page.evaluate(i=>{window.__pad.buttons[i]={pressed:false,value:0};},i);await sampled();};
 // Software-rendered CI frames can take longer than 250 ms. Keep the input held
 // for real sampled frames so both movement and camera receive the same test input.
 const axes=async value=>{await page.evaluate(value=>{window.__pad.axes=value;},value);await sampled();await sampled();};
 const state=()=>page.evaluate(()=>window.johanssonDesktopUI.snapshot());
 const click=async action=>{
  const target=page.locator(`#desktopMenu [data-action="${action}"]`).last();
  if(!await target.isVisible())await page.locator(`#desktopTabs [data-tab="${['controls','display','updates','quit'].includes(action)?'settings':action==='people'?'people':'pause'}"]`).click();
  if(action==='people')return;await page.locator(`#desktopMenu [data-action="${action}"]`).last().click();
 };
 console.log('Opening installed site',url);
 await page.goto(url+'/johansson-town/?desktop=1&audit&cinematic=off',{waitUntil:'domcontentloaded'});
 console.log('Title loading');
 await page.waitForFunction(()=>document.getElementById('title')?.dataset.scene==='ready',null,{timeout:120000});
 await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.frozen=true;window.__JOHANSSON_AUDIT__.renderFrozen=false;});
 await page.screenshot({path:path.join(out,'01-title-1280.png')});
 await page.locator('#title .title-guide').click();assert.equal((await state()).page,'help','Title guide uses console instructions');await tap(9);
 await tap(9);assert.equal((await state()).menu,true,'Start opens menu from title');await click('controls');await page.screenshot({path:path.join(out,'02-controls-title.png')});await tap(1);assert.equal((await state()).page,'settings');await tap(1);assert.equal((await state()).menu,false);
 assert.equal(await page.locator('#desktopTabs [data-tab]').count(),3);assert.equal(await page.locator('#desktopOpenMenu kbd').textContent(),'☰');
 await tap(9);await tap(5);assert.equal((await state()).page,'people','R1 opens People');await tap(5);assert.equal((await state()).page,'settings','R1 opens Settings');await tap(4);assert.equal((await state()).page,'people','L1 returns to People');await tap(9);
 await page.locator('#titleLoad').click();await tap(1);assert.equal(await page.locator('#titleSlots').isVisible(),false,'B closes the title save list');
 // A begins the actual world without needing a mouse.
 await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.frozen=false;});await tap(0);await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__===true,null,{timeout:120000});
 await page.waitForTimeout(500);assert.equal((await state()).page,'help');assert.equal((await state()).menu,true,'First entry explains what to do');
 assert.equal(await page.evaluate(()=>window.__JOHANSSON_STABILITY__?.ok),true,'Real world startup checks pass');
 await page.screenshot({path:path.join(out,'03-first-steps-1280.png')});await click('resume');
 if(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).room!==null&&!window.johanssonLinuxWorld.inBed)){await tap(1);await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).room===null);}
 // Find the same walkable harbour fixture used by the world audit.
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.teleport(-7,-15,0,0));
 let before=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));await axes([0,-1,0,0]);await page.waitForTimeout(500);await axes([0,0,0,0]);
 let after=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));assert.ok(Math.hypot(after.x-before.x,after.z-before.z)>.1,'Left stick moves the actual world player');
 before=after;await axes([0,0,.85,.5]);await page.waitForTimeout(350);await axes([0,0,0,0]);after=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));assert.ok(Math.abs(after.yaw-before.yaw)>.05,'Right stick rotates actual camera');assert.ok(Math.abs(after.pitch-before.pitch)>.02,'Right stick tilts actual camera');
 await tap(11);await page.waitForTimeout(100);assert.ok(Math.abs(await page.evaluate(()=>window.__JOHANSSON_POSE__.pitch))<.01,'R3 centres camera');
 await tap(9);await tap(2);assert.equal(await page.evaluate(()=>window.__saved),true,'X quick-saves only in pause');
 await click('quit');assert.equal(await page.evaluate(()=>!!window.__quit),false,'Opening Quit never closes the game');await tap(1);assert.equal((await state()).page,'settings');await tap(9);
 await page.screenshot({path:path.join(out,'04-gameplay-1280.png')});
 // Night harbour: the old tonal cricket loop must never be loaded in Linux.
 if(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).room!==null)){await tap(1);await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).room===null);}
 await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.setTime(1380);window.__JOHANSSON_AUDIT__.teleport(4.9,-42.6,-Math.PI/2,0);});
 await sampled();await page.waitForTimeout(1200);
 assert.equal(audioRequests.some(url=>url.includes('/crickets.wav')),false,'No repeating electronic cricket beep at night');
 await page.evaluate(()=>document.fullscreenElement?document.exitFullscreen():undefined);
 const nightWindow=await context.newCDPSession(page),nightWindowInfo=await nightWindow.send('Browser.getWindowForTarget');
 await nightWindow.send('Browser.setWindowBounds',{windowId:nightWindowInfo.windowId,bounds:{windowState:'normal'}});await nightWindow.detach();
 await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.frozen=true;});
 // Use the real context control with a full ferry action description. This catches
 // inherited width/clamping even when the nearby raycast happens to choose a short label.
 await page.evaluate(()=>{
  const rail=document.getElementById('contextActions'),button=document.getElementById('act');
  window.__contextBefore={html:button.innerHTML,buttons:[...rail.querySelectorAll('button')].map(b=>({id:b.id,hidden:b.hidden,disabled:b.disabled,className:b.className}))};
  rail.querySelectorAll('button').forEach(b=>{b.hidden=true;b.classList.add('hidden');});
  rail.hidden=false;button.hidden=false;button.disabled=false;button.classList.remove('hidden','control-off');button.classList.add('context-primary');
  button.innerHTML='<span class="context-label">Read the ferry timetable and check the next departure to Kitano-jima</span><kbd>E</kbd>';
  document.getElementById('subtitle').textContent='Minato Port · Walk up to the waiting hall to buy a ticket or ask about the ferry.';document.getElementById('subtitle').classList.add('on');
 });
 for(const [width,height] of [[1280,800],[1280,720],[960,540],[800,600]]){
  await page.setViewportSize({width,height});await sampled();await page.evaluate(()=>window.__JOHANSSON_AUDIT__.render());await sampled();
  const layout=await page.evaluate(()=>{
   const label=document.querySelector('#act .context-label'),box=label.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(label);
   const text=range.getBoundingClientRect(),caption=document.getElementById('subtitle').getBoundingClientRect(),rail=document.getElementById('contextActions').getBoundingClientRect();
   return {clamp:getComputedStyle(label).webkitLineClamp,height:box.height,textHeight:text.height,scroll:label.scrollHeight,client:label.clientHeight,captionRight:caption.right,railLeft:rail.left,railRight:rail.right,railBottom:rail.bottom,width:innerWidth,heightLimit:innerHeight};
  });
  assert.equal(await page.locator('#act').evaluate(el=>getComputedStyle(el,'::after').content.includes('A')),true,'Action prompt displays the mapped A button');
  assert.equal(layout.clamp,'none','Full action labels have no line clamp');
  assert.ok(layout.scroll<=layout.client+1&&layout.textHeight<=layout.height+1,'Complete action text is visible');
  assert.ok(layout.captionRight<layout.railLeft,'Caption and action descriptions do not overlap');
  assert.ok(layout.railRight<=layout.width&&layout.railBottom<=layout.heightLimit,'Action rail stays on screen');
  await page.screenshot({path:path.join(out,`night-actions-${width}x${height}.png`)});
 }
 await page.setViewportSize({width:1280,height:800});await page.evaluate(()=>{const before=window.__contextBefore;document.getElementById('act').innerHTML=before.html;for(const saved of before.buttons){const button=document.getElementById(saved.id);button.hidden=saved.hidden;button.disabled=saved.disabled;button.className=saved.className;}delete window.__contextBefore;window.__JOHANSSON_AUDIT__.frozen=false;window.__JOHANSSON_AUDIT__.setTime(720);window.__JOHANSSON_AUDIT__.teleport(-7,-15,0,0);});await sampled();
 await tap(9);assert.equal((await state()).menu,true);before=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));await axes([0,-1,1,1]);await page.waitForTimeout(250);await axes([0,0,0,0]);after=await page.evaluate(()=>({...window.__JOHANSSON_POSE__}));assert.equal(after.x,before.x);assert.equal(after.yaw,before.yaw,'Pause blocks movement and camera');
 await click('controls');await page.screenshot({path:path.join(out,'05-controls-1280.png')});
 // D-pad changes a slider and checkbox without pointer input.
 await page.locator('#desktopMenu [name=sensitivity]').focus();const oldSensitivity=await page.locator('#desktopMenu [name=sensitivity]').inputValue();await tap(15);assert.ok(Number(await page.locator('#desktopMenu [name=sensitivity]').inputValue())>Number(oldSensitivity));
 await page.locator('#desktopMenu [name=invertY]').focus();await tap(0);assert.equal(await page.locator('#desktopMenu [name=invertY]').isChecked(),true);
 // Custom remap is exercised through the capture UI, including Start itself.
 await page.locator('[data-bind="9"]').click();await sampled();await tap(6);assert.match(await page.locator('#desktopStatus').textContent(),/assigned to button 6/);
 assert.equal(await page.locator('[data-bind="9"] kbd').textContent(),'L2');
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
 await page.evaluate(()=>document.fullscreenElement?document.exitFullscreen():undefined);
 const windowSession=await context.newCDPSession(page),windowInfo=await windowSession.send('Browser.getWindowForTarget');
 await windowSession.send('Browser.setWindowBounds',{windowId:windowInfo.windowId,bounds:{windowState:'normal'}});await windowSession.detach();
 for(const [width,height] of [[1280,800],[1280,720],[960,540],[800,600]]){
  await page.setViewportSize({width,height});await click('help');await page.screenshot({path:path.join(out,`help-${width}x${height}.png`)});
  const layout=await page.evaluate(()=>{const p=document.getElementById('desktopMenu'),shell=p.querySelector('.console-shell'),footer=p.querySelector('.console-footer');return {width:innerWidth,height:innerHeight,scrollWidth:shell.scrollWidth,shellWidth:shell.clientWidth,bottom:footer.getBoundingClientRect().bottom};});assert.ok(layout.scrollWidth<=layout.shellWidth+1,'No horizontal squashing');assert.ok(layout.bottom<=height,'Footer stays in viewport');
  await tap(1);await page.screenshot({path:path.join(out,`pause-${width}x${height}.png`)});await click('controls');await page.locator('[data-action=reset]').focus();await page.locator('[data-action=reset]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`controls-${width}x${height}.png`)});await tap(1);
 }
 await page.setViewportSize({width:1280,height:800});await click('updates');await click('update');assert.match(await page.locator('#desktopStatus').textContent(),/current release/);await tap(1);
 // Linux residents: all named characters can be selected, with their own beds and schedules.
 console.log('Controls and layout passed; testing residents');
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.setTime(60));await page.locator('#desktopTabs [data-tab=people]').click();
 assert.ok(await page.locator('[data-person]').count()>=30);await page.screenshot({path:path.join(out,'08-character-roster.png')});
 await page.locator('[data-person="Thuan"]').click();await page.waitForFunction(()=>window.johanssonLinuxWorld?.inBed&&!window.johanssonLinuxWorld.busy);
 assert.equal(await page.evaluate(()=>window.__JOHANSSON_MODEL__.avatar.recipe.name),'Thuan');
 await sampled();await page.screenshot({path:path.join(out,'09-thuan-own-bed.png')});await tap(0);assert.equal(await page.evaluate(()=>window.johanssonLinuxWorld.inBed),false,'A gets out of bed');await tap(1);await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).room===null);assert.equal(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).room),null,'B leaves the home without a mouse');
 await tap(9);await page.locator('#desktopTabs [data-tab=people]').click();await page.locator('[data-person="Officer%20Mori"]').click();await page.waitForFunction(()=>window.johanssonLinuxWorld?.active==='Officer Mori'&&!window.johanssonLinuxWorld.busy);
 assert.equal(await page.evaluate(()=>window.johanssonLinuxWorld.inBed),false,'Night patrol does not spawn asleep');
 await tap(9);await page.locator('#desktopTabs [data-tab=people]').click();await page.locator('[data-person="Mai"]').click();await page.waitForFunction(()=>window.johanssonLinuxWorld?.inBed&&!window.johanssonLinuxWorld.busy);await page.screenshot({path:path.join(out,'10-mai-own-bed.png')});
 await axes([0,-1,0,0]);await axes([0,0,0,0]);assert.equal(await page.evaluate(()=>window.johanssonLinuxWorld.inBed),false,'Left stick gets up safely beside the bed');
 const selectable=await page.evaluate(async()=>{const api=window.johanssonLinuxWorld,result=[];for(const person of api.roster){await api.select(person.name,{started:false});result.push({name:api.active,model:window.__JOHANSSON_MODEL__.avatar.recipe.name});}return result;});
 console.log('Selected roster',JSON.stringify(selectable));
 assert.ok(selectable.length>=30);assert.ok(selectable.every(p=>p.name===p.model),'Every roster selection uses its own character recipe');
 await page.evaluate(async()=>{window.__JOHANSSON_AUDIT__.setTime(720);await window.johanssonLinuxWorld.select('Johansson');});
 console.log('Testing conversation escalation');
 if(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).room!==null&&!window.johanssonLinuxWorld.inBed)){await tap(1);await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).room===null);}
 await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.teleport(-7,-15,0,0);window.__JOHANSSON_AUDIT__.activities.action('resident','Tetsuo');});
 console.log('Conversation opened',await page.locator('#activityTitle').textContent());
 const conversationTitle=await page.locator('#activityTitle').textContent();await tap(9);assert.equal((await state()).menu,true);await tap(1);assert.equal((await state()).menu,false);assert.equal(await page.locator('#activity').isVisible(),true,'Menu pause retains the open conversation');assert.equal(await page.locator('#activityTitle').textContent(),conversationTitle);
 await page.getByRole('button',{name:'Lose your temper…',exact:true}).click();
 const funds=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.state.yen);
 for(let i=0;i<3;i++){await page.getByRole('button',{name:/^Insult Tetsuo/}).click();await page.waitForFunction(count=>window.__JOHANSSON_AUDIT__.activities.state.desktopLife.tempers['Johansson\u0000Tetsuo']?.count===count,i+1);assert.equal(await page.locator('#festivalHUD').count(),0,'Warnings come before a fight');}
 await page.screenshot({path:path.join(out,'11-last-warning.png')});await page.getByRole('button',{name:/^Insult Tetsuo/}).click();await page.waitForSelector('#festivalHUD');
 await sampled();await page.screenshot({path:path.join(out,'12-rare-quarrel.png')});await tap(9);assert.equal((await state()).menu,true);const pausedBout=await page.locator('#festivalHUD').textContent();await page.waitForTimeout(1200);assert.equal(await page.locator('#festivalHUD').textContent(),pausedBout,'Start pauses the actual quarrel');await tap(9);await tap(8);assert.equal(await page.locator('#festivalHUD').count(),0);assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.state.yen),funds,'Quarrels award no festival money');
 await page.getByRole('button',{name:'Walk away',exact:true}).click();
 // Persist a selected character as well as the controls.
 await page.evaluate(async()=>{window.__JOHANSSON_AUDIT__.setTime(60);await window.johanssonLinuxWorld.select('Thuan');window.__JOHANSSON_AUDIT__.activities.save();});await tap(9);
 await page.addInitScript(()=>{const NativeDate=Date,fixed=new NativeDate();fixed.setHours(1,0,0,0);const timestamp=fixed.getTime();window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[timestamp]));}static now(){return timestamp;}};});
 // Settings survive reload at the stable installed origin.
 await click('controls');await page.locator('#desktopMenu [name=invertY]').check();await page.locator('[data-bind="9"]').click();await sampled();await tap(6);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.johanssonDesktopUI);await tap(6);await click('controls');assert.equal(await page.locator('#desktopMenu [name=invertY]').isChecked(),true);assert.equal(await page.locator('[data-bind="9"] kbd').textContent(),'L2','Button remap persists');
 await tap(6);await tap(0);await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.johanssonLinuxWorld?.active==='Thuan'&&window.johanssonLinuxWorld.inBed&&!window.johanssonLinuxWorld.busy,null,{timeout:120000});await page.screenshot({path:path.join(out,'13-saved-character-night-spawn.png')});
 // Release the full Linux world before starting the separate web-only world.
 // Keeping both live exhausts the software renderer on the Linux runner.
 console.log('Linux acceptance passed; releasing it before web-only isolation check');
 await context.close();page=null;
 const web=await browser.newPage({viewport:{width:1280,height:800}});page=web;web.on('pageerror',e=>errors.push(e.message));await web.goto(url+'/johansson-town/?audit&cinematic=off',{waitUntil:'domcontentloaded'});await web.waitForFunction(()=>document.getElementById('title')?.dataset.scene==='ready',null,{timeout:120000});assert.equal(await web.evaluate(()=>window.johanssonLinuxWorld===undefined),true,'Web edition has no Linux character/home system');assert.equal(await web.locator('#desktopMenu').count(),0,'Web edition has no Linux console UI');await web.close();
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,errors,missing:[...new Set(missing)],blockedRemote:remote.length},null,2));
 assert.deepEqual(errors,[],'No page errors');assert.deepEqual([...new Set(missing)].filter(p=>p!=='/favicon.ico'),[],'No missing packaged files');
 console.log(JSON.stringify({passed:true,errors,missing:[...new Set(missing)],blockedRemote:remote.length,out}));
 } catch(error) {if(page){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});console.log('FAILURE_STATE',await page.evaluate(()=>({desktop:window.johanssonDesktopUI?.snapshot(),boot:document.getElementById('bootStatus')?.textContent,fatal:document.getElementById('fatal')?.textContent})).catch(()=>({})));}throw error;} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
