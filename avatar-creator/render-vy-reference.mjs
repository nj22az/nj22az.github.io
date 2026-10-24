/** Run from repository root: node avatar-creator/render-vy-reference.mjs [output-folder].
 * Requires Playwright and an installed Chromium, or TOWN_CHROMIUM_PATH.
 * Exports the real shared avatar and an editable recipe; no generated artwork.
 */
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
const out=resolve(process.argv[2]||'deliverables/vy-reference');await mkdir(out,{recursive:true});
const server=spawn('python3',['-u','-m','http.server','5198','--bind','127.0.0.1'],{cwd:new URL('../',import.meta.url)});
let browser;
try{
 await new Promise((done,fail)=>{server.stdout.once('data',done);server.once('error',fail);server.once('exit',code=>fail(Error('Preview server exited: '+code)));});
 browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5198/avatar-creator/?agent');
 await page.waitForFunction(()=>window.__JOHANSSON_STUDIO__?.ready,{timeout:120000});
 const result=await page.evaluate(async()=>{
  const {recipeFor}=await import('/johansson-town/src/avatars/cast.js'),recipe=recipeFor('Vy');
  const images=['front','quarter','back'].map(view=>({view,data:window.__JOHANSSON_STUDIO__.renderPortrait(recipe,{view,expression:'smile',pose:'Idle',size:1024,background:'#eeeae4'})}));
  return {recipe,images};
 });
 for(const {view,data} of result.images)await writeFile(resolve(out,'vy-'+view+'.png'),Buffer.from(data.split(',')[1],'base64'));
 await writeFile(resolve(out,'Vy-reference.avatar.json'),JSON.stringify({format:'nj-avatar-studio',version:1,recipe:result.recipe},null,2)+'\n');
 console.log('Exported Vy front, quarter, back and editable recipe to '+out);
}finally{if(browser)await browser.close();server.kill();}
