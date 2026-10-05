import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createIslandBusinesses} from '../src/world/businesses.js';
import {createTown} from '../src/world/town.js';
import {assignWorkplaces} from '../src/people/workplaces.js';
import {buildCompactShop} from '../src/world/interiors/compact-shops.js';
import {createBookshopCustomers} from '../src/people/bookshop-customers.js';
import {bookshopVisitPlan} from '../src/people/bookshop-visits.js';
import {createResidentLedger} from '../src/people/resident-personalities.js';
import {residentPlan} from '../src/people/social.js';
import {TOWN_DESTINATIONS} from '../src/world/town-grid.js';
import {circleHitsRect} from '../physics.js';
import {suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';

test('bookshop visits leave meals and travelling residents in their existing plans',()=>{
 const work={place:'work',target:[0,0]},meal={place:'ramen',target:[0,0]},away={place:'away',target:[0,0]};
 assert.equal(bookshopVisitPlan({name:'Chin'},920,work).place,'bookshop');assert.equal(bookshopVisitPlan({name:'Chin'},940,work),work);assert.equal(bookshopVisitPlan({name:'Nhung'},920,work),work);assert.equal(bookshopVisitPlan({name:'Chin'},920,meal),meal);assert.equal(bookshopVisitPlan({name:'Chin'},920,away),away);
});

test('a real resident browses, speaks to Nhung, buys once, and walks back out without duplicated actors',()=>{
 try{
  installDOM();const sites=createIslandBusinesses(),scene=new THREE.Scene(),world=createTown({scene,sites,mobile:true,shadows:false,register(o,label,fn,inside){o.userData.hit={label,fn,inside};},enter(){},onAction(){}});assignWorkplaces(world,sites);
  const customer=world.people.find(p=>p.profile.name==='Chin'),index=world.people.indexOf(customer),day=(6-index%6)%6,minutes=day*1440+912,state={},ledger=createResidentLedger(()=>state);ledger.account('Chin',minutes).shopping={finished:true};
  assert.equal(residentPlan(customer.profile,minutes,false,state).place,'bookshop');
  const room=new THREE.Group(),colliders=[];scene.add(room);const layout=buildCompactShop({site:sites.find(s=>s.id==='frontrow'),room,reg(){},collider:(x,z,w,d)=>colliders.push({x,z,w,d}),action(){},exit(){}}),blocked=(x,z,r=.3)=>colliders.some(c=>circleHitsRect(x,z,r,c));
  const aya=world.people.find(p=>p.profile.name==='Nhung');scene.add(aya.g);aya.g.position.set(...layout.staff.Nhung);aya.g.visible=true;aya.g.userData.inWorkplace='frontrow';aya.g.userData.hit.inside=true;
  customer.g.position.set(TOWN_DESTINATIONS.books[0],0,TOWN_DESTINATIONS.books[1]);customer.g.userData.indoors='bookshop';customer.g.visible=false;const count=world.people.length,originalParent=customer.g.parent;let saved=0;
  const service=createBookshopCustomers({world,parent:scene,getLayout:()=>layout,getPlayerPosition:()=>null,collides:blocked,getState:()=>state,ledger,save:()=>saved++});service.enter(sites.find(s=>s.id==='frontrow'),minutes);
  const phases=new Set(),positions=[],speech=new Set();
  for(let i=0;i<3000;i++){service.update(.1,minutes+i*.1/60);const snapshot=service.snapshot()[0];if(snapshot){phases.add(snapshot.phase);positions.push(customer.g.position.clone());assert.equal(blocked(customer.g.position.x,customer.g.position.z,.28),false);}if(customer.g.userData.residentSpeech)speech.add(customer.g.userData.residentSpeech.text);if(aya.g.userData.residentSpeech)speech.add(aya.g.userData.residentSpeech.text);}
  assert.ok(phases.has('browse'));assert.ok(phases.has('counter'));assert.ok(phases.has('leave'));assert.ok(speech.size>=3,'customer and bookseller exchange lines');assert.equal(world.people.length,count);assert.equal(state.bookshop.sales.length,1);assert.ok(saved>0);assert.equal(state.documentArchive.records.filter(r=>r.type==='Receipt').length,1);assert.equal(ledger.account('Chin',minutes).purchases.filter(p=>p.id==='bookshop-paperback').length,1);
  for(let i=1;i<positions.length;i++)assert.ok(positions[i].distanceTo(positions[i-1])<=.11,'walks between stops');
  service.restore();assert.equal(customer.g.parent,originalParent);assert.equal(customer.g.userData.inBookshop,undefined);assert.equal(aya.g.userData.bookshopServing,undefined);
 }finally{}
});

function crowdedBookshop({staffPosition=null,playerPosition=null}={}){
 installDOM();const sites=createIslandBusinesses(),scene=new THREE.Scene(),site=sites.find(s=>s.id==='frontrow');
 const world=createTown({scene,sites,townMode:'peninsula',mobile:true,shadows:false,register(o,label,fn,inside){o.userData.hit={label,fn,inside};},enter(){},onAction(){}});assignWorkplaces(world,sites);
 const customer=world.people.find(p=>p.profile.name==='Chin'),index=world.people.indexOf(customer),day=(6-index%6)%6,minutes=day*1440+912,state={townMode:'peninsula'},ledger=createResidentLedger(()=>state);ledger.account('Chin',minutes).shopping={finished:true};
 const room=new THREE.Group(),colliders=[];scene.add(room);
 const layout=buildCompactShop({site,room,reg(){},collider:(x,z,w,d)=>colliders.push({x,z,w,d}),action(){},exit(){}});
 const blocked=(x,z,r=.3)=>suppliedRoomBoundsBlocked(layout,x,z,r)||colliders.some(c=>circleHitsRect(x,z,r,c));
 const staff=[world.people.find(p=>p.profile.name==='Nhung')];
 if(staffPosition)staff.push(world.people.find(p=>p.profile.name==='Reiko'));
 for(const person of staff){scene.add(person.g);person.g.position.set(...(person.profile.name==='Nhung'?layout.staff.Nhung:staffPosition));person.g.visible=true;person.g.userData.inWorkplace=site.id;person.g.userData.hit.inside=true;assert.equal(blocked(person.g.position.x,person.g.position.z,.3),false,'Staff stands clear of furniture');}
 customer.g.position.set(TOWN_DESTINATIONS.books[0],0,TOWN_DESTINATIONS.books[1]);customer.g.userData.indoors='bookshop';customer.g.visible=false;
 let player=playerPosition?new THREE.Vector3(...playerPosition):null;
 const originalParent=customer.g.parent,count=world.people.length;
 const service=createBookshopCustomers({world,parent:scene,getLayout:()=>layout,getPlayerPosition:()=>player,collides:blocked,getState:()=>state,ledger});service.enter(site,minutes);
 return {world,customer,staff,state,ledger,minutes,blocked,service,originalParent,count,get player(){return player;},clearPlayer(){player=null;}};
}

function finishCrowdedVisit(f,{beforeStep=()=>{},afterStep=()=>{}}={}){
 const dt=1/60,phases=new Set();let complete=false,elapsed=0;
 for(let i=0;i<300/dt;i++){
  elapsed=i*dt;beforeStep(elapsed);const before=f.customer.g.position.clone();f.service.update(dt,f.minutes+elapsed/60);
  const snapshot=f.service.snapshot().find(p=>p.name==='Chin');
  if(!snapshot){complete=true;break;}
  phases.add(snapshot.phase);const pos=f.customer.g.position;
  assert.ok(pos.distanceTo(before)<=dt+1e-6,'Customer walks at most one metre per second; never skips past an obstacle');
  assert.equal(f.blocked(pos.x,pos.z,.3),false,'Customer never enters furniture or leaves the room floor');
  for(const person of f.staff)assert.ok(pos.distanceTo(person.g.position)>=.65-1e-6,'Customer keeps body clearance from '+person.profile.name);
  if(f.player)assert.ok(pos.distanceTo(f.player)>=.7-1e-6,'Customer keeps body clearance from Johansson');
  afterStep(elapsed,snapshot,pos);
 }
 assert.ok(complete,'Customer completes the visit within five minutes');
 for(const phase of ['browse','counter','leave'])assert.ok(phases.has(phase),'Customer reaches '+phase);
 assert.equal(f.state.bookshop.sales.length,1);assert.equal(f.state.documentArchive.records.filter(r=>r.type==='Receipt').length,1);
 assert.equal(f.ledger.account('Chin',f.minutes).purchases.filter(p=>p.id==='bookshop-paperback').length,1);
 assert.equal(f.world.people.length,f.count);assert.equal(f.customer.g.parent,f.originalParent);assert.equal(f.customer.g.userData.inBookshop,undefined);
 return elapsed;
}

test('a browsing customer walks around the real editor instead of staying pinned to her route',()=>{
 let f;try{
  f=crowdedBookshop({staffPosition:[-1.8,0,-1.7]});let passedEditor=false;
  finishCrowdedVisit(f,{afterStep(elapsed,snapshot,pos){if(snapshot.phase==='browse'&&pos.x>-.9)passedEditor=true;}});
  assert.ok(passedEditor,'Customer gets beyond the obstructed aisle to the second bookshelf');
  assert.deepEqual(f.staff[1].g.position.toArray(),[-1.8,0,-1.7],'The actual editor stays in place while the customer detours');
 }finally{f?.service.restore();}
});

test('a customer retries a bookshelf when Johansson clears its approach',()=>{
 let f;try{
  f=crowdedBookshop({staffPosition:[-1.8,0,-1.7],playerPosition:[1.8,0,-2.1]});let waitedForShelf=false,cleared=false;
  const elapsed=finishCrowdedVisit(f,{beforeStep(time){if(time>=45&&!cleared){assert.equal(f.state.bookshop?.sales?.length||0,0,'An occupied shelf delays browsing without creating a sale');f.clearPlayer();cleared=true;}},afterStep(time,snapshot){if(time>30&&time<45){assert.equal(snapshot.phase,'browse','Customer waits for access to the occupied bookshelf');waitedForShelf=true;}}});
  assert.ok(waitedForShelf,'Customer waits for the occupied bookshelf before its temporary obstruction clears');assert.ok(cleared&&elapsed>45,'The existing route recovers after Johansson moves away');
 }finally{f?.service.restore();}
});

test('a settled bookshop visitor enters clear of Johansson before walking to his occupied shelf',()=>{
 let f;try{
  f=crowdedBookshop({playerPosition:[-3.1,0,-.8]});const initial=f.customer.g.position;
  assert.equal(f.customer.g.userData.inBookshop,true,'The hidden scheduled resident becomes the shop visitor');
  assert.equal(f.blocked(initial.x,initial.z,.3),false,'The initial visitor position is on clear room floor');
  assert.ok(initial.distanceTo(f.player)>=.7-1e-6,'Entering the room must not place a settled resident inside Johansson');
  for(const person of f.staff)assert.ok(initial.distanceTo(person.g.position)>=.65-1e-6,'The initial visitor position is clear of staff');
  let cleared=false;
  const elapsed=finishCrowdedVisit(f,{beforeStep(time){if(time>=5&&!cleared){f.clearPlayer();cleared=true;}}});
  assert.ok(cleared&&elapsed>5,'The real visitor walks through his complete visit after Johansson clears the shelf');
 }finally{f?.service.restore();}
});
