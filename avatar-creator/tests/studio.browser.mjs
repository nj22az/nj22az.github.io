// Run against the repository root served over HTTP; optional CHROMIUM_EXECUTABLE, STUDIO_TEST_URL (a server of your own)
// and STUDIO_VIEWPORTS (e.g. 1280x800,820x1180; 820 wide is an iPad with a touch screen and a share sheet).
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
 const sizes=process.env.STUDIO_VIEWPORTS?process.env.STUDIO_VIEWPORTS.split(',').map(v=>v.split('x').map(Number)):[[1280,800],[820,1180],[768,1024],[844,390],[390,844],[320,568]];
 for(const [width,height] of sizes){
  const touch=width===820,detailed=width===1280||width===820;
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true,hasTouch:touch});
  // An iPad: a share sheet that records what it was given and whether the tap was still active.
  if(touch)await context.addInitScript(()=>{window.__shared=[];
   Object.defineProperty(Navigator.prototype,'canShare',{configurable:true,value(data){return !!data?.files?.length;}});
   Object.defineProperty(Navigator.prototype,'share',{configurable:true,value(data){window.__shared.push({files:data.files.map(f=>({name:f.name,type:f.type,size:f.size})),active:navigator.userActivation?.isActive??null});return Promise.resolve();}});});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  try{
  await page.goto(base+'/avatar-creator/');
  await page.locator('.studio-tools').waitFor();
  await page.evaluate(()=>localStorage.setItem('johansson-player-recipe','game-sentinel'));
  // Templates live in the Files menu (a "new from template" action), keeping the phone toolbar to one row.
  await page.locator('.studio-files summary').click();
  await page.getByLabel('Starting template').selectOption('1');
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
  await page.getByLabel('Starting template').selectOption('0');assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'Johansson');
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
   // Turn: E and ] (15° right), the toolbar's turn left (30°), face the camera.
   const t0=await turnOf(0);await page.keyboard.press('e');assert.equal(await turnOf(0),wrap(t0-15));
   await page.keyboard.press(']');assert.equal(await turnOf(0),wrap(t0-30));
   await page.locator('.scene-toolbar [data-tool="turn-left"]').click();assert.equal(await turnOf(0),wrap(t0));
   await page.keyboard.press('q');assert.equal(await turnOf(0),wrap(t0+15));
   await idle();await page.locator('.scene-toolbar [data-tool="face-camera"]').click();
   assert.match(await page.locator('.scene-status').innerText(),/faces the camera/);assert.ok(Number.isFinite(await turnOf(0)));
   // A two-finger twist, clockwise by 30°, turns them 30° clockwise seen from above.
   await idle();const before=await turnOf(0);
   await page.evaluate(()=>{const c=document.querySelector('.scene-picture canvas'),r=c.getBoundingClientRect(),x=r.right-220,y=r.top+30;
    const ev=(type,id,px,py)=>c.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===41,clientX:px,clientY:py,bubbles:true}));
    ev('pointerdown',41,x,y);ev('pointerdown',42,x+120,y);ev('pointermove',42,x+120*Math.cos(Math.PI/12),y+120*Math.sin(Math.PI/12));ev('pointermove',42,x+120*Math.cos(Math.PI/6),y+120*Math.sin(Math.PI/6));ev('pointerup',42,x+120*Math.cos(Math.PI/6),y+120*Math.sin(Math.PI/6));ev('pointerup',41,x,y);});
   assert.ok(Math.abs(wrap((await turnOf(0))-(before-30)))<.6,'twist turned '+before+' → '+(await turnOf(0)));
   // Drag moves the character (stopped by walls and furniture as before); a tap on empty space deselects.
   await idle();const box=await page.locator('.scene-selection').boundingBox(),start=await scene();
   await page.mouse.move(box.x+box.width/2,box.y+box.height*.6);await page.mouse.down();await page.mouse.move(box.x+box.width/2+60,box.y+box.height*.6+25,{steps:6});await page.mouse.up();await idle();
   const moved=await scene(),who=await page.locator('.scene-chip[data-selected]').getAttribute('data-id'),i=moved.actors.findIndex(a=>a.id===who);
   assert.ok(i>=0&&Math.hypot(moved.actors[i].x-start.actors[i].x,moved.actors[i].z-start.actors[i].z)>.05,'dragging moved the character');
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
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}

