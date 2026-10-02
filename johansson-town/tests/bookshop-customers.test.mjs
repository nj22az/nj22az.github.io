import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createPeninsulaBusinesses} from '../src/world/businesses.js';
import {createTown} from '../src/world/town.js';
import {configureTownMode} from '../src/world/town-mode.js';
import {assignWorkplaces} from '../src/people/workplaces.js';
import {buildCompactShop} from '../src/world/interiors/compact-shops.js';
import {createBookshopCustomers} from '../src/people/bookshop-customers.js';
import {bookshopVisitPlan} from '../src/people/bookshop-visits.js';
import {createResidentLedger} from '../src/people/resident-personalities.js';
import {residentPlan} from '../src/people/social.js';
import {TOWN_DESTINATIONS} from '../src/world/town-grid.js';
import {circleHitsRect} from '../physics.js';

test('bookshop visits leave meals and travelling residents in their existing plans',()=>{
 const work={place:'work',target:[0,0]},meal={place:'ramen',target:[0,0]},away={place:'away',target:[0,0]};
 assert.equal(bookshopVisitPlan({name:'Kenji'},920,work).place,'bookshop');assert.equal(bookshopVisitPlan({name:'Kenji'},940,work),work);assert.equal(bookshopVisitPlan({name:'Aya'},920,work),work);assert.equal(bookshopVisitPlan({name:'Kenji'},920,meal),meal);assert.equal(bookshopVisitPlan({name:'Kenji'},920,away),away);
});

test('a real resident browses, speaks to Aya, buys once, and walks back out without duplicated actors',()=>{
 try{
  installDOM();const sites=createPeninsulaBusinesses(),scene=new THREE.Scene(),world=createTown({scene,sites,townMode:'peninsula',mobile:true,shadows:false,register(o,label,fn,inside){o.userData.hit={label,fn,inside};},enter(){},onAction(){}});assignWorkplaces(world,sites);
  const customer=world.people.find(p=>p.profile.name==='Kenji'),index=world.people.indexOf(customer),day=(6-index%6)%6,minutes=day*1440+912,state={townMode:'peninsula'},ledger=createResidentLedger(()=>state);ledger.account('Kenji',minutes).shopping={finished:true};
  assert.equal(residentPlan(customer.profile,minutes,false,state).place,'bookshop');
  const room=new THREE.Group(),colliders=[];scene.add(room);const layout=buildCompactShop({site:sites.find(s=>s.id==='frontrow'),room,reg(){},collider:(x,z,w,d)=>colliders.push({x,z,w,d}),action(){},exit(){}}),blocked=(x,z,r=.3)=>colliders.some(c=>circleHitsRect(x,z,r,c));
  const aya=world.people.find(p=>p.profile.name==='Aya');scene.add(aya.g);aya.g.position.set(...layout.staff.Aya);aya.g.visible=true;aya.g.userData.inWorkplace='frontrow';aya.g.userData.hit.inside=true;
  customer.g.position.set(TOWN_DESTINATIONS.books[0],0,TOWN_DESTINATIONS.books[1]);customer.g.userData.indoors='bookshop';customer.g.visible=false;const count=world.people.length,originalParent=customer.g.parent;let saved=0;
  const service=createBookshopCustomers({world,parent:scene,getLayout:()=>layout,getPlayerPosition:()=>null,collides:blocked,getState:()=>state,ledger,save:()=>saved++});service.enter(sites.find(s=>s.id==='frontrow'),minutes);
  const phases=new Set(),positions=[],speech=new Set();
  for(let i=0;i<3000;i++){service.update(.1,minutes+i*.1/60);const snapshot=service.snapshot()[0];if(snapshot){phases.add(snapshot.phase);positions.push(customer.g.position.clone());assert.equal(blocked(customer.g.position.x,customer.g.position.z,.28),false);}if(customer.g.userData.residentSpeech)speech.add(customer.g.userData.residentSpeech.text);if(aya.g.userData.residentSpeech)speech.add(aya.g.userData.residentSpeech.text);}
  assert.ok(phases.has('browse'));assert.ok(phases.has('counter'));assert.ok(phases.has('leave'));assert.ok(speech.size>=3,'customer and bookseller exchange lines');assert.equal(world.people.length,count);assert.equal(state.bookshop.sales.length,1);assert.ok(saved>0);assert.equal(state.documentArchive.records.filter(r=>r.type==='Receipt').length,1);assert.equal(ledger.account('Kenji',minutes).purchases.filter(p=>p.id==='bookshop-paperback').length,1);
  for(let i=1;i<positions.length;i++)assert.ok(positions[i].distanceTo(positions[i-1])<=.11,'walks between stops');
  service.restore();assert.equal(customer.g.parent,originalParent);assert.equal(customer.g.userData.inBookshop,undefined);assert.equal(aya.g.userData.bookshopServing,undefined);
 }finally{configureTownMode('legacy');}
});
