// Import → adjust → snap → export → reopen, at desktop and phone sizes. Real UI and the same MCP server.
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
import {context,callTool} from '../../johansson-town/tools/studio/tools.mjs';
const require=createRequire(import.meta.url),{chromium}=require(fileURLToPath(new URL('../../johansson-town/node_modules/playwright/index.js',import.meta.url)));
const root=fileURLToPath(new URL('../../',import.meta.url)),out=root+'output/studio-mcp/workshop-qa';
await mkdir(out,{recursive:true});
const source='johansson-town/assets/catalog/johansson-trucker-display/model.glb',server=await serveGame({root,mounts:['johansson-town','avatar-creator']});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}),ctx=await context();
const errors=[];
try{
 for(const [width,height] of [[1280,900],[390,844]]){
  const page=await browser.newPage({viewport:{width,height},acceptDownloads:true});page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto(server.url+'avatar-creator/');await page.getByRole('button',{name:'Make model',exact:true}).click();
  await page.locator('[data-glb]').setInputFiles(root+source);
  const w=page.locator('.model-workshop');await w.locator('[data-save-glb]').waitFor();
  await page.waitForFunction(()=>document.querySelector('.model-workshop [data-save-glb]')?.hasAttribute('href'));
  assert.match(await w.locator('[data-status]').innerText(),/GLB ready/);
  const first=await w.locator('[data-report]').innerText();assert.match(first,/m ·/);
  await w.getByLabel('Scale multiplier').fill('2');await w.getByLabel('Scale multiplier').press('Tab');
  await page.waitForFunction(()=>document.querySelector('.model-workshop [data-status]').textContent.includes('GLB ready'));
  await w.getByLabel('Position X',{exact:true}).fill('0.123');await w.getByLabel('Position X',{exact:true}).press('Tab');
  await w.getByRole('button',{name:'Snap to grid',exact:true}).click();assert.equal(await w.getByLabel('Position X',{exact:true}).inputValue(),'0.1');
  await w.getByRole('button',{name:'Undo adjustment',exact:true}).click();assert.equal(await w.getByLabel('Position X',{exact:true}).inputValue(),'0.123');
  await w.locator('summary').click();await w.locator('[data-target-point]').fill('[1,2,3]');await w.locator('[data-target-normal]').fill('[1,0,0]');await w.getByRole('button',{name:'Join connectors',exact:true}).click();
  assert.equal(await w.locator('[data-ground]').isChecked(),false);assert.equal(await w.getByLabel('Position X',{exact:true}).inputValue(),'1');
  await page.waitForFunction(()=>document.querySelector('.model-workshop [data-save-glb]')?.hasAttribute('href'));
  const [download]=await Promise.all([page.waitForEvent('download'),w.getByRole('button',{name:'Export GLB',exact:true}).click()]);
  const path=await download.path(),bytes=await readFile(path);assert.equal(bytes.readUInt32LE(0),0x46546c67);
  await page.waitForFunction(()=>document.querySelector('.model-workshop img')?.hidden===false);
  assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'no horizontal overflow');
  await w.locator('summary').click();await page.screenshot({path:out+`/workshop-${width}.png`,fullPage:true});
  await w.getByRole('button',{name:'Back to library',exact:true}).click();await page.locator('[data-glb]').setInputFiles(path);
  await page.waitForFunction(()=>document.querySelector('.model-workshop [data-status]').textContent.includes('GLB ready'));
  assert.equal(await w.getByLabel('Scale multiplier').inputValue(),'1','exported transforms are in the GLB, not lost UI state');
  await page.close();
 }
 const inspected=await callTool('model_inspect',{file:source},ctx);assert.ok(!inspected.error,JSON.stringify(inspected));assert.ok(inspected.metres[0]>0);
 const preview=await callTool('model_prepare',{file:source,transform:{scale:2},output:'qa-prepared-model'},ctx);assert.equal(preview.dryRun,true);
 const prepared=await callTool('model_prepare',{file:source,transform:{scale:2},output:'qa-prepared-model',dryRun:false},ctx);assert.ok(!prepared.error,JSON.stringify(prepared));
 const reopened=await callTool('model_inspect',{file:prepared.path},ctx);for(let i=0;i<3;i++)assert.ok(Math.abs(reopened.metres[i]-inspected.metres[i]*2)<1e-4);
 assert.equal((await callTool('model_inspect',{file:'../outside.glb'},ctx)).error.includes('traversal'),true);
 assert.deepEqual(errors,[]);console.log('Workshop UI round trip passed at 1280 and 390 px; MCP inspect / dry run / export / reopen passed.');
}finally{await ctx.close();await browser.close();await server.close();}
