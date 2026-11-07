// Run from repository root: real Studio captures, one experimental look at a time.
// TOWN_CHROMIUM_PATH selects Chromium; STUDIO_PROOF_OUTPUT selects the export directory.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const root=process.cwd(),out=process.env.STUDIO_PROOF_OUTPUT||root+'/output/print-media';await fs.mkdir(out,{recursive:true});
const server=await serveGame({root,mounts:['avatar-creator','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1200,height:1000}});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});page.on('pageerror',e=>console.error(e.message));
await page.route('**/*',r=>r.request().url().startsWith(server.url)?r.continue():r.abort());
await page.goto(server.url+'avatar-creator/scene-model.mjs?v=20261023-print-media');
await page.evaluate(()=>{const base=document.createElement('base');base.href='/johansson-town/';document.head.append(base);});


const result=await page.evaluate(async()=>{
 const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');
 const {createSceneWorkspace}=await import('/avatar-creator/scene.js?v=20261023-print-media');
 const {makeSomethingComic}=await import('/avatar-creator/make-something-comic.mjs');
 const work=createSceneWorkspace({getCharacter:()=>recipeFor('Johansson'),onEdit(){},onMode(){}}),out={};
 const scenes=makeSomethingComic(recipeFor);
 for(const look of ['riso','pencilManga','brushOil','stamp'])out[look]=await work.renderComic(scenes.map(s=>({...s,look})),{layout:'strip'});
 work.dispose();return out;
});
for(const [look,r] of Object.entries(result)){
 await fs.writeFile(out+`/comic-${look}.png`,Buffer.from(r.image.split(',')[1],'base64'));
 await fs.writeFile(out+`/comic-${look}.studio.json`,JSON.stringify(r.project));console.log('Captured '+look);
}
}finally{await browser.close();await server.close();}
