import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js';
import {ROUTES,routeAt} from '../src/world/layout.js';
import {lanePatches} from '../src/world/lane-surfaces.js';
import {circleHitsRect} from '../physics.js';
import {RESIDENTS} from '../src/people/residents.js';
import {FULL_TOWN} from '../src/world/full-town-state.js';
import {buildPark} from '../src/world/park.js';

const make=()=>{
 installDOM();
 const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
 const world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register(){},onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});
 return {world,sites};
};

test('rectangular lanes have clear centres and all homes face a reachable lane',()=>{
 const {world,sites}=make();
 const blocked=(x,z)=>!routeAt(x,z,.32)||world.colliders.some(c=>circleHitsRect(x,z,.32,c));
 for(const route of ROUTES.slice(3)){
  if(route.id==='shrine-slope')continue;
  for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i];assert.ok(a[0]===b[0]||a[1]===b[1],route.id);
   const steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);
   for(let j=0;j<=steps;j++)assert.equal(blocked(a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps),false,route.id+' at '+j);
  }
 }
 for(const p of RESIDENTS){
  assert.equal(blocked(...p.home),false,p.name+' home approach');
  const dx=p.home[0]-p.house.x,dz=p.home[1]-p.house.z;
  assert.ok(dx*Math.sin(p.house.angle)+dz*Math.cos(p.house.angle)>2,p.name+' faces its lane');
 }
 for(const site of sites){const door=site.door||[site.side*4,0,site.z+2.5];assert.equal(blocked(door[0],door[2]),false,site.id+' entrance');}
 assert.ok(world.group.getObjectByName('Sakura glass storefront'));
});

test('lane paving is partitioned without overlapping coplanar patches',()=>{
 const patches=lanePatches();assert.ok(patches.length>20);
 for(let i=0;i<patches.length;i++)for(let j=i+1;j<patches.length;j++){
  const a=patches[i],b=patches[j];
  assert.ok(Math.min(a.x1,b.x1)<=Math.max(a.x0,b.x0)||Math.min(a.z1,b.z1)<=Math.max(a.z0,b.z0),'No overlapping road faces');
 }
});

test('park curbs form the perimeter with finite coordinates and a raised path',()=>{
 installDOM();FULL_TOWN.active=true;
 try{
  const world={group:new THREE.Group(),colliders:[]};buildPark(world,{register(){},onAction(){}});
  world.group.updateMatrixWorld(true);const group=world.park.group;
  group.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite),o.name));
  const curbs=group.children.filter(o=>o.geometry?.parameters.height===.16);
  assert.equal(curbs.length,4);
  for(const curb of curbs)assert.ok(Math.abs(curb.position.x)===5.2||Math.abs(curb.position.z)===4);
  const path=group.children.find(o=>o.geometry?.parameters.width===1.8);
  assert.ok(path.position.y+path.geometry.parameters.height/2>.08);
 }finally{FULL_TOWN.active=false;}
});
