import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createKit,trs} from '../src/world/okinawa/kit.js';
import {shopHouse} from '../src/world/okinawa/houses.js';
import {createWalkSurface} from '../src/world/walk-surface.js';
import {canStepBetween,standingHitsRect,sweepFraction} from '../physics.js';

installDOM();
const w=5.6,d=7.7,D=d/2,back=D-2.2,floor=.08;
const higaFrame={x:9.55,z:8.75,y:0,yaw:-Math.PI/2};
function build(frame=higaFrame,interior='liquor'){
 const kit=createKit(),group=new THREE.Group(),matrix=trs(frame.x,frame.y,frame.z,0,frame.yaw);
 let colliders;
 kit.at(frame.x,frame.z,frame.yaw,()=>{colliders=shopHouse(kit,{w,d,interior,seed:41});},frame.y);
 kit.finish(group);group.updateMatrixWorld(true);
 return {group,colliders,
  point:(x,y,z)=>new THREE.Vector3(x,y,z).applyMatrix4(matrix),
  direction:(x,y,z)=>new THREE.Vector3(x,y,z).transformDirection(matrix)};
}
const higa=build();
const near=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<1e-5,`${label}: ${actual} versus ${expected}`);

test('the shelf entered during the MCP walk is now solid in Higa’s actual rotated frame',()=>{
 const shelf=higa.colliders.find(c=>c.id==='liquor-shelves');
 assert.ok(shelf);
 assert.equal(standingHitsRect(7.46037,8.75,.28,floor,shelf),true);
 const counter=higa.colliders.find(c=>c.id==='liquor-counter');
 assert.equal(standingHitsRect(6.7,8.75,.28,floor,counter),true);
 assert.equal(higa.colliders.filter(c=>c.id==='liquor-pot').length,2);
});

test('drawn shelf and counter faces match their colliders after rotation and elevation',()=>{
 for(const frame of [higaFrame,{x:-12,z:3,y:.7,yaw:.37},{x:2,z:-4,y:0,yaw:0}]){
  const shop=frame===higaFrame?higa:build(frame);
  for(const [id,y] of [['liquor-shelves',floor+2.26],['liquor-counter',floor+.98]]){
   const collider=shop.colliders.find(c=>c.id===id);
   const ray=new THREE.Raycaster(shop.point(0,y,D+.5),shop.direction(0,0,-1));
   const hit=ray.intersectObject(shop.group,true)[0];
   assert.ok(hit,`${id}: a real drawn face is present`);
   const front=shop.direction(0,0,1);
   const clear=hit.point.clone().addScaledVector(front,.30);
   const overlap=hit.point.clone().addScaledVector(front,.26);
   assert.equal(standingHitsRect(clear.x,clear.z,.28,frame.y+floor,collider),false,`${id}: clearance in front of the visible face`);
   assert.equal(standingHitsRect(overlap.x,overlap.z,.28,frame.y+floor,collider),true,`${id}: touching the visible face is blocked`);
   near(collider.minY,frame.y+floor,`${id} starts at the finished floor`);
  }
 }
});

test('the open recess has one visible 8 cm floor and a stepable approach from the street',()=>{
 const customer=higa.point(0,0,D-.1);
 const ray=new THREE.Raycaster(new THREE.Vector3(customer.x,.7,customer.z),new THREE.Vector3(0,-1,0));
 const floorHit=ray.intersectObject(higa.group,true)[0];
 assert.ok(floorHit);
 near(floorHit.point.y,floor,'the former 30 cm plinth no longer hides the tiles');
 const walk=createWalkSurface({minX:4,maxX:14,minZ:5,maxZ:13,base:()=>0,cell:.05});
 walk.add(higa.group);
 near(walk.lift(customer.x,customer.z),floor,'feet use the drawn floor height');
 let previous=0;
 for(let x=4.8;x<=6.001;x+=.05){
  const y=walk.lift(x,8.75);
  assert.ok(canStepBetween(previous,y),`walkable threshold at x=${x}`);
  assert.ok(y<=floor+1e-5,'furniture is not sampled as a walkable floor');
  previous=y;
 }
});

test('the customer reaches the counter from the pavement and stops before walking through it',()=>{
 const blocked=(x,z)=>higa.colliders.some(c=>standingHitsRect(x,z,.28,floor,c));
 assert.equal(sweepFraction({x:4.8,z:8.75},{x:6,z:8.75},blocked,.04),1);
 assert.ok(sweepFraction({x:6,z:8.75},{x:7.46037,z:8.75},blocked,.04)<.1,
  'the actual counter stops the old walk through the fittings');
 assert.equal(sweepFraction({x:6,z:8.75},{x:4.8,z:8.75},blocked,.04),1);
});

test('the other shop-house types keep their three shell colliders and open customer fronts',()=>{
 for(const kind of ['zenzai','post','fish','sweets','laundry','shelves']){
  const shop=build({x:0,z:0,y:0,yaw:0},kind);
  assert.equal(shop.colliders.filter(c=>c.id==='shop-house').length,3,`${kind}: shell is retained`);
  assert.ok(shop.colliders.every(c=>!c.id.startsWith('liquor-')),`${kind}: no liquor fittings added`);
  assert.equal(shop.colliders.some(c=>standingHitsRect(0,D-.2,.28,0,c)),false,`${kind}: frontage stays open`);
 }
});
