import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createTitleCamera} from '../src/render/title-camera.js';
import {Element,installDOM} from './fixtures.mjs';
import {createActivities} from '../activities.js';
import {SAVE_KEY} from '../src/save.js';
import {townAudio} from '../src/audio/town-audio.js?snappy=1';
function setup(reducedMotion=false){
 const element=new Element(),camera=new THREE.PerspectiveCamera();
 return {element,camera,view:createTitleCamera({camera,element,reducedMotion})};
}
const pointer=(x,y,control=false)=>({pointerId:1,button:0,clientX:x,clientY:y,target:{closest:()=>control?{}:null}});
test('a harbour tour has the same camera path at 30 and 60 fps',()=>{
 const a=setup(),b=setup();for(let i=0;i<600;i++)a.view.update(1/60);for(let i=0;i<300;i++)b.view.update(1/30);
 assert.ok(Math.abs(a.view.state.angle-b.view.state.angle)<1e-10);
 assert.ok(a.camera.position.distanceTo(b.camera.position)<.02);
 assert.ok(a.view.target.equals(new THREE.Vector3(0,3,-28)));
});
test('dragging is bounded; settings controls cannot drag or zoom the camera',()=>{
 const {element,view}=setup();
 element.listeners.pointerdown[0](pointer(0,0,true));element.listeners.pointermove[0](pointer(100,100,true));assert.equal(view.state.tour,true);
 element.listeners.pointerdown[0](pointer(0,0));element.listeners.pointermove[0](pointer(9999,9999));assert.equal(view.state.tour,false);assert.equal(view.state.elevation,.75);assert.equal(view.state.angle,-.95);
 element.listeners.pointercancel[0](pointer(9999,9999));const angle=view.state.angle;element.listeners.pointermove[0](pointer(0,0));assert.equal(view.state.angle,angle);
 let cancelled=false;element.listeners.wheel[0]({target:{closest:()=>({})},deltaY:200,preventDefault(){cancelled=true;}});assert.equal(view.state.radius,47);assert.equal(cancelled,false);
 element.listeners.wheel[0]({target:{closest:()=>null},deltaY:9999,preventDefault(){cancelled=true;}});assert.equal(view.state.radius,65);assert.equal(cancelled,true);
 view.reset();assert.equal(view.state.radius,47);assert.equal(view.state.tour,true);
});
test('reduced motion holds the harbour view still, including after reset',()=>{
 const {view,camera}=setup(true),before=camera.position.clone();for(let i=0;i<600;i++)view.update(1/60);assert.ok(camera.position.equals(before));view.reset();assert.equal(view.state.tour,false);
});
test('a deferred title session cannot save or consume restocking until entry',()=>{
 const original=JSON.stringify({yen:777,inventory:['Green tea'],minutes:720,sound:false,savedAt:Date.now(),visited:['park']});installDOM({[SAVE_KEY]:original});
 let playing=false,minutes=1110,audioCalls=0,weatherCalls=0;const setEnabled=townAudio.setEnabled;townAudio.setEnabled=()=>audioCalls++;
 try{
  const activities=createActivities({deferStart:true,canWrite:()=>playing,say(){},getMinutes:()=>minutes,onWeather(){weatherCalls++;},onTime(value){if(value?.restore)minutes=value.restore;}});
  activities.save();activities.consumeStorageRestock();assert.equal(localStorage.getItem(SAVE_KEY),original);assert.equal(audioCalls,0);assert.equal(weatherCalls,0);
  playing=true;activities.startSession();const saved=JSON.parse(localStorage.getItem(SAVE_KEY));assert.equal(saved.yen,777);assert.deepEqual(saved.inventory,['Green tea']);assert.equal(saved.minutes,720);assert.equal(audioCalls,1);assert.equal(weatherCalls,1);
 }finally{townAudio.setEnabled=setEnabled;}
});
