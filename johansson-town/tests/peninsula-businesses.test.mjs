import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {configureTownMode} from '../src/world/town-mode.js';
import {createPeninsulaBusinesses,businessId,migratedVisits} from '../src/world/businesses.js';
import {createTown} from '../src/world/town.js';
import {assignWorkplaces} from '../src/people/workplaces.js';
import {createCastAI} from '../src/people/schedules.js';
import {residentPlan} from '../src/people/social.js';
import {createWorkplaceResidents} from '../src/people/workplace-residents.js';
import {createResidentLedger} from '../src/people/resident-personalities.js';
import {createNavigation} from '../src/people/navmesh.js';
import {buildCompactShop} from '../src/world/interiors/compact-shops.js';
import {buildBusinessContent,BUSINESS_CONTENT_CATALOGUE} from '../src/world/interiors/business-content.js';
import {buildWarehouseInterior} from '../src/world/interiors/warehouse.js';
import {preloadSuppliedRooms,buildSuppliedRoom,suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {TOWN_DESTINATIONS} from '../src/world/town-grid.js';
import {BOOKSHOP_WORKSHOP_ROOM} from '../src/world/bookshop-workshop-layout.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js';
import {ITEMS} from '../content-data.js';
import {createActivities} from '../activities.js';

function setup(){
 installDOM();globalThis.self=globalThis;
 const sites=createPeninsulaBusinesses(),scene=new THREE.Scene(),targets=[];
 const register=(o,label,fn,inside=false)=>{o.userData.hit={label,fn,inside};targets.push(o);};
 const world=createTown({scene,sites,townMode:'peninsula',mobile:true,shadows:false,register,enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3(0,0,-30)});
 assignWorkplaces(world,sites);
 const blocked=(x,z,r=.35)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c));
 const state={townMode:'peninsula',inventory:[],residentLocations:{}};
 return {sites,scene,targets,register,world,blocked,state};
}
function roomFor(context,site,builder=buildCompactShop){
 const room=new THREE.Group(),colliders=[];context.scene.add(room);
 const layout=builder({site,room,reg:context.register,collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action(){},exit(){}});
 const blocked=(x,z,r=.35)=>suppliedRoomBoundsBlocked(layout,x,z,r)||colliders.some(c=>circleHitsRect(x,z,r,c));
 return {room,layout,blocked};
}
function staffService(c,r){return createWorkplaceResidents({world:c.world,parent:c.scene,getTargets:()=>c.targets,collides:r.blocked,getPlayerPosition:()=>null,getEntrance:()=>r.layout.spawn,getLayout:()=>r.layout,getState:()=>c.state,ledger:createResidentLedger(()=>c.state)});}
function startClock(c,minutes){const player=new THREE.Group();player.position.set(0,0,-30);const ai=createCastAI({world:c.world,player,state:()=>c.state,paused:()=>false,collides:c.blocked});ai.update(0,minutes,false);return ai;}

test('published businesses have reachable real doors and a clear passage beside Minato',()=>{
 try{
  const c=setup(),{sites,world,blocked}=c,nav=createNavigation(blocked);
  assert.equal(sites.some(s=>s.id==='form3d'),false);
  assert.ok(world.group.getObjectByName('Consolidated harbour office'));
  assert.equal(sites.find(s=>s.id==='frontrow').combinedWorkshop,true);
  assert.equal(world.people.length,10);assert.equal(new Set(world.people.map(p=>p.profile.name)).size,10);
  for(const site of [...sites,world.warehouse.place]){
   const [x,,z]=site.door;assert.equal(blocked(x,z),false,site.id+' door');
   const path=nav.path({x:-3,z:-20},{x,z});assert.deepEqual(path.at(-1),[x,z],site.id+' reachable door');
  }
  for(const z of [-5.1,-4.6,-4.1])assert.equal(sweepFraction({x:-6.5,z},{x:-17,z},blocked),1,'Continuous passage to rear yard at '+z);
  assert.deepEqual(TOWN_DESTINATIONS.workshop,TOWN_DESTINATIONS.books);
  assert.deepEqual(TOWN_DESTINATIONS.books,[sites.find(s=>s.id==='frontrow').door[0],1.6]);
  const roles=Object.fromEntries(world.people.map(p=>[p.profile.name,p.profile.workSite]));
  for(const name of ['Aya','Kenji','Reiko','Tetsuo'])assert.equal(roles[name],'frontrow');
  assert.equal(roles['Harbour master'],'office');assert.equal(roles['Mrs Sato'],'warehouse');
  for(let minute=0;minute<1440;minute+=10)for(const p of world.people){
   const plan=residentPlan(p.profile,minute,false,c.state);assert.notEqual(plan.place,'ramen',p.profile.name+' must not enter an absent building');
  }
 }finally{configureTownMode('legacy');}
});

