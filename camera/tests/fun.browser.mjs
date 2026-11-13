// The fun round of 12 November 2026, as a fresh camera has it: sliders are a setting (off), steppers and presets stand
// in for them, the frames are the sixteen drawn ones, the Game Room has three games.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS;
if(shots)await mkdir(shots,{recursive:true});
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce',permissions:['camera']});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // Nothing stored but that the camera was used before (so it starts at once) and the printer is off.
 await page.addInitScript(()=>{if(!localStorage.getItem('office-pocket-camera'))localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false,sound:false,kept:true}));});
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 const shown=sel=>page.$$eval(sel,els=>els.filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';}).map(e=>e.id||e.className));

 await check('a fresh camera has no sliders: the setting is off and no fine control shows',async()=>{
  await page.click('#shutter');await page.waitForFunction(()=>document.querySelector('#shutter')?.dataset.kind==='shoot');
  assert.equal(await page.$eval('#app',el=>el.dataset.sliders),'off');
  assert.deepEqual(await shown('#camera input[type=range]'),[]);
  assert.deepEqual(await shown('#camera .fine-control'),[]);
 });
 await check('every icon asked for on the page is drawn',async()=>{
  const missing=await page.$$eval('use',uses=>uses.map(u=>u.getAttribute('href')).filter(h=>h?.startsWith('#')&&!document.querySelector(h)));
  assert.deepEqual(missing,[]);
  assert.ok(await page.$$eval('symbol[id^="i-"]',s=>s.length)>=55);
 });
 await check('the Looks open on For you: the photo as it is, then a handful, each with its name; every kind is one tap away',async()=>{
  await page.waitForFunction(()=>window.pocketCamera.lookPicks.length>=5);
  const row=await page.evaluate(()=>{
   const shown=el=>{const r=el.getBoundingClientRect();return r.width>1&&r.height>1;};
   const tiles=[...document.querySelectorAll('#strip .tile')].filter(t=>!t.hidden).sort((a,b)=>Number(a.style.order||0)-Number(b.style.order||0));
   const kind=document.querySelector('#lookGroups [aria-selected=true]');
   return {kind:kind.dataset.group,kindName:shown(kind.querySelector('.group-name'))?kind.querySelector('.group-name').textContent:'',kinds:[...document.querySelectorAll('#lookGroups button')].map(b=>b.dataset.group),
    otherNames:[...document.querySelectorAll('#lookGroups button:not([aria-selected=true]) .group-name')].filter(shown).length,
    looks:tiles.map(t=>t.dataset.look),named:tiles.every(t=>shown(t.querySelector('.name'))&&t.querySelector('.name').textContent),picks:window.pocketCamera.lookPicks};
  });
  assert.equal(row.kind,'picks');assert.equal(row.kindName,'For you');assert.equal(row.otherNames,0,'one kind’s name at a time');
  assert.deepEqual(row.kinds,['picks','photo','pop','games','80s','drawn','comic','painted','print','riso']);
  assert.equal(row.looks[0],'none');assert.ok(row.looks.length>=5&&row.looks.length<=9,`a handful: ${row.looks}`);assert.deepEqual(row.looks,row.picks);
  assert.ok(row.named,'every Look in the strip says its name');
  await page.click('#lookGroups button[data-group="drawn"]');
  assert.ok((await page.$$eval('#strip .tile',ts=>ts.filter(t=>!t.hidden).map(t=>t.dataset.look))).includes('manga'));
  await page.click('#lookGroups button[data-group="picks"]');
  assert.equal(await page.evaluate(()=>window.pocketCamera.shownKind),'picks');
  if(shots)await page.screenshot({path:join(shots,'fun-for-you.png')});
 });
 await check('a chosen Look shows its presets; one tap takes one, and it is kept on the layer',async()=>{
  await page.evaluate(()=>window.pocketCamera.chooseLook('popArt'));
  await page.evaluate(()=>window.pocketCamera.chooseLook('popArt'));                    // the chosen Look again opens its presets
  await page.waitForSelector('#presetRow:not([hidden]) .preset-tile');
  const tiles=await page.$$eval('#presetStrip .preset-tile',els=>els.map(e=>({id:e.dataset.preset,kind:e.dataset.kind,name:e.querySelector('.name').textContent,pressed:e.getAttribute('aria-pressed'),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
  assert.ok(tiles.length>=4,`presets: ${tiles.length}`);
  assert.ok(tiles.every(t=>t.name&&t.w>=44&&t.h>=44),JSON.stringify(tiles));
  assert.equal(tiles.filter(t=>t.pressed==='true').length,1,'one preset is the chosen one');
  assert.deepEqual(await shown('#amountRow'),[],'no intensity slider with Sliders off');
  const pick=tiles.find(t=>t.kind==='preset'&&t.pressed!=='true');
  await page.click(`#presetStrip .preset-tile[data-preset="${pick.id}"]`);
  await page.waitForFunction(id=>window.pocketCamera.state.camera.recipe.layers[0].preset===id,pick.id);
  assert.equal(await page.$eval(`#presetStrip .preset-tile[data-preset="${pick.id}"]`,e=>e.getAttribute('aria-pressed')),'true');
  if(shots)await page.screenshot({path:join(shots,'fun-presets.png')});
  await page.click('#amountDone');await page.waitForSelector('#presetRow[hidden]',{state:'attached'});
 });
 await check('the frames are the drawn ones: None, twenty-one frames and five face cutouts, no pixel frame offered',async()=>{
  await page.click('#settingsToggle');await page.click('#frameSetting');await page.waitForSelector('#frameSheet[open] .frame-choice');
  const frames=await page.$$eval('#cameraFrames .frame-choice',els=>els.map(e=>e.dataset.frame));
  assert.equal(frames[0],'none');assert.equal(frames.length,27,frames.join(' '));
  for(const id of ['tet','summer','halloween','easter','christmas','frog-pond','sunflower','astronaut','daruma','snowman'])assert.ok(frames.includes(id),id);
  for(const id of ['print','panel','film','scallop','hearts','starry','tape','clouds','stamp','confetti','peek','telly','harbour-day','blossom','festival','ticket-day'])assert.ok(frames.includes(id),id);
  for(const old of ['pocket','harbour','sakura','ticket','matsuri','hello'])assert.ok(!frames.includes(old),`${old} is no longer offered`);
  await page.click('#cameraFrames .frame-choice[data-frame="peek"]');
  await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.frame==='peek');
  if(shots)await page.screenshot({path:join(shots,'fun-frame.png')});
  await page.evaluate(()=>{window.pocketCamera.state.camera.recipe.frame='none';});
 });
 await check('a face cutout is a board over the whole picture with a hole where the face goes, on any shape of picture',async()=>{
  const report=await page.evaluate(async()=>{
   const m=await import('./frames.js?v='+document.querySelector('script[src^="app.js"]').src.split('v=')[1]),rows=[];
   for(const id of ['frog-pond','sunflower','astronaut','daruma','snowman'])for(const [w,h] of [[400,300],[300,400],[320,320],[640,360]]){
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.fillStyle='#ff00ff';g.fillRect(0,0,w,h);
    m.drawFrame(g,id,w,h);
    const at=(x,y)=>{const d=g.getImageData(Math.round(x),Math.round(y),1,1).data;return d[0]===255&&d[1]===0&&d[2]===255;},win=m.frameWindow(id,w,h),inner=m.frameInner(id,w,h);
    rows.push({id,w,h,hole:at(win.x+win.w/2,win.y+win.h/2),corners:[at(2,2),at(w-3,2),at(2,h-3),at(w-3,h-3)],inside:win.x>=0&&win.y>=0&&win.x+win.w<=w&&win.y+win.h<=h,share:win.w*win.h/(w*h),whole:inner.w===w&&inner.h===h});
   }
   return {rows,none:m.frameWindow('print',400,300)};
  });
  for(const r of report.rows){
   assert.ok(r.hole,`${r.id} ${r.w}×${r.h}: the picture shows through the hole`);
   assert.deepEqual(r.corners,[false,false,false,false],`${r.id} ${r.w}×${r.h}: the board reaches every corner`);
   assert.ok(r.inside&&r.share>.08&&r.share<.4&&r.whole,JSON.stringify(r));
  }
  assert.equal(report.none,null,'a frame that is no cutout has no window');
 });
 await check('Sliders is a setting: on, the fine controls return; it is remembered',async()=>{
  if(!await page.$('#settings:not([hidden]) #slidersSetting'))await page.click('#settingsToggle');
  await page.click('#slidersSetting');
  assert.equal(await page.$eval('#app',el=>el.dataset.sliders),'on');
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('office-pocket-camera'))).sliders,true);
  await page.evaluate(()=>window.pocketCamera.chooseLook('popArt'));
  await page.waitForSelector('#presetRow:not([hidden])');
  assert.deepEqual(await shown('#amountRow'),['amountRow'],'the intensity slider is back under the presets');
  await page.click('#amountDone');
  await page.click('#settingsToggle').catch(()=>{});
  if(!await page.$('#settings:not([hidden]) #slidersSetting'))await page.click('#settingsToggle');
  await page.click('#slidersSetting');
  assert.equal(await page.$eval('#app',el=>el.dataset.sliders),'off');
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('office-pocket-camera'))).sliders,false);
 });
 await check('in the editor a stepper stands in for each slider: one tap is one step, and the slider hears it',async()=>{
  await page.evaluate(async()=>{const c=window.pocketCamera,shot=c.state.shots[0];await c.editFile(new File([shot.original||shot.photo],'sample.jpg',{type:'image/jpeg'}));});
  await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor'&&!!window.pocketCamera.state.edit);
  // The Looks tab: one row of Looks, picked for this photo; a Look's styles open when it is tapped again.
  assert.ok(await page.$eval('#presetRow',el=>el.hidden),'no styles until a Look is tapped again');
  await page.waitForFunction(()=>window.pocketCamera.lookPicks.length>=5&&window.pocketCamera.shownKind==='picks');
  const pick=await page.evaluate(()=>window.pocketCamera.lookPicks.find(n=>n!=='none'));
  await page.click(`#strip .tile[data-look="${pick}"]`);
  assert.ok(await page.$eval('#presetRow',el=>el.hidden),'chosen once: still one row');
  assert.equal(await page.evaluate(()=>window.pocketCamera.shownKind),'picks','For you stays while the chosen Look is one of its picks');
  await page.click(`#strip .tile[data-look="${pick}"]`);await page.waitForSelector('#presetRow:not([hidden]) .preset-tile');
  await page.click(`#strip .tile[data-look="${pick}"]`);await page.waitForSelector('#presetRow[hidden]',{state:'attached'});
  await page.click('#strip .tile[data-look="none"]');
  await page.click('#tabAdjust');
  if(!await page.$eval('#adjustFine',d=>d.open))await page.click('#adjustFine > summary');
  assert.deepEqual(await shown('#panelAdjust input[type=range]'),[],'no slider shows');
  const stepper=page.locator('#adjustSlider + .stepper');
  assert.ok(await stepper.isVisible());
  const before=await page.$eval('#adjustSlider',el=>Number(el.value));
  const size=await stepper.locator('.step-plus').evaluate(el=>{const r=el.getBoundingClientRect();return Math.min(r.width,r.height);});
  assert.ok(size>=44,`a stepper's button is finger-sized: ${size}`);
  await stepper.locator('.step-plus').click();
  const after=await page.$eval('#adjustSlider',el=>Number(el.value));
  assert.ok(after>before,`${before} → ${after}`);
  assert.ok(await stepper.locator('.step-pips i.at').count()===1);
  await stepper.locator('.step-minus').click();
  assert.equal(await page.$eval('#adjustSlider',el=>Number(el.value)),before);
  assert.equal(await page.$('#panelAdjust .sliders-row'),null,'the setting is in Settings, not a row of the panel');
  if(shots)await page.screenshot({path:join(shots,'fun-steppers.png')});
 });
 await check('the Game Room has three games and no Ball',async()=>{
  const games=await page.$$eval('.game-choice',els=>els.map(e=>e.id));
  assert.deepEqual(games,['chooseMemory','chooseBlackjack','chooseSolitaire']);
  assert.equal(await page.$('#chooseBall'),null);assert.equal(await page.$('#ballFile'),null);
  assert.equal((await page.request.get(server.url+'camera/ball.js')).status(),404);
 });
 // Where the photo's face is against the board's hole: its middle off the hole's (in shares of the hole) and its height.
 const hole=()=>page.evaluate(async()=>{
  const m=await import('./frames.js?v='+document.querySelector('script[src^="app.js"]').src.split('v=')[1]);
  const e=window.pocketCamera.state.edit,c=e.recipe.crop,f=e.recipe.makeup.face,pw=c.w*e.width,ph=c.h*e.height,win=m.frameWindow(e.recipe.frame,pw,ph);
  if(!f||!win)return {crop:c,frame:e.recipe.frame};
  return {crop:c,frame:e.recipe.frame,shape:pw/ph,dx:((f.x+f.w/2-c.x)*e.width-win.x-win.w/2)/win.w,dy:((f.y+f.h/2-c.y)*e.height-win.y-win.h/2)/win.h,tall:f.h*e.height/win.h,
   inside:c.x>=0&&c.y>=0&&c.x+c.w<=1.000001&&c.y+c.h<=1.000001};
 });
 const whole={x:0,y:0,w:1,h:1};
 await check('in the editor a face cutout brings the photo’s face to its hole; taking it off puts the crop back',async()=>{
  await page.evaluate(()=>{document.getElementById('picker').value='';});
  await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  await page.click('#tabFrame');
  for(const id of ['frog-pond','sunflower','astronaut','daruma','snowman']){
   await page.click(`#frameChoices [data-frame="${id}"]`);
   // The first one waits for the face to be found; the photo is a close portrait, so the crop has to come in.
   await page.waitForFunction(id=>{const e=window.pocketCamera.state.edit;return e.recipe.frame===id&&!!e.recipe.makeup.face&&e.recipe.crop.w<1;},id,{timeout:90000});
   const at=await hole();
   assert.ok(Math.abs(at.dx)<.12&&Math.abs(at.dy)<.12,`${id}: the face is at the hole's middle ${JSON.stringify(at)}`);
   assert.ok(at.tall>.6&&at.tall<=1.51,`${id}: the face fills the hole, eyes and mouth inside: ${at.tall}`);
   assert.ok(at.inside&&Math.abs(at.shape-640/960)<1e-6,`${id}: the crop keeps its shape, inside the photo`);
   assert.equal(await page.$eval(`#frameChoices [data-frame="${id}"]`,b=>b.getAttribute('aria-checked')),'true');
  }
  if(shots)await page.screenshot({path:join(shots,'fun-face-in-hole.png')});
  // A change of shape moves the hole: the face goes with it. In Crop the board stays on, to move the photo under it.
  await page.click('#frameChoices [data-frame="frog-pond"]');
  await page.click('#tabCrop');await page.click('#cropShapes [data-shape="1:1"]');
  const square=await hole();
  assert.ok(Math.abs(square.shape-1)<1e-6&&Math.abs(square.dx)<.12&&Math.abs(square.dy)<.12,JSON.stringify(square));
  assert.equal(await page.$eval('#editFrame canvas.frame-art',c=>c.hidden),false,'the board stays on in Crop');
  await page.click('#cropShapes [data-shape="Original"]');
  await page.click('#tabFrame');
  await page.click('#frameChoices [data-frame="peek"]');
  assert.deepEqual((await hole()).crop,whole,'a frame that is no board: the crop from before the board is back');
  // Moved by hand under the board, the crop is the photographer's own and stays when the board comes off.
  await page.click('#frameChoices [data-frame="daruma"]');
  const mine=await page.evaluate(()=>{const e=window.pocketCamera.state.edit;e.recipe.crop={...e.recipe.crop,x:e.recipe.crop.x*.5};return e.recipe.crop;});
  await page.click('#frameChoices [data-frame="none"]');
  assert.deepEqual((await hole()).crop,mine);
  await page.click('#tabCrop');await page.click('#cropReset');await page.click('#tabFrame');
  assert.equal(await page.$eval('#editFrame canvas.frame-art',c=>c.hidden),true,'no frame, nothing over the photo');
 });
 await check('a photo with no face: a tap says where the face is, and it goes to the hole',async()=>{
  await page.evaluate(async()=>{const c=window.pocketCamera,shot=c.state.shots[0];await c.editFile(new File([shot.original||shot.photo],'sample.jpg',{type:'image/jpeg'}));});
  await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor'&&!!window.pocketCamera.state.edit&&!window.pocketCamera.state.edit.recipe.makeup.face);
  await page.click('#tabFrame');await page.click('#frameChoices [data-frame="frog-pond"]');
  await page.waitForFunction(()=>window.pocketCamera.state.edit.faceTapWanted&&/Tap the face/.test(document.getElementById('toast').textContent),null,{timeout:90000});
  assert.deepEqual((await hole()).crop,whole,'nothing is moved before the face is known');
  // A tap a third of the way in from the left, two thirds down: the dog's nose, say.
  const box=await page.$eval('#editFrame',el=>{const r=el.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
  await page.touchscreen.tap(box.x+box.w*.33,box.y+box.h*.66);
  await page.waitForFunction(()=>{const e=window.pocketCamera.state.edit;return !!e.recipe.makeup.face&&e.recipe.crop.w<1;},null,{timeout:90000});
  const at=await hole();
  assert.ok(Math.abs(at.dx)<.2&&Math.abs(at.dy)<.2&&at.inside,`the tapped face is in the hole: ${JSON.stringify(at)}`);
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.aligning),false,'no makeup handles come on in the Frame tab');
  if(shots)await page.screenshot({path:join(shots,'fun-tap-to-hole.png')});
 });
 assert.deepEqual(errors,[]);
 console.log(`fun: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
