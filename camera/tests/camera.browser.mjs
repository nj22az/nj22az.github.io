// Pocket Camera in a real browser: a fake camera fed from a photo, every World Look compiled and drawn, a photo taken,
// mixed, stickered, edited, saved, re-edited and deleted, at phone and desktop sizes, with no page errors.
// Run from the repository root: node camera/tests/camera.browser.mjs
// CAMERA_SHOTS=<folder> also writes screenshots of each step. Needs ffmpeg for the camera picture (else Chromium's own).
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const repo=fileURLToPath(new URL('../../',import.meta.url));
const photo=join(repo,'IMG_2855.jpeg'),garden=join(repo,'assets/images/nils-lake-hero-optimized.jpg');
const shots=process.env.CAMERA_SHOTS;if(shots)await mkdir(shots,{recursive:true});
const temp=await mkdtemp(join(tmpdir(),'pocket-camera-'));
const server=await serveGame({root:repo,mounts:['camera','johansson-town','assets']});
const results=[];
const check=async(name,fn)=>{await fn();results.push(name);console.log(`ok  ${name}`);};

async function run({label,width,height,dpr,mobile,portrait}){
 let fake=[];
 try{
  const y4m=join(temp,`${label}.y4m`);
  execFileSync('ffmpeg',['-loglevel','error','-y','-loop','1','-i',photo,'-t','1','-r','10','-vf',portrait?'crop=ih*3/4:ih,scale=720:960,format=yuv420p':'scale=1280:960,format=yuv420p',y4m]);
  fake=[`--use-file-for-fake-video-capture=${y4m}`];
 }catch{console.log('    (no ffmpeg: Chromium’s own test picture is the camera)');}
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream',...fake]});
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,isMobile:mobile,hasTouch:mobile,permissions:['camera']});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const shot=async step=>{if(shots)await page.screenshot({path:join(shots,`${label}-${step}.png`)});};
 const app=fn=>page.evaluate(fn);
 try{
  await page.goto(`${server.url}camera/`);
  await check(`${label}: the camera starts and draws a Look`,async()=>{
   await page.waitForFunction(()=>window.pocketCamera?.state.camera.running,null,{timeout:20000});
   await page.waitForFunction(()=>document.querySelector('#cameraFrame canvas')?.width>100,null,{timeout:20000});
   await page.waitForTimeout(1500);await shot('1-camera');
  });
  await check(`${label}: every World Look compiles and draws the camera picture`,async()=>{
   const out=await app(()=>{
    const {engine,state}=window.pocketCamera,report={};
    for(const tile of document.querySelectorAll('.tile')){
     const look=tile.dataset.look,px=engine.render({...state.camera.recipe,layers:[{look,amount:1}]},{source:'live',width:96,height:72});
     let sum=0,sq=0;for(let i=0;i<px.data.length;i+=4){const l=(px.data[i]+px.data[i+1]+px.data[i+2])/3;sum+=l;sq+=l*l;}
     const n=px.data.length/4,mean=sum/n;report[look]={failed:engine.failed(look),spread:Math.sqrt(Math.max(0,sq/n-mean*mean))};
    }
    return report;
   });
   assert.ok(Object.keys(out).length>=19,`${Object.keys(out).length} Looks offered`);
   for(const [look,r] of Object.entries(out)){assert.equal(r.failed,false,`${look} compiled`);assert.ok(r.spread>3,`${look} draws a picture, not a flat colour (${r.spread.toFixed(1)})`);}
  });
  await check(`${label}: thumbnails show the camera in each Look`,async()=>{
   await page.waitForFunction(()=>document.querySelectorAll('.tile canvas.drawn').length>=19,null,{timeout:60000});await shot('2-thumbnails');
  });
  await check(`${label}: a mix of two Looks, chosen from the strip`,async()=>{
   await page.click('.add-layer');
   await page.click('.tile[data-look="crt"]');
   const layers=await app(()=>window.pocketCamera.state.camera.recipe.layers.map(l=>l.look));
   assert.deepEqual(layers,['pocket','crt']);
   await page.click('.layer-pick >> nth=1');await page.waitForTimeout(200);
   if(!await page.isVisible('#amountRow'))await page.click('.layer-pick >> nth=1');
   await page.fill('#amount','60');
   assert.equal(await app(()=>window.pocketCamera.state.camera.recipe.layers[1].amount),.6);
   await page.click('#stamp');
   await page.waitForTimeout(600);await shot('3-mix');
  });
  await check(`${label}: a die-cut sticker on the viewfinder, dragged into place`,async()=>{
   await page.click('.sticker-button');await page.waitForSelector('#stickerSheet[open] .sticker-choice');
   await page.click('#stickerSets button >> nth=1');await page.waitForSelector('.sticker-choice[data-id^="fuji/"]');
   await page.waitForTimeout(300);await shot('3b-sticker-sheet');
   await page.click('.sticker-choice >> nth=0');
   await page.waitForSelector('#cameraFrame .sticker.selected img[src*="fuji"]');
   const box=await page.locator('#cameraFrame .sticker').boundingBox();
   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
   await page.mouse.move(box.x+box.width/2-50,box.y+box.height/2-30,{steps:6});await page.mouse.up();
   const s=await app(()=>window.pocketCamera.state.camera.recipe.stickers);
   assert.equal(s.length,1);assert.equal(s[0].id,'fuji/Wave');assert.ok(s[0].x<.5&&s[0].y<.56,'moved up and left');
   await page.waitForTimeout(300);await shot('3c-sticker');
  });
  await check(`${label}: the shutter keeps a photo, its source and its recipe in the album`,async()=>{
   await page.click('#shutter');
   await page.waitForFunction(()=>window.pocketCamera.state.shots.length===1,null,{timeout:30000});
   const s=await app(async()=>{const x=window.pocketCamera.state.shots[0],b=await createImageBitmap(x.photo);return {w:b.width,h:b.height,ww:x.width,hh:x.height,recipe:x.recipe,source:x.source.size>0,thumb:x.thumb.size>0};});
   assert.equal(s.w,s.ww);assert.equal(s.h,s.hh);assert.ok(s.source&&s.thumb);
   assert.deepEqual(s.recipe.layers.map(l=>l.look),['pocket','crt']);assert.equal(s.recipe.stamp,true);
   assert.deepEqual(s.recipe.stickers.map(x=>x.id),['fuji/Wave'],'the sticker is in the recipe');
   await page.waitForTimeout(700);await shot('4-taken');
  });
  await check(`${label}: the album, one photo, and re-editing it from its source`,async()=>{
   await page.click('#roll');await page.waitForSelector('#grid button');await shot('5-album');
   await page.click('#grid button');await page.waitForSelector('#viewerImage');
   await page.waitForFunction(()=>document.querySelector('#viewerImage').naturalWidth>0);await shot('6-viewer');
   await page.click('#editPhoto');await page.waitForSelector('#editor:not([hidden])');
   assert.deepEqual(await app(()=>window.pocketCamera.state.edit.recipe.layers.map(l=>l.look)),['pocket','crt']);
   await page.waitForSelector('#editFrame .sticker img[src*="fuji"]');
   await page.click('#tabStickers');await page.click('#stickerSets button >> nth=0');await page.waitForSelector('#panelStickers .sticker-choice[data-id^="thuan/"]');
   await page.click('#panelStickers .sticker-choice >> nth=3');
   const handle=page.locator('#editFrame .sticker.selected .sticker-handle');await handle.waitFor();
   const h=await handle.boundingBox();
   await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.mouse.down();await page.mouse.move(h.x+h.width/2+40,h.y+h.height/2-10,{steps:6});await page.mouse.up();
   const st=await app(()=>window.pocketCamera.state.edit.recipe.stickers);
   assert.equal(st.length,2);assert.ok(st[1].size>.42,'the handle made it bigger');assert.ok(st[1].id.startsWith('thuan/'));
   await page.waitForTimeout(300);await shot('7b-editor-stickers');
   await page.click('#tabLooks');
   await page.waitForTimeout(1500);await shot('7-editor');
   await page.click('#tabAdjust');await page.click('.adjuster[data-key="pattern"]');await page.fill('#adjustSlider','80');
   await page.click('.adjuster[data-key="light"]');await page.fill('#adjustSlider','30');
   await page.waitForTimeout(800);await shot('8-adjust');
   // A corner of the picture, clear of the stickers (holding a sticker picks it up instead).
   const box=await page.locator('#editFrame').boundingBox();
   await page.mouse.move(box.x+16,box.y+16);await page.mouse.down();await page.waitForTimeout(400);
   assert.equal(await page.isVisible('#original'),true,'holding shows the original');await shot('9-original');
   await page.mouse.up();assert.equal(await page.isVisible('#original'),false);
   await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:30000});
   const edited=await app(()=>{const s=window.pocketCamera.state.shots[0];return {edited:!!s.edited,adjust:s.recipe.adjust};});
   await shot('9b-saved');
   assert.ok(edited.edited);assert.equal(edited.adjust.pattern,.8);assert.equal(edited.adjust.light,.3);
   assert.equal(await app(()=>window.pocketCamera.state.shots[0].recipe.stickers.length),2);
  });
  await check(`${label}: a photo from the device opens in the editor and saves as a new photo`,async()=>{
   await page.click('#closeViewer');await page.setInputFiles('#picker',garden);
   await page.waitForSelector('#editor:not([hidden])',{timeout:20000});
   await page.click('.tile[data-look="watercolour"]');await page.click('.add-layer');await page.click('.tile[data-look="print"]');
   await page.waitForTimeout(1500);await shot('10-import');
   await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:60000});
   const n=await app(async()=>{const s=window.pocketCamera.state.shots;const b=await createImageBitmap(s[0].photo);return {count:s.length,w:b.width,h:b.height};});
   assert.equal(n.count,2);assert.deepEqual([n.w,n.h],[1920,1440]);
  });
  await check(`${label}: deleting a photo`,async()=>{
   await page.click('#deletePhoto');await page.click('#deleteSheet button[value="delete"]');
   await page.waitForFunction(()=>window.pocketCamera.state.shots.length===1);
   await page.waitForSelector('#album:not([hidden])');
  });
  await check(`${label}: the album lasts a reload`,async()=>{
   await page.reload();await page.waitForFunction(()=>window.pocketCamera?.state.shots.length===1,null,{timeout:20000});
  });
  await check(`${label}: no page errors`,async()=>assert.deepEqual(errors,[]));
 }finally{await browser.close();}
}

try{
 await run({label:'phone',width:390,height:844,dpr:2,mobile:true,portrait:true});
 await run({label:'desktop',width:1280,height:800,dpr:1,mobile:false,portrait:false});
 console.log(`${results.length} checks pass`);
}finally{await server.close();await rm(temp,{recursive:true,force:true});}
