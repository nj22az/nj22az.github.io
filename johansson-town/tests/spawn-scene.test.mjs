import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createSpawnScene,clearArrivalLens} from '../src/render/spawn-scene.js';

function fixture(blocked=()=>false){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(65,1.6,.15,480);
 camera.position.set(0,1.8,3);
 const events=[],actor={root:new THREE.Group(),lens:{head:1.1},play:name=>events.push(name),stop:()=>events.push('stop'),lookAt:()=>{},express:()=>{}};
 const arrival=createSpawnScene({scene,camera,getActor:()=>actor,blocked,ground:()=>0,onActive:active=>events.push(active)});
 return {scene,camera,actor,arrival,events};
}
test('arrival changes the camera without relocating Johansson, flies a gull and returns to the gameplay lens',()=>{
 const {scene,camera,actor,arrival,events}=fixture();actor.root.position.set(32,1,-4);
 const position=actor.root.position.clone();arrival.start({id:'seawall',yaw:-Math.PI/2});
 arrival.update(.1);assert.equal(camera.fov,48);assert.ok(events.includes('Think'));
 assert.deepEqual(actor.root.position,position);
 for(let i=0;i<10;i++)arrival.update(.1);
 assert.equal(arrival.snapshot().bird,true);assert.equal(scene.getObjectByName('Arrival gull').visible,true);
 for(let i=0;i<50;i++){camera.position.set(32,2.8,-1);camera.quaternion.identity();arrival.update(.1);}
 assert.equal(arrival.active,false);assert.equal(camera.fov,65);assert.equal(arrival.snapshot().reason,'complete');
 assert.equal(scene.getObjectByName('Arrival gull').visible,false);
});
test('movement cancellation is immediate and restores the chosen first-person lens',()=>{
 const {arrival,camera,events}=fixture();camera.fov=74;
 arrival.start({id:'pier'});arrival.update(.1);arrival.cancel();
 assert.equal(arrival.active,false);assert.equal(camera.fov,74);assert.equal(events.at(-1),false);
 assert.equal(arrival.snapshot().reason,'input');
});
test('arrival lenses reject walls between a clear endpoint and Johansson, plus raised ground',()=>{
 const target=new THREE.Vector3(0,1.2,0),lens=new THREE.Vector3(0,2,4);
 assert.equal(clearArrivalLens(target,lens,{blocked:(x,z)=>z>1.3&&z<1.7}),false);
 assert.equal(clearArrivalLens(target,lens,{ground:()=>3}),false);
 assert.equal(clearArrivalLens(target,lens,{ground:()=>0}),true);
});
test('streamed obstructions, another travel view and interaction stop an arrival safely',()=>{
 let wall=false;const {arrival,camera}=fixture(()=>wall);
 arrival.start({id:'park-bench'});arrival.update(.1);wall=true;arrival.update(.1);
 assert.equal(arrival.active,false);assert.equal(arrival.snapshot().reason,'obstruction');assert.equal(camera.fov,65);
 wall=false;arrival.start({id:'ferry'});arrival.update(.1,{unavailable:true});
 assert.equal(arrival.snapshot().reason,'other-view');
 arrival.start({id:'ramen',inside:true});arrival.update(.1,{paused:true});
 assert.equal(arrival.snapshot().reason,'interaction');
});
