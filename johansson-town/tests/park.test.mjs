import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {preloadPark,buildPark,PARK_TREE} from '../src/world/park.js?snappy=1';
import {PARK,PARK_BENCH,parkHeight} from '../src/world/park-layout.js';
import {installDOM} from './fixtures.mjs';
import {circleHitsRect} from '../physics.js';

test('the drawn park sits on its own ground, with its bench where the seat is and the view to the port open',async()=>{
 installDOM();
 assert.equal(await preloadPark(),true,'nothing to fetch any more');
 const world={group:new THREE.Group(),colliders:[]};buildPark(world,{register(){},onAction(){},shadows:false});world.group.updateMatrixWorld(true);
 const park=world.park.group;let meshes=0;park.traverse(o=>{if(o.isMesh){meshes++;assert.ok(!o.isSkinnedMesh);}});
 assert.ok(meshes<=24,'The park is a handful of draws, not '+meshes);
 const ground=park.getObjectByName('Harbour Park ground');assert.ok(ground,'the mound is built');
 for(const [x,z] of [[2.06,0],[.7,0],[-8,-13.9],[-6,-7],[10,10]].map(([x,z])=>[PARK.x+x*PARK.scale,PARK.z+z*PARK.scale])){
  const hits=new THREE.Raycaster(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0)).intersectObject(ground,false);
  assert.ok(hits.length,'no ground at '+x+','+z);assert.ok(Math.abs(hits[0].point.y-parkHeight(x,z))<.03,'the ground is off the walkable height at '+x+','+z);
 }
 // The seat is wood, at the height the sitter is put.
 const quarter=[];park.traverse(o=>{if(o.isMesh&&/^Harbour Park:/.test(o.name))quarter.push(o);});
 const hit=new THREE.Raycaster(new THREE.Vector3(PARK_BENCH.position[0],10,PARK_BENCH.position[2]),new THREE.Vector3(0,-1,0)).intersectObjects(quarter,false)[0];
 assert.ok(hit,'there is no bench under the seat');assert.ok(Math.abs(hit.point.y-(PARK_BENCH.eyeY-.75))<.12,'the seat is at '+hit.point.y.toFixed(2)+', not under the sitter');
 const eye=new THREE.Vector3(PARK_BENCH.position[0],PARK_BENCH.eyeY,PARK_BENCH.position[2]),direction=new THREE.Vector3(0,2,-44).sub(eye).normalize();
 assert.equal(new THREE.Raycaster(eye,direction,.1,25).intersectObject(park,true).length,0,'Bench view towards the port is unobstructed');
 // The cherry stands on its collider, in one dress at a time.
 const {blossom,leaf}=world.park.trees;assert.ok(blossom.visible!==leaf.visible,'the cherry wears both dresses at once');
 const tx=PARK.x+PARK_TREE[0]*PARK.scale;assert.ok(world.colliders.some(c=>circleHitsRect(tx,PARK.z,.1,c)),'the trunk has no collider');
});

test('the western approach is clear',()=>{
 installDOM();
 const world={group:new THREE.Group(),colliders:[]};buildPark(world,{register(){},onAction(){},shadows:false});
 const x=PARK.x-10.374*PARK.scale,z=PARK.z+.4*PARK.scale;assert.equal(world.colliders.some(c=>circleHitsRect(x,z,.32,c)),false,'The western approach has a ghost collider');
});
