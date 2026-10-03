import {test} from 'node:test';
import {kitanoRoadAt} from '../src/world/kitano-link-plan.js';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {readFile} from 'node:fs/promises';
import {installDOM} from './fixtures.mjs';
import {preloadPark,parkFoliage} from '../src/world/park.js?snappy=1';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {EAST_LAWN,buildEastLawn} from '../src/world/east-lawn.js';
import {PARK,COURT_TERRACE,courtTerraceHeight} from '../src/world/park-layout.js';
const nearTerraceWall=(x,z)=>z<COURT_TERRACE.minZ+.1&&x>COURT_TERRACE.minX-.6&&x<COURT_TERRACE.maxX;
import {paintedTurf} from '../src/render/toy-surfaces.js';
import {MAIN_ROAD} from '../src/world/main-road.js';
import {circleHitsRect} from '../physics.js';
import {GATEBALL_ACTIVE} from '../src/world/okinawa/layout.js';

/** The peninsula land sits at this height, and the surrounding sea at this one. */
const LAND=-.4,WATER=-.56;

test('the east of the town is one green from the kerb to the seawall',async()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 const {routeAt,groundHeight}=await import('../src/world/layout.js?east-lawn');
 // Everything between the pavement and the wall is walkable at pavement level, which
 // is what it was not: the park was an island and the rest was scenery below the kerb.
 const off=[],steps=[];
 for(let x=MAIN_ROAD.pavementEast;x<EAST_LAWN.maxX-.6;x+=.4)for(let z=EAST_LAWN.minZ+.6;z<EAST_LAWN.maxZ-.6;z+=1.2){
  if(!routeAt(x,z,.4))off.push(x.toFixed(1)+','+z.toFixed(1));
  // Walking east must never be a step up. The park used to be a plinth with a
  // vertical face, and excluding its square from the lawn left a dead band one body
  // wide at its foot: you walked into an invisible wall on open grass.
  // The gateball terrace ends in a retaining wall on its seaward side.
  // Kitano Road's embankment has retaining walls of its own; the lawn meets them, not the road.
  else if(!nearTerraceWall(x,z)&&!nearTerraceWall(x+.4,z)&&!kitanoRoadAt(x,z,-.5)&&!kitanoRoadAt(x+.4,z,-.5)&&routeAt(x,z,.4).id===EAST_LAWN.id&&routeAt(x+.4,z,.4)?.id===EAST_LAWN.id
   &&Math.abs(groundHeight(x+.4,z)-groundHeight(x,z))>.2)
   steps.push(x.toFixed(1)+','+z.toFixed(1)+' '+(groundHeight(x+.4,z)-groundHeight(x,z)).toFixed(2));
 }
 assert.deepEqual(off.slice(0,6),[],'Ground east of the road you still cannot stand on');
 assert.deepEqual(steps.slice(0,6),[],'The east side steps rather than slopes');
 assert.equal(routeAt(28,12).surface,'grass');
 // And the kerb itself. The pavement gives up a body's radius short of its east edge
 // and the lawn only began a radius past it, so the two together left a band 0.7m wide
 // that both would have covered and neither would accept: twenty metres of invisible
 // wall with grass on the far side of it. Walk across it at every metre of its length.
 const kerb=[];
 for(let z=EAST_LAWN.minZ+.6;z<EAST_LAWN.maxZ-.6;z+=1)
  for(let x=MAIN_ROAD.pavementEast-.6;x<=MAIN_ROAD.pavementEast+.6;x+=.15)
   if(!routeAt(x,z,.32))kerb.push(x.toFixed(2)+','+z.toFixed(1));
 assert.deepEqual(kerb.slice(0,6),[],'An invisible wall runs along the east kerb');
 // The park is asked first, so the lawn is the ground around its mound, not a lid.
 assert.equal(routeAt(PARK.x,PARK.z).id,PARK.id);
 assert.ok(groundHeight(PARK.x,PARK.z)>1,'The park keeps its mound');
 // and the lawn stops where the town does.
 assert.equal(routeAt(EAST_LAWN.maxX+1.5,10)?.surface,'sand','The beach beyond the seawall is walkable');
 configureTownMode(TOWN_MODES.LEGACY);
 assert.ok(!routeAt(28,4),'Only the peninsula has an east side to stand on');
 configureTownMode(TOWN_MODES.PENINSULA);
});

