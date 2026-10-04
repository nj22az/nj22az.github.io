/** Real Chromium/WebGL acceptance; deliberately separate from the CPU suite.
 * npm run test:bicycle:browser
 * TOWN_BICYCLE_URL=https://nj22az.github.io/johansson-town/ npm run test:bicycle:browser
 * Optional: TOWN_CHROMIUM_PATH, TOWN_BROWSER_PROXY, TOWN_BROWSER_ARTIFACTS.
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import {runtimeSourceHash} from '../../scripts/runtime-source.mjs';

const root=resolve(new URL('../..',import.meta.url).pathname),require=createRequire(import.meta.url);
let playwright;
try {playwright=require('playwright');}
catch(error){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw error;playwright=require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));}
const artifacts=resolve(process.env.TOWN_BROWSER_ARTIFACTS||'/tmp/town-bicycle-browser');
await mkdir(artifacts,{recursive:true});
let server,browser;
const reports=[];
try {
 let base=process.env.TOWN_BICYCLE_URL;
 if(!base){
  server=createServer(async(req,res)=>{
   try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path=resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
    if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}
    const data=await readFile(path);
    res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary'})[extname(path)]||'application/octet-stream');
    res.end(data);
   }catch{res.writeHead(404).end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  base='http://127.0.0.1:'+server.address().port+'/';
 }
 const expected=JSON.parse(await readFile(resolve(root,'runtime/source.json'),'utf8'));
 assert.equal(expected.sha256,await runtimeSourceHash(root),'Rebuild runtime before browser acceptance');
 const manifest=JSON.parse(await readFile(resolve(root,'runtime/.vite/manifest.json'),'utf8'));
 const source=await readFile(resolve(root,'src/game.js'),'utf8');
 const version=source.match(/__JOHANSSON_RUNTIME_VERSION__\s*=\s*['"]([^'"]+)/)?.[1];
 assert.ok(version,'Game exposes its runtime version');
 browser=await playwright.chromium.launch({
  executablePath:process.env.TOWN_CHROMIUM_PATH||undefined,headless:true,
  ...(process.env.TOWN_BROWSER_PROXY?{proxy:{server:process.env.TOWN_BROWSER_PROXY}}:{}),
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
 });
 for(const phone of [false,true]){
  const name=phone?'phone':'desktop';
  // Fresh contexts ensure no acceptance run overwrites a visitor's saved town.
  const context=await browser.newContext({viewport:phone?{width:390,height:844}:{width:1280,height:800},isMobile:phone,hasTouch:phone,deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  let stage='packaging';
  try {
   const get=async path=>{const response=await context.request.get(new URL(path,base).href);assert.ok(response.ok(),path+': HTTP '+response.status());return response;};
   const deployed=await (await get('runtime/source.json')).json();
   assert.equal(deployed.sha256,expected.sha256,'Published source hash differs from checkout; refresh deployment before acceptance');
   const html=await (await get('index.html')).text();
   const boot=manifest['src/boot.js'],game=Object.values(manifest).find(e=>e.src?.startsWith('src/game.js'));
   assert.ok(html.includes("import('./runtime/"+boot.file+"')"),'Published page must use the checked boot entry');
   const files=new Set();
   const graph=entry=>{if(files.has(entry.file))return;files.add(entry.file);for(const key of [...entry.imports||[],...entry.dynamicImports||[]])graph(manifest[key]);};
   graph(boot);graph(game);
   for(const file of files)assert.equal(await (await get('runtime/'+file)).text(),await readFile(resolve(root,'runtime',file),'utf8'),'Published chunk differs: '+file);
   stage='boot/WebGL';
   const url=new URL(base);url.searchParams.set('audit','');url.searchParams.set('spawn','sakura-bench');url.hash='title';
   await page.goto(url.href);
   await page.locator('#enter').click();
   await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__===true,null,{timeout:60000});
   assert.equal(await page.evaluate(()=>window.__JOHANSSON_RUNTIME_VERSION__),version);
   const snapshot=()=>page.evaluate(()=>{
    const audit=window.__JOHANSSON_AUDIT__,bike=audit.world.bicycle.object,thuan=audit.world.people.find(p=>p.profile.name==='Thuan').g;
    const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
    return {x:window.__JOHANSSON_POSE__.x,z:window.__JOHANSSON_POSE__.z,yaw:window.__JOHANSSON_POSE__.yaw,
     mounted:!!thuan.userData.playerControlled,attached:thuan.parent===bike.parent,
     bikeVisible:visible(bike),riderVisible:visible(thuan),parentIsTown:bike.parent===audit.world.group,
     thirdPerson:document.querySelector('#viewButton').getAttribute('aria-pressed'),
     finite:[bike,thuan].every(o=>o.matrixWorld.elements.every(Number.isFinite)),
     blocked:audit.blocked,prompt:document.querySelector('#prompt').textContent};
   });
   const action=()=>phone?page.locator('#act').tap():page.keyboard.press('KeyE');
   if(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.seated))await action();
   await page.waitForFunction(()=>window.__JOHANSSON_AUDIT__.world.people.find(p=>p.profile.name==='Thuan').g.userData.visualReady,null,{timeout:30000});
   // Only setup uses the existing audit teleport. Mount/dismount and all riding
   // use genuine browser input and the published frame loop, never simulate().
   await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,b=a.world.bicycle.object;a.teleport(b.position.x+1.2,b.position.z,Math.PI/2);});
   await page.waitForFunction(()=>window.__JOHANSSON_AUDIT__.active==='Ride Thuan’s bicycle',null,{timeout:15000});
   const previousView=(await snapshot()).thirdPerson;
   stage='mount';
   await action();
   await page.waitForFunction(()=>window.__JOHANSSON_AUDIT__.world.people.find(p=>p.profile.name==='Thuan').g.userData.playerControlled,null,{timeout:15000});
   const mounted=await snapshot();
   assert.ok(mounted.attached&&mounted.bikeVisible&&mounted.riderVisible&&mounted.finite,'Mounted rider and bicycle remain visible together');
   assert.equal(mounted.thirdPerson,'true');
   await page.screenshot({path:resolve(artifacts,name+'-mounted.png')});
   const cdp=phone?await context.newCDPSession(page):null;
   let origin;
   const touch=async(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
   const start=async steer=>{
    if(!phone){await page.keyboard.down('KeyW');if(steer)await page.keyboard.down('KeyD');return;}
    const pad=await page.locator('#stick').boundingBox();assert.ok(pad?.width>0&&pad.height>0,'Phone movement pad is visible');
    origin={x:pad.x+pad.width*.45,y:pad.y+pad.height*.6};
    await touch('touchStart',origin.x,origin.y);
    await touch('touchMove',origin.x+(steer?35:0),origin.y-40);
   };
   const stop=async()=>{if(phone)await touch('touchEnd');else{await page.keyboard.up('KeyW');await page.keyboard.up('KeyD');}};
   stage='forward input/collision';
   await start(false);
   await page.waitForFunction(({x,z})=>Math.hypot(window.__JOHANSSON_POSE__.x-x,window.__JOHANSSON_POSE__.z-z)>.7,mounted,{timeout:20000});
   await stop();
   const forward=await snapshot();assert.ok(forward.z<mounted.z-.4,'Forward travels toward the front wheel');
   stage='steering/attachment/camera';
   await start(true);
   await page.waitForFunction(yaw=>Math.abs(window.__JOHANSSON_POSE__.yaw-yaw)>.15,forward.yaw,{timeout:20000});
   await stop();
   const steering=await snapshot();
   assert.ok(steering.yaw<forward.yaw-.15,'Right steering turns right');
   assert.ok(steering.attached&&steering.bikeVisible&&steering.riderVisible&&steering.finite);
   assert.equal(steering.thirdPerson,'true');
   await page.screenshot({path:resolve(artifacts,name+'-steering.png')});
   stage='dismount';await action();
   await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.world.people.find(p=>p.profile.name==='Thuan').g.userData.playerControlled);
   const dismounted=await snapshot();assert.ok(dismounted.parentIsTown&&!dismounted.attached&&dismounted.finite);
   assert.equal(dismounted.thirdPerson,previousView,'Dismount restores the previous camera mode');
   await page.screenshot({path:resolve(artifacts,name+'-dismounted.png')});
   assert.deepEqual(errors,[],'No uncaught runtime exceptions');
   reports.push({name,ok:true,mounted,forward,steering,dismounted});
   console.log(name+': mount, forward, steer, dismount and deployed source graph passed');
  }catch(error){
   await page.screenshot({path:resolve(artifacts,name+'-failed.png')}).catch(()=>{});
   reports.push({name,ok:false,stage,error:error.message,errors});
   console.error(name+' failed at '+stage+': '+error.message);
  }finally{await context.close();}
 }
 assert.ok(reports.every(report=>report.ok),'Bicycle browser acceptance failed; see '+resolve(artifacts,'results.json'));
}finally{
 await writeFile(resolve(artifacts,'results.json'),JSON.stringify(reports,null,2)+'\n');
 await browser?.close();if(server)await new Promise(r=>server.close(r));
}
