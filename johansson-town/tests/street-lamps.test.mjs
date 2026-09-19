import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {
 buildStreetLamps,STREET_LAMP_PLACEMENTS,placementsClearOfInfrastructure,SHOP_DOOR_CLEARANCE,
 LAMP_BASE_GLOW,LAMP_GLOW_SCALE,LAMP_EMISSIVE,POLE_HEIGHT,
} from '../src/world/street-lamps.js';
import {lanternGlow} from '../src/render/dusk.js';
import {SHOP_CROSSING_Z} from '../src/world/main-road.js';

const at=(h,m=0)=>h*60+m;

test('twelve late-Shōwa poles: eight shopping street + four quay approach',()=>{
 assert.equal(STREET_LAMP_PLACEMENTS.length,12);
 assert.equal(STREET_LAMP_PLACEMENTS.filter(p=>p.z>-38).length,8);
 assert.equal(STREET_LAMP_PLACEMENTS.filter(p=>p.z<=-40).length,4);
 assert.ok(placementsClearOfInfrastructure());
 for(const p of STREET_LAMP_PLACEMENTS){
  assert.notEqual(p.z,SHOP_CROSSING_Z);
  assert.ok(![-32,11,17].includes(p.z));
 }
});

test('buildStreetLamps adds visible poles, colliders, and zero PointLights',()=>{
 const parent=new THREE.Group(),colliders=[];
 const lamps=buildStreetLamps({parent,colliders,shadows:true,mobile:false});
 assert.equal(lamps.count,12);
 assert.equal(lamps.heads.length,12);
 assert.equal(lamps.pointLights,0);
 assert.equal(parent.children.includes(lamps.group),true);
 assert.equal(colliders.length,12);
 let points=0,heads=0;
 lamps.group.traverse(o=>{
  if(o.isPointLight)points++;
  if(o.userData?.streetLampHead){
   heads++;
   assert.equal(o.userData.dynamicProp,true);
   assert.ok(!o.userData.staticProp);
  }
 });
 assert.equal(points,0);
 assert.equal(heads,12);
 assert.equal(POLE_HEIGHT,4.2);
});

test('milk-glass heads track lanternGlow (harbour emissive pattern)',()=>{
 const lamps=buildStreetLamps({parent:new THREE.Group()});
 for(const minutes of [at(12),at(17),at(17,30),at(20),at(2),at(5,30)]){
  const glow=lanternGlow(minutes);
  lamps.update(glow);
  const expected=LAMP_BASE_GLOW+glow*LAMP_GLOW_SCALE;
  for(const head of lamps.heads){
   assert.equal(head.material.emissive.getHex(),LAMP_EMISSIVE);
   assert.ok(Math.abs(head.material.emissiveIntensity-expected)<1e-9);
  }
 }
 // Day: near base; night: near full
 lamps.update(0);
 assert.ok(lamps.heads[0].material.emissiveIntensity<=LAMP_BASE_GLOW+1e-9);
 lamps.update(1);
 assert.ok(lamps.heads[0].material.emissiveIntensity>=LAMP_BASE_GLOW+LAMP_GLOW_SCALE-1e-9);
});

test('harbour wires street lamps into the dusk tick without new PointLights',async()=>{
 const src=await readFile(new URL('../src/world/harbour.js',import.meta.url),'utf8');
 assert.match(src,/buildStreetLamps/);
 assert.match(src,/streetLamps\.update\(lantern\)/);
 assert.match(src,/lanternGlow/);
 // Street-lamp module itself must not construct PointLights
 const mod=await readFile(new URL('../src/world/street-lamps.js',import.meta.url),'utf8');
 assert.doesNotMatch(mod,/new THREE\.PointLight/);
 assert.match(mod,/pointLights=0/);
 assert.match(mod,/dynamicProp=true/);
 assert.match(mod,/applyCelShading/);
});

test('no west-footway pole sits in a shop doorway band',()=>{
 assert.ok(placementsClearOfInfrastructure());
 for(const door of SHOP_DOOR_CLEARANCE){
  for(const p of STREET_LAMP_PLACEMENTS){
   if(p.side!==door.side)continue;
   assert.ok(
    Math.abs(p.z-door.z)>=door.halfWidth+1.2,
    `lamp z=${p.z} too close to ${door.id} door z=${door.z}`
   );
  }
 }
 // Regression: the live bug was west lamp at z=2 on Front-Row Books (z=1.6)
 assert.ok(!STREET_LAMP_PLACEMENTS.some(p=>p.side==='west'&&Math.abs(p.z-1.6)<5.6));
});
