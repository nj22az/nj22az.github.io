import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createStoreService} from '../src/people/store-service.js';
import {STORE_SEATS,STORE_CLERK_POSITION} from '../src/world/interiors/store-layout.js';
import {RESIDENTS} from '../src/people/residents.js';
import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {buildConvenienceStore} from '../src/world/interiors/convenience.js';
import {circleHitsRect} from '../physics.js';
import {installDOM} from './fixtures.mjs';

function setup(){
 const clerk=new THREE.Group(),room=new THREE.Group();clerk.position.set(...STORE_CLERK_POSITION);
 let seat=STORE_SEATS[0],yen=1200,charges=0,minutes=1002;
 const service=createStoreService({clerk,room,getSeat:()=>seat,getMinutes:()=>minutes,getBalance:()=>yen,pay:n=>{if(yen<n)return false;yen-=n;charges++;return true;},say(){}});
 const step=(seconds,check=()=>{})=>{for(let i=0;i<seconds*60;i++){service.update(1/60);check();}};
 return {service,clerk,room,step,get yen(){return yen;},get charges(){return charges;},seat:s=>seat=s,money:n=>yen=n,time:n=>minutes=n};
}
test('Yuri leaves her chair, collects the food, delivers once and the player eats',()=>{
 const t=setup();t.step(30);assert.equal(t.service.phase,'sit');assert.equal(t.clerk.userData.socialPose,'Sit');
 assert.ok(t.service.request('bun'));assert.equal(t.service.phase,'stand');assert.equal(t.clerk.userData.socialPose,undefined);
 assert.equal(t.service.request('tea'),false);assert.equal(t.charges,0);
 t.step(45);assert.ok(t.service.order.delivered);assert.equal(t.charges,1);assert.equal(t.yen,1050);
 const tray=t.room.getObjectByName('Yuri food service');assert.ok(tray.visible);assert.equal(tray.position.y,.875);
 t.step(20);assert.equal(t.charges,1);assert.ok(t.service.eat());assert.equal(t.service.eat(),false);assert.equal(tray.visible,false);
 t.service.dispose();assert.equal(t.room.children.length,0);
});
test('standing, insufficient funds, closing and stale orders cannot charge or duplicate food',()=>{
 const t=setup();assert.ok(t.service.request('rice'));t.seat(null);t.step(40);assert.equal(t.charges,0);assert.equal(t.service.order,null);
 t.seat(STORE_SEATS[0]);t.money(0);assert.equal(t.service.request('tea'),false);
 t.money(1200);t.time(1200);assert.equal(t.service.request('tea'),false);
 t.time(1002);assert.ok(t.service.request('tea'));t.money(0);t.step(45);assert.equal(t.service.order,null);assert.equal(t.charges,0);
 t.service.dispose();
});
test('both tables are served through the clear aisle, without crossing shelves, table or counter',()=>{
 installDOM();const colliders=[],room=new THREE.Group();
 buildConvenienceStore({room,clerk:new THREE.Group(),box:(size,pos,color,parent)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color}));m.position.set(...pos);parent.add(m);return m;},reg(){},collider:(x,z,w,d)=>colliders.push({x,z,w,d}),action(){}});
 for(const seat of STORE_SEATS.filter((_,i)=>i!==1)){
  const t=setup();t.seat(seat);assert.ok(t.service.request('tea'));
  for(let frame=0;frame<60*35&&!t.service.order?.delivered;frame++){
   t.service.update(1/60);
   const {x,z}=t.clerk.position;
   assert.ok(!colliders.some(c=>circleHitsRect(x,z,.25,c)),`${seat.id}: Yuri crosses furniture at ${x},${z}`);
  }
  assert.ok(t.service.order?.delivered,seat.id+' received food');t.service.dispose();
 }
});
test('market borrowing preserves Yuri movement, reserves the player chair and restores actors',()=>{
 const street=new THREE.Group(),parent=new THREE.Group(),world={people:RESIDENTS.map(profile=>{const g=new THREE.Group();g.userData.hit={inside:false};street.add(g);return {g,profile};})};
 const guests=createIndoorResidents({world,parent,place:'market',getPlayerSeat:()=>STORE_SEATS[2].id});
 assert.deepEqual(guests.sync(600).sort(),['Mrs Sato','Yuri']);
 const yuri=world.people.find(p=>p.profile.name==='Yuri').g,mrs=world.people.find(p=>p.profile.name==='Mrs Sato').g;
 assert.equal(mrs.userData.storeSeatId,STORE_SEATS[3].id);assert.equal(mrs.userData.socialPose,'Sit');
 yuri.position.set(2.8,0,2.3);guests.sync(601);assert.equal(yuri.position.z,2.3,'Schedule does not reset service movement');
 guests.restore();for(const g of [yuri,mrs]){assert.equal(g.parent,street);assert.equal(g.userData.hit.inside,false);assert.equal(g.userData.storeSeatId,undefined);assert.equal(g.userData.seatHeight,undefined);}
});
test('seated menu supports ordering, eating and standing on touch and keyboard actions',async()=>{
 const dom=installDOM(),t=setup();const {createActivities}=await import('../activities.js');let stood=false;
 const activities=createActivities({say(){},onWeather(){},onTime(){},getTableService:()=>t.service,onStand:()=>stood=true});
 activities.action('store-table');dom.button('Steamed pork bun · ¥150');assert.equal(activities.paused,false);
 t.step(35);activities.action('store-table');dom.button('Eat Steamed pork bun');assert.equal(t.service.order,null);
 activities.action('store-table');dom.button('Stand up');assert.ok(stood);t.service.dispose();
});
