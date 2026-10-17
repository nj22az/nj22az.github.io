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
 const result=await page.evaluate(async()=>{
  const {exportNativeFerry}=await import('/avatar-creator/native-ferry-export.js');const value=exportNativeFerry();
  const bytes=new Uint8Array(value.bytes);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return {...value,bytes:undefined,base64:btoa(binary)};
 });
 const bytes=Buffer.from(result.base64,'base64');delete result.base64;
 await fs.writeFile(path.join(out,'minato-maru.jwf.gz'),gzipSync(bytes,{level:9,mtime:0}));
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({...result,sourceCommit:'0ca25b7dce3beef58ab1fd5cb84ba1629c032157',sha256:crypto.createHash('sha256').update(bytes).digest('hex')},null,2)+'\n');
 console.log(JSON.stringify(result));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
