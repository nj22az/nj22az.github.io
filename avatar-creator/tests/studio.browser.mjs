// Run against the repository root served over HTTP; optional CHROMIUM_EXECUTABLE, STUDIO_TEST_URL (a server of your own)
// and STUDIO_VIEWPORTS (e.g. 1280x800,820x1180; 820 wide is an iPad with a touch screen and a share sheet).
// STUDIO_SNAP_ONLY=1 runs only the snap-into-place checks; STUDIO_SNAP_SHOTS=<folder> keeps small pictures of them.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const {createServer}=await import('node:http');
const {readFile,stat}=await import('node:fs/promises');
const {fileURLToPath}=await import('node:url');
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=createServer(async(req,res)=>{try{
 let path=new URL(req.url,'http://localhost').pathname;if(path.endsWith('/'))path+='index.html';
 const file=root+path.slice(1);const info=await stat(file);assert.ok(info.isFile());
 res.setHeader('Content-Type',(path.endsWith('.js')||path.endsWith('.mjs'))?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.html')?'text/html':'application/octet-stream');res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=process.env.STUDIO_TEST_URL||`http://127.0.0.1:${server.address().port}`;
const errors=[];
const wrap=d=>{const w=((d%360)+540)%360-180;return w===-180?180:Math.round(w*10)/10;};
try{
 const sizes=process.env.STUDIO_SNAP_ONLY?[]:process.env.STUDIO_VIEWPORTS?process.env.STUDIO_VIEWPORTS.split(',').map(v=>v.split('x').map(Number)):[[1280,800],[820,1180],[768,1024],[844,390],[390,844],[320,568]];
 for(const [width,height] of sizes){
  const touch=width===820,detailed=width===1280||width===820;
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true,hasTouch:touch});
  // An iPad: a share sheet that records what it was given and whether the tap was still active.
  if(touch)await context.addInitScript(()=>{window.__shared=[];
   Object.defineProperty(Navigator.prototype,'canShare',{configurable:true,value(data){return !!data?.files?.length;}});
   Object.defineProperty(Navigator.prototype,'share',{configurable:true,value(data){window.__shared.push({files:data.files.map(f=>({name:f.name,type:f.type,size:f.size})),active:navigator.userActivation?.isActive??null});return Promise.resolve();}});});
  // Software rendering (swiftshader) needs time: World's maker and a location can keep the page busy for a minute.
  const page=await context.newPage();page.setDefaultTimeout(180000);page.on('pageerror',e=>errors.push(e.message));
  try{
  await page.goto(base+'/avatar-creator/');
  await page.locator('.studio-tools').waitFor();
  await page.evaluate(()=>localStorage.setItem('johansson-player-recipe','game-sentinel'));
  // Templates live in the Files menu (a "new from template" action), keeping the phone toolbar to one row.
  await page.locator('.studio-files summary').click();
  // Templates by name: the picker lists the original Thuận design, then World's residents (studio.js).
  await page.getByLabel('Starting template').selectOption({label:'Thuận · original'});
  assert.equal(await page.locator('.studio-files').evaluate(e=>e.open),false,'choosing a template closes the menu');
  await page.getByRole('textbox',{name:'Name',exact:true}).fill('My character');
  await page.locator('.studio-tools').getByRole('button',{name:'Save character',exact:true}).click();
  assert.match(await page.locator('.studio-status').innerText(),/saved/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('johansson-player-recipe')),'game-sentinel');
  await page.reload();await page.locator('.studio-tools').waitFor();
  assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'My character');
  await page.getByRole('tab',{name:'Hair',exact:true}).click();
  await page.getByRole('button',{name:'Crop',exact:true}).click();
  await page.getByRole('button',{name:'Reset feature',exact:true}).click();
  await page.locator('.studio-tools').getByRole('button',{name:'Save character',exact:true}).click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('nj-avatar-studio-v1')).recipe.hair.style),'braids');
  assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'My character');
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  await page.locator('.studio-tools').getByRole('button',{name:'Save character',exact:true}).click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('nj-avatar-studio-v1')).recipe.hair.style),'crop');
  await page.getByRole('button',{name:'Reset feature',exact:true}).click();
  const before=await page.evaluate(()=>localStorage.getItem('nj-avatar-studio-v1'));
  await page.locator('.studio-preview summary').click();
  await page.getByLabel('View',{exact:true}).selectOption('left');
  await page.getByLabel('Framing',{exact:true}).selectOption('face');
  await page.getByLabel('Lighting',{exact:true}).selectOption('neutral');
  await page.getByLabel('Preview expression',{exact:true}).selectOption('happy');
  assert.ok(await page.getByLabel('Preview expression',{exact:true}).isVisible(),'Expression controls available at every viewport');
  assert.equal(await page.evaluate(()=>localStorage.getItem('nj-avatar-studio-v1')),before,'Preview does not write a design');
  await page.getByLabel('View',{exact:true}).selectOption('front');
  await page.getByLabel('Framing',{exact:true}).selectOption('auto');
  await page.getByLabel('Preview expression',{exact:true}).selectOption('auto');
  await page.locator('.studio-preview summary').click();
  const [png]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export PNG',exact:true}).click()]);
  assert.equal(png.suggestedFilename(),'My-character.png');
  const path=await png.path();
  const {PNG}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/pngjs':'pngjs');
  const {readFile,copyFile}=await import('node:fs/promises');if(width===1280)await copyFile(path,'/tmp/avatar-studio-export.png');const image=PNG.sync.read(await readFile(path));
  assert.equal(image.width,1024);assert.equal(image.height,1024);
  let opaque=0;for(let i=3;i<image.data.length;i+=4)if(image.data[i]>128)opaque++;
  assert.ok(opaque>10000&&opaque<1024*1024*.8,'PNG contains a visible character and transparent background');
  assert.equal(image.data[3],0); // transparent corner
  await page.locator('.studio-files summary').click();
  const [design]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download design',exact:true}).click()]);
  const designPath=await design.path();const json=JSON.parse(await readFile(designPath,'utf8'));assert.equal(json.recipe.hair.style,'braids');
  await page.locator('.studio-files summary').click();
  await page.getByLabel('Starting template').selectOption({label:'Johansson'});assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'Johansson');
  await page.locator('input[type=file]').setInputFiles(designPath);await page.waitForFunction(()=>document.querySelector('.shm-name').value==='My character');
  assert.equal(await page.evaluate(()=>localStorage.getItem('johansson-player-recipe')),'game-sentinel');
  assert.ok(await page.locator('.studio-tools').evaluate(el=>[...el.querySelectorAll('button,select,summary')].filter(b=>b.getClientRects().length).every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height>=44;})),'Toolbar fits and keeps touch targets');
  await page.getByRole('tab',{name:'Mouth',exact:true}).click();
  assert.ok(await page.locator('.shm-body').evaluate(el=>{const body=el.getBoundingClientRect(),pages=document.querySelector('.shm-pages').getBoundingClientRect(),palette=document.querySelector('.shm-palette').getBoundingClientRect();return body.height>40&&body.top>=pages.bottom-1&&body.bottom<=palette.top+1;}),'Choices occupy their own scroll track between tabs and palette');
  assert.ok(await page.locator('.shm-stage').evaluate(el=>{const stage=el.getBoundingClientRect(),panel=document.querySelector('.shm-panel').getBoundingClientRect();return stage.height>80&&(stage.right<=panel.left+1||stage.bottom<=panel.top+1); }),'Preview and inspector do not overlap');
  assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'No horizontal page overflow');
  if(width===1280)await page.screenshot({path:'/tmp/avatar-studio-desktop.png'});
  if(width===390)await page.screenshot({path:'/tmp/avatar-studio-phone.png'});

  await page.getByRole('button',{name:'Use in scene',exact:true}).click();
  await page.locator('.scene-workspace').waitFor();
  const scene=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nj-studio-scene-v1')));
  const idle=()=>page.waitForFunction(()=>document.querySelector('.scene-picture canvas').getAttribute('aria-busy')==='false',{},{timeout:90000});
  const turnOf=async i=>(await scene()).actors[i].turn;
  assert.equal((await scene()).actors.length,1);
  await page.getByRole('button',{name:'1. Choose location',exact:true}).click();
  await page.getByRole('button',{name:'Sakura Shōten',exact:true}).click();
  await page.getByRole('button',{name:'Next: Add characters',exact:true}).click();
  await page.getByLabel('Town resident',{exact:true}).selectOption('Thuan');
  await page.getByRole('button',{name:'Add resident',exact:true}).click();
  await idle();
  // The cast strip: one chip per character with their face; the one just added is selected, marked once.
  const chips=page.locator('.scene-chip');assert.equal(await chips.count(),2);
  await page.waitForFunction(()=>[...document.querySelectorAll('.scene-chip img')].filter(i=>i.complete&&i.naturalWidth>0).length===2,{},{timeout:30000});
  assert.deepEqual(await page.locator('.scene-chip[data-selected] .scene-chip-name').allInnerTexts(),['Thuận']);
  assert.equal(await page.locator('.scene-chip-pick[aria-pressed=true]').count(),1);
  await page.getByRole('button',{name:'Next: Pose & position',exact:true}).click();
  // Pose and expression: labelled buttons from World's lists, in groups.
  assert.ok(await page.locator('[data-picker="pose"] h4').count()>=3,'pose groups');
  await page.locator('[data-picker="pose"] [data-value="Cheer"]').click();
  await page.locator('[data-picker="expression"] [data-value="surprised"]').click();
  assert.equal(await page.locator('[data-picker="pose"] [aria-pressed=true]').getAttribute('data-value'),'Cheer');
  assert.deepEqual([(await scene()).actors[1].pose,(await scene()).actors[1].expression],['Cheer','surprised']);
  await idle();
  if(detailed){
   const frame=await page.locator('.scene-frame').boundingBox();
   // Select with a chip; the toolbar appears beside them, inside the picture.
   await chips.nth(0).locator('.scene-chip-pick').click();await idle();
   const first=(await scene()).actors[0].name;assert.deepEqual(await page.locator('.scene-chip[data-selected] .scene-chip-name').allInnerTexts(),[first]);
   await page.locator('.scene-toolbar').waitFor();
   const bar=await page.locator('.scene-toolbar').boundingBox();
   assert.ok(bar.x>=frame.x&&bar.y>=frame.y&&bar.x+bar.width<=frame.x+frame.width+.5&&bar.y+bar.height<=frame.y+frame.height+.5,'toolbar stays inside the picture');
   // Turn in stops around facing the camera: E and ] 15° right, the toolbar's turn left to the next 45° stop, Q 15° left.
   await idle();await page.locator('.scene-toolbar [data-tool="face-camera"]').click();
   assert.match(await page.locator('.scene-status').innerText(),/faces the camera/);const z0=await turnOf(0);assert.ok(Number.isFinite(z0));
   await page.keyboard.press('e');assert.equal(await turnOf(0),wrap(z0-15));
   await page.keyboard.press(']');assert.equal(await turnOf(0),wrap(z0-30));
   await page.locator('.scene-toolbar [data-tool="turn-left"]').click();assert.equal(await turnOf(0),wrap(z0),'the turn button goes to the next 45° stop');
   await page.keyboard.press('q');assert.equal(await turnOf(0),wrap(z0+15));
   // A two-finger twist, clockwise by 30°: on a 15° stop around the camera (or facing Thuận); without snapping exactly 30°.
   const twist=()=>page.evaluate(()=>{const c=document.querySelector('.scene-picture canvas'),r=c.getBoundingClientRect(),x=r.right-220,y=r.top+30;
    const ev=(type,id,px,py)=>c.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===41,clientX:px,clientY:py,bubbles:true}));
    ev('pointerdown',41,x,y);ev('pointerdown',42,x+120,y);ev('pointermove',42,x+120*Math.cos(Math.PI/12),y+120*Math.sin(Math.PI/12));ev('pointermove',42,x+120*Math.cos(Math.PI/6),y+120*Math.sin(Math.PI/6));ev('pointerup',42,x+120*Math.cos(Math.PI/6),y+120*Math.sin(Math.PI/6));ev('pointerup',41,x,y);});
   await idle();let before=await turnOf(0);await twist();const snapped=await turnOf(0);
   const towardThuan=await page.evaluate(()=>{const ids=JSON.parse(localStorage.getItem('nj-studio-scene-v1')).actors.map(a=>a.id),[a,b]=ids.map(id=>window.__studioSnap.feet(id)?.world);return a&&b?Math.atan2(b[0]-a[0],b[2]-a[2])*180/Math.PI:NaN;});
   const offStop=Math.abs(wrap(snapped-z0))%15;assert.ok(Math.min(offStop,15-offStop)<.15||Math.abs(wrap(snapped-towardThuan))<.15,'twist '+before+' → '+snapped+' lands on a stop');
   await page.getByLabel('Snap into place',{exact:true}).uncheck();await idle();before=await turnOf(0);await twist();
   assert.ok(Math.abs(wrap((await turnOf(0))-(before-30)))<.6,'without snapping the twist turned '+before+' → '+(await turnOf(0)));
   await page.getByLabel('Snap into place',{exact:true}).check();await page.evaluate(()=>scrollTo(0,0));   // the switch is lower down the page
   // Drag with Alt (Option): placed freely, exactly where dropped; a tap on empty space deselects.
   // Aimed through the test hook at open floor 0.6 m away, so the drop lands exactly there (to the centimetre).
   await idle();const start=await scene(),who=await page.locator('.scene-chip[data-selected]').getAttribute('data-id'),i=start.actors.findIndex(a=>a.id===who);
   const open=await page.evaluate(()=>{const s=window.__studioSnap,f=s.feet().world;for(const [dx,dz] of [[.6,0],[-.6,0],[0,.6],[0,-.6],[.45,.45],[-.45,.45],[.45,-.45],[-.45,-.45]]){const c=s.check(f[0]+dx,f[2]+dz);if(c.free&&c.seen)return [f[0]+dx,f[1],f[2]+dz];}return null;});
   assert.ok(i>=0&&open,'open floor beside them');const grip=await page.evaluate(()=>window.__studioSnap.grip());
   await page.keyboard.down('Alt');await page.mouse.move(grip.x,grip.y);await page.mouse.down();const end=await page.evaluate(p=>window.__studioSnap.aim(p),open);
   await page.mouse.move(end.x,end.y,{steps:6});await page.mouse.up();await page.keyboard.up('Alt');await idle();
   const moved=await scene(),o=await page.evaluate(()=>window.__studioSnap.origin()),m=moved.actors[i];
   assert.ok(Math.hypot(m.x-start.actors[i].x,m.z-start.actors[i].z)>=.25,'dragging moved the character');
   assert.ok(Math.hypot(o[0]+m.x-open[0],o[2]+m.z-open[2])<=.02,'with Alt they land where dropped');
   const empty=await page.evaluate(()=>{const r=document.querySelector('.scene-frame').getBoundingClientRect();return [[r.right-15,r.top+15],[r.left+15,r.top+15],[r.left+r.width/2,r.top+15],[r.right-15,r.top+60]].find(([x,y])=>document.elementFromPoint(x,y)?.tagName==='CANVAS');});
   await page.mouse.click(empty[0],empty[1]);
   assert.equal(await page.locator('.scene-chip[data-selected]').count(),0,'a tap on empty space deselects');assert.ok(await page.locator('.scene-toolbar').isHidden());
   // Sit down (the nearest free seat, or the ground) and stand up again.
   await chips.nth(0).locator('.scene-chip-pick').click();await idle();
   await page.locator('.scene-toolbar [data-tool="sit"]').click();assert.equal((await scene()).actors[0].pose,'Sit');assert.match(await page.locator('.scene-status').innerText(),/sits/);
   await idle();await page.getByRole('button',{name:'Stand up',exact:true}).click();assert.equal((await scene()).actors[0].pose,'Idle');assert.equal((await scene()).actors[0].seat,'');
   // Remove with the chip's ✕, then Undo; Delete removes the selected one and Ctrl+Z brings them back.
   await idle();const thuan=(await scene()).actors[1];
   await page.getByRole('button',{name:'Remove Thuận',exact:true}).click();
   assert.deepEqual((await scene()).actors.map(a=>a.name),[first]);assert.match(await page.locator('.scene-toast').innerText(),/Thuận removed/);
   await page.locator('.scene-toast').getByRole('button',{name:'Undo',exact:true}).click();
   const back=(await scene()).actors[1];assert.deepEqual([back.name,back.pose,back.expression,back.x,back.z],[thuan.name,thuan.pose,thuan.expression,thuan.x,thuan.z]);assert.ok(await page.locator('.scene-toast').isHidden());
   await chips.nth(0).locator('.scene-chip-pick').click();await page.keyboard.press('Delete');assert.deepEqual((await scene()).actors.map(a=>a.name),['Thuận']);
   await page.keyboard.press('Control+z');assert.deepEqual((await scene()).actors.map(a=>a.name),[first,'Thuận']);
   await chips.nth(1).locator('.scene-chip-pick').click();await idle();
  }
  await page.getByLabel('Near / far',{exact:true}).evaluate(el=>{el.value='.8';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.getByLabel('Camera turn',{exact:true}).evaluate(el=>{el.value='14';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await idle();
  const sceneState=await scene();assert.equal(sceneState.version,2);assert.equal(sceneState.camera.orbit,14);assert.ok(sceneState.actors.every(a=>Number.isFinite(a.z)));
  if(!await page.locator('.scene-camera-box').evaluate(d=>d.open))await page.locator('.scene-camera-box summary').click();
  await page.getByRole('button',{name:'Reset camera',exact:true}).click();
  await page.getByRole('button',{name:'Next: Add text',exact:true}).click();
  await page.getByLabel('Selected character’s speech',{exact:true}).fill('The ferry is late!');
  await page.getByRole('button',{name:'Next: Export',exact:true}).click();
  await page.locator('[data-choice="format"] [data-value="square"]').click();
  await idle();
  // Save picture: made ahead of time, then a real download link (desktop) or the share sheet inside the tap (iPad).
  const saveScene=page.locator('[data-save="scene"]');
  await page.waitForFunction(()=>document.querySelector('[data-save="scene"]').hasAttribute('href'),{},{timeout:30000});
  assert.match(await saveScene.getAttribute('href'),/^blob:/);assert.match(await saveScene.getAttribute('download'),/\.png$/);
  if(touch){
   await saveScene.click();const shared=await page.evaluate(()=>window.__shared.splice(0));
   assert.equal(shared.length,1);assert.equal(shared[0].files[0].type,'image/png');assert.ok(shared[0].files[0].size>20000);assert.equal(shared[0].active,true,'share() ran inside the tap');
   assert.match(await page.locator('[data-status="scene"]').innerText(),/Photos/);
  }else{
   const [scenePNG]=await Promise.all([page.waitForEvent('download'),saveScene.click()]);
   const sceneImage=PNG.sync.read(await readFile(await scenePNG.path()));assert.equal(sceneImage.width,1200);assert.equal(sceneImage.height,1200);
  }
  // The full-screen preview to press and hold.
  await page.getByRole('button',{name:'Preview',exact:true}).click();
  await page.locator('.studio-sheet').waitFor();
  await page.waitForFunction(()=>{const i=document.querySelector('.studio-sheet-image');return i.complete&&i.naturalWidth===1200&&i.naturalHeight===1200;});
  assert.ok(await page.locator('.studio-sheet-image').evaluate(i=>{const r=i.getBoundingClientRect();return r.width>100&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&getComputedStyle(i).userSelect!=='none';}),'preview fills the screen and can be selected');
  assert.ok((await page.evaluate(()=>fetch('/avatar-creator/scene.css').then(r=>r.text()))).match(/\.studio-sheet-image\{[^}]*-webkit-touch-callout:default/),'press and hold is allowed on the preview');
  assert.ok((await page.locator('.studio-sheet-tip').innerText()).length>10);
  await page.keyboard.press('Escape');assert.ok(await page.locator('.studio-sheet').isHidden());
  await page.getByRole('button',{name:'Add panel to comic',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-panel-count]').textContent==='1');
  await page.getByRole('button',{name:'4. Add text',exact:true}).click();
  await page.getByLabel('Selected character’s speech',{exact:true}).fill('Let us make a comic.');
  await page.getByRole('button',{name:'5. Export',exact:true}).click();
  await page.getByRole('button',{name:'Add panel to comic',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-panel-count]').textContent==='2');
  await page.getByRole('button',{name:'Make comic',exact:true}).click();
  assert.equal(await page.locator('.scene-panels figure').count(),2);
  // Remove a panel and undo it.
  await page.locator('.scene-panels figure').nth(1).getByRole('button',{name:'Remove',exact:true}).click();
  assert.equal(await page.locator('.scene-panels figure').count(),1);
  await page.locator('.scene-toast').getByRole('button',{name:'Undo',exact:true}).click();assert.equal(await page.locator('.scene-panels figure').count(),2);
  const saveComic=page.locator('[data-save="comic"]');
  await page.waitForFunction(()=>document.querySelector('[data-save="comic"]').hasAttribute('href'),{},{timeout:30000});
  if(touch){
   await saveComic.click();const shared=await page.evaluate(()=>window.__shared.splice(0));
   assert.equal(shared.length,1);assert.equal(shared[0].files[0].name,'johansson-studio-comic.png');assert.equal(shared[0].active,true);
  }else{
   const [comicPNG]=await Promise.all([page.waitForEvent('download'),saveComic.click()]);
   assert.equal(PNG.sync.read(await readFile(await comicPNG.path())).width,1200);
  }
  await page.getByRole('button',{name:'Preview comic',exact:true}).click();
  await page.waitForFunction(()=>{const i=document.querySelector('.studio-sheet-image');return !document.querySelector('.studio-sheet').hidden&&i.complete&&i.naturalWidth===1200;});
  await page.getByRole('button',{name:'Close',exact:true}).click();assert.ok(await page.locator('.studio-sheet').isHidden());
  let projectPath='';
  if(touch){
   await page.getByRole('button',{name:'Download project',exact:true}).click();const shared=await page.evaluate(()=>window.__shared.splice(0));
   assert.equal(shared[0].files[0].type,'application/json');assert.equal(shared[0].active,true);
  }else{
   const [project]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download project',exact:true}).click()]);
   projectPath=await project.path();const projectJSON=JSON.parse(await readFile(projectPath,'utf8'));assert.equal(projectJSON.scene.actors.length,2);assert.equal(projectJSON.panels.length,2);
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('johansson-player-recipe')),'game-sentinel');
  if(projectPath){
   await page.reload();await page.locator('.studio-tools').waitFor();
   await page.getByRole('button',{name:'Build scene',exact:true}).click();
   assert.equal((await scene()).actors.length,2);
   await page.locator('[data-project-input]').setInputFiles(projectPath);
   await page.waitForFunction(()=>document.querySelector('[data-panel-count]').textContent==='2');
   await page.getByRole('button',{name:'Make comic',exact:true}).click();
  }
  assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'Scene workspace fits the viewport');
  }catch(error){if(process.env.STUDIO_FAIL_SHOT)await page.screenshot({path:process.env.STUDIO_FAIL_SHOT,type:'jpeg',quality:50}).catch(()=>{});error.message+=` (at ${width}×${height}; page errors: ${errors.join(' | ')||'none'})`;throw error;}
  await context.close();console.log(`PASS ${width}×${height}${touch?' (touch, share sheet)':''}: templates, PNG pixels, design import, scene controls${detailed?' (select, turn, twist, drag, sit, remove and undo)':''}, saving, preview, layout`);
 }

 // ---- Snap into place (scene-snap.mjs): seats, counters and people catch a dragged character; at the iPad's size with
 // touch and at 1280 with a mouse. The page's test hook (window.__studioSnap, only under webdriver) gives the targets. ----
 const shots=process.env.STUDIO_SNAP_SHOTS||'';
 for(const [width,height,touch] of [[1180,820,true],[1280,800,false]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:touch});const page=await context.newPage();page.setDefaultTimeout(180000);page.on('pageerror',e=>errors.push(e.message));
  const pointerType=touch?'touch':'mouse',tag=`${width}x${height}`;
  const scene=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nj-studio-scene-v1')));
  const idle=()=>page.waitForFunction(()=>document.querySelector('.scene-picture canvas').getAttribute('aria-busy')==='false',{},{timeout:180000});
  const hook=(name,...args)=>page.evaluate(([name,args])=>window.__studioSnap[name](...args),[name,args]);
  const shot=async name=>{if(shots)await page.locator('.scene-frame').screenshot({path:`${shots}/${tag}-${name}.jpg`,type:'jpeg',quality:50,scale:'css'});};
  const stage=async(location,people,camera={orbit:0,elevation:0,zoom:1})=>{
   await page.evaluate(async({location,people,camera})=>{const {CAST_RECIPES,ORIGINAL_THUAN_RECIPE}=await import('/johansson-town/src/avatars/cast.js');
    localStorage.setItem('nj-studio-scene-v1',JSON.stringify({version:2,location,format:'landscape',style:'photo',top:'',bottom:'',camera,actors:people.map(([name,x,z,extra],i)=>({id:'actor-'+i,name,recipe:name==='Thuận'?ORIGINAL_THUAN_RECIPE:CAST_RECIPES.Johansson,x,z,size:1,seat:'',turn:0,pose:'Idle',expression:'smile',speech:'',...extra}))}));},{location,people,camera});
   await page.reload();await page.locator('.studio-tools').waitFor();await page.getByRole('button',{name:'Build scene',exact:true}).click();
   await page.getByRole('button',{name:'3. Pose & position',exact:true}).click();await idle();};
  const pick=async i=>{await page.locator('.scene-chip').nth(i).locator('.scene-chip-pick').click();await idle();};
  // Press the selected character's own body, move so the feet go to `to` ([x,y,z] in the town), optionally wiggle, let go.
  const drag=async(to,{hold=false,wiggle=0}={})=>{const r=await page.evaluate(({to,pointerType,hold,wiggle})=>{const c=document.querySelector('.scene-picture canvas'),s=window.__studioSnap,start=s.grip();
    const ev=(type,x,y)=>c.dispatchEvent(new PointerEvent(type,{pointerId:9,pointerType,isPrimary:true,clientX:x,clientY:y,bubbles:true,button:0,buttons:type==='pointerup'?0:1}));
    ev('pointerdown',start.x,start.y);const r=c.getBoundingClientRect(),end=Array.isArray(to)?s.aim(to):{x:r.left+to.fx*r.width,y:r.top+to.fy*r.height};for(let i=1;i<=14;i++)ev('pointermove',start.x+(end.x-start.x)*i/14,start.y+(end.y-start.y)*i/14);
    const locked=document.querySelector('.scene-selection').hasAttribute('data-locked'),draws=s.draws;
    for(const [dx,dy] of wiggle?[[wiggle,0],[-wiggle,0],[0,wiggle],[0,-wiggle],[0,0]]:[])ev('pointermove',end.x+dx,end.y+dy);
    const wiggled=s.draws-draws;window.__end=end;if(!hold)ev('pointerup',end.x,end.y);return {locked,wiggled};},{to,pointerType,hold,wiggle});if(!hold)await idle();return r;};
  const release=async()=>{await page.evaluate(pointerType=>{const e=window.__end;document.querySelector('.scene-picture canvas').dispatchEvent(new PointerEvent('pointerup',{pointerId:9,pointerType,isPrimary:true,clientX:e.x,clientY:e.y,bubbles:true}));},pointerType);await idle();};
  const where=async i=>{const a=(await scene()).actors[i],o=await hook('origin');return {...a,wx:o[0]+a.x,wz:o[2]+a.z};};
  try{
   await page.goto(base+'/avatar-creator/');await page.locator('.studio-tools').waitFor();
   // Sato Ramen: onto stool 3 (caught while dragging, nothing redrawn by a wiggle), sits facing the counter.
   await stage('sato-ramen',[['Johansson',0,0],['Thuận',-1.3,.5]]);await pick(0);
   const stools=(await hook('targets')).filter(t=>t.kind==='seat'&&/ramen counter/.test(t.label)&&t.ok);assert.ok(stools.length>=2,'stools on the picture');
   const third=stools.find(t=>t.label.endsWith(' 3'))||stools[0];
   const caught=await drag(third.point,{hold:true,wiggle:10});assert.ok(caught.locked,'the outline is solid while a stool has them');assert.equal(caught.wiggled,0,'a wiggle while caught redraws nothing');
   assert.ok(await page.locator('.scene-selection[data-locked]').evaluate(e=>getComputedStyle(e).borderTopStyle==='solid'));await release();
   let a=await where(0);assert.equal(a.seat,third.id);assert.ok(!/^seat-\d/.test(a.seat),'saved by its key');assert.equal(a.pose,'Sit');assert.equal(a.turn,third.turn);
   assert.match(await page.locator('.scene-toast').innerText(),/Johansson sits at the ramen counter/);await shot('sato-stool');
   // A seated pose goes with them to the next stool; dragged off, they stand as they stood before, facing the way they sat.
   await page.locator('[data-picker="pose"] [data-value="SitDrink"]').click();await idle();
   const next=(await hook('targets')).find(t=>t.kind==='seat'&&/ramen counter/.test(t.label)&&t.ok&&t.id!==third.id);await drag(next.point);
   a=await where(0);assert.deepEqual([a.seat,a.pose,a.turn],[next.id,'SitDrink',next.turn],'SitDrink on the next stool');
   const feet=(await hook('feet')).world;await drag([feet[0],feet[1],feet[2]+1]);
   a=await where(0);assert.deepEqual([a.seat,a.pose,a.turn],['','Idle',next.turn],'off the stool: standing, facing as they sat');assert.match(await page.locator('.scene-toast').innerText(),/stands up/);
   // Someone else's stool is never taken, and nobody ends up inside anybody.
   await pick(1);await page.getByLabel('Use furniture',{exact:true}).selectOption(third.id);await idle();await pick(0);
   assert.ok(await page.locator(`[data-field="seat"] option[value="${third.id}"]`).evaluate(o=>o.disabled&&/\(Thuận\)/.test(o.textContent)),'the menu shows whose seat it is');
   await drag(third.point);a=await where(0);const thuan=await where(1);assert.equal(thuan.seat,third.id);assert.notEqual(a.seat,third.id);
   assert.ok(Math.hypot(a.wx-third.point[0],a.wz-third.point[2])>=.46-1e-6,'not inside the seated Thuận');
   // Reloading keeps every place, seat, turn and pose.
   const saved=(await scene()).actors.map(x=>[x.x,x.z,x.seat,x.turn,x.pose]);await page.reload();await page.locator('.studio-tools').waitFor();
   await page.getByRole('button',{name:'Build scene',exact:true}).click();await idle();assert.deepEqual((await scene()).actors.map(x=>[x.x,x.z,x.seat,x.turn,x.pose]),saved,'a reload changes nothing');
   // Sakura Shōten, the camera turned to the till: Thuận steps up to it from both sides, 0.26 m off its face, facing it.
   await stage('sakura',[['Thuận',6.208,1.198]],{orbit:180,elevation:8,zoom:.75});await pick(0);
   const till=(await hook('targets')).filter(t=>t.kind==='edge'&&Math.abs(Math.abs(t.line.b[1]-t.line.a[1])-3.32)<.01);assert.equal(till.length,2,'both long faces of the till');
   for(const e of till){const zs=[];for(let z=e.line.a[1];z<=e.line.b[1]+1e-9;z+=.1){const c=await hook('check',e.line.a[0],z);if(c.free&&c.seen)zs.push(z);}
    assert.ok(zs.length,e.id+' can be seen somewhere');const before=await where(0),z=zs[Math.floor(zs.length/2)];
    await drag([e.line.a[0]+e.normal[0]*.12,0,z]);a=await where(0);
    assert.ok(Math.abs(a.wx-e.line.a[0])<=.01,e.id+': on the standing line ('+a.wx.toFixed(3)+')');assert.ok(Math.abs(wrap(a.turn-e.turn))<=1,e.id+': facing the till');
    assert.match(await page.locator('.scene-status').innerText(),/stands at the counter/);await shot('till-'+(e.normal[0]>0?'staff':'customer'));
    await page.keyboard.press('Control+z');await idle();a=await where(0);assert.deepEqual([a.x,a.z,a.turn],[before.x,before.z,before.turn],'Ctrl+Z puts them back');}
   // In front of Thuận, facing her; beside her, facing the way she faces.
   await stage('sakura',[['Johansson',0,0],['Thuận',0,-.8]]);await pick(0);
   const marks=(await hook('targets')).filter(t=>t.kind==='person'&&t.other==='actor-1'&&t.ok);
   for(const kind of ['talk','beside']){const m=marks.find(t=>kind==='talk'?t.mark==='talk':t.mark!=='talk');assert.ok(m,kind+' is offered');
    await drag(m.point);a=await where(0);assert.ok(Math.hypot(a.wx-m.point[0],a.wz-m.point[2])<.011,kind+': on the mark');assert.equal(a.turn,m.turn);
    assert.match(await page.locator('.scene-status').innerText(),kind==='talk'?/Johansson faces Thuận/:/Johansson stands beside Thuận/);await shot('sakura-'+kind);}
   // Town Hall: a scene saved with an old walk-order seat id loads seated and is saved again with the key; drags over the
   // walls never leave anyone where the camera cannot see their head.
   await stage('town-hall',[['Johansson',0,0,{seat:'seat-0',pose:'Sit'}],['Thuận',.8,.4]]);a=await where(0);
   assert.ok(a.seat&&a.seat!=='seat-0','seat-0 became '+a.seat);assert.equal(a.pose,'Sit');await shot('town-hall-old-save');
   await pick(1);
   for(let k=0;k<12;k++){await drag({fx:.08+.84*((k*5)%12)/11,fy:k%3===0?.35:k%3===1?.6:.92});a=await where(1);
    const c=await hook('check',a.wx,a.wz);assert.ok(c.free&&c.seen,'drag '+k+' landed free and seen at '+a.wx.toFixed(2)+','+a.wz.toFixed(2));}
   // The switch: labelled, at least 44 px tall; the toolbar stays in the picture; no sideways scrolling.
   const sw=await page.getByLabel('Snap into place',{exact:true}).evaluate(i=>i.closest('label').getBoundingClientRect().height);assert.ok(sw>=44,'switch '+sw+' px tall');
   const frame=await page.locator('.scene-frame').boundingBox(),bar=await page.locator('.scene-toolbar').boundingBox();
   if(bar)assert.ok(bar.x>=frame.x-.5&&bar.y>=frame.y-.5&&bar.x+bar.width<=frame.x+frame.width+.5&&bar.y+bar.height<=frame.y+frame.height+.5,'toolbar inside the picture');
   assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'no sideways scrolling');
  }catch(error){if(process.env.STUDIO_FAIL_SHOT)await page.screenshot({path:process.env.STUDIO_FAIL_SHOT,type:'jpeg',quality:50}).catch(()=>{});error.message+=` (snap, at ${width}×${height}; page errors: ${errors.join(' | ')||'none'})`;throw error;}
  await context.close();console.log(`PASS ${width}×${height}${touch?' (touch)':' (mouse)'}: snap into place (stools, seated pose, standing up, taken seat, reload, both sides of the till, talk and beside, old seat ids, no unseen drops, switch)`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}

