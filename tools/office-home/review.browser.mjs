import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(process.env.OFFICE_TEST_RUNTIME+'/package.json'),{chromium}=require('playwright');
const root=resolve(process.env.OFFICE_SOURCE_ROOT),baseline=resolve(process.env.OFFICE_BASELINE_ROOT),out=resolve(process.env.OFFICE_OUTPUT);await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png','.mp4':'video/mp4'};
function serve(before=false){const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),relative=path.endsWith('/')?path+'index.html':path,file=resolve(root,'.'+relative);if(!file.startsWith(root+sep))throw Error();let b;if(before)try{b=await readFile(resolve(baseline,'.'+relative));}catch{}b??=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}});return new Promise(r=>server.listen(0,'127.0.0.1',()=>r({server,url:'http://127.0.0.1:'+server.address().port})));}
const old=await serve(true),current=await serve(),browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
async function pageFor(context,url){const page=await context.newPage();await page.route('**/*',r=>r.request().url().startsWith(url)?r.continue():r.abort());return page;}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await pageFor(context,old.url);await page.goto(old.url);await page.locator('.px-card').first().waitFor();const beforeHeight=await page.locator('#project-grid').evaluate(el=>el.getBoundingClientRect().height);await context.close();
 for(const [profile,width,height,zoom] of [['desktop',1440,1000,1],['ipad-portrait',768,1024,1],['ipad-landscape',1024,768,1],['phone',390,844,1],['small-phone',320,844,1],['desktop-200pct',1440,1000,2]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',hasTouch:profile!=='desktop'&&zoom===1}),page=await pageFor(context,current.url),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.goto(current.url);await page.locator('.px-card').first().waitFor();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'clarity');
  await page.evaluate(()=>localStorage.setItem('nj-theme','popwave'));await page.reload();await page.locator('.px-card').first().waitFor();assert.equal(await page.locator('html').getAttribute('data-theme'),'clarity','Homepage remains stable despite a saved alternate theme');assert.equal(await page.evaluate(()=>localStorage.getItem('nj-theme')),'popwave','Homepage preserves other-page preference');
  assert.equal(await page.locator('.px-card').count(),6);assert(!requests.some(u=>/harbour.scene.gz|three.module|\/johansson-town\/runtime\//.test(u)),'Apps and 3D remain deferred');
  if(zoom!==1)await page.evaluate(()=>document.documentElement.style.zoom='2');
  const headings=await page.locator('.office-heading,#project-heading').evaluateAll(els=>els.map(e=>getComputedStyle(e).color));assert.equal(headings[0],headings[1]);
  for(const [filter,count] of [['explore',1],['create',3],['learn',2],['all',6]]){await page.locator('[data-project-filter="'+filter+'"]').click();assert.equal(await page.locator('.px-card:visible').count(),count);assert.equal(await page.locator('[data-project-filter="'+filter+'"]').getAttribute('aria-pressed'),'true');}
  await page.locator('[data-town-light="night"]').click();assert.match(await page.locator('#px-town-view').getAttribute('src'),/night/);await page.locator('[data-town-light="day"]').click();
  const task=page.locator('#px-complete-preview');await task.click();assert.equal(await task.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#px-preview-due').innerText(),'01');await task.click();assert.equal(await page.locator('#px-preview-due').innerText(),'02');
  const details=page.locator('.px-card-camera summary');await details.focus();await page.keyboard.press('Enter');assert(await page.locator('.px-card-camera details').getAttribute('open')!==null);await page.keyboard.press('Enter');
  assert.equal(await page.locator('.px-private-course').getAttribute('href'),'https://sjoskolan-course-review.nils-johansson.chatgpt.site');assert.equal(await page.locator('.px-card-camera .px-mascot').getAttribute('src'),'/assets/mascots/tetsuo-teach.webp');
  for(const card of await page.locator('.px-card').all()){await card.scrollIntoViewIfNeeded();}
  await page.waitForFunction(()=>[...document.querySelectorAll('#project-grid img')].every(i=>i.complete&&i.naturalWidth>0),null,{timeout:15000});
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,gridHeight:document.querySelector('#project-grid').getBoundingClientRect().height,cards:[...document.querySelectorAll('.px-card')].map(c=>({title:c.querySelector('h3').textContent,height:c.getBoundingClientRect().height})),targets:[...document.querySelectorAll('#projects button,#projects summary,.px-open,.px-private-course')].filter(e=>e.getBoundingClientRect().width).map(e=>({label:e.textContent.trim().slice(0,45),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))}));
  assert(!layout.overflow,'No horizontal overflow: '+profile);assert(layout.targets.every(t=>t.width>=44&&t.height>=44),'44px controls: '+profile);
  if(profile==='desktop'){assert(layout.gridHeight<beforeHeight*.8,'Substantially shorter project grid');assert(layout.cards[0].height<750,'World media no longer dictates portrait-height card');}
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:resolve(out,profile+'-home.png')});await page.evaluate(()=>document.querySelector('#projects').scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:resolve(out,profile+'-projects.png')});
  assert.deepEqual(errors,[]);results.push({profile,width,height,zoom,result:'passed',layout});await context.close();
 }
 await writeFile(resolve(out,'results.json'),JSON.stringify({result:'passed',baselineDesktopGridHeight:beforeHeight,profiles:results},null,2));console.log(JSON.stringify({beforeHeight,profiles:results.map(x=>({profile:x.profile,gridHeight:x.layout.gridHeight}))}));
}finally{await browser.close();for(const s of [old.server,current.server]){s.closeAllConnections();await new Promise(r=>s.close(r));}}
