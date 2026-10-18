import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {PNG} from 'pngjs';
import {webkit} from 'playwright';
const out=resolve('docs/qa/sakura-internal-stairs');await mkdir(out,{recursive:true});
const report={engine:'Linux WebKit',physicalDevice:false,views:[]};let failure;
const browser=await webkit.launch({headless:true,env:{...process.env,LIBGL_ALWAYS_SOFTWARE:'1'}});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:'block',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/johansson-town/?audit',{waitUntil:'domcontentloaded'});await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_LOADING__.snapshot().completed===8);
 await page.evaluate(async()=>{const a=window.__JOHANSSON_AUDIT__;a.frozen=true;a.renderFrozen=true;await a.enter('market');a.setTime(720);});
 const H=4.01,route=[[3.8,0,-3.3],[3.8,0,-4.7],[2.95,0,-4.7],[2.95,0,-5.3],[-1.2,0,-5.3],[-1.2,0,-4.6],[-1.8,0,-4.6],[-4.5,H/2,-4.6],[-5.05,H/2,-4.6],[-5.05,H/2,-6.15],[-4.5,H/2,-6.15],[-1.8,H,-6.15],[-1.2,H,-6.15],[-1.2,H,-3.95],[-.8,H,-2.5]];
 const walk=async(points,minutes)=>{
  const frames=[];for(let j=1;j<points.length;j++){
   const [x,,z]=points[j-1],[tx,,tz]=points[j],len=Math.hypot(tx-x,tz-z),n=Math.ceil(len/.05),yaw=Math.atan2(x-tx,z-tz);
   for(let i=1;i<=n;i++)frames.push([len/(n*.05),0,yaw,0,0,x+(tx-x)*i/n,z+(tz-z)*i/n,1/60,0]);
  }
  const [x,y,z]=points[0],rec={version:1,step:1/60,start:{room:'market',x,y,z,yaw:0,pitch:0,minutes,weather:'sunny'},frames};
  const state=await page.evaluate(async rec=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;await a.replay.play(rec,{mode:'inputs'});a.step((rec.frames.length+1)*1000/60);return {player:a.player,replay:a.replay.status()};},rec);
  const end=points.at(-1);assert.ok(Math.hypot(state.player.position[0]-end[0],state.player.position[2]-end[2])<.1,JSON.stringify(state));assert.ok(Math.abs(state.player.position[1]-end[1])<.03,JSON.stringify(state));return state;
 };
 report.up=await walk(route,720);
 const capture=async(label,minutes,pos,at)=>{
  const state=await page.evaluate(({minutes,pos,at})=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(minutes);a.camera={pos,at};a.render();const fixtures=[];a.room.traverse(o=>{if(o.name==='Office fluorescent diffuser')fixtures.push({visible:o.visible,toneMapped:o.material.toneMapped});});return {player:a.player,fixtures,ink:window.__JOHANSSON_LOOK__.ink,gpuError:a.renderer.getContext().getError()};},{minutes,pos,at});
  assert.equal(state.ink,true);assert.equal(state.gpuError,0);assert.equal(state.fixtures.length,2);assert.ok(state.fixtures.every(f=>f.visible&&!f.toneMapped));
  const path=resolve(out,label+'.png');await page.locator('#game').screenshot({path});const png=PNG.sync.read(await readFile(path));let sum=0,n=0,min=255,max=0;
  for(let i=0;i<png.data.length;i+=64){const v=(png.data[i]+png.data[i+1]+png.data[i+2])/3;sum+=v;n++;min=Math.min(min,v);max=Math.max(max,v);}
  const mean=sum/n;assert.ok(mean>35&&max-min>96,label+' must show a legible drawn interior');report.views.push({label,minutes,mean,...state});
 };
 await capture('office-day',720,[.2,H+1.65,-2.7],[4.5,H+1.2,2.5]);
 await capture('office-midnight',30,[.2,H+1.65,-2.7],[4.5,H+1.2,2.5]);
 await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>{const c=document.querySelector('#game');return c.width>c.height;});
 await capture('office-overview-midnight',30,[5.7,H+2.2,3],[-3,H+.8,-3]);
 report.down=await walk([...route].reverse(),30);
 await capture('stairs-midnight',30,[-1.1,1.65,-4.6],[-4.9,2.7,-4.9]);
 await page.evaluate(async()=>{const a=window.__JOHANSSON_AUDIT__;a.leave();await a.enter('sakura-office');});
 report.outsideEntry=await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__,p=a.player;return {...p,floor:!!a.layout.walk.floorAt(...[p.position[0],p.position[2],p.position[1]])};});assert.equal(report.outsideEntry.room,'market');assert.equal(report.outsideEntry.floor,true);assert.ok(Math.abs(report.outsideEntry.position[1]-H)<.03);
 assert.deepEqual(errors,[]);await page.close();
}catch(error){failure=error;report.failure=error.stack;}
finally{await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
if(failure)throw failure;
