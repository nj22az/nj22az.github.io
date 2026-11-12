// Face stickers in a real browser, on the real portrait fixture: World's brows and eyes on the photo's eyes, manga shine,
// Halloween headpieces, both finishes, the untouched original, save and re-edit, comparing, Reset and a phone's width.
//   node camera/tests/face-stamps.browser.mjs        (CAMERA_SHOTS=<folder> also saves screenshots)
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
const STAMPS='/camera/face-stamps.js?v=20261104ui1',ALBUM='/camera/album.js?v=20261102fun1';
const seasonFile=join(root,'camera/stickers/halloween.json'),season=fs.existsSync(seasonFile)?JSON.parse(fs.readFileSync(seasonFile,'utf8')):{stickers:[]};
const hats=season.stickers.filter(s=>s.hat);

// The portrait's pupils (as the retouch suite aligns them): 640 × 960, the head tilted 15 degrees.
const PUPILS=[[348,327],[479,363]];
async function openPortrait(page){
 await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
 await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640&&window.pocketCamera.state.edit?.height===960);
 await page.click('#tabAdjust');await page.click('#funPhoto');
 await page.waitForFunction(()=>['found','none','failed'].includes(window.pocketCamera.state.edit.faceStatus),null,{timeout:60000});
 // the parts live behind the Fine-tune door; these checks drive them one by one
 if(!await page.evaluate(()=>document.getElementById('funFine').open))await page.click('#funFine summary');
}
/** Puts the guide's eyes on the pupils (the user drags them; the makeup suite tests the dragging), guide put away. */
async function placeEyes(page){
 await page.evaluate(PUPILS=>{
  const e=window.pocketCamera.state.edit,f=e.recipe.makeup.face;f.angle=15;const a=15*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
  const fw=f.w*e.width,fh=f.h*e.height,cx=(f.x+f.w/2)*e.width,cy=(f.y+f.h/2)*e.height;
  f.eyes=PUPILS.map(([X,Y])=>{const DX=X-cx,DY=Y-cy;return {x:(ca*DX+sa*DY)/fw+.5,y:(-sa*DX+ca*DY)/fh+.5};});e.makeupDirty=true;
 },PUPILS);
 if(await page.getAttribute('#funAlign','aria-pressed')==='true')await page.click('#funAlign');
 // the guide changed by hand above: the editor draws again when the handles are shown and put away
 await page.click('#funAlign');await page.click('#funAlign');
}
const settle=page=>page.waitForFunction(()=>{const e=window.pocketCamera.state.edit;return e&&!e.makeupDirty&&!e.stampsDirty&&!e.detecting;}).then(()=>page.waitForTimeout(60));
/** The editor's picture through the engine, 320 × 480 (half size), as RGBA. */
async function render(page){
 await settle(page);
 return page.evaluate(()=>{const {state,engine}=window.pocketCamera,e=state.edit,p=engine.render({...e.recipe,frame:'none',paper:'none',stickers:[],stamp:false},{source:'edit',crop:e.recipe.crop,width:320,height:480});return Array.from(p.data);});
}
/** Where changed pixels are: count and bounding box (in the 320 × 480 render). */
function diff(a,b,threshold=24){
 let n=0,x0=1e9,y0=1e9,x1=-1,y1=-1;
 for(let i=0;i<a.length;i+=4){const d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);if(d>threshold){n++;const p=i/4,x=p%320,y=Math.floor(p/320);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}
 return {n,box:[x0,y0,x1,y1]};
}
const pixel=(data,x,y)=>{const i=(Math.round(y)*320+Math.round(x))*4;return [data[i],data[i+1],data[i+2]];};
const luma=([r,g,b])=>.2126*r+.7152*g+.0722*b;
/** A point of the residents' face (face.js units) on the photo, in the half-size render's pixels. */
// A point of the residents' face (face.js units) on the 320-wide render; 'brow' is where the app draws the brows (on
// the found face's own brow line, face-stamps.js browY).
const facePoint=(page,fx,fy)=>page.evaluate(async([STAMPS,fx,fy])=>{
 const {faceSpace,FACE,browY,normaliseStamps}=await import(STAMPS),e=window.pocketCamera.state.edit,s=faceSpace(e.recipe.makeup.face,e.width,e.height,e.recipe.faces[0]),k=s.dist/(2*FACE.spread);
 if(fy==='brow')fy=browY(normaliseStamps(e.recipe.stamps).brows,s);
 const dx=(fx-128)*k,dy=(fy-FACE.eyeY)*k,c=Math.cos(s.angle),n=Math.sin(s.angle);
 return [(s.mid[0]+dx*c-dy*n)/2,(s.mid[1]+dx*n+dy*c)/2];
},[STAMPS,fx,fy]);
const sourceHash=page=>page.evaluate(async()=>{
 const e=window.pocketCamera.state.edit,c=document.createElement('canvas');c.width=e.width;c.height=e.height;c.getContext('2d').drawImage(e.picture,0,0);
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',c.getContext('2d').getImageData(0,0,c.width,c.height).data))].join(',');
});

