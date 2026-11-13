// Zooming in on a photo with the fingers (zoom-view.js) in a real browser, with real touches on a phone-sized page: a
// pinch zooms round the fingers and springs back past the ends, one finger moves a zoomed photo (never past its edges),
// a double tap zooms in and out, the corner button shows the whole photo. Only the view changes: the recipe and the
// saved photo are the same; the editor draws the photo again at more detail; a sticker pinched is the sticker's; Find
// face zooms to the face, two fingers on the face guide zoom and one drags a handle;
// stickers' buttons keep their size; Erase paints with one finger and zooms with two; Crop pinches the crop.
// The album's photo zooms too, and a computer zooms with ctrl and the wheel.
//   node camera/tests/zoom.browser.mjs        (CAMERA_SHOTS=<folder> also saves screenshots)
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
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const near=(a,b,tolerance,what)=>assert.ok(Math.abs(a-b)<=tolerance,`${what}: ${a.toFixed?.(2)??a} against ${b.toFixed?.(2)??b}`);
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 const cdp=await context.newCDPSession(page);
 const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map((p,i)=>({x:p.x,y:p.y,id:p.id??i,radiusX:1,radiusY:1,force:1}))});
 /** Two fingers apart `from` px round `at`, spread to `to` px (sideways, or up and down for a wide one), in steps. */
 async function pinch(at,from,to,{steps=10,shift={x:0,y:0},tall=false}={}){
  const fingers=(d,k)=>tall?[{x:at.x+shift.x*k,y:at.y-d/2+shift.y*k,id:1},{x:at.x+shift.x*k,y:at.y+d/2+shift.y*k,id:2}]
   :[{x:at.x-d/2+shift.x*k,y:at.y+shift.y*k,id:1},{x:at.x+d/2+shift.x*k,y:at.y+shift.y*k,id:2}];
  await touch('touchStart',fingers(from,0));
  for(let i=1;i<=steps;i++){await touch('touchMove',fingers(from+(to-from)*i/steps,i/steps));await wait(16);}
  await touch('touchEnd',[]);
 }
 /** One finger from one point to another; `hold` ms still before it lifts (no flick). */
 async function drag(from,to,{steps=10,ms=16,hold=0}={}){
  await touch('touchStart',[from]);
  for(let i=1;i<=steps;i++){await touch('touchMove',[{x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps}]);await wait(ms);}
  if(hold)await wait(hold);
  await touch('touchEnd',[]);
 }
 const tap=async p=>{await touch('touchStart',[p]);await touch('touchEnd',[]);};
 // Until both views have eased to rest (a busy page can be slow to draw frames).
 // (A zoomed photo is drawn again at up to 8 MP: on the CPU-drawn browser of a busy test machine that can take seconds.)
 const rest=async()=>{await wait(120);await page.waitForFunction(()=>!window.pocketCamera.editZoom.moving&&!window.pocketCamera.viewerZoom.moving,null,{timeout:45000});await wait(60);};
 const rect=sel=>page.evaluate(sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,x:r.left+r.width/2,y:r.top+r.height/2};},sel);
 const zoomOf=which=>page.evaluate(w=>window.pocketCamera[w].zoom,which);
 // The zoom's own move of a photo, from its transform (the page's layout can shift under it).
 const moveOf=sel=>page.evaluate(sel=>{const m=document.querySelector(sel).style.transform.match(/translate\(([-\d.]+)px, ?([-\d.]+)px\)/);return m?{x:+m[1],y:+m[2]}:{x:0,y:0};},sel);
 const view=()=>page.evaluate(()=>{const a=window.pocketCamera,e=a.state.edit,f=document.getElementById('editFrame'),c=f.querySelector('canvas:not(.frame-art):not(.stamps-art):not(.erase-paint):not(.effects-art)');
  return {zoom:a.editZoom.zoom,rested:+f.dataset.viewZoom||1,transform:f.style.transform,canvas:{w:c.width,h:c.height},recipe:JSON.stringify(e.recipe),fit:!document.querySelector('#editPictureArea .zoom-fit').hidden,fitText:document.querySelector('#editPictureArea .zoom-fit').textContent};});
 // The photo to edit: the portrait at three times its size (1,920 × 2,880), so the editor has detail to draw at a zoom.
 await page.evaluate(async()=>{
  const img=await createImageBitmap(await (await fetch('/camera/tests/fixtures/portrait-braids.jpg')).blob()),c=document.createElement('canvas');
  c.width=img.width*3;c.height=img.height*3;c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));await window.pocketCamera.editFile(new File([blob],'big.jpg',{type:'image/jpeg',lastModified:Date.now()}));
 });
 await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===1920&&!document.getElementById('editor').hidden);
 // the face pack adds the faces to the recipe as the photo opens: settled before the recipe is compared
 await page.waitForFunction(()=>['found','none','failed'].includes(window.pocketCamera.state.edit.faceStatus),null,{timeout:90000});await rest();
 const area=await rect('#editPictureArea'),start=await view();

 await check('unzoomed, the photo is as before: no transform, no zoom button, drawn at the screen’s detail',async()=>{
  assert.equal(start.transform,'');assert.equal(start.fit,false);assert.equal(start.zoom,1);
  const frame=await rect('#editFrame');near(start.canvas.h,Math.min(2880,frame.height*2),2,'canvas height');
 });

 await check('a pinch zooms round the fingers, and the photo is drawn again at more detail once they rest',async()=>{
  const frame=await rect('#editFrame'),at={x:frame.x-40,y:frame.y+30};
  // the photo's own point under the fingers, before
  const before={u:(at.x-frame.left)/frame.width,v:(at.y-frame.top)/frame.height};
  await pinch(at,80,160);await rest();
  const v=await view(),after=await rect('#editFrame');
  near(v.zoom,2,.08,'zoom');assert.equal(v.rested,+v.zoom.toFixed(3));assert.ok(v.fit&&/^2\.0×$/.test(v.fitText),v.fitText);
  near((at.x-after.left)/after.width,before.u,.01,'the point under the fingers (across)');near((at.y-after.top)/after.height,before.v,.01,'the point under the fingers (down)');
  assert.ok(v.canvas.h>start.canvas.h*1.6,`canvas ${start.canvas.h} → ${v.canvas.h} rows`);
  assert.equal(v.recipe,start.recipe,'the recipe is untouched');
  if(shots)await page.screenshot({path:join(shots,'zoom-editor-2x.png')});
 });

 await check('one finger moves the zoomed photo, never past its edges, and does not swipe to another Look',async()=>{
  const c=area;await drag({x:c.x,y:c.y},{x:c.x+600,y:c.y+700},{steps:12});await rest();
  const r=await rect('#editFrame'),v=await view();
  assert.ok(r.left<=area.left+1&&r.top<=area.top+1,`the photo's top left ${r.left.toFixed(1)},${r.top.toFixed(1)} stays outside the area's ${area.left},${area.top}`);
  assert.ok(r.right>=area.right-1&&r.bottom>=area.bottom-1,'and it still covers the area');
  assert.equal(v.recipe,start.recipe,'no Look changed');
  await drag({x:c.x+60,y:c.y},{x:c.x-60,y:c.y},{steps:4,ms:10});await rest();
  assert.equal((await view()).recipe,start.recipe,'a quick sideways drag is a move, not a swipe');
 });

 await check('past the closest, a pinch springs back; pinched in below the whole photo it comes back whole',async()=>{
  const max=await page.evaluate(()=>Math.min(8,Math.max(2,2*window.pocketCamera.state.edit.recipe.crop.h*2880/document.getElementById('editFrame').offsetHeight)));
  await pinch(area,40,400,{steps:14,tall:true});await rest();near(await zoomOf('editZoom'),max,.02,'springs back to the closest');
  // from 8× a pinch from 380 px apart to 20 goes below the whole photo, and it comes back whole
  await pinch(area,Math.min(380,area.height-30),20,{steps:16,tall:true});await rest();   // both fingers on the photo's own area (it is shorter since the preset row)
  const v=await view();assert.equal(v.zoom,1);assert.equal(v.transform,'');assert.equal(v.fit,false);
  near(v.canvas.h,start.canvas.h,2,'drawn at the screen’s detail again');
 });

 await check('a double tap zooms in where tapped and the next one shows the whole photo; so does the corner button',async()=>{
  const at={x:area.x+30,y:area.y-40};
  await tap(at);await wait(60);await tap(at);await rest();near(await zoomOf('editZoom'),2.5,.01,'double tap in');
  await tap(at);await wait(60);await tap(at);await rest();assert.equal(await zoomOf('editZoom'),1);
  await tap(at);await wait(60);await tap(at);await rest();
  const b=await rect('#editPictureArea .zoom-fit');await tap({x:b.x,y:b.y});await rest();
  assert.equal(await zoomOf('editZoom'),1);assert.equal((await view()).transform,'');
 });

 await check('at the whole photo, a swipe still changes the Look (the existing gesture)',async()=>{
  await drag({x:area.x+90,y:area.y},{x:area.x-90,y:area.y},{steps:4,ms:10});await rest();
  const look=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.layers[0].look);assert.notEqual(look,'none');
  await page.evaluate(()=>{const e=window.pocketCamera.state.edit;e.recipe.layers=[{look:'none',amount:1}];});
 });

 await check('a pinch that starts on a sticker sizes the sticker; zoomed, its buttons keep one finger’s size',async()=>{
  await page.evaluate(async()=>{const m=await import('/camera/stickers.js?v=20261113year1');await m.loadStickerSets();window.pocketCamera.editStickers.add('thao-pixar/Peace');});
  await page.click('#tabStickers');await rest();
  const s0=await rect('#editFrame .sticker'),size0=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.stickers[0].size);
  await pinch({x:s0.x,y:s0.y},40,90);await rest();
  const size1=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.stickers[0].size);
  assert.ok(size1>size0*1.5,`sticker ${size0.toFixed(3)} → ${size1.toFixed(3)}`);assert.equal(await zoomOf('editZoom'),1,'the view did not zoom');
  // smaller, low on the right, out of the way of a pinch on the photo itself
  await page.evaluate(()=>{const s=window.pocketCamera.state.edit.recipe.stickers[0];s.size=.2;s.x=.75;s.y=.8;window.pocketCamera.editStickers.select(0);});await wait(120);
  const remove0=await rect('#editFrame .sticker.selected .sticker-remove'),sticker0=await rect('#editFrame .sticker');
  // the photo pinched away from the sticker zooms the view (and, as a tap on the photo does, puts the sticker down)
  const frame=await rect('#editFrame');await pinch({x:frame.left+frame.width*.3,y:frame.top+frame.height*.3},60,180,{tall:true});await rest();
  near(await zoomOf('editZoom'),3,.12,'zoom');
  await page.evaluate(()=>window.pocketCamera.editStickers.select(0));await wait(120);
  const remove=await rect('#editFrame .sticker.selected .sticker-remove'),sticker=await rect('#editFrame .sticker');
  near(sticker.height/sticker0.height,await zoomOf('editZoom'),.05,'the sticker itself grows with the photo');
  near(remove.width,remove0.width,1.5,'the remove button’s width on the screen');
  if(shots)await page.screenshot({path:join(shots,'zoom-sticker-3x.png')});
  await page.evaluate(()=>{window.pocketCamera.editStickers.remove(0);window.pocketCamera.editZoom.reset();});
 });

 await check('in Erase one finger paints and two zoom; the photo is not erased by a pinch',async()=>{
  await page.click('#tabErase');await rest();
  await pinch(area,60,150);await rest();
  near(await zoomOf('editZoom'),2.5,.1,'two fingers zoom in Erase');
  assert.ok(!(await page.evaluate(()=>window.pocketCamera.state.edit.erased)),'nothing erased');
  const before=await rect('#editFrame');await drag({x:area.x,y:area.y},{x:area.x+20,y:area.y+20},{steps:3});await rest();
  const after=await rect('#editFrame');near(after.left,before.left,.5,'one finger does not move the photo in Erase');
  await page.waitForFunction(()=>!window.pocketCamera.state.edit.saving&&!document.querySelector('.erase-paint.working'),null,{timeout:30000});
 });

 await check('Crop shows the whole photo, and its pinch changes the crop, not the view',async()=>{
  await page.click('#tabCrop');await rest();
  assert.equal(await zoomOf('editZoom'),1);assert.equal((await view()).transform,'');
  await pinch(area,80,160);await rest();
  assert.equal(await zoomOf('editZoom'),1);
  const crop=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.crop);assert.ok(crop.w<.9,`the crop zoomed in: ${JSON.stringify(crop)}`);
  await page.click('#cropReset');await page.click('#tabLooks');await rest();
 });

 await check('Makeup: the face is found by itself; Not quite right? shows it up close; two fingers on the guide zoom, one drags a handle finely',async()=>{
  await page.click('#tabAdjust');await page.evaluate(()=>window.pocketCamera.editZoom.reset());
  if(await page.getAttribute('#makeupPhoto','aria-expanded')!=='true')await page.click('#makeupPhoto');
  await page.waitForFunction(()=>window.pocketCamera.state.edit.faceStatus==='found',null,{timeout:60000});
  assert.equal(await zoomOf('editZoom'),1,'found quietly, nothing zoomed');
  await page.click('#makeupFace');await page.waitForFunction(()=>window.pocketCamera.state.edit.aligning);await rest();
  const z0=await zoomOf('editZoom'),a=await rect('#editPictureArea');assert.ok(z0>1.2,`zoomed to the face found: ${z0.toFixed(2)}×`);
  const centre=()=>page.evaluate(()=>{const e=window.pocketCamera.state.edit,f=e.recipe.makeup.face,c=e.recipe.crop,r=document.getElementById('editFrame').getBoundingClientRect();return {x:r.left+(f.x+f.w/2-c.x)/c.w*r.width,y:r.top+(f.y+f.h/2-c.y)/c.h*r.height,h:f.h/c.h*r.height};});
  const face=await centre();near(face.x,a.x,a.width*.2,'the face across the middle');near(face.y,a.y,a.height*.2,'the face down the middle');
  assert.ok(face.h<a.height*.8,`the face whole on the screen (${face.h.toFixed(0)} of ${a.height.toFixed(0)} px)`);
  if(shots)await page.screenshot({path:join(shots,'zoom-makeup-face.png')});
  // a pinch whose first finger lands on an eye's handle zooms, and the guide stays where it was
  const guide=()=>page.evaluate(()=>JSON.stringify(window.pocketCamera.state.edit.recipe.makeup.face));
  const before=await guide(),eye=await rect('.makeup-guide-handle[data-handle="left-eye"]');
  await pinch({x:eye.x+15,y:eye.y},30,60,{tall:false});await rest();
  const z1=await zoomOf('editZoom');assert.ok(z1>z0*1.4,`a pinch on the handles zoomed ${z0.toFixed(2)} → ${z1.toFixed(2)}`);
  assert.equal(await guide(),before,'no handle moved');
  // one finger on a handle drags it, and the photo stays still
  const h0=await rect('.makeup-guide-handle[data-handle="left-eye"]'),f0=await rect('#editFrame');
  await drag({x:h0.x,y:h0.y},{x:h0.x+24,y:h0.y},{steps:6,hold:80});await rest();
  const h1=await rect('.makeup-guide-handle[data-handle="left-eye"]'),f1=await rect('#editFrame');
  near(h1.x-h0.x,24,2,'the handle follows the finger');near(f1.left,f0.left,.5,'the photo did not move');
  assert.notEqual(await guide(),before,'the eye moved');
  await page.click('#makeupPhoto');await page.evaluate(()=>window.pocketCamera.editZoom.reset());await page.click('#tabLooks');await rest();
 });

 await check('saved while zoomed, the photo is the whole photo at its full size; the album photo opens unzoomed',async()=>{
  await pinch(area,80,200);await rest();assert.ok(await zoomOf('editZoom')>2);
  await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:60000});
  const saved=await page.evaluate(()=>({w:window.pocketCamera.state.viewing.width,h:window.pocketCamera.state.viewing.height}));
  // the size any save of this photo is (the long side at most 2,560), the whole photo's shape
  assert.deepEqual(saved,{w:Math.round(1920*2560/2880),h:2560});
  assert.equal(await zoomOf('editZoom'),1);assert.equal(await zoomOf('viewerZoom'),1);
 });

 await check('the album’s photo zooms with a pinch and a double tap, moves with one finger and comes back whole',async()=>{
  await page.waitForFunction(()=>document.getElementById('viewerImage').complete&&document.getElementById('viewerImage').naturalWidth>0);
  const stage=await rect('#viewerStage'),img=await rect('#viewerImage');
  await pinch({x:img.x,y:img.y},80,240);await rest();near(await zoomOf('viewerZoom'),3,.12,'pinch');
  const before=await moveOf('#viewerImage');await drag({x:stage.x,y:stage.y},{x:stage.x+40,y:stage.y+60},{steps:6,hold:160});await rest();
  const after=await moveOf('#viewerImage');near(after.x-before.x,40,2,'moved across');near(after.y-before.y,60,2,'moved down');
  // a flick carries on past where the finger lifted, and stops inside the photo's edges
  await drag({x:stage.x,y:stage.y},{x:stage.x-40,y:stage.y},{steps:3,ms:16});await rest();
  const flicked=await moveOf('#viewerImage');assert.ok(after.x-flicked.x>48,`a 40 px flick moved it ${(after.x-flicked.x).toFixed(1)} px`);
  const shown=await rect('#viewerImage');assert.ok(shown.right>=stage.right-1&&shown.left<=stage.left+1,'still covering the area');
  if(shots)await page.screenshot({path:join(shots,'zoom-viewer-3x.png')});
  await tap(stage);await wait(60);await tap(stage);await rest();assert.equal(await zoomOf('viewerZoom'),1);
  await tap(stage);await wait(60);await tap(stage);await rest();near(await zoomOf('viewerZoom'),2.5,.01,'double tap in');
  await page.click('#closeViewer');await page.click('#grid button');await page.waitForSelector('#viewer:not([hidden])');
  assert.equal(await zoomOf('viewerZoom'),1,'opened again, it is whole');
 });

 await check('on a computer: ctrl and the wheel zoom round the pointer, the wheel alone moves the zoomed photo',async()=>{
  const desk=await browser.newPage({viewport:{width:1280,height:900}});
  const deskErrors=[];desk.on('pageerror',e=>deskErrors.push(e.message));
  await desk.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
  await desk.goto(server.url+'camera/');await desk.waitForFunction(()=>!!window.pocketCamera?.engine);
  await desk.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
  await desk.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);await wait(300);
  const r=await desk.evaluate(()=>{const r=document.getElementById('editPictureArea').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
  const at={x:r.x-50,y:r.y-40},under=()=>desk.evaluate(at=>{const f=document.getElementById('editFrame').getBoundingClientRect();return {u:(at.x-f.left)/f.width,v:(at.y-f.top)/f.height};},at);
  const point=await under();
  await desk.mouse.move(at.x,at.y);await desk.keyboard.down('Control');
  for(let i=0;i<6;i++){await desk.mouse.wheel(0,-20);await wait(30);}
  await desk.keyboard.up('Control');await wait(300);
  const z=await desk.evaluate(()=>window.pocketCamera.editZoom.zoom);assert.ok(z>1.8&&z<=4,`ctrl + wheel zoomed to ${z.toFixed(2)}`);
  // Up and down the point under the pointer stays; across, a photo narrower than the window stays centred until it fills it.
  const still=await under();near(still.v,point.v,.005,'the point under the pointer');
  const before=await desk.evaluate(()=>document.getElementById('editFrame').getBoundingClientRect().top);
  await desk.mouse.wheel(0,60);await wait(250);
  const after=await desk.evaluate(()=>document.getElementById('editFrame').getBoundingClientRect().top);near(before-after,60,1,'the wheel moves it up');
  assert.equal(await desk.evaluate(()=>window.pocketCamera.state.edit.recipe.layers[0].look),'none','the wheel changed no Look');
  assert.deepEqual(deskErrors,[]);await desk.close();
 });

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log(`zoom: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
