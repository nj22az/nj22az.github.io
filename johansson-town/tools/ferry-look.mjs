// Photographs the Minato Maru in the running game from the views the ferry audit needs
// (docs/FERRY-AUDIT.md): quay, pier, waterline, aerial, night, and lifted out of the water (the
// "dry dock" view of the underwater body). node tools/ferry-look.mjs [out-dir]   (needs the built runtime)
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),site=resolve(root,'..');
const out=resolve(process.argv[2]||resolve(root,'output/ferry-audit'));   // PNGs; docs/qa/ferry keeps the reviewed set as webpawait mkdir(out,{recursive:true});
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.svg':'image/svg+xml','.ogg':'audio/ogg','.mp3':'audio/mpeg','.wasm':'application/wasm','.hdr':'application/octet-stream'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://x').pathname);const file=resolve(site,'.'+(path.endsWith('/')?path+'index.html':path));if(!file.startsWith(site))throw Error('outside');res.writeHead(200,{'content-type':TYPES[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 await context.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'14:20',speed:1}));Element.prototype.requestFullscreen=async()=>{};});
 const page=await context.newPage();page.setDefaultTimeout(240000);page.on('pageerror',e=>console.warn('Page error:',e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit`);
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp,null,{timeout:240000});
 await page.addStyleTag({content:'body>*:not(#game){visibility:hidden!important}#game{visibility:visible!important}'});
 await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.blocked.roomLoading&&!window.__JOHANSSON_STREAMING__?.active);await page.waitForTimeout(3000);
 const info=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,f=a.world.ferry;return {phase:f.phase,berth:f.berth,pos:f.ferry.position.toArray(),visible:f.ferry.visible};});
 console.log('ferry',JSON.stringify(info));
 const shot=async(name,pos,at,setup)=>{await page.evaluate(([pos,at,setup])=>{const a=window.__JOHANSSON_AUDIT__,f=a.world.ferry.ferry;
   f.userData.__y??=f.position.y;f.position.y=f.userData.__y;f.userData.lights(false);f.userData.setRamp(1,setup==='airport'?-.008:.24);
   if(setup==='airport'){const run=a.world.ferry;run.parkAt('airport');f.userData.__y=f.position.y;}
   if(setup==='lift'){f.position.y+=2.2;} if(setup==='night')f.userData.lights(true);if(setup==='rampUp')f.userData.setRamp(0);
   a.camera={pos,at};a.render();return {phase:a.world.ferry.phase,berth:a.world.ferry.berth,pos:f.position.toArray().map(v=>+v.toFixed(2)),visible:f.visible};},[pos,at,setup]).then(r=>setup==='airport'&&console.log(name,JSON.stringify(r)));await page.waitForTimeout(700);await page.locator('#game').screenshot({path:resolve(out,name+'.png')});console.log('saved',name);};
 const [fx,,fz]=info.pos;const L=(dx,dy,dz)=>[fx+dx,dy,fz+dz];
 await shot('01-quay-three-quarter',L(9,4.5,18),L(0,1.2,0));
 await shot('02-pier-gangway',L(5.2,1.7,-1),L(-1,1.8,-3));
 await shot('03-starboard-broadside',L(-24,3,-2),L(0,1,0));
 await shot('04-stern',L(-6,3,-24),L(0,1.5,0));
 await shot('05-aerial',L(-10,26,-6),L(0,0,0));
 await shot('06-bow-ramp',L(-4,3.2,16),L(0,1.2,8));
 await shot('07-waterline-draft-marks',L(-9,.2,8),L(0,-.2,9));
 await shot('08-drydock-underwater',L(-12,-.6,-14),L(0,-.6,-3),'lift');
 await shot('09-drydock-stern-screws',L(-3.5,-1.2,-15),L(0,-.8,-9),'lift');
 await shot('10-wheelhouse-mast',L(6,7,4),L(0,5,-3));
 await shot('11-night',L(9,4.5,18),L(0,1.2,0),'night');
 await shot('12-ramp-up',L(-4,3.2,16),L(0,1.2,8),'rampUp');
 await shot('13-draft-marks-close',L(-5.2,.15,9.2),L(-2.9,0,9.6));
 await shot('14-load-line-close',L(-5.5,.4,-.5),L(-3.2,.3,-.5));
 await shot('15-car-deck',L(1.4,3.4,12.5),L(0,.6,1));
 // At Kitano-jima: bow in to the jetty with her ramp down on it. The player goes over first, so that
 // side of the sound is the one the game draws.
 await page.evaluate(async()=>{const a=window.__JOHANSSON_AUDIT__,{AIRPORT_LANDING}=await import('/johansson-town/src/world/airport-ground.js');a.teleport(AIRPORT_LANDING[0],AIRPORT_LANDING[1]);a.step(2000);});await page.waitForTimeout(3000);
 const away=await page.evaluate(()=>{const f=window.__JOHANSSON_AUDIT__.world.ferry;f.parkAt('airport');f.ferry.userData.__y=f.ferry.position.y;f.ferry.updateMatrixWorld(true);const w=(x,y,z)=>{const v=f.ferry.localToWorld(new f.ferry.position.constructor(x,y,z));return v.toArray();};return {a:w(-14,6,-8),b:w(0,1,6),c:w(9,3,16),d:w(0,1,9)};});
 await shot('16-kitano-jima-berth',away.a,away.b,'airport');
 await shot('17-kitano-jima-ramp',away.c,away.d,'airport');
}finally{await browser.close();server.close();}
