import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=resolve(new URL('../../',import.meta.url).pathname),out=resolve(root,'avatar-creator/docs/qa/material-study');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.glb':'model/gltf-binary'};
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://local').pathname,file=resolve(root,'.'+(path.endsWith('/')?path+'index.html':path));if(!file.startsWith(root+'/'))throw Error();res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const report={physicalDevice:false,checks:[],errors:[]};
try{
 for(const [width,height] of [[1280,800],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true,hasTouch:width===390}),page=await context.newPage();page.setDefaultTimeout(180000);page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/avatar-creator/?agent`);await page.waitForFunction(()=>window.__studioCharacter?.materialStudy);
  assert.equal(await page.evaluate(()=>__studioCharacter.materialStudy.mode),'legacy');
  const saved=await page.evaluate(async()=>{const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');const c=__studioCharacter;c.setRecipe(recipeFor('Thuan'));c.setPerformance({frozen:true});c.setPreview({framing:'full',angle:'front',lighting:'neutral'});return c.recipe;});
  await page.locator('.studio-preview > summary').click();
  await page.getByLabel('Comparison lighting',{exact:true}).selectOption('neutral');
  const before=await page.evaluate(()=>__studioCharacter.exportPNG(512));
  await page.getByLabel('Surfaces',{exact:true}).selectOption('enhanced');await page.getByLabel('Clothing finish',{exact:true}).selectOption('satin');
  await page.waitForFunction(()=>__studioCharacter.materialStudy.active&&__studioCharacter.materialStudy.cloth==='satin');
  const after=await page.evaluate(()=>__studioCharacter.exportPNG(512));assert.notEqual(after,before,'PNG uses selected surfaces');
  await writeFile(resolve(out,`studio-export-${width}-before.png`),Buffer.from(before.split(',')[1],'base64'));await writeFile(resolve(out,`studio-export-${width}-after.png`),Buffer.from(after.split(',')[1],'base64'));
  assert.deepEqual(await page.evaluate(()=>__studioCharacter.recipe),saved,'finishes do not alter recipe');
  await page.evaluate(()=>__studioCharacter.save());assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('nj-avatar-studio-v1')).recipe),saved);
  await page.getByLabel('Surfaces',{exact:true}).selectOption('legacy');assert.equal(await page.evaluate(()=>__studioCharacter.exportPNG(512)),before,'returning to legacy restores identical frozen PNG');
  await page.getByLabel('Surfaces',{exact:true}).selectOption('enhanced');await page.locator('.studio-preview-menu').evaluate(e=>e.scrollTop=0);assert.ok(await page.locator('.studio-material-study select').evaluateAll(controls=>controls.every(e=>{const c=document.createElement('canvas').getContext('2d');c.font=getComputedStyle(e).font;return c.measureText(e.selectedOptions[0].text).width+32<=e.clientWidth;})),'finish labels fit the controls');await page.screenshot({path:resolve(out,`studio-controls-${width}.png`)});
  await page.reload();await page.waitForFunction(()=>window.__studioCharacter?.materialStudy);assert.deepEqual(await page.evaluate(()=>__studioCharacter.recipe),saved);assert.equal(await page.evaluate(()=>__studioCharacter.materialStudy.mode),'legacy');
  // Rebuild while in the proposed mode. Selected finish stays local; old recipe still loads.
  await page.evaluate(()=>{__studioCharacter.setMaterialStudy({mode:'enhanced',cloth:'satin'});const r=__studioCharacter.recipe;r.outfit.topColour='#7fb0d8';__studioCharacter.setRecipe(r);});await page.waitForFunction(()=>__studioCharacter.materialStudy.active);assert.equal(await page.evaluate(()=>__studioCharacter.materialStudy.cloth),'satin');
  report.checks.push({viewport:[width,height],saveReload:true,legacyPNGReversible:true,proposedPNG:true,editRebuild:true,defaultLegacy:true});await context.close();
 }
 // Exercise the actual creator lifecycle, independently of Studio mode navigation.
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/avatar-creator/tests/material-review.html`);await page.waitForFunction(()=>window.review);
 report.creatorCycles=await page.evaluate(async()=>{
  review.dispose();const {openCreator}=await import('/johansson-town/src/avatars/creator.js');const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');let lost=0;
  for(let i=0;i<5;i++){const c=openCreator({recipe:recipeFor(i%2?'Johansson':'Thuan'),materialStudy:true});c.root.querySelector('canvas').addEventListener('webglcontextlost',()=>lost++);c.setMaterialStudy({mode:'enhanced',cloth:i%2?'cotton':'satin'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));c.exportPNG(256);c.close();await new Promise(r=>setTimeout(r,50));if(document.querySelector('.shm'))throw Error('Preview DOM retained');}
  return {opened:5,closed:5,lostContexts:lost,remainingPreviews:document.querySelectorAll('.shm').length};
 });assert.equal(report.creatorCycles.lostContexts,5);assert.deepEqual(report.errors,[]);console.log('Studio UI material checks passed',JSON.stringify(report.checks));
}finally{await writeFile(resolve(out,'studio-ui-report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
