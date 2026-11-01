// Hosted regression and rendered evidence; run with DIORAMA_TEST_RUNTIME pointing to Playwright.
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(process.env.DIORAMA_TEST_RUNTIME+'/package.json'),{chromium}=require('playwright');
const root=resolve(new URL('../..',import.meta.url).pathname),out=resolve(root,'release-evidence/harbour-diorama-2026-11-01');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.mp4':'video/mp4'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(path.endsWith('/')?path+'index.html':path));if(!file.startsWith(root+sep))throw Error();const b=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const reports=[];
try{
 for(const [profile,width,height] of [['desktop',1440,1000],['ipad-portrait',768,1024],['ipad-landscape',1024,768],['phone',390,844]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:profile!=='desktop',reducedMotion:'reduce'}),page=await context.newPage(),requests=[],errors=[];
  page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
  // Avoid third-party fonts/maps/storefront affecting offline reproducibility.
  await page.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
  await page.goto(url);await page.getByRole('button',{name:'Explore harbour',exact:true}).waitFor();
  assert(!requests.some(x=>/office-diorama-scene|harbour.scene.gz|three.module/.test(x)),'No 3D download before opt-in');
  await page.getByRole('button',{name:'Explore harbour',exact:true}).click();
  await page.getByText('Drag to look around · choose a view below',{exact:true}).waitFor({timeout:90000});
  const canvas=page.locator('[data-diorama-stage] canvas');assert(await canvas.isVisible());
  if(profile==='desktop'){
   const still=await canvas.screenshot();await page.waitForTimeout(150);assert(still.equals(await canvas.screenshot()),'Reduced motion holds the scene still');
   await page.emulateMedia({reducedMotion:'no-preference'});const before=await canvas.screenshot();await page.waitForTimeout(250);assert(!before.equals(await canvas.screenshot()),'Water animates when motion is allowed');
   await page.emulateMedia({reducedMotion:'reduce'});
   const box=await canvas.boundingBox();await page.mouse.move(box.x+box.width*.4,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5);await page.mouse.up();
   await page.getByRole('button',{name:'Reset',exact:true}).click();
  }
  for(const view of ['Quay','Ferry','Overview']){
   await page.locator('[data-diorama]').getByRole('button',{name:view,exact:true}).click();
   await page.waitForTimeout(180);await page.screenshot({path:resolve(out,profile+'-'+view.toLowerCase()+'.png')});
  }
  await canvas.focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('+');
  await page.getByRole('button',{name:'Zoom out',exact:true}).click();await page.getByRole('button',{name:'Reset',exact:true}).click();
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('[data-diorama] button')].map(b=>{const r=b.getBoundingClientRect();return {label:b.textContent,width:r.width,height:r.height};})}));
  assert(!layout.overflow,'No page overflow');assert(layout.buttons.every(b=>b.width>=44&&b.height>=44),'44px touch targets');
  assert.equal(await page.locator('[data-diorama] a[href="/camera/"]').count(),1);
  await page.getByRole('button',{name:'Close',exact:true}).click();assert.equal(await canvas.count(),0,'Close releases canvas');
  await page.getByRole('button',{name:'Explore harbour',exact:true}).click();await page.getByText('Drag to look around · choose a view below',{exact:true}).waitFor({timeout:90000});
  await page.locator('[data-diorama-stage] canvas').focus();await page.keyboard.press('Escape');assert.equal(await canvas.count(),0);
  // A failed asset download returns to a usable, finished image.
  await page.route('**/harbour.scene.gz?*',route=>route.abort());await page.getByRole('button',{name:'Explore harbour',exact:true}).click();await page.getByRole('button',{name:'Try harbour again',exact:true}).waitFor({timeout:30000});
  assert(await page.locator('#office-port>img').isVisible());assert.equal(await canvas.count(),0);
  assert.deepEqual(errors,[]);reports.push({profile,width,height,result:'passed',layout,sceneRequests:requests.filter(x=>x.includes('harbour.scene.gz')).length});await context.close();
 }
 await writeFile(resolve(out,'results.json'),JSON.stringify({result:'passed',profiles:reports},null,2));console.log(JSON.stringify(reports));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
