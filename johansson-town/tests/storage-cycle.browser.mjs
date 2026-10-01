import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json'),{chromium}=require('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),evidence=new URL('./evidence/storage-night/',import.meta.url);await mkdir(evidence,{recursive:true});
const reports=[];
for(const [width,height] of [[1440,1000],[390,844]]){
 const browser=await chromium.launch({executablePath:process.env.STORAGE_CHROME||chromium.executablePath(),args:['--no-sandbox','--single-process','--no-zygote','--disable-gpu-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width,height},hasTouch:width===390});page.setDefaultTimeout(60000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{if(location.pathname==='/johansson-town/')history.replaceState(null,'','?audit');Object.defineProperty(navigator,'getGamepads',{value:()=>[]});Element.prototype.requestFullscreen=async()=>{};const add=window.addEventListener.bind(window);window.addEventListener=(type,...args)=>{if(!type.startsWith('gamepad'))add(type,...args);};});
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='town.test')return route.abort();let path=u.pathname;if(path.endsWith('/'))path+='index.html';try{
 let body=await readFile(root+path);
 // Test-only access to the published storage closure: advance its real fixed-step
 // simulation and position the player; no thief, inventory or reward logic is replaced.
 if(path.includes('/assets/storage-')&&path.endsWith('.js')){
 let code=body.toString();const marker='  resetPosition();restoreCheckpoint(resumeData);resize();';assert.ok(code.includes(marker));
 code=code.replace(marker,`window.__STORAGE_AUDIT__={advance(n){for(let i=0;i<Math.ceil(n*60);i++)step(1/60);checkpoint();emitHud();},at(x,z){px=x;pz=z;},get data(){return {time,phase,shooed,yenFound,px,pz,reaction,items:world.items.map(i=>({id:i.id,taken:!!i.taken,lost:!!i.lost,x:i.x,z:i.z})),visitors:intruders.map(v=>({state:v.state,x:v.x,z:v.z,carrying:v.carrying?.id})),draws:renderer.info.render.calls};}};\n${marker}`);
 code=code.replace('((n.current = t), a(`ready`));','((n.current = t), window.__STORAGE_GAME__=t, a(`ready`));');body=Buffer.from(code);
 }
 await route.fulfill({body,contentType:path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.html')?'text/html':path.endsWith('.json')?'application/json':'application/octet-stream'});
 }catch(e){console.log('route failure',path,e.message);await route.fulfill({status:404,body:''});}});

 await page.goto('http://town.test/johansson-town/?audit');await page.locator('[data-town-enter]').first().click();await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);
 const setTime=async name=>{if(!await page.locator('#directory').isVisible())await page.locator('#directoryButton').click();await page.locator('#timeButton').click();await page.getByRole('button',{name,exact:true}).click();if(await page.locator('#directory').isVisible())await page.locator('#closeDirectory').click();};
 await setTime('Set to 22:00');
 // A previously stolen tea carton must remain sold out through automatic shifts.
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,s=a.activities.state;s.yen=1000;s.sakura.stock.tea={shelf:0,reserve:24};s.sakura.caveCartons=['tea'];s.sakura.caveCartonUnits={tea:12};a.activities.save();});
 console.log(width,'night cycle started');const nights=[];
 for(let night=0;night<2;night++){
  const day=await page.evaluate(()=>Math.floor(window.__JOHANSSON_POSE__.minutes/1440));
  await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.action('storage-restock'));await page.getByRole('button',{name:'Let Thuan restock',exact:true}).click();
  await page.waitForFunction(()=>window.__STORAGE_GAME__&&window.__STORAGE_AUDIT__.data.phase==='playing');
  const result=await page.evaluate(()=>{window.__STORAGE_AUDIT__.advance(300);return window.__STORAGE_AUDIT__.data;});assert.equal(result.phase,'won');
  await page.waitForURL('**/johansson-town/**');await page.locator('[data-town-enter]').first().click();await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);
  const state=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__JOHANSSON_AUDIT__.activities.state)));assert.equal(state.sakura.storageRewardDay,day);assert.equal(state.sakura.stock.tea.shelf,0);assert.equal(state.sakura.caveCartonUnits.tea,12);assert.equal(state.yen,1000+nights.reduce((sum,n)=>sum+n.yen,0)+result.yenFound);
  assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.consumeStorageRestock()),false);
  console.log(width,'completed night',day);nights.push({day,yen:result.yenFound,shooed:result.shooed});
  if(night===0){await setTime('Set to 06:00');assert.equal(await page.evaluate(()=>Math.floor(window.__JOHANSSON_POSE__.minutes/1440)),day+1);await setTime('Set to 22:00');}
 }
 assert.equal(nights[1].day,nights[0].day+1);assert.deepEqual(errors,[]);reports.push({viewport:[width,height],nights,checks:'actual TIME menu night/morning/next night, real automatic stockroom routing and return, once-per-night balance, pending tea carton never resurrected',errors});console.log(JSON.stringify(reports.at(-1)));
 }finally{await browser.close();}
}
await writeFile(new URL('cycle-acceptance.json',evidence),JSON.stringify(reports,null,2)+'\n');
