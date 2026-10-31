// On-device makeup and suggested healing: actual canvas/worker output and editor round trips.
// CHROMIUM_EXECUTABLE=<path> CAMERA_SHOTS=<folder> node camera/tests/retouch.browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS;
if(shots)await mkdir(shots,{recursive:true});
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;
const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
// The fixture is deliberately not a face: a detector must leave cosmetic placement to the user.
const importFixture=page=>page.evaluate(async()=>{
 const c=document.createElement('canvas');c.width=400;c.height=300;const g=c.getContext('2d');
 g.fillStyle='rgb(194,163,139)';g.fillRect(0,0,c.width,c.height);g.fillStyle='rgb(100,63,45)';g.beginPath();g.arc(200,150,4,0,2*Math.PI);g.fill();
 const blob=await new Promise(r=>c.toBlob(r));
 window.retouchSourceHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))];
 await window.pocketCamera.editFile(new File([blob],'retouch-fixture.png',{type:'image/png'}));
});
const imageHash=page=>page.evaluate(async()=>{
 const e=window.pocketCamera.state.edit,c=document.createElement('canvas');c.width=e.width;c.height=e.height;const g=c.getContext('2d');g.drawImage(e.picture,0,0);
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',g.getImageData(0,0,c.width,c.height).data))];
});
const renderHash=async page=>{
 await page.waitForFunction(()=>!window.pocketCamera.state.edit.makeupDirty);
 return page.evaluate(async()=>{
 const {state,engine}=window.pocketCamera,e=state.edit,p=engine.render({...e.recipe,frame:'none',paper:'none',stickers:[],stamp:false},{source:'edit',crop:e.recipe.crop,width:400,height:300});
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',p.data))];
 });
};
try{
 await check('offline inventory includes the complete makeup detector, guide and spot-analysis runtime',async()=>{
  const manifest=JSON.parse(await readFile(join(root,'camera/offline.json'),'utf8'));
  for(const url of ['/camera/makeup.js','/camera/makeup-guide.js','/camera/face-detect.js','/camera/retouch-analysis.js','/camera/vendor/pico.js','/camera/vendor/facefinder.bin'])
   assert.ok(manifest.files.some(f=>f.url===url),url);
 });
 for(const [label,width,height,mobile] of [['phone',390,664,true],['small-phone',320,560,true],['tablet',768,1024,true],['desktop',1280,800,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
  try{
   await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
   await importFixture(page);const originalHash=await imageHash(page),beforeRender=await renderHash(page);
   await page.click('#tabAdjust');await page.click('#makeupPhoto');
   await page.waitForFunction(()=>!window.pocketCamera.state.edit.detecting);
   await check(`${label}: a no-face image waits for explicit placement`,async()=>{
    assert.equal(await page.locator('#makeupSkin').isDisabled(),true);
    assert.equal(await page.locator('#makeupLips').isDisabled(),true);
    assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face),null);
    assert.deepEqual(await imageHash(page),originalHash);
    assert.deepEqual(await renderHash(page),beforeRender);
   });
   await page.click('#makeupFace');await page.waitForFunction(()=>!!window.pocketCamera.state.edit.recipe.makeup.face);
   await check(`${label}: face and lip guides support keyboard placement`,async()=>{
    const before=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face);
    const face=page.locator('#makeupGuide [data-handle="face"]');await face.focus();await face.press('ArrowRight');
    const mouth=page.locator('#makeupGuide [data-handle="mouth"]');await mouth.focus();await mouth.press('ArrowUp');
    const after=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face);
    assert.ok(after.x>before.x,'face movement is stored in source coordinates');assert.ok(after.mouth.y<before.mouth.y,'lip anchor moves independently');
   });
   await page.click('#makeupFace');
   await check(`${label}: positioned makeup is reversible and leaves the source intact`,async()=>{
    assert.equal(await page.locator('#makeupSkin').isEnabled(),true);
    await page.fill('#makeupLips','65');await page.fill('#makeupBlush','40');await page.fill('#makeupSkin','35');
    await page.waitForTimeout(100);
    const r=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup);
    assert.equal(r.lips,.65);assert.equal(r.blush,.4);assert.equal(r.skin,.35);assert.ok(r.face.w>0&&r.face.h>0);
    assert.deepEqual(await imageHash(page),originalHash);
    assert.notDeepEqual(await renderHash(page),beforeRender);
    await page.click('#makeupReset');await page.waitForTimeout(100);
    assert.deepEqual(await renderHash(page),beforeRender);
    assert.deepEqual(await imageHash(page),originalHash);
    await page.click('#makeupFace');await page.click('#makeupFace');
    await page.fill('#makeupLips','65');await page.fill('#makeupBlush','40');await page.fill('#makeupSkin','35');
   });
   await check(`${label}: makeup controls stay usable at the device width`,async()=>{
    for(const selector of ['#makeupPhoto','#makeupFace','#makeupSkin','#makeupLips','#makeupBlush','#makeupReset']){
     await page.locator(selector).scrollIntoViewIfNeeded();const b=await page.locator(selector).boundingBox();
     assert.ok(b&&b.x>=-.5&&b.x+b.width<=width+.5,`${selector} fits ${width}px`);
    }
    assert.ok((await page.locator('#editFrame').boundingBox()).height>=100,'the picture remains visible');
   });
   if(shots)await page.screenshot({path:join(shots,`${label}-makeup.png`)});
   const placedFace=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face);
   await page.click('#tabCrop');await page.click('#cropShapes [data-shape="1:1"]');await page.fill('#cropZoom','125');
   await check(`${label}: cropping retains makeup in source coordinates`,async()=>{
    assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face),placedFace);
    const crop=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.crop);assert.ok(crop.w<1&&crop.h<1);
   });
   await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
   await check(`${label}: JPEG and re-edit preserve the makeup recipe without baking the source`,async()=>{
    const r=await page.evaluate(async()=>{
     const s=window.pocketCamera.state.viewing,hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.source.arrayBuffer()))];
     const key=new URL(document.querySelector('script[src*="app.js"]').src).search,{applyMakeup}=await import('/camera/makeup.js'+key);
     const source=await createImageBitmap(s.source),prepared=applyMakeup(source,s.recipe.makeup),engine=window.pocketCamera.engine;
     engine.setSource('retouch-check',prepared,source.width,source.height);
     const expected=engine.render({...s.recipe,frame:'none',paper:'none',stamp:false,stickers:[]},{source:'retouch-check',crop:s.recipe.crop,width:s.width,height:s.height});
     const saved=await createImageBitmap(s.photo),c=document.createElement('canvas');c.width=saved.width;c.height=saved.height;const g=c.getContext('2d');g.drawImage(saved,0,0);const actual=g.getImageData(0,0,c.width,c.height).data;
     let difference=0;for(let i=0;i<actual.length;i++)if(i%4!==3)difference+=Math.abs(actual[i]-expected.data[i]);
     source.close();saved.close();engine.dropSource('retouch-check');
     return {makeup:s.recipe.makeup,type:s.photo.type,w:s.width,h:s.height,sourceUnchanged:JSON.stringify(hash)===JSON.stringify(window.retouchSourceHash),jpegError:difference/(s.width*s.height*3)};
    });
    assert.equal(r.type,'image/jpeg');assert.equal(r.w,r.h);assert.equal(r.sourceUnchanged,true);assert.equal(r.makeup.lips,.65);assert.deepEqual(r.makeup.face,placedFace);assert.ok(r.jpegError<3,JSON.stringify(r));
    await page.click('#editPhoto');await page.click('#tabAdjust');await page.click('#makeupPhoto');
    assert.equal(await page.inputValue('#makeupLips'),'65');assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face),placedFace);
   });
   await importFixture(page);await page.click('#tabErase');const eraseBefore=await imageHash(page);
   await page.click('#eraseSuggest');await page.waitForFunction(()=>!document.querySelector('#eraseSuggest').disabled);
   await check(`${label}: suggested spots require an explicit tap and can be undone`,async()=>{
    const buttons=page.locator('#eraseSuggestions button');assert.ok(await buttons.count()>0,'the isolated spot is suggested');
    assert.deepEqual(await imageHash(page),eraseBefore,'analysis only highlights suggestions');
    await buttons.first().click();await page.waitForFunction(()=>!document.querySelector('#eraseUndo').disabled);
    assert.notDeepEqual(await imageHash(page),eraseBefore,'a tap invokes the actual fill');
    if(shots)await page.screenshot({path:join(shots,`${label}-erased.png`)});
    await page.click('#eraseUndo');assert.deepEqual(await imageHash(page),eraseBefore,'Undo restores every source byte');
    await page.click('#eraseSuggest');await page.waitForFunction(()=>!document.querySelector('#eraseSuggest').disabled);
    assert.ok(await page.locator('#eraseSuggestions button').count()>0,'the restored spot is suggested again');
    const overlay=await page.locator('#editFrame .erase-paint').boundingBox();assert.ok(overlay);
    // This fixture's sole spot is at the uncropped photograph's centre. Exercise the visible ring itself.
    const x=overlay.x+overlay.width/2,y=overlay.y+overlay.height/2;
    if(mobile)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
    await page.waitForFunction(()=>!document.querySelector('#eraseUndo').disabled);
    assert.notDeepEqual(await imageHash(page),eraseBefore,'tapping the visible ring invokes healing');
    await page.click('#eraseUndo');assert.deepEqual(await imageHash(page),eraseBefore,'ring healing also has exact Undo');
   });
   if(label==='desktop'){
    await check('cropped healing, exact undo and interrupted operations preserve the source',async()=>{
     const result=await page.evaluate(async()=>{
      const key=new URL(document.querySelector('script[src*="app.js"]').src).search;
      const {createEraser}=await import('/camera/erase.js'+key);
      const frame=document.createElement('div');frame.style.cssText='position:fixed;left:-1000px;top:0;width:400px;height:300px';document.body.append(frame);
      const make=()=>{const c=document.createElement('canvas');c.width=400;c.height=300;const g=c.getContext('2d');g.fillStyle='rgb(194,163,139)';g.fillRect(0,0,400,300);g.fillStyle='rgb(100,63,45)';g.beginPath();g.arc(200,150,4,0,2*Math.PI);g.fill();return c;};
      const c=make(),before=c.getContext('2d').getImageData(0,0,400,300).data;
      let edit={picture:c,width:400,height:300,recipe:{crop:{x:.25,y:.2,w:.5,h:.6}}},changed=0,failed=[];
      const eraser=createEraser(frame,{edit:()=>edit,changed:()=>changed++,failed:e=>failed.push(String(e))});eraser.active=true;
      await eraser.analyze();const suggestion=eraser.suggestions[0];await eraser.healSuggestion(0);
      const after=c.getContext('2d').getImageData(0,0,400,300).data;let changedPixels=0,outside=0;
      for(let y=0;y<300;y++)for(let x=0;x<400;x++){const i=(y*400+x)*4;if(after[i]!==before[i]||after[i+1]!==before[i+1]||after[i+2]!==before[i+2]){changedPixels++;if(Math.hypot(x-200,y-150)>20)outside++;}}
      const healedCentre=[...after.slice((150*400+200)*4,(150*400+200)*4+3)];eraser.undo();
      const undoExact=c.getContext('2d').getImageData(0,0,400,300).data.every((v,i)=>v===before[i]);
      await eraser.analyze();const pending=eraser.healSuggestion(0);eraser.reset();
      const next=make();edit={picture:next,width:400,height:300,recipe:{crop:{x:0,y:0,w:1,h:1}}};const callsBefore=changed;await pending;
      const staleSafe=changed===callsBefore&&next.getContext('2d').getImageData(0,0,400,300).data.every((v,i)=>v===before[i]);
      await eraser.analyze();const cropPending=eraser.healSuggestion(0);edit.recipe.crop={x:.1,y:.1,w:.8,h:.8};await cropPending;
      const cropSafe=changed===callsBefore&&next.getContext('2d').getImageData(0,0,400,300).data.every((v,i)=>v===before[i]);
      const scanning=eraser.analyze();eraser.clearSuggestions();await scanning;const clearSafe=eraser.suggestions.length===0;
      eraser.active=false;frame.remove();return {suggestion,changedPixels,outside,healedCentre,undoExact,staleSafe,cropSafe,clearSafe,failed};
     });
     assert.ok(Math.abs(result.suggestion.x-.5)<.06&&Math.abs(result.suggestion.y-.5)<.06,JSON.stringify(result));
     assert.ok(result.changedPixels>20);assert.equal(result.outside,0);assert.ok(result.healedCentre[0]>170,JSON.stringify(result));
     assert.equal(result.undoExact,true);assert.equal(result.staleSafe,true);assert.equal(result.cropSafe,true);assert.equal(result.clearSafe,true);assert.deepEqual(result.failed,[]);
    });
    await check('high-resolution makeup plus healing saves native detail after asynchronous source encoding',async()=>{
     await page.evaluate(async()=>{
      const c=document.createElement('canvas');c.width=1920;c.height=1440;const g=c.getContext('2d');
      g.fillStyle='rgb(194,163,139)';g.fillRect(0,0,c.width,c.height);
      // Two-pixel bars outside the face distinguish the full source from the 1280px interactive preview.
      for(let x=1500;x<1880;x+=2){g.fillStyle=(x/2)%2?'#202020':'#ededed';g.fillRect(x,100,2,300);}
      g.fillStyle='rgb(100,63,45)';g.beginPath();g.arc(320,400,10,0,2*Math.PI);g.fill();
      const blob=await new Promise(r=>c.toBlob(r));await window.pocketCamera.editFile(new File([blob],'retouch-high-resolution.png',{type:'image/png'}));
     });
     await page.click('#tabErase');await page.click('#eraseSuggest');await page.waitForFunction(()=>!document.querySelector('#eraseSuggest').disabled);
     await page.locator('#eraseSuggestions button').first().click();await page.waitForFunction(()=>!document.querySelector('#eraseUndo').disabled);
     assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.erased),true,'a real healing operation must precede Save');
     await page.click('#tabAdjust');await page.click('#makeupPhoto');await page.waitForFunction(()=>!window.pocketCamera.state.edit.detecting);
     if(!await page.evaluate(()=>!!window.pocketCamera.state.edit.recipe.makeup.face))await page.click('#makeupFace');
     if(await page.evaluate(()=>window.pocketCamera.state.edit.aligning))await page.click('#makeupFace');
     await page.fill('#makeupSkin','35');await page.fill('#makeupLips','55');await page.fill('#makeupBlush','30');
     await page.waitForFunction(()=>!window.pocketCamera.state.edit.makeupDirty);
     const preview=await page.evaluate(()=>({width:window.pocketCamera.state.edit.makeupCanvas.width,height:window.pocketCamera.state.edit.makeupCanvas.height}));
     assert.equal(preview.width,1280,'this case exercises the reduced interactive preview');
     await page.evaluate(()=>{
      const {state,engine}=window.pocketCamera,e=state.edit,picture=e.picture;
      window.retouchHighSource=document.createElement('canvas');window.retouchHighSource.width=e.width;window.retouchHighSource.height=e.height;window.retouchHighSource.getContext('2d').drawImage(picture,0,0);
      const encode=picture.toBlob.bind(picture),setSource=engine.setSource,render=engine.render,trace={sources:[],export:null,encoded:false};window.retouchHighTrace=trace;
      picture.toBlob=(callback,type,quality)=>encode(blob=>{
       trace.encoded=true;
       // Force normal editor redraws while the real source encoder's callback remains pending.
       dispatchEvent(new Event('resize'));
       requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>callback(blob))));
      },type,quality);
      engine.setSource=function(name,source,width,height){if(name==='edit')trace.sources.push({width,height,sourceWidth:source.width,sourceHeight:source.height});return setSource.call(this,name,source,width,height);};
      engine.render=function(recipe,options){if(options.source==='edit'&&e.saving)trace.export={...trace.sources.at(-1),widthOut:options.width,heightOut:options.height,encoded:trace.encoded};return render.call(this,recipe,options);};
      window.restoreRetouchHighTrace=()=>{engine.setSource=setSource;engine.render=render;picture.toBlob=encode;};
     });
     try{
      await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
      const result=await page.evaluate(async()=>{
       const {state,engine}=window.pocketCamera,s=state.viewing,key=new URL(document.querySelector('script[src*="app.js"]').src).search;
       const {applyMakeup}=await import('/camera/makeup.js'+key),source=window.retouchHighSource,prepared=applyMakeup(source,s.recipe.makeup);
       engine.setSource('retouch-high-expected',prepared,prepared.width,prepared.height);
       const expected=engine.render(s.recipe,{source:'retouch-high-expected',crop:s.recipe.crop,width:s.width,height:s.height});
       const saved=await createImageBitmap(s.photo),c=document.createElement('canvas');c.width=saved.width;c.height=saved.height;const g=c.getContext('2d');g.drawImage(saved,0,0);const actual=g.getImageData(0,0,c.width,c.height).data;
       let detailError=0,n=0;for(let y=110;y<390;y++)for(let x=1510;x<1870;x++)for(let channel=0;channel<3;channel++){const i=(y*c.width+x)*4+channel;detailError+=Math.abs(actual[i]-expected.data[i]);n++;}
       saved.close();engine.dropSource('retouch-high-expected');return {trace:window.retouchHighTrace,width:s.width,height:s.height,detailError:detailError/n};
      });
      assert.ok(result.trace.encoded);assert.deepEqual(result.trace.export,{width:1920,height:1440,sourceWidth:1920,sourceHeight:1440,widthOut:1920,heightOut:1440,encoded:true});
      assert.equal(result.width,1920);assert.equal(result.height,1440);assert.ok(result.detailError<8,JSON.stringify(result));
     }finally{await page.evaluate(()=>window.restoreRetouchHighTrace?.());}
    });
    await check('the bundled classifier detects a real portrait without an OS detector',async()=>{
     await page.evaluate(()=>{Object.defineProperty(globalThis,'FaceDetector',{value:undefined,configurable:true});});
     await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
     await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640&&window.pocketCamera.state.edit?.height===960);
     await page.click('#tabAdjust');
     if(shots){await page.screenshot({path:join(shots,'portrait-before.png')});await page.locator('#editFrame').screenshot({path:join(shots,'portrait-before-photo.png')});}
     const raw=await imageHash(page);await page.click('#makeupPhoto');await page.waitForFunction(()=>!window.pocketCamera.state.edit.detecting);
     const face=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face);
     assert.ok(face&&face.w>.25&&face.w<.8&&face.h>.2&&face.h<.7,JSON.stringify(face));
     assert.ok(face.x>.1&&face.x<.7&&face.y>0&&face.y<.5,JSON.stringify(face));
     const modelLoaded=await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>new URL(r.name).pathname==='/camera/vendor/facefinder.bin'));
     assert.equal(modelLoaded,true,'the actual bundled face model was used');
     // Detection supplies approximate bounds. Align this tilted, smiling face using the same controls as the user.
     await page.fill('#makeupAngle','15');
     const frame=await page.locator('#editFrame').boundingBox();assert.ok(frame);
     for(const [name,x,y] of [['left-eye',348,327],['right-eye',479,363],['mouth',377,460]]){
      const handle=await page.locator(`#makeupGuide [data-handle="${name}"]`).boundingBox();assert.ok(handle,name);
      await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();
      await page.mouse.move(frame.x+x/640*frame.width,frame.y+y/960*frame.height,{steps:5});await page.mouse.up();
     }
     await page.fill('#makeupMouthWidth','48');await page.fill('#makeupMouthHeight','17');
     const aligned=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.makeup.face);
     assert.equal(aligned.angle,15);assert.equal(aligned.mouth.w,.48);assert.equal(aligned.mouth.h,.17);
     const mapped=await page.evaluate(()=>{
      const e=window.pocketCamera.state.edit,f=e.recipe.makeup.face,a=f.angle*Math.PI/180;
      return [...f.eyes,f.mouth].map(p=>{const dx=(p.x-.5)*f.w*e.width,dy=(p.y-.5)*f.h*e.height;return {x:(f.x+f.w/2)*e.width+dx*Math.cos(a)-dy*Math.sin(a),y:(f.y+f.h/2)*e.height+dx*Math.sin(a)+dy*Math.cos(a)};});
     });
     for(const [i,[x,y]] of [[348,327],[479,363],[377,460]].entries())assert.ok(Math.hypot(mapped[i].x-x,mapped[i].y-y)<8,JSON.stringify(mapped));
     if(shots)await page.screenshot({path:join(shots,'portrait-aligned-guide.png')});
     await page.fill('#makeupSkin','30');await page.fill('#makeupLips','30');await page.fill('#makeupBlush','25');await page.click('#makeupFace');
     await page.waitForFunction(()=>!window.pocketCamera.state.edit.makeupDirty);
     assert.deepEqual(await imageHash(page),raw,'real portrait source remains unchanged');
     if(shots){await page.screenshot({path:join(shots,'portrait-after.png')});await page.locator('#editFrame').screenshot({path:join(shots,'portrait-after-photo.png')});}
    });
   }
   await check(`${label}: no page exceptions`,async()=>assert.deepEqual(errors,[]));
  }finally{await context.close();}
 }
 console.log(`retouch: ${checks}/${checks} browser checks passed`);
}finally{await browser.close();await server.close();}
