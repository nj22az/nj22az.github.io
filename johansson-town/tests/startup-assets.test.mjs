import {test} from 'node:test';
import assert from 'node:assert/strict';
import {settleStartupAssets} from '../src/startup-assets.js';
test('a stalled texture decode cannot hold startup open',async()=>{
 let finish;const stalled=new Promise(resolve=>{finish=resolve;});
 const result=await settleStartupAssets({ready:()=>Promise.resolve(),texture:()=>stalled},{timeoutMs:10});
 assert.deepEqual(result.pending,['texture']);finish();await Promise.resolve();assert.deepEqual(result.pending,['texture']);
});
test('failed models fall back without rejecting startup',async()=>{
 const result=await settleStartupAssets({bad:()=>{throw Error('offline');},good:()=>Promise.resolve(true)},{timeoutMs:100});
 assert.deepEqual(result,{pending:[],failed:['bad']});
});
