/** Actual Studio review capture. Requires a host that permits Chromium sockets.
 * Run from the repository root:
 * TOWN_CHROMIUM_PATH=/path/to/chrome node avatar-creator/render-wardrobe-prototype.mjs /tmp/wardrobe-review
 * This helper has NOT been browser-validated in the socket-restricted delivery session. */
import fs from 'node:fs';
import cp from 'node:child_process';
import {createRequire} from 'node:module';
const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
const out=process.argv[2]||'/tmp/wardrobe-review';fs.mkdirSync(out,{recursive:true});
const server=cp.spawn('python3',['-u','-m','http.server','5198','--bind','127.0.0.1'],{cwd:new URL('../',import.meta.url)});let browser;
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
 browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5198/avatar-creator/?agent&wardrobe');await page.waitForFunction(()=>window.__JOHANSSON_STUDIO__?.ready,{timeout:120000});
 const shots=await page.evaluate(async()=>{
  const {recipeFor}=await import('/johansson-town/src/avatars/cast.js'),{normalizeRecipe}=await import('/johansson-town/src/avatars/recipe.js'),{blankFabric}=await import('/johansson-town/src/avatars/fabric.js');
  const rows=[];
  for(const name of ['Thuan','Vy','Johansson'])for(const cut of ['classic','pressed']){
   const r=normalizeRecipe({...recipeFor(name),outfit:{...recipeFor(name).outfit,top:'blouse',topColour:'#f4f1ea',pattern:'none',bottom:'pleatedskirt',skirtCut:cut,bottomColour:'#27304d'}});
   for(const view of ['front','quarter','right','back'])rows.push({id:`${name}-${cut}-${view}`,data:window.__JOHANSSON_STUDIO__.renderPortrait(r,{view,size:768})});
   if(cut==='pressed')for(const pose of ['Walk','Run','Sit'])rows.push({id:`${name}-${cut}-${pose}`,data:window.__JOHANSSON_STUDIO__.renderPortrait(r,{view:'quarter',pose,size:768})});
  }
  const tile=blankFabric();tile.pixels=Array.from({length:256},(_,i)=>i%16<4||Math.floor(i/16)<4?'2':'.').join('');
  const r=normalizeRecipe({...recipeFor('Thuan'),outfit:{top:'blouse',topColour:'#f4f1ea',topFabric:tile,bottom:'pleatedskirt',skirtCut:'pressed',bottomColour:'#27304d',skirtFabric:tile}});
  rows.push({id:'Thuan-custom-fabric',data:window.__JOHANSSON_STUDIO__.renderPortrait(r,{view:'quarter',size:768})});return rows;
 });
 for(const shot of shots)fs.writeFileSync(`${out}/${shot.id}.png`,Buffer.from(shot.data.split(',')[1],'base64'));
 await page.getByRole('button',{name:'Design fabric',exact:true}).click();await page.getByRole('button',{name:'Checks',exact:true}).click();await page.screenshot({path:`${out}/editor-desktop.png`});await page.getByRole('button',{name:'Keep fabric',exact:true}).click();await page.getByRole('button',{name:'Save character',exact:true}).click();
 if(!await page.evaluate(()=>JSON.parse(localStorage.getItem('nj-avatar-studio-v1')).recipe.outfit.topFabric))throw Error('Fabric did not save');
 await page.reload();await page.getByRole('button',{name:'Design fabric',exact:true}).click();await page.screenshot({path:`${out}/editor-reopened.png`});
 await page.setViewportSize({width:834,height:1194});await page.screenshot({path:`${out}/editor-tablet.png`});await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${out}/editor-phone.png`});
 const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth>innerWidth,dialog:document.querySelector('dialog').scrollWidth>document.querySelector('dialog').clientWidth}));
 const report={portraits:shots.length,errors,overflow,physicalDevice:false};fs.writeFileSync(`${out}/browser-report.json`,JSON.stringify(report,null,2));if(errors.length||overflow.page||overflow.dialog)throw Error(JSON.stringify(report));console.log(JSON.stringify(report));
}finally{await browser?.close();server.kill();}
