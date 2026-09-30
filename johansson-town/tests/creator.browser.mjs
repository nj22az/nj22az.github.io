// Run with CODEX_PRIMARY_RUNTIME_NODE_MODULES set and CREATOR_CHROME pointing to Chromium.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.CREATOR_CHROME,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [width,height] of [[320,568],[390,844],[844,390],[1280,800],[320,360]]){
  const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/creator-review.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/tomodachi-ui.css"></head><body><button id="opener">Open</button></body></html>'}));
  await page.goto('http://127.0.0.1:5173/creator-review.html');
  await page.evaluate(async()=>{document.querySelector('#opener').focus();const {openCreator}=await import('/src/avatars/creator.js');window.maker=openCreator({onSave:r=>window.saved=r});});
  const mobile=width<=760||height<=500;
  for(const id of ['body','head','hair','eyes','brows','nose','mouth','extras','top','bottom','hat']){
   if(mobile)await page.getByRole('combobox',{name:'Appearance category',exact:true}).selectOption(id);else await page.getByRole('tab',{name:({body:'Body',head:'Face',hair:'Hair',eyes:'Eyes',brows:'Brows',nose:'Nose',mouth:'Mouth',extras:'Glasses & beard',top:'Top',bottom:'Bottoms',hat:'Hat'})[id],exact:true}).click();
   const bounds=await page.evaluate(()=>{const root=document.querySelector('.shm'),body=document.querySelector('.shm-body'),save=document.querySelector('.shm-save');return {overflow:root.scrollWidth>innerWidth,body:body.clientHeight,bottom:save.getBoundingClientRect().bottom};});
   assert.equal(bounds.overflow,false);assert.ok(bounds.body>=90,JSON.stringify(bounds));assert.ok(bounds.bottom<=height);
  }
  await page.getByLabel('Name',{exact:true}).fill('Test islander');
  const before=await page.evaluate(()=>JSON.stringify(window.maker.recipe));
  await page.getByRole('button',{name:'Randomise appearance'}).click();await page.getByRole('button',{name:'Undo',exact:true}).click();
  assert.equal(await page.evaluate(()=>JSON.stringify(window.maker.recipe)),before);
  await page.getByLabel('Preview pose').selectOption('Wave');
  await page.getByRole('button',{name:'Share',exact:true}).click();await page.getByLabel('Import an islander').fill('http://[invalid?avatar=bad');
  await page.getByRole('button',{name:'Try the pasted one'}).click();assert.ok(await page.getByRole('button',{name:'That code did not work'}).isVisible());
  await page.keyboard.press('Escape');assert.ok(await page.locator('.shm').isVisible());assert.equal(await page.locator('.shm-share').count(),0);
  await page.getByRole('button',{name:'Share',exact:true}).click();const code=await page.getByLabel('Share link or code').inputValue();await page.getByLabel('Import an islander').fill(code);await page.getByRole('button',{name:'Try the pasted one'}).click();
  if(!mobile){await page.getByRole('tab',{name:'Hat',exact:true}).focus();await page.keyboard.press('Home');assert.equal(await page.getByRole('tab',{name:'Body',exact:true}).getAttribute('aria-selected'),'true');}
  await page.getByRole('button',{name:'Save and play'}).click();assert.equal(await page.evaluate(()=>window.saved.name),'Test islander');assert.equal(await page.locator('.shm').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.id),'opener');assert.deepEqual(errors,[]);
  console.log(`Creator interactions and layout passed: ${width}x${height}`);await page.close();
 }
}finally{await browser.close();}
