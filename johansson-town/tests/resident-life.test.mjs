import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {RESIDENTS} from '../src/people/residents.js';
import {residentPersonality,createResidentLedger} from '../src/people/resident-personalities.js';
import {createStoreService} from '../src/people/store-service.js';
import {createVenueService} from '../src/people/venue-service.js';
import {createTownActivities,townAffordance} from '../src/people/town-activities.js';
import {createCastAI} from '../src/people/schedules.js';
import {createIzakayaGuests} from '../src/people/izakaya-guests.js';
import {createWorkplaceResidents} from '../src/people/workplace-residents.js';
import {STORE_SEATS,STORE_CLERK_POSITION} from '../src/world/interiors/store-layout.js';

function person(name,parent=new THREE.Group()){
 const profile=RESIDENTS.find(p=>p.name===name),g=new THREE.Group();g.userData={name,hit:{inside:false},visualReady:true};g.position.set(profile.work[0],0,profile.work[1]);parent.add(g);return {g,profile};
}
function marker(parent,label,x=0,z=0,inside=false){const o=new THREE.Object3D();o.position.set(x,1,z);o.userData.hit={label,inside,fn:()=>{throw Error('NPC called player action');}};parent.add(o);return o;}
const step=(service,seconds)=>{for(let i=0;i<seconds*60;i++)service.update(1/60);};

test('Sakura residents queue, receive food once, use their own money and leave the player first in the next queue',()=>{
 const room=new THREE.Group(),state={yen:900,inventory:[]},ledger=createResidentLedger(()=>state),clerk=new THREE.Group();clerk.position.set(...STORE_CLERK_POSITION);
 const kenji=person('Kenji'),sato=person('Mrs Sato');let customers=[kenji,sato],charges=0,playerSeat=STORE_SEATS[0];
 for(const [i,p] of customers.entries()){p.g.userData.inMarket=true;p.g.userData.storeSeatId=STORE_SEATS[i+2].id;}
 const options={room,clerk,getCustomers:()=>customers,ledger,getMinutes:()=>900,getSeat:()=>playerSeat,getBalance:()=>state.yen,pay:n=>{charges++;state.yen-=n;return true;},say(){}};
 const service=createStoreService(options);step(service,2);assert.deepEqual(service.queue,['Kenji','Mrs Sato']);assert.equal(charges,0);
 assert.ok(service.request('rice'));assert.equal(service.order.delivered,false);assert.equal(service.request('tea'),false);
 const delivered=[];let sawFood=false;
 for(let i=0;i<150*60;i++){
  service.update(1/60);
  if(kenji.g.userData.heldItem==='bun')sawFood=true;
  for(const [id,done] of [['Kenji',state.residentLife.Kenji?.meals?.market.delivered],['player',service.order?.delivered],['Mrs Sato',state.residentLife['Mrs Sato']?.meals?.market.delivered]])if(done&&!delivered.includes(id))delivered.push(id);
 }
 assert.deepEqual(delivered,['Kenji','player','Mrs Sato']);assert.ok(sawFood);assert.equal(charges,1);assert.equal(state.yen,780);assert.deepEqual(state.inventory,[]);
 assert.equal(state.residentLife.Kenji.yen,2250);assert.equal(state.residentLife['Mrs Sato'].yen,2280);assert.equal(state.residentLife.Kenji.meals.market.finished,true);
 assert.ok(service.eat());service.dispose();assert.equal(room.children.length,0);
 const again=createStoreService(options);step(again,60);assert.equal(state.residentLife.Kenji.purchases.length,1,'Room re-entry cannot repeat a meal purchase');assert.equal(charges,1);again.dispose();
});

