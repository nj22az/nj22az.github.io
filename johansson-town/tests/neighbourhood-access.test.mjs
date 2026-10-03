import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {townBoundsBlocked,standingHitsRect,circleHitsRect} from '../physics.js';
import {groundHeight} from '../src/world/layout.js';
import {createNavigation} from '../src/people/navmesh.js';
import {KITAHAMA,plotGate} from '../src/world/kitahama-layout.js';
import {gardenPoint,PARK_ACCESS} from '../src/world/garden-layout.js';
import {PARK_BENCH} from '../src/world/park-layout.js';
installDOM();globalThis.self=globalThis;configureTownMode(TOWN_MODES.PENINSULA);
const {createTown}=await import('../src/world/town.js');const {createBusinesses}=await import('../src/world/businesses.js');
const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),townMode:'peninsula',mobile:false,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
// Broad phase keeps this whole-town route audit practical without weakening collisions.
const bins=new Map(),cell=4;
for(const c of world.colliders){const reach=Math.hypot(c.w,c.d)/2+.5;for(let x=Math.floor((c.x-reach)/cell);x<=Math.floor((c.x+reach)/cell);x++)for(let z=Math.floor((c.z-reach)/cell);z<=Math.floor((c.z+reach)/cell);z++){const key=x+','+z;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(c);}}
const nearby=(x,z)=>bins.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[];
const playerBlocked=(x,z,r)=>townBoundsBlocked(x,z,r)||nearby(x,z).some(c=>standingHitsRect(x,z,r,groundHeight(x,z),c));
const npcBlocked=(x,z,r)=>townBoundsBlocked(x,z,r)||nearby(x,z).some(c=>circleHitsRect(x,z,r,c));
function arrival(nav,x,z){const route=nav.path({x:0,z:0},{x,z});assert.ok(route.length,'route to '+[x,z]);assert.ok(Math.hypot(route.at(-1)[0]-x,route.at(-1)[1]-z)<.05,'exact arrival at '+[x,z]);return route;}
test('town reaches both park benches and every residential gate with ordinary collision',()=>{
 for(const blocked of [playerBlocked,npcBlocked]){const nav=createNavigation(blocked);
  const garden=arrival(nav,-23.4,34.6);assert.ok(garden.length<65,'no eastern-island detour');
  arrival(nav,PARK_BENCH.stand[0],PARK_BENCH.stand[2]);
  for(const [x,z] of [gardenPoint(-42,144.9),gardenPoint(-26,143.9)])arrival(nav,x,z);
  for(const plot of KITAHAMA.plots)arrival(nav,...plotGate(plot).door);
 }
});
test('authored park walks have no height cliffs or objects across the walking centre',()=>{
 for(const route of PARK_ACCESS)for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.1);let last=groundHeight(...a);
  for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n,h=groundHeight(x,z);assert.ok(Math.abs(h-last)<.18,route.id+' height seam');assert.equal(playerBlocked(x,z,.32),false,route.id+' obstruction at '+[x,z]);last=h;}
 }
});
test('rendered paths remain connected after the game installs its walking surface',async()=>{
 const {createWalkSurface}=await import('../src/world/walk-surface.js');const {planHeight,setWalkSurface}=await import('../src/world/layout.js');
 const surface=createWalkSurface({minX:-45,maxX:65,minZ:-38,maxZ:98,base:planHeight});surface.add(world.group);setWalkSurface(surface);
 try{const nav=createNavigation(playerBlocked);assert.ok(arrival(nav,-23.4,34.6).length<65);for(const plot of KITAHAMA.plots)arrival(nav,...plotGate(plot).door);arrival(nav,...gardenPoint(-26,143.9));}finally{setWalkSurface(null);}
});
test('dry-weather garden visits use the existing residents and respect rain routines',async()=>{
 const {residentPlan}=await import('../src/people/social.js');const {RESIDENTS}=await import('../src/people/residents.js');
 for(const [name,minute] of [['Reiko',690],['Tetsuo',780]]){const profile=RESIDENTS.find(p=>p.name===name),plan=residentPlan(profile,minute,false,{townMode:'peninsula'});assert.equal(plan.place,'park');assert.ok(plan.activity.includes('Aoba Garden'));assert.ok(plan.target[0]<0&&plan.target[1]>34);assert.notEqual(residentPlan(profile,minute,true,{townMode:'peninsula'}).place,'park');}
});

test('visible garden approaches match walking heights across the whole entrance, not only the path',()=>{
 world.group.updateMatrixWorld(true);const surfaces=[];world.group.traverse(o=>{if(['Continuous neighbourhood garden ground','Aoba lowland shared terrain','Peninsula land'].includes(o.name))surfaces.push(o);});
 const ray=new THREE.Raycaster();for(const x of [-34,-29,-24,-19,-14,-9])for(const z of [29,30.5,32,33.5,35]){ray.set(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(surfaces,false)[0];assert.ok(hit,'drawn ground at '+[x,z]);assert.ok(Math.abs(hit.point.y-groundHeight(x,z))<.025,'visible height disagrees at '+[x,z]+': '+hit.point.y+' / '+groundHeight(x,z));}
 const {position,normal}=world.group.getObjectByName('Continuous neighbourhood garden ground').geometry.attributes;for(let i=0;i<position.count;i++)assert.ok(normal.getY(i)>0,'upward terrain normal');
});
