// Boots the whole game in a cloud session's software Chromium (swiftshader), presses START, and photographs one street
// view and one room through the ?audit harness, timing each step: the check that the real game, not a stripped-down
// scene, can be looked at from a cloud session.
//   node tools/cloud-boot-smoke.mjs [--source] [out-dir]
// The built runtime by default (rebuild it first: npm run build:runtime); --source serves the source modules instead.
// About 35 s to "Island ready" and 60 s to play on a 4-core cloud machine. Run it alone: browsers or test suites
// running beside it starve it, and the island then takes many minutes to draw.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),site=resolve(root,'..');
const args=process.argv.slice(2),SOURCE=args.includes('--source');
const out=resolve(args.find(a=>!a.startsWith('--'))||resolve(root,'output/cloud-boot-smoke'));await mkdir(out,{recursive:true});
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.svg':'image/svg+xml','.hdr':'application/octet-stream','.wasm':'application/wasm'};
const sourcePage=html=>html.replace(/<link rel="modulepreload" data-town-runtime[^>]*>\n?/g,'')
 .replace(/import\(['"]\.\/runtime\/boot-[^'"]+['"]\)/g,"import('./src/boot.js')")
 .replace(/from ['"]\.\/runtime\/audio-[^'"]+['"]/g,"from './src/audio/town-audio.js?snappy=1'")
 .replace(/window\.JOHANSSON_FEED_MODULE="[^"]+"/,'window.JOHANSSON_FEED_MODULE="./src/feed/mount.js"')
 .replace(/window\.JOHANSSON_PORTRAIT_MODULE="[^"]+"/,'window.JOHANSSON_PORTRAIT_MODULE="./src/avatars/guide-portraits.js"');
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://x').pathname);
 const file=resolve(site,'.'+(path.endsWith('/')?path+'index.html':path));if(!file.startsWith(site))throw Error('outside');
 let body=await readFile(file);if(SOURCE&&file===resolve(root,'index.html'))body=sourcePage(body.toString());
 res.writeHead(200,{'content-type':TYPES[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const t0=Date.now(),at=()=>+((Date.now()-t0)/1000).toFixed(1),report={source:SOURCE,viewport:[390,844],physicalDevice:false,steps:[],errors:[]};
const step=(name,extra={})=>{report.steps.push({name,s:at(),...extra});console.log(at()+'s',name);};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'08:30',speed:1}));Element.prototype.requestFullscreen=async()=>{};});
 const page=await context.newPage();page.setDefaultTimeout(600000);
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit`);step('page loaded');
 await page.locator('#enter:not([disabled])').waitFor();step('island ready');
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);step('playing');
 const probe=async(label)=>{
  const state=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,r=a.ferry;return {minute:JSON.parse(window.render_game_to_text()).minutes,player:a.player,phase:r.phase,berth:r.berth,operation:r.operation,access:r.accessOpen,canUnload:r.canUnload,deck:a.probe(...a.player.position).deck,local:r.ferry.worldToLocal(r.ferry.position.clone().set(...a.player.position)).toArray(),island:a.island.snapshot(),crew:a.ferryCrew};});
  await writeFile(resolve(out,label+'.json'),JSON.stringify(state,null,2));step(label,{minute:state.minute,stage:state.operation?.stage,blocking:state.operation?.blocking});return state;
 };
 const advance=async(seconds)=>{for(let i=0;i<seconds;i+=10){await page.evaluate(s=>window.__JOHANSSON_AUDIT__.step(s*1000),Math.min(10,seconds-i));if(i%60===0)step('simulated '+i+'/'+seconds+' seconds');}};
 const shot=async(name,localCamera)=>{
  await page.evaluate(c=>{const a=window.__JOHANSSON_AUDIT__,b=a.ferry.ferry;
   const world=p=>{const v=b.position.clone().set(...p);return b.localToWorld(v).toArray();};
   a.camera={pos:world(c.pos),at:world(c.at)};a.render();},localCamera);
  await page.evaluate(()=>window.__JOHANSSON_AUDIT__.render());await page.screenshot({path:resolve(out,name+'.png')});step('photographed '+name);
 };
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.day=Math.floor(JSON.parse(window.render_game_to_text()).minutes/1440)*1440;a.setTime(a.day+510);a.step(100);a.island.action('airport-ferry');});
 await page.getByRole('button',{name:'Board the next sailing',exact:true}).click();
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,p=a.player.position;a.stand(...p);a.renderFrozen=false;});
 await advance(420);const prepared=await probe('prepared');if(prepared.operation?.stage!=='boarding')throw Error('Crew not ready: '+prepared.operation?.blocking);
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.setTime(window.__JOHANSSON_AUDIT__.day+523));await advance(.2);
 await shot('02-passenger-choice',{pos:[-15,12,-29],at:[0,3,-3]});
 await page.getByRole('button',{name:'Stay aboard',exact:true}).click();
 await shot('01-departure-warning',{pos:[10,3,-3.4],at:[4.2,2.7,-3.4]});
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.setTime(window.__JOHANSSON_AUDIT__.day+525));await advance(300);const departed=await probe('departed');if(!['passage','arriving'].includes(departed.operation?.stage))throw Error('No departure: '+departed.operation?.blocking);
 await shot('03-crossing',{pos:[-15,12,-29],at:[0,3,-3]});
 // Exercise ordinary walking while the ship moves, retaining the same player and floor support.
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;a.face(a.ferry.ferry.rotation.y+Math.PI);});
 await page.keyboard.down('w');await advance(.5);await page.keyboard.up('w');await probe('walked-on-deck');
 await advance(1100);const arrival=await probe('arrival');if(arrival.berth!=='airport'||!arrival.canUnload)throw Error('Arrival incomplete: '+arrival.operation?.blocking);
 await shot('04-kitano-arrival',{pos:[14,11,-8],at:[0,3,15]});
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.island.action('airport-return'));
 await page.getByRole('button',{name:'Go ashore',exact:true}).click();await advance(110);const ashore=await probe('disembarked');if(ashore.island.walkingAshore||ashore.deck)throw Error('Passenger did not disembark safely');

}finally{await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
console.log(JSON.stringify({steps:report.steps.length,errors:report.errors}));
if(report.errors.length)process.exit(1);