test('the seawall stops you, and the sand below it stays above the ground it lies on',()=>{
 installDOM();
 const parent=new THREE.Group(),colliders=[];
 const {shore}=buildEastLawn({parent,colliders});
 const wall=colliders.filter(c=>c.id==='east-seawall');
 assert.equal(wall.length,5,'The wall retains its south return, two beach openings and the opening for Kitano Road');
 for(const z of [-30,-15,10,19])assert.ok(wall.some(c=>circleHitsRect(EAST_LAWN.wall.x,z,.36,c)),'You can walk through the seawall at z='+z);
 // The north end is closed by something you can see rather than by ground that simply
 // stops, so the treeline is solid and stands where the trees are drawn.
 const trees=colliders.find(c=>c.id==='east-lawn-trees');
 assert.ok(trees,'The north end is left open onto unbuilt land');
 assert.ok(trees.z-trees.d/2>EAST_LAWN.maxZ-2.2,'The treeline eats the green it is meant to close');

 // Dry sand has to draw above the peninsula's own ground or the land shows through it,
 // and it has to reach below the water or the beach ends in a step.
 const [first]=EAST_LAWN.beach.profile,last=EAST_LAWN.beach.profile.at(-1);
 assert.ok(first[1]>LAND,'The beach starts below the ground it lies on');
 assert.ok(last[1]<WATER,'The beach never reaches the water');
 let previous=Infinity;
 for(const [x,y] of EAST_LAWN.beach.profile){
  assert.ok(y<previous,'The beach rises again at x='+x);previous=y;
  if(y>WATER)assert.ok(y>LAND,'Dry sand at x='+x+' is under the land at y='+y);
 }
 parent.updateMatrixWorld(true);
 const ray=new THREE.Raycaster();
 ray.set(new THREE.Vector3((EAST_LAWN.beach.profile[1][0]+EAST_LAWN.beach.profile[2][0])/2,6,0),new THREE.Vector3(0,-1,0));
 assert.equal(ray.intersectObject(shore).length,1,'No sand above the beach');
});

test('the lawn wears the park\u2019s own grass rather than a green of its own',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
 const original=fetch;
 globalThis.fetch=async url=>String(url).startsWith('blob:')?original(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  const bare=buildEastLawn({parent:new THREE.Group(),colliders:[]});
  // The lawn wears the painted turf from the first frame, and the park hands over the
  // same turf: the two greens are one field.
  assert.ok(bare.lawn.material.map?.image===paintedTurf().image,'The bare lawn is a green of its own');
  assert.equal(parkFoliage().grass?.image,paintedTurf().image,'The park is not on the town\u2019s turf');

  assert.equal(await preloadPark(),true);
  const {grass}=parkFoliage();
  assert.ok(grass?.image,'The park has no lawn texture');
  const lawn=buildEastLawn({parent:new THREE.Group(),colliders:[]});
  assert.equal(lawn.useParkGreenery({grass}),true);
  assert.equal(lawn.lawn.material.map.image,grass.image,'The lawn is not the park\u2019s grass');
  // Brought down, not left white: the supplied green is bright enough that the town's
  // sun and the grade together push it past white over an area this size.
  const tint=lawn.lawn.material.color;
  assert.ok(tint.getHex()!==0xffffff&&tint.g>tint.r&&tint.g>tint.b,'The turf is not toned down toward grass');
  assert.notEqual(lawn.lawn.material.map,grass,'The lawn tiles the park\u2019s own texture object');
  // The tiling lives in the lawn's own UVs, in metres, so it holds wherever the
  // ground goes rather than only over a flat rectangle.
  const uv=lawn.lawn.geometry.attributes.uv;let spanX=0,spanZ=0;
  for(let i=0;i<uv.count;i++){spanX=Math.max(spanX,Math.abs(uv.getX(i)));spanZ=Math.max(spanZ,Math.abs(uv.getY(i)));}
  assert.ok(spanX>4&&spanZ>4,'One tile stretched over the whole green');
  assert.deepEqual([lawn.lawn.material.map.repeat.x,lawn.lawn.material.map.repeat.y],[1,1]);
  // No shrub clumps: from the hill they read as a scatter of boulders.
  let planting=null;lawn.group.traverse(o=>{if(o.name==='East lawn planting')planting=o;});
  assert.equal(planting,null,'The boulder-like shrub clumps are back on the lawn');
 }finally{globalThis.fetch=original;}
});

