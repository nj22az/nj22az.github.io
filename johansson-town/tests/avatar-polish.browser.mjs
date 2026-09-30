import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.CREATOR_CHROME,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [width,height] of [[390,844],[1280,800]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://127.0.0.1:5173/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/review.html')return route.fulfill({contentType:'text/html',body:'<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><canvas></canvas></body></html>'});
   try{await route.fulfill({body:await readFile(new URL('..'+path,import.meta.url)),contentType:'text/javascript'});}
   catch{await route.fulfill({status:404,body:'Not found'});}
  });
  await page.goto('http://127.0.0.1:5173/review.html');
  await page.evaluate(async()=>{
   const THREE=await import('/vendor/three.module.js'),{buildAvatar}=await import('/src/avatars/build.js'),{CAST_RECIPES}=await import('/src/avatars/cast.js'),{createAvatarAnimator}=await import('/src/avatars/animate.js');
   const {createDrinkProp,setPropPortion,updatePropPortion}=await import('/src/people/izakaya-beer.js'),{fitAvatarHeldProp}=await import('/src/avatars/consume.js');
   const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0xeee5d4);renderer.outputColorSpace=THREE.SRGBColorSpace;
   const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x887b6b,2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(2,3,4);scene.add(sun);
   const camera=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,.01,20);camera.position.set(2.4,1.6,3.4);camera.lookAt(0,.9,0);
   const actors=['Johansson','Thuan'].map((name,i)=>{const a=buildAvatar(CAST_RECIPES[name],{shadows:false});a.root.rotation.y=0;a.root.position.x=(i-.5)*.65;scene.add(a.root);const anim=createAvatarAnimator(a),prop=createDrinkProp('draft',{held:true});a.bones.handR.add(prop);anim.play('SitDrink');return {a,anim,prop};});
   window.review={render(t){for(const {a,anim,prop} of actors){anim.stop();anim.play('SitDrink');for(let s=0;s<t;s+=1/60)anim.update(1/60,{seated:true,heldProp:prop});setPropPortion(prop,1-t/2.4,{immediate:true});updatePropPortion(prop,0);fitAvatarHeldProp(a,prop,anim.consumption?.lift||0);}renderer.render(scene,camera);return renderer.info.render;},rear(){camera.position.set(2.4,1.6,-3.4);camera.lookAt(0,.9,0);renderer.render(scene,camera);},renderer};
  });
  const info=await page.evaluate(()=>window.review.render(1.2));assert.ok(info.triangles>1000&&info.calls<15);
  await page.screenshot({path:'/tmp/avatars-sip-'+width+'.png'});
  await page.evaluate(()=>window.review.rear());await page.screenshot({path:'/tmp/avatars-back-'+width+'.png'});
  await page.evaluate(()=>window.review.renderer.dispose());assert.deepEqual(errors,[]);await page.close();
  console.log('Avatar WebGL front/rear and sipping passed: '+width+'x'+height);
 }
}finally{await browser.close();}
