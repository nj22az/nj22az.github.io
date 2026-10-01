/** Isolated Minato integration review; never changes the live model or save data. */
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const root=resolve(new URL('../../..',import.meta.url).pathname),out=resolve(process.argv[2]);
const require=createRequire(import.meta.url),{chromium}=require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),path=url.pathname==='/candidate.glb'?resolve(out,'minato-barfly.glb'):resolve(root,'.'+url.pathname);if(!path.startsWith(root+'/')&&!path.startsWith(out+'/'))throw Error('path');res.setHeader('Content-Type',extname(path)==='.js'?'text/javascript':'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:720}});await page.goto('http://127.0.0.1:'+server.address().port+'/vendor/three.module.js');
  const report=await page.evaluate(async width=>{
   document.body.innerHTML='';document.body.style.margin='0';
   const T=await import('/vendor/three.module.js'),{GLTFLoader}=await import('/vendor/GLTFLoader.js');
   const {preloadIzakaya,addMinatoInterior}=await import('/src/world/izakaya.js');
   const {createVenueService}=await import('/src/people/venue-service.js');
   const {buildAvatar}=await import('/src/avatars/build.js'),{recipeFor}=await import('/src/avatars/cast.js');
   const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(width,720);renderer.setPixelRatio(1);document.body.append(renderer.domElement);
   const scene=new T.Scene();scene.background=new T.Color('#332821');scene.add(new T.HemisphereLight(0xffffff,0x675449,2));const light=new T.DirectionalLight(0xffffff,2);light.position.set(3,6,4);scene.add(light);
   const room=new T.Group();scene.add(room);await preloadIzakaya(['interior']);if(!addMinatoInterior(room))throw Error('Minato interior unavailable');
   const gltf=await new GLTFLoader().loadAsync('/candidate.glb');
   const actor=new T.Group();actor.position.set(2,0,3.08);actor.userData={inIzakaya:true,seatHeight:.565};room.add(actor);
   const camera=new T.PerspectiveCamera(45,width/720,.05,100);camera.position.set(3.4,1.65,.8);camera.lookAt(2,.95,3.08);
   const live=buildAvatar(recipeFor('Barfly'),{shadows:false});actor.add(live.root);renderer.render(scene,camera);const baselineCalls=renderer.info.render.calls;actor.remove(live.root);
   actor.add(gltf.scene);const mixer=new T.AnimationMixer(gltf.scene);let minutes=1100;
   const person={profile:{name:'Barfly'},g:actor};const service=createVenueService({room,place:'izakaya',getCustomers:()=>[person],getMinutes:()=>minutes,ledger:{account(){throw Error('ledger changed');},purchase(){throw Error('charged');}}});
   const poses=[];for(const [time,clip] of [[1100,'Barfly_Drink_Loop'],[180,'Barfly_Sleep_Loop'],[599,'Barfly_Sleep_Loop'],[600,'Barfly_Drink_Loop']]){
    minutes=time;service.update(1/60);mixer.stopAllAction();const action=mixer.clipAction(T.AnimationClip.findByName(gltf.animations,clip));action.play();mixer.update(.5);scene.updateMatrixWorld(true);renderer.render(scene,camera);
    const expected=time>=180&&time<600?'Sleep':'Drink';if(actor.userData.socialPose!==expected)throw Error('Schedule mismatch');poses.push({minutes:time,socialPose:actor.userData.socialPose,heldItem:actor.userData.heldItem||null,calls:renderer.info.render.calls});
   }
   window.review={renderer,scene,camera,mixer,gltf};return {width,baselineCalls,candidateCalls:renderer.info.render.calls,extraDrawCalls:renderer.info.render.calls-baselineCalls,poses,glbLoaded:true};
  },width);
  await page.screenshot({path:resolve(out,`minato-${width}.png`)});results.push(report);await page.close();
 }
 await writeFile(resolve(out,'browser-review.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
