// Authoring: render matching fallback stills from the live scene, never the homepage UI.
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
import {chromium} from '../../johansson-town/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {spawnSync} from 'node:child_process';
const root=resolve(new URL('../..',import.meta.url).pathname),server=await serveGame({root,mounts:['johansson-town','tools','assets']}),browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage();page.on('pageerror',e=>console.error(e.message));page.on('console',m=>{if(m.type()==='error')console.error(m.text())});await page.goto(server.url+'tools/office-port/live-posters.html');await page.waitForFunction(()=>window.__READY__,null,{timeout:120000});await mkdir(resolve(root,'output/office-port/live'),{recursive:true});
 for(const place of ['quay','pier','bridge']){
  await page.evaluate(place=>window.posterScene.select({id:'johansson',name:'Johansson'},{id:place}),place);
  for(const hideActor of [false,true]){const data=await page.evaluate(hideActor=>window.posterScene.capture({hideActor}),hideActor),file=resolve(root,'output/office-port/live',place+(hideActor?'-still':'')+'.png');await writeFile(file,Buffer.from(data.split(',')[1],'base64'));if(hideActor){const r=spawnSync('ffmpeg',['-v','error','-y','-i',file,'-frames:v','1','-c:v','libwebp','-quality','82',resolve(root,'assets/office-port',place==='quay'?'harbour.webp':place+'.webp')]);if(r.status)throw Error('Still encoding failed');}}
  console.log(place+' still complete');
 }
 await page.evaluate(()=>window.posterScene.dispose());
}finally{await browser.close();await server.close();}
