import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {createBusinesses} from '../src/world/businesses.js';
import {createNavigation} from '../src/people/navmesh.js';
import {circleHitsRect,townBoundsBlocked} from '../physics.js?snappy=1';
import {routeAt,groundHeight,BOARDWALK} from '../src/world/layout.js?snappy=1';

test('consolidated harbour keeps one reachable entrance per business through detail loading',async()=>{
 installDOM();const originalFetch=globalThis.fetch,originalBitmap=globalThis.createImageBitmap,originalSelf=globalThis.self;
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  const actions=[],entered=[],scene=new THREE.Scene(),townSites=createBusinesses();
  const world=createTown({scene,sites:townSites,mobile:true,shadows:false,register:(o,label,fn)=>actions.push({o,label,fn}),enter:s=>entered.push(s.id),onAction(){}});
  const before=JSON.stringify(world.colliders),doors=JSON.stringify(townSites.map(s=>s.door));
  assert.equal(await world.details.find(d=>d.id==='dining-street').load(),true);
  assert.equal(JSON.stringify(world.colliders),before);assert.equal(JSON.stringify(townSites.map(s=>s.door)),doors);
  scene.updateMatrixWorld(true);
  assert.deepEqual(world.harbourShops.map(s=>s.id).sort(),['form3d','frontrow','office']);
  assert.ok(world.group.getObjectByName('Sakura glass storefront'));assert.ok(world.group.getObjectByName('Consolidated harbour office'));
  assert.ok(!world.details.some(d=>d.id.startsWith('street-shop:')),'No duplicate street shop can stream back in');
  const blocked=(x,z)=>townBoundsBlocked(x,z,.28)||world.colliders.some(c=>circleHitsRect(x,z,.28,c));
  const nav=createNavigation(blocked);
  for(const shop of world.harbourShops){
   const site=townSites.find(s=>s.id===shop.id),door=new THREE.Vector3(...site.door);
   assert.equal(blocked(door.x,door.z),false,shop.id+' exterior spawn');
   assert.equal(blocked(door.x+Math.sin(site.entryFacing)*.6,door.z+Math.cos(site.entryFacing)*.6),false,shop.id+' exit offset');
   assert.ok(nav.path({x:0,z:-20},door).length,shop.id+' street approach');
   const matches=actions.filter(a=>a.label==='Enter '+site.title);assert.equal(matches.length,1,'One entrance for '+shop.id);matches[0].fn();
   assert.ok(shop.lod.getObjectByName('door-handle'));assert.ok(shop.lod.getObjectByName('door-threshold'));
  }
  assert.deepEqual(entered.sort(),['form3d','frontrow','office']);
  for(let z=BOARDWALK.minZ;z<=BOARDWALK.maxZ;z+=.25){assert.equal(blocked(0,z),false,'Boardwalk centreline at '+z);assert.equal(routeAt(0,z).surface,'wood');assert.equal(groundHeight(0,z),0);}
  assert.equal(routeAt(0,25).surface,'asphalt');
  const bounds=new THREE.Box3().setFromObject(world.boardwalk.deck);assert.ok(Math.abs(bounds.max.y)<1e-6);assert.equal(bounds.min.z,BOARDWALK.minZ);assert.equal(bounds.max.z,BOARDWALK.maxZ);
  world.update(0,0,1,1002);assert.ok(world.harbourShops.every(s=>s.shutter.material.emissiveIntensity===0),'Daylight entries need no artificial glow');
  world.update(0,0,0,1080);assert.ok(world.harbourShops.every(s=>s.shutter.material.emissiveIntensity>0),'Evening door lighting remains visible');
  world.setRain(true);assert.equal(world.boardwalk.deck.material.roughness,.65);
 }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});

test('failed harbour download settles and leaves the procedural fallback available',async()=>{
 const {preloadHarbourBlock:load,buildHarbourShop:build}=await import('../src/world/harbour-block.js?failure-fixture');
 const originalFetch=globalThis.fetch,originalWarn=console.warn;globalThis.fetch=async()=>new Response('',{status:404});console.warn=()=>{};
 try{assert.equal(await load({timeoutMs:100}),false);assert.equal(build({site:{id:'market'}}),null);}
 finally{globalThis.fetch=originalFetch;console.warn=originalWarn;}
});