try{
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&(fs.existsSync(seasonFile)||!/404/.test(m.text())))errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({sliders:true,recipe:{layers:[{look:'none',amount:1}]},printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await openPortrait(page);
 let base,evil,original;
 await check('Face stickers finds the face with the bundled detector and starts with nothing on it',async()=>{
  assert.ok(await page.evaluate(()=>!!window.pocketCamera.state.edit.recipe.makeup.face),'a face is placed');
  assert.equal(await page.textContent('#funSummary'),'Off');
  await placeEyes(page);original=await sourceHash(page);base=await render(page);
  assert.equal(await page.locator('#funTiles .fun-tile').count(),13,'None and the twelve brows of the avatar creator');
 });

 await check('evil brows are drawn on the brow line, sharp and dark, and nothing outside the face changes',async()=>{
  await page.click('#funTiles .fun-tile[data-id="angled"]');evil=await render(page);
  const d=diff(base,evil),[lx,ly]=await facePoint(page,128-38,'brow'),[rx,ry]=await facePoint(page,128+38,'brow');
  assert.ok(d.n>200,`brows drawn (${d.n} pixels)`);
  const [x0,y0,x1,y1]=d.box;assert.ok(x0>lx-60&&x1<rx+60&&y0>Math.min(ly,ry)-60&&y1<Math.max(ly,ry)+40,`changes stay round the brows: ${d.box} vs ${[lx,ly,rx,ry]}`);
  assert.equal(await page.textContent('#funSummary'),'Evil 1','the parts, set by hand, made the Evil face: it says so');
  assert.equal(await sourceHash(page),original,'the original photo is never changed');
  if(shots)await page.locator('#editFrame').screenshot({path:join(shots,'face-evil-brows.png')});
 });

 await check('the mood slider turns them from evil to worried, and colour and size follow',async()=>{
  await page.fill('#fun-brows-mood','-150');await page.dispatchEvent('#fun-brows-mood','input');
  assert.equal((await page.textContent('#fun-brows-mood + output')).trim(),'Worried');
  const worried=await render(page);assert.ok(diff(evil,worried).n>100,'a different brow');
  const s=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.stamps.brows);assert.equal(s.mood,-1.5);
  await page.click('#funColours [data-colour="ginger"]');
  const [x,y]=await facePoint(page,128-38,'brow');const ginger=pixel(await render(page),x,y);
  assert.ok(ginger[0]>ginger[2]+30,`ginger brows are ginger: ${ginger}`);
  await page.fill('#fun-brows-mood','170');await page.dispatchEvent('#fun-brows-mood','input');
  await page.click('#funColours [data-colour="ink"]');
 });

 await check('manga eyes: a resident’s eyes on the photo’s eyes, hearts in red, and shine in the photo’s own eyes',async()=>{
  await page.click('#funParts [data-part="eyes"]');assert.equal(await page.locator('#funTiles .fun-tile').count(),9);
  await page.click('#funTiles .fun-tile[data-id="heart"]');
  const [x,y]=[PUPILS[0][0]/2,PUPILS[0][1]/2+1],heart=pixel(await render(page),x,y);
  assert.ok(heart[0]>180&&heart[1]<120,`a red heart on the left eye: ${heart}`);
  await page.click('#funTiles .fun-tile[data-id="sparkle"]');
  if(shots)await page.locator('#editFrame').screenshot({path:join(shots,'face-sparkle-eyes.png')});
  await page.click('#funTiles .fun-tile[data-id="none"]');
  const noEyes=await render(page);
  await page.click('#funParts [data-part="shine"]');await page.fill('#fun-shine-shine','100');await page.dispatchEvent('#fun-shine-shine','input');
  const shine=await render(page),d=diff(noEyes,shine,60);
  assert.ok(d.n>4,'catchlights drawn');
  for(const [px,py] of PUPILS)assert.ok(Math.hypot((d.box[0]+d.box[2])/2-px/2,(d.box[1]+d.box[3])/2-py/2)<120,'near the eyes');
  assert.equal(await page.textContent('#funSummary'),'Brows · Shine');
 });

 await check('drawn on, a Look draws them too: Manga inks the brows',async()=>{
  const recipe=await page.evaluate(()=>structuredClone(window.pocketCamera.state.edit.recipe));
  const manga=await page.evaluate(r=>{const {engine}=window.pocketCamera;return Array.from(engine.render({...r,layers:[{look:'manga',amount:1}],stickers:[],frame:'none',stamp:false},{source:'edit',crop:r.crop,width:320,height:480}).data);},recipe);
  const plain=await page.evaluate(r=>{const {engine}=window.pocketCamera;return Array.from(engine.render({...r,layers:[{look:'manga',amount:1}],stickers:[],frame:'none',stamp:false},{source:'edit-original',crop:r.crop,width:320,height:480}).data);},recipe);
  assert.ok(diff(plain,manga).n>100,'the brows are in the Manga picture');
 });

 await check('the sticker finish keeps the source clean and lays a die-cut layer on top; the save prints it',async()=>{
  await page.click('#funFinish [data-finish="sticker"]');
  const clean=await render(page);assert.ok(diff(base,clean).n<5,'nothing drawn into the picture the Looks read');
  await page.waitForFunction(()=>!document.querySelector('.stamps-art').hidden);
  const ink=await page.evaluate(()=>{const c=document.querySelector('.stamps-art'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,white=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>200){n++;if(d[i]>240&&d[i+1]>240)white++;}return {n,white};});
  assert.ok(ink.n>200&&ink.white>50,`brows with a white rim on the layer: ${JSON.stringify(ink)}`);
  if(shots)await page.locator('#editFrame').screenshot({path:join(shots,'face-sticker-finish.png')});
 });

 await check('Original hides them; turning it off brings them back',async()=>{
  await page.click('#compareOriginal');
  await page.waitForFunction(()=>window.pocketCamera.state.edit.comparing);
  await page.waitForFunction(()=>document.querySelector('.stamps-art').hidden);
  await page.click('#compareOriginal');
  await page.waitForFunction(()=>!window.pocketCamera.state.edit.comparing&&!document.querySelector('.stamps-art').hidden);
 });

 if(hats.length)await check('a Halloween hat sits on the head at the face’s tilt, in the preview and the save',async()=>{
  await page.click('#funParts [data-part="hat"]');
  await page.waitForFunction(n=>document.querySelectorAll('#funTiles .fun-tile').length===n+1,hats.length);
  const witch=hats.find(h=>h.id.endsWith('witch-hat'))||hats[0];
  await page.click(`#funTiles .fun-tile[data-id="${witch.id}"]`);
  await page.waitForFunction(id=>window.pocketCamera.state.edit.recipe.stamps.hat.id===id,witch.id);
  await page.waitForFunction(async([STAMPS,id])=>(await import(STAMPS)).stampImages.has(id),[STAMPS,witch.id]);
  // Drawn by the editor's next frame (slow on a CPU-drawn browser when Find face has zoomed in on the face).
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))));await page.waitForTimeout(150);
  const layer=await page.evaluate(()=>{const c=document.querySelector('.stamps-art'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let top=c.height;for(let i=0;i<d.length;i+=4)if(d[i+3]>200)top=Math.min(top,Math.floor(i/4/c.width));return {top,h:c.height};});
  const [,crownY]=await facePoint(page,128,104-38*2*1.75);
  assert.ok(layer.top/layer.h<crownY*2/960,`the hat rises above the crown: ${layer.top/layer.h} < ${crownY*2/960}`);
  if(shots)await page.locator('#editFrame').screenshot({path:join(shots,'face-witch-hat.png')});
 });

 await check('Save copy keeps the stickers in the photo and in the recipe; Edit opens them again',async()=>{
  const [bx,by]=await facePoint(page,128-38,'brow');
  await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:30000});
  const saved=await page.evaluate(async([ALBUM,bx,by])=>{
   const {listShots}=await import(ALBUM),shot=(await listShots())[0],img=await createImageBitmap(shot.photo);
   const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
   const k=img.width/320,d=g.getImageData(Math.round(bx*k)-4,Math.round(by*k)-4,9,9).data;let min=255;for(let i=0;i<d.length;i+=4)min=Math.min(min,(d[i]+d[i+1]+d[i+2])/3);
   return {stamps:shot.recipe.stamps,min,width:img.width};
  },[ALBUM,bx,by]);
  assert.equal(saved.stamps.brows.style,'angled');assert.equal(saved.stamps.finish,'sticker');assert.equal(saved.stamps.shine,1);
  assert.ok(saved.min<70,`the saved photo has the dark brow where it was drawn (${saved.min})`);
  await page.click('#editPhoto');await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  await page.click('#tabAdjust');await page.click('#funPhoto');
  assert.match(await page.textContent('#funSummary'),/^Brows · Shine/);
 });

 await check('a character is a whole face in one tap, the next variant on the next; Off takes it away',async()=>{
  await page.waitForFunction(()=>document.querySelectorAll('#funStrip canvas.drawn').length>=9,null,{timeout:30000});
  await page.click('#funStrip [data-character="evil"]');
  let s=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.stamps);
  assert.deepEqual([s.brows.style,s.brows.mood,s.eyes.style,s.hat.id,s.finish],['angled',1.7,'none','none','drawn']);
  assert.equal(await page.textContent('#funSummary'),'Evil 1');assert.equal(await page.getAttribute('#funStrip [data-character="evil"]','aria-checked'),'true');
  await page.click('#funStrip [data-character="evil"]');
  s=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.stamps);assert.equal(s.brows.style,'thick');assert.equal(await page.textContent('#funSummary'),'Evil 2');
  await page.click('#funStrip [data-character="witch"]');
  s=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.stamps);assert.deepEqual([s.hat.id,s.finish,s.brows.colour],['halloween/witch-hat','sticker','witch']);
  assert.equal(await page.textContent('#funSummary'),'Witch 1');
  await page.waitForFunction(()=>!document.querySelector('.stamps-art').hidden);
  if(shots)await page.screenshot({path:join(shots,'face-character-witch.png')});
  // a part changed by hand is no longer the character
  await page.click('#funParts [data-part="eyes"]');await page.click('#funTiles .fun-tile[data-id="heart"]');
  assert.equal(await page.getAttribute('#funStrip [data-character="witch"]','aria-checked'),'false');assert.equal(await page.textContent('#funSummary'),'Brows · Eyes · Hat');
  await page.click('#funStrip [data-character="none"]');assert.equal(await page.textContent('#funSummary'),'Off');
  await page.click('#funStrip [data-character="manga"]');assert.equal(await page.textContent('#funSummary'),'Manga 1');
 });

 await check('Reset takes every face sticker off and the picture is the plain photo again',async()=>{
  await page.click('#funReset');
  assert.equal(await page.textContent('#funSummary'),'Off');
  await page.waitForFunction(()=>document.querySelector('.stamps-art').hidden);
  assert.ok(diff(base,await render(page)).n<5);
 });
 assert.deepEqual(errors,[],'no page errors');
 await page.close();

 // A phone held upright, 320 points wide: every control reachable, nothing wider than the panel.
 const phone=await browser.newPage({viewport:{width:320,height:560},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),phoneErrors=[];
 phone.on('pageerror',e=>phoneErrors.push(e.message));
 await phone.goto(server.url+'camera/');await phone.waitForFunction(()=>!!window.pocketCamera?.engine);
 await openPortrait(phone);
 await check('on a 320-point phone the Face stickers controls fit, and every target is 44 points',async()=>{
  for(const part of ['brows','eyes','shine','hat']){
   await phone.locator(`#funParts [data-part="${part}"]`).scrollIntoViewIfNeeded();await phone.click(`#funParts [data-part="${part}"]`);
   const layout=await phone.evaluate(()=>{const panel=document.getElementById('panelAdjust'),box=panel.getBoundingClientRect(),c=document.getElementById('funControls');
    const wide=[...c.querySelectorAll('*')].filter(el=>!el.closest('.fun-tiles,.strip')&&el.getBoundingClientRect().right>box.right+1).map(el=>el.id||el.className);
    const small=[...c.querySelectorAll('button,input')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&(r.height<44||r.width<44);}).map(el=>el.id||el.dataset.id||el.textContent);
    return {wide,small,scroll:document.getElementById('funTiles').scrollWidth>document.getElementById('funTiles').clientWidth};});
   assert.deepEqual(layout.wide,[],`${part}: nothing overflows`);assert.deepEqual(layout.small,[],`${part}: targets`);
  }
  if(shots)await phone.screenshot({path:join(shots,'face-phone-panel.png')});
 });
 assert.deepEqual(phoneErrors,[],'no page errors on the phone');
 console.log(`face-stamps browser: ${checks} checks passed${hats.length?'':' (no hats on the sheet yet)'}`);
}finally{await browser.close();await server.close();}
