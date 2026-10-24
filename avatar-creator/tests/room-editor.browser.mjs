// Real saved-project recovery, replacement/Undo and cross-tab conflicts, then an MCP file round trip.
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
import {context,callTool} from '../../johansson-town/tools/studio/tools.mjs';
import {openRepo} from '../../johansson-town/tools/studio/repo.mjs';
const require=createRequire(import.meta.url),{chromium}=require(fileURLToPath(new URL('../../johansson-town/node_modules/playwright/index.js',import.meta.url)));
const root=fileURLToPath(new URL('../../',import.meta.url)),out=root+'output/studio-mcp/room-qa';await mkdir(out,{recursive:true});
const server=await serveGame({root,mounts:['avatar-creator','johansson-town']}),browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const temp=await mkdtemp(join(tmpdir(),'room-mcp-')),ctx=await context();ctx.repo=openRepo(temp);await mkdir(join(temp,'johansson-town/data/studio'),{recursive:true});const fixture='hat.glb';await copyFile(root+'johansson-town/assets/catalog/johansson-trucker-display/model.glb',join(temp,fixture));
const errors=[];let exported;
try{
 for(const [width,height] of [[1280,900],[1024,1366],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true}),page=await context.newPage();page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
  const open=async p=>{await p.goto(server.url+'avatar-creator/');await p.getByRole('button',{name:'Edit room',exact:true}).click();await p.locator('.room-workspace').waitFor();};
  await open(page);const w=page.locator('.room-workspace');await w.getByRole('button',{name:'World furniture starter',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.room-workspace [data-objects]').children.length===4);
  await page.waitForFunction(()=>document.querySelector('.room-workspace [data-status]').textContent.startsWith('Saved on this device'));
  // Reuse the exact embedded asset, preserving its shared identity, then undo the instance.
  await w.getByRole('button',{name:'Add instance of tansu',exact:true}).click();
  assert.equal(await w.locator('[data-objects] button').count(),5);
  const [reuseFile]=await Promise.all([page.waitForEvent('download'),w.getByRole('button',{name:'Download project',exact:true}).click()]);
  const reused=JSON.parse(await readFile(await reuseFile.path(),'utf8'));
  assert.equal(Object.keys(reused.assets).length,4);
  assert.equal(reused.objects.filter(o=>o.asset===reused.objects.find(o=>o.id==='tansu').asset).length,2);
  await w.getByRole('button',{name:'Frame selected',exact:true}).click();
  await w.getByRole('button',{name:'Undo',exact:true}).click();
  assert.equal(await w.locator('[data-objects] button').count(),4);
  await w.getByLabel('Find object',{exact:true}).fill('andon');
  assert.equal(await w.locator('[data-objects] button').count(),1);
  await w.getByLabel('Find object',{exact:true}).fill('');
  await w.locator('[data-objects]').getByRole('button',{name:'tansu',exact:true}).click();await w.getByLabel('Object position X',{exact:true}).fill('-1.23');await w.getByLabel('Object position X',{exact:true}).press('Tab');
  await w.getByRole('button',{name:'Snap selected to grid'}).click();assert.equal(await w.getByLabel('Object position X',{exact:true}).inputValue(),'-1.25');
  await w.getByRole('button',{name:'Duplicate',exact:true}).click();assert.equal(await w.locator('[data-objects] button').count(),5);
  await w.getByRole('button',{name:'Delete',exact:true}).click();assert.equal(await w.locator('[data-objects] button').count(),4);
  await w.getByRole('button',{name:'Undo',exact:true}).click();assert.equal(await w.locator('[data-objects] button').count(),5);
  await w.locator('[data-objects]').getByRole('button',{name:'tansu',exact:true}).click();await w.locator('[data-replace-file]').setInputFiles(join(temp,fixture));
  await page.waitForFunction(()=>document.querySelector('.room-workspace [data-identity]').textContent.includes('hat'));
  assert.equal(await w.getByLabel('Object position X',{exact:true}).inputValue(),'-1.25');await w.getByRole('button',{name:'Undo',exact:true}).click();await w.getByRole('button',{name:'Redo',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.room-workspace [data-status]').textContent.startsWith('Saved on this device'));
  const [download]=await Promise.all([page.waitForEvent('download'),w.getByRole('button',{name:'Download project',exact:true}).click()]);exported=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(exported.objects.length,5);assert.equal(exported.objects.find(o=>o.id==='tansu').position[0],-1.25);
  await page.reload();await page.getByRole('button',{name:'Edit room',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.room-workspace [data-status]').textContent.startsWith('Restored saved room'));
  assert.equal(await w.locator('[data-objects] button').count(),5);
  await page.waitForFunction(()=>document.querySelector('.room-workspace [data-render-status]').textContent==='');
  assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'room workspace fits viewport');await page.screenshot({path:out+`/room-${width}.png`,fullPage:true});
  const peer=await context.newPage();peer.setDefaultTimeout(120000);await open(peer);await peer.waitForFunction(()=>document.querySelector('.room-workspace [data-status]').textContent.startsWith('Restored saved room'));
  await peer.getByLabel('Project title').fill('Peer edit');await peer.getByLabel('Project title').press('Tab');await peer.waitForFunction(()=>document.querySelector('.room-workspace [data-status]').textContent.startsWith('Saved on this device'));
  await w.getByLabel('Project title').fill('Stale edit');await w.getByLabel('Project title').press('Tab');await page.waitForFunction(()=>document.querySelector('.room-workspace [data-status]').textContent.includes('Another Studio tab'));
  assert.match(await w.locator('[data-status]').innerText(),/Download/);await context.close();
 }
 let r=await callTool('room_create',{id:'agent-room',title:'Agent room',dryRun:false},ctx);assert.ok(!r.error,JSON.stringify(r));
 r=await callTool('room_import_model',{id:'agent-room',expectedRevision:0,file:fixture,dryRun:false},ctx);assert.ok(!r.error,JSON.stringify(r));const id=r.project.objects[0].id;
 r=await callTool('room_edit',{id:'agent-room',expectedRevision:1,commands:[{op:'object.update',id,set:{position:[2,0,3]}},{op:'object.duplicate',id}],dryRun:false},ctx);assert.equal(r.project.objects.length,2);
 r=await callTool('room_edit',{id:'agent-room',expectedRevision:2,commands:[{op:'object.update',id:r.project.objects[1].id,set:{position:[2,0,3]}}],dryRun:false},ctx);assert.ok(!r.error,JSON.stringify(r));
 assert.match((await callTool('room_edit',{id:'agent-room',expectedRevision:0,commands:[{op:'title',title:'stale'}],dryRun:false},ctx)).error,/conflict/);
 const portable=await callTool('room_export',{id:'agent-room',format:'project'},ctx),glb=await callTool('room_export',{id:'agent-room',format:'glb'},ctx);assert.ok(!glb.error,JSON.stringify(glb));assert.equal((await readFile(join(temp,glb.path))).readUInt32LE(0),0x46546c67);
 const rendered=await callTool('room_render',{id:'agent-room',size:256},ctx);assert.equal(rendered.mimeType,'image/png');assert.ok((await callTool('room_check',{id:'agent-room'},ctx)).findings.length>0);
 const opened=await callTool('room_open',{id:'ui-copy',file:portable.path,dryRun:false},ctx);assert.ok(!opened.error,JSON.stringify(opened));assert.equal(opened.project.objects.length,2);
 const p=await browser.newPage();p.setDefaultTimeout(120000);await p.goto(server.url+'avatar-creator/');await p.getByRole('button',{name:'Edit room',exact:true}).click();await p.locator('[data-project-file]').setInputFiles(join(temp,portable.path));await p.waitForFunction(()=>document.querySelector('.room-workspace [data-objects]').children.length===2);assert.equal(await p.getByLabel('Project title').inputValue(),'Agent room');await p.close();
 assert.deepEqual(errors,[]);console.log('Room UI recovery, replacement/Undo/Redo and cross-tab conflict checks passed at 1280, 1024 and 390 px. MCP create/import/edit/export/render/check and UI reopening passed.');
}finally{await ctx.close();await browser.close();await server.close();await rm(temp,{recursive:true,force:true});}
