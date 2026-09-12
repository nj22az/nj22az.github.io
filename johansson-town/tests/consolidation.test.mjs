import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createBusinesses,BUSINESS_ALIASES} from '../src/world/businesses.js';
import {ALLEY_UNITS,alleyBusinessLayout,HARBOUR_OFFICE} from '../src/world/business-layout.js';
import {buildCompactShop} from '../src/world/interiors/compact-shops.js';
import {buildBusinessContent,BUSINESS_CONTENT} from '../src/world/interiors/business-content.js';
import {createTown} from '../src/world/town.js';
import {createNavigation} from '../src/people/navmesh.js';
import {assignWorkplaces} from '../src/people/workplaces.js';
import {createWorkplaceResidents} from '../src/people/workplace-residents.js';
import {createResidentLedger} from '../src/people/resident-personalities.js';
import {suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js';
import {ITEMS} from '../content-data.js';
import {SAVE_KEY,readSave} from '../src/save.js';

function town(){installDOM();const scene=new THREE.Scene(),sites=createBusinesses(),actions=[];
 const register=(o,label,fn,inside=false)=>{o.userData.hit={label,fn,inside};actions.push(o);};
 const world=createTown({scene,sites,mobile:true,shadows:false,register,enter(){},onAction(){}});assignWorkplaces(world,sites);
 return {world,scene,sites,actions,register};
}
function roomFor(site,register){const room=new THREE.Group(),colliders=[];
 const layout=buildCompactShop({site,room,reg:register,collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action(){},exit(){}});
 const blocked=(x,z,r=.32)=>suppliedRoomBoundsBlocked(layout,x,z,r)||colliders.some(c=>circleHitsRect(x,z,r,c));
 return {room,layout,colliders,blocked};
}

test('four businesses replace the eight old addresses, with no legacy frontage or deferred model',()=>{
 const {world,sites}=town(),blocked=(x,z,r=.35)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)),nav=createNavigation(blocked);
 assert.deepEqual(sites.filter(s=>['frontrow','form3d','office','market'].includes(s.id)).map(s=>s.id),['frontrow','form3d','office','market']);
 for(const old of Object.keys(BUSINESS_ALIASES)){assert.ok(!sites.some(s=>s.id===old));assert.ok(!world.group.getObjectByName('japanese-shop:'+old));}
 assert.ok(!world.details.some(d=>d.id.startsWith('street-shop:')),'unused street kit never streams');
 for(const id of ['frontrow','form3d','office','market']){const s=sites.find(s=>s.id===id),target={x:s.door[0],z:s.door[2]};assert.ok(!blocked(target.x,target.z),id+' doorstep');const path=nav.path({x:0,z:-20},target);assert.ok(path.length,id+' route');assert.deepEqual(path.at(-1),[target.x,target.z]);}
 assert.deepEqual(sites.find(s=>s.id==='office').door,HARBOUR_OFFICE.door);
 for(const id of Object.keys(ALLEY_UNITS))assert.deepEqual(sites.find(s=>s.id===id).alleyUnits,ALLEY_UNITS[id]);
 assert.equal(world.people.length,10);assert.equal(world.homes.size,10);
});

test('compact room floors, furniture and staff approaches agree, and every content item survives once',()=>{
 const {sites,register}=town(),seen=[];
 for(const id of ['frontrow','form3d','tea-house']){
  const site=sites.find(s=>s.id===id),{room,layout,blocked}=roomFor(site,register),nav=createNavigation(blocked,{step:.16,heightAt:()=>0,bounds:layout.bounds});
  assert.ok(!blocked(layout.spawn[0],layout.spawn[2]),id+' spawn');
  assert.ok(layout.width*layout.depth<40,id+' bounded interior');
  if(id!=='tea-house')assert.deepEqual(layout.bounds,alleyBusinessLayout(id).room.bounds,'floor follows joined units');
  const targets=[...Object.values(layout.staff||{}),...room.children.filter(o=>o.userData.seat).map(o=>o.userData.seat.stand)];
  for(const [x,,z] of targets){assert.ok(!blocked(x,z),id+' stand '+[x,z]);const path=nav.path({x:layout.spawn[0],z:layout.spawn[2]},{x,z});assert.ok(path.length,id+' accessible station');let prev={x:layout.spawn[0],z:layout.spawn[2]};for(const p of path){const next={x:p[0],z:p[1]};assert.equal(sweepFraction(prev,next,blocked),1,id+' furniture clearance');prev=next;}}
  const content=buildBusinessContent({site,room,register,onInspect(){}});for(const [item,object] of content.objects){seen.push(item);assert.ok(!suppliedRoomBoundsBlocked(layout,object.position.x,object.position.z,.04),item+' within floor');}
 }
 seen.push(...Object.keys(BUSINESS_CONTENT.office));assert.deepEqual(seen.sort(),ITEMS.map(i=>i.id).sort());
});

for(const [id,names] of [['frontrow',['Aya','Reiko']],['form3d',['Kenji','Tetsuo']]])test(id+' retains both workers, distinct positions, personal work and walking departures',()=>{
 const {world,scene,sites,register,actions}=town(),site=sites.find(s=>s.id===id),{room,layout,blocked}=roomFor(site,register);scene.add(room);
 const workers=names.map(name=>world.people.find(p=>p.profile.name===name));
 workers.forEach(p=>{p.g.position.set(p.profile.work[0],0,p.profile.work[1]);p.g.userData.indoors='work';p.g.visible=false;});
 const state={kenjiEscort:false},service=createWorkplaceResidents({world,parent:scene,getTargets:()=>actions,collides:blocked,getPlayerPosition:()=>null,getEntrance:()=>layout.spawn,getLayout:()=>layout,getState:()=>state,ledger:createResidentLedger(()=>state)});
 service.enter(site,720);for(const p of workers){assert.equal(p.g.userData.inWorkplace,id);assert.equal(p.g.visible,true);assert.ok(!blocked(p.g.position.x,p.g.position.z));}
 const used=new Set();
 for(let n=0;n<300;n++){service.update(.1,720+n*.05,false);for(const object of actions)if(object.userData.workers&&object.userData.reservedBy){assert.ok(object.userData.workers.includes(object.userData.reservedBy),'staff use their own work equipment');used.add(object.userData.reservedBy);}assert.ok(workers[0].g.position.distanceTo(workers[1].g.position)>.65,'staff keep separate positions');}
 assert.deepEqual([...used].sort(),[...names].sort(),'both staff perform their work');
 for(const p of workers){assert.equal(p.profile.workSite,id);assert.deepEqual(p.profile.work,[site.door[0],site.door[2]]);}
 for(let n=0;n<600;n++)service.update(.1,1320,false);
 for(const p of workers){assert.ok(!p.g.userData.inWorkplace,'leaves via the entrance');assert.equal(p.g.parent,world.group);assert.deepEqual([p.g.position.x,p.g.position.z],p.profile.work);}
 service.restore();
});

test('old saved visits merge without altering inventory, quests, content IDs or residents',()=>{
 const before={visited:['journal','frontrow','electronics','stepwise','form3d','career'],inventory:['Evening newspaper'],quest:3,kenjiEscort:'done',inspectedIds:['journal','stepwise'],residentLocations:{Reiko:{position:[0,0],indoors:'work'}}};
 const saved=readSave({getItem:key=>key===SAVE_KEY?JSON.stringify(before):null});
 assert.deepEqual(saved.visited,['frontrow','form3d','office']);for(const key of Object.keys(before).filter(k=>k!=='visited'))assert.deepEqual(saved[key],before[key]);
});
