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
const args=process.argv.slice(2),SOURCE=args.includes('--source'),STICKERS=args.includes('--stickers');
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
 await context.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:20',speed:1}));Element.prototype.requestFullscreen=async()=>{};});
 const page=await context.newPage();page.setDefaultTimeout(120000);
 page.on('pageerror',e=>{report.errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('response',r=>{if(r.status()===404)console.log('MISSING',new URL(r.url()).pathname)});

 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit&sakura-rebuild`);step('page loaded');
 await page.locator('#enter:not([disabled])').waitFor();step('island ready');
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);step('playing');
 await page.addStyleTag({content:'body>*:not(#game){visibility:hidden!important}#game{visibility:visible!important}'});
 const shot=async(name,cam)=>{await page.evaluate(c=>{const a=window.__JOHANSSON_AUDIT__;a.camera=c;a.render();},cam);await page.waitForTimeout(300);
  await page.locator('#game').screenshot({path:resolve(out,name+'.png')});step('photographed '+name);};
 await page.evaluate(async()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;a.setTime(295*1440+740);await a.enter('market');a.step(15000);});
 await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.blocked.roomLoading);step('entered candidate Sakura');
 await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.johansson.root.visible=false;});
 report.playerHiddenForCamera=true;
 await page.setViewportSize({width:1280,height:800});
 if(STICKERS){
  await shot('Sakura-Shelf-Detail',{pos:[-3.95,.96,-1.70],at:[-3.15,.68,-1.70]});
  const atlas=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.room.getObjectByName('Sakura prices and paper stickers').material.map.image.toDataURL('image/png'));
  await writeFile(resolve(out,'Sakura-Shelf-Prints.png'),Buffer.from(atlas.split(',')[1],'base64'));
  report.stickers=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.room.getObjectByName('Sakura prices and paper stickers').userData.labels);
 }
 await shot('Sakura-Game-Entrance',{pos:[0,1.45,2.8],at:[0,1,-3.7]});
 await shot('Sakura-Game-Checkout',{pos:[3.0,1.4,1.0],at:[5.5,.95,.7]});
 await shot('Sakura-Game-Aisle',{pos:[-3.675,1.4,2.4],at:[-3.675,1,-2.8]});
 await page.setViewportSize({width:390,height:844});
 await shot('Sakura-Game-Mobile',{pos:[0,1.45,2.8],at:[0,1,-3.7]});
 report.shop=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.shop);report.cast=await page.evaluate(()=>window.__JOHANSSON_CAST__.takes.filter(p=>p.flags.includes('inMarket')));

}finally{await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
console.log(JSON.stringify({steps:report.steps.length,errors:report.errors}));
if(report.errors.length)process.exit(1);
