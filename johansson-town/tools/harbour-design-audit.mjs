import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const label=process.argv[2]||'after';const out='../output/playwright/harbour-truck';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal']});
const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto('http://127.0.0.1:8767/johansson-town/?audit&visual-audit&cinematic=off');
await page.waitForFunction(()=>window.__JOHANSSON_MODEL__?.ready===true,{timeout:180000});
await page.locator('#enter').click();await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__);
await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(900);document.querySelector('#hud').style.display='none';document.querySelector('#mobile').style.display='none';});
for(const [name,pos,at] of [['quay',[-24,3.6,-49],[-36,1,-58]],['truck',[-16,2.5,-49.7],[-19.1,1,-46.8]],['boardwalk',[-32.5,2.8,-63],[-36,.3,-54]],['truck-detail',[-16.5,2.4,-51.8],[-19.1,1,-46.8]]]){
 await page.evaluate(({pos,at})=>{const a=window.__JOHANSSON_AUDIT__;a.camera={pos,at};a.render();},{pos,at});await page.screenshot({path:out+'/'+label+'-'+name+'.png'});
}
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera={pos:[-29,3,-49.5],at:[-36,1,-58]};a.render();});await page.screenshot({path:out+'/'+label+'-phone.png'});
await writeFile(out+'/'+label+'-report.json',JSON.stringify({errors},null,2));await browser.close();if(errors.length)throw Error(errors.join('\n'));
