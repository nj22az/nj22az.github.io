import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {preloadJapaneseTown,buildJapaneseShop,buildJapaneseHome,finishJapaneseHomes} from '../src/world/japanese-town.js';
import {RESIDENTS} from '../src/people/residents.js';
import {ROUTES} from '../src/world/layout.js?snappy=1';
import {createTown} from '../src/world/town.js?snappy=1';
import {createNavigation} from '../src/people/navmesh.js?snappy=1';
import {circleHitsRect,townBoundsBlocked} from '../physics.js?snappy=1';

test('Japanese Town kit retains the shopfronts alongside the supplied residential neighbourhood',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const originalFetch=globalThis.fetch;globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  assert.equal(await preloadJapaneseTown(),true);
  const bytes=await readFile(new URL('../assets/models/japanese-town/street-kit.glb',import.meta.url));assert.ok(bytes.length<2100000);
  const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));assert.equal(gltf.meshes.length,4);assert.equal(gltf.materials.length,1);assert.equal(gltf.images.length,3);assert.ok(gltf.images.every(i=>i.bufferView!==undefined&&!i.uri));
  const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
  const world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register(){},onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});
  assert.equal(world.harbourShops.length,7);assert.ok(world.group.getObjectByName('Sakura glass storefront'));assert.ok(world.harbourShops.every(s=>s.source==='Japanese Town'));
  const batches=[];world.group.traverse(o=>{if(o.name==='japanese-homes')batches.push(o);});assert.equal(batches.length,0,'Old kit homes are no longer used in Willow Alley');assert.equal(world.homes.size,10);assert.ok(world.residential);
  const blocked=(x,z,r=.32)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)),nav=createNavigation(blocked);
  for(const p of RESIDENTS){assert.equal(blocked(...p.home),false,p.name+' doorstep');assert.ok(nav.path({x:0,z:46},{x:p.home[0],z:p.home[1]}).length,p.name+' route');}
  for(const route of ROUTES.filter(r=>r.id.endsWith('-cut')))for(let i=1;i<route.points.length;i++)for(let t=0;t<=1;t+=.05){const a=route.points[i-1],b=route.points[i];assert.equal(blocked(a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t),false,route.id);}
  for(const shop of world.harbourShops){assert.equal(blocked(shop.entrance.position.x,shop.entrance.position.z),false);shop.update(false,0);assert.equal(shop.shutter.material.emissiveIntensity,0);shop.update(true,0);assert.ok(shop.shutter.material.emissiveIntensity>0);}
  // Grounded residential modules retain a full-height doorway and no low eaves over the walking lane.
  for(let i=0;i<2;i++){
   const group=new THREE.Group();assert.equal(buildJapaneseHome(group,{x:0,z:0,angle:0},i,{mobile:true}),true);finishJapaneseHomes(group);group.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(group,true);assert.ok(Math.abs(box.min.y)<.001);assert.ok(box.max.y>4&&box.max.y<6.5);assert.ok(box.max.x-box.min.x<4.1);
   const ray=new THREE.Raycaster(new THREE.Vector3(0,1.7,2.6),new THREE.Vector3(0,0,-1),0,.6);assert.equal(ray.intersectObjects(group.children,true).length,0,'Resident can stand at the door without intersecting decoration');
  }
 }finally{globalThis.fetch=originalFetch;}
});

test('failed town kit leaves the established exterior fallback available',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>{throw Error('Offline');};
 try{const fallback=await import('../src/world/japanese-town.js?offline-test');assert.equal(await fallback.preloadJapaneseTown(),false);assert.equal(fallback.buildJapaneseShop({site:{id:'office'}}),null);assert.equal(fallback.buildJapaneseHome(new THREE.Group(),{},0,{}),false);}finally{globalThis.fetch=original;}
});
