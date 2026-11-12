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
 await check('the frames are the drawn ones: None and sixteen, no pixel frame offered',async()=>{
  await page.click('#settingsToggle');await page.click('#frameSetting');await page.waitForSelector('#frameSheet[open] .frame-choice');
  const frames=await page.$$eval('#cameraFrames .frame-choice',els=>els.map(e=>e.dataset.frame));
  assert.equal(frames[0],'none');assert.equal(frames.length,17,frames.join(' '));
  for(const id of ['print','panel','film','scallop','hearts','starry','tape','clouds','stamp','confetti','peek','telly','harbour-day','blossom','festival','ticket-day'])assert.ok(frames.includes(id),id);
  for(const old of ['pocket','harbour','sakura','ticket','matsuri','hello'])assert.ok(!frames.includes(old),`${old} is no longer offered`);
  await page.click('#cameraFrames .frame-choice[data-frame="peek"]');
  await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.frame==='peek');
  if(shots)await page.screenshot({path:join(shots,'fun-frame.png')});
  await page.evaluate(()=>{window.pocketCamera.state.camera.recipe.frame='none';});
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
 assert.deepEqual(errors,[]);
 console.log(`fun: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
