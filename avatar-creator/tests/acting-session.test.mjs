import test from 'node:test';
import assert from 'node:assert/strict';
import {createActingSession} from '../acting/session.mjs';
function setup(){const callbacks=new Map();let id=0;globalThis.requestAnimationFrame=fn=>{callbacks.set(++id,fn);return id;};globalThis.cancelAnimationFrame=i=>callbacks.delete(i);globalThis.document={addEventListener(){},removeEventListener(){},hidden:false};globalThis.Worker=class{postMessage(){}terminate(){}};return {video:{style:{},play:async()=>{},pause(){},readyState:0,srcObject:null},callbacks};}
test('camera permission resolving after disposal cannot leave a device stream open',async()=>{
 const {video,callbacks}=setup();let resolve,stopped=0;const stream={getTracks:()=>[{stop(){stopped++;}}]};Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:()=>new Promise(r=>resolve=r)}}});const session=createActingSession({video}),starting=session.startCamera();session.dispose();resolve(stream);await starting;assert.equal(stopped,1);assert.equal(video.srcObject,null);assert.equal(callbacks.size,0);
});
test('permission rejection leaves manual recording usable',async()=>{
 const {video,callbacks}=setup(),messages=[];Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async()=>{throw {name:'NotAllowedError'};}}}});const session=createActingSession({video,onStatus:s=>messages.push(s)});await session.startCamera();assert.ok(messages.some(s=>s.includes('declined')));session.startRecording('Manual');assert.equal(session.recording,true);session.dispose();assert.equal(callbacks.size,0);
});
