// Run from repository root: real Studio captures, one experimental look at a time.
// TOWN_CHROMIUM_PATH selects Chromium; STUDIO_PROOF_OUTPUT selects the export directory.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const root=process.cwd(),out=process.env.STUDIO_PROOF_OUTPUT||root+'/output/seventeen-beers';await fs.mkdir(out,{recursive:true});
const server=await serveGame({root,mounts:['avatar-creator','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1200,height:1000}});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});page.on('pageerror',e=>console.error(e.message));
await page.route('**/*',r=>r.request().url().startsWith(server.url)?r.continue():r.abort());
await page.goto(server.url+'avatar-creator/scene-model.mjs?v=20261023-print-media');
await page.evaluate(()=>{const base=document.createElement('base');base.href='/johansson-town/';document.head.append(base);});



const result=await page.evaluate(async()=>{
 const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');
 const {createSceneWorkspace}=await import('/avatar-creator/scene.js');
 const {seventeenBeersComic}=await import('/avatar-creator/seventeen-beers-comic.mjs');
 const work=createSceneWorkspace({getCharacter:()=>recipeFor('Johansson'),onEdit(){},onMode(){}});
 const result=await work.renderComic(seventeenBeersComic(recipeFor),{layout:'strip'});
 work.dispose();return result;
});
await fs.writeFile(out+'/seventeen-beers-risograph.png',Buffer.from(result.image.split(',')[1],'base64'));
await fs.writeFile(out+'/seventeen-beers.studio.json',JSON.stringify(result.project));
console.log(JSON.stringify({contacts:result.contacts,scenes:result.project.panelScenes,creatorMark:result.project.creatorMark}));
}finally{await browser.close();await server.close();}
