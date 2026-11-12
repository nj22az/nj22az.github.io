// The camera's own sticker sheets (stickers/sheets.json), their tabs, and the easy ways to add stickers: a picture of a
// whole sheet cut into its stickers, and the sticker box that takes a keyboard sticker, a paste or a drop.
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
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
const sheetFile=async name=>(await readFile(join(root,'tools/sources/sticker-sheets',name))).toString('base64');
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce',permissions:['camera']});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false,kept:true})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 // The Mine tab, with nothing on the viewfinder and nothing selected.
 const openMine=async()=>{
  await page.evaluate(()=>{const c=window.pocketCamera;c.state.camera.recipe.stickers.length=0;c.cameraStickers.select(null);c.cameraStickers.render();});
  if(!await page.$('#stickerSheet[open]'))await page.click('.sticker-button');
  await page.click('#stickerSets button:text-is("Mine")');await page.waitForSelector('.sticker-catch');
 };
 const cut=(data,type='image/png')=>page.evaluate(async({data,type})=>{
  const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0)),before=window.pocketCamera.mine;
  const made=await window.pocketCamera.stickersFromSheet(new File([bytes],'sheet',{type}));
  return {made,added:window.pocketCamera.mine-before};
 },{data,type});

 await check('every sheet on the list loads, and each of its stickers and thumbnails is there',async()=>{
  const report=await page.evaluate(async()=>{
   const list=await (await fetch('/camera/stickers/sheets.json')).json(),rows=[];
   for(const file of list.sheets){
    const sheet=await (await fetch('/camera/stickers/'+file)).json();let missing=0;
    for(const s of sheet.stickers)for(const src of [s.src,s.thumb])if(!(await fetch('/camera/stickers/'+src,{method:'HEAD'})).ok)missing++;
    rows.push({file,id:sheet.id,name:sheet.name,tab:sheet.tab,kind:sheet.kind||'',count:sheet.stickers.length,missing,ids:sheet.stickers.every(s=>s.id.startsWith(sheet.id+'/')),sizes:sheet.stickers.every(s=>Math.max(s.width,s.height)<=512&&s.gloss)});
   }
   return rows;
  });
  for(const want of ['marks','halloween','pocket-faces','johansson-cartoon','johansson-studios','matsuri','showa','cute','bits','matsuri-friends','tet','easter','summer','halloween-cute','christmas'])assert.ok(report.some(r=>r.id===want),`${want} is on the list`);
  for(const r of report){assert.equal(r.file,r.id+'.json');assert.equal(r.missing,0,JSON.stringify(r));assert.ok(r.ids&&r.count>0,JSON.stringify(r));}
  for(const r of report.filter(r=>!['marks','halloween','pocket-faces'].includes(r.id)))assert.ok(r.sizes,`${r.id}: every sticker at most 512 px with a description`);
  const by=id=>report.find(r=>r.id===id);
  assert.equal(by('johansson-cartoon').count,38);assert.equal(by('matsuri').count,33);assert.equal(by('showa').count,21);assert.equal(by('cute').count,22);
 });
 await check('tabs: the residents, the town, Friends, Season by the calendar, Faces, Manga',async()=>{
  const tabs=await page.evaluate(async()=>({nov:await window.pocketCamera.stickerTabs(new Date(2026,10,12)),oct:await window.pocketCamera.stickerTabs(new Date(2026,9,3)),jul:await window.pocketCamera.stickerTabs(new Date(2026,6,20))}));
  assert.deepEqual(tabs.nov.map(t=>t.name),['Thuan','Johansson','Thao','Minato','Friends','Season','Faces','Manga']);
  const of=(set,name)=>set.find(t=>t.name===name).sheets;
  assert.deepEqual(of(tabs.nov,'Johansson'),['Johansson','Cartoon Johansson','Animation Studios']);
  assert.deepEqual(of(tabs.nov,'Friends'),['Friends','Bits']);
  assert.equal(of(tabs.oct,'Season')[0],'Halloween','in October Halloween comes first');
  assert.equal(of(tabs.jul,'Season')[0],'Matsuri','in July the festival comes first');
  assert.equal(of(tabs.nov,'Season')[0],'Christmas','in November the next season to come is first');
  assert.deepEqual([...new Set(of(tabs.nov,'Season'))],['Christmas','Tết','Easter','Summer','Matsuri','Halloween'],'the year from here');
 });
 await check('a sheet with a kind never greets; Memory deals the residents, the cartoon sailor and the friends',async()=>{
  const {greeters,decks}=await page.evaluate(async()=>({greeters:await window.pocketCamera.greeters(),decks:await window.pocketCamera.decks()}));
  assert.deepEqual(greeters,['Thuan','Johansson','Thao','World Thuan','Cartoon Thuan','Thuan & Nils','Cartoon Johansson']);
  for(const name of ['Cartoon Johansson','Friends'])assert.ok(decks.includes(name),`${name} is a deck`);
  for(const name of ['Matsuri','Shōwa','Bits','Animation Studios','Marks','Halloween'])assert.ok(!decks.includes(name),`${name} is not a deck`);
 });
 await check('the picker shows a tab\'s sheets under their names, and a cut sticker goes on the picture',async()=>{
  await page.click('#shutter');await page.waitForFunction(()=>document.querySelector('#shutter')?.dataset.kind==='shoot');
  await page.click('.sticker-button');await page.waitForSelector('#stickerSheet[open] .sticker-choice');
  await page.click('#stickerSets button:text-is("Johansson")');await page.waitForSelector('.sticker-choice[data-id^="johansson-cartoon/"]');
  assert.deepEqual(await page.$$eval('#stickerGrid .sticker-heading',hs=>hs.map(h=>h.textContent)),['Cartoon Johansson','Animation Studios']);
  await page.click('#stickerSets button:text-is("Season")');await page.waitForSelector('.sticker-choice[data-id^="matsuri/"]');
  const season=await page.$$eval('#stickerGrid .sticker-heading',hs=>hs.map(h=>h.textContent));
  assert.ok(season.includes('Matsuri')&&season.includes('Halloween')&&new Set(season).size===season.length,`every season once: ${season}`);
  await page.click('#stickerSets button:text-is("Friends")');await page.waitForSelector('.sticker-choice[data-id="cute/frog-tea"]');
  assert.deepEqual(await page.$$eval('#stickerGrid .sticker-heading',hs=>hs.map(h=>h.textContent)),['Bits']);
  if(shots)await page.screenshot({path:join(shots,'stickers-friends.png')});
  await page.click('.sticker-choice[data-id="cute/frog-tea"]');
  await page.waitForFunction(()=>window.pocketCamera.state.camera.recipe.stickers.some(s=>s.id==='cute/frog-tea'));
  await page.waitForFunction(()=>{const img=document.querySelector('#cameraFrame .sticker img');return img&&img.complete&&img.naturalWidth>0;});
  await page.evaluate(()=>{const c=window.pocketCamera;c.state.camera.recipe.stickers.length=0;c.cameraStickers.select(null);c.cameraStickers.render();});
 });
 await check('Mine offers a photo, a sheet, a paste and the sticker box',async()=>{
  await openMine();
  const labels=await page.$$eval('#stickerGrid .sticker-choice.make',els=>els.map(e=>e.textContent.trim()));
  for(const want of ['From a photo','From a sheet','Sticker box'])assert.ok(labels.includes(want),`${want} in ${labels}`);
  const box=await page.$eval('.sticker-catch',el=>({editable:el.isContentEditable,font:parseFloat(getComputedStyle(el).fontSize),w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,label:el.getAttribute('aria-label')}));
  assert.ok(box.editable&&box.font>=16&&box.w>=44&&box.h>=44&&/keyboard/.test(box.label),JSON.stringify(box));
  if(shots)await page.screenshot({path:join(shots,'stickers-mine.png')});
 });
 await check('a drawn sheet on cream, white edges touching, is cut into its six stickers with their marks',async()=>{
  const data=await page.evaluate(()=>{
   const c=document.createElement('canvas');c.width=900;c.height=600;const g=c.getContext('2d');
   g.fillStyle='#f6efdf';g.fillRect(0,0,900,600);
   const colours=['#e4533f','#f6c343','#5fb3d8','#58c28f','#9a78d0','#f49a7c'];
   colours.forEach((colour,i)=>{
    const x=150+(i%3)*300,y=150+Math.floor(i/3)*300;
    g.fillStyle='#fff';g.beginPath();g.arc(x,y,152,0,7);g.fill();              // the sheet's own white edges touch their neighbours
    g.fillStyle='#1b1b1b';g.beginPath();g.arc(x,y,118,0,7);g.fill();
    g.fillStyle=colour;g.beginPath();g.arc(x,y,108,0,7);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(x-30,y-30,26,0,7);g.fill();          // paper inside the outline stays
   });
   g.strokeStyle='#1b1b1b';g.lineWidth=7;g.lineCap='round';                       // three motion lines beside the first
   for(const dy of [-22,0,22]){g.beginPath();g.moveTo(270,150+dy);g.lineTo(290,150+dy);g.stroke();}
   return c.toDataURL('image/png').split(',')[1];
  });
  // (the motion lines sit between the first and the second; they go to one of them and make no seventh sticker)
  const result=await cut(data);
  assert.deepEqual(result,{made:6,added:6});
  const kept=await page.evaluate(async()=>{
   const {listMine}=await import('/camera/album.js?v=20261029b');const rows=[];
   for(const m of (await listMine()).slice(-6)){
    const b=await createImageBitmap(m.blob),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const g=c.getContext('2d');g.drawImage(b,0,0);
    const d=g.getImageData(0,0,b.width,b.height).data,mid=((b.height>>1)*b.width+(b.width>>1))*4,at=(x,y)=>d[(y*b.width+x)*4+3];
    let white=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>250&&d[i]>250&&d[i+1]>250&&d[i+2]>250)white++;
    rows.push({cut:m.cut,w:b.width,h:b.height,corner:at(1,1),centre:d[mid+3],white:white/(d.length/4)});
   }
   return rows;
  });
  for(const r of kept){assert.equal(r.cut,'outline');assert.equal(r.corner,0);assert.equal(r.centre,255);assert.ok(r.white>.02,`a white edge and the paper inside: ${JSON.stringify(r)}`);assert.ok(Math.abs(r.w-r.h)<r.w*.35,JSON.stringify(r));}
 });
 await check('the owner\'s own sheets: ink on white (12 poses), cream with white edges (32 or 33), a chequered ground (21 or 22)',async()=>{
  assert.equal((await cut(await sheetFile('johansson-acts.png'))).made,12);
  const matsuri=(await cut(await sheetFile('matsuri.png'))).made;
  assert.ok(matsuri===32||matsuri===33,`the festival: ${matsuri} (its two sparklers as one sticker or two)`);
  const showa=(await cut(await sheetFile('showa.png'))).made;
  assert.ok(showa===21||showa===22,`Shōwa: ${showa}`);
 });
 await check('a picture that is not a sheet becomes one sticker',async()=>{
  const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=300;const g=c.getContext('2d');const grad=g.createLinearGradient(0,0,400,300);grad.addColorStop(0,'#2a6');grad.addColorStop(1,'#a42');g.fillStyle=grad;g.fillRect(0,0,400,300);return c.toDataURL('image/jpeg',.9).split(',')[1];});
  const before=await page.evaluate(()=>window.pocketCamera.mine);
  await cut(data,'image/jpeg');
  assert.equal(await page.evaluate(()=>window.pocketCamera.mine)-before,1);
 });
 await check('the sticker box takes a pasted picture, a picture the system inserts, and a drop; nothing can be typed',async()=>{
  await openMine();
  const count=()=>page.evaluate(()=>window.pocketCamera.mine);
  const png=`(()=>{const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');g.fillStyle='#e4533f';g.beginPath();g.arc(80,80,60,0,7);g.fill();return new Promise(r=>c.toBlob(r,'image/png'));})()`;
  let n=await count();
  await page.evaluate(async png=>{
   const blob=await eval(png),dt=new DataTransfer();dt.items.add(new File([blob],'sticker.png',{type:'image/png'}));
   document.querySelector('.sticker-catch').dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
  },png);
  await page.waitForFunction(n=>window.pocketCamera.mine===n+1,n);
  // A transparent sticker is kept as it is: cut round its outline.
  assert.equal(await page.evaluate(async()=>{const {listMine}=await import('/camera/album.js?v=20261029b');return (await listMine()).at(-1).cut;}),'outline');
  await openMine();
  n=await count();
  await page.evaluate(async png=>{
   const blob=await eval(png),box=document.querySelector('.sticker-catch'),img=document.createElement('img');img.src=URL.createObjectURL(blob);
   box.append(img);box.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertFromPaste'}));
  },png);
  await page.waitForFunction(n=>window.pocketCamera.mine===n+1,n);
  await openMine();
  n=await count();
  await page.evaluate(async png=>{
   const blob=await eval(png),dt=new DataTransfer();dt.items.add(new File([blob],'dropped.png',{type:'image/png'}));
   document.querySelector('.sticker-catch').dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}));
  },png);
  await page.waitForFunction(n=>window.pocketCamera.mine===n+1,n);
  await openMine();
  await page.click('.sticker-catch');await page.keyboard.type('hello');
  assert.equal(await page.$eval('.sticker-catch',el=>el.textContent),'','no words stay in the box');
  assert.equal(await page.$eval('.sticker-catch',el=>el.querySelectorAll('img').length),0);
 });
 assert.deepEqual(errors,[]);
 console.log(`stickers: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
