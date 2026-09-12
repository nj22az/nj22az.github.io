import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js';
import {ALLEY_SHOPS,alleyShopPlacement} from '../src/world/alley-shops.js';
import {DINING_FOOTPRINTS} from '../src/world/dining-footprints.js';
import {NIGHT_LANE,diningPoint} from '../src/world/dining-layout.js';
import {assignWorkplaces} from '../src/people/workplaces.js';
import {createNavigation} from '../src/people/navmesh.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js';

test('alley businesses retain their rooms, reachable thresholds, exits and staff after streaming',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:768,height:768,close(){}});
 const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
 const entered=[],actions=[];
 const world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register:(o,label,fn)=>actions.push({o,label,fn}),enter:s=>entered.push(s),onAction(){}});
 const blocked=(x,z,r=.35)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c));
 const nav=createNavigation(blocked),before=JSON.stringify(sites.map(s=>s.door));
 assignWorkplaces(world,sites);
 for(const id of Object.keys(ALLEY_SHOPS)){
  const site=sites.find(s=>s.id===id),p=alleyShopPlacement(id),action=actions.filter(a=>a.label==='Enter '+site.title);
  assert.equal(action.length,1,'one entrance per business');action[0].fn();assert.equal(entered.at(-1),site,'original site object selects its existing room');
  assert.equal(world.group.getObjectByName('japanese-shop:'+id),undefined,'old exterior removed');
  assert.equal(world.details.some(d=>d.id==='street-shop:'+id),false,'old exterior cannot return on a late load');
  assert.deepEqual(site.exitPosition,site.door);
  assert.equal(blocked(p.door[0],p.door[2]),false,id+' threshold');
  const path=nav.path({x:0,z:18},{x:p.door[0],z:p.door[2]});assert.ok(path.length,id+' staff route');
  assert.deepEqual(path.at(-1),[p.door[0],p.door[2]],'resident reaches actual doorway');
  const exit={x:p.door[0]+Math.sin(site.entryFacing)*.6,z:p.door[2]+Math.cos(site.entryFacing)*.6};
  assert.equal(blocked(exit.x,exit.z),false,id+' exit stays clear of opposite building');
  assert.equal(sweepFraction({x:p.door[0],z:p.door[2]},exit,blocked),1,id+' exit movement');
  const staff=world.people.find(person=>person.profile.workSite===id);assert.ok(staff);assert.deepEqual(staff.profile.work,[p.door[0],p.door[2]]);
 }
 const native=globalThis.fetch;
 globalThis.fetch=async input=>String(input).startsWith('blob:')?native(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{assert.equal(await world.details.find(d=>d.id==='dining-street').load(),true);}finally{globalThis.fetch=native;}
 assert.equal(JSON.stringify(sites.map(s=>s.door)),before,'streaming cannot move doors');
 world.group.updateMatrixWorld(true);
 const backs=world.group.getObjectByName('sealed-alley-building-backs');assert.ok(backs);
 assert.equal(backs.geometry.index.count/3,8*24*12,'all closures are one modest static mesh');
 const ray=new THREE.Raycaster();
 for(const b of DINING_FOOTPRINTS.filter(b=>b.id.length===1)){
  const left=b.max[0]<0,rear=left?b.min[0]+.16:b.max[0]-.16;
  for(const t of [.12,.4,.7,.9])for(const y of [.3,1.7,3.5]){
   const z=b.min[2]+(b.max[2]-b.min[2])*t;
   // Both exterior and interior views see an opaque rear face.
   for(const side of [-1,1]){
    const [wx,wz]=diningPoint(rear+side*.4,z);ray.set(new THREE.Vector3(wx,y+NIGHT_LANE.y,wz),new THREE.Vector3(0,0,-side));ray.far=.6;
    assert.ok(ray.intersectObject(backs).length,b.id+' rear closed at '+y);
   }
  }
 }
 for(const id of Object.keys(ALLEY_SHOPS)){
  const p=alleyShopPlacement(id),direction=new THREE.Vector3(-Math.sin(p.yaw),0,-Math.cos(p.yaw));
  ray.set(new THREE.Vector3(p.door[0]+.2,1.3,p.door[2]),direction);ray.far=2;
  const hits=ray.intersectObjects(world.group.children,true).filter(h=>h.object.layers.mask!==1<<31);
  assert.ok(hits.some(h=>h.object.name==='door-glazing'),'visible joinery at '+id);
  assert.equal(hits[0].object.name,'door-glazing','source facade does not hide '+id+' entrance');
 }
});