test('every open patch of the east side can be walked to from the road',async()=>{
 installDOM();globalThis.self=globalThis;
 configureTownMode(TOWN_MODES.PENINSULA);
 const {routeAt,groundHeight}=await import('../src/world/layout.js?east-reach');
 const {createTown}=await import('../src/world/town.js');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const sites=createBusinesses().filter(s=>['market','frontrow'].includes(s.id));
 const {colliders}=createTown({scene:new THREE.Scene(),sites,townMode:'peninsula',mobile:false,
  shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});

 // Ground you can stand on but cannot get to is the same invisible wall seen from the
 // other side, so the question is not whether routeAt says yes — it is whether a body
 // of the player's width can walk there from the middle of the road, past every prop,
 // without climbing anything. Flood the town and then ask the east side.
 const STEP=.4,RADIUS=.32;
 const open=(x,z)=>!!routeAt(x,z,RADIUS)&&!colliders.some(c=>circleHitsRect(x,z,RADIUS,c));
 const key=(x,z)=>x.toFixed(1)+','+z.toFixed(1);
 const start=[0,0];
 assert.ok(open(...start),'The middle of the road is blocked');
 const seen=new Set([key(...start)]),queue=[start];
 while(queue.length){
  const [x,z]=queue.pop();
  for(const [dx,dz] of [[STEP,0],[-STEP,0],[0,STEP],[0,-STEP]]){
   const nx=+(x+dx).toFixed(1),nz=+(z+dz).toFixed(1);
   if(nx<-46||nx>50||nz<-74||nz>46||seen.has(key(nx,nz))||!open(nx,nz))continue;
   if(Math.abs(groundHeight(nx,nz)-groundHeight(x,z))>.45)continue;
   seen.add(key(nx,nz));queue.push([nx,nz]);
  }
 }
 const stranded=[];
 for(let x=EAST_LAWN.minX;x<=EAST_LAWN.maxX;x+=STEP)for(let z=EAST_LAWN.minZ;z<=EAST_LAWN.maxZ;z+=STEP){
  const gx=+x.toFixed(1),gz=+z.toFixed(1);
  if(open(gx,gz)&&!seen.has(key(gx,gz)))stranded.push(gx+','+gz);
 }
 assert.deepEqual(stranded.slice(0,8),[],'East-side ground you can stand on but cannot reach');
 assert.ok(seen.size>15000,'The flood stopped early: '+seen.size+' cells');

 // Thuan's break is round the back of the shop, which is only a break if she can
 // walk to it: the yard behind Sakura is reached the long way, out of the front and
 // round, so a wall or a prop across that route strands her on her own schedule.
 const {STAFF_BENCH}=await import('../src/world/staff-bench.js');
 const near=(x,z)=>key(+(Math.round(x/STEP)*STEP).toFixed(1),+(Math.round(z/STEP)*STEP).toFixed(1));
 assert.ok(seen.has(near(...STAFF_BENCH.stand)),'Thuan cannot walk to her own bench');
 assert.ok(colliders.some(c=>c.id==='sakura-staff-bench'),'The staff bench is not solid');
});

