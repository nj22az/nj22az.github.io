import fs from 'node:fs/promises';
import {createRequire} from 'node:module';const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const root=process.cwd(),out=process.env.STUDIO_PROOF_OUTPUT||root+'/output/shader-proof';await fs.mkdir(out,{recursive:true});
const server=await serveGame({root,mounts:['avatar-creator','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1200,height:1000}});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});page.on('pageerror',e=>console.error(e.message));
await page.route('**/*',r=>r.request().url().startsWith(server.url)?r.continue():r.abort());
await page.goto(server.url+'avatar-creator/scene-model.mjs');
await page.evaluate(()=>{const base=document.createElement('base');base.href='/johansson-town/';document.head.append(base);});
const result=await page.evaluate(async()=>{
 const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');
 const {createSceneWorkspace}=await import('/avatar-creator/scene.js');
 const work=createSceneWorkspace({getCharacter:()=>recipeFor('Johansson'),onEdit(){},onMode(){}});
 const {makeSomethingComic}=await import('/avatar-creator/make-something-comic.mjs');
 const scenes=makeSomethingComic(recipeFor),panels=[];for(const scene of scenes){const r=await work.renderScene(scene);panels.push({image:r.image,scene:r.scene,layer:r.layer,framing:r.framing});}
 const comic=await work.renderComic(scenes,{layout:'strip'});return {panels,comic};
 });
await fs.writeFile(out+'/make-something.layers.json',JSON.stringify({format:'johansson-studio-layers',version:1,panels:result.panels.map(p=>({scene:p.scene,...p.layer}))}));
for(let i=0;i<result.panels.length;i++)await fs.writeFile(out+`/panel-${i+1}.png`,Buffer.from(result.panels[i].image.split(',')[1],'base64'));
await fs.writeFile(out+'/make-something.png',Buffer.from(result.comic.image.split(',')[1],'base64'));

await fs.writeFile(out+'/make-something.studio.json',JSON.stringify(result.comic.project));
await fs.writeFile(out+'/checks.json',JSON.stringify(result.panels.map(p=>({scene:p.scene,framing:p.framing})),null,2));console.log(out);
}finally{await browser.close();await server.close();}
