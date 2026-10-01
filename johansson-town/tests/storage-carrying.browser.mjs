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
 const stockroom='http://town.test/thuans-storage/?from=johansson-town&mode=play&day=3&player=player-1';
 await page.goto(stockroom);await page.waitForFunction(()=>window.__STORAGE_GAME__&&window.__STORAGE_AUDIT__.data.phase==='playing');
 const stolen=await page.evaluate(()=>{const g=window.__STORAGE_GAME__,a=window.__STORAGE_AUDIT__;g.restart(7);g.start();for(let i=0;i<100&&!a.data.visitors.some(v=>v.carrying);i++)a.advance(1);const v=a.data.visitors.find(v=>v.carrying);a.at(v.x,v.z);return v.carrying;});assert.ok(stolen);
 if(width===390)await page.locator('.storage-shoo').tap();else await page.keyboard.down('f');
 await page.evaluate(()=>window.__STORAGE_AUDIT__.advance(.1));await page.keyboard.up('f');
 // A drop is snapped to a clear floor cell; approach that cell to collect it.
 await page.evaluate(id=>{const a=window.__STORAGE_AUDIT__,item=a.data.items.find(i=>i.id===id);a.at(item.x,item.z);a.advance(.1);},stolen);
 let data=await page.evaluate(()=>window.__STORAGE_AUDIT__.data);assert.equal(data.yenFound,50);assert.equal(data.items.find(i=>i.id===stolen).taken,true);assert.equal(data.items.find(i=>i.id===stolen).lost,false);
 await page.evaluate(()=>window.__STORAGE_AUDIT__.advance(1));
 if(width===390)await page.locator('.storage-shoo').tap();else await page.keyboard.down('f');
 await page.evaluate(()=>window.__STORAGE_AUDIT__.advance(.1));await page.keyboard.up('f');assert.equal(await page.evaluate(()=>window.__STORAGE_AUDIT__.data.yenFound),50);
 await page.reload();await page.waitForFunction(()=>window.__STORAGE_AUDIT__?.data.phase==='playing');assert.equal(await page.evaluate(()=>window.__STORAGE_AUDIT__.data.yenFound),50);assert.equal(await page.evaluate(id=>window.__STORAGE_AUDIT__.data.items.find(i=>i.id===id).taken,stolen),true);
 await page.screenshot({path:fileURLToPath(new URL(`dropped-carton-${width}.png`,evidence))});
 await page.goto(stockroom.replace('day=3','day=4'));await page.waitForFunction(()=>window.__STORAGE_AUDIT__?.data.phase==='playing');assert.equal(await page.evaluate(()=>window.__STORAGE_AUDIT__.data.yenFound),0);assert.ok(await page.evaluate(()=>window.__STORAGE_AUDIT__.data.time<2));
 assert.deepEqual(errors,[]);reports.push({viewport:[width,height],stolen,checks:'carried carton drops and is collected once; second real keyboard/touch press cannot pay again; drop and coins survive reload; next-night checkpoint is independent',errors});console.log(JSON.stringify(reports.at(-1)));
 }finally{await browser.close();}
}
await writeFile(new URL('carrying-acceptance.json',evidence),JSON.stringify(reports,null,2)+'\n');
