import {chromium} from 'playwright';
import {TownAuditSession} from './mcp/session.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('../docs/qa/fujita-sofa-capture/',import.meta.url);
await mkdir(out,{recursive:true});
const report={testedGameCommit:process.env.AUDIT_GAME_COMMIT,runnerCommit:process.env.GITHUB_SHA,physicalDevice:false,views:[],errors:[]};
const session=new TownAuditSession({launch:async options=>{
 const browser=await chromium.launch({...options,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const create=browser.newContext.bind(browser);
 browser.newContext=options=>create({...options,...(options.isMobile?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'}:{})});
 return browser;
}});
try{
 for(const viewport of ['desktop','phone']){
  console.log('Starting',viewport);
  await session.start({viewport,spawn:'pier',time:'15:00'});
  const page=session.page;
  await page.evaluate(async()=>{
   const a=window.__JOHANSSON_AUDIT__;
   if(!await a.world.portShed.boat.ready)throw Error('Loaded houseboat hull unavailable');
   a.teleport(-37.5,-54.2,0);a.setTime(900);a.step(0);
  });
  const capture=async(name,camera)=>{
   if(camera)await page.evaluate(camera=>{const a=window.__JOHANSSON_AUDIT__;a.camera=camera;a.step(0);a.render();},camera);
   await page.waitForTimeout(250);
   const state=await page.evaluate(()=>{
    const a=window.__JOHANSSON_AUDIT__,s=a.world.portShed,roofs=[],bad=[];
    a.scene.updateMatrixWorld(true);a.scene.traverse(o=>{if(!o.matrixWorld.elements.every(Number.isFinite))bad.push(o.name);});
    s.boat.group.traverse(o=>{if(o.userData.houseboatRoof)roofs.push(o.visible);});
    return {routine:s.routine.state,position:s.fujita.getWorldPosition(s.fujita.position.clone()).toArray(),sleeping:s.fujita.userData.sleeping,roofs,bad,player:JSON.parse(window.render_game_to_text()).player,lens:a.lens,drawCalls:a.renderer.info.render.calls};
   });
   const file=viewport+'-'+name+'.png';
   await page.screenshot({path:new URL(file,out).pathname});
   report.views.push({viewport,name,file,state});
   console.log('Captured',file,JSON.stringify(state));
  };
  await capture('exterior-day',{pos:[-46.4,5,-50.8],at:[-40.2,.8,-56.7]});
  await capture('stern-day',{pos:[-44.5,3.6,-63.4],at:[-40.5,.7,-58.5]});
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(1410);for(let i=0;i<45;i++)a.step(1000);});
  await capture('sleep-night',{pos:[-43.7,3.6,-54.3],at:[-40.9,.85,-58.2]});
  await capture('sleep-overhead',{pos:[-40.5,7,-57.7],at:[-40.5,0,-57.7]});
  // Staged daylight inspection of the same sleeping pose; no claim that Fujita sleeps by day.
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(900);a.step(0);a.world.portShed.tick(0,1410);a.render();});
  await capture('sleep-staged-daylight',{pos:[-42.9,3.2,-54.8],at:[-40.9,.8,-58.1]});
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;a.teleport(-40.18,-57.05,0);a.step(0);});
  await capture('cabin-pedestrian');
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;a.teleport(-37.5,-54.2,Math.PI/2);a.setTime(900);a.step(0);});
  if(viewport==='desktop'){
   const route=[];
   for(const point of [{x:-40.2,z:-54.2},{x:-39.85,z:-55.35},{x:-39.85,z:-56.35},{x:-40.18,z:-57.05},{x:-39.85,z:-56.35},{x:-39.85,z:-55.35},{x:-40.2,z:-54.2},{x:-37.5,z:-54.2}]){
    const result=await session.walk({...point,maxSeconds:12,tolerance:.18});
    route.push({point,reached:result.reached,reason:result.reason});
    if(!result.reached)break;
   }
   report.walk=route;
  }
  await capture('gangway-approach',{pos:[-35.5,2,-52.7],at:[-40.1,.7,-55.6]});
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(360);for(let i=0;i<45;i++)a.step(1000);});
  await capture('wake-return',{pos:[-45.8,5,-51.4],at:[-38.5,.7,-56.7]});
  await capture('harbour-overhead',{pos:[-40,30,-36],at:[-30,0,-56]});
  report.errors.push({viewport,errors:session.errors});
  report.sourceHash=JSON.parse(await readFile(new URL('../runtime/source.json',import.meta.url),'utf8'));
  await session.close();
 }
 assert.ok(report.views.every(v=>v.state.bad.length===0&&v.state.drawCalls>0),'Finite nonempty renders');
 assert.ok(report.walk.every(p=>p.reached),'Complete desktop walk out and back');
 for(const v of report.views.filter(v=>v.name==='sleep-night'))assert.equal(v.state.routine,'sleeping','Night arrival');
 for(const v of report.views.filter(v=>v.name==='wake-return'))assert.equal(v.state.routine,'watching','06:00 return');
 report.passed=true;
}catch(error){
 report.passed=false;report.failure=error.stack;
 try{await session.page?.screenshot({path:new URL('failure.png',out).pathname});}catch{}
 process.exitCode=1;
}finally{await session.close();await writeFile(new URL('capture-report.json',out),JSON.stringify(report,null,2));}
