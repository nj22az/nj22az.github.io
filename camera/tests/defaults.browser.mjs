// The camera's defaults (the owner, 3 November 2026: "Default to no filter"): a first visit opens with no Look; the old
// default, Pocket, stored by an earlier release, is the default again; a Look chosen since is remembered; the lip
// colour row shows eighteen swatches under the strip and a chosen colour is named in the Makeup summary.
//   node camera/tests/defaults.browser.mjs
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
const open=async stored=>{const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(stored)await page.addInitScript(s=>localStorage.setItem('office-pocket-camera',JSON.stringify(s)),stored);
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);return {page,errors};};
const looks=page=>page.evaluate(()=>window.pocketCamera.state.camera.recipe.layers.map(l=>l.look));
try{
 await check('a first visit: no Look, and the recipe is remembered as kept from then on',async()=>{
  const {page,errors}=await open(null);assert.deepEqual(await looks(page),['none']);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('office-pocket-camera')).kept),true);
  assert.deepEqual(errors,[]);await page.close();
 });
 await check('the old default stored by an earlier release (Pocket, not marked kept) is the default again: no Look',async()=>{
  const {page}=await open({recipe:{layers:[{look:'pocket',amount:1}]},printer:false});assert.deepEqual(await looks(page),['none']);await page.close();
 });
 await check('a Look chosen since is remembered, Pocket included',async()=>{
  const {page}=await open({recipe:{layers:[{look:'pocket',amount:1}]},kept:true,printer:false});assert.deepEqual(await looks(page),['pocket']);await page.close();
  const {page:p2}=await open({recipe:{layers:[{look:'manga',amount:.8}]},printer:false});assert.deepEqual(await looks(p2),['manga']);await p2.close();
 });
 await check('the lip colours: nineteen swatches under the strip once a look is on, the chosen one ringed and named',async()=>{
  const {page,errors}=await open({recipe:{layers:[{look:'none',amount:1}]},printer:false,auto:false});
  await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  await page.waitForFunction(()=>['found','none','failed'].includes(window.pocketCamera.state.edit?.faceStatus),null,{timeout:90000});
  await page.click('#tabAdjust');await page.click('#makeupPhoto');
  assert.ok(await page.locator('.makeup-shades').isHidden(),'no colours before a look');
  await page.click('#makeupStrip [data-look="soft"]');
  assert.ok(await page.locator('.makeup-shades').isVisible());
  const row=await page.evaluate(()=>{const bs=[...document.querySelectorAll('.makeup-shades button')];return {n:bs.length,names:bs.map(b=>b.getAttribute('aria-label')),pressed:bs.filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.dataset.shade),sizes:bs.every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44;}),inDoor:!!document.querySelector('#makeupFine .makeup-shades'),name:document.getElementById('makeupShadeName').textContent,summary:document.getElementById('makeupSummary').textContent};});
  assert.equal(row.n,20,'the look\'s own and nineteen colours');assert.deepEqual(row.pressed,['auto']);assert.ok(row.sizes,'finger-sized');assert.equal(row.inDoor,false,'not behind the door');assert.equal(row.name,'As the look');assert.equal(row.summary,'Soft glam');
  assert.ok(row.names.includes('Cherry')&&row.names.includes('Black')&&row.names.includes('Blue'));
  await page.click('.makeup-shades [data-shade="cherry"]');await page.waitForTimeout(300);
  const after=await page.evaluate(()=>({shade:window.pocketCamera.state.edit.recipe.makeup.shade,name:document.getElementById('makeupShadeName').textContent,summary:document.getElementById('makeupSummary').textContent,pressed:[...document.querySelectorAll('.makeup-shades [aria-pressed=true]')].map(b=>b.dataset.shade)}));
  assert.deepEqual(after,{shade:'cherry',name:'Cherry',summary:'Soft glam · Cherry',pressed:['cherry']});
  assert.deepEqual(errors,[]);await page.close();
 });
 console.log(`defaults: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
