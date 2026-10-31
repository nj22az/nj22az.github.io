import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash,webcrypto} from 'node:crypto';
import vm from 'node:vm';
import '../offline/worker.js';

const scope='https://island.test/johansson-town/';
const sha=body=>createHash('sha256').update(body).digest('hex');
const contents={'index.html':'<h1>The island</h1>','base.css':'body{color:green}','assets/unvisited.glb':'the complete room','assets/sound.wav':'0123456789'};
function manifest(version='one',source=contents){const files=Object.entries(source).map(([url,body])=>({url,bytes:Buffer.byteLength(body),sha256:sha(body)}));return {version,files,bytes:files.reduce((n,f)=>n+f.bytes,0)};}
function storage(){
 const stores=new Map();let fail=false;
 return {stores,get fail(){return fail;},set fail(value){fail=value;},async keys(){return [...stores.keys()];},async delete(key){return stores.delete(key);},async open(key){
  if(!stores.has(key))stores.set(key,new Map());const data=stores.get(key),url=req=>typeof req==='string'?req:req.url;
  return {async keys(){return [...data.keys()].map(url=>new Request(url));},async match(req){return data.get(url(req))?.clone();},async put(req,response){if(fail)throw new DOMException('full','QuotaExceededError');data.set(url(req),response.clone());},async delete(req){return data.delete(url(req));}};
 }};
}
function fixture(options={}){
 const disk=options.disk||storage(),requests=[],updates=[];
 const fetchFile=async(url,init)=>{requests.push({url,credentials:init.credentials});if(options.fetchFile)return options.fetchFile(url,init);const path=new URL(url).pathname.slice('/johansson-town/'.length);return new Response(contents[path]||'missing',{status:contents[path]?200:404});};
 const worker=globalThis.createTownOffline({scope,manifest:options.manifest||manifest(),storage:disk,fetchFile,digest:bytes=>webcrypto.subtle.digest('SHA-256',bytes),notify:s=>{updates.push(s);options.notify?.(s);}});
 return {worker,disk,requests,updates};
}
const navigation=path=>({url:new URL(path,scope).href,method:'GET',mode:'navigate',headers:new Headers()});

