// Checks the committed Pages runtime. Set CREATOR_CHROME to an installed Chromium executable.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {extname} from 'node:path';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json');
const {chromium}=require('playwright');
const evidence=process.env.TITLE_EVIDENCE||'/tmp/title-screen-evidence';await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CREATOR_CHROME,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [width,height,touch,reduced] of [[1440,1000,false,false],[390,844,true,false],[390,844,true,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.hostname!=='title.local')return route.abort();
   const path=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
   const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.glb':'model/gltf-binary','.wav':'audio/wav'};
   try{await route.fulfill({body:await readFile(new URL('..'+path,import.meta.url)),contentType:types[extname(path)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Missing local fixture'});}
  });
  await page.goto('http://title.local/?audit');await page.locator('[data-guide-close]').click();
  await page.evaluate(()=>{window.__audioCreated=0;const Original=window.AudioContext;window.AudioContext=class extends Original{constructor(...args){super(...args);window.__audioCreated++;}};localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:00',speed:1}));localStorage.setItem('johansson-town-1988-v5',JSON.stringify({yen:777,inventory:['Green tea'],minutes:720,sound:false,savedAt:Date.now(),visited:['park']}));});
  const save=await page.evaluate(()=>({...localStorage}));assert.equal(await page.evaluate(()=>!!window.__JOHANSSON_RUNNING__),false);
  await page.locator('#title-preview').click();await page.waitForFunction(()=>!!window.__JOHANSSON_TITLE_VIEW__,null,{timeout:60000});await page.waitForTimeout(1200);
  assert.deepEqual(await page.evaluate(()=>({...localStorage})),save);assert.equal(await page.evaluate(()=>window.__audioCreated),0);
  assert.equal(await page.locator('#game').count(),1);assert.equal(await page.evaluate(()=>!!window.__JOHANSSON_RUNNING__),false);
  assert.ok(await page.evaluate(()=>window.__JOHANSSON_TITLE_VIEW__.renderer.info.render.triangles>1000));
  for(const time of ['720','1110','1320']){await page.locator('[data-title-time="'+time+'"]').click();assert.equal(await page.evaluate(()=>window.__JOHANSSON_TITLE_VIEW__.camera.state.minutes),Number(time));}
  await page.locator('#title-settings-open').click();const angle=await page.evaluate(()=>window.__JOHANSSON_TITLE_VIEW__.camera.state.angle);await page.locator('#title-drift').fill('2');await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>!!window.__JOHANSSON_RUNNING__),false);await page.keyboard.press('Escape');assert.equal(await page.locator('#title-settings').evaluate(e=>e.open),false);
  if(reduced){assert.equal(await page.locator('#title-tour').isDisabled(),true);assert.equal(await page.evaluate(()=>window.__JOHANSSON_TITLE_VIEW__.camera.state.angle),angle);}
  else{
   if(touch){const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-20,y:height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width-100,y:height/2+40}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else{await page.mouse.move(width-50,height/2);await page.mouse.down();await page.mouse.move(width-200,height/2+40,{steps:5});await page.mouse.up();}
   assert.equal(await page.evaluate(()=>window.__JOHANSSON_TITLE_VIEW__.camera.state.tour),false);
  }
  await page.locator('#title-reset').click();assert.equal(await page.evaluate(()=>window.__JOHANSSON_TITLE_VIEW__.camera.state.radius),47);
  await page.locator('#title-sound').click();assert.equal(await page.locator('#title-sound').getAttribute('aria-pressed'),'true');await page.locator('#title-sound').click();
  assert.deepEqual(await page.evaluate(()=>({...localStorage})),save);
  await page.screenshot({path:evidence+'/'+width+'-'+(reduced?'reduced':'live')+'.png'});
  await page.locator('[data-guide-open]').click();await page.locator('[data-guide-close]').click();
  await page.locator('#enter').click();await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__);await page.waitForTimeout(900);
  assert.equal(await page.locator('#start').evaluate(e=>e.classList.contains('hidden')),true);
  assert.equal(await page.evaluate(()=>window.__JOHANSSON_AUDIT__.activities.state.yen),777);
  assert.ok(Math.abs(await page.evaluate(()=>window.__JOHANSSON_POSE__.minutes)-720)<2,'Preview night must not set the gameplay clock');
  assert.equal(await page.evaluate(()=>window.__JOHANSSON_STABILITY__.ok),true);assert.deepEqual(errors,[]);
  await context.close();console.log('Passed title preview and entry: '+width+'×'+height+(reduced?' reduced motion':''));
 }
}finally{await browser.close();}
