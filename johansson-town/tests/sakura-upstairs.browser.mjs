// Real Chromium/WebGL acceptance of the published runtime. Files are served by
// Playwright routing so this also works in isolated network namespaces.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {extname} from 'node:path';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.CREATOR_CHROME||'/tmp/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
try{
 for(const [width,height] of [[390,844],[1280,800]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<500,isMobile:width<500}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://shop.test/**',async route=>{
   const path=new URL(route.request().url()).pathname,local=path==='/'?'/index.html':path;
   try{await route.fulfill({body:await readFile(new URL('..'+local,import.meta.url)),contentType:types[extname(local)]||'application/octet-stream'});}
   catch{await route.fulfill({status:404,body:'Not found'});}
  });
  await page.goto('http://shop.test/?audit');
  await page.getByRole('button',{name:'Enter town',exact:true}).click();
  await page.waitForFunction(()=>window.__JOHANSSON_AUDIT__&&window.__JOHANSSON_POSE__,null,{timeout:60000});
  await page.evaluate(()=>{
   __JOHANSSON_AUDIT__.interact(); // Stand from the opening bench.
   __JOHANSSON_AUDIT__.teleport(-19.25,-36.6,Math.PI);
   __JOHANSSON_AUDIT__.camera={pos:[-25,8,-39],at:[-18,4,-28]};
  });
  const walk=async(key,predicate)=>{
   await page.keyboard.down(key);
   try{await page.waitForFunction(predicate,null,{timeout:180000});}
   finally{await page.keyboard.up(key);}
   await page.waitForTimeout(200);
  };
  await walk('KeyW',()=>__JOHANSSON_POSE__.y>4&&__JOHANSSON_POSE__.z>-29.9);
  const landing=await page.evaluate(()=>({x:__JOHANSSON_POSE__.x,y:__JOHANSSON_POSE__.y,z:__JOHANSSON_POSE__.z}));
  assert.ok(Math.abs(landing.y-4.03)<.01);
  if(process.env.SHOP_SCREENSHOTS)await page.screenshot({path:process.env.SHOP_SCREENSHOTS+'/sakura-rear-'+width+'.png',timeout:30000});
  await walk('KeyA',()=>__JOHANSSON_POSE__.x>-16.8);
  assert.ok(Math.abs(await page.evaluate(()=>__JOHANSSON_POSE__.y)-4.03)<.01);
  await walk('KeyD',()=>__JOHANSSON_POSE__.x<-19.1);
  await walk('KeyS',()=>__JOHANSSON_POSE__.z<-36.65);
  assert.ok(Math.abs(await page.evaluate(()=>__JOHANSSON_POSE__.y))<.01);
  assert.deepEqual(errors,[]);
  console.log(`Published WebGL stair/home ascent, entry, exit and descent passed: ${width}x${height}`);
  await page.goto('about:blank');await page.close();
 }
}finally{await browser.close();}
