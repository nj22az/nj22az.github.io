import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {createContentItems} from '../content-items.js?warehouse=1';
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
  for(const id of ['street-shop:frontrow','home:Yuri','sakura-bench','street-vending']){
   const entry=world.details.find(e=>e.id===id);assert.ok(entry,id);assert.equal(await entry.load(),true,id);
   assert.equal(JSON.stringify(world.colliders),before);assert.equal(JSON.stringify(sites.map(s=>s.door)),doors);
  }
  assert.equal(world.group.getObjectByName('home-placeholder:Yuri'),undefined);
  const shop=world.harbourShops.find(s=>s.id==='frontrow');assert.equal(shop.source,'Japanese Town');assert.equal(shop.lod.getObjectByName('street-kit-placeholder'),undefined);
  assert.ok(shop.lod.getObjectByName('door-handle'));assert.ok(shop.lod.getObjectByName('door-threshold'));assert.ok(shop.lod.getObjectByName('Front-Row book display'));
  world.group.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(5.5,1.7,30),new THREE.Vector3(1,0,0));
  const first=ray.intersectObjects(shop.lod.children,true)[0];
  let visibleDoor=false;for(let p=first?.object;p;p=p.parent)if(p.name==='frontrow-street-door')visibleDoor=true;
  assert.ok(visibleDoor,'The physical door is in front of the source wall');
  shop.entrance.userData.hit.fn();assert.deepEqual(entered,['frontrow']);
  createContentItems({group:world.group,colliders:world.colliders,register(){},onInspect(){},onRead(){}});
  const blocked=(x,z)=>!routeAt(x,z,.32)||world.colliders.some(c=>circleHitsRect(x,z,.32,c));
  for(const [a,b] of [[[0,18],[22.65,18]],[[18,18],[18,20]],[[22.65,18],[22.65,14.7]]])assert.equal(sweepFraction({x:a[0],z:a[1]},{x:b[0],z:b[1]},blocked),1,'Dining junction and doors are clear');
  assert.equal(world.group.children.filter(o=>o.name==='East lane delivery shelf').length,1);
  assert.equal(await preloadCharacter('Yuri'),false);failYuri=false;assert.equal(await preloadCharacter('Yuri'),true);assert.equal(yuriRequests,2,'A failed appearance can recover without reloading the town');
 }finally{globalThis.fetch=native;}
});
