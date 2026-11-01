// Real WebGL, family controls and album-session round trip. No device Safari claim.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',permissions:['camera'],serviceWorkers:'block'}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log('ok  '+name);};
try{
 await page.addInitScript(()=>{if(!localStorage.getItem('office-pocket-camera'))localStorage.setItem('office-pocket-camera',JSON.stringify({sound:false,printer:false}));});
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await check('all systems and finishes compile; zero finish is exact, each control changes pixels, and thumbnails include the selected finish',async()=>{
  const result=await page.evaluate(async()=>{
   const m=await import('/camera/looks-gl.js?v=20261101icons1'),settings=await import('/camera/look-settings.js?v=20261101icons1');
   const canvas=document.createElement('canvas');canvas.width=320;canvas.height=240;
   const source=document.createElement('canvas');source.width=320;source.height=240;const g=source.getContext('2d');
   const gradient=g.createLinearGradient(0,0,320,240);gradient.addColorStop(0,'#103c8a');gradient.addColorStop(.4,'#eee59a');gradient.addColorStop(1,'#e9307a');g.fillStyle=gradient;g.fillRect(0,0,320,240);g.fillStyle='#101010';g.fillRect(130,65,50,110);
   const e=m.createLookEngine(canvas);e.setSource('test',source,320,240);const options={source:'test',width:320,height:240},out=[];
   const render=layer=>e.render(m.normalRecipe({layers:[{amount:1,...layer}]}),options).data;
   const diff=(a,b)=>a.reduce((n,v,i)=>n+Math.abs(v-b[i]),0);
   for(const look of ['pocket','colourHandheld','redVisor','eightBit','snes','thirtyTwoBit','sixtyFourBit','camcorder','crt']){
    const original=render({look});
    if(look!=='crt')out.push({name:look+' zero',ok:diff(original,render({look,screen:{mode:'crt'}}))===0});
    for(const mode of look==='crt'?['crt']:['crt','lcd']){
     const layer={look,screen:settings.screenDefaults(mode)},a=render(layer),b=render(layer);
     out.push({name:look+' '+mode,ok:diff(a,b)===0&&diff(a,original)>100});
    }
   }
   const base=render({look:'pocket'}),pocket=render({look:'pocket',handheld:'pocket'}),light=render({look:'pocket',handheld:'light'});
   out.push({name:'distinct Pocket and Light palettes',ok:diff(base,pocket)>100&&diff(pocket,light)>100});
   for(const key of ['scanlines','glow','curve','mask']){
    const zero={mode:'crt',scanlines:0,glow:0,curve:0,mask:0};out.push({name:key,ok:diff(render({look:'snes',screen:zero}),render({look:'snes',screen:{...zero,[key]:1}}))>100});
   }
   const recipe=m.normalRecipe({layers:[{look:'snes',screen:settings.screenDefaults('crt')}]});
   for(let i=0;i<50&&!e.isReady('snes');i++)await new Promise(r=>setTimeout(r,20));
   const thumb=e.thumbnails(recipe,{source:'test',size:240,names:['snes']});
   const clean=e.thumbnails(m.normalRecipe({layers:[{look:'snes'}]}),{source:'test',size:240,names:['snes']});
   out.push({name:'selected thumbnail finish',ok:!!thumb&&!!clean&&!thumb.missing.length&&diff(thumb.data,clean.data)>100});
   e.gl.getExtension('WEBGL_lose_context')?.loseContext();return out;
  });
  for(const row of result)assert.ok(row.ok,row.name);
 });
 await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
 await check('one tile per game family; all handheld models and console systems are reachable through their settings',async()=>{
  await page.click('#lookGroups [data-group="games"]');
  assert.equal(await page.locator('#strip .tile:visible').count(),2);
  await page.click('#strip .tile[data-look="pocket"]');await page.click('.look-settings-button');
  for(const value of ['pocket:pocket','pocket:light','colourHandheld','redVisor','pocket']){
   await page.selectOption('#lookVariant',value);const r=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.layers);
   assert.equal(r.length,1);assert.equal(r[0].look,value.split(':')[0]);assert.equal(r[0].handheld,value.split(':')[1]);
  }
  await page.click('#lookSettingsSheet .done');await page.click('#strip .tile[data-look="eightBit"]');await page.click('.look-settings-button');
  for(const value of ['snes','thirtyTwoBit','sixtyFourBit','snes']){await page.selectOption('#lookVariant',value);assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.layers[0].look),value);}
  await page.selectOption('#screenFinish','crt');await page.fill('#screen-scanlines','62');await page.fill('#screen-glow','37');
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.layers.length),1);
 });
 await check('settings sheet fits narrow phones and tablets, with accessible controls',async()=>{
  for(const [width,height] of [[320,568],[844,390],[820,1180]]){
   await page.setViewportSize({width,height});
   // Dynamic viewport units settle on the following layout frame after a mobile resize.
   await page.waitForFunction(({width,height})=>{const r=document.querySelector('#lookSettingsSheet').getBoundingClientRect();return r.y>=0&&r.bottom<=height+1&&r.right<=width+1;},{width,height},{timeout:3000});
   const r=await page.locator('#lookSettingsSheet').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,overflow:el.scrollWidth-el.clientWidth};});
   assert.ok(r.x>=0&&r.y>=0&&r.right<=width+1&&r.bottom<=height+1&&r.overflow<=1,JSON.stringify(r));
   assert.equal(await page.getByLabel('Scanlines',{exact:true}).getAttribute('type'),'range');
  }
  if(process.env.CAMERA_SHOTS){await mkdir(process.env.CAMERA_SHOTS,{recursive:true});await page.screenshot({path:join(process.env.CAMERA_SHOTS,'game-settings.png')});}
  await page.setViewportSize({width:390,height:844});
 });
 const expected=await page.evaluate(()=>JSON.parse(JSON.stringify(window.pocketCamera.state.edit.recipe.layers)));
 await page.click('#lookSettingsSheet .done');
 await check('saving and a fresh browser page retain the full original and system/screen recipe',async()=>{
  await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
  const id=await page.evaluate(()=>window.pocketCamera.state.viewing.id);
  await page.reload();await page.waitForFunction(()=>!!window.pocketCamera?.engine&&window.pocketCamera.state.shots.length>=2);
  const stored=await page.evaluate(async id=>{const {getShot}=await import('/camera/album.js?v=20261029c');const s=await getShot(id);return {layers:s.recipe.layers,source:s.source?.size,photo:s.photo?.size};},id);
  assert.deepEqual(stored.layers,expected);assert.ok(stored.source>0&&stored.photo>0);
  await page.locator('#roll:visible, #welcomeAlbum:visible').first().click();await page.click(`#grid [data-id="${id}"]`);await page.click('#editPhoto');
  await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
  assert.deepEqual(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.layers),expected);
  await page.reload();await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 });
 await check('camera model and finish settings survive a new session, and Reset restores the original',async()=>{
  await page.evaluate(async()=>{window.pocketCamera.chooseLook('pocket');await window.pocketCamera.startCamera();});await page.waitForFunction(()=>window.pocketCamera.state.camera.running);await page.locator('#cameraLookRail button').first().click();await page.click('.look-settings-button');
  await page.selectOption('#lookVariant','pocket:light');await page.selectOption('#screenFinish','lcd');await page.fill('#screen-mask','42');
  await page.click('#lookSettingsSheet .done');await page.reload();await page.waitForFunction(()=>!!window.pocketCamera?.engine);
  const layer=await page.evaluate(()=>window.pocketCamera.state.camera.recipe.layers[0]);assert.equal(layer.handheld,'light');assert.equal(layer.screen.mask,.42);
  await page.evaluate(()=>window.pocketCamera.startCamera());await page.waitForFunction(()=>window.pocketCamera.state.camera.running);await page.locator('#cameraLookRail button').first().click();await page.click('.look-settings-button');await page.click('#lookSettingsReset');
  const reset=await page.evaluate(()=>window.pocketCamera.state.camera.recipe.layers[0]);assert.equal(reset.screen,undefined);assert.equal(reset.handheld,undefined);
 });
 assert.deepEqual(errors,[]);console.log(`${checks}/${checks} screen settings browser checks passed`);
}finally{await context.close();await browser.close();server.close();}
