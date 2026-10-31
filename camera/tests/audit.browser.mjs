// Photo-geometry and visual-control audit. All captures use the real Camera, not a UI mockup.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS||'/tmp/camera-design-audit',baseline=process.env.CAMERA_AUDIT_BASELINE;
assert.ok(baseline,'CAMERA_AUDIT_BASELINE contains the published source for before/after evidence');
await mkdir(join(shots,'shaders'),{recursive:true});await mkdir(join(shots,'layouts'),{recursive:true});
const oldFiles=Object.fromEntries(await Promise.all(['index.html','app.js','camera-ui.css','looks-gl.js'].map(async name=>[name,await readFile(join(baseline,name),'utf8')])));
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results={baseline:'83783c93448d1be251a61c213959448e1d21c971',checks:[],geometry:[],layouts:[],physicalSafari:false};
const check=async(name,fn)=>{await fn();results.checks.push(name);console.log('ok  '+name);};
const png=async(name,data)=>writeFile(join(shots,name),Buffer.from(data.split(',')[1],'base64'));
async function pageFor({before=false,width=402,height=700}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage();
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},sound:false,printer:false})));
 if(before)await context.route('**/camera/**',route=>{const path=new URL(route.request().url()).pathname,name=path==='/camera/'?'index.html':path.slice(8);return oldFiles[name]?route.fulfill({body:oldFiles[name],contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'}):route.continue();});
 await page.route('**/camera/audit-before-engine.js',route=>route.fulfill({body:oldFiles['looks-gl.js'],contentType:'text/javascript'}));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>window.pocketCamera?.state.shots.length>=2);
 await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
 await page.evaluate(()=>{const e=window.pocketCamera.engine,draw=e.draw;e.draw=(recipe,options)=>{const ready=draw(recipe,options);if(ready)window.auditDrawn=recipe.layers.map(l=>({...l}));return ready;};});
 return {context,page};
}
async function choose(page,name){
 const group=await page.locator('#lookGroups button').evaluateAll((bs,name)=>bs.find(b=>b.getAttribute('aria-label').split(': ').slice(1).join(': ').split(', ').includes(name))?.dataset.group,name.label);
 assert.ok(group,name.id);await page.click(`#lookGroups [data-group="${group}"]`);await page.click(`.tile[data-look="${name.id}"]`);if(name.id!=='none')await page.fill('#amount','100');
 await page.waitForFunction(id=>window.auditDrawn?.length===1&&window.auditDrawn[0].look===id&&(id==='none'||window.auditDrawn[0].amount===1),name.id);
 await page.locator('#lookGroups').evaluate(el=>Promise.allSettled(el.getAnimations({subtree:true}).map(a=>a.finished)));
}
try{
 const old=await pageFor({before:true});
 await choose(old.page,{id:'thirtyTwoBit',label:'32-bit'});await old.page.screenshot({path:join(shots,'iphone-before-32bit.png')});
 const repeatedBefore=await old.page.evaluate(async()=>{const a=window.pocketCamera,out=[];for(const look of ['eightBit','snes','thirtyTwoBit','colourHandheld']){a.chooseLook(look);const svg=document.querySelector('#editLookRail svg');out.push({look,vector:svg.innerHTML.replace(/(?:rail|mix|cam)-[\w-]+/g,'id')});}return out;});
 results.previousConsoleSymbols=repeatedBefore;await old.context.close();
 const current=await pageFor(),{page}=current,errors=[];page.on('pageerror',e=>errors.push(e.message));
 await choose(page,{id:'thirtyTwoBit',label:'32-bit'});await page.screenshot({path:join(shots,'iphone-after-32bit.png')});
 results.geometry=await page.evaluate(async()=>{
  const now=await import('/camera/looks-gl.js?v=20261031audit1'),before=await import('/camera/audit-before-engine.js'),rows=[];
  const measure=({data,width:w,height:h})=>{
   const vertical=[],horizontal=[];
   const dark=(x,y)=>{const i=(y*w+x)*4;return data[i]<100&&data[i+1]<100&&data[i+2]<100;};
   for(let line=1;line<8;line++){
    const xs=[],ys=[];
    for(let k=0;k<8;k++){
     const y=Math.floor((k+.37)*h/8),x=Math.floor((k+.37)*w/8),x0=line*w/8,y0=line*h/8;
     let tx=0,nx=0,ty=0,ny=0;
     for(let xx=Math.max(0,Math.floor(x0-w*.06));xx<Math.min(w,x0+w*.06);xx++)if(dark(xx,y)){tx+=xx;nx++;}
     for(let yy=Math.max(0,Math.floor(y0-h*.06));yy<Math.min(h,y0+h*.06);yy++)if(dark(x,yy)){ty+=yy;ny++;}
     if(nx)xs.push(tx/nx);if(ny)ys.push(ty/ny);
    }
    vertical.push(xs.length===8?Math.max(...xs)-Math.min(...xs):null);horizontal.push(ys.length===8?Math.max(...ys)-Math.min(...ys):null);
   }
   return {vertical:Math.max(0,...vertical.filter(Number.isFinite)),horizontal:Math.max(0,...horizontal.filter(Number.isFinite)),missing:vertical.filter(x=>x===null).length+horizontal.filter(x=>x===null).length};
  };
  for(const [w,h] of [[640,480],[480,640],[800,450],[450,800]]){
   const source=document.createElement('canvas');source.width=w*2;source.height=h*2;const g=source.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,source.width,source.height);g.fillStyle='#000';
   // Lines span at least two retro texels even in 9:16; test bending rather than sub-texel aliasing.
   for(let i=1;i<8;i++){g.fillRect(i*source.width/8-source.width*.0175,0,source.width*.035,source.height);g.fillRect(0,i*source.height/8-source.height*.0175,source.width,source.height*.035);}
   for(const light of [false,true]){
    const a=now.createLookEngine(document.createElement('canvas'),{light}),b=before.createLookEngine(document.createElement('canvas'),{light});a.setSource('chart',source,source.width,source.height);b.setSource('chart',source,source.width,source.height);
    const recipe=now.normalRecipe({layers:[{look:'thirtyTwoBit',amount:1}]}),opts={source:'chart',width:w,height:h};
    const fresh=a.render(recipe,opts),old=b.render(recipe,opts),zero=a.render(now.normalRecipe({layers:[{look:'thirtyTwoBit',amount:0}]}),opts),natural=a.render(now.normalRecipe(),opts);
    const row={width:w,height:h,light,before:measure(old),after:measure(fresh),zeroMatches:zero.data.every((n,i)=>n===natural.data[i])};
    if(w===640&&!light){const image=px=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').putImageData(new ImageData(px,w,h),0,0);return c.toDataURL();};row.beforePNG=image(old.data);row.afterPNG=image(fresh.data);}
    rows.push(row);a.gl.getExtension('WEBGL_lose_context')?.loseContext();b.gl.getExtension('WEBGL_lose_context')?.loseContext();
   }
  }
  return rows;
 });
 for(const row of results.geometry){
  await check(`32-bit geometry ${row.width}x${row.height} ${row.light?'LIGHT':'full'}`,async()=>{const texel=Math.max(row.width/Math.max(1,Math.floor(120*row.width/row.height)),row.height/120);assert.equal(row.after.missing,0);assert.ok(Number.isFinite(row.after.vertical)&&Number.isFinite(row.after.horizontal)&&row.after.vertical<=texel&&row.after.horizontal<=texel,JSON.stringify(row));assert.ok(row.before.vertical>texel||row.before.horizontal>texel||row.before.missing>0,'published shader visibly bends the chart');assert.equal(row.zeroMatches,true);});
  if(row.beforePNG){await png('geometry-before.png',row.beforePNG);await png('geometry-after.png',row.afterPNG);delete row.beforePNG;delete row.afterPNG;}
 }
 await check('32-bit retains five-bit colour, ordered dither and deterministic pixels',async()=>{
  const quality=await page.evaluate(async()=>{
   const m=await import('/camera/looks-gl.js?v=20261031audit1'),e=m.createLookEngine(document.createElement('canvas')),c=document.createElement('canvas');c.width=640;c.height=480;const g=c.getContext('2d'),gradient=g.createLinearGradient(0,0,440,0);gradient.addColorStop(0,'#000');gradient.addColorStop(1,'#fff');g.fillStyle=gradient;g.fillRect(0,0,640,480);g.fillStyle='#808080';g.fillRect(440,0,200,480);
   e.setSource('quality',c,640,480);const r=m.normalRecipe({layers:[{look:'thirtyTwoBit'}]}),o={source:'quality',width:320,height:240},a=e.render(r,o).data,b=e.render(r,o).data,levels=new Set(),dither=new Set();let maxQuantizationError=0,opaque=true;
   for(let y=0;y<240;y++)for(let x=0;x<320;x++){const i=(y*320+x)*4,v=a[i];levels.add(v);maxQuantizationError=Math.max(maxQuantizationError,Math.abs(v-Math.round(Math.round(v*31/255)*255/31)));opaque&&=a[i+3]===255;if(x>240&&x<280&&y>80&&y<120)dither.add(v);}
   e.gl.getExtension('WEBGL_lose_context')?.loseContext();return {levels:levels.size,ditherLevels:dither.size,maxQuantizationError,opaque,repeat:a.every((v,i)=>v===b[i])};
  });assert.ok(quality.levels>=28&&quality.levels<=32,JSON.stringify(quality));assert.equal(quality.ditherLevels,2);assert.ok(quality.maxQuantizationError<=1);assert.equal(quality.opaque,true);assert.equal(quality.repeat,true);results.quality=quality;
 });
 const names=await page.evaluate(async()=>{const{LOOKS}=await import('/camera/looks-gl.js?v=20261031audit1');return Object.entries(LOOKS).map(([id,x])=>({id,label:x.label}));});
 const symbols=[];
 for(const [index,name] of names.entries())await check(name.id==='none'?'Natural disables irrelevant strength':`actual UI selects ${name.label} and its intensity`,async()=>{
  await choose(page,name);assert.equal(await page.locator(`.tile[data-look="${name.id}"]`).getAttribute('aria-checked'),'true');
  const icon=await page.locator('#editLookRail svg').evaluate(svg=>({look:svg.dataset.look,vector:svg.innerHTML}));assert.equal(icon.look,name.id);symbols.push(icon);
  const label=await page.locator('#editLookRail span').evaluate(e=>({overflow:e.scrollWidth-e.clientWidth,rect:e.getBoundingClientRect().toJSON()}));assert.ok(label.overflow<=1,name.label);
  await page.screenshot({path:join(shots,'shaders',`${String(index+1).padStart(2,'0')}-${name.id}.png`)});
  if(name.id==='none'){assert.equal(await page.locator('#amount').isDisabled(),true);return;}
  await page.fill('#amount','0');await page.waitForFunction(id=>window.auditDrawn?.[0]?.look===id&&window.auditDrawn[0].amount===0,name.id);
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.layers[0].amount),0);
  const zero=await page.evaluate(async()=>{const a=window.pocketCamera,m=await import('/camera/looks-gl.js?v=20261031audit1'),r=a.state.edit.recipe,opts={source:'edit',crop:r.crop,width:160,height:120},x=a.engine.render(r,opts).data,y=a.engine.render(m.normalRecipe({crop:r.crop}),opts).data;return x.every((v,i)=>v===y[i]);});assert.equal(zero,true,`${name.label}: 0% restores the original pixels`);await page.fill('#amount','100');
 });
 await check('effect symbols are complete and visually distinct in markup',async()=>{assert.equal(symbols.length,34);assert.equal(new Set(symbols.map(x=>x.vector)).size,34);});
 const board=await page.evaluate(async()=>{
  const a=window.pocketCamera,{LOOKS,normalRecipe}=await import('/camera/looks-gl.js?v=20261031audit1'),{lookIcon}=await import('/camera/look-icons.js?v=20261031audit1');
  const c=document.createElement('canvas');c.width=1196;c.height=920;const g=c.getContext('2d');g.fillStyle='#0d0e10';g.fillRect(0,0,c.width,c.height);g.fillStyle='#faf9f6';g.font='bold 24px sans-serif';g.fillText('Pocket Camera · all 34 actual shader outputs',20,35);g.font='14px sans-serif';g.fillStyle='#b7babf';g.fillText('One source photograph · 100% · no Enhance, paper, frame or overlays',20,59);
  const icons=document.createElement('canvas');icons.width=1196;icons.height=700;const ig=icons.getContext('2d');ig.fillStyle='#1c1e21';ig.fillRect(0,0,icons.width,icons.height);ig.fillStyle='#faf9f6';ig.font='bold 24px sans-serif';ig.fillText('Shader symbols · medium, colour and console codes',20,36);
  for(const [i,[name,info]] of Object.entries(LOOKS).entries()){
   const x=18+(i%7)*168,y=82+Math.floor(i/7)*166,p=a.engine.render(normalRecipe({layers:[{look:name}]}),{source:'edit',crop:a.state.edit.recipe.crop,width:152,height:114});
   const t=document.createElement('canvas');t.width=152;t.height=114;t.getContext('2d').putImageData(new ImageData(p.data,152,114),0,0);g.drawImage(t,x,y);g.fillStyle='#faf9f6';g.font='bold 13px sans-serif';g.fillText(info.label,x,y+136,156);
   const ix=18+(i%7)*168,iy=62+Math.floor(i/7)*126,svg=lookIcon(name).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" style="color:#f4d677" '),img=new Image();img.src='data:image/svg+xml;base64,'+btoa(svg);await img.decode();ig.drawImage(img,ix+48,iy,48,48);ig.fillStyle='#faf9f6';ig.font='bold 13px sans-serif';ig.fillText(info.label,ix,iy+78,156);
  }
  return {looks:c.toDataURL(),icons:icons.toDataURL()};
 });await png('all-34-shaders.png',board.looks);await png('shader-icons.png',board.icons);
 await choose(page,{id:'thirtyTwoBit',label:'32-bit'});
 await check('32-bit Save copy retains the source and produces a normal JPEG',async()=>{await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');const saved=await page.evaluate(async()=>{const s=window.pocketCamera.state.viewing,img=await createImageBitmap(s.photo);const out={type:s.photo.type,width:img.width,height:img.height,look:s.recipe.layers[0].look,sourceBytes:s.source.size};img.close();return out;});assert.equal(saved.type,'image/jpeg');assert.equal(saved.look,'thirtyTwoBit');assert.ok(saved.width>0&&saved.height>0&&saved.sourceBytes>0);await page.screenshot({path:join(shots,'saved-32bit.png')});});
 await check('shader controls produce no page errors',async()=>assert.deepEqual(errors,[]));await current.context.close();
 for(const [label,width,height] of [['iphone-17',402,700],['iphone-landscape',874,340],['ipad-mini',744,980],['ipad-landscape',1133,650]]){
  const ui=await pageFor({width,height});await choose(ui.page,{id:'thirtyTwoBit',label:'32-bit'});
  await check(`${label}: all six tool panels retain their controls`,async()=>{
   for(const tab of ['Looks','Crop','Adjust','Erase','Stickers','Frame']){
    await ui.page.click('#tab'+tab);
    const row=await ui.page.evaluate(()=>{const photo=document.querySelector('#editFrame').getBoundingClientRect(),rail=document.querySelector('.editor-rail').getBoundingClientRect();return {horizontalOverflow:document.documentElement.scrollWidth-innerWidth,picture:{width:photo.width,height:photo.height},railOutside:rail.left>=photo.right-1,tools:[...document.querySelectorAll('#editDock .segmented button')].map(b=>{const r=b.getBoundingClientRect();return {name:b.getAttribute('aria-label'),width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom};})};});
    assert.ok(row.horizontalOverflow<=1&&row.railOutside,JSON.stringify(row));assert.ok(row.tools.every(b=>b.width>=44&&b.height>=44&&b.left>=0&&b.right<=width+1&&b.top>=0&&b.bottom<=height+1),JSON.stringify(row));results.layouts.push({label,width,height,tab,...row});
    await ui.page.screenshot({path:join(shots,'layouts',`${label}-${tab.toLowerCase()}.png`)});
   }
  });await ui.context.close();
 }
 console.log(`${results.checks.length}/${results.checks.length} design/shader audit checks passed`);
}finally{await writeFile(join(shots,'audit-results.json'),JSON.stringify(results,null,2));await browser.close();await server.close();}
