import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';
import {ONSEN,ONSEN_COLLIDERS,onsenPoint,onsenOpen} from '../src/world/park-onsen.js';
import {createActivities} from '../activities.js?snappy=1';

test('Umi-no-yu is a small model: a handful of draws, sane geometry, and it faces the town',async()=>{
 installDOM();
 const bytes=await readFile(new URL('../assets/models/onsen/umi-no-yu.glb',import.meta.url));
 assert.ok(bytes.length<1_600_000,'Onsen model budget');
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 let draws=0,triangles=0;
 gltf.scene.traverse(o=>{if(o.isMesh){draws++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;
  assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));}});
 assert.ok(draws<=6,'Onsen draws');assert.ok(triangles<16000,'Onsen triangles');
 const box=new THREE.Box3().setFromObject(gltf.scene);
 assert.ok(box.min.y>-.5&&box.max.y<6,'Rocks set into the ground, and under 6m');
 // Authored facing +Z; turned so the entrance faces west, toward the shops.
 const [doorX]=onsenPoint(-1.4,5.2),[backX]=onsenPoint(0,-7);
 assert.ok(doorX<ONSEN.x&&backX>ONSEN.x,'Entrance toward town, bath toward the sea');
});

test('Umi-no-yu stays on the lawn and clear of the pond, the seawall and the park paths',()=>{
 for(const c of ONSEN_COLLIDERS){
  assert.ok(c.x-c.w/2>6&&c.x+c.w/2<33.2,'Inside the east lawn');
  assert.ok(c.z-c.d/2>0&&c.z+c.d/2<12,'Between the park and the bus road');
 }
});

test('the bath keeps its hours and charges its fee; the footbath is free',()=>{
 const dom=installDOM();let minutes=17*60;
 const acts=createActivities({say(){},onWeather(){},onTime:v=>{if(typeof v==='number')minutes+=v;},getMinutes:()=>minutes,getSocialContext:()=>({})});
 assert.equal(onsenOpen(9*60+59),false);assert.equal(onsenOpen(10*60),true);assert.equal(onsenOpen(21*60+59),true);assert.equal(onsenOpen(22*60),false);
 const start=acts.state.yen;
 acts.action('onsen');dom.button('Bathe · ¥300');
 assert.equal(acts.state.yen,start-300);assert.equal(minutes,17*60+40);assert.ok(acts.state.notes.includes('Bathed at Umi-no-yu.'));
 minutes=23*60;const before=acts.state.yen;acts.action('onsen');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/locked/);assert.equal(acts.state.yen,before);
});
