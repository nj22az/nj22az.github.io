import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {preloadDiningStreet} from '../src/world/dining-street.js';
import {DINING,NIGHT_LANE,DINING_COLLIDERS} from '../src/world/dining-layout.js';
import {RESIDENTS} from '../src/people/residents.js';
import {RAMEN_DOOR,IZAKAYA_DOOR,residentPlan} from '../src/people/social.js';
import {createNavigation} from '../src/people/navmesh.js?snappy=1';
import {routeAt,groundHeight} from '../src/world/layout.js?snappy=1';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js?snappy=1';
import {lanePatches} from '../src/world/lane-surfaces.js?snappy=1';
import {MAIN_ROAD,SHOP_CROSSING_Z} from '../src/world/main-road.js';

function make(){installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:768,height:768,close(){}});const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));const actions=[],entered=[];const world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register:(anchor,label,fn)=>actions.push({anchor,label,fn}),onAction(){},enter:s=>entered.push(s),getPlayerPosition:()=>new THREE.Vector3()});return {world,sites,actions,entered};}
const native=globalThis.fetch;
function assets(requests=[]){globalThis.fetch=async input=>{const url=String(input.url||input);if(url.startsWith('blob:'))return native(input);const p=new URL(url).pathname.split('/assets/')[1];requests.push(p);return new Response(await readFile(new URL('../assets/'+p,import.meta.url)));};}

test('both alley halves and restaurants face Main Street, with shared streaming and stable gameplay',async()=>{
 const {world,sites,actions,entered}=make(),requests=[];assets(requests);
 try{
  const before=JSON.stringify({colliders:world.colliders,doors:sites.map(s=>s.door)}),entry=world.details.find(d=>d.id==='dining-street');assert.ok(entry.radius>=60);
  assert.deepEqual(await Promise.all([entry.load(),entry.load(),preloadDiningStreet()]),[true,true,true]);assert.deepEqual(requests,['models/dining-street/night-lane.glb']);assert.equal(world.diningStreet.group.children.length,1);
  for(const id of ['izakaya-exterior','ramen-exterior'])assert.equal(await world.details.find(d=>d.id===id).load(),true);
  assert.equal(JSON.stringify({colliders:world.colliders,doors:sites.map(s=>s.door)}),before);
  assert.ok(world.group.getObjectByName('Minato exterior'));assert.ok(world.group.getObjectByName('Supplied ramen-exterior'));
  const blocked=(x,z,r=.32)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)),nav=createNavigation(blocked);
  for(const [id,door] of [['izakaya',DINING.izakayaDoor],['ramen',DINING.ramenDoor],['crystal-room',DINING.crystalDoor]]){
   const site=sites.find(s=>s.id===id);assert.deepEqual([site.door[0],site.door[2]],door);assert.equal(blocked(...door),false);
   assert.ok(nav.path({x:0,z:NIGHT_LANE.z},{x:door[0],z:door[1]}).length,'Walk from main street to '+id);
   assert.equal(site.entryFacing,-Math.PI/2,'Entrance faces west towards the road');
   assert.equal(sweepFraction({x:MAIN_ROAD.x,z:door[1]},{x:door[0],z:door[1]},blocked),1,'Direct Main Street approach to '+id);assert.ok(door[0]<2,'Dining thresholds sit on the Main Street pavement');
  }
  actions.find(a=>a.label==='Come into Minato Izakaya').fn();actions.find(a=>a.label==='Enter Sato Ramen').fn();assert.deepEqual(entered.map(s=>s.id),['izakaya','ramen']);
  assert.deepEqual(IZAKAYA_DOOR,DINING.izakayaDoor);assert.deepEqual(RAMEN_DOOR,DINING.ramenDoor);
  for(const p of RESIDENTS)for(const m of [690,1115,1210,1420]){const plan=residentPlan(p,m);if(plan.place==='izakaya')assert.deepEqual(plan.target,DINING.izakayaDoor);if(plan.place==='ramen')assert.deepEqual(plan.target,DINING.ramenDoor);}
  world.updateDiningStreet(1);const day=world.diningStreet.lights.map(l=>l.intensity);world.updateDiningStreet(0);assert.ok(world.diningStreet.lights.every((l,i)=>l.intensity>day[i]&&!l.castShadow));
  const materials=new Set();world.diningStreet.group.traverse(o=>{if(o.isMesh)materials.add(o.material);});assert.ok([...materials].some(m=>m.emissiveMap&&m.emissiveIntensity>.3));
 }finally{globalThis.fetch=native;}
});

