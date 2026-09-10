import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {preloadSuppliedRooms,buildSuppliedRoom,buildRamenRestaurant,suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {RAMEN_LAYOUT,RAMEN_GUEST_SEATS,RAMEN_PLAYER_SEATS,RAMEN_YURI_SPOT,ramenPoint} from '../src/world/interiors/ramen-layout.js';
import {circleHitsRect,circleHitsCircle,sweepFraction} from '../physics.js';
import {RESIDENTS,ACTIVE_RESIDENT_NAMES} from '../src/people/residents.js';
import {residentPlan,ramenOpen,RAMEN_VISITS} from '../src/people/social.js';
import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {createCastAI} from '../src/people/schedules.js';

test('Inakaya shares the street asset, aligns to real stools and leaves a passable furnished aisle',async()=>{
 installDOM();const originalFetch=fetch;globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const requested=[];globalThis.fetch=async url=>{
  if(String(url).startsWith('blob:'))return originalFetch(url);
  requested.push(String(url));return new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 };
 try{
  assert.deepEqual(await preloadSuppliedRooms(['ramen-exterior']),[true]);
  const street={group:new THREE.Group(),colliders:[]};buildRamenRestaurant(street,{sites:[],register(){}});
  const exterior=street.group.getObjectByName('Supplied ramen-exterior'),original=exterior.children[0].geometry.attributes.position.array.slice();
  await preloadSuppliedRooms(['ramen']);assert.equal(requested.length,1);assert.doesNotMatch(requested.join(','),/ramen-restaurant/);
  const room=new THREE.Group(),actions=[];
  assert.equal(buildSuppliedRoom({site:{id:'ramen'},room,reg:(o,label,fn)=>actions.push({o,label,fn}),collider(){},action(){},exit(){}}),RAMEN_LAYOUT);
  const model=room.getObjectByName('Supplied ramen');room.updateMatrixWorld(true);
  assert.deepEqual(exterior.children[0].geometry.attributes.position.array,original,'Street facade never distorted');
  assert.equal(model.children[0].material,exterior.children[0].material,'Textures and materials reused');
  let draws=0;model.traverse(o=>{if(o.isMesh)draws++;});assert.equal(draws,6);
  const ray=(x,y,z,dy)=>new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,dy,0)).intersectObject(model,true);
  for(const seat of [...RAMEN_GUEST_SEATS,...RAMEN_PLAYER_SEATS]){
   const hit=ray(seat.position[0],seat.height+.015,seat.position[2],-1)[0];
   assert.ok(hit&&Math.abs(hit.point.y-seat.height)<.02,'Pelvis aligned to actual stool cushion');
  }
  const blocked=(x,z)=>suppliedRoomBoundsBlocked(RAMEN_LAYOUT,x,z,.28)||RAMEN_LAYOUT.colliders.some(c=>circleHitsRect(x,z,.28,c))||RAMEN_GUEST_SEATS.some(s=>circleHitsCircle(x,z,.28,s.position[0],s.position[2],.35))||circleHitsCircle(x,z,.28,RAMEN_YURI_SPOT.position[0],RAMEN_YURI_SPOT.position[2],.35);
  const [sx,,sz]=RAMEN_LAYOUT.spawn;assert.equal(blocked(sx,sz),false);
  assert.equal(sweepFraction({x:sx,z:sz},{x:1.14,z:sz},blocked),1);
  assert.equal(sweepFraction({x:1.14,z:sz},{x:1.14,z:-1.05},blocked),1,'Pass two seated guests and basin to the rear');
  for(let z=-1.05;z<=sz;z+=.1){
   const floor=ray(1.14,.10,z,-1)[0],ceiling=ray(1.14,1.7,z,1)[0];
   assert.ok(floor&&Math.abs(floor.point.y)<.005,'Actual floor beneath walking route');
   assert.ok(ceiling&&ceiling.point.y>2.05&&ceiling.point.y<2.5,'Actual ceiling above the aisle');
  }
  for(const {o,label} of actions)assert.ok(Math.hypot(o.position.x-1.14,Math.max(-1.05,Math.min(sz,o.position.z))-o.position.z)<2.2,'Reach '+label);
  for(const {o} of actions.filter(a=>a.o.userData.seat))assert.equal(blocked(...[o.userData.seat.stand[0],o.userData.seat.stand[2]]),false,'Stand without intersecting diners');
  const second=new THREE.Group();buildSuppliedRoom({site:{id:'ramen'},room:second,reg(){},collider(){},action(){},exit(){}});
  assert.equal(second.getObjectByName('Supplied ramen').children[0].geometry,model.children[0].geometry,'Prepared geometry cached across room visits');
 }finally{globalThis.fetch=originalFetch;}
});

