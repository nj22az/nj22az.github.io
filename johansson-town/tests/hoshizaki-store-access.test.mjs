import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {COAST_BOUNDS} from '../src/world/island-coast.js';
import {HOSHIZAKI_STORE} from '../src/world/island-plan.js';
import {planHeight,groundHeight,setWalkSurface} from '../src/world/layout.js';
import {createWalkSurface} from '../src/world/walk-surface.js';
import {createNeighbours} from '../src/people/neighbours.js';
import {PLACES} from '../src/people/cast.js';
import {townBoundsBlocked,standingHitsRect,canStepBetween} from '../physics.js';

// The store is closed (people/cast.js PLACES: nobody keeps it since Mina left). The building stands, so its drawn
// approach must still be walkable, and no neighbour may be left standing at its counter or its door.
test('the Hoshizaki store is closed: nobody keeps or queues at it, and its drawn approach stays clear',async()=>{
 installDOM();globalThis.self=globalThis;
 assert.ok(PLACES['hoshizaki-store'].closed,'the cast says the store is closed');
 assert.ok(!Object.values(PLACES).some(p=>!p.closed&&/Hoshizaki/.test(p.name)),'no open place is the store');
 const {createTown}=await import('../src/world/town.js'),{createBusinesses}=await import('../src/world/businesses.js');
 const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),mobile:true,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 const surface=createWalkSurface({minX:COAST_BOUNDS.minX-2,maxX:COAST_BOUNDS.maxX+2,minZ:COAST_BOUNDS.minZ-2,maxZ:COAST_BOUNDS.maxZ+2,base:planHeight});surface.add(world.group);setWalkSurface(surface);
 const solids=world.colliders.filter(c=>c.x>115&&c.x<165&&c.z>175&&c.z<218);
 const blocked=(x,z,r=.32)=>townBoundsBlocked(x,z,r)||solids.some(c=>standingHitsRect(x,z,r,groundHeight(x,z),c));
 world.group.updateMatrixWorld(true);
 const floors=[];world.group.traverse(o=>{
  if(!o.isMesh||o.material?.transparent)return;
  for(let p=o;p;p=p.parent)if(!p.visible||p.userData.dynamicProp)return;
  const b=new THREE.Box3().setFromObject(o);if(b.min.x<=139&&b.max.x>=125&&b.min.z<=211&&b.max.z>=205)floors.push({mesh:o,bounds:b});
 });
 const ray=new THREE.Raycaster();
 function floorAt(x,z){
  const y=groundHeight(x,z);ray.set(new THREE.Vector3(x,y+.24,z),new THREE.Vector3(0,-1,0));
  const candidates=floors.filter(({bounds:b})=>x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z).map(o=>o.mesh);
  assert.ok(ray.intersectObjects(candidates,false).some(hit=>Math.abs(hit.point.y-y)<.025),'Visible supporting floor at '+[x,z]);return y;
 }
 const approach=[[138,206],[138,210],[126,210],HOSHIZAKI_STORE.customer];
 for(const points of [approach,[...approach].reverse()]){
  let [x,z]=points[0];
  for(const [tx,tz] of points.slice(1)){
   const sx=x,sz=z,n=Math.ceil(Math.hypot(tx-x,tz-z)/.04);
   for(let k=1;k<=n;k++)for(const [px,pz] of [[sx+(tx-sx)*k/n,z],[sx+(tx-sx)*k/n,sz+(tz-sz)*k/n]]){
    assert.equal(blocked(px,pz),false,'The approach clears buildings at '+[px,pz]);
    assert.ok(canStepBetween(groundHeight(x,z),groundHeight(px,pz)),'Continuous approach height');
    if(k%5===0||k===n)floorAt(px,pz);x=px;z=pz;
   }
  }
 }
 const neighbours=createNeighbours({parent:new THREE.Group(),blocked});
 const viewer={x:126,z:207.3};
 try{
  // Noon and the early afternoon were the store's busy hours; now nobody is there at any hour.
  for(const minute of [480,720,820,960]){
   neighbours.update(0,minute,viewer);for(let frame=0;frame<120;frame++)neighbours.update(1/60,minute,viewer);
   for(const {g,spec} of neighbours.people){
    if(!g.visible)continue;
    for(const [what,[x,z]] of [['counter',HOSHIZAKI_STORE.clerk],['door',HOSHIZAKI_STORE.customer]])
     assert.ok(Math.hypot(g.position.x-x,g.position.z-z)>1,`${spec.name} stands at the closed store’s ${what} at ${minute}`);
   }
  }
 }finally{setWalkSurface(null);}
});