test('a departed, hidden, or closing-time customer cannot be charged for undelivered food',()=>{
 const room=new THREE.Group(),clerk=new THREE.Group(),customer=person('Tetsuo'),state={},ledger=createResidentLedger(()=>state);clerk.position.set(...STORE_CLERK_POSITION);
 customer.g.userData.storeSeatId=STORE_SEATS[2].id;customer.g.userData.inMarket=true;let minutes=950,customers=[customer];
 const service=createStoreService({room,clerk,getSeat:()=>null,getMinutes:()=>minutes,getBalance:()=>0,pay:()=>{throw Error('Player charged');},say(){},getCustomers:()=>customers,ledger});
 customer.g.userData.visualReady=false;step(service,2);assert.deepEqual(service.queue,[]);customer.g.userData.visualReady=true;step(service,2);assert.deepEqual(service.queue,['Tetsuo']);
 customers=[];step(service,40);assert.equal(state.residentLife.Tetsuo.purchases.length,0);assert.equal(customer.g.userData.heldItem,undefined);
 customers=[customer];step(service,1);minutes=1200;step(service,40);assert.equal(state.residentLife.Tetsuo.purchases.length,0);service.dispose();
});

test('Minato serves actual beer and meals; the bus driver and officer choose tea and payments survive re-entry',()=>{
 const room=new THREE.Group(),state={yen:600},ledger=createResidentLedger(()=>state),kenji=person('Kenji'),driver=person('Bus driver'),nao=person('Nao');
 for(const [i,p] of [kenji,driver].entries()){p.g.position.set(i*1.5,0,-1.42);p.g.userData.inIzakaya=true;p.g.userData.seatHeight=.71;}
 const options={room,place:'izakaya',getCustomers:()=>[kenji,driver],getStaff:()=>nao.g,getMinutes:()=>1100,ledger};
 const service=createVenueService(options);let beer=false,tea=false,eating=false;
 for(let i=0;i<55*60;i++){service.update(1/60);beer||=kenji.g.userData.heldItem==='beer';tea||=driver.g.userData.heldItem==='tea';eating||=kenji.g.userData.heldItem==='yakitori';}
 assert.ok(beer&&tea&&eating);assert.ok(room.getObjectByName('resident-prop-beer'));assert.equal(residentPersonality('Officer Mori').drink,'tea');assert.equal(state.yen,600);
 assert.equal(state.residentLife.Kenji.purchases.length,1);assert.equal(state.residentLife.Kenji.meals.izakaya.finished,true);service.dispose();assert.equal(room.children.length,0);assert.equal(kenji.g.userData.heldItem,undefined);
 const again=createVenueService(options);step(again,10);assert.equal(state.residentLife.Kenji.purchases.length,1);again.dispose();
});

test('all appropriate public interaction classes are available without executing player callbacks',()=>{
 const root=new THREE.Group();
 for(const [label,kind] of [['Read evening papers','read'],['Use telephone','phone'],['Play Star Port','arcade'],['Tune street radio','radio'],['Inspect post box','post'],['Inspect recycling bins','recycle'],['Buy newspaper · ¥80','shop'],['Fish from the outer pier','fish'],['Sit on bench','seat'],['Operate winch','machine'],['Inspect bicycle','inspect']])assert.equal(townAffordance(marker(root,label)).kind,kind);
 for(const label of ['Talk to Aya','Enter Sakura','Step outside','Take the folio','Travel to the harbour'])assert.equal(townAffordance(marker(root,label)),null);
 assert.equal(townAffordance(marker(root,'Buy newspaper · ¥80')).item,'paper');
});

