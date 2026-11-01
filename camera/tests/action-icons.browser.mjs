// Actual Pocket Camera, original inline action artwork and real pre-change UI captures.
// Chromium device emulation only; camera and native Share are not exercised here.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS,baseline=process.env.CAMERA_ICON_BASELINE;
const symbols=['camera','look','edit','erase','timer','trash','printer','colour','game','sound','undo','pattern'];
const variants=[['iphone',402,874],['iphone-landscape',874,402],['ipad-mini',744,1133],['ipad-mini-landscape',1133,744]];
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;const results=[],check=async(name,fn)=>{await fn();checks++;console.log('ok '+name);};
if(shots)await mkdir(shots,{recursive:true});
async function settle(page){
 await page.evaluate(()=>Promise.allSettled(document.getAnimations().filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished)));
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
async function capture(page,label,name){if(shots){await settle(page);await page.screenshot({path:join(shots,`${label}-${name}.png`)});}}
async function openEditor(page){
 await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));
 await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');await settle(page);
}
async function targets(page,selectors){
 const data=await page.evaluate(selectors=>selectors.map(selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return {selector,width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom};}),selectors);
 for(const row of data)assert.ok(row.width>=44&&row.height>=44&&row.left>=-1&&row.right<=(await page.viewportSize()).width+1&&row.top>=-1&&row.bottom<=(await page.viewportSize()).height+1,JSON.stringify(row));
 return data;
}
async function dockTargets(page,selectors){
 await page.locator('#editDock .segmented').scrollIntoViewIfNeeded();
 return page.evaluate(selectors=>{const row=document.querySelector('#editDock .segmented').getBoundingClientRect();return selectors.map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {selector,width:r.width,height:r.height,left:r.left-row.left,right:r.right-row.left,top:r.top-row.top,bottom:r.bottom-row.top};});},selectors);
}
async function createPage(width,height,old=false){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({sound:false,printer:false,timer:0,recipe:{layers:[{look:'none',amount:1}]}})));
 if(old){
  // Overlay the exact reviewed pre-change assets; all remaining assets are unchanged runtime dependencies.
  const before=new Map();for(const name of ['index.html','app.js','camera.css','camera-ui.css','looks-gl.js'])before.set(name,await readFile(join(baseline,name)));
  await page.route('**/camera/**',async route=>{const path=new URL(route.request().url()).pathname,name=path==='/camera/'?'index.html':path.slice('/camera/'.length),body=before.get(name);if(body)await route.fulfill({body,contentType:name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':'application/javascript'});else await route.continue();});
 }
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>window.pocketCamera?.engine&&window.pocketCamera.state.shots.length>=2);await settle(page);await page.locator('#startCamera').scrollIntoViewIfNeeded();
 return {page,context,errors};
}
try{
 if(baseline){
  for(const [name,width,height] of variants){
   const {page,context,errors}=await createPage(width,height,true);
   try{
    await capture(page,`${name}-before`,'welcome');await page.click('#settingsToggle');await page.getByRole('button',{name:'Self-timer: off',exact:true}).click();await page.locator('#settings').evaluate(el=>el.scrollTop=0);await capture(page,`${name}-before`,'settings');await page.click('#settingsDone');
    await openEditor(page);await capture(page,`${name}-before`,'looks');await page.click('#tabAdjust');await capture(page,`${name}-before`,'adjust');await page.click('#tabErase');await capture(page,`${name}-before`,'erase');
    assert.deepEqual(errors,[]);console.log('captured exact baseline '+name);
   }finally{await context.close();}
  }
 }
 for(const [name,width,height] of variants){
  const {page,context,errors}=await createPage(width,height);
  try{
   await check(name+' keeps default dark mode and accessible camera action',async()=>{
    const mode=await page.evaluate(()=>({scheme:getComputedStyle(document.documentElement).colorScheme,bg:getComputedStyle(document.body).backgroundColor}));
    assert.equal(mode.scheme,'dark');assert.ok(mode.bg.match(/\d+/g).slice(0,3).every(v=>+v<32),JSON.stringify(mode));
    assert.equal(await page.locator('#startCamera').textContent(),'Start camera');assert.equal(await page.locator('#startCamera svg.action-icon').count(),1);
    await targets(page,['#startCamera']);
   });await capture(page,`${name}-after`,'welcome');
   await page.click('#settingsToggle');await settle(page);
   await check(name+' keeps 32 px settings artwork, names and selected value',async()=>{
    const geometry=await page.evaluate(()=>['timer','printSetting','soundSetting'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,width:r.width,height:r.height};}));
    for(const row of geometry)assert.ok(row.width>=44&&row.height>=44,JSON.stringify(row));
    for(const id of ['timer','printSetting','soundSetting']){const r=await page.locator(`#${id} svg.action-icon`).boundingBox();assert.equal(r.width,32);assert.equal(r.height,32);}
    await page.getByRole('button',{name:'Self-timer: off',exact:true}).click();assert.equal(await page.locator('#timer').getAttribute('aria-label'),'Self-timer: 3 seconds');assert.ok(await page.locator('#timer').evaluate(el=>el.classList.contains('on')));
    const changed=await page.evaluate(()=>['timer','printSetting','soundSetting'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,width:r.width,height:r.height};}));assert.deepEqual(changed,geometry,'changing timer does not resize controls');
    await page.getByRole('button',{name:'Sounds: off',exact:true}).click();assert.equal(await page.locator('#soundSetting').getAttribute('aria-label'),'Sounds: on');assert.equal(await page.locator('#soundSetting use').getAttribute('href'),'#i-sound');
    await page.getByRole('button',{name:'Sounds: on',exact:true}).click();assert.equal(await page.locator('#soundSetting use').getAttribute('href'),'#i-sound-off');
   });await page.locator('#settings').evaluate(el=>el.scrollTop=0);await capture(page,`${name}-after`,'settings');await page.click('#settingsDone');await openEditor(page);
   await check(name+' preserves tab hierarchy, selected state and stable targets',async()=>{
    const tabs=['#tabLooks','#tabCrop','#tabAdjust','#tabErase','#tabStickers','#tabFrame'],initial=await dockTargets(page,tabs);
    await targets(page,tabs);
    assert.deepEqual(await page.locator('#editDock > .segmented [role=tab]').allTextContents(),['Looks','Crop','Adjust','Erase','Stickers','Frame']);
    for(const [id,label] of [['tabLooks','Looks'],['tabAdjust','Adjust'],['tabErase','Erase']]){
     await page.getByRole('tab',{name:label,exact:true}).click();await settle(page);assert.equal(await page.locator('#'+id).getAttribute('aria-selected'),'true');
     const icon=await page.locator('#'+id+' svg.action-icon').boundingBox();assert.equal(icon.width,32);assert.equal(icon.height,32);
     assert.notEqual(await page.locator('#'+id).evaluate(el=>getComputedStyle(el).boxShadow),'none','selected colour icons keep an independent outline cue');
     assert.deepEqual(await dockTargets(page,tabs),initial,'changing active tool does not move dock buttons within their row');
     await targets(page,tabs);
    }
   });await page.click('#tabLooks');await capture(page,`${name}-after`,'looks');
   await check(name+' keeps photographic Look symbols separate from action artwork',async()=>{
    const r=await page.evaluate(()=>({actionInLook:document.querySelectorAll('.swatch .action-icon,.look-rail .look-icon.action-icon').length,lookSymbols:document.querySelectorAll('#lookGroups button svg').length,actions:document.querySelectorAll('#tabLooks svg.action-icon').length}));
    assert.equal(r.actionInLook,0);assert.ok(r.lookSymbols>0);assert.equal(r.actions,1);
   });
   await page.click('#tabAdjust');await settle(page);
   await check(name+' keeps 24 px Colour and Pattern radios independent of recipe values',async()=>{
    for(const key of ['colour','pattern']){
     await page.getByRole('radio',{name:key==='colour'?'Colour':'Pattern',exact:true}).click();assert.equal(await page.locator(`.adjuster[data-key=${key}]`).getAttribute('aria-checked'),'true');
     const icon=await page.locator(`.adjuster[data-key=${key}] svg.action-icon`).boundingBox();assert.equal(icon.width,24);assert.equal(icon.height,24);
     await page.fill('#adjustSlider','27');assert.equal(await page.evaluate(key=>window.pocketCamera.state.edit.recipe.adjust[key],key),.27);
     await page.click('#adjustReset');assert.equal(await page.evaluate(key=>window.pocketCamera.state.edit.recipe.adjust[key],key),0);
    }
   });await capture(page,`${name}-after`,'adjust');await page.click('#tabErase');
   await check(name+' keeps Undo disabled and visibly distinguished before a brush stroke',async()=>{
    const undo=page.getByRole('button',{name:'Undo',exact:true});assert.equal(await undo.isDisabled(),true);assert.equal(await undo.locator('svg.action-icon').count(),1);
    const state=await undo.evaluate(el=>{const icon=el.querySelector('svg'),a=getComputedStyle(el),b=getComputedStyle(icon);return {opacity:+a.opacity*+b.opacity,filter:b.filter};});
    assert.ok(state.opacity<.8||state.filter!=='none',JSON.stringify(state));await targets(page,['#eraseUndo','#eraseSuggest']);
   });await capture(page,`${name}-after`,'erase');
   await check(name+' original actions survive SVG rasterisation at 24 and 32 pixels',async()=>{
    const raster=await page.evaluate(async symbols=>{
     const rows=[];
     for(const name of symbols)for(const size of [24,32]){
      const symbol=document.getElementById('i-'+name);if(!symbol){rows.push({name,size,missing:true});continue;}
      const attrs=[...symbol.attributes].filter(a=>!['id','viewBox'].includes(a.name)).map(a=>`${a.name}="${a.value}"`).join(' ');
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${symbol.getAttribute('viewBox')}" fill="none" stroke="none"><g ${attrs}>${symbol.innerHTML}</g></svg>`,image=new Image();image.src='data:image/svg+xml;base64,'+btoa(svg);await image.decode();
      const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const g=canvas.getContext('2d');g.drawImage(image,0,0);const pixels=g.getImageData(0,0,size,size).data;let painted=0,colour=0,edge=0;
      // The outside silhouette may antialias onto a boundary pixel without clipping. Render the same
      // geometry with four viewBox units of overscan and check for actual painted geometry outside it.
      const pad=size/8,oversize=size+2*pad,overscan=new Image();overscan.src='data:image/svg+xml;base64,'+btoa(svg.replace(`width="${size}" height="${size}" viewBox="0 0 32 32"`,`width="${oversize}" height="${oversize}" viewBox="-4 -4 40 40"`));await overscan.decode();
      const wide=document.createElement('canvas');wide.width=oversize;wide.height=oversize;const wg=wide.getContext('2d');wg.drawImage(overscan,0,0);const wp=wg.getImageData(0,0,oversize,oversize).data;let overflow=0;
      for(let i=0;i<wp.length;i+=4){const p=i/4,x=p%oversize,y=Math.floor(p/oversize);if((x<pad||y<pad||x>=pad+size||y>=pad+size)&&wp[i+3]>32)overflow++;}
      for(let i=0;i<pixels.length;i+=4){const p=i/4,x=p%size,y=Math.floor(p/size),r=pixels[i],green=pixels[i+1],b=pixels[i+2],a=pixels[i+3];if(a>32){painted++;if(Math.max(r,green,b)-Math.min(r,green,b)>70)colour++;if(x===0||y===0||x===size-1||y===size-1)edge++;}}
      rows.push({name,size,painted,colour,edge,overflow});
     }return rows;
    },symbols);
    for(const r of raster){assert.ok(!r.missing&&r.painted>r.size*r.size*.12&&r.colour>r.size*r.size*.025,JSON.stringify(r));assert.equal(r.overflow,0,'overscan proves the complete keyline stays within viewBox: '+JSON.stringify(r));}
    results.push({viewport:name,raster});
   });
   await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
   await check(name+' retains Edit/Delete artwork and immutable album copy',async()=>{
    await targets(page,['#editPhoto','#deletePhoto']);for(const id of ['editPhoto','deletePhoto'])assert.equal(await page.locator(`#${id} svg.action-icon`).count(),1);
    assert.ok(await page.locator('#deletePhoto').getByText('Delete',{exact:true}).isVisible());assert.ok(await page.evaluate(()=>window.pocketCamera.state.shots.length>=3));
   });await capture(page,`${name}-after`,'viewer');
   assert.deepEqual(errors,[]);
  }finally{await context.close();}
 }
 if(shots)await writeFile(join(shots,'action-icons-results.json'),JSON.stringify({checks,viewports:variants,results,baseline:baseline?true:false,physicalSafari:false},null,2)+'\n');
 console.log(`${checks}/${checks} action icon browser checks passed`);
}finally{await browser.close();server.close();}
