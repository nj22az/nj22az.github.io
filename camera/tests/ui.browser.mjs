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
async function settleEditor(page){
 await page.locator('#editor').evaluate(el=>Promise.allSettled(el.getAnimations({subtree:true}).filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished)));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.waitForFunction(()=>{const a=window.pocketCamera.state.edit,p=document.querySelector('#editPictureArea').getBoundingClientRect(),f=document.querySelector('#editFrame').getBoundingClientRect(),aspect=a.recipe.crop.w*a.width/(a.recipe.crop.h*a.height),w=Math.min(p.width,p.height*aspect);return Math.abs(f.width-Math.floor(w))<=1&&Math.abs(f.height-Math.floor(w/aspect))<=1;});
}
async function reachableRail(page){
 const looks=[];
 for(const index of [2,1,0]){
  await page.locator('#editLookRail button').nth(index).click();await settleEditor(page);
  const row=await page.locator('#editLookRail button').nth(index).evaluate(b=>{const rail=b.closest('.look-rail').getBoundingClientRect(),r=b.getBoundingClientRect(),svg=b.querySelector('svg').getBoundingClientRect(),stage=document.querySelector('#editStage');return {rail:rail.toJSON(),button:r.toJSON(),icon:svg.toJSON(),stageScroll:stage.scrollTop,inside:r.top>=rail.top-1&&r.bottom<=rail.bottom+1&&svg.top>=rail.top-1&&svg.bottom<=rail.bottom+1};});
  assert.ok(row.inside&&row.stageScroll===0,JSON.stringify(row));
  looks.push({index,...row});
 }
 await page.click('#compareOriginal');await settleEditor(page);
 assert.equal(await page.getAttribute('#compareOriginal','aria-pressed'),'true');
 const original=await page.locator('#compareOriginal').evaluate(b=>{const rail=b.closest('.look-rail').getBoundingClientRect(),r=b.getBoundingClientRect();return {inside:r.top>=rail.top-1&&r.bottom<=rail.bottom+1,rail:rail.toJSON(),button:r.toJSON()};});
 assert.ok(original.inside,JSON.stringify(original));await page.click('#compareOriginal');
 await page.locator('#editLookRail button').first().click();await settleEditor(page);
 return {looks,original};
}
try{
 for(const [label,width,height] of cases){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},sound:false,printer:false})));
  const measurements={},check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${label}: ${name}`);};
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
   await check('all six edit tools keep accessible names and touch targets',async()=>{
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
    if(height>=560){
     const clipped=await page.locator('#panelAdjust').evaluate(p=>{const r=p.getBoundingClientRect();return [...p.querySelectorAll('#enhanceLabel,#enhancePhoto,#adjustSlider,#adjustLabel,#adjustReset')].filter(e=>{const b=e.getBoundingClientRect();return b.top<r.top||b.bottom>r.bottom||b.left<r.left||b.right>r.right;}).map(e=>e.id);});
     assert.deepEqual(clipped,[],'the Enhance heading and adjustment controls remain inside their panel after resetting');
    }
   });await capture('adjust');
   await check('Frame keeps the Looks photo size and every finish still edits its recipe',async()=>{
    await page.click('#tabLooks');await settleEditor(page);const before=await page.locator('#editFrame').evaluate(e=>e.getBoundingClientRect().height);
    await page.click('#tabFrame');await settleEditor(page);
    const height=await page.locator('#editFrame').evaluate(e=>e.getBoundingClientRect().height);assert.ok(height>=before-1,JSON.stringify({before,height}));
    measurements.framePhoto={looksHeight:before,frameHeight:height};
    const controls=await page.locator('#panelFrame').evaluate(p=>{const bounds=p.getBoundingClientRect();return [...p.querySelectorAll('.frame-finishes button,#paperChoices button')].map(b=>{const r=b.getBoundingClientRect();return {name:b.getAttribute('aria-label')||b.textContent,width:r.width,height:r.height,inside:r.left>=bounds.left&&r.right<=bounds.right&&r.top>=bounds.top&&r.bottom<=bounds.bottom};});});
    assert.ok(controls.every(b=>b.width>=44&&b.height>=44&&b.inside),JSON.stringify(controls));
    assert.equal(await page.getAttribute('#framePaper','aria-pressed'),'true');assert.ok(await page.locator('#mirrorOptions').isHidden());
    await page.click('#paperChoices [data-paper="rough"]');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.paper),'rough');
    await page.click('#paperChoices [data-paper="none"]');await capture('frame');
    await page.click('#frameMirror');assert.ok(await page.locator('#paperOptions').isHidden());
    await page.click('#mirrorChoices [data-trick="twin"]');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.trick),'twin');
    await capture('frame-mirror');await page.click('#mirrorChoices [data-trick="none"]');
    await page.click('#editStamp');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.stamp),true);assert.equal(await page.getAttribute('#editStamp','aria-checked'),'true');await page.click('#editStamp');
    await page.click('#framePaper');await settleEditor(page);
    assert.ok(await page.locator('#editStage').evaluate(e=>getComputedStyle(e).overflowY==='clip'));
   });
   await check('sticker categories use one scrollable row and reveal Mine and Thuan',async()=>{
    await page.click('#tabStickers');await page.waitForFunction(()=>document.querySelectorAll('#stickerSets button').length===6);
    const row=await page.locator('#stickerSets').evaluate(el=>{const rs=[...el.children].map(b=>b.getBoundingClientRect());return {tops:rs.map(r=>r.top),targets:rs.every(r=>r.width>=44&&r.height>=44),overflow:document.documentElement.scrollWidth-innerWidth,pan:getComputedStyle(document.querySelector('#panelStickers')).touchAction};});
    assert.ok(Math.max(...row.tops)-Math.min(...row.tops)<=1&&row.targets&&row.overflow<=1&&row.pan.includes('pan-x'),JSON.stringify(row));
    measurements.stickerCategories=row;
    for(const name of ['Mine','Thuan']){
     await page.getByRole('tab',{name,exact:true}).click();await page.waitForFunction(name=>document.querySelector('#stickerSets [aria-selected=true]')?.textContent===name,name);
     const inside=await page.locator('#stickerSets [aria-selected=true]').evaluate(b=>{const r=b.getBoundingClientRect(),p=b.parentElement.getBoundingClientRect();return r.left>=p.left-1&&r.right<=p.right+1;});assert.equal(inside,true,name);
    }
    await capture('stickers');
   });
   await check('all three Looks and Original are reachable without scrolling the photo',async()=>{
    await page.click('#tabLooks');await page.evaluate(()=>{const a=window.pocketCamera;a.addLayer();a.chooseLook('thirtyTwoBit');});
    assert.equal(await page.locator('#editLookRail button').count(),3);measurements.rail=await reachableRail(page);await capture('three-look-rail');
   });
   await check('Save copy preserves the earlier album entry and original bytes',async()=>{
    await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
    const first=await page.evaluate(async()=>{const s=window.pocketCamera.state.viewing;return {id:s.id,count:window.pocketCamera.state.shots.length,photo:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.photo.arrayBuffer()))],source:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.source.arrayBuffer()))]};});
    await page.click('#editPhoto');await page.click('#tabAdjust');await page.click('.adjuster[data-key="light"]');await page.fill('#adjustSlider','14');
    assert.equal(await page.textContent('#saveEdit'),'Save copy');await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
    const after=await page.evaluate(async id=>{const a=window.pocketCamera,old=a.state.shots.find(s=>s.id===id),s=a.state.viewing;return {id:s.id,edited:!!s.edited,count:a.state.shots.length,oldPhoto:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await old.photo.arrayBuffer()))],source:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.source.arrayBuffer()))]};},first.id);
    assert.notEqual(after.id,first.id);assert.equal(after.edited,true);assert.equal(after.count,first.count+1);assert.deepEqual(after.oldPhoto,first.photo);assert.deepEqual(after.source,first.source);
   });
   if(label==='iphone-17')await check('enlarged text reflows without losing tool labels',async()=>{
    await page.click('#editPhoto');await page.addStyleTag({content:'html{font-size:200%}'});
    const r=await page.locator('#editDock .segmented').evaluate(el=>({overflow:el.scrollWidth-el.clientWidth,clipped:[...el.children].filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.textContent)}));
    assert.ok(r.overflow<=1);assert.deepEqual(r.clipped,[]);
    const wrapped=await page.locator('#editor').evaluate(el=>[...el.querySelectorAll('.bar h2,.segmented button[aria-selected=true] span,.rail-look[aria-pressed=true] span')].filter(e=>e.getBoundingClientRect().height>parseFloat(getComputedStyle(e).lineHeight)+1).map(e=>e.textContent));
    assert.deepEqual(wrapped,[],'short active labels never split into fragments at enlarged text');
    await page.waitForFunction(()=>{const p=document.querySelector('#editPictureArea').getBoundingClientRect(),f=document.querySelector('#editFrame').getBoundingClientRect();return f.left>=p.left-1&&f.right<=p.right+1&&f.top>=p.top-1&&f.bottom<=p.bottom+1;});
    await capture('large-text');
    await check('three Looks and Original remain reachable at 200% text',async()=>{measurements.largeTextRail=await reachableRail(page);await capture('large-text-rail');});
   });
   await check('no page errors',async()=>assert.deepEqual(errors,[]));results.push({label,width,height,passed:true,...measurements});
  }finally{await context.close();}
 }
 console.log(`${checks}/${checks} UI checks passed`);
}finally{
 if(shots)await writeFile(join(shots,'ui-results.json'),JSON.stringify({checks,results,physicalSafari:false},null,2));
 await browser.close();await server.close();
}
