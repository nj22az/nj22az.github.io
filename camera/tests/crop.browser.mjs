// Import, real pointer/touch gestures, crop/export agreement, source retention and smaller JPEGs.
// CHROMIUM_EXECUTABLE=<path> CAMERA_SHOTS=<folder> node camera/tests/crop.browser.mjs
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
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;
try{
 for(const [label,width,height,mobile] of [['phone',390,664,true],['small-phone',320,560,true],['tablet',768,1024,true],['desktop',1280,800,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
  const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${label}: ${name}`);};
  const crop=()=>page.evaluate(()=>window.pocketCamera.state.edit.recipe.crop);
  try{
   await page.goto(`${server.url}camera/`);await page.waitForFunction(()=>!!window.pocketCamera?.engine);
   await page.evaluate(async()=>{
    const c=document.createElement('canvas');c.width=4096;c.height=3072;const g=c.getContext('2d');
    for(const [x,y,colour] of [[0,0,'#cb3c2d'],[2048,0,'#298f47'],[0,1536,'#2b63c1'],[2048,1536,'#dbb533']]){g.fillStyle=colour;g.fillRect(x,y,2048,1536);}
    g.fillStyle='#000';g.beginPath();g.arc(1638,922,24,0,Math.PI*2);g.fill();
    const blob=await new Promise(r=>c.toBlob(r));await window.pocketCamera.editFile(new File([blob],'quadrants.png',{type:'image/png'}));
   });
   await page.click('#tabCrop');
   await check('crop controls fit the screen and start at the whole photo',async()=>{
    assert.deepEqual(await crop(),{x:0,y:0,w:1,h:1});
    const clipped=await page.evaluate(()=>[...document.querySelectorAll('#editDock [role=tab],#cropShapes button,#cropZoom,#cropReset')].filter(el=>{const r=el.getBoundingClientRect();return !(r.left>=0&&r.right<=innerWidth+.5&&r.top>=0&&r.bottom<=innerHeight+.5&&el.scrollWidth<=el.clientWidth+1);}).map(el=>({id:el.id,text:el.textContent,rect:el.getBoundingClientRect().toJSON(),scroll:el.scrollWidth,client:el.clientWidth})));
    if(shots)await page.screenshot({path:join(shots,`${label}-crop-initial.png`)});
    assert.deepEqual(clipped,[],'no hidden labels or unreachable crop controls');
   });
   await page.click('#cropShapes [data-shape="1:1"]');await page.fill('#cropZoom','200');
   await check('zoom and drag change the photo without starting Original comparison',async()=>{
    const before=await crop(),r=await page.locator('#editFrame').boundingBox();
    await page.mouse.move(r.x+r.width*.5,r.y+r.height*.5);await page.mouse.down();
    await page.mouse.move(r.x+r.width*.7,r.y+r.height*.65,{steps:5});await page.mouse.up();
    const after=await crop();assert.ok(after.x<before.x&&after.y<before.y);assert.equal(after.w,before.w);
    assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.comparing),false);
   });
   await check('two actual touch points pinch the photo and one remaining finger can drag',async()=>{
    const before=await crop(),r=await page.locator('#editFrame').boundingBox(),cx=r.x+r.width/2,cy=r.y+r.height/2;
    const session=await context.newCDPSession(page);
    const touch=async(type,p)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:p.map(([id,x,y])=>({id,x,y,radiusX:2,radiusY:2}))});
    await touch('touchStart',[[1,cx-25,cy],[2,cx+25,cy]]);
    await touch('touchMove',[[1,cx-40,cy],[2,cx+40,cy]]);
    await touch('touchEnd',[[1,cx-40,cy]]);
    await touch('touchMove',[[1,cx-30,cy+10]]);await touch('touchEnd',[]);await session.detach();
    const after=await crop();assert.ok(after.w<before.w*.8,'a pinch zooms the image, not the page');
    assert.ok(after.x>=0&&after.y>=0&&after.x+after.w<=1&&after.y+after.h<=1);
    assert.equal(await page.evaluate(()=>visualViewport.scale),1);
   });
   await page.click('#cropReset');await page.click('#cropShapes [data-shape="3:4"]');await page.fill('#cropZoom','150');
   const savedCrop=await crop();
   await check('Erase and Undo address the cropped source, without touching another part of it',async()=>{
    const sample=()=>page.evaluate(()=>{const e=window.pocketCamera.state.edit,c=document.createElement('canvas');c.width=e.width;c.height=e.height;const g=c.getContext('2d');g.drawImage(e.picture,0,0);return {dot:[...g.getImageData(1638,922,1,1).data].slice(0,3),corner:[...g.getImageData(200,200,1,1).data].slice(0,3)};});
    const before=await sample();assert.ok(before.dot.every(v=>v<20));
    await page.click('#tabErase');const r=await page.locator('#editFrame').boundingBox();
    await page.mouse.click(r.x+r.width*(1638/4096-savedCrop.x)/savedCrop.w,r.y+r.height*(922/3072-savedCrop.y)/savedCrop.h);
    await page.waitForSelector('#eraseUndo:not([disabled])',{timeout:30000});
    const after=await sample();assert.ok(after.dot[0]>100,'the dot at the crop position was filled');assert.deepEqual(after.corner,before.corner);
    await page.click('#eraseUndo');assert.deepEqual((await sample()).dot,before.dot);await page.click('#tabCrop');
   });
   const reference=await page.evaluate(()=>{
    const {state,engine}=window.pocketCamera,e=state.edit;
    const p=engine.render(e.recipe,{source:'edit',crop:e.recipe.crop,width:100,height:100});
    return [[.2,.2],[.8,.2],[.2,.8],[.8,.8]].map(([x,y])=>[...p.data.slice((Math.floor(y*100)*100+Math.floor(x*100))*4,(Math.floor(y*100)*100+Math.floor(x*100))*4+3)]);
   });
   if(shots)await page.screenshot({path:join(shots,`${label}-crop.png`)});
   await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
   await check('saved JPEG has the selected crop and correct dimensions; source is retained',async()=>{
    const result=await page.evaluate(async()=>{
     const shot=window.pocketCamera.state.viewing,b=await createImageBitmap(shot.photo),source=await createImageBitmap(shot.source),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const g=c.getContext('2d');g.drawImage(b,0,0);
     return {type:shot.photo.type,source:[source.width,source.height],width:b.width,height:b.height,meta:[shot.width,shot.height],crop:shot.recipe.crop,colours:[[.2,.2],[.8,.2],[.2,.8],[.8,.8]].map(([x,y])=>[...g.getImageData(Math.floor(x*b.width),Math.floor(y*b.height),1,1).data].slice(0,3))};
    });
    assert.equal(result.type,'image/jpeg');assert.deepEqual(result.source,[4096,3072]);assert.deepEqual(result.crop,savedCrop);
    assert.deepEqual(result.meta,[result.width,result.height]);assert.ok(Math.abs(result.width/result.height-.75)<.002);
    for(let i=0;i<4;i++)for(let j=0;j<3;j++)assert.ok(Math.abs(result.colours[i][j]-reference[i][j])<=6,'saved pixels match the preview crop');
   });
   await page.click('#editPhoto');await page.click('#tabCrop');
   await check('reopening restores the crop, and Reset reveals the entire source',async()=>{
    assert.deepEqual(await crop(),savedCrop);await page.click('#cropReset');assert.deepEqual(await crop(),{x:0,y:0,w:1,h:1});
    assert.equal(await page.inputValue('#cropZoom'),'100');
   });
   await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
   await check('uncropped exports stop at 2560 pixels without enlarging the source',async()=>{
    assert.deepEqual(await page.evaluate(()=>[window.pocketCamera.state.viewing.width,window.pocketCamera.state.viewing.height]),[2560,1920]);
   });
   await check('no page errors',async()=>assert.deepEqual(errors,[]));
  }finally{await context.close();}
 }
 const context=await browser.newContext({viewport:{width:390,height:664},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 try{
  await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
  await page.goto(`${server.url}camera/`);await page.waitForFunction(()=>!!window.pocketCamera?.engine);
  await page.setInputFiles('#picker',join(root,'IMG_2855.jpeg'));await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
  const baseline=await page.evaluate(async()=>{
   const {engine,state}=window.pocketCamera,e=state.edit,c=document.createElement('canvas');c.width=e.width;c.height=e.height;
   const old=engine.render(e.recipe,{source:'edit',width:e.width,height:e.height});c.getContext('2d').putImageData(new ImageData(old.data,old.width,old.height),0,0);
   const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));
   const scale=Math.min(1,2560/Math.max(e.width,e.height));window.compressionReference=engine.render(e.recipe,{source:'edit',width:Math.round(e.width*scale),height:Math.round(e.height*scale)});
   const digest=await crypto.subtle.digest('SHA-256',await document.querySelector('#picker').files[0].arrayBuffer());
   return {bytes:blob.size,sourceHash:[...new Uint8Array(digest)]};
  });
  await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  const result=await page.evaluate(async()=>{
   const shot=window.pocketCamera.state.viewing,b=await createImageBitmap(shot.photo),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const g=c.getContext('2d');g.drawImage(b,0,0);
   const encoded=g.getImageData(0,0,c.width,c.height).data,raw=window.compressionReference.data;let error=0;
   for(let i=0;i<raw.length;i+=4)for(let j=0;j<3;j++)error+=(raw[i+j]-encoded[i+j])**2;
   const digest=await crypto.subtle.digest('SHA-256',await shot.source.arrayBuffer());
   return {bytes:shot.photo.size,width:b.width,height:b.height,psnr:10*Math.log10(255**2/(error/(c.width*c.height*3))),sourceHash:[...new Uint8Array(digest)]};
  });
  assert.equal(result.width,2560);assert.ok(result.bytes<baseline.bytes*.6,'large photo saves at least 40% smaller');
  assert.ok(result.psnr>36,'JPEG compression retains the rendered photo detail');assert.deepEqual(result.sourceHash,baseline.sourceHash,'original imported bytes are kept');
  checks++;console.log(`ok  compression: ${baseline.bytes} to ${result.bytes} bytes (${(100*(1-result.bytes/baseline.bytes)).toFixed(1)}% smaller); ${result.psnr.toFixed(2)} dB PSNR; source byte-exact`);
  if(shots){await page.click('#editPhoto');await page.click('#tabCrop');await page.click('#cropShapes [data-shape="1:1"]');await page.fill('#cropZoom','130');await page.screenshot({path:join(shots,'photo-crop-phone.png')});}
 }finally{await context.close();}
 console.log(`crop browser: ${checks}/${checks} checks passed`);
}finally{await browser.close();await server.close();}
