// Run from repository root: real Studio captures, one experimental look at a time.
// TOWN_CHROMIUM_PATH selects Chromium; STUDIO_PROOF_OUTPUT selects the export directory.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const root=process.cwd(),out=process.env.STUDIO_PROOF_OUTPUT||root+'/output/creator-mark';await fs.mkdir(out,{recursive:true});
const server=await serveGame({root,mounts:['avatar-creator','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1200,height:1000}});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});page.on('pageerror',e=>console.error(e.message));
await page.route('**/*',r=>r.request().url().startsWith(server.url)?r.continue():r.abort());
await page.goto(server.url+'avatar-creator/scene-model.mjs?v=20261023-print-media');
await page.evaluate(()=>{const base=document.createElement('base');base.href='/johansson-town/';document.head.append(base);});



const project=JSON.parse(await fs.readFile(process.env.STUDIO_MARK_PROJECT||root+'/output/make-something-manga-en.studio.json','utf8'));
const result=await page.evaluate(async project=>{
 const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');
 const {createSceneWorkspace}=await import('/avatar-creator/scene.js');
 const work=createSceneWorkspace({getCharacter:()=>recipeFor('Johansson'),onEdit(){},onMode(){}});
 const signed=await work.afterEffects({project,creatorMark:{enabled:true,text:'Johansson'}});
 const input=work.root.querySelector('[data-creator="text"]');input.value='NJ';input.dispatchEvent(new Event('input'));
 const edited=await work.afterEffects({project:{...signed.project,creatorMark:{enabled:true,text:'NJ',corner:'left',opacity:.4}}});
 const reopened=await work.afterEffects({project:signed.project});
 if(reopened.image!==signed.image||edited.image===signed.image)throw Error('Creator mark export/reopen failed');
 const off=await work.afterEffects({project:{...signed.project,creatorMark:{enabled:false}}});
 if(off.image===signed.image)throw Error('Creator mark did not disappear');
 work.dispose();return signed;
},project);
await fs.writeFile(out+'/make-something-manga-signed.png',Buffer.from(result.image.split(',')[1],'base64'));
await fs.writeFile(out+'/make-something-manga-signed.studio.json',JSON.stringify(result.project));
console.log(JSON.stringify({creatorMark:result.project.creatorMark,roundTrip:true,editable:true,removable:true,warnings:result.warnings}));
}finally{await browser.close();await server.close();}
