import test from 'node:test';
import assert from 'node:assert/strict';
import {createStartupRecovery,graphicsProfile} from '../src/render/startup-recovery.js';
const fixture=()=>{const data=new Map(),listeners=new Map(),callbacks=new Map();let id=0;return {storage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},events:{addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)},schedule:f=>{callbacks.set(++id,f);return id;},cancel:i=>callbacks.delete(i),hide:()=>listeners.get('pagehide')?.(),settle:()=>[...callbacks.values()].forEach(f=>f())};};
test('a process killed while entering the town selects recovery on the next launch',()=>{
 const f=fixture(),first=createStartupRecovery({...f,now:()=>1000});assert.equal(first.safe,false);first.entering();first.running();
 const next=createStartupRecovery({...f,now:()=>1100});assert.equal(next.interrupted,true);assert.equal(next.safe,true);
});
test('normal reloads and settled starts do not trigger recovery',()=>{
 for(const finish of ['hide','settle']){const f=fixture(),a=createStartupRecovery({...f,now:()=>1000});a.entering();a.running();f[finish]();assert.equal(createStartupRecovery({...f,now:()=>1100}).safe,false);}
});
test('old attempts and unavailable storage do not block launch; explicit recovery persists',()=>{
 const f=fixture();createStartupRecovery({...f,now:()=>1000});assert.equal(createStartupRecovery({...f,now:()=>200000}).safe,false);
 const broken={getItem(){throw Error('denied');},setItem(){throw Error('denied');},removeItem(){throw Error('denied');}};assert.equal(createStartupRecovery({storage:broken}).safe,false);
 createStartupRecovery({...f,search:'?graphics=safe',now:()=>300000});f.hide();assert.equal(createStartupRecovery({...f,now:()=>300100}).safe,true);
});
test('lean graphics profiles avoid MSAA, half-float and whole-scene compilation',()=>{
 for(const input of [{mobile:true},{mobile:true,tablet:true},{safe:true}]){const p=graphicsProfile(input);assert.equal(p.samples,0);assert.equal(p.antialias,false);assert.equal(p.preferHalfFloat,false);assert.equal(p.precompile,false);assert.ok(p.pixelBudget<=1.2e6);assert.equal(p.shadows,false);}
 const desktop=graphicsProfile();assert.equal(desktop.samples,4);assert.equal(desktop.precompile,true);assert.equal(desktop.shadows,true);
});

test('iPhone and explicit recovery omit postprocessing, background streaming and cinematic; other profiles retain them',async()=>{
 const {drawingDpr}=await import('../src/render/startup-recovery.js');
 for(const input of [{mobile:true,ios:true},{safe:true}]){
  const p=graphicsProfile(input);assert.equal(p.postprocess,false);assert.equal(p.streamDetails,false);assert.equal(p.cinematic,false);assert.equal(p.quietOpening,true);
  for(const [width,height] of [[430,932],[932,430],[4096,2732]]){const dpr=drawingDpr({width,height,deviceDpr:3,profile:p});assert.ok(width*height*dpr*dpr<=650001);}
 }
 for(const input of [{mobile:true},{mobile:true,ios:true,tablet:true},{}]){const p=graphicsProfile(input);assert.equal(p.postprocess,true);assert.equal(p.streamDetails,true);assert.equal(p.cinematic,true);}
});
