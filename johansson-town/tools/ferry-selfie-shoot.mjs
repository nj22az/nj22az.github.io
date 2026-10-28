/** Thuan's selfie on the Minato Maru (the creator, 28 October 2026, with a holiday photo: "Make a scene on the Minato
 * Ferry where Thuan poses like this"): she stands at the port rail of the open deck, between the liferaft and the funnel (out
 * from under the awning: open sky over her), facing inboard, the sea behind her, in the Selfie pose (fun-poses.js), and the
 * picture is taken from where her camera is: ahead of her face, up and out to her right, so her arm comes in from the
 * frame's corner, a little wide, as a phone held at arm's length sees.
 *   node tools/ferry-selfie-shoot.mjs <out-dir> [--time 11:30] [--looks none,stamp] [--size 1200x1600] [--berth]
 *        [--at x,z] [--yaw 1.571] [--face smile] [--lens ahead,up,right] [--fov 56]
 * Under way unless --berth: she sails from Minato for Kitano-jima and the picture is taken once she is in open water.
 * Ship frame (ferry-model.js): +z forward, +x to port, y up from her laden waterline; the open deck is at 5.5 m.
 */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {FERRY_SHIP,FERRY_HEIGHTS} from '../src/world/ferry-ship.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),site=resolve(root,'..');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i>0?process.argv[i+1]:fallback;};
const out=resolve(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:resolve(root,'output/ferry-selfie'));await mkdir(out,{recursive:true});
const [W,H]=arg('size','1200x1600').split('x').map(Number),looks=arg('looks','none').split(',');
const [h,m]=arg('time','11:30').split(':').map(Number),berth=process.argv.includes('--berth');
const HALF=FERRY_SHIP.length/2,DECK=FERRY_HEIGHTS.passengerDeck-FERRY_SHIP.draft;
const [ax,az]=(arg('at')||`${(FERRY_SHIP.beam/2-.55).toFixed(2)},-14.4`).split(',').map(Number);
const shot={at:[ax,DECK,az],yaw:+arg('yaw',String(Math.PI/2)),face:arg('face','smile'),lens:arg('lens','.64,.15,.12').split(',').map(Number),fov:+arg('fov','56')};
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.svg':'image/svg+xml','.wasm':'application/wasm','.webmanifest':'application/manifest+json','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2','.ktx2':'image/ktx2','.bin':'application/octet-stream'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://x').pathname),file=resolve(site,'.'+(path.endsWith('/')?path+'index.html':path));if(!file.startsWith(site+'/'))throw Error('outside');const body=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||chromium.executablePath(),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const report={size:[W,H],looks,shot,errors:[]};
try{
 const context=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,serviceWorkers:'block'});
 await context.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'11:30',speed:1}));Element.prototype.requestFullscreen=async()=>{};});
 const page=await context.newPage();page.setDefaultTimeout(900000);page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit`);
 await page.locator('#enter:not([disabled])').waitFor();await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);
 await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.blocked.roomLoading&&!window.__JOHANSSON_STREAMING__?.active);
 const canvas=page.locator('canvas').first();
 // She lies alongside, then (under way) casts off for Kitano-jima; the clock runs until she is out in open water.
 const voyage=await page.evaluate(async([minutes,berth])=>{
  const a=window.__JOHANSSON_AUDIT__,run=a.world.ferry;a.setTime(10002*1440+minutes);a.step(200);run.parkAt('town');run.update(.1,minutes,0);
  if(berth)return {stage:'alongside'};
  if(!run.beginCrossing('airport'))return {stage:'refused'};
  for(let i=0;i<400&&!(run.crossingProgress>.35);i++)a.step(1000);
  return {stage:run.operation?.stage,progress:run.crossingProgress};
 },[h*60+m,berth]);
 report.voyage=voyage;console.log('ferry',JSON.stringify(voyage));
 for(const look of looks){
  await page.evaluate(name=>window.__JOHANSSON_LOOK__.setStyle(name),look);
  const view=await page.evaluate(({shot})=>{
   const a=window.__JOHANSSON_AUDIT__,f=a.world.ferry.ferry;f.updateMatrixWorld(true);
   // On the deck, riding with her; a body faces its own −z, turned by `yaw` (π/2: inboard from the port rail).
   const holder=a.stage('Thuan',{pose:'Selfie',expression:shot.face,at:shot.at,yaw:shot.yaw,parent:f,shadows:false});
   const avatar=a.staged.avatar,V=holder.position.constructor;holder.updateMatrixWorld(true);
   const hand=avatar.bones.handR.getWorldPosition(new V()),head=avatar.bones.head.getWorldPosition(new V());
   const face=head.clone().add(new V(0,avatar.measure.headCentre-avatar.measure.headY,0).multiplyScalar(holder.getWorldScale(new V()).y));
   // the lens, in her own frame from her face: ahead, up and to her right (where the camera in her mitten points from)
   const ahead=new V(0,0,-1).transformDirection(holder.matrixWorld),right=new V(-1,0,0).transformDirection(holder.matrixWorld);
   const lens=face.clone().addScaledVector(ahead,shot.lens[0]).add(new V(0,shot.lens[1],0)).addScaledVector(right,shot.lens[2]);
   // Johansson stands well forward, out of the picture (on her deck, so the ship is drawn round him).
   const fwd=new V(0,0,1).transformDirection(f.matrixWorld);a.teleport(face.x+fwd.x*12,face.z+fwd.z*12,0,0);
   for(const x of [a.hands,a.hands?.group,a.hands?.root])if(x?.isObject3D)x.visible=false;
   a.hud.photo(true);a.camera={pos:lens.toArray(),at:face.toArray(),fov:shot.fov};a.render();a.render();
   return {lens:lens.toArray(),face:face.toArray(),hand:hand.toArray(),probe:a.probe(lens.x,lens.y,lens.z)};
  },{shot});
  await page.waitForTimeout(500);
  const file=`thuan-ferry-selfie--${look}.png`;await canvas.screenshot({path:resolve(out,file)});
  report[file]=view;console.log('shot',file,JSON.stringify(view));
 }
}catch(error){report.errors.push(String(error.stack||error));console.error(error);process.exitCode=1;}
finally{await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,1));await browser.close();server.close();}
