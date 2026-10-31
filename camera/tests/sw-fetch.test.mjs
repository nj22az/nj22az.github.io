import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup({manifestDelay=0,cacheDelay=0,networkDelay=null,networkStatus=200,cached=true}={}){
 let now=0,id=0,aborted=0,networkCalls=0;const timers=new Map(),listeners=new Map();
 const later=(fn,delay)=>{const token=++id;timers.set(token,{at:now+delay,fn});return token;};
 const sleep=delay=>delay?new Promise(resolve=>later(resolve,delay)):Promise.resolve();
 const cache={async match(path){
  if(path==='/camera/offline.json'){await sleep(manifestDelay);return {json:async()=>({files:[{url:'/camera/known.png'},{url:'/camera/index.html'}]})};}
  await sleep(cacheDelay);return cached?new Response('cached picture',{headers:{'Content-Type':'image/png'}}):null;
 }};
 const context=vm.createContext({URL,Headers,Response,AbortController,performance:{now:()=>now},setTimeout:later,clearTimeout:token=>timers.delete(token),caches:{open:async()=>cache},self:{location:{origin:'https://camera.test'},addEventListener:(name,fn)=>listeners.set(name,fn)},fetch:(request,{signal}={})=>{
  networkCalls++;signal?.addEventListener('abort',()=>aborted++);
  // Deliberately ignore AbortSignal: a stalled fetch must not hold the cached fallback hostage.
  if(networkDelay===null)return new Promise(()=>{});
  return sleep(networkDelay).then(()=>new Response('fresh picture',{status:networkStatus}));
 }});
 vm.runInContext(source,context);
 function request(path='/camera/known.png',method='GET'){
  let response;listeners.get('fetch')({request:{url:'https://camera.test'+path,method,mode:'cors'},respondWith:p=>{response=p;}});return response;
 }
 async function advance(ms){
  const target=now+ms;await tick();
  for(;;){const due=[...timers].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;timers.delete(due[0]);now=due[1].at;due[1].fn();await tick();}
  now=target;await tick();
 }
 return {request,advance,get now(){return now;},get aborted(){return aborted;},get networkCalls(){return networkCalls;}};
}
test('the three-second fallback includes slow manifest/cache preparation and does not await abort',async()=>{
 const env=setup({manifestDelay:2200,cacheDelay:2000});let done=false;const pending=env.request().then(r=>{done=true;return r;});
 await env.advance(2999);assert.equal(done,false);await env.advance(1);assert.equal(done,true);
 const response=await pending;assert.equal(await response.text(),'cached picture');assert.equal(response.headers.get('Content-Type'),'image/png');
 assert.match(response.headers.get('Server-Timing'),/camera;dur=3000\.0/);assert.match(response.headers.get('Server-Timing'),/camera-manifest;dur=2200\.0/);assert.equal(env.aborted,1);
});
test('normal successful network responses remain first and do not wait for storage',async()=>{
 const env=setup({manifestDelay:2500,cacheDelay:1000,networkDelay:150});let done=false;const pending=env.request().then(r=>{done=true;return r;});
 await env.advance(150);assert.equal(done,true);const response=await pending;assert.equal(await response.text(),'fresh picture');assert.equal(response.headers.get('Server-Timing'),null);assert.equal(env.aborted,0);
});
test('unlisted URLs retain normal network timing and can never use a cached body',async()=>{
 const env=setup({networkDelay:6000});let done=false;const pending=env.request('/camera/unlisted').then(r=>{done=true;return r;});
 await env.advance(3000);assert.equal(done,false);assert.equal(env.aborted,0);await env.advance(3000);
 const response=await pending;assert.equal(await response.text(),'fresh picture');assert.equal(response.headers.get('Server-Timing'),null);assert.equal(env.aborted,0);
});
test('a known failed network response uses the prepared copy immediately',async()=>{
 const env=setup({networkDelay:10,networkStatus:503,cacheDelay:20});const pending=env.request();await env.advance(20);
 const response=await pending;assert.equal(response.status,200);assert.equal(await response.text(),'cached picture');assert.match(response.headers.get('Server-Timing'),/camera;dur=20\.0/);
});
test('a missing cached copy rejects at the deadline rather than waiting for a stalled fetch',async()=>{
 const env=setup({cached:false});const pending=env.request();const rejected=assert.rejects(pending,/Offline copy unavailable/);await env.advance(3000);await rejected;assert.equal(env.aborted,1);
});
test('requests outside the worker GET scope are left untouched',()=>{
 const env=setup();assert.equal(env.request('/outside/file'),undefined);assert.equal(env.request('/camera/known.png','POST'),undefined);assert.equal(env.networkCalls,0);
});
