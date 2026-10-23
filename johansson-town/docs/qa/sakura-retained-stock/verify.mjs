// Reproduction: SAKURA_CHROME=/path/to/chrome-headless-shell node verify.mjs
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import os from 'node:os';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=process.env.SAKURA_PROJECT_ROOT||path.resolve(import.meta.dirname,'../../..'),out=process.env.SAKURA_EVIDENCE_DIR||path.join(os.tmpdir(),'sakura-retention-evidence');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{let p=path.resolve(root,'.'+decodeURI(req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.statusCode=403;return res.end();}if(p.endsWith(path.sep)||fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');try{res.setHeader('Content-Type',p.endsWith('.js')||p.endsWith('.mjs')?'text/javascript':p.endsWith('.html')?'text/html':p.endsWith('.webp')?'image/webp':'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.statusCode=404;res.end();}});
let browser;const report={errors:[],failedRequests:[],views:[]};
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.SAKURA_CHROME||chromium.executablePath(),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedRequests.push(r.url())});
 await page.goto(`http://127.0.0.1:${server.address().port}/docs/qa/sakura-retained-stock/`);
 await page.waitForFunction(()=>!!window.__SAKURA_REVIEW__,{timeout:30000});await page.waitForLoadState('networkidle');
 report.geometry=await page.evaluate(()=>{
  const r=window.__SAKURA_REVIEW__.root.userData.retention,e=r.envelopes;let overlaps=0,invalid=0,outside=0;
  for(let i=0;i<e.length;i++){
   const a=e[i];if([...a.min,...a.max].some(v=>!Number.isFinite(v)))invalid++;
   if(a.min[0]<0||a.max[0]>13.9||a.min[2]<-10.64||a.max[2]>0)outside++;
   for(let j=i+1;j<e.length;j++){const b=e[j];if(a.min.every((v,k)=>a.max[k]>b.min[k]+.0001&&b.max[k]>v+.0001))overlaps++;}
  }
  return{fingerprint:r.fingerprint,productLines:r.productLines,countedCapacity:r.countedCapacity,displayInstances:r.displayInstances,ids:r.records.map(p=>p.id),overlaps,invalid,outside};
 });
 for(const mode of ['iso','door','clerk','office','roof']){
  await page.evaluate(m=>window.__SAKURA_REVIEW__.setView(m),mode);
  report.views.push(await page.evaluate(()=>({draws:window.__SAKURA_REVIEW__.renderer.info.render.calls,triangles:window.__SAKURA_REVIEW__.renderer.info.render.triangles})));
 }
 // Editorial captures inside the actual prototype; no invented product artwork.
 await page.evaluate(()=>{document.getElementById('panel').open=false;const a=window.__SAKURA_REVIEW__;a.setView('iso');a.camera.position.set(17,14,11);a.camera.lookAt(6.95,.8,-5.5);a.renderer.render(a.scene,a.camera);});
 await page.screenshot({path:path.join(out,'Sakura-Retained-Overview.png')});
 await page.evaluate(()=>{const a=window.__SAKURA_REVIEW__;a.setView('door');a.camera.position.set(3.18,1.45,-1.5);a.camera.lookAt(3.18,1.1,-6.5);a.renderer.render(a.scene,a.camera);});
 await page.screenshot({path:path.join(out,'Sakura-Retained-Aisle.png')});
 await page.evaluate(()=>{const a=window.__SAKURA_REVIEW__;a.setView('door');a.camera.position.set(1.65,1.35,-3.5);a.camera.lookAt(.35,.96,-3.9);a.renderer.render(a.scene,a.camera);});
 await page.screenshot({path:path.join(out,'Sakura-Retained-Fresh.png')});
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>!!window.__SAKURA_REVIEW__);await page.waitForLoadState('networkidle');
 report.mobile=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,panelOpen:document.getElementById('panel').open}));
 await page.screenshot({path:path.join(out,'Sakura-Retained-Mobile.png')});
 report.scope='Standalone branch prototype, software Chromium. No live-game or physical-iPad acceptance.';
 fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 if(report.errors.length||report.failedRequests.length||report.geometry.overlaps||report.geometry.invalid||report.geometry.outside||report.geometry.productLines!==33||report.geometry.countedCapacity!==780||report.mobile.width!==390)throw Error('Retention acceptance failed');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
