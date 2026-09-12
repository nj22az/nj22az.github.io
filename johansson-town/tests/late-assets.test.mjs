import {DINING} from '../src/world/dining-layout.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {alleyShopPlacement} from '../src/world/alley-shops.js';
import {preloadCharacter} from '../src/people/models.js?snappy=1';
import {circleHitsRect,sweepFraction} from '../physics.js?snappy=1';
import {routeAt} from '../src/world/layout.js?snappy=1';

test('late street, home, bench and vending assets replace placeholders without moving doors or collision',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const native=globalThis.fetch;let failYuri=true,yuriRequests=0;
 globalThis.fetch=async input=>{const url=String(input.url||input);if(url.startsWith('blob:'))return native(input);if(url.includes('town-female_casual')){yuriRequests++;if(failYuri)return new Response('',{status:503});}return new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));};
 try{
  const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
  const entered=[],world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register(o,label,fn){o.userData.hit={label,fn};},enter:site=>entered.push(site.id),onAction(){}});
  const before=JSON.stringify(world.colliders),doors=JSON.stringify(sites.map(s=>s.door));
  for(const id of ['dining-street','residential-street','sakura-bench','street-vending']){
   const entry=world.details.find(e=>e.id===id);assert.ok(entry,id);assert.equal(await entry.load(),true,id);
   assert.equal(JSON.stringify(world.colliders),before);assert.equal(JSON.stringify(sites.map(s=>s.door)),doors);
  }
  assert.equal(world.group.getObjectByName('home-placeholder:Yuri'),undefined);
  const shop=world.harbourShops.find(s=>s.id==='frontrow');assert.equal(shop.source,'Japanese street at night');assert.equal(shop.lod.getObjectByName('street-kit-placeholder'),undefined);
  assert.ok(shop.lod.getObjectByName('door-handle'));assert.ok(shop.lod.getObjectByName('door-threshold'));assert.deepEqual(sites.find(s=>s.id==='frontrow').alleyUnits,['B','C']);
  world.group.updateMatrixWorld(true);
  const placement=alleyShopPlacement('frontrow'),ray=new THREE.Raycaster(new THREE.Vector3(placement.door[0]+.2,1.3,placement.door[2]),new THREE.Vector3(-Math.sin(placement.yaw),0,-Math.cos(placement.yaw)));
  const first=ray.intersectObjects(shop.lod.children,true)[0];
  let visibleDoor=false;for(let p=first?.object;p;p=p.parent)if(p.name==='frontrow-alley-door')visibleDoor=true;
  assert.ok(visibleDoor,'The physical door is in front of the source wall');
  shop.entrance.userData.hit.fn();assert.deepEqual(entered,['frontrow']);
  const blocked=(x,z)=>!routeAt(x,z,.32)||world.colliders.some(c=>circleHitsRect(x,z,.32,c));
  for(const [a,b] of [[[0,4],[DINING.ramenDoor[0],4]],[[DINING.izakayaX,4],DINING.izakayaDoor],[[DINING.ramenDoor[0],4],DINING.ramenDoor]])assert.equal(sweepFraction({x:a[0],z:a[1]},{x:b[0],z:b[1]},blocked),1,'Dining junction and doors are clear');
  assert.equal(world.group.children.filter(o=>o.name==='East lane delivery shelf').length,0,'Retired outdoor content furniture cannot reappear after streaming');
  assert.equal(await preloadCharacter('Yuri'),false);failYuri=false;assert.equal(await preloadCharacter('Yuri'),true);assert.equal(yuriRequests,2,'A failed appearance can recover without reloading the town');
 }finally{globalThis.fetch=native;}
});
