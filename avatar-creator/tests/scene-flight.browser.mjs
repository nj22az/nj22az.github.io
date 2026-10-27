// Run from the repository root. Uses the real Studio, rooms, cast, shaders and pointer handlers.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const server=await serveGame({root:fileURLToPath(new URL('../../',import.meta.url)),mounts:['avatar-creator','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 for(const width of [1280,820,390]){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<1000,acceptDownloads:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(120000);
  await page.addInitScript(()=>{if(!localStorage.getItem('nj-studio-scene-v1'))localStorage.setItem('nj-studio-scene-v1',JSON.stringify({version:2,location:'classroom',format:'landscape',style:'photo',look:'none',camera:{orbit:0,elevation:0,zoom:1},actors:[]}));localStorage.setItem('johansson-player-recipe','world-sentinel');});
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nj-studio-scene-v1'))),idle=()=>page.waitForFunction(()=>document.querySelector('.scene-picture canvas')?.getAttribute('aria-busy')==='false');
  await page.goto(server.url+'avatar-creator/');await page.locator('.studio-modes [data-mode=scene]').click();await idle();
  await page.locator('.scene-camera-box').evaluate(el=>el.open=true);
  const canvas=page.locator('.scene-picture canvas');await canvas.scrollIntoViewIfNeeded();const rect=await canvas.boundingBox();
  if(width===1280){
   await page.mouse.move(rect.x+rect.width*.7,rect.y+rect.height*.25);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.7+20,rect.y+rect.height*.25+5,{steps:3});await page.mouse.up();await idle();
   await canvas.focus();await page.keyboard.down('KeyW');await page.waitForTimeout(300);await page.keyboard.up('KeyW');
   await page.waitForFunction(()=>!!JSON.parse(localStorage.getItem('nj-studio-scene-v1')).camera.position);await idle();
  }else{
   const cdp=await context.newCDPSession(page),x=rect.x+rect.width*.7,y=rect.y+rect.height*.35;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-20,y,id:1},{x:x+20,y,id:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-30,y,id:1},{x:x+30,y,id:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-45,y:y+8,id:1},{x:x+45,y:y+8,id:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await page.waitForFunction(()=>!!JSON.parse(localStorage.getItem('nj-studio-scene-v1')).camera.position);await idle();
  }
  // Stop inertia before recording the view, then add and pose without moving the lens.
  await page.locator('[data-action=flight]').click();await idle();await page.locator('[data-action=bookmark-camera]').click();const view=(await state()).camera;
  await page.locator('[data-action=characters-here]').click();await page.locator('[data-action=add-current]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nj-studio-scene-v1')).actors.length===1);await idle();
  assert.deepEqual((await state()).camera,view);await page.locator('[data-action=pose-here]').click();
  await page.locator('[data-picker=pose] [data-value=Wave]').click();await idle();assert.equal((await state()).actors[0].pose,'Wave');
  await page.locator('[data-action=return-camera]').click();await idle();assert.deepEqual((await state()).camera,view);assert.equal((await state()).actors[0].pose,'Wave');
  // A body drag must edit the actor, never steer the camera, even with flight enabled.
  await page.locator('[data-action=flight]').click();
  await canvas.scrollIntoViewIfNeeded();const selection=await page.locator('.scene-selection').boundingBox();assert.ok(selection);
  await page.mouse.move(selection.x+selection.width*.5,selection.y+selection.height*.55);await page.mouse.down();await page.mouse.move(selection.x+selection.width*.5+35,selection.y+selection.height*.55+10,{steps:5});await page.mouse.up();await idle();assert.deepEqual((await state()).camera,view);await page.locator('[data-action=flight]').click();
  await page.locator('[data-look-search]').fill('manga');assert.ok(await page.locator('[data-scene-look]:visible').count()>=2);await page.locator('[data-look-search]').fill('');
  const looks=width===1280?await page.locator('[data-scene-look]').evaluateAll(bs=>bs.map(b=>b.dataset.sceneLook)):['manga','oil'];
  for(const id of looks){await page.locator(`[data-scene-look="${id}"]`).click();await idle();assert.equal((await state()).look,id);assert.equal(await page.locator(`[data-scene-look="${id}"]`).getAttribute('aria-pressed'),'true');}
  const chosen=(await state()).look;await page.locator('[data-action=compare-natural]').click();await idle();assert.equal((await state()).look,chosen);await page.locator('[data-action=compare-natural]').click();await idle();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-save=project]').click()]);const project=JSON.parse(await readFile(await download.path(),'utf8'));assert.deepEqual(project.scene.camera,view);
  if(process.env.STUDIO_FLIGHT_SHOTS){await mkdir(process.env.STUDIO_FLIGHT_SHOTS,{recursive:true});await page.screenshot({path:process.env.STUDIO_FLIGHT_SHOTS+`/studio-${width}.png`,fullPage:true});}
  assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth));assert.equal(await page.evaluate(()=>localStorage.getItem('johansson-player-recipe')),'world-sentinel');
  await page.reload();await page.locator('.studio-modes [data-mode=scene]').click();await idle();assert.deepEqual((await state()).camera,view);assert.equal((await state()).actors[0].pose,'Wave');assert.deepEqual(errors,[]);
  console.log(`PASS ${width}: flight, placement, pose, drag, saved view, looks, comparison, project and reload`);await context.close();
 }
}finally{await browser.close();await server.close();}
