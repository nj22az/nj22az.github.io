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
 const stockroom='http://town.test/thuans-storage/?from=johansson-town&mode=play&day=2&player=player-1';
 const town=async()=>{await page.goto('http://town.test/johansson-town/?audit');await page.locator('[data-town-enter]').first().click();await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.roomLoading&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);};
 console.log(width,'initial town');await town();console.log(width,'initial town ready');const before=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.activities.state.yen=1000;a.activities.save();return JSON.parse(JSON.stringify(a.activities.state.sakura.stock));});
 console.log(width,'storage enter');await page.goto(stockroom);await page.waitForFunction(()=>window.__STORAGE_GAME__&&window.__STORAGE_AUDIT__.data.phase==='playing');
 await page.evaluate(()=>{const g=window.__STORAGE_GAME__,a=window.__STORAGE_AUDIT__;g.restart(7);g.start();a.advance(13);const v=a.data.visitors.find(v=>v.state==='raid');a.at(v.x,v.z);a.advance(.05);});
 let data=await page.evaluate(()=>window.__STORAGE_AUDIT__.data);assert.match(data.reaction,/bops Thuan/);
 if(width===390)await page.locator('.storage-shoo').tap();else await page.keyboard.down('f');
 await page.evaluate(()=>window.__STORAGE_AUDIT__.advance(.1));assert.equal(await page.evaluate(()=>window.__STORAGE_AUDIT__.data.yenFound),50);
 await page.keyboard.up('f');await page.evaluate(()=>window.__STORAGE_AUDIT__.advance(2));
 if(width===390)await page.locator('.storage-shoo').tap();else await page.keyboard.press('f');
 await page.evaluate(()=>window.__STORAGE_AUDIT__.advance(.1));assert.equal(await page.evaluate(()=>window.__STORAGE_AUDIT__.data.yenFound),50,'one visitor cannot pay twice');
 await page.screenshot({path:fileURLToPath(new URL(`shoo-${width}.png`,evidence))});
 await page.evaluate(()=>window.__STORAGE_AUDIT__.at(-9,-10.5));await page.evaluate(()=>window.__STORAGE_AUDIT__.advance(100));
 data=await page.evaluate(()=>window.__STORAGE_AUDIT__.data);const lost=data.items.filter(i=>i.lost).map(i=>i.id);assert.ok(lost.length>0);
 console.log(width,'reload');await page.reload();await page.waitForFunction(()=>window.__STORAGE_AUDIT__?.data.phase==='playing');let resumed=await page.evaluate(()=>window.__STORAGE_AUDIT__.data);assert.deepEqual(resumed.items.filter(i=>i.lost).map(i=>i.id),lost);assert.equal(resumed.yenFound,50);assert.ok(resumed.time>=data.time);
 console.log(width,'town revisit');await town();console.log(width,'town revisit ready');assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.state.yen),1000,'incomplete event must not pay');
 console.log(width,'storage enter');await page.goto(stockroom);await page.waitForFunction(()=>window.__STORAGE_AUDIT__?.data.phase==='playing');assert.deepEqual(await page.evaluate(()=>window.__STORAGE_AUDIT__.data.items.filter(i=>i.lost).map(i=>i.id)),lost);
 await page.evaluate(()=>{window.__STORAGE_GAME__.autoRestock();window.__STORAGE_AUDIT__.advance(250);});
 console.log(width,'waiting handoff');await page.waitForURL('**/johansson-town/**');await page.locator('[data-town-enter]').first().click();await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);
 console.log(width,'handoff ready');const result=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__JOHANSSON_AUDIT__.activities.state)));assert.equal(result.yen,1050);assert.ok(result.sakura.caveCartons.length);
 for(const id of result.sakura.caveCartons)assert.equal(result.sakura.stock[id].shelf,0);
 assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.consumeStorageRestock()),false);
 console.log(width,'town revisit');await town();console.log(width,'town revisit ready');assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.state.yen),1050);
 // Enter and exit the actual cave, and open the real chest interaction twice.
 assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.use('Go into the old sea cave')),true);
 await page.waitForFunction(()=>window.__JOHANSSON_AUDIT__.layout?.dungeon&&!window.__JOHANSSON_AUDIT__.blocked.roomLoading);
 console.log(width,'cave ready');const cave=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,d=a.layout.dungeon;const chest=d.chests.find(c=>!c.weapon);chest.mesh.userData.hit.fn();const count=d.run.recovered.length;chest.mesh.userData.hit.fn();return {id:d.run.recovered[0].id,count,after:d.run.recovered.length};});assert.equal(cave.count,1);assert.equal(cave.after,1);
 await page.screenshot({path:fileURLToPath(new URL(`cave-${width}.png`,evidence))});await page.evaluate(()=>window.__JOHANSSON_AUDIT__.leave());await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.room.visible);
 const recovered=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__JOHANSSON_AUDIT__.activities.state.sakura)));assert.equal(recovered.stock[cave.id].shelf,12);assert.ok(!recovered.caveCartons.includes(cave.id));
 console.log(width,'town revisit');await town();console.log(width,'town revisit ready');assert.equal(await page.evaluate(id=>window.__JOHANSSON_AUDIT__.activities.state.sakura.stock[id].shelf,cave.id),12);
 // The real Photo Studio menu and warehouse remain usable.
 await page.locator('#directoryButton').click();await page.locator('#photoButton').click();await page.locator('#photoStudio').waitFor({state:'visible'});await page.getByRole('button',{name:'Return to town',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.use('Enter Harbour Warehouse')),true);await page.waitForFunction(()=>window.__JOHANSSON_AUDIT__.room.visible&&!window.__JOHANSSON_AUDIT__.blocked.roomLoading);await page.evaluate(()=>window.__JOHANSSON_AUDIT__.leave());
 assert.deepEqual(errors,[]);reports.push({viewport:[width,height],lost,shooReward:50,recovered:cave.id,checks:'spawn, collision bop, keyboard/touch shoo, no duplicate reward, reload, mid-event exit/return, actual town hand-off, sold-out shelves, actual cave chest/exit/reload, Photo Studio and warehouse',errors});console.log(JSON.stringify(reports.at(-1)));
 }finally{await browser.close();}
}
await writeFile(new URL('acceptance.json',evidence),JSON.stringify(reports,null,2)+'\n');