test('the paths across the green lie on the ground rather than through it',async()=>{
 installDOM();globalThis.self=globalThis;
 configureTownMode(TOWN_MODES.PENINSULA);
 const {groundHeight}=await import('../src/world/layout.js?lane-clearance');
 const {buildLaneSurfaces}=await import('../src/world/lane-surfaces.js?lane-clearance');
 const {createMaterials}=await import('../src/render/materials.js?lane-clearance');
 const parent=new THREE.Group();
 buildLaneSurfaces(parent,createMaterials());

 // The paved routes draw 4cm above the ground and the lawn 2cm, so the path is on top
 // of the grass everywhere -- at its corners. Each patch used to be laid as one quad,
 // which runs straight between those corners while the lawn beside it follows the
 // ground, so over the graded foot of the park mound the grass came up through the
 // middle of the path by as much as 8cm and lay on it in green wedges.
 const sunk=[];let checked=0;
 for(const mesh of parent.children){
  if(!mesh.isMesh||!mesh.name.startsWith('grid-lanes'))continue;
  const position=mesh.geometry.attributes.position,index=mesh.geometry.index;
  for(let t=0;t<index.count;t+=3){
   const corners=[index.getX(t),index.getX(t+1),index.getX(t+2)];
   const x=corners.reduce((s,i)=>s+position.getX(i),0)/3;
   const y=corners.reduce((s,i)=>s+position.getY(i),0)/3;
   const z=corners.reduce((s,i)=>s+position.getZ(i),0)/3;
   checked++;
   // 2cm is where the lawn draws; anything at or below that shows through it.
   const clearance=y-(groundHeight(x,z)+.02);
   if(clearance<-.005)sunk.push(x.toFixed(1)+','+z.toFixed(1)+' by '+(-clearance*100).toFixed(1)+'cm');
  }
 }
 assert.ok(checked>1200,'The lanes are not subdivided at all: '+checked+' triangles');
 assert.deepEqual(sunk.slice(0,6),[],'Paving sunk under the grass it is laid on');
});

test('the gateball court stands level on the hill\u2019s ground, graded into it, walled toward the sea',{skip:!GATEBALL_ACTIVE&&'the court is switched off (okinawa/layout.js GATEBALL_ACTIVE)'},async()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 const {groundHeight}=await import('../src/world/layout.js?terrace');
 const T=COURT_TERRACE;
 for(let x=T.minX+.2;x<T.maxX;x+=.8)for(let z=T.minZ+.2;z<T.maxZ;z+=.8)assert.equal(groundHeight(x,z),T.height,'The court is not level at '+[x,z]);
 // Up on the hill's ground, not in a pit below it.
 assert.ok(T.height>.5);
 // From the hill and the lawn beside it, the ground comes to the terrace without a step.
 for(const [x0,z0,dx,dz] of [[T.minX-3,-34,1,0],[22,T.maxZ+2.5,0,-1],[30,T.maxZ+2.5,0,-1]]){
  let last=groundHeight(x0,z0);
  for(let i=1;i<=16;i++){const h=groundHeight(x0+dx*i*.2,z0+dz*i*.2);assert.ok(Math.abs(h-last)<.12,'A step onto the terrace near '+[x0+dx*i*.2,z0+dz*i*.2]);last=h;}
 }
 // Toward the sea there is no bank: the wall holds the terrace up.
 assert.equal(courtTerraceHeight(25,T.minZ-.2,0),null);
 const parent=new THREE.Group(),colliders=[];
 const {buildOkinawaQuarters}=await import('../src/world/okinawa/quarters.js');
 buildOkinawaQuarters({group:parent,colliders},{register(){},onAction(){},shadows:false});
 const wall=colliders.filter(c=>c.id==='gateball-wall');
 assert.ok(wall.length&&wall.every(c=>c.z<T.minZ),'The terrace has no retaining wall on its seaward side');
 assert.ok(wall.some(c=>circleHitsRect(25,T.minZ-.25,.3,c)),'You can walk off the terrace over the wall');
});

