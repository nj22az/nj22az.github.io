import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDetailStream} from '../src/world/detail-stream.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('only nearby details load, one at a time, and walking away does not fetch distant districts',async()=>{
 const calls=[];let finish;const stream=createDetailStream();
 stream.add({id:'shop',x:0,z:0,load:()=>{calls.push('shop');return new Promise(resolve=>finish=resolve);}});
 stream.add({id:'port',x:0,z:-70,load:()=>{calls.push('port');return true;}});
 stream.update({x:0,z:0});await tick();stream.update({x:0,z:-70});assert.deepEqual(calls,['shop']);
 finish(true);await tick();stream.update({x:0,z:0});await tick();assert.deepEqual(calls,['shop']);
 stream.update({x:0,z:-70});await tick();assert.deepEqual(calls,['shop','port']);assert.deepEqual(stream.stats.loaded,['shop','port']);
});
test('stalled detail releases the queue and keeps fallback status',async()=>{
 const stream=createDetailStream({timeoutMs:5});stream.add({id:'bad',x:0,z:0,load:()=>new Promise(()=>{})});stream.add({id:'good',x:1,z:0,load:()=>true});
 stream.update({x:0,z:0});await new Promise(resolve=>setTimeout(resolve,10));stream.update({x:0,z:0});await tick();assert.deepEqual(stream.stats.failed,['bad']);assert.deepEqual(stream.stats.loaded,['good']);
});

test('visible residents have priority, failed requests retry with a bound, and look-ahead loads the next frontage',async()=>{
 let time=0,tries=0;const calls=[],stream=createDetailStream({now:()=>time,retryMs:10,maxAttempts:2});
 stream.add({id:'scenery',x:0,z:0,load:()=>{calls.push('scenery');return true;}});
 stream.add({id:'Yuri',priority:0,x:2,z:0,load:()=>{calls.push('Yuri');return ++tries>1;}});
 stream.add({id:'next-shop',priority:1,x:0,z:-48,radius:35,load:()=>{calls.push('next-shop');return true;}});
 stream.update({x:0,z:0});await tick();assert.deepEqual(calls,['Yuri']);
 stream.update({x:0,z:0});await tick();assert.deepEqual(calls,['Yuri','scenery']);
 time=10;stream.update({x:0,z:0});await tick();assert.equal(tries,2);assert.deepEqual(stream.stats.failed,[]);
 stream.update({x:0,z:0},{x:0,z:-1});await tick();assert.equal(calls.at(-1),'next-shop');
 let failures=0;stream.add({id:'offline',x:0,z:0,load:()=>{failures++;return false;}});
 for(let i=0;i<5;i++){time+=100;stream.update({x:0,z:0});await tick();}assert.equal(failures,2);
});

test('late success updates the live model and removes a timeout without a duplicate request',async()=>{
 let finish,loads=0,changed=0;const stream=createDetailStream({timeoutMs:5,retryMs:0,onChange:()=>changed++});
 const entry=stream.add({id:'slow',x:0,z:0,load:()=>{loads++;return new Promise(resolve=>finish=resolve);}});
 stream.update({x:0,z:0});await new Promise(resolve=>setTimeout(resolve,10));stream.update({x:0,z:0});assert.equal(loads,1);
 finish(true);await tick();assert.equal(entry.status,'ready');assert.deepEqual(stream.stats.failed,[]);assert.equal(changed,1);
});
