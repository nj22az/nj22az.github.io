import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {COASTLINE} from '../src/world/island-coast.js';
import {onIslandLand} from '../src/world/coastal-ground.js';
import {circleHitsRect} from '../physics.js';
import {OUTER_PIER} from '../src/world/layout.js';
import {HOUSEBOAT} from '../src/world/fujita-houseboat.js';
import {SHED_PIER,FUJITA_PIER} from '../src/world/fujita-layout.js';
import {OIL_JETTY} from '../src/world/oil-jetty-layout.js';
import {FLOWER_SHOP} from '../src/world/flower-shop.js';

// Check whole footprints, including edges and interiors across the concave coast.
// A small boundary tolerance accommodates Float32 rendered vertices, not scenery in water.
const land=(x,z)=>onIslandLand(x,z)||COASTLINE.some((a,i)=>{
 const b=COASTLINE[(i+1)%COASTLINE.length],dx=b[0]-a[0],dz=b[1]-a[1];
 const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
 return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<1e-4;
});
function supported(c,at=land){
 const angle=c.yaw||0,cs=Math.cos(angle),sn=Math.sin(angle),nx=Math.max(1,Math.ceil(c.w/.15)),nz=Math.max(1,Math.ceil(c.d/.15));
 for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
  const x=c.w*(i/nx-.5),z=c.d*(j/nz-.5);
  if(!at(c.x+x*cs+z*sn,c.z-x*sn+z*cs))return false;
 }
 return true;
}
const within=(b,x,z)=>x>=b.minX-1e-4&&x<=b.maxX+1e-4&&z>=b.minZ-1e-4&&z<=b.maxZ+1e-4;
// Documented structures supported by decks, not by the land polygon. These are
// bounded allowances: moving one further into the sea must still fail.
function harbourSupport(c){
 // The timber pier's rails and bollard stand on its own decks, the walkway as well as the platform (timber-pier.js).
 if(c.timberPier===FUJITA_PIER.id)return (x,z)=>FUJITA_PIER.decks.some(d=>within(d,x,z));
 if(c.portShed)return (x,z)=>within(SHED_PIER,x,z);
 if(c.houseboat)return (x,z)=>within({minX:HOUSEBOAT.x-HOUSEBOAT.width/2,maxX:HOUSEBOAT.x+HOUSEBOAT.width/2,minZ:HOUSEBOAT.z-HOUSEBOAT.length/2-HOUSEBOAT.sternExtension/2,maxZ:HOUSEBOAT.z+HOUSEBOAT.length/2-HOUSEBOAT.sternExtension/2},x,z);
 if(/^jetty-(manifold|crane)$/.test(c.id))return (x,z)=>within(OIL_JETTY.head,x,z);
 // The seaward face of the existing retaining kerb intentionally straddles land.
 if(c.id==='east-quay-edge')return (x,z)=>within({minX:18.8,maxX:41.2,minZ:-50.01,maxZ:-49.69},x,z);
 if(!c.id)return (x,z)=>within({minX:-OUTER_PIER.width/2,maxX:OUTER_PIER.width/2,minZ:OUTER_PIER.z-OUTER_PIER.length/2,maxZ:-49.7},x,z);
 return ()=>false;
}

installDOM();globalThis.self=globalThis;
const {createTown}=await import('../src/world/town.js');
const {createIslandBusinesses}=await import('../src/world/businesses.js');
const world=createTown({scene:new THREE.Scene(),sites:createIslandBusinesses(),mobile:true,kitano:'distant',shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
world.group.updateMatrixWorld(true);

test('active Minato collision footprints have land or a documented harbour deck',()=>{
 const unsupported=[];let harbour=0;
 for(const c of world.colliders){
  if(c.x>100)continue; // Separate Kitano-jima, retained unchanged.
  if(supported(c))continue;
  if(supported(c,harbourSupport(c)))harbour++;
  else unsupported.push({id:c.id||'unnamed',x:c.x,z:c.z,w:c.w,d:c.d});
 }
 assert.ok(harbour>10,'legitimate waterborne structures were exercised');
 assert.deepEqual(unsupported,[]);
 assert.equal(supported({x:50,z:40,w:1,d:1}),false,'a tree in the east sea fails');
 assert.equal(supported({x:9,z:90,w:4,d:2}),false,'a centre on land cannot hide an overhanging footprint');
 assert.equal(supported({x:0,z:100,w:3,d:2}),false,'a stall beyond the shortened coast fails');
});

test('retained planting roots do not intersect occupied building footprints',()=>{
 const roots=world.colliders.filter(c=>/fukugi|tree|gajumaru|almond|planter|banyan|harbour-cherry/.test(c.id||''));
 const buildings=world.colliders.filter(c=>/house|school-block|shop|building|flats|warehouse|depot|tank|shed/.test(c.id||''));
 assert.ok(roots.length>10,'retained garden and windbreak planting is checked');
 for(const c of roots){
  assert.ok(supported(c),`${c.id} roots supported at ${c.x},${c.z}`);
  for(const b of buildings)assert.equal(circleHitsRect(c.x,c.z,Math.max(c.w,c.d)/2,b),false,`${c.id} intersects ${b.id} at ${c.x},${c.z}`);
 }
 assert.equal(world.colliders.some(c=>c.id==='sea-almond'||c.id==='east-lawn-tree'),false,'retired planting styles cannot return');
});

test('lawn, service foundations and the florist stall remain within the compact land',()=>{
 const names=['east-lawn-grass','Compact neighbourhood ground','Fuel depot service court',FLOWER_SHOP.name];
 const found=new Set(),point=new THREE.Vector3();
 world.group.traverse(o=>{
  if(!names.includes(o.name))return;found.add(o.name);
  o.traverse(mesh=>{
   if(!mesh.isMesh)return;
   const p=mesh.geometry.attributes.position,index=mesh.geometry.index;
   // Indexed lawns contain unused grid vertices: only drawn triangles matter.
   const used=index?new Set(index.array):Array.from({length:p.count},(_,i)=>i);
   for(const i of used){point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);assert.ok(land(point.x,point.z),`${o.name} drawn vertex outside land: ${point.x},${point.z}`);}
  });
 });
 assert.deepEqual([...found].sort(),names.sort());
});

test('empty street planting does not queue a model fetch or allocate a retired treeline',()=>{
 assert.equal(world.plantSites.length,0);
 assert.equal(world.details.some(d=>d.id==='street-plants'),false);
 assert.equal(world.group.getObjectByName('East lawn tree'),undefined);
 assert.ok(world.group.getObjectByName('Harbour Park cherry leaf'),'the park tree remains');
});
