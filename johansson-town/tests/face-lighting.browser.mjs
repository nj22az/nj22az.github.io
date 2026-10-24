import test from 'node:test';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {serveGame} from '../tools/mcp/static-server.mjs';
// Actual shared head and World pipeline; software rendering, not physical Safari acceptance.
// FACE_BROWSER_TEST=1 TOWN_CHROMIUM_PATH=/path/to/chromium node --test tests/face-lighting.browser.mjs
test('painted eyes survive dim lighting and repeated Look switching',{skip:!process.env.FACE_BROWSER_TEST,timeout:180000},async()=>{
 const server=await serveGame(new URL('../',import.meta.url).pathname),browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto(server.url+'src/avatars/face.js');
 const rows=await page.evaluate(async()=>{
 const T=await import('/johansson-town/vendor/three.module.js'),{buildAvatar}=await import('/johansson-town/src/avatars/build.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js'),{shapeHeadPoint}=await import('/johansson-town/src/avatars/head-profile.js'),{faceLayout}=await import('/johansson-town/src/avatars/face.js'),{createInkPipeline}=await import('/johansson-town/src/render/ink-pipeline.js'),{LOOKS}=await import('/johansson-town/src/render/looks.js');
 const renderer=new T.WebGLRenderer({preserveDrawingBuffer:true}),scene=new T.Scene(),avatar=buildAvatar(recipeFor('Johansson'),{shadows:false});avatar.root.rotation.y=0;scene.add(avatar.root);scene.background=new T.Color('#7f8285');
 const fill=new T.HemisphereLight(0xffffff,0x887766,.03),sun=new T.DirectionalLight(0xffffff,.02);sun.position.set(2,5,4);scene.add(fill,sun);
 const camera=new T.PerspectiveCamera(35,1,.1,200),pipeline=createInkPipeline(renderer,{superScale:1,samples:0,fxaa:true}),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),rows=[],L=faceLayout(avatar.recipe),m=avatar.measure;
 function point(x,y,w,h){const phi=Math.PI/2-.95+x/256*1.9,theta=Math.PI*.28+y/256*Math.PI*.58,v=shapeHeadPoint(new T.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);v.multiply(new T.Vector3(m.Rh*m.headSX,m.Rh*m.headSY,m.Rh*.98));avatar.face.head.localToWorld(v);v.project(camera);return [Math.round((v.x*.5+.5)*w),Math.round((.5-v.y*.5)*h)];}
 const luma=(px,x,y,w)=>{const i=(y*w+x)*4;return (px[i]*.2126+px[i+1]*.7152+px[i+2]*.0722)/255;};
 for(const [w,h] of [[390,600],[1024,768]]){renderer.setSize(w,h);canvas.width=w;canvas.height=h;camera.aspect=w/h;camera.position.set(0,1,3.6);camera.lookAt(0,.95,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();scene.updateMatrixWorld(true);pipeline.setCamera(camera);
 for(const lighting of ['dim','day']){fill.intensity=lighting==='dim'?.03:1.5;sun.intensity=lighting==='dim'?.02:2;
 for(const look of [...Object.keys(LOOKS),'none','sketchbook','flat','none']){pipeline.setLook(look);pipeline.render(r=>r.render(scene,camera));ctx.drawImage(renderer.domElement,0,0);const px=ctx.getImageData(0,0,w,h).data;
 const contrast=[-1,1].map(side=>{const eye=point(128+side*L.spread,L.eyeY,w,h),cheek=point(128+side*L.spread,L.eyeY+30,w,h);let dark=1,skin=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){dark=Math.min(dark,luma(px,eye[0]+dx,eye[1]+dy,w));skin+=luma(px,cheek[0]+dx,cheek[1]+dy,w)/25;}return +(skin-dark).toFixed(4);});rows.push({w,lighting,look,contrast});
 }}}
 pipeline.dispose();avatar.dispose();renderer.dispose();renderer.forceContextLoss();return rows;});
 console.log(JSON.stringify(rows));assert.deepEqual(errors,[]);
 for(const r of rows){assert.ok(r.contrast.every(c=>c>=.045),JSON.stringify(r));}
 }finally{await browser.close();await server.close();}
});
