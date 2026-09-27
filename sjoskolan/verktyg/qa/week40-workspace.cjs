/* Focused browser acceptance: run with Playwright and Chromium installed. */
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../../..');
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`,base=origin+'/sjoskolan/vecka-40/aktuell/';
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  for(const width of [390,820,1440]){
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)errors.push(`${response.status()} ${response.url()}`)});
   const go=async(relative)=>{await page.goto(base+relative);await page.locator('#step-title, #resume').first().waitFor();};
   const overflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}: ${page.url()}`);
   const answer=async(a,b)=>{await page.locator('#answer-0').fill(a);if(b!==undefined)await page.locator('#answer-1').fill(b);await page.locator('#answer-form button[type=submit]').click();};
   await go('');assert.equal(await page.locator('input[type=checkbox]').count(),0);await overflow();
   assert.match(await page.locator('#week-purpose').innerText(),/beräkna ett förväntat värde/);
   assert.match(await page.locator('#inlamning').innerText(),/träning inför dessa inlämningar/);
   if(process.env.SCREENSHOT_DIR){fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`week40-start-${width}.png`),fullPage:true});}
   await page.locator('#resume').click();await page.locator('#step-title').waitFor();
   assert.match(await page.locator('#slide').innerText(),/När är jag färdig/);await overflow();
   if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`week40-intro-${width}.png`),fullPage:true});
   await go('Formelstod_och_ovningar.html?del=v40_01#v40_01-q1');await page.locator('#answer-form').waitFor();assert.match(page.url(),/uppgift=v40_01-q1/);
   assert.equal(await page.locator('#repeat-theory').getAttribute('open')!==null,true,'unread prerequisite visible');
   assert.match(await page.locator('#exercise-purpose').innerText(),/förutsäga hur lång en period/);
   assert.match(await page.locator('#current-action').innerText(),/Skriv resultatet i varje fält/);
   await answer('','');assert.equal(await page.locator('#show-solution').isDisabled(),true);
   await answer('1','1');await answer('1','1');assert.equal(await page.locator('#show-solution').isDisabled(),true);
   await answer('2','2');assert.equal(await page.locator('#show-solution').isDisabled(),false);
   await page.locator('#show-solution').click();assert.match(await page.locator('#solution').innerText(),/0,020/);await overflow();
   await page.locator('#next').click();assert.equal(await page.locator('#solution').isVisible(),false);
   await go('Genomgang.html?del=sinus&uppgift=v40_01-q3');await answer('17');assert.equal(await page.locator('#exercise-status').innerText(),'Rätt svar');
   assert.match(await page.locator('#session-boundary').innerText(),/hemma med övning 4–10/);
   await page.reload();await page.locator('#answer-form').waitFor();assert.equal(await page.locator('#answer-0').inputValue(),'17');
   await page.locator('#answer-0').fill('999');await page.reload();await page.locator('#answer-form').waitFor();assert.notEqual(await page.locator('#exercise-status').innerText(),'Rätt svar');
   await go('Genomgang.html?del=sinus&avsnitt=exempel');
   await page.locator('#current-action').scrollIntoViewIfNeeded();await page.waitForTimeout(80);
   for(let i=0;i<6;i++){
    const items=page.locator('.study-example li');assert.equal(await items.count(),i+1);
    await items.last().scrollIntoViewIfNeeded();
    // Wait for real IntersectionObserver delivery, not a synthetic completion click.
    await page.waitForTimeout(80);
    if(i<5)await page.locator('#example-next').click();
   }
   await page.locator('#read-status').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.getElementById('read-status').textContent.includes('✓'));
   await overflow();
   await page.goto(origin+'/sjoskolan/vecka-38/aktuell/Elevuppgifter.html#v2-2');await page.locator('#answer-form').waitFor();
   assert.match(await page.locator('#slide').innerText(),/Instrumentkort M1/);assert.match(await page.locator('#slide').innerText(),/Instrumentkort M2/);await overflow();
   await go('Genomgang.html?del=franskiljning&uppgift=v2-1');
   await page.locator('#slide img').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#slide img').naturalWidth>0);
   await page.locator('#reasoning').fill('Jag behöver kontrollera båda matningsvägarna och väljarens verkliga läge.');await page.locator('#answer-form button[type=submit]').click();
   assert.match(await page.locator('#exercise-status').innerText(),/läraren bedömer/);await overflow();
   for(const del of ['impedans','effekt']){await go(`Genomgang.html?del=${del}&avsnitt=exempel`);await overflow();}
   await page.goto(base+'Formelstod_och_ovningar.html#kompensering-metod');
   await page.locator('#kompensering-metod').waitFor();
   assert.match(page.url(),/Formelstod_och_ovningar.html#kompensering-metod/);
   assert.equal(await page.locator('input[type=checkbox]').count(),0);
   await go('');assert.equal(await page.locator('#resume').innerText(),'Fortsätt där du slutade');
   assert.match(await page.locator('#resume-text').innerText(),/Effekt och effektfaktor/);
   if(process.env.SCREENSHOT_DIR){fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`week40-${width}.png`),fullPage:true});}
   assert.deepEqual(errors,[]);console.log(`PASS ${width}px: links, prerequisites, attempts, solutions, persistence, reading, cards and no overflow`);await context.close();
  }
  const context=await browser.newContext();await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}}));
  const page=await context.newPage();await page.goto(base+'Genomgang.html?del=sinus&uppgift=v40_01-q1');await page.locator('#answer-form').waitFor();
  await page.locator('#answer-0').fill('0,02');await page.locator('#answer-1').fill('20');await page.locator('#answer-form button[type=submit]').click();
  assert.equal(await page.locator('#exercise-status').innerText(),'Rätt svar');assert.match(await page.locator('#storage-note').innerText(),/tillåter inte sparande/);
  await context.close();console.log('PASS blocked storage: interactive work continues with an explicit save limitation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
