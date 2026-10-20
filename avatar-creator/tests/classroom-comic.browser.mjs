// The actual Studio UI: load, edit, replace a panel and reopen the exported project on tablet and phone.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {StudioPage} from '../../johansson-town/tools/studio/page.mjs';
import {context,callTool} from '../../johansson-town/tools/studio/tools.mjs';
const fixture=await context();let source;
try{const {scenes}=await callTool('scene_classroom_example',{},fixture);const result=await callTool('comic_render',{scenes,name:'classroom-browser-fixture'},fixture);source=JSON.parse(await fixture.repo.read(result.data.projectPath));}finally{await fixture.close();}
for(const [width,height] of [[820,1180],[390,844]]){
 const studio=new StudioPage();
 try{
  await studio.start();const page=studio.page;await page.setViewportSize({width,height});page.setDefaultTimeout(120000);
  await page.locator('[data-mode="scene"]').click();
  await page.locator('[data-project-input]').setInputFiles({name:'classroom.studio.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(source))});
  await page.getByText('Project opened.',{exact:true}).waitFor();
  await page.locator('[data-mode="comic"]').click();await page.getByRole('button',{name:'Edit scene',exact:true}).nth(2).click();
  const canvas=page.locator('.scene-picture canvas');await page.waitForFunction(()=>document.querySelector('.scene-picture canvas')?.getAttribute('aria-busy')==='false');
  await page.locator('[data-step="text"]').click();await page.locator('[data-field="effect"]').selectOption('');await page.locator('[data-field="effect"]').selectOption('chaos');await page.locator('[data-step="pose"]').click();
  await page.locator('[data-classroom-props] summary').click();await page.locator('[data-prop-id]').selectOption('desk');
  await page.locator('[data-prop-size]').fill('.8');await page.locator('[data-prop-size]').dispatchEvent('change');
  const roll=page.locator('[data-prop-axis="5"]');await roll.fill('-120');await roll.dispatchEvent('change');
  await page.locator('[data-step="export"]').click();await page.locator('[data-action="capture"]').first().click();
  await page.waitForFunction(()=>document.querySelectorAll('.scene-panels figure').length===4);
  await page.locator('[data-mode="comic"]').click();assert.equal(await page.getByRole('button',{name:'Edit scene',exact:true}).count(),4);
  const download=page.waitForEvent('download');await page.locator('[data-save="project"]').click();const file=await download;
  const saved=JSON.parse(await fs.readFile(await file.path(),'utf8'));assert.equal(saved.panels.length,4);assert.equal(saved.panelScenes.length,4);assert.equal(saved.panelScenes[2].furniture.desk.size,.8);assert.equal(saved.panelScenes[2].effect,'chaos');assert.ok(Math.abs(saved.panelScenes[2].furniture.desk.rotation[2]+2*Math.PI/3)<1e-9);assert.equal(saved.panelScenes[3].actors[0].liftedBy,saved.panelScenes[3].actors[1].id);
  await page.getByRole('button',{name:'Edit scene',exact:true}).nth(2).click();
  await page.locator('button[data-value="Run"]').click();
  await page.waitForFunction(()=>document.querySelector('.scene-picture canvas')?.getAttribute('aria-busy')==='false');
  const still=await canvas.evaluate(c=>c.toDataURL());
  const clock=page.locator('[data-scene-time]');await clock.evaluate(e=>{e.value='.2';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(previous=>{const c=document.querySelector('.scene-picture canvas');return c?.getAttribute('aria-busy')==='false'&&c.toDataURL()!==previous;},still);
  await clock.evaluate(e=>{e.value='0';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(previous=>{const c=document.querySelector('.scene-picture canvas');return c?.getAttribute('aria-busy')==='false'&&c.toDataURL()===previous;},still);
  await page.locator('[data-play-cast]').click();
  await page.waitForFunction(previous=>document.querySelector('.scene-picture canvas')?.toDataURL()!==previous,still);
  await page.locator('[data-play-cast]').click();
  await page.locator('[data-mode="comic"]').click();
  const legacy={...source};delete legacy.panelScenes;
  await page.locator('[data-project-input]').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await page.getByText('Project opened.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Edit scene',exact:true}).count(),0);assert.equal(await page.locator('.scene-panels figure').count(),4);
  assert.deepEqual(studio.errors,[]);console.log(`${width}×${height}: imported, edited furniture, replaced panel, exported snapshots, retained carry links; legacy PNG-only project opened.`);
 }finally{await studio.close();}
}