test('residents walk to objects, reserve them, use them, yield to the player and preserve schedules and escort quests',()=>{
 const root=new THREE.Group(),kenji=person('Kenji',root),tetsuo=person('Tetsuo',root),paper=marker(root,'Read workshop notice',-5.4,17),state={inventory:[],yen:1000};
 tetsuo.g.position.copy(kenji.g.position);const player=new THREE.Group();player.position.set(20,0,20);
 const activity=createTownActivities({getTargets:()=>[paper],collides:()=>false,getPlayerPosition:()=>player.position,getState:()=>state,ledger:createResidentLedger(()=>state)});
 const world={people:[kenji],homes:new Map()},ai=createCastAI({world,player,state:()=>state,paused:()=>false,collides:()=>false,activities:activity});
 let sawWalking=false,sawReading=false;
 for(let i=0;i<22*60;i++){ai.update(1/60,1002+i/60,false);sawWalking||=activity.stateFor(kenji)?.phase==='walking';sawReading||=kenji.g.userData.socialPose==='Read';}
 assert.ok(sawWalking&&sawReading);assert.equal(state.yen,1000);assert.ok(state.residentLife.Kenji.activities.length);
 const base={place:'work',target:[-3.5,17],activity:'working'};kenji.g.position.set(-4.4,0,17);
 activity.plan(kenji,base,1040,false,.1);activity.plan(kenji,base,1060,false,.1);
 activity.plan(tetsuo,base,1040,false,.1);activity.plan(tetsuo,base,1060,false,.1);
 assert.notEqual(!!activity.stateFor(kenji),!!activity.stateFor(tetsuo),'A single object cannot have two owners');
 const owner=activity.stateFor(kenji)?kenji:tetsuo;player.position.copy(paper.position);activity.plan(owner,base,1060.1,false,.1);assert.equal(paper.userData.reservedBy,undefined);assert.equal(owner.g.userData.usingTownObject,undefined);
 player.position.set(20,0,20);state.kenjiEscort='walking';assert.equal(activity.plan(kenji,base,1100,false,.1),base);assert.equal(activity.stateFor(kenji),undefined);
 activity.dispose();assert.equal(paper.userData.reservedBy,undefined);
});

test('inaccessible objects time out and never hold a reservation or bill indefinitely',()=>{
 const root=new THREE.Group(),p=person('Kenji',root),object=marker(root,'Buy canned tea · ¥120',-5.5,17),state={};
 const activity=createTownActivities({getTargets:()=>[object],collides:()=>false,ledger:createResidentLedger(()=>state)}),base={place:'work',target:p.profile.work,activity:'working'};
 activity.plan(p,base,1000,false,.1);activity.plan(p,base,1010,false,.1);assert.ok(activity.stateFor(p));
 activity.plan(p,base,1050,false,.1);assert.equal(activity.stateFor(p),undefined);assert.equal(state.residentLife.Kenji.purchases.length,0);assert.equal(object.userData.reservedBy,undefined);
});

test('izakaya arrivals keep existing chairs and workplace staff return to the same street actors',()=>{
 const street=new THREE.Group(),parent=new THREE.Group(),world={people:RESIDENTS.map(p=>person(p.name,street)),homes:new Map()};
 const guests=createIzakayaGuests({world,parent});guests.sync(1098);const before=new Map(world.people.filter(p=>p.g.userData.inIzakaya).map(p=>[p,p.g.position.clone()]));guests.sync(1112);
 for(const [p,position] of before)if(p.g.userData.inIzakaya)assert.ok(position.equals(p.g.position),'Existing guests are not shuffled by new arrivals');guests.restore();
 const desk=marker(parent,'Read repair ledger',-2,0,true),player=new THREE.Vector3(0,0,4),state={};
 const workers=createWorkplaceResidents({world,parent,getTargets:()=>[desk],collides:(x,z,r)=>Math.abs(x)+r>5||Math.abs(z)+r>5,getPlayerPosition:()=>player,getState:()=>state,ledger:createResidentLedger(()=>state)});
 workers.enter({id:'form3d',title:'Kenji’s Workshop'},1000);const kenji=world.people.find(p=>p.profile.name==='Kenji');assert.equal(kenji.g.parent,parent);let used=false;
 for(let i=0;i<30*60;i++){workers.update(1/60,1000+i/60,false);used||=kenji.g.userData.socialPose==='Read';assert.ok(Math.abs(kenji.g.position.x)<5&&Math.abs(kenji.g.position.z)<5);}
 assert.ok(used);workers.restore();assert.equal(kenji.g.parent,street);assert.equal(kenji.g.userData.inWorkplace,undefined);assert.equal(desk.userData.reservedBy,undefined);
});
