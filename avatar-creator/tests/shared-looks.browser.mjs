import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';const {chromium}=createRequire(new URL('../../johansson-town/package.json',import.meta.url))('playwright');
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('shared look pipeline: numeric capture, material restoration, skinned strokes and actual World rooms',{skip:!process.env.STUDIO_BROWSER_TEST,timeout:240000},async()=>{
 const server=await serveGame({root,mounts:['avatar-creator','johansson-town']}),browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.route('**/*',r=>r.request().url().startsWith(server.url)?r.continue():r.abort());await page.goto(server.url+'avatar-creator/scene-model.mjs');await page.evaluate(()=>{const b=document.createElement('base');b.href='/johansson-town/';document.head.append(b);});
 const numeric=await page.evaluate(async()=>{
  const T=await import('/johansson-town/vendor/three.module.js'),{createLookBuffers}=await import('/johansson-town/src/render/look-buffers.js'),{withLookMaterials}=await import('/johansson-town/src/render/look-materials.js');
  const renderer=new T.WebGLRenderer({preserveDrawingBuffer:true});renderer.setSize(64,64);const scene=new T.Scene(),m=new T.MeshToonMaterial({color:0x65aa80}),o=new T.Mesh(new T.PlaneGeometry(2,2),m),camera=new T.PerspectiveCamera(50,1,.1,10);camera.position.z=2;camera.updateMatrixWorld();scene.add(o);const buffers=createLookBuffers(renderer),before=scene.background;
  buffers.render(()=>renderer.render(scene,camera),64,64);const c=buffers.export(camera,{focusDistance:2,focusRange:.5});
  const read=async url=>{const im=new Image();im.src=url;await im.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);return [...ctx.getImageData(32,32,1,1).data];};
  const dp=await read(c.depth),np=await read(c.normal),encoded=(dp[0]*65536+dp[1]*256+dp[2])/16777215,expected=new T.Vector3(0,0,0).project(camera).z*.5+.5;
  withLookMaterials(scene,'crayon',()=>renderer.render(scene,camera));const reset=m.userData.illustrationPencil.value;
  const cut=document.createElement('canvas');cut.width=2;cut.height=1;const cc=cut.getContext('2d');cc.clearRect(0,0,2,1);cc.fillStyle='white';cc.fillRect(1,0,1,1);const map=new T.CanvasTexture(cut);map.magFilter=map.minFilter=T.NearestFilter;map.wrapS=T.RepeatWrapping;map.repeat.set(2,1);m.map=map;m.alphaTest=.5;m.transparent=true;m.needsUpdate=true;buffers.render(()=>renderer.render(scene,camera),64,64);const cutPixels=await read(buffers.export(camera).depth);const cutDepth=(cutPixels[0]*65536+cutPixels[1]*256+cutPixels[2])/16777215;
  const restored=o.material===m&&scene.background===before&&renderer.getRenderTarget()===null;
  buffers.dispose();renderer.dispose();renderer.forceContextLoss();return {encoded,expected,dp,np,reset,restored,cutDepth};
 });
 assert.ok(Math.abs(numeric.encoded-numeric.expected)<2e-7,JSON.stringify(numeric));assert.equal(numeric.dp[3],255);assert.ok(numeric.cutDepth>.9999,JSON.stringify(numeric));assert.ok(numeric.np[2]>250);assert.equal(numeric.reset,0);assert.equal(numeric.restored,true);
 const pigments=await page.evaluate(async()=>{
  const {createComicLook}=await import('/avatar-creator/comic-look.js'),look=createComicLook(),input=document.createElement('canvas'),output=document.createElement('canvas');input.width=output.width=128;input.height=output.height=64;const ctx=input.getContext('2d'),out=output.getContext('2d');
  for(let x=0;x<128;x++){const v=Math.round(x/127*255);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(x,0,1,64);}
  look.draw(input,out,'manga');const manga=out.getImageData(0,0,128,64).data;let nonBinary=0;for(let i=0;i<manga.length;i+=4)if(![0,255].includes(manga[i])||manga[i]!==manga[i+1]||manga[i]!==manga[i+2])nonBinary++;
  look.draw(input,out,'flat');const flat=out.getImageData(0,0,128,64).data;let neutralDrift=0;for(let i=0;i<flat.length;i+=4)neutralDrift=Math.max(neutralDrift,Math.max(flat[i],flat[i+1],flat[i+2])-Math.min(flat[i],flat[i+1],flat[i+2]));for(const name of ['sketchbook']){look.draw(input,out,name);look.draw(input,out,name,{quality:'preview'});}look.dispose();return {nonBinary,neutralDrift};
 });
 assert.equal(pigments.nonBinary,0,'Manga pigment is strictly black or white across a continuous grey ramp');assert.ok(pigments.neutralDrift<=14,JSON.stringify(pigments));
 const skin=await page.evaluate(async()=>{const T=await import('/johansson-town/vendor/three.module.js'),{createSceneLooks}=await import('/avatar-creator/scene-looks.js'),renderer=new T.WebGLRenderer({preserveDrawingBuffer:true});renderer.setSize(48,48);renderer.outputColorSpace=T.SRGBColorSpace;const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,10),material=new T.MeshBasicMaterial({color:0xf0bf9b}),mesh=new T.Mesh(new T.PlaneGeometry(4,4),material);scene.add(mesh);camera.position.z=2;camera.updateMatrixWorld();const look=createSceneLooks(renderer);look.render(scene,camera,'crayon',{quality:'export'});const canvas=document.createElement('canvas');canvas.width=canvas.height=48;const c=canvas.getContext('2d');c.drawImage(renderer.domElement,0,0);const pixel=[...c.getImageData(24,24,1,1).data];look.dispose();mesh.geometry.dispose();material.dispose();renderer.dispose();renderer.forceContextLoss();return pixel;});
 assert.ok(skin[0]-skin[2]>20,'Warm skin retains pigment across the former paper-white threshold: '+JSON.stringify(skin));
 const world=await page.evaluate(async()=>{
  const T=await import('/johansson-town/vendor/three.module.js'),{createInkPipeline}=await import('/johansson-town/src/render/ink-pipeline.js'),{LOOKS}=await import('/johansson-town/src/render/looks.js'),{buildSceneWorld}=await import('/avatar-creator/scene-world.js'),{buildAvatar}=await import('/johansson-town/src/avatars/build.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js'),{poseSceneAvatar}=await import('/avatar-creator/scene-avatar.js');
  const views=await(await fetch('/johansson-town/assets/images/feed/views.json')).json(),renderer=new T.WebGLRenderer({preserveDrawingBuffer:true});renderer.setSize(384,288);renderer.outputColorSpace=T.SRGBColorSpace;const pipeline=createInkPipeline(renderer,{superScale:1,samples:0,fxaa:false});const timing=[];
  for(const id of ['minato','harbour']){const e=await buildSceneWorld(id,views),avatar=buildAvatar(recipeFor('Thuan'),{shadows:false});avatar.root.position.set(...e.origin);e.scene.add(avatar.root);const material=avatar.face.material||avatar.root.children.find(o=>o.material)?.material;
   for(const look of Object.keys(LOOKS)){const started=performance.now();pipeline.setCamera(e.camera);pipeline.setLook(look);
    for(let frame=0;frame<2;frame++){e.camera.position.x+=frame*.03;e.camera.updateMatrixWorld();poseSceneAvatar(avatar,{pose:frame?'Wave':'Idle',expression:'smile',time:frame*.1,turn:0});pipeline.render(r=>r.render(e.scene,e.camera));renderer.getContext().finish();}
    timing.push({location:id,look,ms:Math.round(performance.now()-started)});
   }
   e.setClock(23*60);for(const look of ['manga','flat','oil','crayon','sketchbook']){pipeline.setCamera(e.camera);pipeline.setLook(look);pipeline.render(r=>r.render(e.scene,e.camera));renderer.getContext().finish();timing.push({location:id+'-night',look});}
   e.scene.remove(avatar.root);avatar.dispose();e.dispose();
  }
  pipeline.dispose();renderer.dispose();renderer.forceContextLoss();return timing;
 });
 assert.equal(world.length,40);assert.deepEqual(errors,[]);console.log('Software WebGL timings (2 frames, includes first compile):',JSON.stringify(world));
 }finally{await browser.close();await server.close();}
});
