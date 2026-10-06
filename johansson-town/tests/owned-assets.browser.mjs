// Run with the lockfile's real Chromium, not a mocked fetch or GLTF parser.
import assert from 'node:assert/strict';
import {createServer,get} from 'node:http';
import {Transform} from 'node:stream';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serveGame} from '../tools/mcp/static-server.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const upstream=await serveGame(root),browser=await chromium.launch(),report=[];
// Keep the 5MB response in flight long enough to exercise stream teardown/GC.
const proxy=createServer((req,res)=>{
 const request=get(new URL(req.url,upstream.url),response=>{
  res.writeHead(response.statusCode,response.headers);
  const body=req.url.includes('thuan-display.glb')?response.pipe(new Transform({transform(chunk,encoding,done){setTimeout(()=>done(null,chunk),25);}})):response;
  body.on('error',()=>res.destroy());body.pipe(res);
 });request.on('error',()=>res.destroy());
});
await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${proxy.address().port}/johansson-town/`;
try{
 for(const mode of ['complete','http-error','invalid-glb']){
  const context=await browser.newContext(),errors=[],failures=[],finished=[];
  try{
   await context.route('**/owned-asset-test.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Owned asset regression</title>'}));
   if(mode!=='complete')await context.route('**/thuan-display.glb',r=>r.fulfill(mode==='http-error'?{status:404,body:'Missing GLB'}:{status:200,contentType:'model/gltf-binary',body:'Broken glTF'}));
   const page=await context.newPage(),cdp=await context.newCDPSession(page);
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>failures.push({url:r.url(),failure:r.failure()}));
   page.on('requestfinished',r=>{if(r.url().includes('thuan-display'))finished.push(r.url());});
   await page.goto(origin+'owned-asset-test.html');
   let timer;
   const loaded=await (async()=>{
    timer=setInterval(()=>cdp.send('HeapProfiler.collectGarbage').catch(()=>{}),20);
    try{return await page.evaluate(async()=>{
     const {addOwnedCharacter}=await import('./src/people/owned-characters.js');
     const {Group}=await import('./vendor/three.module.js');
     const display=addOwnedCharacter({parent:new Group(),kind:'thuanFigurine'});
     const ready=await display.ready;let triangles=0;
     display.holder.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});
     return {ready,loadError:!!display.holder.userData.loadError,children:display.holder.children.length,triangles};
    });}finally{clearInterval(timer);}
   })();
   await page.waitForTimeout(100);
   if(mode==='complete'){
    assert.deepEqual(failures,[]);assert.deepEqual(errors,[]);
    assert.equal(finished.length,1,'Native response finishes once, without retries');
    assert.deepEqual(loaded,{ready:true,loadError:false,children:1,triangles:98972});
   }else{
    assert.equal(loaded.ready,false);assert.equal(loaded.loadError,true);assert.equal(loaded.children,0);
    assert.ok(errors.some(e=>e.includes('Owned character unavailable: thuanFigurine')),'HTTP and parser failures must remain hard console errors');
   }
   report.push({mode,loaded,errors,failures,finished:finished.length});
   console.log('Owned asset browser check passed: '+mode);
  }finally{await context.close();}
 }
}finally{
 await mkdir(new URL('../../output/mcp-ci-smoke-tour/',import.meta.url),{recursive:true});
 await writeFile(new URL('../../output/mcp-ci-smoke-tour/owned-assets.json',import.meta.url),JSON.stringify({browser:browser.version(),checks:report},null,2)+'\n');
 await browser.close();proxy.closeAllConnections();await new Promise(resolve=>proxy.close(resolve));await upstream.close();
}
