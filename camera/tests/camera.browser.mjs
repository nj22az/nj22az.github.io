// Pocket Camera in a real browser: a fake camera fed from a photo, every World Look compiled and drawn, a photo taken,
// mixed (by hand and by the dice), framed, stickered, lettered, lit by a drag, edited (frame, mirror, detail), saved,
// re-edited and deleted, at phone and desktop sizes, with no page errors.
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
// A cut-out with a transparent background, as a subject lifted from a photo arrives: World's own mascot render.
const cutout=join(repo,'assets/mascots/johansson-tada.webp');
const shots=process.env.CAMERA_SHOTS;if(shots)await mkdir(shots,{recursive:true});
const temp=await mkdtemp(join(tmpdir(),'pocket-camera-'));
const server=await serveGame({root:repo,mounts:['camera','johansson-town','assets']});
const results=[];
const check=async(name,fn)=>{await fn();results.push(name);console.log(`ok  ${name}`);};

// Confirm the default pair exists, then deliberately remove it so the historical photo-count and empty-album
// checks below still exercise their original conditions. Reload also verifies the once-only marker respects deletion.
async function clearSamplesForRegression(page,label){
 await page.waitForFunction(()=>window.pocketCamera?.state.shots.filter(s=>s.id.startsWith('sample:harbour-')).length===2,null,{timeout:20000});
 await check(`${label}: both samples seed once and stay deleted`,async()=>{
  const before=await page.evaluate(()=>window.pocketCamera.state.shots.filter(s=>s.id.startsWith('sample:harbour-')).map(s=>({id:s.id,look:s.recipe.layers[0].look,source:s.source.size,photo:s.photo.size})));
  assert.equal(before.length,2);assert.deepEqual(new Set(before.map(s=>s.look)),new Set(['none','adventureInk']));assert.ok(before.every(s=>s.source>0&&s.photo>0));
  await page.evaluate(async()=>{const album=await import('/camera/album.js?v=20261029c');for(const s of await album.listShots())if(s.id.startsWith('sample:harbour-'))await album.deleteShot(s.id);});
  await page.reload();await page.waitForFunction(()=>!!window.pocketCamera,null,{timeout:20000});
  const remaining=await page.evaluate(async()=>{const album=await import('/camera/album.js?v=20261029c');await album.ensureAlbumSamples();return (await album.listShots()).filter(s=>s.id.startsWith('sample:harbour-')).length;});
  assert.equal(remaining,0,'deleted samples do not reappear');
 });
}

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
  await clearSamplesForRegression(page,label);
  await check(`${label}: the camera starts and draws a Look`,async()=>{
   await page.waitForFunction(()=>window.pocketCamera?.state.camera.running,null,{timeout:20000});
   await page.waitForFunction(()=>document.querySelector('#cameraFrame canvas')?.width>100,null,{timeout:20000});
   await page.waitForTimeout(1500);await shot('1-camera');
   // A wide window keeps the Looks beside or under the picture; a phone folds them over it when the picture would
   // otherwise be narrower than the screen (checked at Safari's height below).
   if(!mobile)assert.equal(await app(()=>document.querySelector('#camera').classList.contains('compact')),false,'a wide window keeps the Looks off the picture');
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
   assert.ok(Object.keys(out).length>=25,`${Object.keys(out).length} Looks offered (World's, Adventure Ink and the camera's five)`);
   for(const [look,r] of Object.entries(out)){assert.equal(r.failed,false,`${look} compiled`);assert.ok(r.spread>3,`${look} draws a picture, not a flat colour (${r.spread.toFixed(1)})`);}
  });
  await check(`${label}: two camera starts at once leave one camera running`,async()=>{
   const live=await app(async()=>{
    const md=navigator.mediaDevices,real=md.getUserMedia.bind(md),streams=[];
    md.getUserMedia=async c=>{const s=await real(c);streams.push(s);return s;};
    const {startCamera}=window.pocketCamera;await Promise.all([startCamera(),startCamera()]);
    md.getUserMedia=real;
    return {made:streams.length,live:streams.flatMap(s=>s.getTracks()).filter(t=>t.readyState==='live').length,running:window.pocketCamera.state.camera.running};
   });
   assert.equal(live.made,2);assert.equal(live.live,1,'the earlier camera is turned off');assert.ok(live.running);
  });
  await check(`${label}: thumbnails show the camera in each Look of the kind on show`,async()=>{
   // On a phone the strip may be folded over the picture: the Look's name unfolds it.
   if(await app(()=>{const c=document.querySelector('#camera');return c.classList.contains('compact')&&!c.classList.contains('looks-open');}))await page.click('#layers .layer.active .layer-pick');
   const shownDrawn=()=>page.waitForFunction(()=>{const t=[...document.querySelectorAll('#strip .tile')].filter(t=>!t.hidden);return t.length>0&&t.every(x=>x.querySelector('canvas.drawn'));},null,{timeout:60000});
   await shownDrawn();
   await page.click('#lookGroups button[data-group="drawn"]');await shownDrawn();
   assert.equal(await app(()=>[...document.querySelectorAll('#strip .tile')].filter(t=>!t.hidden).length),8,'Drawn: eight Looks');
   await shot('2-thumbnails');
  });
  await check(`${label}: a mix of two Looks, chosen from the strip`,async()=>{
   await page.click('.add-layer');
   // The Looks come in kinds; a kind shows only its own (the owner: "game consoles can stay with each other and vhs for
   // 80's"), and the kind of the chosen Look is the one open.
   const kinds=await app(()=>[...document.querySelectorAll('#lookGroups button')].map(b=>b.textContent));
   assert.deepEqual(kinds,['Photo','Games','80s','Drawn','Painted','Print']);
   await page.click('#lookGroups button[data-group="80s"]');
   assert.deepEqual(await app(()=>[...document.querySelectorAll('#strip .tile')].filter(t=>!t.hidden).map(t=>t.dataset.look)),['crt','camcorder'],'80s: Old TV and the VHS camcorder');
   await page.click('#lookGroups button[data-group="games"]');
   assert.deepEqual(await app(()=>[...document.querySelectorAll('#strip .tile')].filter(t=>!t.hidden).map(t=>t.dataset.look)),['pocket','snes'],'the game consoles together');
   await page.click('#lookGroups button[data-group="80s"]');
   await page.click('.tile[data-look="crt"]');
   const layers=await app(()=>window.pocketCamera.state.camera.recipe.layers.map(l=>l.look));
   assert.deepEqual(layers,['pocket','crt']);
   await page.click('.layer-pick >> nth=1');await page.waitForTimeout(200);
   if(!await page.isVisible('#amountRow'))await page.click('.layer-pick >> nth=1');
   await page.fill('#amount','60');
   assert.equal(await app(()=>window.pocketCamera.state.camera.recipe.layers[1].amount),.6);
   // The settings row, behind the chevron: the date stamp on, the Print frame from the frame sheet (every frame, drawn
   // on the picture as it is).
   await page.click('#settingsToggle');await page.waitForSelector('#settings:not([hidden])');
   await page.click('#stamp');await page.click('#frameSetting');
   await page.waitForSelector('#frameSheet[open] .frame-choice[data-frame="print"]');
   assert.ok(await page.locator('#cameraFrames .frame-choice').count()>=10,'the drawn and the pixel frames are offered');
   await page.click('#cameraFrames .frame-choice[data-frame="print"]');await page.waitForFunction(()=>!document.querySelector('#frameSheet').open);
   assert.equal(await app(()=>window.pocketCamera.state.camera.recipe.frame),'print');
   assert.equal(await page.locator('#settingsStatus svg').count(),2,'the frame and the date show beside the chevron');
   await page.waitForTimeout(600);await shot('3-mix');
   assert.equal(await page.isHidden('#settings'),true,'the frame sheet put the settings row away: one panel at a time');
  });
  await check(`${label}: the curated dice rolls a named mix`,async()=>{
   const before=await app(()=>JSON.stringify(window.pocketCamera.state.camera.recipe.layers));
   await page.click('.shuffle >> nth=0');
   const after=await app(()=>window.pocketCamera.state.camera.recipe.layers);
   assert.equal(after.length,2);assert.match(await page.textContent('#toast'),/ · /,'its name is shown');
   // Back to the mix the next checks expect.
   await page.evaluate(b=>{const r=window.pocketCamera.state.camera.recipe;r.layers=JSON.parse(b);},before);
  });
  await check(`${label}: light dragged up and down on the viewfinder, and put back`,async()=>{
   const f=await page.locator('#cameraFrame').boundingBox();
   await page.mouse.move(f.x+f.width*.15,f.y+f.height*.7);await page.mouse.down();
   await page.mouse.move(f.x+f.width*.15,f.y+f.height*.55,{steps:6});await page.mouse.up();
   const light=await app(()=>window.pocketCamera.state.camera.recipe.adjust.light);
   assert.ok(light>.2,`dragging up brightens (${light})`);
   assert.equal(await page.isVisible('#exposureChip'),true);await shot('3a-exposure');
   await page.click('#exposureChip');
   assert.equal(await app(()=>window.pocketCamera.state.camera.recipe.adjust.light),0);assert.equal(await page.isHidden('#exposureChip'),true);
  });
  await check(`${label}: a die-cut sticker on the viewfinder, dragged into place`,async()=>{
   await page.click('.sticker-button');await page.waitForSelector('#stickerSheet[open] .sticker-choice');
   await page.click('#stickerSets button:text-is("Johansson")');await page.waitForSelector('.sticker-choice[data-id^="johansson-pixar/"]');
   await page.waitForTimeout(300);await shot('3b-sticker-sheet');
   await page.click('.sticker-choice >> nth=0');
   await page.waitForSelector('#cameraFrame .sticker.selected img[src*="johansson-pixar"]');
   const box=await page.locator('#cameraFrame .sticker').boundingBox();
   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
   await page.mouse.move(box.x+box.width/2-50,box.y+box.height/2-30,{steps:6});await page.mouse.up();
   const s=await app(()=>window.pocketCamera.state.camera.recipe.stickers);
   assert.equal(s.length,1);assert.equal(s[0].id,'johansson-pixar/Wave');assert.ok(s[0].x<.5&&s[0].y<.56,'moved up and left');
   // Two fingers, both on the sticker, spread apart and turned: it grows and turns.
   const pinched=await app(()=>{
    const el=document.querySelector('#cameraFrame .sticker'),r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    const before={...window.pocketCamera.state.camera.recipe.stickers[0]};
    const fire=(type,id,x,y,target=el)=>target.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===11,clientX:x,clientY:y,bubbles:true,cancelable:true}));
    fire('pointerdown',11,cx-10,cy-20);fire('pointerdown',12,cx+10,cy+20);
    for(let k=1;k<=5;k++){fire('pointermove',12,cx+10+k*8,cy+20+k*4,window);fire('pointermove',11,cx-10-k*8,cy-20-k*2,window);}
    fire('pointerup',12,cx+50,cy+40,window);fire('pointerup',11,cx-50,cy-30,window);
    return {before,after:window.pocketCamera.state.camera.recipe.stickers[0]};
   });
   assert.ok(pinched.after.size>pinched.before.size*1.3,`pinched bigger (${pinched.before.size.toFixed(2)} → ${pinched.after.size.toFixed(2)})`);
   assert.notEqual(Math.round(pinched.after.angle),Math.round(pinched.before.angle),'and turned');
   await page.waitForTimeout(300);await shot('3c-sticker');
  });
  await check(`${label}: a speech balloon lettered with the photographer's words`,async()=>{
   await page.click('.sticker-button');await page.click('#stickerSets button >> nth=0');
   await page.click('.sticker-choice.lettering[data-id="balloon:speech"]');
   await page.waitForSelector('#textSheet[open]');await page.fill('#balloonText','Who left the chairs out?');await page.click('#textDone');
   await page.waitForSelector('#cameraFrame .sticker.balloon canvas');
   const b=await app(()=>{const s=window.pocketCamera.state.camera.recipe.stickers.at(-1),c=document.querySelector('#cameraFrame .sticker.balloon canvas');return {s,painted:c.width>50&&c.height>50};});
   assert.equal(b.s.id,'balloon:speech');assert.equal(b.s.text,'Who left the chairs out?');assert.ok(b.painted,'drawn at its size');
   await page.waitForTimeout(300);await shot('3d-balloon');
  });
  await check(`${label}: the shutter keeps a photo, its source and its recipe in the album`,async()=>{
   await page.click('#shutter');
   await page.waitForFunction(()=>window.pocketCamera.state.shots.length===1,null,{timeout:30000});
   const s=await app(async()=>{const x=window.pocketCamera.state.shots[0],b=await createImageBitmap(x.photo);return {w:b.width,h:b.height,ww:x.width,hh:x.height,recipe:x.recipe,source:x.source.size>0,thumb:x.thumb.size>0};});
   assert.equal(s.w,s.ww);assert.equal(s.h,s.hh);assert.ok(s.source&&s.thumb);
   assert.deepEqual(s.recipe.layers.map(l=>l.look),['pocket','crt']);assert.equal(s.recipe.stamp,true);assert.equal(s.recipe.frame,'print');
   assert.deepEqual(s.recipe.stickers.map(x=>x.id),['johansson-pixar/Wave','balloon:speech'],'the sticker and the balloon are in the recipe');
   // The print's paper is in the saved photo's corner: the frame was drawn into it, not only on the screen.
   const corner=await app(async()=>{const b=await createImageBitmap(window.pocketCamera.state.shots[0].photo),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const g=c.getContext('2d');g.drawImage(b,0,0);return [...g.getImageData(4,4,1,1).data].slice(0,3);});
   assert.ok(corner.every(v=>v>225),`the print's white border (${corner})`);
   await page.waitForTimeout(700);await shot('4-taken');
  });
  await check(`${label}: the album, one photo, and re-editing it from its source`,async()=>{
   await page.click('#roll');await page.waitForSelector('#grid button');await shot('5-album');
   await page.click('#grid button');await page.waitForSelector('#viewerImage');
   await page.waitForFunction(()=>document.querySelector('#viewerImage').naturalWidth>0);await shot('6-viewer');
   await page.click('#editPhoto');await page.waitForSelector('#editor:not([hidden])');
   assert.deepEqual(await app(()=>window.pocketCamera.state.edit.recipe.layers.map(l=>l.look)),['pocket','crt']);
   await page.waitForSelector('#editFrame .sticker img[src*="johansson-pixar"]');
   await page.waitForSelector('#editFrame .sticker.balloon canvas');
   // Thuan's tab: her own sheet, then her other sheets under their names (the cartoon one among them).
   await page.click('#tabStickers');await page.click('#stickerSets button:text-is("Thuan")');await page.waitForSelector('#panelStickers .sticker-choice[data-id^="thuan/"]');
   assert.deepEqual(await app(()=>[...document.querySelectorAll('#panelStickers .sticker-heading')].map(h=>h.textContent)),['World Thuan','Cartoon Thuan','Thuan & Nils'],'her other sheets under their names');
   await page.click('#panelStickers .sticker-choice[data-id^="thuan/"] >> nth=3');
   if(mobile){
    // A touch screen has no corner handle: two fingers spread the sticker.
    if(await app(()=>matchMedia('(pointer:coarse)').matches))assert.equal(await page.isVisible('#editFrame .sticker.selected .sticker-handle'),false,'no corner handle on a touch screen');
    await app(()=>{
     const el=document.querySelector('#editFrame .sticker.selected'),r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
     const fire=(type,id,x,y,target=el)=>target.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===21,clientX:x,clientY:y,bubbles:true,cancelable:true}));
     fire('pointerdown',21,cx,cy-20);fire('pointerdown',22,cx,cy+20);
     for(let k=1;k<=5;k++){fire('pointermove',22,cx,cy+20+k*2,window);fire('pointermove',21,cx,cy-20-k*2,window);}
     fire('pointerup',22,cx,cy+30,window);fire('pointerup',21,cx,cy-30,window);
    });
   }else{
    const handle=page.locator('#editFrame .sticker.selected .sticker-handle');await handle.waitFor();
    const h=await handle.boundingBox();
    await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.mouse.down();await page.mouse.move(h.x+h.width/2+40,h.y+h.height/2-10,{steps:6});await page.mouse.up();
   }
   const st=await app(()=>window.pocketCamera.state.edit.recipe.stickers);
   assert.equal(st.length,3);assert.ok(st[2].size>.42,mobile?'the pinch made it bigger':'the handle made it bigger');assert.ok(st[2].id.startsWith('thuan/'));
   await page.waitForTimeout(300);await shot('7b-editor-stickers');
   await page.click('#tabLooks');
   await page.waitForTimeout(1500);await shot('7-editor');
   await page.click('#tabFrame');await page.click('.frame-choice[data-frame="film"]');await page.click('#mirrorChoices button[data-trick="twin"]');
   await page.waitForTimeout(600);await shot('7c-frame-tab');
   await page.click('#tabAdjust');await page.click('.adjuster[data-key="pattern"]');await page.fill('#adjustSlider','80');
   await page.click('.adjuster[data-key="detail"]');await page.fill('#adjustSlider','-50');
   await page.click('.adjuster[data-key="light"]');await page.fill('#adjustSlider','30');
   await page.waitForTimeout(800);await shot('8-adjust');
   // A part of the picture clear of the stickers (holding a sticker picks it up instead).
   const spot=await app(()=>{
    const r=document.querySelector('#editFrame').getBoundingClientRect();
    for(let y=.05;y<1;y+=.1)for(let x=.05;x<1;x+=.1){const px=r.left+x*r.width,py=r.top+y*r.height;if(!document.elementFromPoint(px,py)?.closest('.sticker,button'))return {x:px,y:py};}
   });
   assert.ok(spot,'some of the picture is free of stickers');
   await page.mouse.move(spot.x,spot.y);await page.mouse.down();await page.waitForTimeout(400);
   assert.equal(await page.isVisible('#original'),true,'holding shows the original');await shot('9-original');
   await page.mouse.up();assert.equal(await page.isVisible('#original'),false);
   await page.click('#saveEdit');
   assert.equal(await page.isDisabled('#cancelEdit'),true,'Cancel waits while saving');
   await page.waitForSelector('#viewer:not([hidden])',{timeout:30000});
   const edited=await app(()=>{const s=window.pocketCamera.state.shots[0];return {edited:!!s.edited,adjust:s.recipe.adjust,frame:s.recipe.frame,trick:s.recipe.trick};});
   await shot('9b-saved');
   assert.ok(edited.edited);assert.equal(edited.adjust.pattern,.8);assert.equal(edited.adjust.light,.3);assert.equal(edited.adjust.detail,-.5);
   assert.equal(edited.frame,'film');assert.equal(edited.trick,'twin');
   assert.equal(await app(()=>window.pocketCamera.state.shots[0].recipe.stickers.length),3);
  });
  await check(`${label}: a photo from the device opens in the editor and saves as a new photo`,async()=>{
   await page.click('#closeViewer');await page.setInputFiles('#picker',garden);
   await page.waitForSelector('#editor:not([hidden])',{timeout:20000});
   // It opens with the camera's main Look alone, not the camera's whole mix (the owner: "main look and then we play with it").
   const opened=await app(()=>({edit:window.pocketCamera.state.edit.recipe.layers,camera:window.pocketCamera.state.camera.recipe.layers}));
   assert.ok(opened.camera.length>1,'the camera has a mix on');
   assert.deepEqual(opened.edit,[{look:opened.camera[0].look,amount:1}],'the photo opens in the main Look only');
   await page.click('#lookGroups button[data-group="painted"]');await page.click('.tile[data-look="watercolour"]');await page.click('.add-layer');
   await page.click('#lookGroups button[data-group="print"]');await page.click('.tile[data-look="print"]');
   await page.waitForTimeout(1500);await shot('10-import');
   await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:60000});
   const n=await app(async()=>{const s=window.pocketCamera.state.shots;const b=await createImageBitmap(s[0].photo);return {count:s.length,w:b.width,h:b.height};});
   assert.equal(n.count,2);assert.deepEqual([n.w,n.h],[1920,1440]);
  });
  await check(`${label}: several of your own photos at once go into the album in the camera's main Look`,async()=>{
   const before=await app(()=>window.pocketCamera.state.shots.length);
   await page.click('#closeViewer');await page.setInputFiles('#picker',[photo,garden]);
   await page.waitForFunction(n=>window.pocketCamera.state.shots.length===n+2,before,{timeout:120000});
   await page.waitForSelector('#album:not([hidden])');await page.waitForTimeout(500);await shot('10b-many');
   const looks=await app(()=>window.pocketCamera.state.shots.slice(0,2).map(s=>s.recipe.layers.map(l=>l.look).join('+')));
   const camera=await app(()=>window.pocketCamera.state.camera.recipe.layers.map(l=>l.look));
   assert.ok(camera.length>1,'the camera has a mix on');assert.deepEqual(looks,[camera[0],camera[0]],'in its main Look only');
   await page.click('#grid button');await page.waitForSelector('#viewer:not([hidden])');
  });
  await check(`${label}: your own pictures as die-cut stickers: a cut-out round its outline, a photo with rounded corners`,async()=>{
   await page.click('#closeViewer');await page.click('#closeAlbum');await page.waitForFunction(()=>window.pocketCamera.state.camera.running,null,{timeout:20000});
   await page.click('.sticker-button');await page.click('#stickerSets button:text-is("Mine")');await page.waitForSelector('.sticker-choice.make');
   await page.setInputFiles('#stickerFile',cutout);
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.some(s=>s.id.startsWith('mine:')),null,{timeout:20000});
   await page.click('.sticker-button');await page.click('#stickerSets button:text-is("Mine")');
   await page.setInputFiles('#stickerFile',garden);
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.filter(s=>s.id.startsWith('mine:')).length===2,null,{timeout:20000});
   const cuts=await app(async()=>{
    const {listMine}=await import('/camera/album.js?v=20261029b');
    return (await listMine()).map(m=>m.cut);
   });
   assert.deepEqual(cuts,['outline','photo']);
   await page.waitForTimeout(400);await shot('10c-own-stickers');
   // Deleted from the sheet, and off the viewfinder with it.
   await page.click('.sticker-button');await page.click('#stickerSets button:text-is("Mine")');
   await page.click('.sticker-choice.mine >> nth=0 >> .mine-remove');await page.click('#deleteSheet button[value="delete"]');
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.filter(s=>s.id.startsWith('mine:')).length===1);
   await page.click('#stickerSheet .done');
   await page.click('#roll');await page.waitForSelector('#grid button');await page.click('#grid button');await page.waitForSelector('#viewer:not([hidden])');
  });
  await check(`${label}: deleting a photo`,async()=>{
   const n=await app(()=>window.pocketCamera.state.shots.length);
   await page.click('#deletePhoto');await page.click('#deleteSheet button[value="delete"]');
   await page.waitForFunction(n=>window.pocketCamera.state.shots.length===n-1,n);
   await page.waitForSelector('#album:not([hidden])');
  });
  await check(`${label}: the album and your own stickers last a reload`,async()=>{
   const n=await app(()=>window.pocketCamera.state.shots.length);
   await page.reload();await page.waitForFunction(n=>window.pocketCamera?.state.shots.length===n,n,{timeout:20000});
   await page.waitForFunction(()=>document.querySelector('#cameraFrame .sticker img[src^="blob:"]'),null,{timeout:20000});
  });
  await check(`${label}: lost graphics never save a black photo`,async()=>{
   const out=await app(async()=>{
    const pc=window.pocketCamera,ext=pc.engine.gl.getExtension('WEBGL_lose_context');if(!ext)return {skipped:true};
    const canvas=document.querySelector('#cameraFrame canvas'),within=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r('timeout'),ms))]);
    const lost=new Promise(r=>canvas.addEventListener('webglcontextlost',()=>r('lost'),{once:true}));
    const restored=new Promise(r=>canvas.addEventListener('webglcontextrestored',()=>r('restored'),{once:true}));
    const count=pc.state.shots.length;ext.loseContext();
    await pc.takePhoto();const afterLost=pc.state.shots.length;
    const event=await within(lost,5000);ext.restoreContext();
    const back=await within(restored,10000);await new Promise(r=>setTimeout(r,800));
    return {count,afterLost,event,back,shutter:!document.querySelector('#shutter').disabled};
   });
   if(out.skipped)return;
   assert.equal(out.afterLost,out.count,'no photo kept while the graphics were lost');
   assert.equal(out.event,'lost');
   // Headless Chromium with software WebGL never restores a lost context, even on a bare canvas; there only the first
   // half (no black photo) can be checked.
   if(out.back==='timeout'){console.log('    (this browser does not restore lost contexts: the camera coming back is not checked)');return;}
   assert.ok(out.shutter,'the shutter is back');
  });
  await check(`${label}: no page errors`,async()=>assert.deepEqual(errors,[]));
 }finally{await browser.close();}
}

