// Run from repository root. Install a Japanese-capable system font (e.g. Noto Sans CJK).
// TOWN_CHROMIUM_PATH selects Chromium; STUDIO_PROOF_OUTPUT selects the export directory.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const root=process.cwd(),out=process.env.STUDIO_PROOF_OUTPUT||root+'/output/manga-languages';await fs.mkdir(out,{recursive:true});
const server=await serveGame({root,mounts:['avatar-creator','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1200,height:1000}});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});page.on('pageerror',e=>console.error(e.message));
await page.route('**/*',r=>r.request().url().startsWith(server.url)?r.continue():r.abort());
await page.goto(server.url+'avatar-creator/scene-model.mjs');
await page.evaluate(()=>{const base=document.createElement('base');base.href='/johansson-town/';document.head.append(base);});

const result=await page.evaluate(async()=>{
 const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');
 const {createSceneWorkspace}=await import('/avatar-creator/scene.js');
 const {makeSomethingComic}=await import('/avatar-creator/make-something-comic.mjs');
 await document.fonts.ready;
 const work=createSceneWorkspace({getCharacter:()=>recipeFor('Johansson'),onEdit(){},onMode(){}});
 const scenes=makeSomethingComic(recipeFor).map(s=>({...s,look:'manga'}));
 const base=await work.renderComic(scenes,{layout:'strip'}),out={};
 for(const language of ['vi','ja','sv','en']){
  const translated=makeSomethingComic(recipeFor,{language});
  const edits=translated.map((s,i)=>({panel:i+1,bottom:s.bottom,dialogue:s.actors.map((a,j)=>({actor:base.project.panelScenes[i].actors[j].id,text:a.speech||''}))}));
  out[language]=await work.afterEffects({project:base.project,edits});
 }
 work.dispose();return out;
});
for(const [language,r] of Object.entries(result)){
 await fs.writeFile(out+`/make-something-manga-${language}.png`,Buffer.from(r.image.split(',')[1],'base64'));
 await fs.writeFile(out+`/make-something-manga-${language}.studio.json`,JSON.stringify(r.project));
 console.log(language,r.warnings,r.shareWarning);
}
}finally{await browser.close();await server.close();}
