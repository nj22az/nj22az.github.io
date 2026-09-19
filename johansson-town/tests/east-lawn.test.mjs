import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {readFile} from 'node:fs/promises';
import {installDOM} from './fixtures.mjs';
import {preloadPark,parkFoliage} from '../src/world/park.js?snappy=1';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {EAST_LAWN,buildEastLawn} from '../src/world/east-lawn.js';
import {PARK} from '../src/world/park-layout.js';
import {MAIN_ROAD} from '../src/world/main-road.js';
import {circleHitsRect} from '../physics.js';

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
  else if(routeAt(x,z,.4).id===EAST_LAWN.id&&routeAt(x+.4,z,.4)?.id===EAST_LAWN.id
   &&Math.abs(groundHeight(x+.4,z)-groundHeight(x,z))>.2)
   steps.push(x.toFixed(1)+','+z.toFixed(1)+' '+(groundHeight(x+.4,z)-groundHeight(x,z)).toFixed(2));
 }
 assert.deepEqual(off.slice(0,6),[],'Ground east of the road you still cannot stand on');
 assert.deepEqual(steps.slice(0,6),[],'The east side steps rather than slopes');
 assert.equal(routeAt(28,4).surface,'grass');
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
 assert.ok(!routeAt(EAST_LAWN.maxX+1.5,0),'The lawn runs past the seawall');
 configureTownMode(TOWN_MODES.LEGACY);
 assert.ok(!routeAt(28,4),'Only the peninsula has an east side to stand on');
 configureTownMode(TOWN_MODES.PENINSULA);
});

test('the seawall stops you, and the sand below it stays above the ground it lies on',()=>{
 installDOM();
 const parent=new THREE.Group(),colliders=[];
 const {shore}=buildEastLawn({parent,colliders});
 const wall=colliders.filter(c=>c.id==='east-seawall');
 assert.equal(wall.length,2,'The wall returns along the south side to close the corner');
 for(const z of [-30,-10,10,20])assert.ok(wall.some(c=>circleHitsRect(EAST_LAWN.wall.x,z,.36,c)),'You can walk through the seawall at z='+z);
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

test('the lawn wears the supplied park\u2019s own grass rather than a green of its own',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
 const original=fetch;
 globalThis.fetch=async url=>String(url).startsWith('blob:')?original(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  const bare=buildEastLawn({parent:new THREE.Group(),colliders:[]});
  // Before the model arrives the lawn is a plain green, and says so rather than
  // quietly claiming it dressed itself.
  assert.equal(bare.useParkGreenery(parkFoliage()),false);
  assert.equal(bare.lawn.material.map,null);

  assert.equal(await preloadPark(),true);
  const {grass,bush}=parkFoliage();
  assert.ok(grass?.image,'The park model carries no lawn texture');
  assert.ok(bush?.image,'The park model carries no shrub texture');
  const lawn=buildEastLawn({parent:new THREE.Group(),colliders:[]});
  assert.equal(lawn.useParkGreenery({grass,bush}),true);
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
  assert.equal(lawn.shrubs.material.map,bush,'The shrubs kept a colour of their own');
  // The attribute has to survive, because the section renderer reads it every frame
  // once it has seen it. What it must never hold is white: in the running game the
  // cel pass had already swapped the shrubs' material for a MeshToonMaterial of its
  // own, so the leaf went onto an orphan and only the whitening landed, and the lawn
  // grew twenty-nine white blobs. A light green reads as planting either way.
  assert.ok(lawn.shrubs.instanceColor,'Dropping the attribute outright crashes the section renderer');
  const tints=[...lawn.shrubs.instanceColor.array];
  assert.ok(!tints.every(v=>v===1),'The shrubs go white when the leaf fails to land');
  // Colours are held in linear working space, so these are not the sRGB bytes.
  assert.ok(tints.every(v=>v>.6),'The tint is too dark to let the park leaf read through it');
  for(let i=0;i<tints.length;i+=3)assert.ok(tints[i+1]>tints[i]&&tints[i+1]>tints[i+2],'A shrub is not tinted green');
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
