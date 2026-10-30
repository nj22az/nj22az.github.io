import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
// Kissa Higa in the running game (the built runtime, ?audit): the player stands on the pavement outside at 07:40 on a
// Tuesday, the simulation runs, and the tool reports where Grandmother Higa and the regulars are (place, position, seat
// height, the height of every foot bone) and photographs the room, the counter and the stools from the side; then the
// bench out front at 19:40, Tetsuo and Mac on seats the town already uses, measured the same way as a baseline.
// The residents walk in because the player is near (people/attention.js); swiftshader in a cloud session. Not a
// physical-device check.
//   node tools/kissa-higa-live.mjs [out-dir] [repo-root]
const out=resolve(process.argv[2]||'docs/qa/kissa-higa/live'),root=resolve(process.argv[3]||'..');
await mkdir(out,{recursive:true});
const port=8790+Math.floor(Math.random()*90);
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,800));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:960,height:640},serviceWorkers:'block'});
 await context.addInitScript(()=>{try{localStorage.clear();}catch{}Object.defineProperty(navigator,'getGamepads',{value:()=>[]});});
 const page=await context.newPage();page.setDefaultTimeout(900000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/Kissa Higa/.test(m.text()))errors.push(m.text());});
 await page.goto(`http://127.0.0.1:${port}/johansson-town/?audit`,{waitUntil:'domcontentloaded'});
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__,null,{timeout:900000});
 // Town day 5 (6 January 1970) is a Tuesday.
 const TUE=5*1440;
 // Who is where: the place, the position, the seat height, and every foot and toe bone's height (the lowest of them is
 // where the shoe meets the floor, or does not).
 const census=place=>page.evaluate(async place=>{
  const a=window.__JOHANSSON_AUDIT__,T=await import('./vendor/three.module.js'),people=[];
  a.scene.traverse(o=>{if(o.userData?.place!==place||!o.visible)return;const p=o.getWorldPosition(new T.Vector3()),bones={};
   o.traverse(b=>{if(b.isBone&&/foot|toe|ankle/i.test(b.name))bones[b.name]=+b.getWorldPosition(new T.Vector3()).y.toFixed(3);});
   const ys=Object.values(bones);
   people.push({name:o.name||o.userData.name||null,activity:o.userData.activity,at:[+p.x.toFixed(2),+p.y.toFixed(3),+p.z.toFixed(2)],seatHeight:o.userData.seatHeight??null,
    lowestFootBone:ys.length?Math.min(...ys):null,footBones:bones});});
  return people;},place);
 const run=(minutes,steps)=>page.evaluate(({minutes,steps})=>{const a=window.__JOHANSSON_AUDIT__;a.setTime(minutes);a.teleport(4.9,8.4,Math.PI/2);for(let i=0;i<steps;i++)a.step(2500);},{minutes,steps});
 // 07:25, everyone set walking; then on to 07:40 and two and a half minutes more, so they have arrived and sat down.
 await run(TUE+7*60+25,4);await run(TUE+7*60+40,60);
 const morning=await census('kissa-higa');
 const shots=[['01-live-room-0740',{pos:[6.3,1.6,9.2],at:[9.6,.8,7.6]}],['02-live-counter-0740',{pos:[8.0,1.35,7.9],at:[10.2,.9,7.3]}],['03-live-street-0740',{pos:[1.4,1.7,8.6],at:[8.6,1.2,8.2]}],
  ['04-live-stools-side-0740',{pos:[8.65,.95,9.1],at:[9.11,.42,6.6]}]];
 for(const [name,view] of shots){await page.evaluate(v=>{const a=window.__JOHANSSON_AUDIT__;a.camera=v;a.hud?.photo?.(true);a.render();},view);await page.locator('canvas').first().screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:86});console.log('wrote',name);}
 // The baseline: the bench out front at 19:40, Tetsuo on the bench (0.44 m) and Mac on a crate (0.31 m), seats the town
 // already uses, measured the same way.
 await run(TUE+19*60+40,40);
 const evening=await census('higa-bench');
 await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera={pos:[3.0,.9,11.6],at:[5.0,.4,9.8]};a.render();});
 await page.locator('canvas').first().screenshot({path:`${out}/05-live-bench-baseline-1940.jpg`,type:'jpeg',quality:86});
 const report={time:'Tuesday (town day 5): 07:42 at Kissa Higa, 19:41 on the bench outside',viewport:[960,640],physicalDevice:false,morning,evening,errors};
 await writeFile(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({morning,evening},null,1));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