// The first screen at the sizes a phone's browser really leaves (an iPhone's Safari with its toolbar, an iPhone SE):
// the greeting whole inside the picture's space (the owner, on an iPhone, 29 October 2026: Fuji cut off and Start
// camera under the Look strip), the strip waiting for a picture, the shutter starting the camera; and what the Home
// Screen needs (the manifest and its icons).
async function firstScreen({label,width,height}){
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 try{
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${server.url}camera/`);
  await page.waitForFunction(()=>!document.querySelector('#welcome').hidden&&document.querySelector('#welcomeSticker').complete&&!document.querySelector('#welcomeSticker').hidden,null,{timeout:20000});
  await check(`${label}: the greeting fits whole, the strip waits, its button starts the camera`,async()=>{
   const out=await page.evaluate(()=>{
    const stage=document.querySelector('#cameraStage').getBoundingClientRect(),inside=[];
    for(const el of document.querySelectorAll('#welcome > *')){
     const r=el.getBoundingClientRect();if(!r.width||getComputedStyle(el).display==='none')continue;
     inside.push({el:el.id||el.className||el.tagName,ok:r.top>=stage.top-.5&&r.bottom<=stage.bottom+.5&&r.left>=stage.left-.5&&r.right<=stage.right+.5});
    }
    const sticker=document.querySelector('#welcomeSticker').getBoundingClientRect();
    const shutter=document.querySelector('#shutter');
    return {inside,sticker:sticker.height,tray:getComputedStyle(document.querySelector('#tray')).display,
     shutter:shutter.offsetParent!==null&&getComputedStyle(shutter).visibility!=='hidden'};
   });
   for(const i of out.inside)assert.ok(i.ok,`${i.el} inside the stage`);
   assert.ok(out.inside.some(i=>/actions/.test(i.el)),'the buttons are shown');
   assert.ok(out.sticker>=60,`the greeting sticker is shown whole and not tiny (${Math.round(out.sticker)} px)`);
   assert.equal(out.tray,'none','no Look strip before there is a picture');
   assert.equal(out.shutter,false,'one way to start the camera: no shutter under the greeting');
   await context.grantPermissions(['camera']);
   await page.locator('#startCamera').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.camera.running,null,{timeout:20000});
   assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#tray')).display!=='none'&&document.querySelector('#shutter').offsetParent!==null&&document.querySelector('#shutter').getAttribute('aria-label')),'Take photo');
  });
  await check(`${label}: the Home Screen app's manifest and icons`,async()=>{
   const out=await page.evaluate(async()=>{
    const link=document.querySelector('link[rel="manifest"]').href,manifest=await (await fetch(link)).json();
    const icons=[...manifest.icons.map(i=>new URL(i.src,link).href),document.querySelector('link[rel="apple-touch-icon"]').href,document.querySelector('link[rel="icon"]').href];
    const sizes=await Promise.all(icons.map(async u=>{const b=await createImageBitmap(await (await fetch(u)).blob());return [b.width,b.height];}));
    return {manifest,sizes,worker:!!(await navigator.serviceWorker.getRegistration())};
   });
   assert.equal(out.manifest.display,'standalone');assert.equal(out.manifest.start_url,'/camera/');
   assert.deepEqual(out.sizes,[[192,192],[512,512],[512,512],[180,180],[32,32]]);
   assert.ok(out.manifest.icons.some(i=>i.purpose==='maskable'),'a maskable icon');
   assert.ok(out.worker,'the offline worker is registered');
  });
  await check(`${label}: first screen without page errors`,async()=>assert.deepEqual(errors,[]));
 }finally{await browser.close();}
}

