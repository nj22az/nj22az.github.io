/** Verify the approved default in old browser saves and the website mascot. */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const root=resolve(new URL('..',import.meta.url).pathname);
const {chromium}=createRequire(root+'/johansson-town/package.json')('playwright');
const server=spawn('python3',['-u','-m','http.server','5197','--bind','127.0.0.1'],{cwd:root});
let browser;const out=root+'/johansson-town/docs/qa/vy-creator-integration/default-replacement';await mkdir(out,{recursive:true});
try{
 await new Promise(r=>server.stdout.once('data',r));
 browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1365,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:5197/')?route.continue():route.abort());
 console.log('Website');await page.goto('http://127.0.0.1:5197/linux-port/',{waitUntil:'domcontentloaded'});await page.locator('img[src*="vy-psst"]').waitFor();await page.waitForFunction(()=>document.querySelector('img[src*="vy-psst"]')?.naturalWidth>0);
 await page.screenshot({path:out+'/website-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/website-mobile.png',fullPage:true});
 const {recipeFor}=await import(root+'/johansson-town/src/avatars/cast.js');
 const {encodeRecipe}=await import(root+'/johansson-town/src/avatars/recipe.js');
 const oldRecipe=recipeFor('Vy');oldRecipe.body.proportion='classic';oldRecipe.outfit.skirtCut='classic';oldRecipe.head.form='round';
 await page.addInitScript(({r,code})=>{if(localStorage.getItem('vy-test-seeded'))return;localStorage.setItem('vy-test-seeded','1');localStorage.setItem('nj-avatar-studio-v1',JSON.stringify({format:'nj-avatar-studio',version:1,recipe:r}));localStorage.setItem('johansson-town-resident-wardrobes',JSON.stringify({Vy:code}));localStorage.removeItem('johansson-town-resident-appearance-revisions');},{r:oldRecipe,code:encodeRecipe(oldRecipe)});
 console.log('Studio old saved appearance');await page.goto('http://127.0.0.1:5197/avatar-creator/?agent',{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__JOHANSSON_STUDIO__?.ready,null,{timeout:120000});
 const migrated=await page.evaluate(async()=>{const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');return {studio:JSON.parse(localStorage.getItem('nj-avatar-studio-v1')),resident:recipeFor('Vy')};});
 for(const r of [migrated.studio.recipe,migrated.resident])if(r.body.proportion!=='studio'||r.head.form!=='sculpted'||r.outfit.skirtCut!=='panel')throw Error('Old Vy survived migration');
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:out+'/creator-upgraded-save.png'});
 const portrait=await page.evaluate(async()=>{const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');return window.__JOHANSSON_STUDIO__.renderPortrait(recipeFor('Vy'),{view:'quarter',size:768});});await writeFile(out+'/vy-default.png',Buffer.from(portrait.split(',')[1],'base64'));
 if(errors.length)throw Error(errors.join('\n'));
 const report={website:['1365x900','390x844'],migration:'Old Studio and resident Vy upgraded to the approved body, head and panel skirt',errors};await writeFile(out+'/verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser?.close();server.kill();}
