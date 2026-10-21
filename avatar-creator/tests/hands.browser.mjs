// Self-contained local server; POSE_CHROME optionally selects an installed Chromium.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(new URL('../../johansson-town/package.json',import.meta.url))('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),out=process.env.POSE_EVIDENCE||'/tmp/avatar-hands-evidence';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{
 let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!path.startsWith(root))throw Error('path');
 if((await stat(path)).isDirectory())path+='/index.html';
 res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.glb':'model/gltf-binary'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));
 }catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.POSE_CHROME,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/hand-review.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><canvas id="game"></canvas>'}));await page.goto(base+'/hand-review.html');
 await page.evaluate(async()=>{const {openCreator}=await import('/johansson-town/src/avatars/creator.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js');window.maker=openCreator({recipe:recipeFor('Thuan')});});
 const original=await page.evaluate(()=>JSON.stringify(maker.recipe));
 const panel=page.locator('.shm-pose-editor');await panel.locator('summary').click();await page.getByRole('combobox',{name:'Pose body part',exact:true}).selectOption('Right hand');await page.getByRole('combobox',{name:'Hand gesture',exact:true}).selectOption('peace');
 await page.waitForFunction(()=>maker.pose?.hands?.R.preset==='peace');assert.equal(await page.getByRole('checkbox',{name:'Articulated bare hands',exact:true}).isChecked(),true);
 await page.getByRole('slider',{name:'Ring finger curl',exact:true}).fill('60');await page.getByRole('slider',{name:'Ring finger curl',exact:true}).dispatchEvent('change');assert.equal(await page.evaluate(()=>maker.pose.hands.R.curl[2]),.6);
 await page.getByRole('button',{name:'Undo pose',exact:true}).click();assert.equal(await page.evaluate(()=>maker.pose.hands.R.curl[2]),1);await page.getByRole('button',{name:'Redo pose',exact:true}).click();assert.equal(await page.evaluate(()=>maker.pose.hands.R.curl[2]),.6);
 const saved=page.waitForEvent('download');await page.getByRole('button',{name:'Save pose',exact:true}).click();const poseFile=await saved,poseBytes=await readFile(await poseFile.path()),pose=JSON.parse(poseBytes);assert.equal(pose.hands.enabled,true);
 const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Export posed GLB',exact:true}).click();const glbFile=await exported,glb=await readFile(await glbFile.path()),json=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());
 assert.ok(json.nodes.some(n=>n.name==='ringR3'));assert.ok(json.nodes.some(n=>n.name==='thumbL2'));assert.ok(json.skins[0].joints.length===56);assert.equal(json.animations,undefined);
 const parsed=await page.evaluate(async data=>{const {GLTFLoader}=await import('/johansson-town/vendor/GLTFLoader.js');const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0)),gltf=await new GLTFLoader().parseAsync(bytes.buffer,'');let body=null;gltf.scene.traverse(o=>{if(o.isSkinnedMesh)body=o;});return {joints:body.skeleton.bones.length,ring:body.skeleton.bones.find(b=>b.name==='ringR2').rotation.x};},glb.toString('base64'));assert.equal(parsed.joints,56);assert.ok(Math.abs(parsed.ring+.6*1.45)<1e-4);
 await page.getByRole('button',{name:'Return to animation',exact:true}).click();assert.equal(await panel.getAttribute('data-mode'),'normal');assert.equal(await page.evaluate(()=>maker.pose.hands.enabled),true);
 await panel.locator('input[type=file]').setInputFiles({name:'hands.pose.json',mimeType:'application/json',buffer:poseBytes});await page.waitForFunction(()=>maker.pose?.hands?.R.curl[2]===.6);
 assert.equal(await page.evaluate(()=>JSON.stringify(maker.recipe)),original);
 await page.getByRole('checkbox',{name:'Articulated bare hands',exact:true}).uncheck();assert.equal(await page.evaluate(()=>maker.pose.hands.enabled),false);await page.getByRole('button',{name:'Undo pose',exact:true}).click();assert.equal(await page.evaluate(()=>maker.pose.hands.enabled),true);
 await page.evaluate(()=>maker.close());
 // Real Studio shell, both device layouts and scene persistence.
 await page.goto(base+'/avatar-creator/',{waitUntil:'domcontentloaded'});await page.locator('.shm-pose-editor summary').waitFor({timeout:120000});await page.locator('.studio-preview>summary').click();await page.getByRole('combobox',{name:'Preview pose',exact:true}).selectOption('Peace');await page.waitForTimeout(750);await page.locator('.shm-pose-editor summary').click();await page.getByRole('combobox',{name:'Pose body part',exact:true}).selectOption('Right hand');await page.getByRole('combobox',{name:'Hand gesture',exact:true}).selectOption('peace');
 for(const [w,h] of [[1365,900],[390,844]]){await page.setViewportSize({width:w,height:h});await page.screenshot({path:out+'/studio-'+w+'.png'});}
 await page.setViewportSize({width:1365,height:900});await page.getByRole('button',{name:'Use in scene',exact:true}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nj-studio-scene-v1'))?.actors[0]?.customPose?.hands?.R.preset==='peace');
 // Native World Photo Studio imports precisely the same hand/pose file.
 const world=await browser.newPage({viewport:{width:1280,height:900}});world.on('pageerror',e=>errors.push(e.message));await world.route('**/hand-review.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/johansson-town/base.css"><link rel="stylesheet" href="/johansson-town/photo-mode.css"><canvas id="game"></canvas>'}));await world.goto(base+'/hand-review.html');
 await world.evaluate(async()=>{const THREE=await import('/johansson-town/vendor/three.module.js'),{createPhotoStudio}=await import('/johansson-town/src/photo/studio.js');const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x887766,2));const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('#game'),antialias:true});renderer.setSize(innerWidth,innerHeight);const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);window.photo=createPhotoStudio({scene,renderer,gameCamera:camera,draw:c=>renderer.render(scene,c),getContext:()=>({position:new THREE.Vector3(0,0,3),yaw:0,cast:[{name:'Thuan'}],hide:[]}),onOpen(){},onClose(){}});photo.open();const tick=()=>{photo.render();requestAnimationFrame(tick);};tick();});
 const wp=world.locator('.shm-pose-editor');await wp.locator('summary').click();await wp.locator('input[type=file]').setInputFiles({name:'studio-hands.pose.json',mimeType:'application/json',buffer:poseBytes});await world.waitForFunction(()=>photo.snapshot().actors[0].customPose?.hands?.R.curl[2]===.6);await world.getByRole('combobox',{name:'Pose body part',exact:true}).selectOption('Right hand');await world.getByRole('combobox',{name:'Hand gesture',exact:true}).selectOption('point');assert.equal(await world.evaluate(()=>photo.snapshot().actors[0].customPose.hands.R.preset),'point');
 for(const [w,h] of [[1280,900],[390,844]]){await world.setViewportSize({width:w,height:h});await wp.locator('summary').scrollIntoViewIfNeeded();await world.screenshot({path:out+'/world-'+w+'.png'});}
 const detail=await browser.newPage({viewport:{width:640,height:640}});await detail.goto(base+'/');await detail.setContent('<style>body{margin:0}</style>');
 await detail.evaluate(async()=>{
  const THREE=await import('/johansson-town/vendor/three.module.js'),{buildAvatar,BONES}=await import('/johansson-town/src/avatars/build.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js'),{applyHands,HAND_BONES}=await import('/johansson-town/src/avatars/hands.js');
  const a=buildAvatar(recipeFor('Thuan'),{articulatedHands:true,faceSize:64}),scene=new THREE.Scene();a.root.rotation.y=0;
  // Diagnostic crop: remove the leg from this hand close-up, without changing production geometry.
  const ids=new Set(['handL',...HAND_BONES.filter(n=>n.includes('L'))].map(n=>a.body.skeleton.bones.findIndex(b=>b.name===n))),I=a.body.geometry.attributes.skinIndex,keep=[];
  for(let i=0;i<I.count;i+=3)if(ids.has(I.getX(i)))keep.push(i,i+1,i+2);a.body.geometry.setIndex(keep);
  scene.add(a.root,new THREE.HemisphereLight(0xffffff,0x8899aa,2.2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(1,3,4);scene.add(sun);
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(640,640);renderer.setClearColor('#e8e5dc');document.body.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(28,1,.01,20),m=a.measure;camera.position.set(m.shoulderX+.015,m.shoulderY-m.upper-m.fore-m.hand,.6);camera.lookAt(m.shoulderX+.015,m.shoulderY-m.upper-m.fore-m.hand,0);
  window.drawHand=async preset=>{applyHands(a,{enabled:true,L:{preset}});renderer.render(scene,camera);await new Promise(requestAnimationFrame);renderer.render(scene,camera);};
 });
 for(const preset of ['open','peace','point','fist','relaxed','thumbsUp']){await detail.evaluate(p=>drawHand(p),preset);await detail.screenshot({path:out+'/hand-'+preset+'.png'});}
 assert.deepEqual(errors,[]);console.log('Passed: bare five-digit controls, independent ring curl, undo/redo, legacy fallback, pose transfer, 56-joint posed GLB export/load, Studio scenes and World photo layouts.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
