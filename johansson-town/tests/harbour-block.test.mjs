import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {preloadHarbourBlock,HARBOUR_SHOP_IDS} from '../src/world/harbour-block.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js?snappy=1';
import {routeAt,groundHeight,BOARDWALK} from '../src/world/layout.js?snappy=1';

test('harbour replacement loads real geometry, retains reachable entrances and switches LOD',async()=>{
 installDOM();const originalFetch=globalThis.fetch,originalBitmap=globalThis.createImageBitmap,originalSelf=globalThis.self;
 const game=await readFile(new URL('../src/game.js?snappy=1',import.meta.url),'utf8');
 const sites=()=>Function('return '+game.match(/const SITES=(\[[\s\S]*?\n\]);/)[1])();
 const failed=createTown({scene:new THREE.Scene(),sites:sites(),mobile:true,shadows:false,register(){},enter(){},onAction(){}});
 assert.equal(failed.harbourShops.length,0,'Without the asset the original shops remain');
 assert.ok(failed.group.children.length>0);
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  assert.equal(await preloadHarbourBlock(),true);
  const actions=[],entered=[],scene=new THREE.Scene(),townSites=sites();
  const world=createTown({scene,sites:townSites,mobile:true,shadows:false,register:(o,label,fn)=>actions.push({o,label,fn}),enter:s=>entered.push(s.id),onAction(){}});
  scene.updateMatrixWorld(true);
  assert.deepEqual([...world.quality.harbourBlock.shops].sort(),[...HARBOUR_SHOP_IDS].sort());
  assert.ok(world.quality.harbourBlock.nearTriangles<=120000);
  assert.ok(world.quality.harbourBlock.farTriangles<=36000);
  const blocked=(x,z)=>townBoundsBlocked(x,z,.28)||world.colliders.some(c=>circleHitsRect(x,z,.28,c));
  for(const shop of world.harbourShops){
   const site=townSites.find(s=>s.id===shop.id),door=new THREE.Vector3(...site.door);
   assert.equal(blocked(door.x,door.z),false,shop.id+' exterior spawn');
   assert.equal(blocked(door.x,door.z+.7),false,shop.id+' exit offset');
   assert.equal(sweepFraction({x:0,z:site.z},door,blocked),1,shop.id+' centreline approach');
   const matches=actions.filter(a=>a.label==='Enter '+site.title);assert.equal(matches.length,1,'One entrance for '+shop.id);matches[0].fn();
   const camera=new THREE.PerspectiveCamera();camera.position.set(site.side*4,1.7,site.z);camera.updateMatrixWorld(true);shop.lod.update(camera);
   assert.equal(shop.lod.levels[0].object.visible,true);assert.equal(shop.lod.levels[1].object.visible,false);
   camera.position.z+=80;camera.updateMatrixWorld(true);shop.lod.update(camera);
   assert.equal(shop.lod.levels[0].object.visible,false);assert.equal(shop.lod.levels[1].object.visible,true);
   const near=shop.lod.levels[0].object,bounds=new THREE.Box3().setFromObject(near);
   assert.ok(bounds.min.y<.001&&bounds.min.y>-.12,'Building is grounded');
   assert.ok(near.material.map&&near.material.normalMap&&near.material.roughnessMap);
   assert.equal(near.material.side,THREE.FrontSide);
   assert.equal(near.material.map.image.width,2048);
  }
  assert.deepEqual(entered.sort(),[...HARBOUR_SHOP_IDS].sort());
  for(let z=BOARDWALK.minZ;z<=BOARDWALK.maxZ;z+=.25){assert.equal(blocked(0,z),false,'Boardwalk centreline at '+z);assert.equal(routeAt(0,z).surface,'wood');assert.equal(groundHeight(0,z),0);}
  assert.equal(routeAt(0,25).surface,'asphalt');
  const bounds=new THREE.Box3().setFromObject(world.boardwalk.deck);assert.ok(Math.abs(bounds.max.y)<1e-6);assert.equal(bounds.min.z,BOARDWALK.minZ);assert.equal(bounds.max.z,BOARDWALK.maxZ);
  world.update(0,0,0,1230);assert.ok(world.harbourShops.every(s=>s.shutter.material.emissiveIntensity===0),'Closed shop entries have no open glow');
  world.update(0,0,1,1002);assert.ok(world.harbourShops.every(s=>s.shutter.material.emissiveIntensity>0));
  world.setRain(true);assert.equal(world.boardwalk.deck.material.roughness,.65);
  const manifest=JSON.parse(await readFile(new URL('../assets/models/harbour-block/manifest.json',import.meta.url),'utf8'));
  assert.ok(manifest.downloadBytes<8_000_000);assert.ok(manifest.nearTriangleReduction>.95);
 }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});

test('failed harbour download settles and leaves the procedural fallback available',async()=>{
 const {preloadHarbourBlock:load,buildHarbourShop:build}=await import('../src/world/harbour-block.js?failure-fixture');
 const originalFetch=globalThis.fetch,originalWarn=console.warn;globalThis.fetch=async()=>new Response('',{status:404});console.warn=()=>{};
 try{assert.equal(await load({timeoutMs:100}),false);assert.equal(build({site:{id:'market'}}),null);}
 finally{globalThis.fetch=originalFetch;console.warn=originalWarn;}
});
