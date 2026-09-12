import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {preloadResidentialStreet} from '../src/world/residential-street.js';
import {RESIDENTIAL,RESIDENTIAL_BUILDINGS,RESIDENTIAL_ENTRIES} from '../src/world/residential-layout.js';
import {RESIDENTS,YURI_PROFILE} from '../src/people/residents.js';
import {YURI_HOME_DOOR} from '../src/people/social.js';
import {routeAt,groundHeight} from '../src/world/layout.js?snappy=1';
import {createNavigation} from '../src/people/navmesh.js?snappy=1';
import {circleHitsRect,townBoundsBlocked} from '../physics.js?snappy=1';
import {lanePatches} from '../src/world/lane-surfaces.js?snappy=1';

function make(){
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
 const actions=[],entered=[];const world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register:(anchor,label,fn)=>actions.push({anchor,label,fn}),onAction:(kind,name,items)=>{if(kind==='visit-home')items.find(i=>i.name.startsWith('Yuri'))?.enter();},enter:s=>entered.push(s),getPlayerPosition:()=>new THREE.Vector3()});
 return {world,sites,actions,entered};
}
const nativeFetch=globalThis.fetch;
function fetchAssets(requests=[]){globalThis.fetch=async url=>{url=url.url||url;if(String(url).startsWith('blob:'))return nativeFetch(url);const path=new URL(url).pathname.split('/assets/')[1];requests.push(path);return new Response(await readFile(new URL('../assets/'+path,import.meta.url)));};}

test('supplied residential street streams once without old houses, and keeps all ten homes and Yuri’s room connected',async()=>{
 const requests=[];const {world,sites,actions,entered}=make();fetchAssets(requests);
 try{
  assert.equal(requests.length,0);assert.equal(world.residential.ready,false);const old=[];world.group.traverse(o=>{if(/home-placeholder:|japanese-homes/.test(o.name))old.push(o);});assert.deepEqual(old,[]);
  const entry=world.details.find(e=>e.id==='residential-street');assert.ok(entry.radius>=70);assert.ok(entry.priority<=1);
  const before=JSON.stringify({colliders:world.colliders,doors:sites.map(s=>[s.id,s.door])});
  assert.deepEqual(await Promise.all([entry.load(),preloadResidentialStreet(),entry.load()]),[true,true,true]);
  assert.deepEqual(requests,['models/residential-street/willow-street.glb']);assert.equal(world.residential.group.children.filter(c=>c.name==='Willow Alley authored model').length,1);assert.equal(world.residential.ready,true);
  assert.equal(JSON.stringify({colliders:world.colliders,doors:sites.map(s=>[s.id,s.door])}),before);
  assert.equal(world.homes.size,10);assert.equal(world.colliders.filter(c=>c.id?.startsWith('DomekRdy')).length,7);
  const blocked=(x,z,r=.32)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c));const nav=createNavigation(blocked);
  for(const p of RESIDENTS){
   assert.equal(blocked(...p.home),false,p.name+' doorstep');const path=nav.path({x:0,z:46},{x:p.home[0],z:p.home[1]});assert.ok(path.length,p.name+' can walk home');assert.deepEqual(path.at(-1),p.home,'The route reaches the authored threshold, including the bus driver’s fractional doorstep');
   assert.equal(world.homes.get(p.name).building,RESIDENTIAL_ENTRIES[p.homeEntry].buildingId);
  }
  const site=sites.find(s=>s.id==='yuri-home');assert.deepEqual([site.door[0],site.door[2]],YURI_PROFILE.home);assert.deepEqual(YURI_HOME_DOOR,YURI_PROFILE.home);
  actions.find(a=>a.label==='Visit homes'&&a.anchor.position.x===YURI_PROFILE.home[0]&&a.anchor.position.z===YURI_PROFILE.home[1]).fn();assert.equal(entered[0],site);
  assert.equal(blocked(site.exitPosition[0]+Math.sin(RESIDENTS.at(-1).house.angle)*.6,site.exitPosition[2]),false,'Yuri exit faces the clear lane');
  world.homes.get('Yuri').occupied=true;world.updateHomes(1420);assert.equal(world.homes.get('Yuri').occupied,true);assert.equal(world.group.getObjectByName('resident-home-nameplates').visible,true);
 }finally{globalThis.fetch=nativeFetch;}
});

