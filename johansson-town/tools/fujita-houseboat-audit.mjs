import {chromium} from 'playwright';
import {TownAuditSession} from './mcp/session.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const session=new TownAuditSession({launch:async o=>{
 const browser=await chromium.launch({...o,...(process.env.TOWN_AUDIT_CHROMIUM?{executablePath:process.env.TOWN_AUDIT_CHROMIUM,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']}: {})}),create=browser.newContext.bind(browser);
 browser.newContext=async config=>{const context=await create(config);await context.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));return context;};return browser;
}});
const out=new URL('../docs/qa/fujita-houseboat/',import.meta.url);await mkdir(out,{recursive:true});const report={screens:[],externalFonts:'Google font CSS stubbed because the execution network blocks it; local fallback fonts used.'};
try{
 for(const viewport of ['desktop','phone']){
  console.log('Starting',viewport);await session.start({viewport,spawn:'pier',time:'23:29'});const page=session.page;
  await page.evaluate(async()=>{const a=window.__JOHANSSON_AUDIT__;if(!await a.world.portShed.boat.ready)throw Error('Hull failed to load');a.teleport(-37.5,-54.2,0);a.camera={pos:[-47,6,-49],at:[-38.5,.8,-57]};a.setTime(1409);a.step(0);});
  await page.screenshot({path:new URL(`${viewport}-evening.png`,out).pathname});
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(900);a.step(0);});await page.screenshot({path:new URL(`${viewport}-day.png`,out).pathname});
  await page.evaluate(()=>window.__JOHANSSON_AUDIT__.setTime(1410));const steps=[];
  for(let i=0;i<38;i++){steps.push(await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.step(1000);const s=a.world.portShed;return {state:s.routine.state,position:s.fujita.getWorldPosition(s.fujita.position.clone()).toArray(),held:s.fujita.userData.heldItem};}));if(i===11)await page.screenshot({path:new URL(`${viewport}-boarding.png`,out).pathname});}
  assert.equal(steps.at(-1).state,'sleeping');assert.equal(steps.at(-1).held,undefined);
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera={pos:[-44.5,4,-53.6],at:[-40.7,.7,-57.5]};a.step(0);});await page.screenshot({path:new URL(`${viewport}-berth.png`,out).pathname});
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;a.teleport(-37.5,-54.2,Math.PI/2);a.step(0);});
  const gangway=await session.walk({x:-40.2,z:-54.2,maxSeconds:12,tolerance:.2});assert.equal(gangway.reached,true,'gangway controls');
  const deck=await session.walk({x:-39.85,z:-55.35,maxSeconds:8,tolerance:.2});assert.equal(deck.reached,true,'bow deck');
  const door=await session.walk({x:-39.85,z:-56.35,maxSeconds:8,tolerance:.2});assert.equal(door.reached,true,'cabin door');
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(360);for(let i=0;i<38;i++)a.step(1000);});
  const final=await session.observe(),routine=await page.evaluate(()=>window.__JOHANSSON_AUDIT__.world.portShed.routine.state);assert.equal(routine,'watching');assert.deepEqual(final.invalidTransforms,[]);
  const expectedAssetCancellations=final.errors.filter(e=>e.type==='request'&&e.message.endsWith('net::ERR_ABORTED')),errors=final.errors.filter(e=>!expectedAssetCancellations.includes(e));assert.deepEqual(errors,[]);
  report.screens.push({viewport,steps,walk:{gangway:gangway.reached,deck:deck.reached,door:door.reached},routine,errors,expectedAssetCancellations,invalidTransforms:final.invalidTransforms});await session.close();console.log('Passed',viewport);
 }
 report.passed=true;
}catch(e){report.passed=false;report.error=e.stack;try{await session.page?.screenshot({path:new URL('failure.png',out).pathname});}catch{};process.exitCode=1;}
finally{await session.close();await writeFile(new URL('report.json',out),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,error:report.error?.split('\n')[0]}));}
