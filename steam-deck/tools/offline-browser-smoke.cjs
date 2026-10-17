const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const root=path.resolve(__dirname,'../site'),errors=[],missing=[],remote=[];
 const browser=await chromium.launch({executablePath:process.env.WORLD_CHROME||'/root/.cache/ms-playwright/chromium_headless_shell-1161/chrome-linux/headless_shell',headless:true,dumpio:true,args:['--no-sandbox','--single-process','--no-zygote','--in-process-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 fs.mkdirSync(path.resolve(__dirname,'../dist'),{recursive:true});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{window.johanssonDesktop={offline:true,version:'0.2.2'};navigator.getGamepads=()=>[];});
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.mp4':'video/mp4'};
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.hostname!=='world.local'){remote.push(url.href);return route.abort();}
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(url.pathname.endsWith('/'))file=path.join(file,'index.html');
  if(!file.startsWith(root+'/')||!fs.existsSync(file)||!fs.statSync(file).isFile()){missing.push(url.pathname);return route.fulfill({status:404,body:'Not found'});}
  return route.fulfill({contentType:mime[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
 });
 await page.goto('http://world.local/johansson-town/?desktop=1&cinematic=off',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.getElementById('title')?.dataset.scene==='ready',null,{timeout:120000});
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__===true,null,{timeout:60000});
 await page.waitForTimeout(4000);
 await page.screenshot({path:path.resolve(__dirname,'../dist/offline-island.png')});
 await page.evaluate(()=>dispatchEvent(new Event('johansson-festival-menu')));
 await page.getByRole('button',{name:'Harbour quay · Chin',exact:true}).click();
 await page.getByRole('button',{name:'Take part',exact:true}).click();
 const stage=await page.locator('#festivalHUD').count();
 if(stage!==1)throw Error('First actual island stage did not open: '+await page.locator('#activityBody').textContent());
 await page.waitForTimeout(1000);await page.screenshot({path:path.resolve(__dirname,'../dist/festival-quay.png')});
 await page.keyboard.press('Escape');
 await page.evaluate(()=>dispatchEvent(new Event('johansson-desktop-save')));
 const saved=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('johansson-town')).length);
 console.log(JSON.stringify({running:true,stage:true,saved,errors,missing:[...new Set(missing)],blockedRemote:remote.length}));
 await browser.close();if(errors.length||missing.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1);});
