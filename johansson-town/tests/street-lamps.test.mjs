import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {
 buildStreetLamps,STREET_LAMP_PLACEMENTS,placementsClearOfInfrastructure,
 placementsClearOfShopDoors,DOOR_KEEP_CLEAR,
 LAMP_BASE_GLOW,LAMP_GLOW_SCALE,LAMP_EMISSIVE,POLE_HEIGHT,
} from '../src/world/street-lamps.js';
import {lanternGlow} from '../src/render/dusk.js';
import {SHOP_CROSSING_Z} from '../src/world/main-road.js';

const at=(h,m=0)=>h*60+m;

test('six late-Shōwa poles: four shopping street + two quay approach',()=>{
 assert.equal(STREET_LAMP_PLACEMENTS.length,6);
 assert.equal(STREET_LAMP_PLACEMENTS.filter(p=>p.z>-38).length,4);
 assert.equal(STREET_LAMP_PLACEMENTS.filter(p=>p.z<=-40).length,2);
 assert.ok(placementsClearOfInfrastructure());
 assert.ok(placementsClearOfShopDoors());
 for(const p of STREET_LAMP_PLACEMENTS){
  assert.notEqual(p.z,SHOP_CROSSING_Z);
  assert.ok(![-32,11,17].includes(p.z));
 }
});

test('no west-footway pole sits in a shop doorway / facade band',()=>{
 assert.ok(DOOR_KEEP_CLEAR.some(z=>z.id==='frontrow'));
 assert.ok(DOOR_KEEP_CLEAR.some(z=>z.id==='market'));
 assert.ok(DOOR_KEEP_CLEAR.some(z=>z.id==='izakaya'));
 assert.ok(placementsClearOfShopDoors());
 // Hard regressions from live bugs
 assert.ok(!STREET_LAMP_PLACEMENTS.some(p=>p.side==='west'&&Math.abs(p.z-1.6)<5));
 assert.ok(!STREET_LAMP_PLACEMENTS.some(p=>p.side==='west'&&Math.abs(p.z+27.3)<8));
 assert.ok(!STREET_LAMP_PLACEMENTS.some(p=>p.side==='west'&&Math.abs(p.z+10.43)<4));
});

test('buildStreetLamps adds visible poles, colliders, and zero PointLights',()=>{
 const parent=new THREE.Group(),colliders=[];
 const lamps=buildStreetLamps({parent,colliders,shadows:true,mobile:false});
 assert.equal(lamps.count,6);
 assert.equal(lamps.heads.length,6);
 assert.equal(lamps.pointLights,0);
 assert.equal(parent.children.includes(lamps.group),true);
 assert.equal(colliders.length,6);
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
 assert.equal(heads,6);
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
 const mod=await readFile(new URL('../src/world/street-lamps.js',import.meta.url),'utf8');
 assert.doesNotMatch(mod,/new THREE\.PointLight/);
 assert.match(mod,/pointLights=0/);
 assert.match(mod,/dynamicProp=true/);
 assert.match(mod,/applyCelShading/);
});
