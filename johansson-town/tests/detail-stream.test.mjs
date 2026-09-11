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
