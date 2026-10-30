// Thin contours on real resident assets and newly imported stickers, with actual phone preview/export checks.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS;
if(shots)await mkdir(shots,{recursive:true});
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
try{
 const page=await browser.newPage({viewport:{width:390,height:664},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await check('116 resident stickers and thumbnails load at unchanged dimensions with the new contour key',async()=>{
  const report=await page.evaluate(async()=>{
   const m=await(await fetch('/camera/stickers/stickers.json?v=20261031-contour1')).json(),rows=[];
   for(const s of m.sets.flatMap(set=>set.stickers)){
    const full=await createImageBitmap(await(await fetch('/camera/stickers/'+s.src)).blob());
    const thumb=await createImageBitmap(await(await fetch('/camera/stickers/'+s.thumb)).blob());
    let paleShoes=null;
    if(['thuan/stand','thuan-blender/wave'].includes(s.id)){
     const c=document.createElement('canvas');c.width=full.width;c.height=full.height;const g=c.getContext('2d');g.drawImage(full,0,0);
     const p=g.getImageData(0,Math.floor(full.height*.86),full.width,full.height-Math.floor(full.height*.86)).data;paleShoes=0;
     for(let i=0;i<p.length;i+=4)if(Math.min(p[i],p[i+1],p[i+2])>220&&p[i+3]>240)paleShoes++;
    }
    rows.push({id:s.id,width:full.width,height:full.height,expected:[s.width,s.height],thumb:Math.max(thumb.width,thumb.height),paleShoes,version:s.src.endsWith('?v=20261031-contour1')&&s.thumb.endsWith('?v=20261031-contour1')});
    full.close();thumb.close();
   }
   return {style:m.contour,rows};
  });
  assert.equal(report.style,'20261031-contour1');assert.equal(report.rows.length,116);
  for(const r of report.rows){assert.deepEqual([r.width,r.height],r.expected);assert.ok(r.thumb<=256&&r.version,JSON.stringify(r));if(r.paleShoes!==null)assert.ok(r.paleShoes>3000,JSON.stringify(r));}
 });
 await check('new cut-outs and photo stickers have a fine rim and transparent corners',async()=>{
  const rows=await page.evaluate(async()=>{
   const {makeSticker}=await import('/camera/cutout.js?v=20261031-contour1'),rows=[];
   for(const transparent of [true,false]){
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#285bb5';
    if(transparent){g.beginPath();g.arc(64,64,32,0,Math.PI*2);g.fill();}else g.fillRect(0,0,128,128);
    const made=await makeSticker(await new Promise(r=>c.toBlob(r))),im=await createImageBitmap(made.blob);
    const out=document.createElement('canvas');out.width=im.width;out.height=im.height;const og=out.getContext('2d');og.drawImage(im,0,0);
    const px=og.getImageData(0,0,out.width,out.height).data;let white=0;
    for(let x=0;x<out.width;x++){const i=(Math.floor(out.height/2)*out.width+x)*4;if(Math.min(px[i],px[i+1],px[i+2])>230&&px[i+3]>180)white++;}
    rows.push({transparent,cut:made.cut,width:im.width,height:im.height,white,corner:px[3]});im.close();
   }
   return rows;
  });
  for(const r of rows){assert.equal(r.cut,r.transparent?'outline':'photo');assert.ok(r.white<=4,JSON.stringify(r));assert.ok(r.width<=138&&r.height<=138);assert.equal(r.corner,0);}
 });
 await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
 await page.click('#tabStickers');await page.click('#stickerSets button:text-is("Thuan")');
 await page.click('.sticker-choice[data-id="thuan-blender/wave"]');await page.waitForSelector('#editFrame .sticker img');
 await page.evaluate(()=>{const e=window.pocketCamera.state.edit;e.recipe.stickers[0].size=.8;e.recipe.stickers[0].angle=0;window.pocketCamera.editStickers.select(null);});
 await page.click('#tabAdjust');await page.waitForFunction(()=>getComputedStyle(document.querySelector('#toast')).opacity==='0');
 await page.locator('#editFrame .sticker img').evaluate(img=>img.decode());
 await page.locator('#editFrame .sticker').evaluate(el=>Promise.allSettled(el.getAnimations({subtree:true}).map(a=>a.finished)));
 if(shots)await page.screenshot({path:join(shots,'phone-sticker-contour.png')});
 await check('the actual picker places the recut asset and export uses those same sticker pixels',async()=>{
  const result=await page.evaluate(async()=>{
   const {engine,state}=window.pocketCamera,e=state.edit,m=await import('/camera/stickers.js?v=20261031-contour1');
   const img=document.querySelector('#editFrame .sticker img');await img.decode();
   const selected=await m.stickerImage(e.recipe.stickers[0].id);
   const a=document.createElement('canvas');a.width=a.height=512;
   await m.drawStickers(a.getContext('2d'),512,512,e.recipe.stickers);
   const b=document.createElement('canvas');b.width=b.height=512;const g=b.getContext('2d'),s=e.recipe.stickers[0],h=s.size*512,w=h*selected.naturalWidth/selected.naturalHeight;
   g.imageSmoothingQuality='high';g.translate(s.x*512,s.y*512);g.drawImage(img,-w/2,-h/2,w,h);
   const pa=a.getContext('2d').getImageData(0,0,512,512).data,pb=b.getContext('2d').getImageData(0,0,512,512).data;
   let max=0;for(let i=0;i<pa.length;i++)max=Math.max(max,Math.abs(pa[i]-pb[i]));
   return {src:img.src,max,id:s.id};
  });
  assert.match(result.src,/20261031-contour1/);assert.equal(result.id,'thuan-blender/wave');assert.equal(result.max,0);
  await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.viewing.recipe.stickers[0].id),'thuan-blender/wave');
  await page.locator('#viewerImage').evaluate(img=>img.decode());
  if(shots)await page.screenshot({path:join(shots,'phone-sticker-saved.png')});
 });
 await check('no page errors',async()=>assert.deepEqual(errors,[]));
 console.log(`${checks}/${checks} sticker contour checks passed`);
}finally{await browser.close();await server.close();}