// The printer every saved photo comes out of, and Memory with the album's own photos and with a sticker sheet (the owner,
// 29 October 2026: "the mini games and the printer animation when saving … memory with our own photos or with the
// stickers"), at an iPhone's Safari size.
async function playAndPrint({label,width,height}){
 const y4m=join(temp,`${label}.y4m`);let fake=[];
 try{execFileSync('ffmpeg',['-loglevel','error','-y','-loop','1','-i',photo,'-t','1','-r','10','-vf','crop=ih*3/4:ih,scale=720:960,format=yuv420p',y4m]);fake=[`--use-file-for-fake-video-capture=${y4m}`];}catch{}
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream',...fake]});
 try{
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true,permissions:['camera']});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`${server.url}camera/`);
  await clearSamplesForRegression(page,label);
  await page.waitForFunction(()=>window.pocketCamera?.state.camera.running,null,{timeout:20000});
  await check(`${label}: the picture takes the whole width; the Looks unfold from the Look's name`,async()=>{
   await page.waitForFunction(()=>document.querySelector('#camera').classList.contains('compact'),null,{timeout:10000});
   const look=()=>page.evaluate(()=>{const f=document.querySelector('#cameraFrame').getBoundingClientRect(),t=document.querySelector('#tray').getBoundingClientRect();
    return {frame:Math.round(f.width),screen:innerWidth,strip:getComputedStyle(document.querySelector('#strip')).display,open:document.querySelector('#camera').classList.contains('looks-open'),trayOver:t.top>=f.top&&t.top<f.bottom-30&&t.bottom<=f.bottom+4};});
   let v=await look();
   assert.ok(v.frame>=v.screen-2,`the picture is the screen's width (${v.frame} of ${v.screen} px)`);
   assert.equal(v.strip,'none','the strip is folded');assert.ok(v.trayOver,'the Look row is on the picture');
   await page.locator('#layers .layer.active .layer-pick').tap();
   v=await look();assert.ok(v.open&&v.strip!=='none','the Look name unfolds the strip');
   await page.locator('#lookGroups button[data-group="photo"]').tap();await page.locator('#strip .tile[data-look="sepia"]').tap();
   assert.equal(await page.evaluate(()=>window.pocketCamera.state.camera.recipe.layers[0].look),'sepia');
   const f=await page.locator('#cameraFrame').boundingBox();await page.touchscreen.tap(f.x+f.width/2,f.y+f.height*.3);
   await page.waitForFunction(()=>!document.querySelector('#camera').classList.contains('looks-open'));
   await page.locator('#layers .layer.active .layer-pick').tap();await page.locator('#lookGroups button[data-group="games"]').tap();await page.locator('#strip .tile[data-look="pocket"]').tap();
   await page.touchscreen.tap(f.x+f.width/2,f.y+f.height*.3);
   // Every row fits across the phone held upright: nothing runs off its edge (the owner: "parts are truncated in portrait").
   const fits=sel=>page.evaluate(sel=>{const e=document.querySelector(sel),r=e.getBoundingClientRect();
    return e.scrollWidth<=e.clientWidth+1&&[...e.children].every(k=>{const q=k.getBoundingClientRect();return q.left>=Math.max(r.left,0)-1&&q.right<=Math.min(r.right,innerWidth)+1&&k.scrollWidth<=k.clientWidth+1;});},sel);
   await page.locator('#settingsToggle').tap();assert.ok(await fits('#settings'),'all seven settings fit across');await page.locator('#settingsToggle').tap();
   await page.locator('.sticker-button').tap();await page.waitForSelector('#stickerSheet[open] .sticker-choice');
   assert.ok(await fits('#stickerSets'),'every sticker tab fits across');
   assert.ok(await page.$$eval('#stickerSets button',b=>b.every(x=>x.getBoundingClientRect().height>=28)),'the tabs keep their height');
   assert.deepEqual(await page.$$eval('#stickerSets button',b=>b.map(x=>x.textContent)),['Text','Thuan','Johansson','Thao','Manga','Mine'],'a tab a resident, and Manga');
   await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#stickerSheet').open);
   // A sheet puts the settings row away: one panel at a time.
   await page.locator('#settingsToggle').tap();await page.locator('#frameSetting').tap();await page.waitForSelector('#frameSheet[open]');
   assert.equal(await page.isHidden('#settings'),true,'the settings row is put away when a sheet comes up');
   await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#frameSheet').open);
  });
  await check(`${label}: the shutter prints the photo, and the print lands in the album`,async()=>{
   const out=await page.evaluate(async()=>{
    const pc=window.pocketCamera,seen={scene:false,paper:false,steps:new Set()};
    const watch=setInterval(()=>{const sc=document.querySelector('.printer-scene'),p=document.querySelector('.printer-paper');if(sc)seen.scene=true;if(p){seen.paper=true;seen.steps.add(getComputedStyle(p).transform);}},40);
    const before=pc.state.shots.length,t=performance.now();await pc.takePhoto();clearInterval(watch);
    return {scene:seen.scene,paper:seen.paper,steps:seen.steps.size,ms:performance.now()-t,kept:pc.state.shots.length-before,left:!!document.querySelector('.printer-scene,.printer-flyer'),roll:!document.querySelector('#roll img').hidden};
   });
   assert.ok(out.scene&&out.paper,'the printer and its paper showed');
   assert.ok(out.steps>4,`the paper fed out in steps (${out.steps} positions seen)`);
   assert.equal(out.kept,1,'the photo is in the album');assert.equal(out.left,false,'nothing of the printer is left');assert.ok(out.roll,'the thumbnail shows it');
  });
  await check(`${label}: a tap skips the printer; Print off saves without it`,async()=>{
   const out=await page.evaluate(async()=>{
    const pc=window.pocketCamera,shooting=pc.takePhoto();let t=0;
    await new Promise(r=>{const w=setInterval(()=>{const sc=document.querySelector('.printer-scene');if(sc){clearInterval(w);setTimeout(()=>{t=performance.now();sc.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));r();},500);}},20);});
    await shooting;const skipped=performance.now()-t;
    document.querySelector('#printSetting').click();
    let printed=false;const w=setInterval(()=>{if(document.querySelector('.printer-scene'))printed=true;},20);
    await pc.takePhoto();clearInterval(w);const off=pc.state.printer;document.querySelector('#printSetting').click();
    return {skipped,printed,off,on:pc.state.printer};
   });
   // After the tap only the tear and the flight are left (0.7 s; more in software graphics).
   assert.ok(out.skipped<1800,`a tap skipped to the tear (${Math.round(out.skipped)} ms after it)`);
   assert.equal(out.printed,false,'no printer with Print off');assert.equal(out.off,false);assert.equal(out.on,true,'Print back on');
  });
  // The residents' stickers are figures without words; words are stickers of their own (the owner: "Make the stickers
  // without text and we can add any text as another sticker", "Or without the balloon too").
  await check(`${label}: words alone, a resident's own words, and lettering that changes its style`,async()=>{
   await page.evaluate(()=>{window.pocketCamera.state.camera.recipe.stickers.length=0;window.pocketCamera.cameraStickers.render();});
   await page.locator('.sticker-button').tap();await page.locator('#stickerSets button',{hasText:/^Text$/}).tap();
   await page.locator('.sticker-choice.lettering[data-id="balloon:words"]').tap();
   await page.waitForSelector('#textSheet[open]');
   assert.equal(await page.getAttribute('#letteringStyles [data-style="balloon:words"]','aria-checked'),'true','Words is chosen in the sheet');
   await page.fill('#balloonText','Nankurunaisa!');await page.locator('#textDone').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.length===1,null,{timeout:5000});
   let last=await page.evaluate(()=>window.pocketCamera.state.camera.recipe.stickers.at(-1));
   assert.equal(last.id,'balloon:words');assert.equal(last.text,'Nankurunaisa!');assert.ok(last.y>.6,'words alone go low, as a caption');
   // A resident's sticker, chosen, offers their own line: as a speech balloon, or here as words alone under them.
   await page.locator('.sticker-button').tap();await page.locator('#stickerSets button',{hasText:/^Thuan$/}).tap();
   await page.locator('.sticker-choice[data-id="thuan/Wave"]').tap();
   await page.waitForSelector('#cameraFrame .sticker.selected .sticker-say');
   const line=await page.evaluate(()=>window.pocketCamera.state.camera.recipe.stickers.at(-1));
   await page.locator('#cameraFrame .sticker.selected .sticker-say').tap();
   await page.waitForSelector('#textSheet[open]');
   const offered=await page.evaluate(()=>({text:document.querySelector('#balloonText').value,title:document.querySelector('#textSheetTitle').textContent,speech:document.querySelector('#letteringStyles [data-style="balloon:speech"]').getAttribute('aria-checked')}));
   assert.equal(offered.text,'Chào nha!','Thuan’s own words, ready to letter');assert.equal(offered.title,'What does Thuan say?');assert.equal(offered.speech,'true');
   await page.locator('#letteringStyles [data-style="balloon:words"]').tap();await page.locator('#textDone').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.length===3);
   last=await page.evaluate(()=>window.pocketCamera.state.camera.recipe.stickers.at(-1));
   assert.equal(last.id,'balloon:words');assert.equal(last.text,'Chào nha!');assert.ok(last.y>line.y,'under her feet, where the stickers carried their words');
   // The same words as a shout: the style changes, the words stay.
   await page.evaluate(()=>window.pocketCamera.cameraStickers.select(2));
   await page.locator('#cameraFrame .sticker.selected').dblclick();await page.waitForSelector('#textSheet[open]');
   await page.locator('#letteringStyles [data-style="balloon:shout"]').tap();await page.locator('#textDone').tap();
   // The sheet's close event comes a moment after the tap; the style changes then.
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.at(-1).id!=='balloon:words',null,{timeout:5000}).catch(()=>{});
   last=await page.evaluate(()=>window.pocketCamera.state.camera.recipe.stickers.at(-1));
   assert.equal(last.id,'balloon:shout');assert.equal(last.text,'Chào nha!');
   await page.evaluate(()=>{window.pocketCamera.state.camera.recipe.stickers.length=0;window.pocketCamera.cameraStickers.render();});
  });
  await check(`${label}: a manga moment: focus lines on a face, a sound effect, an emotion mark, kept in the save`,async()=>{
   const pc=()=>window.pocketCamera;
   await page.evaluate(()=>{window.pocketCamera.state.camera.recipe.stickers.length=0;window.pocketCamera.cameraStickers.render();});
   // The Manga tab: the lines first, then the marks under their name; the tabs still fit across the phone.
   await page.locator('.sticker-button').tap();await page.locator('#stickerSets button',{hasText:/^Manga$/}).tap();
   await page.waitForSelector('.sticker-choice.effect[data-id="effect:focus"]');await page.waitForSelector('.sticker-choice[data-id^="marks/"]');
   const sheet=await page.evaluate(()=>({tabs:[...document.querySelectorAll('#stickerSets button')].map(b=>b.textContent),
    effects:[...document.querySelectorAll('.sticker-choice.effect')].map(b=>b.dataset.id),marks:document.querySelectorAll('.sticker-choice[data-id^="marks/"]').length,
    heading:[...document.querySelectorAll('#stickerGrid .sticker-heading')].map(h=>h.textContent)}));
   assert.deepEqual(sheet.tabs,['Text','Thuan','Johansson','Thao','Manga','Mine']);
   assert.deepEqual(sheet.effects,['effect:focus','effect:speed']);assert.equal(sheet.marks,10);assert.deepEqual(sheet.heading,['Marks']);
   assert.ok(await page.evaluate(()=>{const e=document.querySelector('#stickerSets'),r=e.getBoundingClientRect();return [...e.children].every(k=>{const q=k.getBoundingClientRect();return q.left>=r.left-1&&q.right<=r.right+1;});}),'six tabs fit across');
   await page.locator('.sticker-choice.effect[data-id="effect:focus"]').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.some(s=>s.id==='effect:focus'));
   // The lines: ink near the edges, the clear circle round their centre left clear.
   const lines=await page.evaluate(()=>{
    const art=document.querySelector('#cameraFrame .effects-art'),g=art.getContext('2d'),w=art.width,h=art.height,s=window.pocketCamera.state.camera.recipe.stickers[0];
    const alpha=(x,y,r)=>{const d=g.getImageData(Math.round(x-r),Math.round(y-r),Math.round(2*r),Math.round(2*r)).data;let a=0;for(let i=3;i<d.length;i+=4)a+=d[i];return a/(d.length/4)/255;};
    return {shown:!art.hidden,edge:alpha(w*.08,h*.08,w*.06),centre:alpha(s.x*w,s.y*h,s.size*h*.3)};
   });
   assert.ok(lines.shown&&lines.edge>.08,`the lines are drawn towards the edges (${lines.edge.toFixed(3)})`);assert.equal(lines.centre,0,'the clear circle is clear');
   // A dragged centre moves the lines with it.
   const ring=await page.locator('#cameraFrame .sticker.effect').boundingBox();
   await page.mouse.move(ring.x+ring.width/2,ring.y+ring.height/2);await page.mouse.down();await page.mouse.move(ring.x+ring.width/2+40,ring.y+ring.height/2+30,{steps:5});await page.mouse.up();
   const moved=await page.evaluate(()=>window.pocketCamera.state.camera.recipe.stickers[0]);assert.ok(moved.x>.52&&moved.y>.44,'the centre follows the finger');
   // A sound effect, from the ready-made words.
   await page.locator('.sticker-button').tap();await page.locator('#stickerSets button',{hasText:/^Text$/}).tap();
   await page.locator('.sticker-choice.lettering[data-id="balloon:sfx"]').tap();await page.waitForSelector('#textSheet[open]');
   assert.equal(await page.isVisible('#soundPresets'),true,'the sound effects are offered');
   await page.locator('#soundPresets button',{hasText:'ゴゴゴ'}).tap();await page.locator('#textDone').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.some(s=>s.id==='balloon:sfx'));
   assert.equal(await page.evaluate(()=>window.pocketCamera.state.camera.recipe.stickers.find(s=>s.id==='balloon:sfx').text),'ゴゴゴ');
   // An emotion mark, and the marks are no deck for Memory.
   await page.locator('.sticker-button').tap();await page.locator('#stickerSets button',{hasText:/^Manga$/}).tap();
   await page.locator('.sticker-choice[data-id="marks/sweat"]').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.some(s=>s.id==='marks/sweat'));
   // Saved: the lines are in the photo, under the mark and the sound.
   const before=await page.evaluate(()=>window.pocketCamera.state.shots.length);
   await page.evaluate(()=>{window.pocketCamera.state.printer=false;});await page.evaluate(()=>window.pocketCamera.takePhoto());
   await page.waitForFunction(n=>window.pocketCamera.state.shots.length===n+1,before);
   const saved=await page.evaluate(async()=>{
    const shot=window.pocketCamera.state.shots[0],b=await createImageBitmap(shot.photo),c=document.createElement('canvas');c.width=b.width;c.height=b.height;
    const g=c.getContext('2d');g.drawImage(b,0,0);
    const s=shot.recipe.stickers.find(x=>x.id==='effect:focus'),dark=(x,y,r)=>{const d=g.getImageData(Math.round(x-r),Math.round(y-r),Math.round(2*r),Math.round(2*r)).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]+d[i+1]+d[i+2]<90)n++;return n/(d.length/4);};
    return {ids:shot.recipe.stickers.map(x=>x.id),order:shot.recipe.stickers.map(x=>x.id),edge:dark(b.width*.06,b.height*.06,b.width*.05)};
   });
   assert.deepEqual([...saved.ids].sort(),['balloon:sfx','effect:focus','marks/sweat']);
   assert.ok(saved.edge>.05,`the focus lines are printed into the photo (${saved.edge.toFixed(3)} of the corner inked)`);
   await page.evaluate(()=>{window.pocketCamera.state.printer=true;window.pocketCamera.state.camera.recipe.stickers.length=0;window.pocketCamera.cameraStickers.render();});
  });
  // Six photos of their own for the album, as the photographer would bring in.
  await page.evaluate(async()=>{
   const blob=await (await fetch('/assets/images/nils-lake-hero-optimized.jpg')).blob();
   await window.pocketCamera.useFiles([0,1,2,3,4,5].map(i=>new File([blob],`lake-${i}.jpg`,{type:'image/jpeg',lastModified:Date.now()-i*1000})));
  });
  await page.waitForFunction(()=>window.pocketCamera.state.mode==='album',null,{timeout:60000});
  // Several photos go into the album in the camera's main Look alone, as one photo opens.
  assert.ok((await page.evaluate(()=>window.pocketCamera.state.shots.slice(0,6).map(s=>s.recipe.layers.length))).every(n=>n===1),'imported in the main Look only');
  await check(`${label}: Memory with the album's own photos: the board fits, a miss turns back, the last pair wins`,async()=>{
   await page.locator('#playMemory').tap();
   await page.waitForSelector('.memory-deck[data-deck="photos"]:not([disabled])',{timeout:15000});
   await page.locator('.memory-deck[data-deck="photos"]').tap();await page.locator('.memory-pairs button',{hasText:/^6$/}).tap();
   await page.locator('.memory-play').tap();await page.waitForSelector('.memory-card');await page.waitForTimeout(300);
   const fit=await page.evaluate(()=>{const s=document.querySelector('.memory-stage').getBoundingClientRect();return [...document.querySelectorAll('.memory-card')].every(c=>{const r=c.getBoundingClientRect();return r.width>40&&r.left>=s.left-.5&&r.right<=s.right+.5&&r.top>=s.top-.5&&r.bottom<=s.bottom+.5;});});
   assert.ok(fit,'every card is whole on the screen and not tiny');
   const pairs=await page.evaluate(()=>window.pocketCamera.memory.game.cards.map(c=>c.pair));
   const other=pairs.findIndex((p,i)=>i>0&&p!==pairs[0]),third=pairs.findIndex((p,i)=>i>0&&i!==other&&p!==pairs[0]&&p!==pairs[other]);
   const card=i=>page.locator('.memory-card').nth(i);
   await card(0).tap();await card(other).tap();
   // A third card straight away turns the two that did not match back.
   await card(third).tap();
   const after=await page.evaluate(()=>window.pocketCamera.memory.game.cards.filter(c=>c.up&&!c.matched).length);
   assert.equal(after,1,'only the third card is up');
   await page.waitForTimeout(900);
   // The third card is still up: its partner first, then every other pair.
   for(const p of [pairs[third],...new Set(pairs.filter(q=>q!==pairs[third]))]){
    const both=pairs.map((q,i)=>q===p?i:-1).filter(i=>i>=0);
    for(const i of both){if(!(await page.evaluate(i=>window.pocketCamera.memory.game.cards[i].up,i)))await card(i).tap();}
    await page.waitForTimeout(60);
   }
   await page.waitForSelector('.memory-win:not([hidden])',{timeout:8000});
   const out=await page.evaluate(()=>({game:window.pocketCamera.memory.game,best:JSON.parse(localStorage.getItem('office-pocket-camera')).memoryBest,cheer:!!document.querySelector('.memory-cheer')}));
   assert.equal(out.game.found,6);assert.ok(out.game.over);assert.ok(out.best['photos:6'],'the best game is kept');assert.ok(out.cheer,'a resident cheers');
  });
  await check(`${label}: Memory with a sticker sheet, 12 pairs`,async()=>{
   assert.equal(await page.locator('.memory-deck[data-deck="set:Marks"]').count(),0,'the manga marks are no deck');
   await page.locator('.memory-win button',{hasText:'Other cards'}).tap();
   await page.locator('.memory-deck[data-deck="set:Cartoon Thuan"]').tap();await page.locator('.memory-pairs button',{hasText:/^12$/}).tap();
   await page.locator('.memory-play').tap();await page.waitForSelector('.memory-card');
   const out=await page.evaluate(()=>{const g=window.pocketCamera.memory.game,ids=new Set(g.cards.map(c=>c.item.id));return {n:g.cards.length,ids:ids.size,kind:document.querySelector('.memory-board').className};});
   assert.equal(out.n,24);assert.equal(out.ids,12);assert.match(out.kind,/deck-sticker/);
   await page.locator('#closeMemory').tap();await page.waitForFunction(()=>window.pocketCamera.state.mode==='album');
  });
  await check(`${label}: the pixel frames, drawn in Python, close round every shape and are kept in the save`,async()=>{
   await page.locator('#closeAlbum').tap();await page.waitForFunction(()=>window.pocketCamera.state.camera.running,null,{timeout:20000});
   const out=await page.evaluate(async()=>{
    const {FRAMES,drawFrame,frameInner}=await import('/camera/frames.js?v=20261029f'),report={};
    for(const f of FRAMES.filter(f=>f.pixel))for(const [w,h] of [[960,720],[720,960],[1280,720]]){
     const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');drawFrame(g,f.id,w,h);
     const d=g.getImageData(0,0,w,h).data,inner=frameInner(f.id,w,h);let open=0,seen=0;
     for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=3){const inBorder=x<inner.x-1||x>inner.x+inner.w+1||y<inner.y-1||y>inner.y+inner.h+1;if(inBorder){seen++;if(d[(y*w+x)*4+3]<255)open++;}}
     const mid=d[((h>>1)*w+(w>>1))*4+3];
     report[`${f.id} ${w}x${h}`]={open,seen,mid,border:Math.round(inner.x)};
    }
    const pc=window.pocketCamera;pc.state.printer=false;pc.state.camera.recipe.frame='harbour';
    await pc.takePhoto();pc.state.camera.recipe.frame='none';pc.state.printer=true;
    const shot=pc.state.shots[0],bmp=await createImageBitmap(shot.photo),c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;
    const g=c.getContext('2d');g.drawImage(bmp,0,0);const side=[...g.getImageData(Math.round(bmp.width*.03),Math.round(bmp.height*.5),1,1).data];
    return {report,pixel:FRAMES.filter(f=>f.pixel).map(f=>f.id),side,frame:shot.recipe.frame};
   });
   assert.deepEqual(out.pixel,['pocket','harbour','sakura','ticket','matsuri','hello','island-post','shop-day','adventure']);
   for(const [k,r] of Object.entries(out.report)){assert.equal(r.open,0,`${k}: ${r.open} of ${r.seen} border pixels open`);assert.equal(r.mid,0,`${k}: the photo's middle is clear`);assert.ok(r.border>30,`${k}: a border of ${r.border} px`);}
   assert.equal(out.frame,'harbour');
   // The harbour's sky down the left side (#9fd0ee), not the photo, in the saved JPEG.
   assert.ok(Math.abs(out.side[0]-159)<14&&Math.abs(out.side[1]-208)<14&&Math.abs(out.side[2]-238)<14,`the saved photo has the frame's sky at its side (${out.side.slice(0,3)})`);
  });
  await check(`${label}: printer and Memory without page errors`,async()=>assert.deepEqual(errors,[]));
 }finally{await browser.close();}
}

