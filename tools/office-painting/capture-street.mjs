// The homepage's living street: the harbour road outside Sakura Shōten, as the game itself plays it. Boots the real
// Johansson World (nj22az/johansson-town cloned as johansson-town/) in software Chromium, stands the audit camera
// where assets/world/sakura-current.webp was taken, and steps the town's own simulation frame by frame, so residents
// walk and traffic drives as they do in play. Each frame is a PNG; encode.sh turns them into the page's film.
//   node tools/office-painting/capture-street.mjs [--fps 12] [--seconds 16] [--skip 0] [--every 1] [--size 1280x800] <out-dir>
// --sweep 06:30-19:00 (no pictures) reports, every quarter hour of town time, who walks through the view: the way to
// choose --time.
// --pos x,y,z --at x,y,z places the lens elsewhere (the section scenes use it); the street's is the default.
// --skip runs the town that many seconds first (unphotographed); --every photographs only every n-th frame (a probe).
// Run it alone: a busy machine starves the software renderer.
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const site=fileURLToPath(new URL('../../',import.meta.url));
const args=process.argv.slice(2),opt={pos:'4,3.5,-36',at:'-12,2.8,-27.3',fps:'12',seconds:'16',skip:'0',every:'1',size:'1280x800',time:String(10002*1440+12*60)};
const rest=[];for(let i=0;i<args.length;i++){if(args[i].startsWith('--'))opt[args[i].slice(2)]=args[++i];else rest.push(args[i]);}
const out=resolve(rest[0]||'output/office-street');await mkdir(out,{recursive:true});
const [W,H]=opt.size.split('x').map(Number),fps=+opt.fps,frames=Math.round(+opt.seconds*fps),every=+opt.every;
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.svg':'image/svg+xml','.hdr':'application/octet-stream','.wasm':'application/wasm'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://x').pathname);
 const file=resolve(site,'.'+(path.endsWith('/')?path+'index.html':path));if(!file.startsWith(site))throw Error('outside');
 res.writeHead(200,{'content-type':TYPES[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const t0=Date.now(),log=m=>console.log(((Date.now()-t0)/1000).toFixed(1)+'s',m),errors=[];
await (async()=>{try{
 const context=await browser.newContext({viewport:{width:W,height:H},serviceWorkers:'block'});
 await context.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:20',speed:1}));Element.prototype.requestFullscreen=async()=>{};});
 const page=await context.newPage();page.setDefaultTimeout(900000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit`);
 await page.locator('#enter:not([disabled])').waitFor();log('island ready');
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);log('playing');
 await page.addStyleTag({content:'body>*:not(#game){visibility:hidden!important}#game{visibility:visible!important}'});
 await page.evaluate(([t,pos,at])=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(t);a.camera={pos,at};a.hud?.photo?.(true);},[+opt.time,opt.pos.split(',').map(Number),opt.at.split(',').map(Number)]);
 if(opt.sweep){
  const [a,b]=opt.sweep.split('-').map(t=>{const [h,m]=t.split(':').map(Number);return h*60+m;});
  for(let m=a;m<=b;m+=15){
   const seen=await page.evaluate(async([t])=>{const A=window.__JOHANSSON_AUDIT__;A.setTime(t);const names=new Set(),moving=new Set();
    // The view's ground: ahead of the lens (4,-36) towards (-12,-27.3), and inside its width.
    const f=[-16,8.7],l=Math.hypot(...f);f[0]/=l;f[1]/=l;
    for(let s=0;s<40;s++){A.step(500);for(const c of window.__JOHANSSON_CAST__.takes){if(!c.visible||c.indoors||!c.at)continue;const dx=c.at[0]-4,dz=c.at[1]+36,ahead=dx*f[0]+dz*f[1],side=Math.abs(-dx*f[1]+dz*f[0]);
     if(ahead>3&&ahead<38&&side<ahead*.72){names.add(c.name);if(c.moving)moving.add(c.name);}}}
    return {names:[...names],moving:[...moving]};},[10002*1440+m]);
   console.log(String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'),JSON.stringify(seen));
  }
  process.exitCode=0;return;
 }
 // Let the street settle and fill, unphotographed.
 for(let s=0;s<+opt.skip;s++)await page.evaluate(()=>window.__JOHANSSON_AUDIT__.step(1000));
 // From here the town moves only when it is stepped: its own loop would draw every frame a second time, which in software
 // rendering is most of the cost. Each frame is read straight off the game's canvas, in the task that drew it.
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(300);
 for(let f=0;f<frames;f++){
  const shoot=f%every===0;
  const data=await page.evaluate(([ms,shoot])=>{const a=window.__JOHANSSON_AUDIT__;a.step(ms);if(!shoot)return null;a.render();return document.getElementById('game').toDataURL('image/png');},[1000/fps,shoot]);
  if(data)await writeFile(resolve(out,'frame-'+String(f).padStart(4,'0')+'.png'),Buffer.from(data.split(',')[1],'base64'));
  if(f%(fps*2)===0)log('frame '+f+' of '+frames);
 }
}finally{await writeFile(resolve(out,'capture.json'),JSON.stringify({opt,errors,seconds:(Date.now()-t0)/1000},null,1)+'\n');await browser.close();server.close();}})();
log(JSON.stringify({errors}));
