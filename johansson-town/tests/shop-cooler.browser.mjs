// Standalone real-WebGL acceptance of the actual shop builder and stock display.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.CREATOR_CHROME,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const [width,height] of [[390,844],[1280,800]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width===390}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://127.0.0.1:5173/**',async route=>{const path=new URL(route.request().url()).pathname;
  if(path==='/review.html')return route.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0"><canvas></canvas><button style="position:fixed;top:10px;left:10px">Open deli cooler</button></body>'});
  try{await route.fulfill({body:await readFile(new URL('..'+path,import.meta.url)),contentType:path.endsWith('.glb')?'model/gltf-binary':'text/javascript'});}catch{await route.fulfill({status:404,body:'Not found'});}
 });
 await page.goto('http://127.0.0.1:5173/review.html');
 const baseline=await page.evaluate(async()=>{
  const T=await import('/vendor/three.module.js'),{buildSakuraInterior}=await import('/src/world/interiors/sakura-interior.js'),{restoreShopStock}=await import('/src/commerce/shop-stock.js');
  const room=new T.Group(),targets=[],display=buildSakuraInterior({room,reg:(target,label,action)=>targets.push({target,label,action}),action(){},exit(){}});
  if(!await display.ready())throw Error('Shop model failed to load');const stock=restoreShopStock();display.updateStock(stock);
  const renderer=new T.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene();scene.background=new T.Color(0xece6d9);scene.add(room);
  const camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.05,30);camera.position.set(-1.45,1.6,innerWidth<500?.8:-.3);camera.lookAt(-1.0,1.1,-3.5);
  const render=()=>renderer.render(scene,camera);render();
  window.review={display,stock,room,renderer,render,T};document.querySelector('button').onclick=()=>{targets.find(t=>/deli/.test(t.label)).action();for(let i=0;i<60;i++)display.refrigerator.update(1/60);render();};
  return {...renderer.info.render,programs:renderer.info.programs.length};
 });
 assert.ok(baseline.triangles>10000&&baseline.calls<500,JSON.stringify(baseline));
 if(width===390)await page.getByRole('button').tap();else await page.getByRole('button').click();
 assert.ok(await page.evaluate(()=>review.display.refrigerator.doors[0].amount>.99));
 await page.screenshot({path:'/tmp/sakura-cooler-'+width+'.png'});
 const result=await page.evaluate(()=>{const {display,stock,room,T,render,renderer}=review;stock.bento.shelf=0;display.updateStock(stock);const matrix=new T.Matrix4();room.getObjectByName('Sakura bento goods').getMatrixAt(0,matrix);const empty=matrix.elements[0]===0;stock.bento.shelf=12;display.updateStock(stock);room.getObjectByName('Sakura bento goods').getMatrixAt(0,matrix);const refilled=matrix.elements[0]===1;for(let i=0;i<600;i++)display.refrigerator.update(1/60);render();return {empty,refilled,closed:display.refrigerator.doors[0].amount<.001,programs:renderer.info.programs.length};});
 assert.ok(result.empty&&result.refilled&&result.closed);assert.equal(result.programs,baseline.programs);assert.deepEqual(errors,[]);
 console.log('Cooler WebGL, '+width+'x'+height+': '+baseline.calls+' shop draws; door tap/click, closing, depletion and refill passed');await page.close();
}}finally{await browser.close();}
