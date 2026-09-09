import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {preloadPark,buildPark} from '../src/world/park.js';
import {PARK_BENCH,parkHeight} from '../src/world/park-layout.js';
import {installDOM} from './fixtures.mjs';
test('supplied park is static, compact and matches its bench and walkable ground',async()=>{
 installDOM();const originalFetch=fetch;globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{assert.equal(await preloadPark(),true);const world={group:new THREE.Group(),colliders:[]};buildPark(world,{register(){},onAction(){},shadows:false});world.group.updateMatrixWorld(true);
  const park=world.park.group;let meshes=0;park.traverse(o=>{if(o.isMesh){meshes++;assert.ok(!o.isSkinnedMesh);assert.ok(!/Sky|LampLight/.test(o.material.name));}});assert.equal(meshes,16);
  const ground=[];park.traverse(o=>{if(o.isMesh&&/mtParkGround0/.test(o.material.name))ground.push(o);});
  for(const [x,z] of [[37.06,-38],[35.7,-38],[27,-52],[29,-45]]){const hits=new THREE.Raycaster(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0)).intersectObjects(ground,false);assert.ok(hits.length);assert.ok(Math.abs(hits[0].point.y-parkHeight(x,z))<.07,'Geometry and foot height agree');}
  const wood=[];park.traverse(o=>{if(o.isMesh&&/BenchWood/.test(o.material.name))wood.push(o);});const hits=new THREE.Raycaster(new THREE.Vector3(37.06,10,-38),new THREE.Vector3(0,-1,0)).intersectObjects(wood,false);assert.ok(hits.length);assert.ok(Math.abs(hits[0].point.y+.75-PARK_BENCH.eyeY)<.07,'Camera sits above the real seat');
  const eye=new THREE.Vector3(PARK_BENCH.position[0],PARK_BENCH.eyeY,PARK_BENCH.position[2]),direction=new THREE.Vector3(0,2,-58).sub(eye).normalize();assert.equal(new THREE.Raycaster(eye,direction,.1,25).intersectObject(park,true).length,0,'Bench view towards the port is unobstructed');
 }finally{globalThis.fetch=originalFetch;}
});
