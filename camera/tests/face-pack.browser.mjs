// The face pack (face-pack.js) in a real browser: a photo's faces are found by the app as the photo opens, from the
// vendored landmarker in a worker; the eyes and lips land on the photo's own without anything dragged; the recipe
// keeps the faces through a save and a re-edit; a photo without a face says so in one line and a tap places the
// handles; a handle dragged moves the found face's own points with it; no page errors.
//   node camera/tests/face-pack.browser.mjs        (CAMERA_SHOTS=<folder> also saves screenshots)
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS;if(shots)fs.mkdirSync(shots,{recursive:true});
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
const TRUTH={eyes:[[348,327],[479,363]],mouth:[377,460]};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({sliders:true,recipe:{layers:[{look:'none',amount:1}]},printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 const status=()=>page.evaluate(()=>window.pocketCamera.state.edit?.faceStatus);
 const found=()=>page.waitForFunction(()=>['found','none','failed'].includes(window.pocketCamera.state.edit?.faceStatus),null,{timeout:90000});
 const mapped=()=>page.evaluate(()=>{
  const e=window.pocketCamera.state.edit,f=e.recipe.makeup.face,a=f.angle*Math.PI/180;
  return [...f.eyes,f.mouth].map(p=>{const dx=(p.x-.5)*f.w*e.width,dy=(p.y-.5)*f.h*e.height;return [(f.x+f.w/2)*e.width+dx*Math.cos(a)-dy*Math.sin(a),(f.y+f.h/2)*e.height+dx*Math.sin(a)+dy*Math.cos(a)];});
 });

 await check('the portrait’s face is found as the photo opens: eyes and lips on the photo’s own, no handles, nothing asked',async()=>{
  await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  const t0=Date.now();await found();const took=Date.now()-t0;
  assert.equal(await status(),'found');
  const r=await page.evaluate(()=>{const e=window.pocketCamera.state.edit,f=e.recipe.faces[0];return {n:e.recipe.faces.length,bytes:JSON.stringify(e.recipe.faces).length,lips:f.lipsOuter.length,inner:f.lipsInner.length,eye:f.eyeL.length,brow:f.browL.length,oval:f.oval.length,open:f.open,smile:f.smile,finding:document.getElementById('editFrame').classList.contains('finding'),guide:!!e.recipe.makeup.face,aligning:e.aligning,zoom:window.pocketCamera.editZoom.zoom};});
  assert.equal(r.n,1);assert.deepEqual([r.lips,r.inner,r.eye,r.brow,r.oval],[20,20,16,10,36]);assert.ok(r.bytes<4000,`${r.bytes} bytes in the recipe`);
  assert.ok(r.smile>.5,`a smiling face: smile ${r.smile}`);assert.ok(r.open<.3,`mouth nearly closed: ${r.open}`);
  assert.ok(r.guide&&!r.aligning&&!r.finding&&r.zoom===1,'the guide is derived, the handles stay away, the glint is gone, nothing zoomed');
  const m=await mapped();
  for(const [i,[x,y]] of [...TRUTH.eyes,TRUTH.mouth].entries()){const d=Math.hypot(m[i][0]-x,m[i][1]-y);assert.ok(d<14,`feature ${i}: ${d.toFixed(1)} px from the truth`);}
  await page.click('#tabAdjust');await page.click('#makeupPhoto');
  assert.equal(await page.textContent('#makeupHint'),'');assert.equal(await page.locator('#makeupFace').isHidden(),false,'Not quite right? is offered');
  assert.equal(await page.locator('#makeupDetect').count(),0,'no Find face button');assert.equal(await page.locator('#makeupAngle').count(),0,'no geometry sliders');
  console.log(`    found in ${took} ms (first use loads the runtime and the model)`);
  if(shots)await page.screenshot({path:join(shots,'face-pack-found.png')});
 });

 await check('a handle dragged moves the found face’s own eye and brow with it, not its lips; the outline is the face’s own',async()=>{
  await page.click('#makeupFace');await page.waitForFunction(()=>window.pocketCamera.state.edit.aligning);
  await wait(150);await page.waitForFunction(()=>!window.pocketCamera.editZoom.moving);
  const before=await page.evaluate(()=>JSON.parse(JSON.stringify({f:window.pocketCamera.state.edit.recipe.faces[0],g:window.pocketCamera.state.edit.recipe.makeup.face})));
  const h=await page.evaluate(()=>{const r=document.querySelector('.makeup-guide-handle[data-handle="left-eye"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
  await page.mouse.move(h.x,h.y);await page.mouse.down();await page.mouse.move(h.x+24,h.y+8,{steps:6});await page.mouse.up();await wait(150);
  const after=await page.evaluate(()=>JSON.parse(JSON.stringify({f:window.pocketCamera.state.edit.recipe.faces[0],g:window.pocketCamera.state.edit.recipe.makeup.face})));
  const dEye=[(after.f.eyes[0].x-before.f.eyes[0].x)*640,(after.f.eyes[0].y-before.f.eyes[0].y)*960];
  const dBrow=[(after.f.browL[3][0]-before.f.browL[3][0])*640,(after.f.browL[3][1]-before.f.browL[3][1])*960];
  const dLip=Math.hypot((after.f.lipsOuter[0][0]-before.f.lipsOuter[0][0])*640,(after.f.lipsOuter[0][1]-before.f.lipsOuter[0][1])*960);
  const dOther=Math.hypot((after.f.eyes[1].x-before.f.eyes[1].x)*640,(after.f.eyes[1].y-before.f.eyes[1].y)*960);
  assert.ok(Math.hypot(...dEye)>4,`the eye moved ${dEye.map(v=>v.toFixed(1))}`);
  assert.ok(Math.abs(dBrow[0]-dEye[0])<.5&&Math.abs(dBrow[1]-dEye[1])<.5,`the brow went with it: ${dBrow.map(v=>v.toFixed(1))}`);
  assert.ok(dLip<.3&&dOther<.3,`the lips (${dLip.toFixed(2)}) and the other eye (${dOther.toFixed(2)}) stayed`);
  // the guide's eye is the iris centre, re-derived from the corrected face
  const gx=(after.g.x+after.g.w/2)*640;assert.ok(Math.abs(after.g.eyes[0].x-before.g.eyes[0].x)>0,'the guide follows');assert.ok(gx>0);
  const outline=await page.evaluate(()=>document.querySelector('.makeup-guide-outline').getAttribute('d').split('L').length);
  assert.equal(outline,36,'the oval is the face’s own 36 points');
  if(shots)await page.screenshot({path:join(shots,'face-pack-handles.png')});
  await page.click('#makeupFace');
 });

 await check('a save keeps the faces in the recipe, and a re-edit has them at once, without looking again',async()=>{
  await page.click('#makeupStrip [data-look="natural"]');await page.fill('#makeupStrength','40');
  await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:60000});
  const saved=await page.evaluate(async()=>{const {listShots}=await import('/camera/album.js?v=20261102fun1');const s=(await listShots())[0];return {faces:s.recipe.faces.length,look:s.recipe.makeup.look,strength:s.recipe.makeup.strength,guide:!!s.recipe.makeup.face};});
  assert.deepEqual(saved,{faces:1,look:'natural',strength:.4,guide:true});
  await page.click('#editPhoto');await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  assert.equal(await status(),'found','known at once');
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.faces.length),1);
  await page.click('#cancelEdit');await page.waitForSelector('#viewer:not([hidden])');await page.click('#closeViewer');
 });

 await check('a photo without a face says so in one line; a tap places the handles there',async()=>{
  await page.evaluate(()=>window.pocketCamera.state.mode);
  await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===512);
  await found();assert.equal(await status(),'none');
  await page.click('#tabAdjust');await page.click('#makeupPhoto');
  assert.equal(await page.textContent('#makeupHint'),'I can’t see a face here. Tap the face?');
  assert.equal(await page.evaluate(()=>!!window.pocketCamera.state.edit.recipe.makeup.face),false);
  const r=await page.evaluate(()=>{const r=document.getElementById('editFrame').getBoundingClientRect();return {x:r.left+r.width*.3,y:r.top+r.height*.4,w:r.width,h:r.height};});
  await page.mouse.click(r.x,r.y);
  await page.waitForFunction(()=>window.pocketCamera.state.edit.aligning,null,{timeout:60000});
  const g=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face);
  assert.ok(Math.abs(g.x+g.w/2-.3)<.03&&Math.abs(g.y+g.h*.45-.4)<.03,`the guide at the tap: ${JSON.stringify(g)}`);
  assert.equal(await page.textContent('#makeupHint'),'Drag the handles onto the eyes and the lips.');
  if(shots)await page.screenshot({path:join(shots,'face-pack-tap.png')});
  await page.click('#cancelEdit');
 });

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log(`face pack: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
