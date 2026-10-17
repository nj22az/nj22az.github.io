#!/usr/bin/env node
// Run against an existing checkout; no external page/session is used.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {gzipSync}=require('node:zlib');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const root=path.resolve(process.argv[2]||'..'),out=path.resolve(process.argv[3]||'assets/characters');
 const browser=await chromium.launch({executablePath:process.env.STUDIO_CHROME,args:['--no-sandbox','--single-process','--no-zygote','--in-process-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();page.on('pageerror',e=>console.error('Studio page: '+e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.hostname!=='studio.local')return route.abort();
  if(url.pathname==='/native-test.html')return route.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'});
  const p=path.resolve(root,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));if(!p.startsWith(root+path.sep))return route.abort();
  try{await route.fulfill({contentType:p.endsWith('.html')?'text/html':p.endsWith('.css')?'text/css':p.endsWith('.js')||p.endsWith('.mjs')?'text/javascript':p.endsWith('.json')?'application/json':'application/octet-stream',body:await fs.readFile(p)});}catch{await route.fulfill({status:404,body:'not found'});}
 });
 await page.goto('http://studio.local/native-test.html');await fs.mkdir(out,{recursive:true});
 const manifest={format:'Johansson Studio native fighters',version:3,sourceCommit:process.env.STUDIO_SOURCE_COMMIT||'0ca25b7dce3beef58ab1fd5cb84ba1629c032157',exporter:'avatar-creator/native-export.js',browser:'Chromium 134',characters:[]};
 for(const name of ['Thao','Thuan']){
  const result=await page.evaluate(async name=>{
   const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');const {exportNativeFighter}=await import('/avatar-creator/native-export.js');
   const value=exportNativeFighter(recipeFor(name));const bytes=new Uint8Array(value.bytes);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   const {renderPortrait}=await import('/avatar-creator/studio-api.js');
   const portrait=renderPortrait(recipeFor(name),{view:'quarter',pose:'Idle',expression:'neutral',size:720,background:'#f3ede2'});
   return {...value,bytes:undefined,base64:btoa(binary),portrait};
  },name);
  const bytes=Buffer.from(result.base64,'base64');await fs.writeFile(path.join(out,name.toLowerCase()+'.jwf.gz'),gzipSync(bytes,{level:9,mtime:0}));
  await fs.writeFile(path.join(out,name.toLowerCase()+'.studio.png'),Buffer.from(result.portrait.split(',')[1],'base64'));
  delete result.base64;delete result.portrait;
  manifest.characters.push({...result,name,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
  console.log(name+': real browser Studio export and Studio reference portrait saved.');
 }
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 // Exercise the same Files action in the actual Studio page.
 await page.goto('http://studio.local/avatar-creator/');await page.waitForSelector('.studio-files',{timeout:60000});
 await page.getByText('Files',{exact:true}).click();
 const button=page.getByRole('button',{name:'Export native fighter',exact:true});if(await button.count()!==1)throw Error('Studio native export action missing');
 const [download]=await Promise.all([page.waitForEvent('download'),button.click()]);
 if(!download.suggestedFilename().endsWith('.jwf'))throw Error('Wrong native export filename');
 console.log('PASS Studio Files > Export native fighter produces a .jwf download.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
