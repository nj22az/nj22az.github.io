// Remove background (background.js) in a real browser: the portrait's person is kept and the rest made see-through
// (the segmenter in the face pack's worker), shown on a checkerboard behind a masked preview; the saved copy is a PNG
// with a see-through corner and an opaque face, kept with its mask so a re-edit opens cut out; Put the background back
// undoes it; a drawing on plain paper is cut by its ground; a photo with neither says so; no page errors.
//   node camera/tests/background.browser.mjs
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
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 const found=()=>page.waitForFunction(()=>['found','none','failed'].includes(window.pocketCamera.state.edit?.faceStatus),null,{timeout:90000});
 const cutout=()=>page.waitForFunction(()=>!!window.pocketCamera.state.edit?.cutout||!window.pocketCamera.state.edit?.cuttingOut&&document.getElementById('eraseHint').textContent.includes('can’t'),null,{timeout:120000});
 const alphaAt=(x,y)=>page.evaluate(([x,y])=>{const c=window.pocketCamera.state.edit.cutout;return c.getContext('2d').getImageData(Math.round(x*c.width),Math.round(y*c.height),1,1).data[3];},[x,y]);

 await check('the portrait: the person kept, the rest see-through, on a checkerboard, the preview masked, with a way back',async()=>{
  await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);await found();
  await page.click('#tabErase');assert.ok(await page.locator('#eraseBackground').isVisible());assert.ok(await page.locator('#eraseBackgroundUndo').isHidden());
  const t0=Date.now();await page.click('#eraseBackground');await cutout();const took=Date.now()-t0;
  const r=await page.evaluate(()=>{const e=window.pocketCamera.state.edit,c=document.querySelector('#editFrame canvas');return {kind:e.cutoutKind,refined:e.cutoutRefined,size:[e.cutout?.width,e.cutout?.height],checker:document.getElementById('editFrame').classList.contains('cutout'),masked:!!(c.style.maskImage||c.style.webkitMaskImage),hint:document.getElementById('eraseHint').textContent,undo:!document.getElementById('eraseBackgroundUndo').hidden,remove:document.getElementById('eraseBackground').hidden};});
  assert.equal(r.kind,'person',r.hint);assert.equal(r.refined,true,'the edge was refined by the matte');assert.deepEqual(r.size,[640,960]);assert.ok(r.checker&&r.masked&&r.undo&&r.remove,JSON.stringify(r));
  // The refined edge follows the photograph's own edges where the segmenter's ramp cut across flat skin and hair alike:
  // the mask's changes sit where the picture changes (its change weighted by the picture's, higher than the segmenter's).
  const agree=await page.evaluate(async()=>{
   const b=await import('/camera/background.js?v=20261104ui1'),fp=await import('/camera/face-pack.js?v=20261104ui1'),e=window.pocketCamera.state.edit,w=e.width,h=e.height;
   const pc=document.createElement('canvas');pc.width=w;pc.height=h;const pg=pc.getContext('2d');pg.drawImage(e.picture,0,0,w,h);const pd=pg.getImageData(0,0,w,h).data;
   const Y=new Float32Array(w*h);for(let i=0;i<w*h;i++)Y[i]=(.2126*pd[4*i]+.7152*pd[4*i+1]+.0722*pd[4*i+2])/255;
   const agreement=c=>{const d=c.getContext('2d').getImageData(0,0,w,h).data,a=i=>d[4*i+3]/255;let num=0,den=0;
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,ga=Math.hypot(a(i+1)-a(i-1),a(i+w)-a(i-w)),gy=Math.hypot(Y[i+1]-Y[i-1],Y[i+w]-Y[i-w]);num+=ga*gy;den+=ga;}return den?num/den:0;};
   const r=await fp.findPerson(e.picture),p=b.personMask(r.mask,r.width,r.height);return {coarse:agreement(b.maskCanvas(p,w,h)),refined:agreement(e.cutout)};
  });
  assert.ok(agree.refined>agree.coarse*1.1,`the mask's edges on the picture's: refined ${agree.refined.toFixed(4)} against the segmenter's ${agree.coarse.toFixed(4)}`);
  console.log(`    edge agreement ${agree.refined.toFixed(4)} against the segmenter's ${agree.coarse.toFixed(4)}`);
  assert.equal(await alphaAt(.02,.02),0,'the top corner is background');assert.equal(await alphaAt(.98,.98),0,'the foot corner is background');
  assert.equal(await alphaAt(.55,.4),255,'the face is kept');
  console.log(`    cut out in ${took} ms (first use loads the segmenter)`);
  if(shots)await page.screenshot({path:join(shots,'background-person.png')});
 });

 await check('the saved copy is a PNG with its corner see-through and its face opaque, kept with its mask; a re-edit opens cut out',async()=>{
  await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:60000});
  const saved=await page.evaluate(async()=>{const {listShots}=await import('/camera/album.js?v=20261102fun1');const s=(await listShots())[0];
   const bmp=await createImageBitmap(s.photo),c=new OffscreenCanvas(bmp.width,bmp.height),g=c.getContext('2d');g.drawImage(bmp,0,0);
   const a=(x,y)=>g.getImageData(Math.round(x*bmp.width),Math.round(y*bmp.height),1,1).data[3];
   return {type:s.photo.type,thumb:s.thumb.type,mask:s.mask?.type,w:bmp.width,h:bmp.height,corner:a(.02,.02),face:a(.55,.4),checker:document.getElementById('viewerStage').classList.contains('cutout')};});
  assert.equal(saved.type,'image/png');assert.equal(saved.thumb,'image/png');assert.equal(saved.mask,'image/png');assert.equal(saved.corner,0);assert.equal(saved.face,255);assert.ok(saved.checker);
  await page.click('#editPhoto');await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  await page.waitForFunction(()=>!!window.pocketCamera.state.edit.cutout,null,{timeout:20000});
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.cutoutKind),'saved');assert.equal(await alphaAt(.02,.02),0);
  await page.click('#tabErase');await page.click('#eraseBackgroundUndo');
  assert.equal(await page.evaluate(()=>({c:window.pocketCamera.state.edit.cutout,k:document.getElementById('editFrame').classList.contains('cutout'),m:document.querySelector('#editFrame canvas').style.maskImage||''}).c),null,'put back');
  assert.ok(await page.locator('#eraseBackground').isVisible());
  await page.click('#cancelEdit');await page.waitForSelector('#viewer:not([hidden])');await page.click('#closeViewer');
 });

 await check('a drawing on plain paper is cut by its ground; a photo with neither a person nor a plain ground says so',async()=>{
  await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=480;c.height=360;const g=c.getContext('2d');g.fillStyle='#f6f3ea';g.fillRect(0,0,480,360);
   g.fillStyle='#1d3b8a';g.beginPath();g.arc(240,180,90,0,Math.PI*2);g.fill();g.fillStyle='#d8352b';g.fillRect(60,40,70,110);
   const blob=await new Promise(r=>c.toBlob(r,'image/png'));await window.pocketCamera.editFile(new File([blob],'drawing.png',{type:'image/png'}));});
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===480);await found();
  await page.click('#tabErase');await page.click('#eraseBackground');await cutout();
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.cutoutKind),'plain');
  assert.equal(await alphaAt(.5,.5),255,'the disc');assert.equal(await alphaAt(.2,.25),255,'the block');assert.equal(await alphaAt(.95,.95),0,'the paper');assert.equal(await alphaAt(.5,.05),0);
  if(shots)await page.screenshot({path:join(shots,'background-plain.png')});
  await page.click('#cancelEdit');
  await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=320;c.height=240;const g=c.getContext('2d');let s=3;const rnd=()=>((s=(1664525*s+1013904223)>>>0)/4294967296);
   const img=g.createImageData(320,240);for(let i=0;i<img.data.length;i+=4){img.data[i]=rnd()*255;img.data[i+1]=rnd()*255;img.data[i+2]=rnd()*255;img.data[i+3]=255;}g.putImageData(img,0,0);
   const blob=await new Promise(r=>c.toBlob(r,'image/png'));await window.pocketCamera.editFile(new File([blob],'noise.png',{type:'image/png'}));});
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===320);await found();
  await page.click('#tabErase');await page.click('#eraseBackground');await cutout();
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.cutout),null);
  assert.equal(await page.textContent('#eraseHint'),'I can’t tell the background from the rest here.');
  await page.click('#cancelEdit');
 });

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log(`background: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