test('explicit download verifies the whole island including unvisited rooms; no implicit fetch on status',async()=>{
 const f=fixture();assert.equal((await f.worker.status()).stage,'available');assert.equal(f.requests.length,0);
 await f.worker.start();assert.equal(f.worker.snapshot().stage,'ready');assert.equal(f.requests.length,4);assert.ok(f.requests.every(r=>r.credentials==='omit'));
 assert.equal(await (await f.worker.fallback(new Request(scope+'assets/unvisited.glb?v=current'))).text(),contents['assets/unvisited.glb']);
 assert.equal(await (await f.worker.fallback(navigation('?saved=1'))).text(),contents['index.html']);
});
test('an interrupted download is never ready; retry resumes only verified files',async()=>{
 let fail=true;const f=fixture({fetchFile:async url=>{const path=new URL(url).pathname.slice('/johansson-town/'.length);if(path==='assets/unvisited.glb'&&fail)throw Error('interrupted');return new Response(contents[path]);}});
 await f.worker.start();assert.equal(f.worker.snapshot().stage,'error');assert.equal(await f.worker.fallback(navigation('./')),null);
 const cache=await f.disk.open('johansson-town-offline-v1-one');assert.equal(await cache.match(scope+'__offline_ready__'),undefined);
 const complete=[...f.disk.stores.values()][0].size;fail=false;const before=f.requests.length;await f.worker.start();assert.equal(f.worker.snapshot().stage,'ready');assert.equal(f.requests.length-before,4-complete);
});
test('corrupted bytes and misleading status codes cannot publish an offline island',async()=>{
 for(const response of [new Response('wrong bytes'),new Response('missing',{status:404})]){
  const f=fixture({fetchFile:async()=>response.clone()});await f.worker.start();assert.equal(f.worker.snapshot().stage,'error');assert.equal(await f.worker.fallback(navigation('./')),null);
 }
});
test('a fresh worker checks every saved byte; missing or corrupt files revoke readiness and repair',async()=>{
 for(const corrupt of [false,true]){
  const f=fixture();await f.worker.start();const cache=await f.disk.open('johansson-town-offline-v1-one');
  if(corrupt)await cache.put(scope+'assets/unvisited.glb',new Response('damaged'));else await cache.delete(scope+'assets/unvisited.glb');
  const restarted=fixture({disk:f.disk});assert.equal((await restarted.worker.status()).stage,'paused');assert.equal(await restarted.worker.fallback(navigation('./')),null);
  await restarted.worker.start();assert.equal(restarted.worker.snapshot().stage,'ready');assert.equal(restarted.requests.length,1);
 }
});
test('pause leaves a resumable partial cache, not a ready marker',async()=>{
 let f;f=fixture({notify:s=>{if(s.done===1&&s.stage==='downloading')f.worker.pause();}});
 await f.worker.start();assert.equal(f.worker.snapshot().stage,'paused');assert.equal(await f.worker.fallback(navigation('./')),null);
 const resumed=fixture({disk:f.disk});assert.equal((await resumed.worker.status()).stage,'paused');await resumed.worker.start();assert.equal(resumed.worker.snapshot().stage,'ready');assert.ok(resumed.requests.length<4);
});
test('failed replacement retains the previous complete island; successful replacement reuses files',async()=>{
 const old=fixture();await old.worker.start();const changed={...contents,'index.html':'<h1>New island</h1>'};
 const update=fixture({disk:old.disk,manifest:manifest('two',changed),fetchFile:async()=>{throw Error('network unavailable');}});
 await update.worker.start();assert.equal(update.worker.snapshot().stage,'error');assert.equal(await (await update.worker.fallback(navigation('./'))).text(),contents['index.html']);
 const retry=fixture({disk:old.disk,manifest:manifest('two',changed),fetchFile:async url=>new Response(changed[new URL(url).pathname.slice('/johansson-town/'.length)])});
 await retry.worker.start();assert.equal(retry.worker.snapshot().stage,'ready');assert.equal(retry.requests.length,1);assert.equal(await (await retry.worker.fallback(navigation('./'))).text(),changed['index.html']);
 assert.deepEqual(await old.disk.keys(),['johansson-town-offline-v1-one','johansson-town-offline-v1-two'],'One predecessor remains for tabs holding its lazy chunks');
 const oldCache=await old.disk.open('johansson-town-offline-v1-one'),oldMarker=await (await oldCache.match(scope+'__offline_ready__')).json();oldMarker.created=Number.MAX_SAFE_INTEGER;await oldCache.put(scope+'__offline_ready__',new Response(JSON.stringify(oldMarker)));
 const next=fixture({disk:old.disk,manifest:manifest('three',changed),fetchFile:async()=>{throw Error('All bytes should be reused');}});await next.worker.start();assert.equal(next.requests.length,0);assert.equal(next.worker.snapshot().stage,'ready');assert.deepEqual(await old.disk.keys(),['johansson-town-offline-v1-two','johansson-town-offline-v1-three']);
});
test('full device storage is actionable and never damages another app cache',async()=>{
 const f=fixture();await (await f.disk.open('pocket-camera-private')).put(scope+'fixture',new Response('preserve'));f.disk.fail=true;
 await f.worker.start();assert.equal(f.worker.snapshot().stage,'error');assert.match(f.worker.snapshot().error,/Free some space/);assert.equal(await (await (await f.disk.open('pocket-camera-private')).match(scope+'fixture')).text(),'preserve');
});
test('fallback is confined to this island and respects stylesheet content hashes',async()=>{
 const f=fixture();await f.worker.start();
 assert.equal(await f.worker.fallback(new Request('https://elsewhere.test/johansson-town/base.css')),null);
 assert.equal(await f.worker.fallback(new Request('https://island.test/camera/')),null);
 assert.equal(await f.worker.fallback(navigation('creator/')),null);
 assert.equal(await f.worker.fallback(new Request(scope+'base.css?h=old')),null);
 assert.equal(await (await f.worker.fallback(new Request(scope+'base.css?h='+sha(contents['base.css']).slice(0,8)))).text(),contents['base.css']);
});
test('offline sound supports Safari byte ranges and rejects invalid ranges',async()=>{
 const f=fixture();await f.worker.start();
 for(const [range,status,body] of [['bytes=2-5',206,'2345'],['bytes=-3',206,'789'],['bytes=7-',206,'789'],['bytes=25-',416,''],['bytes=9-2',416,''],['bytes=-',416,'']]){
  const response=await f.worker.fallback(new Request(scope+'assets/sound.wav',{headers:{range}}));assert.equal(response.status,status,range);assert.equal(await response.text(),body,range);
 }
});
test('generated inventory matches every published byte and excludes authoring sources and saves',async()=>{
 const root=new URL('../',import.meta.url),context={};vm.runInNewContext(await readFile(new URL('offline/manifest.js',root),'utf8'),context);const m=context.TOWN_OFFLINE;
 assert.ok(m.files.length>500);assert.ok(m.bytes>130000000);
 assert.equal(m.version,sha(JSON.stringify(m.files)).slice(0,20));assert.equal(new Set(m.files.map(f=>f.url)).size,m.files.length);
 let bytes=0;for(const file of m.files){assert.doesNotMatch(file.url,/(?:^|\/)(?:docs|art|briefs|tests|tools|node_modules|src)(?:\/|$)|\.blend$|save\.json/);const body=await readFile(new URL(file.url,root));assert.equal(sha(body),file.sha256,file.url);assert.equal(body.length,file.bytes);bytes+=body.length;}
 assert.equal(bytes,m.bytes);
 const walk=async path=>{for(const entry of await readdir(new URL(path,root),{withFileTypes:true})){const p=path+'/'+entry.name;if(entry.name==='source'||/\.blend\d?$|\.py$/.test(entry.name))continue;if(entry.isDirectory())await walk(p);else assert.ok(m.files.some(f=>f.url===p),'All playable island assets included: '+p);}};await walk('assets');
 const runtime=JSON.parse(await readFile(new URL('runtime/.vite/manifest.json',root),'utf8'));for(const entry of Object.values(runtime))assert.ok(m.files.some(f=>f.url==='runtime/'+entry.file),'Lazy runtime included: '+entry.file);
 const html=await readFile(new URL('index.html',root),'utf8');for(const [,path] of html.matchAll(/(?:src|href)="\.\/([^"?]+\.(?:js|css))(?:\?[^"]*)?"/g))assert.ok(m.files.some(f=>f.url===path),'Page dependency: '+path);
});
