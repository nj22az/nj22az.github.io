// Authoring only: bake World assets into small, silent homepage videos.
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
import {chromium} from '../../johansson-town/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(new URL('../..',import.meta.url).pathname),server=await serveGame({root,mounts:['johansson-town','tools']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage();page.on('pageerror',e=>console.error(e.message));await page.goto(server.url+'tools/office-bench/render.html');await page.waitForFunction(()=>window.__READY__,null,{timeout:120000});
for(const [id,name] of [['fujita','Mr Fujita'],['johansson','Johansson'],['thuan','Thuan'],['tetsuo','Tetsuo']]){await mkdir(resolve(root,'output/office-bench/frames',id),{recursive:true});console.log(JSON.stringify(await page.evaluate(n=>window.officeBench.select(n),name)));
const count=process.argv.includes('--stills')?1:120;
for(let i=0;i<count;i++){const b64=await page.evaluate(t=>window.officeBench.frame(t),i/12);await writeFile(resolve(root,'output/office-bench/frames',id,String(i).padStart(3,'0')+'.png'),Buffer.from(b64,'base64'));if(i%30===0)console.log(id+' '+i+'/'+count);}
}
}finally{await browser.close();await server.close();}
