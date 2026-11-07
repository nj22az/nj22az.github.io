// Album backup in a real browser: one ZIP holds every original, finished photo, thumbnail, recipe and own sticker;
// restoring adds what is missing byte for byte and never replaces a photo edited since. Phone-sized, share mocked.
//   node camera/tests/backup.browser.mjs        (CAMERA_SHOTS=<folder> also saves screenshots)
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const shots=process.env.CAMERA_SHOTS;if(shots)fs.mkdirSync(shots,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:375,height:560},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pocket-backup-'));
const ALBUM='/camera/album.js?v=20261102fun1',BACKUP='/camera/backup.js?v=20261102fun1';
try{
 await page.addInitScript(()=>{
  // The share sheet, as an iPhone offers it for a file: recorded, never opened.
  window.__shared=[];navigator.canShare=d=>!!d?.files?.length;navigator.share=async d=>{window.__shared.push(d.files.map(f=>({name:f.name,type:f.type,size:f.size})));};
 });
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);

 // Two photos of the owner's (one edited, with a sticker and makeup in its recipe) and one own sticker.
 const seeded=await page.evaluate(async ALBUM=>{
  const album=await import(ALBUM);
  await album.ensureAlbumSamples().catch(()=>{});
  const blob=(w,h,colour,type='image/jpeg')=>new Promise(r=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle=colour;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(3,3,5,5);c.toBlob(r,type,.9);});
  const original=await blob(64,48,'#c0392b'),finished=await blob(64,48,'#2b6fc0'),thumb=await blob(16,12,'#2b6fc0');
  const recipe={layers:[{look:'manga',amount:.7}],stickers:[{id:'marks/heart',x:.4,y:.3,size:.2,angle:10,flip:true}],makeup:{lips:.5,shade:'berry',face:{x:.2,y:.1,w:.5,h:.6}},stamp:true};
  const a=await album.addShot({photo:finished,source:original,thumb,recipe,width:64,height:48,taken:Date.UTC(2026,6,14)});
  const plain=await blob(40,30,'#27ae60');
  const b=await album.addShot({photo:plain,source:plain,thumb:plain,recipe:{layers:[{look:'none',amount:1}]},width:40,height:30,taken:Date.UTC(2026,9,31)});
  const sticker=await album.addMine({blob:await blob(32,32,'#8e44ad','image/png'),width:32,height:32});
  const all=await album.listShots();
  return {a:a.id,b:b.id,sticker:sticker.id,count:all.length,bytes:{original:original.size,finished:finished.size}};
 },ALBUM);

 let zipPath;
 await check('the album entry opens a sheet that says where the album lives and what it holds',async()=>{
  if(await page.locator('#welcomeAlbum').isVisible())await page.click('#welcomeAlbum');else await page.click('#roll');
  await page.locator('#album').waitFor({state:'visible'});
  await page.locator('#openBackup').scrollIntoViewIfNeeded();await page.locator('#openBackup').click();
  await page.locator('#backupSheet').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelectorAll('#backupStats dd').length===4);
  const stats=await page.$$eval('#backupStats div',rows=>Object.fromEntries(rows.map(r=>[r.querySelector('dt').textContent,r.querySelector('dd').textContent])));
  assert.equal(stats.Photos,String(seeded.count));assert.equal(stats['Your stickers'],'1');
  assert.match(await page.textContent('#backupWhere'),/kept by this browser/);
  const box=await page.locator('#backupSheet').boundingBox();
  assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=375&&box.y+box.height<=560,`the sheet fits a phone: ${JSON.stringify(box)}`);
  for(const id of ['backupMake','backupRestore','backupDone']){const b=await page.locator('#'+id).boundingBox();assert.ok(b.height>=44,`${id} is a 44-point target`);}
  if(shots)await page.screenshot({path:path.join(shots,'backup-sheet.png')});
 });

 await check('Back up album prepares the file; Save backup shares it from a fresh tap',async()=>{
  await page.click('#backupMake');
  await page.locator('#backupSave').waitFor({state:'visible'});
  assert.match(await page.textContent('#backupStatus'),new RegExp(`Ready: ${seeded.count} photos and 1 sticker`));
  assert.equal((await page.textContent('#backupSave')).trim(),'Save backup…');
  await page.click('#backupSave');
  await page.waitForFunction(()=>window.__shared.length===1);
  const [[shared]]=await page.evaluate(()=>window.__shared);
  assert.match(shared.name,/^Pocket Camera backup \d{4}-\d\d-\d\d\.zip$/);assert.equal(shared.type,'application/zip');
  await page.waitForFunction(()=>/Backup saved/.test(document.getElementById('backupStatus').textContent));
  assert.match(await page.textContent('#backupSummary'),/^Last saved /);
  if(shots)await page.screenshot({path:path.join(shots,'backup-ready.png')});
 });

 await check('the file is a standard ZIP holding the manifest, each picture once, and the sticker',async()=>{
  const b64=await page.evaluate(async BACKUP=>{const {makeBackup}=await import(BACKUP);const {file}=await makeBackup();
   const bytes=new Uint8Array(await file.arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s);},BACKUP);
  zipPath=path.join(tmp,'backup.zip');fs.writeFileSync(zipPath,Buffer.from(b64,'base64'));
  const listing=JSON.parse(execFileSync('python3',['-I','-c','import sys,zipfile,json;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;m=json.loads(z.read("pocket-camera-backup.json"));print(json.dumps({"names":z.namelist(),"m":m}))',zipPath],{encoding:'utf8'}));
  const {names,m}=listing;
  assert.equal(names[0],'pocket-camera-backup.json');assert.equal(m.app,'Pocket Camera');assert.equal(m.format,1);
  assert.equal(m.shots.length,seeded.count);assert.equal(m.stickers.length,1);
  const plain=m.shots.find(s=>s.record.width===40);
  assert.equal(plain.files.photo.path,plain.files.source.path,'a picture shared by two fields is written once');
  assert.ok(names.includes(m.stickers[0].files.blob.path)&&m.stickers[0].files.blob.type==='image/png');
  assert.equal(new Set(names).size,names.length);
 });

 await check('restore puts back a deleted photo and sticker byte for byte, and keeps a photo edited since',async()=>{
  const result=await page.evaluate(async({ALBUM,BACKUP,seeded})=>{
   const album=await import(ALBUM),{makeBackup,restoreBackup}=await import(BACKUP);
   const {file}=await makeBackup();
   const before=await album.getShot(seeded.a);
   await album.deleteShot(seeded.a);await album.deleteMine(seeded.sticker);
   await album.updateShot(seeded.b,{recipe:{layers:[{look:'riso',amount:1}]}});
   const r=await restoreBackup(new File([file],'b.zip',{type:'application/zip'}));
   const after=await album.getShot(seeded.a),edited=await album.getShot(seeded.b),mine=(await album.listMine()).find(s=>s.id===seeded.sticker);
   const same=async(x,y)=>{const [p,q]=[new Uint8Array(await x.arrayBuffer()),new Uint8Array(await y.arrayBuffer())];return p.length===q.length&&p.every((v,i)=>v===q[i]);};
   return {r,recipe:JSON.stringify(after.recipe)===JSON.stringify(before.recipe),taken:after.taken===before.taken&&after.created===before.created,
    photo:await same(after.photo,before.photo),source:await same(after.source,before.source),thumb:await same(after.thumb,before.thumb),
    types:[after.photo.type,after.source.type],edited:edited.recipe.layers[0].look,sticker:!!mine&&mine.blob.type==='image/png'&&mine.width===32};
  },{ALBUM,BACKUP,seeded});
  assert.deepEqual(result.r,{photos:1,stickers:1,kept:seeded.count-1});
  assert.ok(result.recipe&&result.taken,'recipe and dates are restored');
  assert.ok(result.photo&&result.source&&result.thumb,'every picture is byte for byte');
  assert.deepEqual(result.types,['image/jpeg','image/jpeg']);
  assert.equal(result.edited,'riso','a photo edited since the backup keeps its newer self');
  assert.ok(result.sticker);
 });

 await check('Restore from a backup in the sheet refreshes the album; a second restore adds nothing',async()=>{
  await page.evaluate(async({ALBUM,seeded})=>{const album=await import(ALBUM);await album.deleteShot(seeded.b);},{ALBUM,seeded});
  await page.locator('#backupFile').setInputFiles(zipPath);
  await page.waitForFunction(()=>/Restored 1 photo/.test(document.getElementById('backupStatus').textContent));
  await page.waitForFunction(n=>document.querySelectorAll('#grid button').length===n,seeded.count);
  await page.locator('#backupFile').setInputFiles(zipPath);
  await page.waitForFunction(()=>/already in the album/.test(document.getElementById('backupStatus').textContent));
 });

 await check('a damaged or foreign file is refused with a clear message, and nothing is added',async()=>{
  const bytes=fs.readFileSync(zipPath),copy=Buffer.from(bytes),at=copy.indexOf(Buffer.from('photos/'),40);
  // Damage the first picture's data (just after its local header's name).
  const data=copy.indexOf(0xff,at+20);copy[data+40]^=0xff;
  const damaged=path.join(tmp,'damaged.zip');fs.writeFileSync(damaged,copy);
  const foreign=path.join(tmp,'notes.zip');fs.writeFileSync(foreign,'not a zip at all');
  const count=await page.evaluate(async ALBUM=>(await(await import(ALBUM)).listShots()).length,ALBUM);
  await page.evaluate(async({ALBUM,seeded})=>{const album=await import(ALBUM);await album.deleteShot(seeded.a);},{ALBUM,seeded});
  await page.locator('#backupFile').setInputFiles(damaged);
  await page.waitForFunction(()=>document.getElementById('backupStatus').classList.contains('error'));
  assert.match(await page.textContent('#backupStatus'),/damaged/);
  await page.locator('#backupFile').setInputFiles(foreign);
  await page.waitForFunction(()=>/not a Pocket Camera backup/.test(document.getElementById('backupStatus').textContent));
  const after=await page.evaluate(async ALBUM=>(await(await import(ALBUM)).listShots()).length,ALBUM);
  assert.ok(after<=count,'a refused file adds nothing it could not check');
  assert.ok(await page.locator('#backupMake').isEnabled(),'the sheet is usable again');
 });

 await check('without file sharing the backup downloads instead',async()=>{
  await page.evaluate(()=>{navigator.canShare=()=>false;});
  await page.click('#backupDone');await page.locator('#openBackup').click();
  await page.click('#backupMake');await page.locator('#backupSave').waitFor({state:'visible'});
  assert.equal((await page.textContent('#backupSave')).trim(),'Download backup');
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('#backupSave')]);
  assert.match(download.suggestedFilename(),/^Pocket Camera backup .*\.zip$/);
 });

 assert.deepEqual(errors,[],'no page errors');
 console.log(`backup: ${checks} checks passed`);
}finally{
 await browser.close();await server.close?.();fs.rmSync(tmp,{recursive:true,force:true});
}
