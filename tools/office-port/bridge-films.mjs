// Reproduce the four bridge-wing films and their fallback from the baked ferry.
// Run bake.mjs first. Chrome, Playwright and ffmpeg are authoring tools only.
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
import {chromium} from '../../johansson-town/node_modules/playwright/index.mjs';
import {mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(new URL('../..',import.meta.url).pathname),server=await serveGame({root,mounts:['johansson-town','tools','assets']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
const run=args=>{const result=spawnSync('ffmpeg',['-v','error','-y',...args],{stdio:'inherit'});if(result.status)throw Error('Film encoding/verification failed');};
try{
 const page=await browser.newPage({viewport:{width:960,height:540}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(server.url+'tools/office-port/live-posters.html');await page.waitForFunction(()=>window.__READY__,null,{timeout:120000});
 await page.clock.install({time:new Date('2026-10-18T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-18T12:00:01Z'));
 const manifestPath=resolve(root,'assets/office-port/manifest.json'),manifest=JSON.parse(await readFile(manifestPath,'utf8'));
 for(const [id,name] of [['fujita','Fujita'],['johansson','Johansson'],['thuan','Thuận'],['tetsuo','Tetsuo']]){
  const frames=resolve(root,'output/office-port/bridge-frames',id);await mkdir(frames,{recursive:true});
  await page.evaluate(({id,name})=>{window.posterScene.select({id,name},{id:'bridge'});window.posterScene.play(true);},{id,name});
  for(let i=0;i<144;i++){
   await page.clock.runFor(1000/24);
   await page.locator('#stage').screenshot({path:resolve(frames,String(i).padStart(3,'0')+'.png'),animations:'allow'});
  }
  await page.evaluate(()=>window.posterScene.pause());
  const output=resolve(root,'assets/office-port/bridge-'+id+'.mp4');
  run(['-framerate','24','-i',resolve(frames,'%03d.png'),'-frames:v','144','-c:v','libx264','-preset','slow','-crf','30','-pix_fmt','yuv420p','-movflags','+faststart','-an',output]);
  run(['-i',output,'-f','null','-']);
  const videoBytes=(await stat(output)).size;if(videoBytes>500000)throw Error('Bridge film exceeds 500 KB');
  Object.assign(manifest.residents.find(item=>item.id==='bridge-'+id),{seconds:6,fps:24,videoBytes});console.log('Bridge film',id,videoBytes);
 }
 const still=await page.evaluate(()=>window.posterScene.capture({hideActor:true})),png=resolve(root,'output/office-port/bridge-still.png');await writeFile(png,Buffer.from(still.split(',')[1],'base64'));
 const stillResult=spawnSync('cwebp',['-quiet','-q','82',png,'-o',resolve(root,'assets/office-port/bridge.webp')]);if(stillResult.status)throw Error('Still encoding failed');
 manifest.posters.find(item=>item.id==='bridge').bytes=(await stat(resolve(root,'assets/office-port/bridge.webp'))).size;
 manifest.bridgeRevision='2026-10-18 · 操舵室 / WHEELHOUSE signs; bridge-films.mjs';
 await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();await server.close();}
