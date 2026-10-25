// Built-game evidence for owner-approved JW-PH-001 C, software Chromium, no physical-device claim.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),site=resolve(root,'..'),out=resolve(root,'docs/seawall-photo/game-review');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.wasm':'application/wasm','.hdr':'application/octet-stream'};
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://x'),path=resolve(site,'.'+(url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname));if(!path.startsWith(site+'/'))throw Error('path');const bytes=await readFile(path);res.writeHead(200,{'content-type':types[extname(path)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const portraitOnly=process.argv.includes('--portrait-only');
const errors=[],report={softwareChromium:true,physicalDevice:false,errors,captures:[]};
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});await ctx.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:20',speed:1}));Element.prototype.requestFullscreen=async()=>{};});
 const page=await ctx.newPage();page.setDefaultTimeout(480000);page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE_ERROR',e.message);});
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit&seawall-photo`);console.log('loaded');await page.locator('#enter:not([disabled])').waitFor();console.log('island-ready');await page.locator('#enter').click();await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);console.log('playing');
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(10002*1440+720);a.teleport(-37.1,-6.65,Math.PI/2);});
 const style=await page.addStyleTag({content:'body>*:not(#game){visibility:hidden!important}#game{visibility:visible!important}'});
 async function shot(name,pos,at){await page.evaluate(({pos,at})=>{const a=window.__JOHANSSON_AUDIT__;a.camera={pos,at};a.render();},{pos,at});await page.locator('#game').screenshot({path:resolve(out,name+'.png')});report.captures.push(name);console.log('capture',name);}
 if(!portraitOnly){await shot('01-island-overview',[-23,15,-24],[-44,0,-4]);
 await shot('02-pier-entrance',[-36,1.65,-12],[-48,1,-12]);
 await shot('03-photo-bay',[-35.3,1.22,-6.65],[-40,.8,-7.05]);
 }
 await style.evaluate(el=>el.remove());
 await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.camera=null;return window.__JOHANSSON_AUDIT__.photo();});
 await page.locator('#photoStudio:not([hidden])').waitFor();
 await page.locator('#photoStudio [data-tab="place"]').click();await page.locator('[data-location="photo-nishi-overlook"]').click();await page.waitForFunction(()=>document.querySelector('#photoStudio .photo-status')?.textContent==='Nishi seawall portrait');console.log('photo-preset');
 await page.locator('#photoStudio [data-tab="cast"]').click();
 // Existing cast remains when changing locations; select a single Thuận for the owner's reference composition.
 await page.locator('#photoStudio [name="actor"]').selectOption('0');await page.locator('#photoStudio [data-remove]').click();
 await page.locator('#photoStudio [name="actorX"]').evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.locator('#photoStudio [name="actorZ"]').evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.locator('#photoStudio [name="pose"]').selectOption('Coy');await page.locator('#photoStudio [data-face]').click();
 await page.evaluate(()=>window.__JOHANSSON_AUDIT__.render());await page.waitForTimeout(500);
 await page.locator('#game').screenshot({path:resolve(out,'04-thuan-square-portrait.png')});report.captures.push('04-thuan-square-portrait');
 await page.screenshot({path:resolve(out,'05-photo-studio-controls.png')});report.captures.push('05-photo-studio-controls');
 await page.locator('#photoStudio [data-capture]').click();await page.waitForFunction(()=>document.querySelector('#photoStudio [data-count]')?.textContent==='1');console.log('capture-export');
 const saved=await page.locator('#photoStudio .photo-film figure img').evaluate(async img=>{const blob=await (await fetch(img.src)).blob();return await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);});});await writeFile(resolve(out,'04-thuan-square-portrait.png'),Buffer.from(saved.split(',')[1],'base64'));report.cleanExport=true;
 await page.locator('#photoStudio [data-close]').click();await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.photoActive);
 report.returned=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.player);
 if(!portraitOnly){await page.setViewportSize({width:1024,height:768});
 const tabletStyle=await page.addStyleTag({content:'body>*:not(#game){visibility:hidden!important}#game{visibility:visible!important}'});
 await shot('06-tablet-entrance',[-36,1.65,-12],[-48,1,-12]);await tabletStyle.evaluate(el=>el.remove());
 }
 report.render=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.renderInfo);
}finally{await writeFile(resolve(out,portraitOnly?'portrait-export-report.json':'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
if(errors.length)process.exitCode=1;
