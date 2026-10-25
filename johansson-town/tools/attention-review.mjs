// Reproducible review of the original attention layer on the game's actual avatars.
// node tools/attention-review.mjs [out-dir]
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {serveGame} from './mcp/static-server.mjs';
const root=resolve(new URL('..',import.meta.url).pathname),out=resolve(process.argv[2]||'output/attention-review');
await mkdir(out,{recursive:true});
const server=await serveGame(root),errors=[];
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&!m.location().url?.endsWith('/favicon.ico'))errors.push(m.text());});
 await page.goto(server.url+'src/avatars/face.js');
 const result=await page.evaluate(async()=>{
  const T=await import('/johansson-town/vendor/three.module.js'),{buildAvatar}=await import('/johansson-town/src/avatars/build.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js'),{createAvatarAnimator}=await import('/johansson-town/src/avatars/animate.js'),{createInkPipeline}=await import('/johansson-town/src/render/ink-pipeline.js');
  const W=360,H=300,labels=['Initial pose','Eyes first · 0.08 s','Neck follows · 0.20 s','Settled · 1.25 s','Released · 3.5 s'];
  const sheet=document.createElement('canvas');sheet.width=W*5;sheet.height=(H+48)*3;const ctx=sheet.getContext('2d');ctx.fillStyle='#f6f1e7';ctx.fillRect(0,0,sheet.width,sheet.height);
  const renderer=new T.WebGLRenderer({preserveDrawingBuffer:true});renderer.setSize(W,H);
  const scene=new T.Scene();scene.background=new T.Color('#d4ded7');const sun=new T.DirectionalLight(0xffffff,2);sun.position.set(3,5,4);scene.add(sun,new T.HemisphereLight(0xffffff,0x79685a,1.6));
  const camera=new T.PerspectiveCamera(25,W/H,.05,40),ink=createInkPipeline(renderer,{superScale:1,samples:0,fxaa:true});ink.setCamera(camera);
  const report=[];
  for(const [row,name,seated] of [[0,'Thuan',false],[1,'Johansson',false],[2,'Thao',true]]){
   const avatar=buildAvatar(recipeFor(name),{shadows:false,eyes3d:true});avatar.root.rotation.y=0;scene.add(avatar.root);
   const animator=createAvatarAnimator(avatar,{attentionRig:true,random:()=>.5,initialTime:0});
   const state=seated?{seated:true,seatHeight:.6,pose:'Sit'}:{};
   for(let i=0;i<90;i++)animator.update(1/60,state);
   const head=avatar.bones.head.localToWorld(new T.Vector3(0,avatar.measure.headCentre-avatar.measure.headY,0));
   const point=new T.Vector3(1.2,head.y+(name==='Johansson'?-.34:.34),1.6),times=[0,5,12,75,210];
   camera.position.set(head.x,head.y+.04,head.z+1.9);camera.lookAt(head.x,head.y-.08,head.z);camera.updateProjectionMatrix();camera.updateMatrixWorld();
   const samples=[];let frame=0;
   for(let cell=0;cell<times.length;cell++){
    while(frame<times[cell]){frame++;animator.update(1/60,{...state,gaze:frame<=90?point:null});}
    scene.updateMatrixWorld(true);ink.render(r=>r.render(scene,camera));
    const x=cell*W,y=row*(H+48);ctx.drawImage(renderer.domElement,x,y);ctx.fillStyle='#243a35';ctx.font='16px sans-serif';ctx.fillText(name+(seated?' · seated':''),x+10,y+H+18);ctx.font='14px sans-serif';ctx.fillText(labels[cell],x+10,y+H+38);
    samples.push({frame,neck:avatar.bones.neck.rotation.toArray().slice(0,3),head:avatar.bones.head.rotation.toArray().slice(0,3),eyes:avatar.faceState.look});
   }
   report.push({name,seated,samples});scene.remove(avatar.root);avatar.dispose();
  }
  ink.dispose();renderer.dispose();renderer.forceContextLoss();return {png:sheet.toDataURL('image/png'),report};
 });
 await writeFile(resolve(out,'attention-sheet.png'),Buffer.from(result.png.split(',')[1],'base64'));
 // A moving review as well as stills: fixed 30 Hz simulation, acknowledgement,
 // change of partner, then release. It is evidence of software rendering, not FPS.
 const clip=await page.evaluate(async()=>{
  const T=await import('/johansson-town/vendor/three.module.js'),{buildAvatar}=await import('/johansson-town/src/avatars/build.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js'),{createAvatarAnimator}=await import('/johansson-town/src/avatars/animate.js');
  const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(720,540);
  const scene=new T.Scene();scene.background=new T.Color('#d4ded7');const sun=new T.DirectionalLight(0xffffff,2);sun.position.set(3,5,4);scene.add(sun,new T.HemisphereLight(0xffffff,0x79685a,1.6));
  const a=buildAvatar(recipeFor('Thao'),{shadows:false});a.root.rotation.y=0;scene.add(a.root);
  const animator=createAvatarAnimator(a,{attentionRig:true,random:()=>.5,initialTime:0}),h=a.measure.headCentre;
  const camera=new T.PerspectiveCamera(27,720/540,.05,30);camera.position.set(0,h-.04,2.2);camera.lookAt(0,h-.16,0);
  const stream=renderer.domElement.captureStream(0),track=stream.getVideoTracks()[0],chunks=[];
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:1800000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const done=new Promise(resolve=>{recorder.onstop=resolve;});recorder.start();
  for(let frame=0;frame<120;frame++){
   const gaze=frame<6||frame>=84?null:[frame<42?1.2:-1.2,h+.28,2];
   animator.update(1/30,{gaze});renderer.render(scene,camera);track.requestFrame();await new Promise(r=>setTimeout(r,34));
  }
  recorder.stop();await done;track.stop();a.dispose();renderer.dispose();renderer.forceContextLoss();
  return await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));});
 });
 await writeFile(resolve(out,'attention-motion.webm'),Buffer.from(clip.split(',')[1],'base64'));
 await writeFile(resolve(out,'report.json'),JSON.stringify({softwareGL:true,physicalDevice:false,errors,rows:result.report},null,2)+'\n');
 console.log(JSON.stringify({out,errors,rows:result.report.length}));if(errors.length)process.exitCode=1;
}finally{await browser.close();await server.close();}
