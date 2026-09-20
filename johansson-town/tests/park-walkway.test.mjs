import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js';
import {createBusinesses} from '../src/world/businesses.js';
import {TOWN_MODES} from '../src/world/town-mode.js';
import {groundHeight,routeAt} from '../src/world/layout.js?snappy=1';
import {PARK_BENCH} from '../src/world/park-layout.js';
import {PARK_LAMP_PLACEMENTS,onParkWalkway} from '../src/world/park-walkway-layout.js';
import {PARK_PAVING_Y,PARK_POOL_Y} from '../src/world/park-walkway.js';
import {applyCelShading} from '../src/render/cel.js';
import {createTownSections} from '../src/render/town-sections.js';
import {circleHitsRect} from '../physics.js';

function town(){
 installDOM();
 return createTown({scene:new THREE.Scene(),sites:createBusinesses().filter(s=>['market','frontrow'].includes(s.id)),
  townMode:TOWN_MODES.PENINSULA,mobile:true,shadows:false,register(){},onAction(){},enter(){}});
}

test('a full-width route connects the street, park bench and pond loop without obstacles',()=>{
 const world=town();
 const routes=[[[4.6,-23.8],[6.85,-23.8],[16.25,-23.8]],
  [[6.85,-23.8],[6.85,-12],[25.3,-12],[25.3,-2.9],[31.2,-2.9],[31.2,-10.7],[25.3,-10.7]]];
 for(const points of routes)for(let n=1;n<points.length;n++){
  const [ax,az]=points[n-1],[bx,bz]=points[n],length=Math.hypot(bx-ax,bz-az);
  for(let d=0;d<=length;d+=.15)for(const offset of [-.52,0,.52]){
   const x=ax+(bx-ax)*d/length-(bz-az)*offset/length,z=az+(bz-az)*d/length+(bx-ax)*offset/length;
   assert.ok(routeAt(x,z,.32),'Missing ground at '+[x,z]);
   assert.ok(!world.colliders.some(c=>circleHitsRect(x,z,.32,c)),'Blocked walkway at '+[x,z]);
  }
 }
 const [x,,z]=PARK_BENCH.stand;
 assert.ok(!world.colliders.some(c=>circleHitsRect(x,z,.32,c)),'Bench exit stays clear');
 assert.equal(routeAt(18,-12).surface,'stone','Paved footsteps replace grass');
 for(const [x,z] of PARK_LAMP_PLACEMENTS)assert.ok(!onParkWalkway(x,z,.23),'Post base protrudes onto paving');
});

test('night illumination reaches the displayed materials and survives daylight, midnight and section culling',()=>{
 const world=town(),walk=world.eastLawn.walkway;
 applyCelShading(world.group);
 const scene=new THREE.Scene();scene.add(world.group);
 const camera=new THREE.PerspectiveCamera();camera.position.set(23,2,-12);camera.lookAt(28,0,-6);
 const sections=createTownSections({mobile:true}),renderer={render(){}};
 for(const [minutes,on] of [[720,false],[1035,true],[1230,true],[1440,true],[1800,false]]){
  world.update(.016,5,.5,minutes);
  assert.equal(walk.heads.material.emissiveIntensity>0,on);
  assert.equal(walk.paving.material.emissiveIntensity>0,on);
  assert.equal(walk.pools.material.opacity>0,on);
  for(const position of [{x:500,z:500},{x:26,z:-6}]){
   sections.render({renderer,scene,camera,town:world.group,position});
   assert.equal(walk.pools.visible,on);
  }
 }
 let lights=0,meshes=0;walk.group.traverse(o=>{if(o.isLight)lights++;if(o.isMesh)meshes++;});
 assert.equal(lights,0,'No new per-pixel lights or shadow maps');
 assert.equal(meshes,7,'Thirteen posts share five instanced draws, plus paving and ground spill');
});

test('paving and light spill follow the walking terrain and stop at the seawall',()=>{
 const walk=town().eastLawn.walkway;
 for(const [mesh,lift] of [[walk.paving,PARK_PAVING_Y],[walk.pools,PARK_POOL_Y]]){
  const p=mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   assert.ok(Math.abs(p.getY(i)-groundHeight(p.getX(i),p.getZ(i))-lift)<.001);
   assert.ok(p.getX(i)<33.11,'Light spill escaped over the seawall');
  }
 }
 assert.ok(PARK_POOL_Y-PARK_PAVING_Y>=.015,'Lighting and paving must not flicker');
 assert.equal(walk.pools.material.depthWrite,false);
 assert.equal(walk.pools.material.depthTest,true);
});
