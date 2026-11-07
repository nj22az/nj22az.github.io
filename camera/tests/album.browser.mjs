// The album's Select (the owner, 4 November 2026: "there should be a way to manage, delete the photos too"): Select
// turns every photo into a tick box, a tap chooses, Select all and Select none, Delete n asks once and deletes them
// together, Done leaves nothing chosen, a tap outside Select still opens the photo; the roll and the note follow; no
// page errors.
//   node camera/tests/album.browser.mjs
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
const shots=process.env.CAMERA_SHOTS;
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false,auto:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>window.pocketCamera?.state.shots.length>=2);
 // a third photo of the owner's own, saved from the editor
 await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===512);
 await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:60000});await page.click('#closeViewer');await page.waitForSelector('#album:not([hidden])');
 const state=()=>page.evaluate(()=>({shots:window.pocketCamera.state.shots.length,selecting:document.getElementById('album').classList.contains('selecting'),button:document.getElementById('albumSelect').textContent,actions:!document.getElementById('albumActions').hidden,count:document.getElementById('albumSelectedCount').textContent,del:document.getElementById('albumDeleteSelected').textContent,delOff:document.getElementById('albumDeleteSelected').disabled,all:document.getElementById('albumSelectAll').textContent,picked:[...document.querySelectorAll('#grid button.picked')].length,pressed:[...document.querySelectorAll('#grid button')].map(b=>b.getAttribute('aria-pressed')),ticks:[...document.querySelectorAll('#grid .pick')].filter(i=>getComputedStyle(i).display!=='none').length,roll:document.getElementById('roll').getAttribute('aria-label')}));

 await check('before Select: no tick boxes, a tap opens the photo; Select shows a tick on every photo and the action row',async()=>{
  let s=await state();assert.equal(s.shots,3);assert.equal(s.selecting,false);assert.equal(s.ticks,0);assert.deepEqual(s.pressed,[null,null,null]);
  await page.click('#grid button >> nth=0');await page.waitForSelector('#viewer:not([hidden])');await page.click('#closeViewer');await page.waitForSelector('#album:not([hidden])');
  await page.click('#albumSelect');s=await state();
  assert.ok(s.selecting&&s.actions,'selecting');assert.equal(s.button,'Done');assert.equal(s.ticks,3);assert.equal(s.count,'Tap the photos to delete');assert.ok(s.delOff);assert.equal(s.all,'Select all');assert.deepEqual(s.pressed,['false','false','false']);
  if(shots)await page.screenshot({path:join(shots,'album-select.png')});
 });

 await check('a tap chooses and a second tap lets go; Select all and Select none; Done leaves nothing chosen',async()=>{
  await page.click('#grid button >> nth=0');let s=await state();assert.equal(s.picked,1);assert.equal(s.count,'1 photo chosen');assert.equal(s.del,'Delete 1');assert.ok(!s.delOff);assert.equal(s.pressed[0],'true');
  assert.ok(await page.locator('#viewer').isHidden(),'no viewer while selecting');
  await page.click('#grid button >> nth=0');s=await state();assert.equal(s.picked,0);assert.ok(s.delOff);
  await page.click('#albumSelectAll');s=await state();assert.equal(s.picked,3);assert.equal(s.all,'Select none');assert.equal(s.count,'3 photos chosen');assert.equal(s.del,'Delete 3');
  if(shots)await page.screenshot({path:join(shots,'album-select-all.png')});
  await page.click('#albumSelectAll');s=await state();assert.equal(s.picked,0);assert.equal(s.all,'Select all');
  await page.click('#grid button >> nth=1');await page.click('#albumSelect');s=await state();assert.equal(s.selecting,false);assert.equal(s.button,'Select');assert.equal(s.picked,0);assert.equal(s.ticks,0);assert.equal(s.actions,false);
 });

 await check('Delete n asks once and deletes the chosen photos together; the grid, the roll and the note follow',async()=>{
  await page.click('#albumSelect');await page.click('#grid button >> nth=0');await page.click('#grid button >> nth=2');
  const ids=await page.evaluate(()=>[...document.querySelectorAll('#grid button.picked')].map(b=>b.dataset.id)),kept=await page.evaluate(()=>document.querySelectorAll('#grid button')[1].dataset.id);
  await page.click('#albumDeleteSelected');await page.waitForSelector('#deleteSheet[open]');
  assert.equal(await page.textContent('#deleteMessage'),'2 photos will be deleted from this device.');assert.equal(await page.textContent('#deleteConfirm'),'Delete 2 Photos');
  await page.click('#deleteConfirm');await page.waitForFunction(()=>window.pocketCamera.state.shots.length===1);
  const s=await state();assert.equal(s.selecting,false);assert.equal(s.shots,1);assert.equal(await page.evaluate(()=>document.querySelector('#grid button').dataset.id),kept);
  assert.ok(s.roll.includes('1 photo'),s.roll);assert.ok((await page.textContent('#albumNote')).startsWith('1 photo'));
  const gone=await page.evaluate(async ids=>{const {listShots}=await import('/camera/album.js?v=20261102fun1');const left=(await listShots()).map(s=>s.id);return ids.filter(id=>left.includes(id)).length;},ids);
  assert.equal(gone,0,'deleted from the album itself');
  // the sheet's Cancel deletes nothing
  await page.click('#albumSelect');await page.click('#grid button >> nth=0');await page.click('#albumDeleteSelected');await page.waitForSelector('#deleteSheet[open]');
  await page.click('#deleteSheet button[value="cancel"]');await page.waitForTimeout(200);assert.equal((await state()).shots,1);await page.click('#albumSelect');
 });

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log(`album: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