test('walking height follows the actual arched deck and never admits the canal or façades',async()=>{
 const {world}=make();fetchAssets();try{assert.equal(await preloadResidentialStreet(),true);}finally{globalThis.fetch=nativeFetch;}
 const group=world.residential.group;group.updateMatrixWorld(true);const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
 let compared=0,previous=groundHeight(RESIDENTIAL.laneX,-10);
 for(let z=-10;z< -2.7;z+=.1){
  const h=groundHeight(RESIDENTIAL.laneX,z);assert.ok(Math.abs(h-previous)<.15,'No abrupt step through the bridge');previous=h;
  ray.set(new THREE.Vector3(RESIDENTIAL.laneX,.9,z),down);ray.far=1;
  const hit=ray.intersectObjects(group.children,true).find(h=>h.point.y>.10&&h.point.y<.85);
  if(hit){assert.ok(Math.abs(h-hit.point.y)<.10,'Height follows the rendered bridge at '+z);compared++;}
  assert.ok(routeAt(RESIDENTIAL.laneX,z,.32));
 }
 for(const z of [-15,-14.8,-14.5,5.6,6,6.4]){ray.set(new THREE.Vector3(RESIDENTIAL.laneX,.9,z),down);ray.far=1;assert.ok(ray.intersectObjects(group.children,true).length,'Both lane ends have visible supporting paving');}
 assert.ok(compared>40);assert.ok(groundHeight(RESIDENTIAL.laneX,-6)>.5);
 for(const side of [-1,1])assert.equal(routeAt(RESIDENTIAL.laneX+side*2,-6,.32),null,'Water is not walkable');
 for(const p of RESIDENTS){
  const h=groundHeight(...p.home);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   ray.set(new THREE.Vector3(p.home[0],h+1.2,p.home[1]),new THREE.Vector3(dx,0,dz));ray.far=.32;
   assert.equal(ray.intersectObjects(group.children,true).length,0,p.name+' has a real clear doorstep');
  }
 }
 const local=lanePatches().filter(p=>p.x0<RESIDENTIAL.maxX&&p.x1>RESIDENTIAL.minX&&p.z0<RESIDENTIAL.maxZ&&p.z1>RESIDENTIAL.minZ);assert.equal(local.length,0,'No old paving overlays the source street');
});

test('complete self-contained asset preserves authorship and stays within the mobile geometry and texture budget',async()=>{
 const bytes=await readFile(new URL('../assets/models/residential-street/willow-street.glb',import.meta.url)),doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
 const report=JSON.parse(await readFile(new URL('../assets/models/residential-street/manifest.json',import.meta.url)));
 assert.ok(bytes.length<7_000_000);assert.ok(report.triangles<90_000);assert.equal(report.buildingCount,7);assert.equal(report.sourceTriangles,234744);
 assert.equal(doc.meshes.length,10);assert.equal(doc.materials.length,9);assert.equal(doc.images.length,27);assert.ok(doc.images.every(i=>i.bufferView!==undefined&&!i.uri));
 assert.match(doc.asset.extras.author,/Michał Solarek/);assert.match(doc.asset.extras.license,/CC-BY-4.0/);
 assert.ok(RESIDENTIAL_BUILDINGS.every(b=>doc.nodes.some(n=>n.name===b.id)));
 assert.ok(report.modules.every(m=>m.errorMetres<=.0181));assert.equal(report.baseColourSize,1024);assert.equal(report.detailTextureSize,512);
});

test('a failed residential request clears the pending cache and can recover',async()=>{
 make();const loader=await import('../src/world/residential-street.js?retry-test');globalThis.fetch=async()=>{throw Error('Offline test');};
 try{assert.equal(await loader.preloadResidentialStreet(),false);const requests=[];fetchAssets(requests);assert.equal(await loader.preloadResidentialStreet(),true);assert.equal(requests.length,1);}finally{globalThis.fetch=nativeFetch;}
});
