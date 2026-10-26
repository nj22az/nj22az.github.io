// Photographs a Pixar body in the running game (src/avatars/pixar.js): boots World in a cloud session's software Chromium
// (Pixar bodies are drawn by default), finds the resident where the town has put her (in Sakura if she is not out in the
// street), and photographs her close (front, three-quarter, face, then the face as the town moves on) from the audit
// harness's lens; with --cartoon the same views with ?pixar=0, to compare.
//   node tools/pixar-shots.mjs [--name Thuan] [--time 12:20] [--cartoon] [--source] [out-dir]
// The built runtime by default (npm run build:runtime first); --source serves the source modules. Run it alone.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),site=resolve(root,'..');
const args=process.argv.slice(2),flag=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
const SOURCE=args.includes('--source'),CARTOON=args.includes('--cartoon'),NAME=flag('--name')||'Thuan',TIME=flag('--time')||'12:20';
const out=resolve(args.find((a,i)=>!a.startsWith('--')&&!['--name','--time'].includes(args[i-1]))||resolve(root,'output/pixar-shots'));await mkdir(out,{recursive:true});
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
const t0=Date.now(),at=()=>+((Date.now()-t0)/1000).toFixed(1),report={name:NAME,cartoon:CARTOON,source:SOURCE,time:TIME,steps:[],errors:[],warnings:[]};
const step=(name,extra={})=>{report.steps.push({name,s:at(),...extra});console.log(at()+'s',name,Object.keys(extra).length?JSON.stringify(extra):'');};
try{
 const context=await browser.newContext({viewport:{width:900,height:900},serviceWorkers:'block'});
 await context.addInitScript(t=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:t,speed:1}));localStorage.setItem('johansson-town-view','third');Element.prototype.requestFullscreen=async()=>{};},TIME);
 const page=await context.newPage();page.setDefaultTimeout(900000);
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')report.warnings.push(m.text().slice(0,300));});
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit${CARTOON?'&pixar=0':''}`);step('page loaded');
 await page.locator('#enter:not([disabled])').waitFor();step('island ready');
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);step('playing');
 await page.addStyleTag({content:'body>*:not(#game){visibility:hidden!important}#game{visibility:visible!important}'});
 // Her avatar, wherever the town has her: the scene reached from the player's own.
 const find=async()=>page.evaluate(name=>{
  let scene=window.__JOHANSSON_MODEL__?.avatar?.root;while(scene?.parent)scene=scene.parent;
  const found=[];scene?.traverse(o=>{if(o.name==='Shimanchu · '+name)found.push(o);});
  const shown=found.find(o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;})||found[0];
  if(!shown)return null;window.__PIXAR_SUBJECT__=shown;shown.updateWorldMatrix(true,true);
  const p=shown.getWorldPosition(new shown.position.constructor());let pixar=null;shown.traverse(o=>{if(o.name?.startsWith('Pixar '))pixar=(pixar||0)+1;});
  return {count:found.length,position:p.toArray().map(v=>+v.toFixed(2)),visible:found.map(o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;}),pixarMeshes:pixar};
 },NAME);
 let where=await find();step('found '+NAME,{where});
 if(!where?.visible?.some(Boolean)){
  // Not out in the town now: at work in Sakura, most of the day.
  await page.evaluate(async()=>{await window.__JOHANSSON_AUDIT__.enter('sakura');});
  await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.blocked.roomLoading);where=await find();step('in Sakura',{where});
 }
 // A lens in front of her, along her own facing: the body faces its root's +z (build.js).
 const lens=async(distance,height,turn=0,aim=null)=>page.evaluate(([d,h,t,a])=>{
  const o=window.__PIXAR_SUBJECT__;o.updateWorldMatrix(true,true);const e=o.matrixWorld.elements,p=[e[12],e[13],e[14]];
  const f=[e[8],e[10]],l=Math.hypot(...f),fx=f[0]/l,fz=f[1]/l,c=Math.cos(t),s=Math.sin(t),dx=fx*c-fz*s,dz=fx*s+fz*c;
  return {pos:[p[0]+dx*d,p[1]+h,p[2]+dz*d],at:[p[0],p[1]+(a??h),p[2]]};},[distance,height,turn,aim]);
 const shot=async(name,cam)=>{await page.evaluate(c=>{const a=window.__JOHANSSON_AUDIT__;a.camera=c;a.render();},cam);await page.waitForTimeout(300);
  await page.locator('#game').screenshot({path:resolve(out,name+'.png')});step('photographed '+name);};
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.hud.photo(true));
 await shot('full-front',await lens(2.6,1.0,0,.85));
 await shot('full-three-quarter',await lens(2.6,1.0,.65,.85));
 await shot('face',await lens(.75,1.42,.25,1.4));
 // Her eyes about: a moment of the town, then the face again (a blink or a glance may land)
 for(let i=0;i<4;i++){await page.evaluate(()=>window.__JOHANSSON_AUDIT__.step(700));await shot('face-'+(i+1),await lens(.75,1.42,.25,1.4));}
 report.renderInfo=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.renderInfo);
}finally{await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
console.log(JSON.stringify({steps:report.steps.length,errors:report.errors,warnings:report.warnings.slice(0,8)}));
if(report.errors.length)process.exit(1);
