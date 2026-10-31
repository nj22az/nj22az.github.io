// Real Camera UI: icon discovery, unobstructed photo, responsive layout and immutable copy-save.
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
const results=[];let checks=0;
const cases=[['iphone-17',402,700],['iphone-17-full',402,874],['iphone-17-landscape',874,340],['ipad-mini',744,980],['ipad-mini-landscape',1133,650],['ipad-compact',768,1024],['small-phone',320,568],['resized-ipad',507,740]];
try{
 for(const [label,width,height] of cases){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},sound:false,printer:false})));
  const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${label}: ${name}`);};
  const capture=async name=>{if(shots)await page.screenshot({path:join(shots,`${label}-${name}.png`)});};
  try{
   await page.goto(server.url+'camera/');await page.waitForFunction(()=>window.pocketCamera?.state.shots.length>=2);
   await check('welcome has separate camera, import and labelled album actions',async()=>{
    assert.equal(await page.locator('#startCamera').textContent(),'Start camera');
    assert.equal(await page.locator('#welcomeImport').textContent(),'Choose a photo');
    await page.locator('#welcomeAlbum').scrollIntoViewIfNeeded();assert.ok(await page.locator('#welcomeAlbum strong').isVisible());
    const header=await page.locator('.camera-bar').evaluate(el=>{const r=el.getBoundingClientRect(),items=[...el.children].map(x=>x.getBoundingClientRect());return {overflow:el.scrollWidth-el.clientWidth,inside:items.every(x=>x.left>=r.left&&x.right<=r.right),overlap:items.some((x,i)=>items.slice(i+1).some(y=>Math.min(x.right,y.right)>Math.max(x.left,y.left)+1))};});
    assert.ok(header.overflow<=1&&header.inside&&!header.overlap,JSON.stringify(header));
   });await capture('welcome');
   await page.evaluate(async()=>{const b=await(await fetch('/camera/samples/default-original.png')).blob();await window.pocketCamera.editFile(new File([b],'approved-test.png',{type:'image/png'}));});
   await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');
   await check('all six edit tools keep full labels and touch targets',async()=>{
    const r=await page.locator('#editDock .segmented').evaluate(el=>({overflow:el.scrollWidth-el.clientWidth,buttons:[...el.children].map(b=>{const r=b.getBoundingClientRect();return {text:b.textContent,width:r.width,height:r.height,clipped:b.scrollWidth>b.clientWidth+1,left:r.left,right:r.right,top:r.top,bottom:r.bottom};})}));
    assert.deepEqual(r.buttons.map(b=>b.text),['Looks','Crop','Adjust','Erase','Stickers','Frame']);
    assert.ok(r.overflow<=1);for(const b of r.buttons)assert.ok(b.width>=44&&b.height>=44&&!b.clipped&&b.left>=0&&b.right<=width+1&&b.top>=0&&b.bottom<=height+1,JSON.stringify(b));
   });
   await check('Look changes use side icons and never cover the photograph',async()=>{
    await page.evaluate(()=>{const a=window.pocketCamera;a.chooseLook('print');a.addLayer();a.chooseLook('tilt');});
    const r=await page.evaluate(()=>{const photo=document.querySelector('#editFrame').getBoundingClientRect();return {layers:window.pocketCamera.state.edit.recipe.layers.length,rail:[...document.querySelectorAll('#editLookRail button')].map(b=>{const r=b.getBoundingClientRect();return {name:b.getAttribute('aria-label'),svg:!!b.querySelector('svg'),outside:r.left>=photo.right||r.right<=photo.left,width:r.width,height:r.height};}),notice:getComputedStyle(document.querySelector('#toast')).clipPath,categories:[...document.querySelectorAll('#lookGroups button')].map(b=>({name:b.getAttribute('aria-label'),icon:!!b.querySelector('svg')})),choices:document.querySelectorAll('#strip .tile').length};});
    assert.equal(r.layers,2);assert.equal(r.rail.length,2);assert.ok(r.rail.every(b=>b.svg&&b.name&&b.outside&&b.width>=44&&b.height>=44),JSON.stringify(r));
    assert.equal(r.notice,'inset(50%)');assert.equal(r.choices,34);assert.ok(r.categories.length>=7&&r.categories.every(c=>c.name&&c.icon));
    await page.locator('#editLookRail button').first().click();assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.active),0);
   });
   await check('original comparison is explicit and remains outside the photo',async()=>{
    await page.click('#compareOriginal');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.comparing),true);
    assert.equal(await page.getAttribute('#compareOriginal','aria-pressed'),'true');
    await page.click('#compareOriginal');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.comparing),false);
   });await capture('looks');
   await check('Enhance strength and manual adjustments share one active slider',async()=>{
    await page.click('#tabAdjust');assert.ok(await page.locator('#adjustSlider').isVisible());assert.ok(await page.locator('#enhanceStrength').isHidden());
    await page.click('#enhanceAmount');assert.ok(await page.locator('#enhanceStrength').isVisible());assert.ok(await page.locator('#adjustSlider').isHidden());
    await page.fill('#enhanceStrength','57');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.enhance),.57);
    await page.click('.adjuster[data-key="warmth"]');assert.ok(await page.locator('#adjustSlider').isVisible());assert.ok(await page.locator('#enhanceStrength').isHidden());
    await page.fill('#adjustSlider','22');await page.click('#adjustReset');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.adjust.warmth),0);
   });await capture('adjust');
   await check('Save copy preserves the earlier album entry and original bytes',async()=>{
    await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
    const first=await page.evaluate(async()=>{const s=window.pocketCamera.state.viewing;return {id:s.id,count:window.pocketCamera.state.shots.length,photo:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.photo.arrayBuffer()))],source:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.source.arrayBuffer()))]};});
    await page.click('#editPhoto');await page.click('#tabAdjust');await page.click('.adjuster[data-key="light"]');await page.fill('#adjustSlider','14');
    assert.equal(await page.textContent('#saveEdit'),'Save copy');await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
    const after=await page.evaluate(async id=>{const a=window.pocketCamera,old=a.state.shots.find(s=>s.id===id),s=a.state.viewing;return {id:s.id,count:a.state.shots.length,oldPhoto:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await old.photo.arrayBuffer()))],source:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.source.arrayBuffer()))]};},first.id);
    assert.notEqual(after.id,first.id);assert.equal(after.count,first.count+1);assert.deepEqual(after.oldPhoto,first.photo);assert.deepEqual(after.source,first.source);
   });
   if(label==='iphone-17')await check('enlarged text reflows without losing tool labels',async()=>{
    await page.click('#editPhoto');await page.addStyleTag({content:'html{font-size:200%}'});
    const r=await page.locator('#editDock .segmented').evaluate(el=>({overflow:el.scrollWidth-el.clientWidth,clipped:[...el.children].filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.textContent)}));
    assert.ok(r.overflow<=1);assert.deepEqual(r.clipped,[]);await capture('large-text');
   });
   await check('no page errors',async()=>assert.deepEqual(errors,[]));results.push({label,width,height,passed:true});
  }finally{await context.close();}
 }
 console.log(`${checks}/${checks} UI checks passed`);
}finally{
 if(shots)await writeFile(join(shots,'ui-results.json'),JSON.stringify({checks,results,physicalSafari:false},null,2));
 await browser.close();await server.close();
}
