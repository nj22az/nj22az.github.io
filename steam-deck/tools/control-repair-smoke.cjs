// Compiled-game software acceptance for the fixed Steam Deck profile.
// The injected Gamepad packets represent Steam Input output, not physical Deck hardware.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'../site'),out=path.resolve(__dirname,'../dist/control-repair');fs.mkdirSync(out,{recursive:true});const errors=[];
 const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://local');let file=path.resolve(root,'.'+url.pathname);if(url.pathname.endsWith('/'))file=path.join(file,'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,...(process.env.WORLD_CHROME?{executablePath:process.env.WORLD_CHROME}:{}),args:process.platform==='linux'?['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']:[]});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await page.addInitScript(version=>{window.__pad={id:'Steam Deck test pad',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.__pad]});localStorage.setItem('johansson-desktop-controller-v1',JSON.stringify({moveAxes:[2,3],lookAxes:[5,6],bindings:Array(17).fill(63),glyphs:'nintendo',controller:'Disconnected pad'}));window.johanssonDesktop={offline:true,inputProfile:'steam-deck',version,save:async()=>{window.__saved=true;},performance:async()=>[],checkUpdate:async()=>({available:false})};},require('../package.json').version);
  const frames=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const tap=async i=>{await page.evaluate(i=>{window.__pad.buttons[i]={pressed:true,value:1};},i);await frames();await page.evaluate(i=>{window.__pad.buttons[i]={pressed:false,value:0};},i);await frames();};
  const state=()=>page.evaluate(()=>window.johanssonDesktopUI.snapshot());
  const opened=Date.now();await page.goto(origin+'/johansson-town/?audit&cinematic=off');await page.waitForFunction(()=>document.getElementById('title')?.dataset.scene==='ready',null,{timeout:120000});console.log('TITLE_READY_MS',Date.now()-opened);
  assert.equal(await page.locator('#titleLogo .console-brand-icon').count(),0,'Launcher icon is absent from title/loading');
  await tap(9);await tap(5);await tap(5);assert.equal((await state()).page,'settings');await page.evaluate(()=>document.querySelector('[data-action=controls]').focus());await tap(0);assert.equal((await state()).page,'controls');
  const before=await page.evaluate(()=>document.activeElement.outerHTML);await tap(13);assert.notEqual(await page.evaluate(()=>document.activeElement.outerHTML),before,'Physical D-pad Down moves focus in Controls');
  assert.equal(await page.locator('[data-bind],[data-axes],[name=controller],[name=glyphs],[data-action=swap]').count(),0,'The shipped Deck profile has no remapping controls');
  assert.match(await page.locator('#desktopContent').textContent(),/left trackpad/i);assert.match(await page.locator('#desktopContent').textContent(),/right trackpad/i);
  assert.equal(await page.evaluate(()=>window.johanssonDesktopInput.read(navigator.getGamepads()).pad.id),'Steam Deck test pad','Stale saved controller selection is ignored');
  await page.locator('#desktopMenu [name=sensitivity]').focus();await tap(15);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('johansson-town-camera-v1')).sensitivity),1.1,'Camera tuning is retained');
  await tap(1);assert.equal((await state()).page,'settings');await tap(1);assert.equal((await state()).menu,false);
  await tap(9);await page.evaluate(()=>document.querySelector('[data-tab=settings]').click());await page.evaluate(()=>document.querySelector('[data-action=controls]').click());await page.evaluate(()=>document.querySelector('[data-action=reset]').click());await tap(9);
  await page.evaluate(()=>document.getElementById('enter').focus());await tap(0);await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__,null,{timeout:120000});await page.waitForFunction(()=>window.johanssonDesktopUI.snapshot().page==='help'&&window.johanssonDesktopUI.snapshot().menu);await page.screenshot({path:path.join(out,'help.png')});await tap(9);
  // Both physical controls on each side produce the same standard virtual axes.
  // Verify those axes against the actual running game, after any bedtime start.
  await page.evaluate(async()=>{await window.johanssonLinuxWorld.wake();if(window.__JOHANSSON_AUDIT__.player.room)await window.__JOHANSSON_AUDIT__.leave();});
  await page.waitForFunction(()=>{const audit=window.__JOHANSSON_AUDIT__;return !audit.player.room&&!audit.blocked.roomLoading&&!audit.blocked.catchingUp;});
  await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.setTime(720);window.__JOHANSSON_AUDIT__.teleport(-7,-15,0,0);});
  const pose=()=>page.evaluate(()=>({...window.__JOHANSSON_POSE__}));
  const setAxes=async axes=>{await page.evaluate(axes=>{window.__pad.axes=axes;},axes);await frames();await frames();};
  for(const source of ['stick','trackpad-emulated']){
   const before=await pose();await setAxes([0,-1,0,0]);await page.waitForTimeout(500);await setAxes([0,0,0,0]);const moved=await pose();
   assert.ok(Math.hypot(moved.x-before.x,moved.z-before.z)>.05,source+' left axes move the actual player');
   await setAxes([0,0,.85,.5]);await page.waitForTimeout(350);await setAxes([0,0,0,0]);const looked=await pose();
   assert.ok(Math.abs(looked.yaw-moved.yaw)>.03,source+' right axes turn the actual camera');assert.ok(Math.abs(looked.pitch-moved.pitch)>.01,source+' right axes tilt the actual camera');
   await tap(11);assert.ok(Math.abs((await pose()).pitch)<.01,'Right click centres the camera');
  }
  const saved=await page.evaluate(()=>localStorage.getItem('johansson-desktop-controller-v1'));assert.deepEqual(JSON.parse(saved).lookAxes,[5,6],'Legacy preferences are preserved without affecting Deck controls');
  await tap(3);await page.waitForFunction(()=>document.getElementById('activityTitle').textContent==='Bag');await page.evaluate(()=>document.querySelector('#activityActions button').focus());const first=await page.evaluate(()=>document.activeElement.textContent);await tap(15);assert.notEqual(await page.evaluate(()=>document.activeElement.textContent),first,'Right selects the next action in the actual Bag');await tap(1);assert.equal(await page.locator('#activity').isVisible(),false,'Back closes Bag');
  await tap(8);await page.waitForFunction(()=>!document.getElementById('directory').classList.contains('hidden'));await page.evaluate(()=>{const items=[...document.querySelectorAll('#directory button')].filter(e=>e.getClientRects().length);const first=items.find(e=>items.some(other=>other.getBoundingClientRect().top>e.getBoundingClientRect().bottom));first.focus();});const bookFocus=await page.evaluate(()=>document.activeElement.outerHTML);await tap(13);assert.notEqual(await page.evaluate(()=>document.activeElement.outerHTML),bookFocus,'Physical Down navigates the actual Town book');await tap(1);assert.equal((await state()).hudHidden,false,'Navigating a list never toggles the gameplay HUD');
  await tap(9);assert.equal((await state()).inputMode,'controller');assert.equal(await page.locator('#desktopMenu button').first().evaluate(e=>getComputedStyle(e).cursor),'none');await page.mouse.move(10,10);await page.mouse.move(100,100);assert.equal((await state()).inputMode,'pointer');await tap(1);assert.equal((await state()).inputMode,'controller');
  await tap(9);await page.evaluate(()=>document.querySelector('[data-tab=settings]').click());await page.evaluate(()=>document.querySelector('[data-action=controls]').click());await page.screenshot({path:path.join(out,'controls.png')});await tap(1);await tap(5);assert.equal((await state()).page,'pause');await tap(9);
  await page.screenshot({path:path.join(out,'island.png')});assert.deepEqual(errors,[]);console.log('CONTROL_REPAIR_OK',JSON.stringify(await state()));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1);});
