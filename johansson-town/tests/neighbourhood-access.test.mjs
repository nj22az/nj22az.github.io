import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {townBoundsBlocked,standingHitsRect,circleHitsRect,canStepBetween} from '../physics.js';
import {groundHeight,planHeight} from '../src/world/layout.js';
import {createNavigation} from '../src/people/navmesh.js';
import {KITAHAMA,plotGate} from '../src/world/kitahama-layout.js';
import {gardenPoint,PARK_ACCESS,GARDEN_BENCHES_AUTHOR} from '../src/world/garden-layout.js';
import {SHOPPING_LANE,SHOPPING_LANE_ROWS,shoppingLanePoint} from '../src/world/shopping-lane-plan.js';
import {PARK_BENCH} from '../src/world/park-layout.js';
installDOM();globalThis.self=globalThis;
const {createTown}=await import('../src/world/town.js');const {createBusinesses}=await import('../src/world/businesses.js');
const prompts=[];
const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),townMode:'peninsula',mobile:false,shadows:false,register:(object,label)=>prompts.push({object,label}),enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
// Broad phase keeps this whole-town route audit practical without weakening collisions.
const bins=new Map(),cell=4;
for(const c of world.colliders){const reach=Math.hypot(c.w,c.d)/2+.5;for(let x=Math.floor((c.x-reach)/cell);x<=Math.floor((c.x+reach)/cell);x++)for(let z=Math.floor((c.z-reach)/cell);z<=Math.floor((c.z+reach)/cell);z++){const key=x+','+z;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(c);}}
const nearby=(x,z)=>bins.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[];
const playerBlocked=(x,z,r)=>townBoundsBlocked(x,z,r)||nearby(x,z).some(c=>standingHitsRect(x,z,r,groundHeight(x,z),c));
const npcBlocked=(x,z,r)=>townBoundsBlocked(x,z,r)||nearby(x,z).some(c=>circleHitsRect(x,z,r,c));
function arrival(nav,x,z){const route=nav.path({x:0,z:0},{x,z});assert.ok(route.length,'route to '+[x,z]);assert.ok(Math.hypot(route.at(-1)[0]-x,route.at(-1)[1]-z)<.05,'exact arrival at '+[x,z]);return route;}
// The player resolves the x and z portions of a walking frame separately. Follow
// the whole journey with that same radius, standing height and maximum step, so a
// reachable graph node alone cannot hide a pavement cliff or a blocked corner.
function walkPath(points,label,support=null){
 let [x,z]=points[0];assert.equal(playerBlocked(x,z,.32),false,label+' starting position');
 for(const [tx,tz] of points.slice(1)){
  const sx=x,sz=z,n=Math.ceil(Math.hypot(tx-x,tz-z)/.04);
  for(let k=1;k<=n;k++){
   const nx=sx+(tx-sx)*k/n,nz=sz+(tz-sz)*k/n;
   for(const [px,pz] of [[nx,z],[nx,nz]]){
    assert.ok(canStepBetween(groundHeight(x,z),groundHeight(px,pz)),label+' floor step at '+[px,pz]);
    assert.equal(playerBlocked(px,pz,.32),false,label+' blocked at '+[px,pz]);
    if(support&&(k%5===0||k===n))assert.ok(support(px,pz),label+' missing drawn floor at '+[px,pz]);x=px;z=pz;
   }
  }
 }
 assert.ok(Math.hypot(x-points.at(-1)[0],z-points.at(-1)[1])<.001,label+' arrival');
}
test('built street, yard and town hall floors take priority over nearby garden and beach banks',()=>{
 for(const [x,z] of [[-.8,18],[1.5,18],[3,18],[4.9,18],[-8.5,26],[4.5,28],[-37.2,26],[-37.2,29],[-22,20],[35,25],[39.8,26.7]])
  assert.equal(planHeight(x,z),0,'finished flat floor at '+[x,z]);
});
test('town reaches both park benches and every residential gate with ordinary collision',()=>{
 for(const blocked of [playerBlocked,npcBlocked]){const nav=createNavigation(blocked);
  const garden=arrival(nav,-23.4,34.6);assert.ok(garden.length<65,'no eastern-island detour');
  arrival(nav,PARK_BENCH.stand[0],PARK_BENCH.stand[2]);
  for(const b of GARDEN_BENCHES_AUTHOR)arrival(nav,...gardenPoint(...b.stand));
  for(const plot of KITAHAMA.plots)arrival(nav,...plotGate(plot).door);
 }
});
test('authored park walks have no height cliffs or objects across the walking centre',()=>{
 for(const route of PARK_ACCESS)for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.1);let last=groundHeight(...a);
  for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n,h=groundHeight(x,z);assert.ok(Math.abs(h-last)<.18,route.id+' height seam');assert.equal(playerBlocked(x,z,.32),false,route.id+' obstruction at '+[x,z]);last=h;}
 }
});
test('rendered paths remain connected after the game installs its walking surface',async()=>{
 const {createWalkSurface}=await import('../src/world/walk-surface.js');const {setWalkSurface}=await import('../src/world/layout.js');
 const surface=createWalkSurface({minX:-45,maxX:65,minZ:-38,maxZ:98,base:planHeight});surface.add(world.group);setWalkSurface(surface);
 try{
  walkPath([[2.6,18],[3.6,18]],'north Main Street pavement');
  const floorBins=new Map(),ray=new THREE.Raycaster();world.group.updateMatrixWorld(true);
  world.group.traverse(o=>{if(!o.isMesh||o.material?.transparent)return;for(let p=o;p;p=p.parent)if(!p.visible||p.userData.dynamicProp)return;const b=new THREE.Box3().setFromObject(o);for(let x=Math.floor(b.min.x/4);x<=Math.floor(b.max.x/4);x++)for(let z=Math.floor(b.min.z/4);z<=Math.floor(b.max.z/4);z++){const key=x+','+z;if(!floorBins.has(key))floorBins.set(key,[]);floorBins.get(key).push(o);}});
  // The walking raster can carry a neighbouring slab edge by a few centimetres;
  // require a real supporting facet within 6 cm, well below the 24 cm step limit.
  const support=(x,z)=>{const y=groundHeight(x,z);ray.set(new THREE.Vector3(x,y+.24,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(floorBins.get(Math.floor(x/4)+','+Math.floor(z/4))||[],false).some(hit=>hit.point.y>=y-.06&&hit.point.y<=y+.06);};
  walkPath([[0,14],[0,27],[-5.4,27],[-8,34.6],[-5.4,36.9],[1.9,36.9],[1.9,66]],'town to Kitahama footpath',support);
  walkPath([[0,14],[0,27],[3.3,27],SHOPPING_LANE.entry,SHOPPING_LANE.exit,[1.9,SHOPPING_LANE.exit[1]],[1.9,66]],'Main Street through Rainflower to Kitahama',support);
  for(const z of SHOPPING_LANE.crosswalks)walkPath([[-5.4,z],[10.8,z]],'Rainflower cross street '+z,support);
  walkPath([[3.3,36.9],[-5.4,36.9],[-5.4,40],[-23.4,40.6]],'Rainflower to park',support);
  walkPath([[3.3,33],shoppingLanePoint(99.9,SHOPPING_LANE_ROWS[0]+.5)],'Rainflower florist counter',support);
  walkPath([[3.3,48.6],shoppingLanePoint(99.35,SHOPPING_LANE_ROWS[2])],'Blue Coral counter',support);
  const nav=createNavigation(playerBlocked);const garden=arrival(nav,-23.4,34.6);assert.ok(garden.length<65);walkPath(garden,'town to garden');
  for(const plot of KITAHAMA.plots){walkPath(arrival(nav,...plotGate(plot).door),'town to '+plot.id);const [x,z]=plotGate(plot).door,route=nav.path({x:3.3,z:36.9},{x,z});assert.ok(route.length);assert.ok(Math.hypot(route.at(-1)[0]-x,route.at(-1)[1]-z)<.05);walkPath(route,'Rainflower to '+plot.id,support);}
  walkPath(arrival(nav,...gardenPoint(...GARDEN_BENCHES_AUTHOR[1].stand)),'town to garden bench');
 }finally{setWalkSurface(null);}
});
test('Rainflower geometry, staff, map and collision share the compact central location',async()=>{
 const group=world.group.getObjectByName('Rainflower shopping lane'),b=new THREE.Box3().setFromObject(group);
 assert.ok(b.min.x>=-4.7&&b.max.x<=11.3&&b.min.z>=29&&b.max.z<=53.7,'shops and entrance sign fit between garden, town hall and residential park');
 const lane=world.landmarks.find(s=>s.id==='rainflower-lane');assert.deepEqual([lane.x,lane.z],SHOPPING_LANE.entry);
 const colliders=world.colliders.filter(c=>c.rainflower);assert.ok(colliders.length>15);for(const c of colliders)assert.ok(c.x>=SHOPPING_LANE.minX&&c.x<=SHOPPING_LANE.maxX&&c.z>=SHOPPING_LANE.minZ&&c.z<=SHOPPING_LANE.maxZ,'central collider '+c.id);
 const {NEIGHBOURS}=await import('../src/people/neighbours.js'),{FLOWER_SHOP}=await import('../src/world/flower-shop.js');assert.deepEqual(NEIGHBOURS.find(n=>n.name===FLOWER_SHOP.staff).at,FLOWER_SHOP.staffAt);assert.ok(FLOWER_SHOP.x<11&&FLOWER_SHOP.z<40);
 const buy=new THREE.Vector3();prompts.find(p=>p.label==='Buy a Rainflower bouquet · ¥250').object.getWorldPosition(buy);const expected=shoppingLanePoint(99.9,SHOPPING_LANE_ROWS[0]+.5);assert.ok(Math.hypot(buy.x-expected[0],buy.z-expected[1])<.001,'registered counter moves with the visible shop');assert.ok(Math.hypot(buy.x-FLOWER_SHOP.staffAt[0],buy.z-FLOWER_SHOP.staffAt[1])>.7,'the full-size clerk leaves room for a customer');
 assert.equal(world.colliders.some(c=>circleHitsRect(90,113,.32,c)),false,'the former remote street is clear land');
 const terrain=world.group.getObjectByName('Continuous neighbourhood garden ground'),ray=new THREE.Raycaster();
 // The compact lane must not bury the existing service corner under its bank.
 for(const [x,z] of [[10.1,52.25],[11.5,52.75],[12.75,53.25]]){ray.set(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(terrain)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-(KITAHAMA.y+.006))<.005,'Well Lane ground stays below the cage and lane slab at '+[x,z]);}
});
test('dry-weather garden visits use the existing residents and respect rain routines',async()=>{
 const {residentPlan}=await import('../src/people/social.js');const {RESIDENTS}=await import('../src/people/residents.js');
 const {sleepHours,homeRoutine}=await import('../src/people/home-life.js'),reiko=RESIDENTS.find(p=>p.name==='Reiko'),{wake}=sleepHours(reiko);
 assert.equal(homeRoutine(reiko,wake+16).id,'breakfast');assert.equal(residentPlan(reiko,wake+16,false,{}).place,'home','breakfast finishes before the garden trip');
 assert.equal(residentPlan(reiko,690,false,{}).place,'home','the former garden fixture is now inside the authored wake/preparation hour');
 for(const [name,minute] of [['Reiko',wake+65],['Tetsuo',780]]){const profile=RESIDENTS.find(p=>p.name===name),plan=residentPlan(profile,minute,false,{});assert.equal(plan.place,'park');assert.ok(plan.activity.includes('Aoba Garden'));assert.ok(plan.target[0]<0&&plan.target[1]>34);assert.notEqual(residentPlan(profile,minute,true,{}).place,'park');}
});

test('visible garden approaches match walking heights across the whole entrance, not only the path',()=>{
 // Nishi's slabs and the former terminus lawn cover the garden bank at the south
 // approach. Compare physics to those finished floors, including where they overlap.
 world.group.updateMatrixWorld(true);const surfaces=[];world.group.traverse(o=>{if(['Continuous neighbourhood garden ground','Aoba lowland shared terrain','Island land','Main Street end lawn'].includes(o.name)||/^Okinawan quarter:(matte|sand)\|/.test(o.name))surfaces.push(o);});
 const ray=new THREE.Raycaster();for(const x of [-34,-29,-24,-19,-14,-9])for(const z of [29,30.5,32,33.5,35]){ray.set(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(surfaces,false)[0];assert.ok(hit,'drawn ground at '+[x,z]);assert.ok(Math.abs(hit.point.y-groundHeight(x,z))<.025,'visible height disagrees at '+[x,z]+': '+hit.point.y+' / '+groundHeight(x,z));}
 const {position,normal}=world.group.getObjectByName('Continuous neighbourhood garden ground').geometry.attributes;for(let i=0;i<position.count;i++)assert.ok(normal.getY(i)>0,'upward terrain normal');
});
