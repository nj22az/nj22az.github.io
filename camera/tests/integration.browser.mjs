// Combined release contracts. Native sharing is mocked; no photo leaves the browser.
// Optional CAMERA_MAIN_ENGINE / CAMERA_REFINE_ENGINE compare the actual prior engines byte for byte.
// CAMERA_SHOTS writes real renderer comparisons and emulated phone screenshots.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
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
try{
 const context=await browser.newContext({viewport:{width:390,height:664},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>requests.push(r.url()));
 for(const [label,env] of [['main','CAMERA_MAIN_ENGINE'],['refine','CAMERA_REFINE_ENGINE']])if(process.env[env])
  await page.route(`**/camera/integration-${label}.js`,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(process.env[env],'utf8')}));
 await page.addInitScript(()=>{
  localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:true}));
  window.integrationShares=[];window.integrationDownloads=[];
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
  Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{
   const f=data.files[0],hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await f.arrayBuffer()))];
   window.integrationShares.push({hash,type:f.type});
  }});
  const click=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){if(this.download)window.integrationDownloads.push(this.download);else click.call(this);};
 });
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await check('all 34 published Looks combine with enhancement and every stock, full and LIGHT',async()=>{
  const report=await page.evaluate(async()=>{
   const m=await import('/camera/looks-gl.js?v=20261031audit1');
   const source=await createImageBitmap(await(await fetch('/camera/samples/default-original.png')).blob());
   const crop={x:.13,y:.07,w:.7,h:.8},results=[];
   for(const light of [false,true]){
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=72;
    const e=m.createLookEngine(canvas,{light});e.setSource('test',source,source.width,source.height);
    for(const look of m.LOOK_NAMES)for(const paper of m.PAPERS)for(const enhance of [0,.65,1]){
     const recipe=m.normalRecipe({layers:[{look}],paper:paper.id,enhance,crop});
     const options={source:'test',crop};
     let ready=false;for(let i=0;i<400&&!ready;i++){ready=e.draw(recipe,options);if(!ready)await new Promise(r=>setTimeout(r,10));}
     if(!ready||e.failed(look))throw new Error(`${look}/${paper.id}/${enhance}/${light} failed`);
     const raw=new Uint8Array(96*72*4);e.gl.readPixels(0,0,96,72,e.gl.RGBA,e.gl.UNSIGNED_BYTE,raw);
     let sum=0,sq=0;for(let i=0;i<raw.length;i+=4){const v=(raw[i]+raw[i+1]+raw[i+2])/3;sum+=v;sq+=v*v;}
     const mean=sum/(96*72),spread=Math.sqrt(sq/(96*72)-mean*mean);
     if(spread<3)throw new Error(`blank ${look}/${paper.id}/${enhance}/${light}: ${spread}`);
     if(!light){const full=e.render(recipe,{...options,width:96,height:72}).data,drawn=m.flipRows(raw,96,72);let max=0;
      for(let i=0;i<full.length;i++)max=Math.max(max,Math.abs(full[i]-drawn[i]));
      if(max>1)throw new Error(`preview/export differ ${look}/${paper.id}/${enhance}: ${max}`);
     }
     results.push({look,paper:paper.id,enhance,light,mean,spread});
    }
    e.gl.getExtension('WEBGL_lose_context')?.loseContext();
   }
   source.close();return {lookCount:m.LOOK_NAMES.length,rows:results};
  });
  assert.equal(report.lookCount,34,'the separate #405 development Looks stay out');assert.equal(report.rows.length,816);
  if(shots)await writeFile(join(shots,'render-matrix.json'),JSON.stringify(report,null,2));
  console.log(`    ${report.rows.length} combinations; 408 full preview/export pixel comparisons`);
 });
 if(process.env.CAMERA_MAIN_ENGINE||process.env.CAMERA_REFINE_ENGINE)await check('off/None preserves prior Look pixels except rebuilt Crayon and geometry-corrected 32-bit',async()=>{
  const result=await page.evaluate(async baselines=>{
   const m=await import('/camera/looks-gl.js?v=20261031audit1'),e=m.createLookEngine(document.createElement('canvas'));
   const source=await createImageBitmap(await(await fetch('/camera/samples/default-original.png')).blob());
   e.setSource('test',source,source.width,source.height);const rows=[];
   for(const label of baselines){
    const b=await import(`/camera/integration-${label}.js`),old=b.createLookEngine(document.createElement('canvas'));old.setSource('test',source,source.width,source.height);
    for(const look of m.LOOK_NAMES){
     const options={source:'test',crop:{x:.1,y:.2,w:.7,h:.6},width:128,height:96};
     const a=e.render(m.normalRecipe({layers:[{look}],enhance:0,paper:'none'}),options).data;
     const before=old.render(b.normalRecipe({layers:[{look}]}),options).data;
     let max=0;for(let i=0;i<a.length;i++)max=Math.max(max,Math.abs(a[i]-before[i]));rows.push({label,look,max});
    }
    old.gl.getExtension('WEBGL_lose_context')?.loseContext();
   }
   e.gl.getExtension('WEBGL_lose_context')?.loseContext();source.close();return rows;
  },[['main',process.env.CAMERA_MAIN_ENGINE],['refine',process.env.CAMERA_REFINE_ENGINE]].filter(([,v])=>v).map(([k])=>k));
  for(const r of result)if(r.look==='thirtyTwoBit'||r.label==='main'&&r.look==='crayon')assert.ok(r.max>0);else assert.equal(r.max,0,JSON.stringify(r));
  console.log(`    ${result.length} baseline comparisons`);
 });
 await check('enhanced mixed-Look thumbnails apply paper once, after the Looks',async()=>{
  const result=await page.evaluate(async()=>{
   const m=await import('/camera/looks-gl.js?v=20261031audit1'),e=m.createLookEngine(document.createElement('canvas'));
   const source=await createImageBitmap(await(await fetch('/camera/samples/default-original.png')).blob());e.setSource('test',source,source.width,source.height);
   const crop={x:.2,y:.1,w:.6,h:.8},rows=[];
   // One tile per call keeps the stock's texture origin the same as the reference; 540 px makes both pattern floors equal.
   for(const paper of m.PAPERS)for(const look of ['none','risoPinkBlue']){
    const recipe=m.normalRecipe({layers:[{look:'crayon'},{look}],paper:paper.id,enhance:.65});
    const reference=e.render(recipe,{source:'test',crop,width:540,height:540}).data;
    let atlas;for(let i=0;i<400;i++){atlas=e.thumbnails(recipe,{source:'test',crop,size:540,names:[look],layer:1});if(atlas&&!atlas.missing.length)break;await new Promise(r=>setTimeout(r,10));}
    if(!atlas||atlas.missing.length)throw new Error('thumbnail did not finish');
    let max=0;for(let i=0;i<reference.length;i++)max=Math.max(max,Math.abs(reference[i]-atlas.data[i]));rows.push({paper:paper.id,look,max});
   }
   e.gl.getExtension('WEBGL_lose_context')?.loseContext();source.close();return rows;
  });
  for(const r of result)assert.ok(r.max<=1,JSON.stringify(r));
 });
 await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
 await page.click('#tabCrop');await page.click('#cropShapes [data-shape="3:4"]');await page.fill('#cropZoom','150');
 await page.click('#tabAdjust');await page.click('#enhancePhoto');await page.click('#enhanceAmount');await page.fill('#enhanceStrength','57');
 await page.click('#tabFrame');await page.click('#paperChoices [data-paper="rough"]');
 await page.click('#tabLooks');await page.click('#lookGroups [data-group="drawn"]');await page.click('.tile[data-look="crayon"]');
 await page.click('.add-layer');await page.click('#lookGroups [data-group="riso"]');await page.click('.tile[data-look="risoPinkBlue"]');await page.fill('#amount','25');
 await page.click('#tabFrame');
 const expected=await page.evaluate(async()=>{const e=window.pocketCamera.state.edit;return {recipe:JSON.parse(JSON.stringify(e.recipe)),source:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await e.sourceBlob.arrayBuffer()))]};});
 await check('Original bypasses Enhance, mixed Looks and stock together while preserving the crop',async()=>{
  await page.evaluate(()=>{
   const {engine,state}=window.pocketCamera,draw=engine.draw;window.integrationDraw=draw;window.integrationComparison=null;
   engine.draw=(recipe,options)=>{
    const ok=draw(recipe,options);
    // Read inside the draw, before preserveDrawingBuffer:false lets the compositor clear the canvas.
    if(ok&&state.edit?.comparing&&!window.integrationComparison){
     const gl=engine.gl,c=gl.canvas,raw=new Uint8Array(c.width*c.height*4);
     gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,raw);
     window.integrationComparison={raw,width:c.width,height:c.height};
    }
    return ok;
   };
  });
  const r=await page.locator('#editFrame').boundingBox();await page.mouse.move(r.x+r.width*.5,r.y+r.height*.5);await page.mouse.down();
  await page.waitForFunction(()=>window.pocketCamera.state.edit.comparing);
  assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.edit.recipe),expected.recipe);
  assert.equal(await page.locator('#original').isVisible(),true);
  await page.waitForFunction(()=>!!window.integrationComparison);
  const difference=await page.evaluate(async()=>{
   const {engine,state}=window.pocketCamera,m=await import('/camera/looks-gl.js?v=20261031audit1'),{raw,width,height}=window.integrationComparison;
   engine.draw=window.integrationDraw;
   const shown=m.flipRows(raw,width,height),reference=engine.render(m.normalRecipe(),{source:'edit',crop:state.edit.recipe.crop,width,height}).data;
   let max=0;for(let i=0;i<shown.length;i++)max=Math.max(max,Math.abs(shown[i]-reference[i]));return max;
  });
  assert.ok(difference<=1,`Original contains only the cropped source (${difference})`);await page.mouse.up();
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.comparing),false);
 });
 await check('album save, JPEG and source retain the combined cropped recipe',async()=>{
  await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  const result=await page.evaluate(async()=>{
   const {state,engine}=window.pocketCamera,s=state.viewing,src=await createImageBitmap(s.source),jpg=await createImageBitmap(s.photo);
   engine.setSource('verify',src,src.width,src.height);
   const full=engine.render(s.recipe,{source:'verify',crop:s.recipe.crop,width:s.width,height:s.height});
   const c=document.createElement('canvas');c.width=jpg.width;c.height=jpg.height;const g=c.getContext('2d');g.drawImage(jpg,0,0);const px=g.getImageData(0,0,c.width,c.height).data;
   let error=0;for(let i=0;i<px.length;i++)if(i%4!==3)error+=Math.abs(px[i]-full.data[i]);
   // A dithered Riso deliberately has high-frequency colour. Compare like encodings, not an arbitrary raw-pixel
   // tolerance: an independently rendered/encoded reference must be the exact saved JPEG.
   g.putImageData(new ImageData(full.data,s.width,s.height),0,0);
   const reference=await new Promise(r=>c.toBlob(r,'image/jpeg',.88));
   const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',await b.arrayBuffer()))];
   const jpeg=await hash(s.photo),referenceJPEG=await hash(reference);
   const source=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.source.arrayBuffer()))];
   engine.dropSource('verify');src.close();jpg.close();return {recipe:s.recipe,source,jpeg,referenceJPEG,error:error/(s.width*s.height*3),width:s.width,height:s.height,type:s.photo.type,id:s.id,shares:window.integrationShares.length,downloads:window.integrationDownloads.length};
  });
  assert.deepEqual(result.recipe,expected.recipe);assert.deepEqual(result.source,expected.source);assert.equal(result.type,'image/jpeg');
  assert.deepEqual(result.jpeg,result.referenceJPEG,'the saved image equals an independently rendered JPEG');assert.ok(Math.abs(result.width/result.height-.75)<.005);assert.ok(Math.max(result.width,result.height)<=2560);
  assert.equal(result.shares,0);assert.equal(result.downloads,0);console.log(`    saved JPEG mean RGB error ${result.error.toFixed(3)}/255`);
 });
 await check('Share receives the exact saved JPEG, without resaving or downloading',async()=>{
  const before=await page.evaluate(async()=>({count:window.pocketCamera.state.shots.length,hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await window.pocketCamera.state.viewing.photo.arrayBuffer()))]}));
  await page.click('#sharePhoto');await page.waitForFunction(()=>window.integrationShares.length===1&&!document.querySelector('#sharePhoto').disabled);
  assert.deepEqual(await page.evaluate(()=>window.integrationShares[0]),{hash:before.hash,type:'image/jpeg'});
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.shots.length),before.count);assert.equal(await page.evaluate(()=>window.integrationDownloads.length),0);
 });
 await check('saving the same combined recipe twice does not accumulate correction or paper',async()=>{
  const before=await page.evaluate(async()=>({id:window.pocketCamera.state.viewing.id,hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await window.pocketCamera.state.viewing.photo.arrayBuffer()))]}));
  await page.click('#editPhoto');await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  const after=await page.evaluate(async()=>({id:window.pocketCamera.state.viewing.id,hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await window.pocketCamera.state.viewing.photo.arrayBuffer()))]}));
  assert.notEqual(after.id,before.id,'Save copy creates another album entry');
  assert.deepEqual(after.hash,before.hash,'identical recipes keep identical saved pixels');
  assert.ok(await page.evaluate(id=>window.pocketCamera.state.shots.some(s=>s.id===id),before.id),'the earlier copy remains in the album');
 });
 await page.click('#editPhoto');await page.click('#tabAdjust');
 await check('re-edit, cancellation and reload preserve paper, mix, crop and enhancement independently',async()=>{
  assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.edit.recipe),expected.recipe);
  assert.equal(await page.inputValue('#enhanceStrength'),'57');await page.click('#enhancePhoto');await page.click('#enhancePhoto');
  assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.edit.recipe),expected.recipe);
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#toast')).opacity==='0');
  if(shots)await page.screenshot({path:join(shots,'phone-combined-adjust.png')});
  await page.click('#tabFrame');if(shots)await page.screenshot({path:join(shots,'phone-combined-paper.png')});
  await page.click('#paperChoices [data-paper="warm"]');await page.click('#cancelEdit');
  await page.reload();await page.waitForFunction(()=>window.pocketCamera?.state.shots.some(s=>s.recipe.enhance===.57));
  assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.shots.find(s=>s.recipe.enhance===.57).recipe),expected.recipe);
 });
 await check('no separate-development model or shader dependency and no page error',async()=>{
  assert.deepEqual(requests.filter(u=>/person-mask|photo-bodies|\.onnx|\.tflite|\/luts\//.test(u)),[]);assert.deepEqual(errors,[]);
 });
 console.log(`${checks}/${checks} combined integration checks passed`);
}finally{await browser.close();await server.close();}