// Comics (comic.js; the owner, 29 October 2026: "I think the stamp function is better than the comic builder in
// Johansson Studio … Bring it to the camera or its own mini app?"): a page of panels filled from Minato's places, the
// album and the camera, its pictures moved in their panels, residents standing on a place's floor, lettering in the
// chosen panel, saved as a page with clean gutters and inked borders, and opened again panel by panel; at an iPhone's
// Safari size, with touch.
async function makeComics({label,width,height}){
 const y4m=join(temp,`${label}-comic.y4m`);let fake=[];
 try{execFileSync('ffmpeg',['-loglevel','error','-y','-loop','1','-i',photo,'-t','1','-r','10','-vf','crop=ih*3/4:ih,scale=720:960,format=yuv420p',y4m]);fake=[`--use-file-for-fake-video-capture=${y4m}`];}catch{}
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream',...fake]});
 try{
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true,permissions:['camera']});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const shot=async step=>{if(shots)await page.screenshot({path:join(shots,`${label}-comic-${step}.png`)});};
  await page.goto(`${server.url}camera/`);
  await page.waitForFunction(()=>window.pocketCamera?.state.camera.running&&window.pocketCamera.state.shots.length>=2,null,{timeout:30000});
  const edit=fn=>page.evaluate(fn);
  // A point of the page (shares) on the screen, to tap.
  const at=async(x,y)=>{const b=await page.locator('#editFrame').boundingBox();return {x:b.x+b.width*x,y:b.y+b.height*y};};
  const panelCentre=async i=>{const c=await page.evaluate(i=>{const b=window.pocketCamera.panelArea(i);return {x:(b.x+b.w/2),y:(b.y+b.h/2)};},i);return at(c.x,c.y);};
  await check(`${label}: a comic from the album: Panels first, the layouts all across, a tap on an empty panel asks what fills it`,async()=>{
   await page.locator('#roll').tap();await page.waitForSelector('#album:not([hidden])');
   await page.locator('#openComic').tap();await page.waitForFunction(()=>window.pocketCamera.state.edit?.comic);
   const tabs=await page.$$eval('#editDock .segmented button',b=>b.filter(x=>!x.hidden).map(x=>[x.textContent,x.getAttribute('aria-selected')]));
   assert.deepEqual(tabs,[['Panels','true'],['Looks','false'],['Adjust','false'],['Stickers','false']],'a page has Panels in place of Frame');
   assert.equal(await page.$$eval('#layoutChoices .layout-choice',b=>b.length),8);
   assert.ok(await page.evaluate(()=>{const e=document.querySelector('#layoutChoices'),r=e.getBoundingClientRect();
    return e.scrollWidth<=e.clientWidth+1&&[...e.children].every(k=>{const q=k.getBoundingClientRect(),s=k.querySelector('span');return q.left>=Math.max(r.left,0)-1&&q.right<=Math.min(r.right,innerWidth)+1&&s.scrollWidth<=s.clientWidth+1;});}),'all eight layouts and their names fit across the phone');
   await page.waitForTimeout(400);await shot('1-new');
   const p=await panelCentre(0);await page.touchscreen.tap(p.x,p.y);
   await page.waitForSelector('#comicSheet[open]');
   assert.deepEqual(await page.$$eval('#comicSources button',b=>b.map(x=>x.textContent)),['Places','Album','Camera','Photos']);
   await page.waitForSelector('#comicGrid .comic-choice');
   const names=await page.$$eval('#comicGrid .comic-choice',b=>b.map(x=>x.getAttribute('aria-label')));
   assert.equal(names.length,19,'all of World’s places');assert.equal(names[0],'Sakura Shōten');
   await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>document.querySelector('#comicSheet').open),true,'the tap that opened the sheet does not close it again');
   await shot('2-places');
   await page.locator('#comicGrid .comic-choice',{hasText:'Sakura Shōten'}).tap();
   await page.waitForFunction(()=>window.pocketCamera.state.edit.comic.slots[0].picture);
   const view=await edit(()=>({ref:window.pocketCamera.state.edit.comic.slots[0].ref,name:document.querySelector('#comicPanelName').textContent,angles:[...document.querySelectorAll('#comicViews button')].map(b=>b.textContent)}));
   assert.equal(view.ref,'place:sakura/wide');assert.match(view.name,/Panel 1 of 3 · Sakura Shōten/);
   await page.waitForFunction(()=>document.querySelectorAll('#comicViews button').length===4);
   assert.deepEqual(await page.$$eval('#comicViews button',b=>b.map(x=>x.textContent)),['Wide','Close','Low','High']);
  });
  await check(`${label}: a tap on an empty lower panel opens its sheet, and the tap's own click chooses nothing in it`,async()=>{
   // Looked at a moment later: the click that picked a picture would have closed the sheet again at once.
   const p=await panelCentre(1);await page.touchscreen.tap(p.x,p.y);await page.waitForTimeout(800);
   const s=await edit(()=>({open:document.querySelector('#comicSheet').open,title:document.querySelector('#comicSheetTitle').textContent,filled:!!window.pocketCamera.state.edit.comic.slots[1].picture,mode:window.pocketCamera.state.mode}));
   assert.deepEqual(s,{open:true,title:'Panel 2',filled:false,mode:'editor'},'the sheet stays open and the panel empty');
   await page.locator('#comicSheet .done').tap();await page.waitForFunction(()=>!document.querySelector('#comicSheet').open);
  });
  await check(`${label}: a picture moves inside its panel; tapped twice the page zooms in on the panel, and out again`,async()=>{
   const before=await edit(()=>({...window.pocketCamera.state.edit.comic.slots[0].view}));
   const p=await panelCentre(0);
   await page.evaluate(async({x,y})=>{
    // A one-finger drag, as touch pointers.
    const frame=document.querySelector('#editFrame'),el=document.elementFromPoint(x,y),opts=(cx,cy,type)=>({pointerId:7,pointerType:'touch',isPrimary:true,clientX:cx,clientY:cy,bubbles:true,cancelable:true,buttons:type==='pointerup'?0:1});
    el.dispatchEvent(new PointerEvent('pointerdown',opts(x,y,'pointerdown')));
    for(let i=1;i<=6;i++){frame.dispatchEvent(new PointerEvent('pointermove',opts(x-i*12,y,'pointermove')));await new Promise(r=>setTimeout(r,16));}
    frame.dispatchEvent(new PointerEvent('pointerup',opts(x-72,y,'pointerup')));
   },p);
   const after=await edit(()=>({...window.pocketCamera.state.edit.comic.slots[0].view}));
   assert.ok(after.x>before.x+.01,`the picture follows the finger (${before.x.toFixed(3)} → ${after.x.toFixed(3)})`);
   assert.equal(await edit(()=>window.pocketCamera.state.edit.recipe.layers[0].look),'none','a drag on a panel does not change the Look');
   // Tapped twice: zoomed in on it, the panel filling the stage's width; Escape shows the whole page again.
   await page.touchscreen.tap(p.x,p.y);await page.waitForTimeout(90);await page.touchscreen.tap(p.x,p.y);
   await page.waitForFunction(()=>window.pocketCamera.state.edit.comic.focus===0);await page.waitForTimeout(500);
   const zoom=await edit(()=>{
    const f=document.querySelector('#editFrame').getBoundingClientRect(),st=document.querySelector('#editStage'),s=st.getBoundingClientRect(),cs=getComputedStyle(st),a=window.pocketCamera.panelArea(0);
    const p={left:f.left+a.x*f.width,top:f.top+a.y*f.height,width:a.w*f.width,height:a.h*f.height},w=s.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),h=s.height-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    return {fill:Math.max(p.width/w,p.height/h),inside:p.left>=s.left-1&&p.left+p.width<=s.right+1&&p.top>=s.top-1&&p.top+p.height<=s.bottom+1};
   });
   assert.ok(zoom.fill>.9&&zoom.inside,`the panel fills the stage (${zoom.fill.toFixed(2)}) and is whole in it`);
   await shot('3-zoomed');
   await page.keyboard.press('Escape');await page.waitForFunction(()=>window.pocketCamera.state.edit.comic.focus===null);
   assert.equal(await edit(()=>window.pocketCamera.state.mode),'editor','Escape zooms out before it leaves');
  });
  await check(`${label}: a resident stands on the floor of the place in the chosen panel; words go in the chosen panel`,async()=>{
   await page.locator('#tabStickers').tap();await page.locator('#stickerSets button',{hasText:/^Thuan$/}).tap();
   await page.locator('#stickerGrid .sticker-choice[data-id^="thuan-blender/"]').first().tap();
   await page.waitForFunction(()=>window.pocketCamera.state.edit.recipe.stickers.length===1);
   const s=await edit(()=>{const e=window.pocketCamera.state.edit,s=e.recipe.stickers[0],b=window.pocketCamera.panelArea(0);return {s,b};});
   assert.equal(s.s.angle,0,'standing upright');
   const foot=s.s.y+s.s.size*.455,top=s.s.y-s.s.size/2;
   assert.ok(foot<=s.b.y+s.b.h+.002&&top>=s.b.y-.002&&s.s.x>s.b.x&&s.s.x<s.b.x+s.b.w,'whole inside the panel');
   assert.ok(s.s.size>s.b.h*.3&&s.s.size<s.b.h,'at a person’s height in the room');
   // The second panel chosen (filled from the album first), a speech balloon goes there.
   await edit(async()=>{const pc=window.pocketCamera;await pc.fillPanel(1,{ref:`shot:${pc.state.shots[0].id}`,blob:pc.state.shots[0].photo});pc.choosePanel(1);});
   await page.locator('#stickerSets button',{hasText:/^Text$/}).tap();
   await page.locator('#stickerGrid .sticker-choice.lettering[data-id="balloon:speech"]').tap();await page.waitForSelector('#textSheet[open]');
   await page.locator('#balloonText').fill('Who left the chairs out?');await page.locator('#textDone').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.edit.recipe.stickers.some(s=>s.id==='balloon:speech'));
   const b=await edit(()=>{const e=window.pocketCamera.state.edit;return {s:e.recipe.stickers.find(s=>s.id==='balloon:speech'),box:window.pocketCamera.panelArea(1)};});
   assert.ok(b.s.x>b.box.x&&b.s.x<b.box.x+b.box.w&&b.s.y>b.box.y&&b.s.y<b.box.y+b.box.h,'the balloon is in the chosen panel');
   assert.ok(b.s.size<b.box.h*.5,'at the panel’s scale, not the page’s');
   await page.waitForTimeout(400);await shot('4-stickers');
  });
  await check(`${label}: a panel shot with the camera: the camera for that panel, without its frame, and back into the comic`,async()=>{
   await edit(()=>{const pc=window.pocketCamera;pc.state.camera.recipe.frame='print';pc.choosePanel(2);});
   await page.locator('#tabComic').tap();await page.locator('#comicFill').tap();await page.waitForSelector('#comicSheet[open]');
   await page.locator('#comicSources button',{hasText:'Camera'}).tap();
   await page.waitForFunction(()=>window.pocketCamera.state.mode==='camera'&&window.pocketCamera.state.camera.running,null,{timeout:20000});
   const cam=await edit(()=>({back:!document.querySelector('#backToComic').hidden,name:document.querySelector('#panelShootName').textContent,
    roll:getComputedStyle(document.querySelector('#roll')).visibility,frame:document.querySelector('#cameraFrame canvas.frame-art')?.hidden!==false,
    settings:['frameSetting','stamp'].map(id=>getComputedStyle(document.getElementById(id)).display),status:!!document.querySelector('#settingsStatus use[href="#i-frame"]')}));
   assert.deepEqual(cam,{back:true,name:'Panel 3',roll:'hidden',frame:true,settings:['none','none'],status:false},'the way back to the comic, no album, no frame (nor a Frame or Date setting)');
   await page.waitForTimeout(600);await shot('5-camera');
   const shots=await edit(()=>window.pocketCamera.state.shots.length);
   await edit(()=>window.pocketCamera.takePhoto());
   await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor'&&window.pocketCamera.state.edit?.comic?.slots[2].picture,null,{timeout:30000});
   const back=await edit(()=>({ref:window.pocketCamera.state.edit.comic.slots[2].ref,shots:window.pocketCamera.state.shots.length,frame:window.pocketCamera.state.shots[0].recipe.frame,back:document.querySelector('#backToComic').hidden}));
   assert.match(back.ref,/^shot:/);assert.equal(back.shots,shots+1,'kept in the album too');assert.equal(back.frame,'none','shot without the camera’s frame');assert.equal(back.back,true);
   await edit(()=>{window.pocketCamera.state.camera.recipe.frame='none';});
  });
  await check(`${label}: the comic saves as a page with clean gutters and inked borders, and opens again panel by panel`,async()=>{
   await edit(()=>{const pc=window.pocketCamera;pc.state.edit.recipe.layers=[{look:'manga',amount:1}];pc.state.printer=false;});
   await page.locator('#saveEdit').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer',null,{timeout:120000});
   const saved=await edit(async()=>{
    const shot=window.pocketCamera.state.viewing,b=await createImageBitmap(shot.photo),c=document.createElement('canvas');c.width=b.width;c.height=b.height;
    const g=c.getContext('2d');g.drawImage(b,0,0);
    const e=shot.recipe.comic,{pageGeometry}=await import('/camera/comic.js?v=20261029b'),geo=pageGeometry(e.layout,b.width,b.height);
    const px=(x,y)=>[...g.getImageData(Math.round(x),Math.round(y),1,1).data].slice(0,3);
    const p0=geo.panels[0].box,p1=geo.panels[1].box;
    // The gutter between the two lower panels.
    return {size:[b.width,b.height],layout:e.layout,refs:e.panels.map(p=>p.ref&&p.ref.split(':')[0]),kept:(shot.panels||[]).map(p=>p?p.size>0:null),
     margin:px(geo.margin/2,b.height/2),gutter:px(p1.x+p1.w+geo.gutter/2,p1.y+p1.h/2),border:px(p0.x+1,p0.y+p0.h/2),looks:shot.recipe.layers.map(l=>l.look),stickers:shot.recipe.stickers.length};
   });
   assert.deepEqual(saved.size,[2250,3000]);assert.equal(saved.layout,'hero');
   assert.deepEqual(saved.refs,['place','shot','shot']);assert.deepEqual(saved.kept,[true,true,true],'every panel’s picture is kept, a place’s too');
   for(const [name,c] of [['margin',saved.margin],['gutter',saved.gutter]])assert.ok(c.every((v,i)=>Math.abs(v-[255,253,246][i])<6),`the ${name} is clean paper (${c})`);
   assert.ok(saved.border.every(v=>v<80),`the border is inked (${saved.border})`);
   assert.deepEqual(saved.looks,['manga']);assert.equal(saved.stickers,2);
   await shot('6-saved');
   await page.locator('#editPhoto').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.edit?.comic?.slots.slice(0,3).every(s=>s.picture),null,{timeout:30000});
   const again=await edit(()=>{const e=window.pocketCamera.state.edit;return {layout:e.comic.layout,refs:e.comic.slots.slice(0,3).map(s=>s.ref.split(':')[0]),stickers:e.recipe.stickers.length,look:e.recipe.layers[0].look,id:e.shotId===window.pocketCamera.state.viewing.id};});
   assert.deepEqual(again,{layout:'hero',refs:['place','shot','shot'],stickers:2,look:'manga',id:true});
   // Another layout keeps the panels' pictures; back again, all three are there.
   await edit(()=>{const pc=window.pocketCamera;pc.setLayout('four');pc.setLayout('hero');});
   assert.equal(await edit(()=>window.pocketCamera.state.edit.comic.slots.slice(0,3).filter(s=>s.picture).length),3);
   await page.locator('#cancelEdit').tap();await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  });
  // The checks the code review of b13ea90 found missing.
  await check(`${label}: a place that cannot be fetched again (offline, not kept) opens from the comic's own copy and keeps its ref`,async()=>{
   await edit(()=>{window.realFetch=window.fetch;window.fetch=(u,...a)=>/\/feed\/sakura-/.test(String(u))?Promise.reject(new TypeError('Failed to fetch')):window.realFetch(u,...a);});
   try{
    await page.locator('#editPhoto').tap();
    await page.waitForFunction(()=>window.pocketCamera.state.edit?.comic?.slots.slice(0,3).every(s=>s.picture),null,{timeout:30000});
    assert.deepEqual(await edit(()=>{const s=window.pocketCamera.state.edit.comic.slots[0];return {ref:s.ref,place:s.place?.id};}),{ref:'place:sakura/wide',place:'wide'},'the place, its floor still measured');
   }finally{await edit(()=>{window.fetch=window.realFetch;});}
   await page.locator('#saveEdit').tap();await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer',null,{timeout:120000});
   const again=await edit(()=>{const s=window.pocketCamera.state.viewing;return {ref:s.recipe.comic.panels[0].ref,kept:s.panels[0]?.size>0,source:s.source};});
   assert.deepEqual(again,{ref:'place:sakura/wide',kept:true,source:null},'saved again with the place and its copy (and no unused source page)');
  });
  await check(`${label}: a second finger beside a sticker pinches the sticker, not the panel's picture; held, the page keeps its paper`,async()=>{
   await page.locator('#editPhoto').tap();
   await page.waitForFunction(()=>window.pocketCamera.state.edit?.comic?.slots.slice(0,3).every(s=>s.picture),null,{timeout:30000});await page.waitForTimeout(400);
   const r=await edit(async()=>{
    const pc=window.pocketCamera,e=pc.state.edit,frame=document.querySelector('#editFrame'),fr=frame.getBoundingClientRect(),a=pc.panelArea(0);
    const el=frame.querySelector('.sticker img[data-id^="thuan-blender/"]').closest('.sticker'),sr=el.getBoundingClientRect(),k=e.recipe.stickers.findIndex(s=>s.id.startsWith('thuan-blender/'));
    const ev=(type,id,x,y,target)=>target.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===11,clientX:x,clientY:y,bubbles:true,cancelable:true,buttons:type==='pointerup'?0:1}));
    const one={x:sr.left+sr.width/2,y:sr.top+sr.height/2},left=fr.left+a.x*fr.width;
    // The second finger on the panel's picture, just beside the sticker.
    const two={x:sr.left-24>left+8?sr.left-24:sr.right+24,y:one.y},under=document.elementFromPoint(two.x,two.y),out=Math.sign(two.x-one.x);
    const view={...e.comic.slots[0].view},size=e.recipe.stickers[k].size;
    ev('pointerdown',11,one.x,one.y,el.querySelector('img'));ev('pointerdown',12,two.x,two.y,under);
    for(let i=1;i<=6;i++){ev('pointermove',12,two.x+out*i*8,two.y,under);await new Promise(r=>setTimeout(r,16));}
    ev('pointerup',12,two.x+out*48,two.y,under);ev('pointerup',11,one.x,one.y,el);
    const s=e.recipe.stickers.find(s=>s.id.startsWith('thuan-blender/'));
    // The corner handle held, a finger on the page beside it, held and then swiped: no original, no other Look.
    const look=e.recipe.layers[0].look,handle=el.querySelector('.sticker-handle'),hr=el.getBoundingClientRect();
    ev('pointerdown',14,hr.right,hr.bottom,handle);ev('pointerdown',15,two.x,two.y,under);await new Promise(r=>setTimeout(r,260));
    const busy={comparing:e.comparing};
    for(let i=1;i<=4;i++){ev('pointermove',15,two.x+out*i*25,two.y,under);await new Promise(r=>setTimeout(r,16));}
    ev('pointerup',15,two.x+out*100,two.y,under);ev('pointerup',14,hr.right,hr.bottom,handle);
    busy.look=e.recipe.layers[0].look===look;busy.view=JSON.stringify(view)===JSON.stringify(e.comic.slots[0].view);
    // Held on the stage beside the page: the original, still on its paper with its borders.
    const stage=document.querySelector('#editStage');ev('pointerdown',13,fr.left-2,fr.top+fr.height/2,stage);await new Promise(r=>setTimeout(r,320));
    const held={comparing:e.comparing,paper:document.querySelector('#editFrame canvas.frame-art').hidden===false};
    ev('pointerup',13,fr.left-2,fr.top+fr.height/2,stage);
    return {under:under.closest('.sticker')?'sticker':'page',moved:JSON.stringify(view)!==JSON.stringify(e.comic.slots[0].view),grew:s.size/size,held,busy};
   });
   assert.equal(r.under,'page','the second finger is on the page, not on a sticker');
   assert.equal(r.moved,false,'the panel’s picture stays where it was');assert.ok(r.grew>1.2,`the sticker is pinched larger (${r.grew.toFixed(2)}×)`);
   assert.deepEqual(r.held,{comparing:true,paper:true},'held for the original, the page keeps its paper and borders');
   assert.deepEqual(r.busy,{comparing:false,look:true,view:true},'with a sticker’s handle held, a finger on the page neither shows the original nor changes the Look');
  });
  await check(`${label}: a picture pasted or dropped with a comic open fills the chosen panel; the page stays`,async()=>{
   const send=(type,count)=>page.evaluate(async([type,count])=>{
    const blob=await (await fetch('/assets/images/nils-lake-hero-optimized.jpg')).blob(),dt=new DataTransfer();
    for(let i=0;i<count;i++)dt.items.add(new File([blob],`lake-${i}.jpg`,{type:'image/jpeg'}));
    document.body.dispatchEvent(type==='paste'?new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}):new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}));
   },[type,count]);
   const shots=await edit(()=>window.pocketCamera.state.shots.length);
   await edit(()=>window.pocketCamera.choosePanel(2));await send('paste',1);
   await page.waitForFunction(()=>window.pocketCamera.state.edit?.comic?.slots[2].ref==='own',null,{timeout:20000});
   // Several dropped at once: the first fills the chosen panel; none goes to the album, and the comic stays open.
   await edit(()=>window.pocketCamera.choosePanel(1));await send('drop',3);
   await page.waitForFunction(()=>window.pocketCamera.state.edit?.comic?.slots[1].ref==='own',null,{timeout:20000});await page.waitForTimeout(500);
   const s=await edit(()=>{const pc=window.pocketCamera;return {mode:pc.state.mode,refs:pc.state.edit.comic.slots.slice(0,3).map(s=>s.ref.split(':')[0]),shots:pc.state.shots.length};});
   assert.deepEqual(s,{mode:'editor',refs:['place','own','own'],shots},'the comic is still open, two panels filled from the pictures');
  });
  await check(`${label}: a panel's old picture is let go when it is filled again or cleared, and every picture when the comic is left`,async()=>{
   const r=await edit(async()=>{
    const pc=window.pocketCamera,e=pc.state.edit,c=document.createElement('canvas');c.width=3200;c.height=2400;
    c.getContext('2d').fillStyle='#3a7';c.getContext('2d').fillRect(0,0,3200,2400);const big=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));c.width=c.height=0;
    const kind=x=>[x.constructor.name,x.width];
    pc.choosePanel(1);const dropped=e.comic.slots[1].picture.image;
    await pc.fillPanel(1,{ref:'own',blob:big});const shrunk=e.comic.slots[1].picture.image;
    const small=pc.state.shots.find(s=>Math.max(s.width,s.height)<=2048);
    await pc.fillPanel(1,{ref:`shot:${small.id}`,blob:small.photo});const bitmap=e.comic.slots[1].picture.image;
    const out={dropped:dropped.width,shrunk:kind(shrunk)};
    document.querySelector('#comicClear').click();out.bitmap=kind(bitmap);
    const left=e.comic.slots.map(s=>s.picture?.image).filter(Boolean),work=e.comic.work;
    document.querySelector('#cancelEdit').click();
    return {...out,left:left.map(i=>i.width),work:work.width,mode:pc.state.mode};
   });
   assert.equal(r.dropped,0,'the dropped picture, filled over, is let go');
   assert.deepEqual(r.shrunk,['HTMLCanvasElement',0],'a large photo’s copy (a canvas) is emptied when filled over');
   assert.deepEqual(r.bitmap,['ImageBitmap',0],'a picture cleared from its panel is closed');
   assert.ok(r.left.length===2&&r.left.every(w=>w===0),`leaving the comic lets go of every panel’s picture (${r.left})`);
   assert.equal(r.work,0,'and of the page it was drawn on');assert.equal(r.mode,'viewer');
  });
  await check(`${label}: comics without page errors`,async()=>assert.deepEqual(errors,[]));
 }finally{await browser.close();}
}

