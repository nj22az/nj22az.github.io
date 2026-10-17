import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {standingHitsRect} from '../physics.js';
import {groundHeight,planHeight,setWalkSurface,routeAt} from '../src/world/layout.js';
import {createWalkSurface} from '../src/world/walk-surface.js';
import {COAST_BOUNDS} from '../src/world/island-coast.js';
import {COAST_WALK,ISLAND_ROUTES} from '../src/world/island-plan.js';
import {onIslandLand} from '../src/world/coastal-ground.js';

test('the complete island circuit and Main Street residential connection are clear at walking radius',async()=>{
 installDOM();globalThis.self=globalThis;
 const {createTown}=await import('../src/world/town.js');
 const world=createTown({scene:new THREE.Scene(),sites:[],mobile:false,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 const surface=createWalkSurface({...COAST_BOUNDS,base:planHeight});surface.add(world.group);setWalkSurface(surface);
 try{
  assert.deepEqual(COAST_WALK[0],COAST_WALK.at(-1),'the coastal walk closes');
  assert.ok(COAST_BOUNDS.maxZ<=258,'unused northern land is trimmed');
  for(const path of [{id:'coastal circuit',points:COAST_WALK},...ISLAND_ROUTES.filter(r=>['island-shopping-lane','rainflower-residential-walk','kitahama-west-link'].includes(r.id))]){
   let previous=null;
   for(let i=1;i<path.points.length;i++){
    const a=path.points[i-1],b=path.points[i],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.1);
    for(let j=0;j<=steps;j++){
     const t=j/steps,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=groundHeight(x,z),where=`${path.id} at ${x.toFixed(2)},${z.toFixed(2)}`;
     assert.ok(routeAt(x,z,.32),where+' ground');assert.ok(onIslandLand(x,z),where+' stays on the island');
     assert.deepEqual(world.colliders.filter(c=>standingHitsRect(x,z,.32,y,c)).map(c=>c.id),[],where+' clear');
     if(previous!==null)assert.ok(Math.abs(y-previous)<=.24,where+' continuous floor');previous=y;
    }
   }
  }
 }finally{setWalkSurface(null);}
});
