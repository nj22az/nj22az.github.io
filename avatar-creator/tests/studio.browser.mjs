// Run against the repository root served over HTTP; optional CHROMIUM_EXECUTABLE.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const {createServer}=await import('node:http');
const {readFile,stat}=await import('node:fs/promises');
const {fileURLToPath}=await import('node:url');
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=createServer(async(req,res)=>{try{
 let path=new URL(req.url,'http://localhost').pathname;if(path.endsWith('/'))path+='index.html';
 const file=root+path.slice(1);const info=await stat(file);assert.ok(info.isFile());
 res.setHeader('Content-Type',path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.html')?'text/html':'application/octet-stream');res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=process.env.STUDIO_TEST_URL||`http://127.0.0.1:${server.address().port}`;
const errors=[];
try{
 for(const [width,height] of [[1280,800],[820,1180],[768,1024],[844,390],[390,844],[320,568]]){
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/avatar-creator/');
  await page.locator('.studio-tools').waitFor();
  await page.evaluate(()=>localStorage.setItem('johansson-player-recipe','game-sentinel'));
  await page.getByLabel('Starting template').selectOption('1');
  await page.getByRole('textbox',{name:'Name',exact:true}).fill('My character');
  await page.locator('.studio-tools').getByRole('button',{name:'Save character',exact:true}).click();
  assert.match(await page.locator('.studio-status').innerText(),/saved/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('johansson-player-recipe')),'game-sentinel');
  await page.reload();await page.locator('.studio-tools').waitFor();
  assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'My character');
  await page.getByRole('button',{name:'Step 2: Make them',exact:true}).click();
  await page.getByRole('tab',{name:'Hair',exact:true}).click();
  const [png]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export PNG',exact:true}).click()]);
  assert.equal(png.suggestedFilename(),'My-character.png');
  const path=await png.path();
  const {PNG}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/pngjs':'pngjs');
  const {readFile,copyFile}=await import('node:fs/promises');if(width===1280)await copyFile(path,'/tmp/avatar-studio-export.png');const image=PNG.sync.read(await readFile(path));
  assert.equal(image.width,1024);assert.equal(image.height,1024);
  let opaque=0;for(let i=3;i<image.data.length;i+=4)if(image.data[i]>128)opaque++;
  assert.ok(opaque>10000&&opaque<1024*1024*.8,'PNG contains a visible character and transparent background');
  assert.equal(image.data[3],0); // transparent corner
  await page.locator('.studio-files summary').click();
  const [design]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download design',exact:true}).click()]);
  const designPath=await design.path();const json=JSON.parse(await readFile(designPath,'utf8'));assert.equal(json.recipe.hair.style,'braids');
  await page.getByLabel('Starting template').selectOption('0');assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'Johansson');
  await page.locator('input[type=file]').setInputFiles(designPath);await page.waitForFunction(()=>document.querySelector('.shm-name').value==='My character');
  assert.equal(await page.evaluate(()=>localStorage.getItem('johansson-player-recipe')),'game-sentinel');
  assert.ok(await page.locator('.studio-tools').evaluate(el=>[...el.querySelectorAll('button,select,summary')].filter(b=>b.getClientRects().length).every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height>=44;})),'Toolbar fits and keeps touch targets');
  await page.getByRole('tab',{name:'Mouth',exact:true}).click();
  assert.ok(await page.locator('.shm-body').evaluate(el=>{const body=el.getBoundingClientRect(),pages=document.querySelector('.shm-pages').getBoundingClientRect(),palette=document.querySelector('.shm-palette').getBoundingClientRect();return body.height>40&&body.top>=pages.bottom-1&&body.bottom<=palette.top+1;}),'Choices occupy their own scroll track between tabs and palette');
  assert.ok(await page.locator('.shm-stage').evaluate(el=>{const stage=el.getBoundingClientRect(),panel=document.querySelector('.shm-panel').getBoundingClientRect();return stage.height>80&&(stage.right<=panel.left+1||stage.bottom<=panel.top+1); }),'Preview and inspector do not overlap');
  assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'No horizontal page overflow');
  if(width===1280)await page.screenshot({path:'/tmp/avatar-studio-desktop.png'});
  if(width===390)await page.screenshot({path:'/tmp/avatar-studio-phone.png'});
  await context.close();console.log(`PASS ${width}×${height}: templates, PNG pixels, design import, reload, isolated storage, layout`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