// A panel shot on a phone that has not yet allowed the camera (an iPhone's "Ask", or a comic opened from the Home Screen
// at #comic), and on one that refuses it. The review of b13ea90 found the greeting then shown, its Your photos opening
// another photo in place of the comic.
async function panelShotAsked({label,width,height}){
 for(const refused of [false,true]){
  // Chromium's fake prompt says yes to the question the tap asks; without it, the camera is refused.
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream',...(refused?[]:['--use-fake-ui-for-media-stream'])]});
  try{
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   const shot=async step=>{if(shots)await page.screenshot({path:join(shots,`${label}-comic-asked-${step}.png`)});};
   await page.goto(`${server.url}camera/#comic`);
   await page.waitForFunction(()=>window.pocketCamera?.state.edit?.comic,null,{timeout:30000});
   await page.evaluate(()=>window.pocketCamera.fillPanel(0,{ref:'place:sakura/wide'}));
   await check(`${label}: a panel shot with the camera ${refused?'refused: the greeting’s Your photos fills the panel and the comic comes back':'not yet allowed: the Camera tap itself asks, and the camera starts for the panel'}`,async()=>{
    await page.evaluate(()=>window.pocketCamera.choosePanel(1));
    await page.locator('#comicFill').tap();await page.waitForSelector('#comicSheet[open]');
    await page.locator('#comicSources button',{hasText:'Camera'}).tap();
    if(!refused){
     await page.waitForFunction(()=>window.pocketCamera.state.camera.running,null,{timeout:20000});
     const s=await page.evaluate(()=>({mode:window.pocketCamera.state.mode,welcome:!document.querySelector('#welcome').hidden,back:!document.querySelector('#backToComic').hidden}));
     assert.deepEqual(s,{mode:'camera',welcome:false,back:true},'the camera, for the panel, with no greeting');
     await page.waitForTimeout(600);await shot('allowed');
     // From 320 to 430 points wide the way back to the comic, with its panel, stays clear of the settings' chevron.
     for(const w of [320,360,375,384,390,430]){
      await page.setViewportSize({width:w,height});await page.waitForTimeout(150);
      const gap=await page.evaluate(()=>document.querySelector('#settingsToggle').getBoundingClientRect().left-document.querySelector('#backToComic').getBoundingClientRect().right);
      assert.ok(gap>=6,`${w} points wide: ${gap.toFixed(1)} px between the way back and the settings`);
     }
     await page.setViewportSize({width,height});
     await page.locator('#backToComic').tap();
    }else{
     await page.waitForFunction(()=>!document.querySelector('#welcome').hidden&&document.querySelector('#camera').classList.contains('for-panel'),null,{timeout:20000});
     assert.equal(await page.evaluate(()=>!document.querySelector('#backToComic').hidden),true,'the way back to the comic stays');
     await page.waitForTimeout(300);await shot('refused');
     const [chooser]=await Promise.all([page.waitForEvent('filechooser'),page.locator('#welcomeImport').tap()]);await chooser.setFiles(garden);
     await page.waitForFunction(()=>window.pocketCamera.state.edit?.comic?.slots[1].ref==='own',null,{timeout:20000});
    }
    await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
    const c=await page.evaluate(()=>({comic:!!window.pocketCamera.state.edit?.comic,first:window.pocketCamera.state.edit?.comic?.slots[0].ref,forPanel:document.querySelector('#camera').classList.contains('for-panel')}));
    assert.deepEqual(c,{comic:true,first:'place:sakura/wide',forPanel:false},'the same comic, its first panel still filled');
    assert.deepEqual(errors,[]);
   });
  }finally{await browser.close();}
 }
}

// CAMERA_ONLY=comics (or first, print, phone, desktop) runs only those parts, while working on one.
const only=new Set((process.env.CAMERA_ONLY||'').split(',').filter(Boolean)),part=name=>!only.size||only.has(name);
try{
 if(part('first')){await firstScreen({label:'iPhone Safari',width:390,height:664});await firstScreen({label:'iPhone SE Safari',width:375,height:560});}
 if(part('print'))await playAndPrint({label:'iPhone Safari',width:390,height:664});
 if(part('comics')){await makeComics({label:'iPhone Safari',width:390,height:664});await panelShotAsked({label:'iPhone Safari',width:390,height:664});}
 if(part('phone'))await run({label:'phone',width:390,height:844,dpr:2,mobile:true,portrait:true});
 if(part('desktop'))await run({label:'desktop',width:1280,height:800,dpr:1,mobile:false,portrait:false});
 console.log(`${results.length} checks pass`);
}finally{await server.close();await rm(temp,{recursive:true,force:true});}
