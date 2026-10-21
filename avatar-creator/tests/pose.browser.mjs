// Self-contained local server; POSE_CHROME optionally selects an installed Chromium.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(new URL('../../johansson-town/package.json',import.meta.url))('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),out=process.env.POSE_EVIDENCE||'/tmp/avatar-pose-evidence';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{
 let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!path.startsWith(root))throw Error('path');
 if((await stat(path)).isDirectory())path+='/index.html';
 res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.glb':'model/gltf-binary'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));
 }catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.POSE_CHROME,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[];
 const page=await browser.newPage({viewport:{width:1365,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/pose-review.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><canvas id="game"></canvas>'}));
 await page.goto(base+'/pose-review.html');
 await page.evaluate(async()=>{const {openCreator}=await import('/johansson-town/src/avatars/creator.js');window.maker=openCreator();});
 const original=await page.evaluate(()=>JSON.stringify(maker.recipe));
 await page.getByRole('combobox',{name:'Preview pose',exact:true}).selectOption('Peace');
 await page.waitForTimeout(700);
 const panel=page.locator('.shm-pose-editor');await panel.locator('summary').click();
 await page.getByRole('button',{name:'Hold current pose',exact:true}).click();
 const adjust=async value=>{await page.getByRole('slider',{name:'Head tilt',exact:true}).fill(String(value));await page.getByRole('slider',{name:'Head tilt',exact:true}).dispatchEvent('change');};
 await adjust(12);assert.equal(await page.evaluate(()=>maker.pose.adjustments.headTilt),12);
 await page.getByRole('button',{name:'Undo pose',exact:true}).click();assert.equal(await page.evaluate(()=>maker.pose.adjustments.headTilt),0);
 await page.getByRole('button',{name:'Redo pose',exact:true}).click();assert.equal(await page.evaluate(()=>maker.pose.adjustments.headTilt),12);
 await page.getByRole('combobox',{name:'Pose body part',exact:true}).selectOption('Right arm');await page.getByRole('checkbox',{name:'Mirror arm edits',exact:true}).check();
 await page.getByRole('slider',{name:'Right wrist turn',exact:true}).fill('20');await page.getByRole('slider',{name:'Right wrist turn',exact:true}).dispatchEvent('change');
 assert.deepEqual(await page.evaluate(()=>[maker.pose.adjustments.RWristTurn,maker.pose.adjustments.LWristTurn]),[20,20]);
 await page.getByRole('combobox',{name:'Pose body part',exact:true}).selectOption('Head');
 const saved=page.waitForEvent('download');await page.getByRole('button',{name:'Save pose',exact:true}).click();const file=await saved,bytes=await readFile(await file.path()),pose=JSON.parse(bytes);assert.equal(pose.format,'johansson-pose');
 assert.equal(await page.evaluate(()=>JSON.stringify(maker.recipe)),original);
 await page.getByRole('button',{name:'Return to animation',exact:true}).click();assert.equal(await page.evaluate(()=>maker.pose),null);
 await panel.locator('input[type=file]').setInputFiles({name:'saved.pose.json',mimeType:'application/json',buffer:bytes});
 await page.waitForFunction(()=>maker.pose?.adjustments.headTilt===12);
 const held=await page.evaluate(()=>maker.exportPNG(256));await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>maker.exportPNG(256)),held,'held pose must render identically');
 await page.evaluate(()=>{const r=maker.recipe;r.body.height=.1;maker.setRecipe(r);});await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>maker.pose.adjustments.headTilt),12);
 await panel.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"bad"}')});await panel.getByRole('status').filter({hasText:'Choose a Johansson'}).waitFor();assert.equal(await page.evaluate(()=>maker.pose.adjustments.headTilt),12);
 await page.getByRole('combobox',{name:'Preview pose',exact:true}).selectOption('walk');assert.equal(await page.evaluate(()=>maker.pose),null);
 if(!await panel.evaluate(e=>e.open))await panel.locator('summary').click();await page.getByRole('button',{name:'Hold current pose',exact:true}).click();
 const walkingHold=await page.evaluate(()=>maker.exportPNG(256));await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>maker.exportPNG(256)),walkingHold,'holding a walk must also stop automatic preview turning');
 await page.evaluate(()=>maker.close());

 // Actual Studio shell: manual posing releases imported motion and survives scene handoff.
 await page.goto(base+'/avatar-creator/',{waitUntil:'domcontentloaded'});await page.locator('.shm-motion summary').click({timeout:120000});
 await page.getByRole('button',{name:'Try wave',exact:true}).click();
 await page.locator('.shm-motion [role=status]').filter({hasText:'Playing'}).waitFor();
 await page.locator('.shm-pose-editor summary').click();await adjust(12);
 for(const [width,height] of [[1365,900],[390,844],[320,568]]){
  await page.setViewportSize({width,height});
  const bounds=await page.locator('.shm-pose-editor-body').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y>=0&&bounds.y+bounds.height<=height+1);
  await page.screenshot({path:out+'/studio-'+width+'.png'});
 }
 await page.setViewportSize({width:1365,height:900});await page.getByRole('button',{name:'Use in scene',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nj-studio-scene-v1'))?.actors[0]?.customPose?.adjustments.headTilt===12);
 await page.locator('[data-action="edit-character"]').click();await page.locator('.shm-pose-editor summary').click();assert.equal(await page.getByRole('slider',{name:'Head tilt',exact:true}).inputValue(),'12');

 // World's native Photo Studio, using the exact same panel and portable file.
 const world=await browser.newPage({viewport:{width:1280,height:900}});world.on('pageerror',e=>errors.push(e.message));
 await world.route('**/pose-review.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/johansson-town/base.css"><link rel="stylesheet" href="/johansson-town/photo-mode.css"><canvas id="game"></canvas>'}));await world.goto(base+'/pose-review.html');
 await world.evaluate(async()=>{
  const THREE=await import('/johansson-town/vendor/three.module.js'),{createPhotoStudio}=await import('/johansson-town/src/photo/studio.js');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#ece9df');scene.add(new THREE.HemisphereLight(0xffffff,0x887766,2));
  const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('#game'),antialias:true});renderer.setSize(innerWidth,innerHeight);
  const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);
  window.worldPhoto=createPhotoStudio({scene,renderer,gameCamera:camera,draw:c=>renderer.render(scene,c),getContext:()=>({position:new THREE.Vector3(0,0,3),yaw:0,cast:[{name:'Johansson'}],hide:[]}),onOpen(){},onClose(){}});
  worldPhoto.open();const tick=()=>{worldPhoto.render();requestAnimationFrame(tick);};tick();
 });
 const worldPanel=world.locator('.shm-pose-editor');await worldPanel.locator('summary').click();await worldPanel.locator('input[type=file]').setInputFiles({name:'from-studio.pose.json',mimeType:'application/json',buffer:bytes});
 await world.waitForFunction(()=>worldPhoto.snapshot().actors[0].customPose?.adjustments.headTilt===12);
 await world.getByRole('slider',{name:'Head tilt',exact:true}).fill('20');await world.getByRole('slider',{name:'Head tilt',exact:true}).dispatchEvent('change');
 await world.getByRole('button',{name:'Undo pose',exact:true}).click();assert.equal(await world.evaluate(()=>worldPhoto.snapshot().actors[0].customPose.adjustments.headTilt),12);
 for(const [width,height] of [[1280,900],[390,844]]){await world.setViewportSize({width,height});await worldPanel.locator('summary').scrollIntoViewIfNeeded();await world.screenshot({path:out+'/world-'+width+'.png'});}
 await world.getByRole('combobox',{name:'Pose',exact:true}).selectOption('Wave');assert.equal(await world.evaluate(()=>worldPhoto.snapshot().actors[0].customPose),null);
 await world.getByRole('button',{name:'Return to town',exact:true}).click();assert.equal(await world.evaluate(()=>worldPhoto.active),false);
 assert.deepEqual(errors,[]);console.log('Passed: shared creator controls, freeze, undo/redo, files, proportions, animation ownership, Studio scene handoff, World photo controls and desktop/phone layouts.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
