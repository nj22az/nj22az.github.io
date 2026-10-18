import {chromium} from 'playwright';
import {TownAuditSession} from './mcp/session.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const out=new URL('../docs/qa/fujita-sofa-camera/',import.meta.url);await mkdir(out,{recursive:true});
const report={gameCommit:process.env.AUDIT_GAME_COMMIT,physicalDevice:false,views:[],errors:[]};
const session=new TownAuditSession({launch:async options=>{
 const b=await chromium.launch({...options,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const create=b.newContext.bind(b);b.newContext=o=>create({...o,...(o.isMobile?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'}:{})});return b;
}});
try{
 for(const viewport of ['phone','desktop']){
  await session.start({viewport,spawn:'pier',time:'15:00'});const page=session.page;
  await page.evaluate(async()=>{const a=window.__JOHANSSON_AUDIT__;if(!await a.world.portShed.boat.ready)throw Error('Hull failed');a.setTime(900);a.camera=null;a.teleport(-40.18,-57.05,0);a.step(1500);});
  const capture=async name=>{
   const state=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,s=a.world.portShed,roofs=[];s.boat.group.traverse(o=>{if(o.userData.houseboatRoof)roofs.push(o.visible);});return {routine:s.routine.state,position:s.fujita.getWorldPosition(s.fujita.position.clone()).toArray(),roofs,player:a.player,lens:a.lens,mouse:a.mouse};});
   await page.screenshot({path:new URL(viewport+'-'+name+'.png',out).pathname});report.views.push({viewport,name,state});console.log(viewport,name,JSON.stringify(state));
  };
  await capture('normal-cabin-camera');
  await session.input({control:'view',durationMs:17});await page.evaluate(()=>window.__JOHANSSON_AUDIT__.step(200));await capture('alternate-cabin-camera');
  await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(1410);a.step(45000);a.camera={pos:[-40.5,6.3,-57.7],at:[-40.5,.5,-57.7]};a.step(0);});await capture('sleep-overhead');
  report.errors.push({viewport,errors:session.errors});await session.close();
 }
 report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;try{await session.page?.screenshot({path:new URL('failure.png',out).pathname});}catch{}process.exitCode=1;}
finally{await session.close();await writeFile(new URL('report.json',out),JSON.stringify(report,null,2));}
