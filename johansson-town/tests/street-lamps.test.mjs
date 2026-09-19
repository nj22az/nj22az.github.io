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
import {BOOKSHOP_WORKSHOP_PLOT} from '../src/world/bookshop-workshop-layout.js';

const at=(h,m=0)=>h*60+m;

test('four corner poles on the west pavement next to shop facades',()=>{
 assert.equal(STREET_LAMP_PLACEMENTS.length,4);
 assert.ok(STREET_LAMP_PLACEMENTS.every(p=>p.side==='west'));
 assert.ok(placementsClearOfInfrastructure());
 assert.ok(placementsClearOfShopDoors());
 for(const p of STREET_LAMP_PLACEMENTS){
  assert.ok(Math.abs(p.z-SHOP_CROSSING_Z)>=1.2);
  assert.ok(![-32,11,17].includes(p.z));
  // tucked next to west facade, not mid-road
  assert.ok(p.x<=-7.4);
 }
});

test('poles sit at Sakura and Front-Row corners, not in door leaves',()=>{
 assert.ok(DOOR_KEEP_CLEAR.some(z=>z.id==='frontrow'&&z.d<=3));
 assert.ok(placementsClearOfShopDoors());
 const zs=STREET_LAMP_PLACEMENTS.map(p=>p.z).sort((a,b)=>a-b);
 // Sakura corners ≈ -34.4 / -20.2; Front-Row ≈ -2.8 / ~6.8
 assert.ok(zs[0]<-33);
 assert.ok(zs[1]>-21&&zs[1]<-19);
 assert.ok(Math.abs(zs[2]-(-2.8))<0.2);
 assert.ok(zs[3]>6.2);
 // never mid-door
 assert.ok(!STREET_LAMP_PLACEMENTS.some(p=>Math.abs(p.z-BOOKSHOP_WORKSHOP_PLOT.z)<1.2));
 assert.ok(!STREET_LAMP_PLACEMENTS.some(p=>Math.abs(p.z+27.3)<1.2));
});

test('buildStreetLamps adds visible poles, colliders, and zero PointLights',()=>{
 const parent=new THREE.Group(),colliders=[];
 const lamps=buildStreetLamps({parent,colliders,shadows:true,mobile:false});
 assert.equal(lamps.count,4);
 assert.equal(lamps.heads.length,4);
 assert.equal(lamps.pointLights,0);
 assert.equal(colliders.length,4);
 let points=0,heads=0;
 lamps.group.traverse(o=>{
  if(o.isPointLight)points++;
  if(o.userData?.streetLampHead)heads++;
 });
 assert.equal(points,0);
 assert.equal(heads,4);
 assert.equal(POLE_HEIGHT,4.2);
});

test('milk-glass heads track lanternGlow (harbour emissive pattern)',()=>{
 const lamps=buildStreetLamps({parent:new THREE.Group()});
 for(const minutes of [at(12),at(17),at(20),at(2)]){
  const glow=lanternGlow(minutes);
  lamps.update(glow);
  const expected=LAMP_BASE_GLOW+glow*LAMP_GLOW_SCALE;
  for(const head of lamps.heads){
   assert.equal(head.material.emissive.getHex(),LAMP_EMISSIVE);
   assert.ok(Math.abs(head.material.emissiveIntensity-expected)<1e-9);
  }
 }
});

test('harbour wires street lamps into the dusk tick without new PointLights',async()=>{
 const src=await readFile(new URL('../src/world/harbour.js',import.meta.url),'utf8');
 assert.match(src,/buildStreetLamps/);
 const mod=await readFile(new URL('../src/world/street-lamps.js',import.meta.url),'utf8');
 assert.doesNotMatch(mod,/new THREE\.PointLight/);
 assert.match(mod,/pointLights=0/);
});
