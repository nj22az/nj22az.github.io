// Run from repository root: the Seventeen Beers scene recaptured in every active style.
// TOWN_CHROMIUM_PATH selects Chromium; STUDIO_PROOF_OUTPUT selects the export directory.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const root=process.cwd(),out=process.env.STUDIO_PROOF_OUTPUT||root+'/output/seventeen-styles';await fs.mkdir(out,{recursive:true});
const server=await serveGame({root,mounts:['avatar-creator','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1200,height:1000}});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});page.on('pageerror',e=>console.error(e.message));
await page.route('**/*',r=>r.request().url().startsWith(server.url)?r.continue():r.abort());
await page.goto(server.url+'avatar-creator/scene-model.mjs?v=20261023-print-media');
await page.evaluate(()=>{const base=document.createElement('base');base.href='/johansson-town/';document.head.append(base);});




const looks=await page.evaluate(async()=>{
 const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');
 const {createSceneWorkspace}=await import('/avatar-creator/scene.js');
 const {seventeenBeersComic}=await import('/avatar-creator/seventeen-beers-comic.mjs');
 const {LOOKS}=await import('/johansson-town/src/render/looks.js');
 window.stripWork=createSceneWorkspace({getCharacter:()=>recipeFor('Johansson'),onEdit(){},onMode(){}});
 window.stripScenes=seventeenBeersComic(recipeFor);
 const first=['riso','manga','flat','pencilManga','crayon','oil','brushOil','stamp','sketchbook'];
 return [...first,...Object.keys(LOOKS).filter(id=>!first.includes(id))].map(id=>({id,label:LOOKS[id].label}));
});
for(const [i,look] of looks.entries()){
 const r=await page.evaluate(async id=>{
  const r=await window.stripWork.renderComic(window.stripScenes.map(s=>({...s,look:id})),{layout:'strip'});
  const text=r.project.panelScenes.map(s=>s.actors.map(a=>a.speech));
  if(text[1][1]!=='You look happy.'||text[2][0]!=='Thanks for noticing. I just had 17 beers.'||!r.project.creatorMark.enabled)throw Error('Comic continuity lost');
  return r.image;
 },look.id);
 const name=String(i+1).padStart(2,'0')+'-'+look.id+'.png';
 await fs.writeFile(out+'/'+name,Buffer.from(r.split(',')[1],'base64'));look.file=name;console.log((i+1)+'/'+looks.length+' '+look.label);
}
await fs.writeFile(out+'/styles.json',JSON.stringify(looks,null,2));
await page.evaluate(()=>window.stripWork.dispose());
}finally{await browser.close();await server.close();}
