// Actual edited photos: preview ranking, reversible settings, cancellation and save-copy.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS||'/tmp/camera-smart';await mkdir(shots,{recursive:true});
// Reuse the public portrait source documented by tools/camera-test-photos.py; never substitute a failed decode.
const portraitURL='https://images.pexels.com/photos/29747506/pexels-photo-29747506.jpeg?auto=compress&cs=tinysrgb&w=1600';
const response=await fetch(portraitURL);assert.ok(response.ok,'portrait test source is available');const portrait=Buffer.from(await response.arrayBuffer());
assert.ok(portrait[0]===255&&portrait[1]===216&&portrait.length>10000,'portrait fixture is a real JPEG');await writeFile(join(shots,'portrait-source.jpg'),portrait);
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results={checks:[],photos:[],portraitSource:portraitURL,physicalSafari:false},check=async(name,fn)=>{await fn();results.checks.push(name);console.log('ok '+name);};
let context;
try{
 context=await browser.newContext({viewport:{width:402,height:700},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
 await page.addInitScript(()=>{localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},sound:false,printer:false}));let seed=19;Math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);});
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>window.pocketCamera?.state.shots.length>=2);
 await page.evaluate(()=>{
  window.smartFixture=async(kind)=>{
   if(kind==='portrait'){const data=Uint8Array.from(atob(window.smartPortrait),c=>c.charCodeAt(0));return new File([data],'portrait.jpg',{type:'image/jpeg'});}
   if(['cafe','garden'].includes(kind)){const url={cafe:'/camera/samples/default-original.png',garden:'/assets/images/nils-lake-hero.jpg'}[kind];const response=await fetch(url);if(!response.ok)throw Error('Missing '+kind+' fixture');const b=await response.blob();return new File([b],kind+'.jpg',{type:b.type||'image/jpeg'});}
   const c=document.createElement('canvas');c.width=640;c.height=480;const g=c.getContext('2d'),dark=kind==='dark',offset=dark?12:180;
   const gradient=g.createLinearGradient(0,0,640,480);gradient.addColorStop(0,`rgb(${offset},${offset+5},${offset+12})`);gradient.addColorStop(1,`rgb(${offset+35},${offset+38},${offset+42})`);g.fillStyle=gradient;g.fillRect(0,0,640,480);
   for(let y=0;y<4;y++)for(let x=0;x<6;x++){g.fillStyle=`rgb(${offset+x*4},${offset+y*7},${offset+12})`;g.fillRect(24+x*100,30+y*106,72,70);}
   return new File([await new Promise(r=>c.toBlob(r,'image/png'))],kind+'.png',{type:'image/png'});
  };
  const e=window.pocketCamera.engine,draw=e.draw.bind(e);e.draw=(recipe,options)=>{const ready=draw(recipe,options);if(ready)window.smartDrawn=JSON.stringify(recipe);return ready;};
  let live=0;const make=e.gl.createTexture.bind(e.gl),drop=e.gl.deleteTexture.bind(e.gl);e.gl.createTexture=()=>{live++;return make();};e.gl.deleteTexture=t=>{if(t)live--;return drop(t);};
  const sample=e.sample.bind(e);e.sample=(...args)=>{const count=live,w=e.gl.canvas.width,h=e.gl.canvas.height,out=sample(...args);if(live!==count||w!==e.gl.canvas.width||h!==e.gl.canvas.height)throw Error('Sampling leaked a texture or resized the picture');return out;};
  window.smartProof=()=>{const a=window.pocketCamera,e=a.state.edit,crop=e.recipe.crop,width=768,height=Math.round(width*crop.h*e.height/(crop.w*e.width)),pixels=a.engine.render(e.recipe,{source:'edit',crop,width,height}),c=document.createElement('canvas');c.width=width;c.height=height;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels.data),width,height),0,0);return c.toDataURL('image/jpeg',.9);};
 });
 await page.evaluate(data=>window.smartPortrait=data,portrait.toString('base64'));
 const importPhoto=async kind=>{await page.evaluate(async kind=>{const a=window.pocketCamera,file=await window.smartFixture(kind);await a.editFile(file);if(a.state.edit?.sourceBlob!==file)throw Error('Import did not open '+kind);},kind);await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor'&&window.smartDrawn===JSON.stringify(window.pocketCamera.state.edit.recipe));};
 const match=async()=>{
  await page.click('.shuffle:not(.sticker-button)');
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.smartMatch&&document.querySelector('.shuffle').getAttribute('aria-busy')==='false',{},{timeout:10000});
  await page.waitForFunction(()=>window.smartDrawn===JSON.stringify(window.pocketCamera.state.edit.recipe));
  return page.evaluate(()=>{const e=window.pocketCamera.state.edit;return {recipe:e.recipe,match:e.smartMatch};});
 };
 for(const kind of ['cafe','garden','portrait','dark','bright'])await check(`${kind}: actual-photo search ranks bounded previews and preserves source/crop/overlays`,async()=>{
  await importPhoto(kind);
  const before=await page.evaluate(async()=>{const a=window.pocketCamera,e=a.state.edit;const {loadStickerSets}=await import('/camera/stickers.js?v=20261031-contour1');await loadStickerSets();a.editStickers.add('johansson-pixar/Wave');a.editStickers.select(null);e.recipe.crop={x:.08,y:.08,w:.84,h:.84};e.recipe.frame='print';e.recipe.paper='warm';e.recipe.stamp=true;a.chooseLook('mono');a.chooseLook('none');return {recipe:JSON.stringify(e.recipe),source:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await e.sourceBlob.arrayBuffer()))]};});
  await page.waitForFunction(()=>window.smartDrawn===JSON.stringify(window.pocketCamera.state.edit.recipe));
  const beforeImage=await page.evaluate(()=>window.smartProof());await writeFile(join(shots,kind+'-before.jpg'),Buffer.from(beforeImage.split(',')[1],'base64'));
  await page.locator('#editFrame').screenshot({path:join(shots,kind+'-before.png')});const requestStart=requests.length;
  const result=await match(),old=JSON.parse(before.recipe);assert.ok(result.match.tested>=1&&result.match.tested<=16);assert.ok(result.match.score>=.5&&result.match.score<=1);
  for(const key of ['crop','frame','paper','stamp','stickers','trick','focus'])assert.deepEqual(result.recipe[key],old[key],key);
  const source=await page.evaluate(async()=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',await window.pocketCamera.state.edit.sourceBlob.arrayBuffer()))]);assert.deepEqual(source,before.source);
  assert.ok(requests.slice(requestStart).every(r=>r.method==='GET'&&r.url.startsWith(server.url)),'no upload or external service used');
  if(kind==='dark')assert.ok(result.recipe.adjust.light>0);if(kind==='bright')assert.ok(result.recipe.adjust.light<0);
  const afterImage=await page.evaluate(()=>window.smartProof());await writeFile(join(shots,kind+'-after.jpg'),Buffer.from(afterImage.split(',')[1],'base64'));
  await page.locator('#editFrame').screenshot({path:join(shots,kind+'-after.png')});await page.screenshot({path:join(shots,kind+'-iphone.png')});results.photos.push({kind,...result});
  await page.click('.undo-shuffle');assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.edit.recipe),old,'Undo restores every setting');
 });
 await check('new clicks explore the original source and keep GPU sample resources bounded',async()=>{
  await importPhoto('cafe');const first=await match();
  const second=await page.evaluate(async()=>{const e=window.pocketCamera.state.edit,source=e.sourceBlob,answer=await window.pocketCamera.shuffle();return {sameSource:e.sourceBlob===source,answer};});
  assert.equal(second.sameSource,true);assert.ok(second.answer?.tested>=1);assert.ok(second.answer.tested<=16);
  assert.ok(second.answer.candidates.some(c=>c.name===first.match.name),'the preceding match is also refined');
 });
 await check('manual changes during search cancel its pending result',async()=>{
  await importPhoto('cafe');const r=await page.evaluate(async()=>{const a=window.pocketCamera,pending=a.shuffle();a.chooseLook('mono');const answer=await pending;return {answer,look:a.state.edit.recipe.layers[0].look};});
  assert.equal(r.answer,null);assert.equal(r.look,'mono');
 });
 await check('Undo Surprise preserves later frame and crop edits',async()=>{
  await importPhoto('cafe');const before=await page.evaluate(()=>window.pocketCamera.state.edit.recipe);await match();
  await page.click('#tabFrame');await page.click('.frame-choice[data-frame="film"]');await page.click('#tabCrop');await page.fill('#cropZoom','140');
  const crop=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.crop);await page.click('#tabLooks');await page.click('.undo-shuffle');
  const after=await page.evaluate(()=>window.pocketCamera.state.edit.recipe);assert.deepEqual(after.layers,before.layers);assert.deepEqual(after.adjust,before.adjust);assert.equal(after.enhance,before.enhance);assert.equal(after.frame,'film');assert.deepEqual(after.crop,crop);
 });
 await check('a replacement photo cannot receive an old search result',async()=>{
  await importPhoto('cafe');const r=await page.evaluate(async()=>{const a=window.pocketCamera,pending=a.shuffle();await a.editFile(await window.smartFixture('dark'));await pending;return {layers:a.state.edit.recipe.layers,enhance:a.state.edit.recipe.enhance,match:a.state.edit.smartMatch};});
  assert.deepEqual(r.layers,[{look:'none',amount:1}]);assert.equal(r.enhance,0);assert.equal(r.match,undefined);
 });
 await check('backgrounding cancels search without changing the recipe',async()=>{
  await importPhoto('cafe');const r=await page.evaluate(async()=>{const a=window.pocketCamera,before=JSON.stringify(a.state.edit.recipe),pending=a.shuffle();Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));await pending;delete document.hidden;return {before,after:JSON.stringify(a.state.edit.recipe)};});assert.equal(r.after,r.before);
 });
 await check('Save during search keeps the explicit current edit and completes normally',async()=>{
  await importPhoto('cafe');const before=await page.evaluate(()=>{const e=window.pocketCamera.state.edit,before=JSON.stringify(e.recipe);window.smartSaving=window.pocketCamera.shuffle();document.querySelector('#saveEdit').click();return before;});
  await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.viewing.recipe),JSON.parse(before));await page.evaluate(()=>window.smartSaving);
 });
 await check('a matched edit saves a new JPEG with retained original and re-editable settings',async()=>{
  await importPhoto('cafe');const result=await match();await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  const saved=await page.evaluate(async()=>{const s=window.pocketCamera.state.viewing,data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(s.photo);});return {recipe:s.recipe,type:s.photo.type,source:s.source.size,data};});assert.equal(saved.type,'image/jpeg');assert.ok(saved.source>0);assert.deepEqual(saved.recipe,result.recipe);await writeFile(join(shots,'saved.jpg'),Buffer.from(saved.data.split(',')[1],'base64'));
  await page.screenshot({path:join(shots,'saved.png')});
 });
 await check('Undo and smart controls remain reachable at phone/tablet sizes and large text',async()=>{
  for(const [label,width,height,text] of [['phone',402,700,100],['mini',744,980,100],['small',320,568,100],['large-text',402,700,200]]){
   await page.setViewportSize({width,height});await importPhoto('cafe');await page.evaluate(text=>document.documentElement.style.fontSize=text+'%',text);await match();
   await page.locator('.undo-shuffle').scrollIntoViewIfNeeded();const r=await page.locator('.undo-shuffle').evaluate(b=>{const r=b.getBoundingClientRect();return {width:r.width,height:r.height,visible:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth,overflow:document.documentElement.scrollWidth-innerWidth};});assert.ok(r.width>=44&&r.height>=44&&r.visible&&r.overflow<=1,JSON.stringify(r));
   await page.screenshot({path:join(shots,label+'-controls.png')});await page.evaluate(()=>document.documentElement.style.fontSize='100%');
  }
 });
 await check('no uncaught page errors',async()=>assert.deepEqual(errors,[]));
 console.log(`${results.checks.length}/${results.checks.length} Smart Surprise browser checks passed`);
}finally{await writeFile(join(shots,'smart-results.json'),JSON.stringify(results,null,2));await context?.close();await browser.close();await server.close();}
