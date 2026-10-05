import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {COAST_BOUNDS} from '../src/world/island-coast.js';
import {HOSHIZAKI_STORE} from '../src/world/island-plan.js';
import {planHeight,groundHeight,setWalkSurface} from '../src/world/layout.js';
import {createWalkSurface} from '../src/world/walk-surface.js';
import {createNeighbours} from '../src/people/neighbours.js';
import {createAvatarActor,updateAvatarActor} from '../src/avatars/actors.js';
import {townBoundsBlocked,standingHitsRect,canStepBetween} from '../physics.js';

function soleHeight(avatar){
 const body=avatar.root.children.find(o=>o.isSkinnedMesh&&o.visible&&!o.name.includes('outline'));
 const {position,skinIndex,skinWeight}=body.geometry.attributes;
 const feet=['footL','footR'].map(n=>body.skeleton.bones.indexOf(avatar.bones[n])),indices=[];
 for(let i=0;i<position.count;i++)if(feet.includes(skinIndex.getX(i))&&skinWeight.getX(i)>.999)indices.push(i);
 assert.ok(indices.length>20,'The actual character has skinned soles');
 const p=new THREE.Vector3();avatar.root.parent?.updateMatrixWorld(true);avatar.root.updateMatrixWorld(true);let low=Infinity;
 for(const i of indices){p.fromBufferAttribute(position,i);body.applyBoneTransform(i,p);body.localToWorld(p);low=Math.min(low,p.y);}
 return low;
}

test('Hoshizaki customers, Mina and Haru have separate standing places and a clear drawn approach',async()=>{
 installDOM();globalThis.self=globalThis;
 const {createTown}=await import('../src/world/town.js'),{createBusinesses}=await import('../src/world/businesses.js');
 const actions=[];
 const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),mobile:true,shadows:false,register(g,label){actions.push({g,label});},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
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
 const anchor=actions.find(a=>a.label==='Shop at Hoshizaki General Store');assert.ok(anchor,'The real shop action is registered');
 const at=anchor.g.getWorldPosition(new THREE.Vector3());assert.deepEqual([at.x,at.z],HOSHIZAKI_STORE.customer);
 const actors=new Map();
 const neighbours=createNeighbours({parent:new THREE.Group(),blocked,characters:{attach(g,look){if(g.name==='Haru'||g.name==='Mina')actors.set(g,createAvatarActor(g,look));}}});
 const pair=neighbours.people.filter(p=>p.spec.name==='Haru'||p.spec.name==='Mina');
 const approach=[[138,206],[138,210],[126,210],HOSHIZAKI_STORE.customer];
 const viewer={x:126,z:207.3};
 function validate(minute){
  for(let frame=0;frame<120;frame++){neighbours.update(1/60,minute,viewer);for(const actor of actors.values())updateAvatarActor(actor,1/60,frame*1000/60);}
  for(const {g,spec} of pair){
   assert.equal(g.visible,true,spec.name+' is present during the shop shift');
   assert.equal(blocked(g.position.x,g.position.z,.35),false,spec.name+' stands outside the building');
   const ground=floorAt(g.position.x,g.position.z);
   assert.ok(Math.abs(soleHeight(actors.get(g).avatar)-ground)<1e-5,spec.name+' soles touch the actual ground: '+soleHeight(actors.get(g).avatar)+' / '+ground);
   assert.ok(Math.hypot(g.position.x-at.x,g.position.z-at.z)>=.32+.35+.25,spec.name+' leaves the customer point clear with a buffer');
  }
  assert.ok(pair[0].g.position.distanceTo(pair[1].g.position)>.35*2+.25,'The two neighbours do not overlap');
  for(const points of [approach,[...approach].reverse()]){
   let [x,z]=points[0];
   for(const [tx,tz] of points.slice(1)){
    const sx=x,sz=z,n=Math.ceil(Math.hypot(tx-x,tz-z)/.04);
    for(let k=1;k<=n;k++)for(const [px,pz] of [[sx+(tx-sx)*k/n,z],[sx+(tx-sx)*k/n,sz+(tz-sz)*k/n]]){
     assert.equal(blocked(px,pz),false,'The customer capsule clears buildings at '+[px,pz]);
     assert.ok(canStepBetween(groundHeight(x,z),groundHeight(px,pz)),'Continuous approach height');
     for(const {g,spec} of pair)assert.ok(Math.hypot(g.position.x-px,g.position.z-pz)>=.32+.35+.1,'Approach clears '+spec.name+' at '+[px,pz]);
     if(k%5===0||k===n)floorAt(px,pz);x=px;z=pz;
    }
   }
  }
 }
 try{
  // Noon is the reported overlap: Haru collects lunch while Mina takes her break.
  neighbours.update(0,720,viewer);validate(720);
  const haru=pair.find(p=>p.spec.name==='Haru').g,forward=new THREE.Vector3(0,0,-1).applyQuaternion(haru.quaternion),toClerk=new THREE.Vector3(HOSHIZAKI_STORE.clerk[0]-haru.position.x,0,HOSHIZAKI_STORE.clerk[1]-haru.position.z).normalize();
  assert.ok(forward.dot(toClerk)>.99,'The lunch queue faces the shopkeeper');
  // Run the real routine movement back to Mina's afternoon serving position.
  neighbours.update(0,820,viewer);
  for(let frame=0;frame<90*60;frame++)neighbours.update(1/60,820,viewer);
  validate(820);
  const mina=pair.find(p=>p.spec.name==='Mina').g;assert.ok(Math.hypot(mina.position.x-HOSHIZAKI_STORE.clerk[0],mina.position.z-HOSHIZAKI_STORE.clerk[1])<.07,'Mina reaches her actual serving place');
 }finally{for(const actor of actors.values())actor.avatar.dispose();setWalkSurface(null);}
});
