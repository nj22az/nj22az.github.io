import {execFileSync} from 'node:child_process';
// Reproducible actual-game Sakura stair photographs and round-trip checks.
// Run alone with a software Chromium: node tools/sakura-entrance-photos.mjs [--source] [--baseline=<commit>] <out>
// --baseline serves that commit's stair module inside the current game; before and after share the same fixture.
// Browser viewport emulation is not physical iPhone Safari acceptance.
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
const baseline=args.find(a=>a.startsWith('--baseline='))?.slice(11);
const oldStairs=baseline?execFileSync('git',['show',baseline+':johansson-town/src/world/interiors/sakura-stairs.js'],{cwd:site}):null;
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://x').pathname);
 const file=resolve(site,'.'+(path.endsWith('/')?path+'index.html':path));if(!file.startsWith(site))throw Error('outside');
 let body=oldStairs&&file===resolve(root,'src/world/interiors/sakura-stairs.js')?oldStairs:await readFile(file);if(SOURCE&&file===resolve(root,'index.html'))body=sourcePage(body.toString());
 res.writeHead(200,{'content-type':TYPES[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||chromium.executablePath(),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const t0=Date.now(),at=()=>+((Date.now()-t0)/1000).toFixed(1),report={source:SOURCE,viewport:[390,844],physicalDevice:false,steps:[],errors:[]};
report.skippedBasePhotos=args.includes('--skip-base');
const step=(name,extra={})=>{report.steps.push({name,s:at(),...extra});console.log(at()+'s',name);};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:20',speed:1}));Element.prototype.requestFullscreen=async()=>{};});
 const page=await context.newPage();page.setDefaultTimeout(600000);
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit`);step('page loaded');
 await page.locator('#enter:not([disabled])').waitFor();step('island ready');
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);step('playing');
 await page.addStyleTag({content:'body>*:not(#game){visibility:hidden!important}#game{visibility:visible!important}'});
 const shot=async(name,cam)=>{if(args.includes('--checks-only'))return;await page.evaluate(c=>{const a=window.__JOHANSSON_AUDIT__;a.camera=c;a.render();},cam);await page.waitForTimeout(300);
  await page.locator('#game').screenshot({path:resolve(out,name+'.png')});step('photographed '+name);};
 await page.evaluate(async()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;await a.enter('market');});
 await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.blocked.roomLoading);step('entered Sakura');
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(294*1440+740);a.stand(-.85,0,-5.65,Math.PI/2);});
 const views={front:{pos:[.4,1.6,-5.6],at:[-2.7,1.4,-4.8]},side:{pos:[.15,1.6,-6.15],at:[-3.2,1.35,-4.8]},low:{pos:[-.85,.65,-5.75],at:[-2.7,1.1,-4.6]},stockroom:{pos:[3.9,1.6,-5.75],at:[-3,1.4,-5.0]}};
 report.revision=baseline||execFileSync('git',['rev-parse','HEAD'],{cwd:site}).toString().trim();report.views=views;report.fixture={edition:'web',townMinutes:294*1440+740,weather:'sunny',save:'fresh',physicalDevice:false};
 for(const [name,cam] of Object.entries(views))if(!args.includes('--skip-base')&&(!args.includes('--front-only')||name==='front'))await shot(name,cam);
 if(args.includes('--front-only')){const old=JSON.parse(await readFile(resolve(out,'report.json'),'utf8'));old.views.front=views.front;await writeFile(resolve(out,'report.json'),JSON.stringify(old,null,2)+'\n');await browser.close();server.close();process.exit(0);}
 await page.evaluate(wanted=>{if(window.__JOHANSSON_AUDIT__.mouse.thirdPerson!==wanted)document.querySelector('#viewButton').click();},!args.includes('--first'));
 report.thirdPerson=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.mouse.thirdPerson);
 if(report.thirdPerson===args.includes('--first'))throw Error('Requested view mode did not activate');
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;a.stand(1.3,0,-5.6,Math.PI/2);a.step(100);a.step(16);});
 await shot(report.thirdPerson?'third-stockroom':'first-stockroom',views.stockroom);
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;a.stand(-1.12,0,-4.6,Math.PI/2);a.step(16);});
 report.foot=await page.evaluate(()=>({player:window.__JOHANSSON_AUDIT__.player,lens:window.__JOHANSSON_AUDIT__.lens,navigation:window.__JOHANSSON_AUDIT__.navigation(-1.12,-4.6)}));
 // Exercise the same prompt transition used in play; the frozen audit advances its walk deterministically.
 for(const direction of ['up','down']){
  const began=await page.evaluate(d=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;const ok=a.stair(d);a.step(1200);return ok;},direction);
  if(!began)throw Error('Cannot start '+direction);
  await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.passage&&!window.__JOHANSSON_AUDIT__.blocked.roomLoading);
  const state=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.step(16);const p=a.player.position;return {player:a.player,lens:a.lens,navigation:a.navigation(p[0],p[2])};});
  report[direction]=state;
  if(state.player.room!==(direction==='up'?'sakura-office':'market')||state.navigation.staticBlocked||state.lens.blocked)throw Error('Unsafe '+direction+' arrival: '+JSON.stringify(state));
  step('safe '+direction+' arrival');
  await shot(direction+'-arrival',direction==='up'?{pos:[-1.2,1.6,-3.95],at:[-1.2,1.45,-1]}:views.front);
 }
 // Walking onto each trigger also starts the passage, independently of the prompt.
 report.walkEntry=[];
 for(const direction of ['up','down']){
  const began=await page.evaluate(d=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;const p=d==='up'?[-2.05,0,-4.6]:[-2.1,0,-5.51];a.stand(...p);a.step(16);const result={passage:a.passage,fade:document.querySelector('#threshold').classList.contains('on')};a.step(1200);return result;},direction);
  if(!began.passage||!began.fade)throw Error('Walk entry did not fade '+direction);
  await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.passage&&!window.__JOHANSSON_AUDIT__.blocked.roomLoading);
  const state=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.step(16);const p=a.player.position;return {player:a.player,lens:a.lens,navigation:a.navigation(p[0],p[2])};});
  if(state.player.room!==(direction==='up'?'sakura-office':'market')||state.navigation.staticBlocked||state.lens.blocked)throw Error('Unsafe walk entry '+direction+': '+JSON.stringify(state));
  report.walkEntry.push({direction,...began,...state});step('safe automatic '+direction+' arrival');
 }
 await page.setViewportSize({width:1280,height:800});await shot('desktop-stockroom',views.stockroom);
 await page.setViewportSize({width:844,height:390});await shot('landscape',views.front);

}finally{await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
console.log(JSON.stringify({steps:report.steps.length,errors:report.errors}));
if(report.errors.length)process.exit(1);
