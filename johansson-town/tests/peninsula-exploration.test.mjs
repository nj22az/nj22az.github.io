import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {routeAt,groundHeight,MAP_BOUNDS} from '../src/world/layout.js?snappy=1';
import {BEACH,beachHeight} from '../src/world/beach-layout.js';
import {buildEastLawn,EAST_LAWN} from '../src/world/east-lawn.js';
import {buildCoyoteTunnel,TUNNEL,headlandHeight,CAVE_MOUTH} from '../src/world/coyote-tunnel.js';
import {circleHitsRect,townBoundsBlocked} from '../physics.js';

test('both beach openings allow approach, descent, a shoreline walk and return without crossing walls',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);installDOM();
 const parent=new THREE.Group(),colliders=[];const {shore}=buildEastLawn({parent,colliders,heightAt:groundHeight});
 const blocked=(x,z)=>townBoundsBlocked(x,z,.32)||colliders.some(c=>circleHitsRect(x,z,.32,c));
 for(const access of BEACH.accesses){
  let previous=groundHeight(31.8,access.z);
  for(let x=31.8;x<=44;x+=.1){
   assert.equal(blocked(x,access.z),false,`Access at ${x},${access.z}`);
   const height=groundHeight(x,access.z);assert.ok(Math.abs(height-previous)<.04,'Descent must be continuous');previous=height;
  }
  for(let x=44;x>=31.8;x-=.1)assert.equal(blocked(x,access.z),false,'Return from beach');
 }
 for(let z=BEACH.minZ+.5;z<=BEACH.maxZ-.5;z+=.2){assert.equal(blocked(42,z),false,'Walk the length of the dry shore');assert.equal(routeAt(42,z).surface,'sand');}
 assert.ok(colliders.some(c=>circleHitsRect(EAST_LAWN.wall.x,0,.32,c)),'Wall remains solid between openings');
 parent.updateMatrixWorld(true);const ray=new THREE.Raycaster();
 for(const x of [34.1,39.3,44.2]){ray.set(new THREE.Vector3(x,5,0),new THREE.Vector3(0,-1,0));assert.ok(Math.abs(ray.intersectObject(shore)[0].point.y-groundHeight(x,0))<1e-5,'Feet follow the sand mesh');}
});

test('dry ground around the peninsula is admitted and the sea remains blocked',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 for(const p of [[-20,32],[-31,32],[43,33],[44,55],[8,54]])assert.equal(townBoundsBlocked(...p,.32),false,'Unbuilt dry land '+p);
 for(const p of [[-41,0],[48,0],[45.9,0],[48,40],[12,-51],[0,110]])assert.equal(townBoundsBlocked(...p,.32),true,'Sea '+p);
 assert.equal(townBoundsBlocked(45.5,0,.32),true,'The whole body must stay on dry sand');
 assert.equal(groundHeight(47,50),-.4,'Feet rest on the visible coastal slab');assert.ok(Math.abs(groundHeight(44,55)-(-.4+.04))<1e-9,'Feet rest on the Kitahama lane, laid on the island ground');
 assert.ok(beachHeight(47,0)<BEACH.waterY,'Underwater sand stays outside walking limits');
});

test('headland feet follow rendered triangles, including the crown and slopes',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);installDOM();
 const parent=new THREE.Group(),colliders=[];const {hill}=buildCoyoteTunnel({parent,colliders});parent.updateMatrixWorld(true);
 const ray=new THREE.Raycaster();
 for(const [x,z] of [[-20,36],[-18.3,48.7],[-10.2,60.1],[0.3,65.7],[6.4,75.9],[-3.5,70]]){
  assert.ok(routeAt(x,z,.32),'Headland is explorable');ray.set(new THREE.Vector3(x,60,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(hill)[0];assert.ok(hit);
  assert.ok(Math.abs(hit.point.y-groundHeight(x,z))<1e-4,`Ground/mesh mismatch at ${x},${z}`);
 }
 assert.equal(headlandHeight(TUNNEL.x,TUNNEL.z-2),null,'The path up to the cave is not the hill surface');
 assert.equal(headlandHeight(TUNNEL.x,CAVE_MOUTH.inside),null,'Inside the cave you walk on its floor, not on the hilltop');
 assert.ok(colliders.some(c=>circleHitsRect(TUNNEL.x,CAVE_MOUTH.inside+1.2,.32,c)),'The cave has no end a couple of metres in');
 assert.ok(!colliders.some(c=>circleHitsRect(TUNNEL.x,CAVE_MOUTH.z,.32,c)),'The cave mouth is walled off');
 assert.ok(!colliders.some(c=>circleHitsRect(TUNNEL.x-12,TUNNEL.z+1,.32,c)),'Open hillside is not part of the cave rock');
 assert.ok(MAP_BOUNDS.maxZ>90,'The map includes the explorable headland');
});

test('archived layout keeps its walking limits and ground heights',()=>{
 configureTownMode(TOWN_MODES.LEGACY);
 try{assert.equal(routeAt(42,0),null);assert.equal(routeAt(-10,65),null);assert.equal(groundHeight(42,0),0);assert.ok(MAP_BOUNDS.maxZ<90);}
 finally{configureTownMode(TOWN_MODES.PENINSULA);}
});