test('six-metre roadway and continuous pavement support the frontages without the old alley floor or wires',()=>{
 const {world}=make(),group=world.diningStreet.group;assert.equal(world.diningStreet.ready,true);world.group.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(),footways=world.group.children.filter(o=>o.name==='Main Street footway'),blocked=(x,z)=>townBoundsBlocked(x,z,.32)||world.colliders.some(c=>circleHitsRect(x,z,.32,c));
 const deckBounds=new THREE.Box3().setFromObject(world.boardwalk.deck);assert.equal(deckBounds.max.x-deckBounds.min.x,6);assert.equal((deckBounds.max.x+deckBounds.min.x)/2,MAIN_ROAD.x);
 let floors=0,draws=0;group.traverse(o=>{if(o.isMesh){draws++;assert.ok(!['ground','pole'].includes(o.material.name),'No detached spanning wires or old alley floor');}});assert.ok(draws<=30,'Keep shared material batches after splitting');
 for(let z=-17;z<27;z+=.3){
  ray.set(new THREE.Vector3(0,.7,z),new THREE.Vector3(0,-1,0));ray.far=1;const h=ray.intersectObjects(footways)[0];assert.ok(h&&Math.abs(h.point.y-groundHeight(0,z))<.04,'Visible pavement at '+z);floors++;
  for(const y of [.4,1.2,1.75])for(const dir of [[0,0,1],[0,0,-1],[1,0,0],[-1,0,0]]){ray.set(new THREE.Vector3(0,y,z),new THREE.Vector3(...dir));ray.far=.32;assert.equal(ray.intersectObjects(group.children,true).length,0,'Pavement body clearance at '+z);}
  assert.equal(blocked(0,z),false,'Continuous pavement beside every shop');
 }
 for(let z=-37;z<31;z+=.5)for(let x=MAIN_ROAD.west+.34;x<MAIN_ROAD.east-.33;x+=.3)assert.equal(blocked(x,z),false,'Furniture stays outside the narrower road: '+[x,z]);
 assert.ok(floors>140);assert.equal(lanePatches().filter(p=>p.x0<NIGHT_LANE.maxX&&p.x1>NIGHT_LANE.minX&&p.z0<NIGHT_LANE.maxZ&&p.z1>NIGHT_LANE.minZ).length,0);
 for(const c of DINING_COLLIDERS)assert.ok(world.colliders.some(r=>r.id===c.id));
 for(const x of [0,2,5,8,12])assert.equal(blocked(x,SHOP_CROSSING_Z),false,'The gap between shop rows remains a cross-street');
});

test('night lane keeps original source geometry and authorship within its mobile asset budget',async()=>{
 const b=await readFile(new URL('../assets/models/dining-street/night-lane.glb',import.meta.url)),d=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),m=JSON.parse(await readFile(new URL('../assets/models/dining-street/manifest.json',import.meta.url)));
 assert.ok(b.length<5_000_000);assert.equal(m.buildingCount,8);assert.equal(m.sourceTriangles,51687);assert.equal(m.triangles,38758);assert.ok(m.draws<=32);assert.ok(d.images.every(i=>!i.uri&&i.bufferView!==undefined));assert.match(d.asset.extras.author,/AFX/);assert.match(d.asset.extras.license,/CC-BY-4.0/);assert.ok(m.removed.some(n=>n.startsWith('Build_I')));assert.ok(m.retained.some(n=>n.startsWith('ven_')));
});

test('failed dining download clears pending state and recovers on retry',async()=>{
 make();const loader=await import('../src/world/dining-street.js?retry-test');globalThis.fetch=async()=>{throw Error('Offline test');};try{assert.equal(await loader.preloadDiningStreet(),false);assets();assert.equal(await loader.preloadDiningStreet(),true);}finally{globalThis.fetch=native;}
});
