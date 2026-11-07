/** Reproduce shared tailored-skirt review portraits. Run from the repository root
 * with Playwright and Chromium installed, or set TOWN_CHROMIUM_PATH. */
import fs from 'node:fs';
import cp from 'node:child_process';
import {createRequire} from 'node:module';
const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
(async()=>{const srv=cp.spawn('python3',['-u','-m','http.server','5197','--bind','127.0.0.1'],{cwd:new URL('../',import.meta.url)});let browser;
try{await new Promise((r,j)=>{srv.stdout.once('data',r);srv.once('error',j)});browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();page.on('pageerror',e=>console.log(e.message));await page.goto('http://127.0.0.1:5197/avatar-creator/?agent');await page.waitForFunction(()=>window.__JOHANSSON_STUDIO__?.ready,{timeout:120000});
const result=await page.evaluate(async()=>{const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');const shots=[];
for(const name of ['Vy','Thuan','Grandmother Higa','Johansson']){const r=recipeFor(name);r.outfit={...r.outfit,top:'tee',topColour:'#f4f1ea',pattern:'none',bottom:'skirt',bottomColour:'#27304d',footwear:'sneakers',shoes:'#f4f1ea',hat:'none'};
for(const view of ['front','quarter'])shots.push({id:name.replaceAll(' ','-')+'-'+view,data:window.__JOHANSSON_STUDIO__.renderPortrait(r,{view,pose:'Idle',expression:'smile',size:1024,background:'#eeeae4'})});}
for(const pose of ['Walk','Sit']){const r=recipeFor('Vy');shots.push({id:'Vy-'+pose,data:window.__JOHANSSON_STUDIO__.renderPortrait(r,{view:'quarter',pose,expression:'smile',size:1024,background:'#eeeae4'})});}return shots;});
fs.mkdirSync((process.argv[2]||'deliverables/skirt-fit'),{recursive:true});for(const r of result)fs.writeFileSync((process.argv[2]||'deliverables/skirt-fit')+'/'+r.id+'.png',Buffer.from(r.data.split(',')[1],'base64'));console.log('Exported '+result.length+' actual Studio views');
}finally{if(browser)await browser.close();srv.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