test('current residents visit throughout the day, with two seats, closing and night patrol preserved',()=>{
 for(let t=0;t<2880;t++){
  const visitors=RESIDENTS.filter(p=>residentPlan(p,t).place==='ramen');
  assert.ok(visitors.filter(p=>p.name!=='Yuri').length<=2,'No double-booked stools at '+t);
  if(!ramenOpen(t))assert.equal(visitors.length,0);
  for(const p of visitors)assert.ok(ACTIVE_RESIDENT_NAMES.includes(p.name));
 }
 for(const [name,[start,end]] of Object.entries(RAMEN_VISITS)){
  const profile=RESIDENTS.find(p=>p.name===name);assert.ok(profile);
  for(const day of [0,1440]){assert.equal(residentPlan(profile,day+start).place,'ramen');assert.notEqual(residentPlan(profile,day+end).place,'ramen');}
 }
 const mori=RESIDENTS.find(p=>p.name==='Officer Mori');assert.equal(residentPlan(mori,1320).place,'patrol');assert.equal(residentPlan(mori,180).place,'patrol');
});

test('diners keep their seats during turnover and resume their schedules outside on departure',()=>{
 const street=new THREE.Group(),scene=new THREE.Group(),world={people:RESIDENTS.map(profile=>{const g=new THREE.Group();g.userData.name=profile.name;g.userData.hit={inside:false};street.add(g);return {g,profile};})};scene.add(street);
 const guests=createIndoorResidents({world,parent:scene,place:'ramen'}),ai=createCastAI({world,player:new THREE.Group(),state:()=>({inventory:[]}),paused:()=>false,collides:()=>false});
 ai.update(.01,680,false);assert.deepEqual(guests.sync(680),['Mrs Sato','Harbour master']);
 const mrs=world.people.find(p=>p.profile.name==='Mrs Sato').g,seat=mrs.position.clone();
 assert.deepEqual(guests.sync(740),['Mrs Sato','Kenji']);assert.ok(mrs.position.equals(seat),'Existing diner does not jump seats');
 const occupied=world.people.filter(p=>p.g.userData.inRamen);assert.equal(new Set(occupied.map(p=>p.g.userData.ramenSeat)).size,2);
 guests.restore();ai.update(.01,740,false);assert.equal(mrs.visible,false,'Leaving the room does not interrupt the meal');assert.equal(mrs.userData.indoors,'ramen');
 ai.update(.01,781,false);assert.equal(mrs.userData.indoors,undefined,'Finished meal releases the resident to her next destination');assert.equal(mrs.parent,street);assert.equal(mrs.userData.hit.inside,false);assert.equal(mrs.userData.seatHeight,undefined);
 assert.deepEqual(guests.sync(1260),[]);
});

test('Kenji keeps an active escort and Yuri recognises her ramen break',async()=>{
 const dom=installDOM();const {createActivities}=await import('../activities.js');
 const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>1205,getSocialContext:()=>({inside:'ramen',names:['Yuri']})});
 acts.action('resident','Yuri');assert.equal(document.querySelector('#activityTitle').textContent,'Yuri · Ramen break');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/bowl of ramen/);
 dom.button('What is your favourite snack?');assert.match(document.querySelector('#activityBody').firstChild.textContent,/shoyu ramen/);acts.close();
 const street=new THREE.Group(),parent=new THREE.Group(),profile=RESIDENTS.find(p=>p.name==='Kenji'),g=new THREE.Group();g.userData.hit={inside:false};street.add(g);
 const state={kenjiEscort:'walking'},guests=createIndoorResidents({world:{people:[{g,profile}]},parent,place:'ramen',getState:()=>state});
 assert.deepEqual(guests.sync(750),[]);assert.equal(g.parent,street);
 state.kenjiEscort='done';assert.deepEqual(guests.sync(750),['Kenji']);
 state.kenjiEscort='walking';assert.deepEqual(guests.sync(750),[]);assert.equal(g.parent,street);assert.equal(g.userData.indoors,undefined);
});