test('combined room preserves every content item, accessible workstations and four existing workers',()=>{
 try{
  const c=setup(),site=c.sites.find(s=>s.id==='frontrow'),r=roomFor(c,site),nav=createNavigation(r.blocked,{step:.16,heightAt:()=>0,bounds:r.layout.bounds});
  assert.deepEqual(r.layout.bounds,BOOKSHOP_WORKSHOP_ROOM.bounds);assert.ok(r.layout.workshop);
  const content=buildBusinessContent({site,room:r.room,register:c.register,onInspect(){},onAction(){}});
  const ids=[...content.objects.keys(),...BUSINESS_CONTENT_CATALOGUE.filter(i=>i.siteId==='office').map(i=>i.id)];assert.deepEqual(ids.sort(),ITEMS.map(i=>i.id).sort());
  assert.ok(BUSINESS_CONTENT_CATALOGUE.filter(i=>i.siteId==='frontrow').every(i=>i.place.includes('Workshop')));
  for(const target of [...Object.values(r.layout.staff),...r.room.children.filter(o=>o.userData.seat).map(o=>o.userData.seat.stand)]){
   const [x,,z]=target;assert.equal(r.blocked(x,z),false,'Clear interior station '+target);
   const path=nav.path({x:r.layout.spawn[0],z:r.layout.spawn[2]},{x,z});assert.deepEqual(path.at(-1),[x,z],'Reachable station '+target);
  }
  const staff=c.world.people.filter(p=>p.profile.workSite==='frontrow');
  // All four have finished their Sakura errand; exercise the shared work shift.
  const ledger=createResidentLedger(()=>c.state);
  for(const p of staff)ledger.account(p.profile.name,1050).shopping={finished:true};
  const minute=1050;startClock(c,minute);
  const service=staffService(c,r);service.enter(site,minute);
  for(const p of staff){assert.equal(p.g.userData.inWorkplace,'frontrow');assert.equal(p.g.visible,true);}
  const used=new Set();
  for(let i=0;i<600;i++){
   service.update(.1,minute+i*.025,false);
   for(const a of c.targets)if(a.userData.workers&&a.userData.reservedBy)used.add(a.userData.reservedBy);
   for(const p of staff)assert.equal(r.blocked(p.g.position.x,p.g.position.z,.28),false,p.profile.name+' clear of furniture '+JSON.stringify({minute:minute+i*.025,position:p.g.position.toArray(),place:p.g.userData.place,activity:p.g.userData.activity,inWorkplace:p.g.userData.inWorkplace}));
   for(let a=0;a<staff.length;a++)for(let b=a+1;b<staff.length;b++)assert.ok(staff[a].g.position.distanceTo(staff[b].g.position)>.65,'Workers keep separate space');
  }
  assert.deepEqual([...used].sort(),['Aya','Kenji','Reiko','Tetsuo']);
  for(let i=0;i<1000;i++)service.update(.1,1500,false);
  for(const p of staff){assert.equal(p.g.userData.inWorkplace,undefined,p.profile.name+' leaves through door '+JSON.stringify(staff.map(w=>({name:w.profile.name,pos:w.g.position.toArray(),inside:w.g.userData.inWorkplace,transition:w.g.userData.roomTransition}))));assert.equal(p.g.parent,c.world.group);assert.deepEqual([p.g.position.x,p.g.position.z],p.profile.work);}
  service.restore();r.layout.workshop.dispose();
 }finally{configureTownMode('legacy');}
});

test('restored supplied office and warehouse use their existing staff and working interiors',async()=>{
 try{
  const c=setup();globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
  const native=fetch;globalThis.fetch=async url=>String(url).startsWith('blob:')?native(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
  try{assert.deepEqual(await preloadSuppliedRooms(['office']),[true]);}finally{globalThis.fetch=native;}
  for(const [id,name,builder,minute] of [['office','Harbour master',buildSuppliedRoom,0],['warehouse','Mrs Sato',buildWarehouseInterior,1000]]){
   const site=[...c.sites,...c.world.landmarks].find(s=>s.id===id),r=roomFor(c,site,builder);
   if(id==='office'){assert.ok(r.room.getObjectByName('Supplied office'));assert.ok(r.room.getObjectByName('Clerk CRT monitor'));assert.ok(c.targets.some(o=>o.userData.hit.label==='Open harbour spreadsheets'));}
   startClock(c,minute);const service=staffService(c,r);service.enter(site,minute);
   const person=c.world.people.find(p=>p.profile.name===name);assert.equal(person.g.userData.inWorkplace,id);assert.equal(person.g.visible,true);
   const used=new Set();for(let i=0;i<900;i++){service.update(.1,minute+i*.05,false);if(person.g.userData.socialPose)used.add(person.g.userData.socialPose);}
   assert.ok(used.size,name+' performs tasks inside '+id);service.restore();
  }
 }finally{configureTownMode('legacy');}
});

test('the merged address keeps saved visits and the actual printing buttons working',()=>{
 try{
  const dom=installDOM();configureTownMode('peninsula');
  assert.equal(businessId('form3d'),'frontrow');assert.equal(businessId('stepwise'),'frontrow');
  assert.deepEqual(migratedVisits(['form3d','journal','frontrow','electronics','career']),['frontrow','office']);
  const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>1030,getSocialContext:()=>({inside:'frontrow'})});
  acts.action('workshop');dom.button('Check with StepWise');dom.button('Use this pattern in Form 3D');dom.button('Print model · ¥40');
  acts.tick(8);acts.action('workshop');dom.button('Collect model');assert.equal(acts.state.inventory.length,1);acts.close();
 }finally{configureTownMode('legacy');}
});
