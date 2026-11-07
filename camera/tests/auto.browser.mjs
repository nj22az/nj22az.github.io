// Auto (auto.js): every photo opens already set right. A dull photo imported gets Enhance and Pop levels of its own
// and the Adjust tab says Auto is on; off is the exact photo (both 0); a fine-tune change reads "Adjusted"; the save
// keeps the levels; the camera setting turns Auto off for the next import; the Enhance, Pop and the six adjusters
// live behind the Fine-tune door.
//   node camera/tests/auto.browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 const recipe=()=>page.evaluate(()=>{const r=window.pocketCamera.state.edit.recipe;return {enhance:r.enhance,pop:r.pop};});

 await check('the levels: a flat grey photo asks for more than a contrasty one; a portrait gets a little less Pop',async()=>{
  const r=await page.evaluate(async()=>{
   const {levelsFromPixels}=await import('/camera/auto.js?v=t');
   const make=f=>{const w=64,h=48,d=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const [r,g,b]=f(x/w,y/h),i=(y*w+x)*4;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;}return levelsFromPixels(d,w,h);};
   const flat=make(()=>[120,120,124]),contrasty=make((u,v)=>{const t=(Math.sin(u*31)+Math.sin(v*37))>0;return t?[235,200,160]:[25,40,70];});
   const portrait=(()=>{const w=64,h=48,d=new Uint8ClampedArray(w*h*4).fill(120);for(let i=3;i<d.length;i+=4)d[i]=255;return levelsFromPixels(d,w,h,[{oval:[]}]);})();
   return {flat,contrasty,portrait};
  });
  assert.ok(r.flat.enhance>r.contrasty.enhance&&r.flat.pop>r.contrasty.pop,JSON.stringify(r));
  assert.ok(r.flat.enhance>=.15&&r.flat.enhance<=.75&&r.flat.pop>=.1&&r.flat.pop<=.55);
  assert.ok(r.portrait.pop<r.flat.pop,'a face gets less Pop');
 });

 await check('an imported photo opens with Auto on: Enhance and Pop set, the row says On, the exact levels in the recipe',async()=>{
  await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===512);
  const r=await recipe();assert.ok(r.enhance>0&&r.pop>0,JSON.stringify(r));
  await page.click('#tabAdjust');
  assert.equal(await page.getAttribute('#autoPhoto','aria-checked'),'true');assert.equal(await page.textContent('#autoValue'),'On');
  assert.ok(await page.locator('#enhancePhoto').isHidden(),'Enhance waits behind the Fine-tune door');
  assert.ok(await page.locator('#adjustSlider').isHidden(),'so do the adjusters');
 });

 await check('Auto off is the exact photo; on again brings the levels back; a fine-tune change reads Adjusted',async()=>{
  await page.click('#autoPhoto');
  assert.deepEqual(await recipe(),{enhance:0,pop:0});assert.equal(await page.textContent('#autoValue'),'Off');
  await page.click('#autoPhoto');const on=await recipe();assert.ok(on.enhance>0&&on.pop>0);
  await page.click('#adjustFine summary');assert.ok(await page.locator('#enhancePhoto').isVisible());
  await page.click('#enhanceAmount');await page.fill('#enhanceStrength','20');
  assert.equal(await page.textContent('#autoValue'),'Adjusted');assert.equal(await page.getAttribute('#autoPhoto','aria-checked'),'true');
  assert.equal((await recipe()).enhance,.2);
  await page.click('#autoPhoto');assert.deepEqual(await recipe(),{enhance:0,pop:0});
  await page.click('#autoPhoto');assert.deepEqual(await recipe(),on,'on again: the photo\'s own levels, not the adjusted ones');
 });

 await check('the save keeps the levels and the re-edit opens with them',async()=>{
  const before=await recipe();
  await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:60000});
  const saved=await page.evaluate(async()=>{const {listShots}=await import('/camera/album.js?v=20261102fun1');const s=(await listShots())[0];return {enhance:s.recipe.enhance,pop:s.recipe.pop};});
  assert.deepEqual(saved,before);
  await page.click('#editPhoto');await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===512);
  assert.deepEqual(await recipe(),before);await page.click('#tabAdjust');assert.equal(await page.textContent('#autoValue'),'On');
  await page.click('#cancelEdit');await page.click('#closeViewer');
 });

 await check('the camera setting turns Auto off: the next import opens as the exact photo, and the setting is remembered',async()=>{
  // The settings sheet needs a running camera (none in this harness): the setting is flipped as the sheet does it.
  await page.evaluate(()=>document.getElementById('autoSetting').click());
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('office-pocket-camera')).auto),false);
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.auto),false);
  // (another file: the picker does not fire for the same one twice)
  await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  assert.deepEqual(await recipe(),{enhance:0,pop:0});
  await page.click('#tabAdjust');assert.equal(await page.textContent('#autoValue'),'Off');
  await page.click('#autoPhoto');const r=await recipe();assert.ok(r.enhance>0&&r.pop>0,'the switch still works on its own');
  await page.click('#cancelEdit');
  // Remembered: a fresh page with that setting stored (this harness writes the settings on every navigation).
  const fresh=await browser.newPage({viewport:{width:390,height:844}});
  await fresh.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false,auto:false})));
  await fresh.goto(server.url+'camera/');await fresh.waitForFunction(()=>!!window.pocketCamera?.engine);
  assert.equal(await fresh.evaluate(()=>window.pocketCamera.state.auto),false);
  assert.equal(await fresh.evaluate(()=>document.getElementById('autoSetting').classList.contains('on')),false,'the setting shows off');
  await fresh.close();
 });

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log(`auto: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
