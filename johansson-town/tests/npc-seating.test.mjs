import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createAvatarActor,updateAvatarActor} from '../src/avatars/actors.js';
import {createTownActivities} from '../src/people/town-activities.js';
import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {RESIDENTS} from '../src/people/residents.js';
import {RAMEN_DOOR} from '../src/people/social.js';
import {SATO_GUEST_SEATS} from '../src/world/sato-ramen-layout.js';

installDOM();

test('a resident keeps the physical seat while reading, phoning or talking',()=>{
 const parent=new THREE.Group(),entity=new THREE.Group();parent.add(entity);
 entity.userData.name='Thuan';entity.userData.seatHeight=.47;
 const actor=createAvatarActor(entity,'Thuan');
 try{
  entity.userData.socialPose='Sit';for(let frame=0;frame<120;frame++)updateAvatarActor(actor,1/60,0);
  const supportedY=actor.avatar.root.position.y;
  for(const pose of ['Read','Phone','Talk','Eat','Drink','Sit']){
   actor.animator.stop();entity.userData.socialPose=pose;
   for(let frame=0;frame<120;frame++)updateAvatarActor(actor,1/60,0);
   assert.ok(Math.abs(actor.avatar.root.position.y-supportedY)<.015,pose+' keeps the same physical seat support');
   assert.ok(actor.avatar.bones.thighL.rotation.x<-1.4,pose+' keeps bent seated legs');
  }
  delete entity.userData.seatHeight;entity.userData.socialPose='Read';
  for(let frame=0;frame<120;frame++)updateAvatarActor(actor,1/60,0);
  assert.ok(Math.abs(actor.avatar.bones.thighL.rotation.x)<.1,'Removing the seat returns a reader to standing');
 }finally{actor.avatar.dispose();}
});

test('residents forward the full chair transition and its floor to the body',()=>{
 const parent=new THREE.Group(),entity=new THREE.Group();parent.add(entity);
 entity.userData.name='Thuan';Object.assign(entity.userData,{seatHeight:.47,chairBlend:.25,floorHeight:.08,socialPose:'Sit'});
 const actor=createAvatarActor(entity,'Thuan');let state;
 actor.animator={update(dt,next){state=next;},get consumption(){return null;}};
 try{
  updateAvatarActor(actor,1/60,0);
  assert.equal(state.seated,true);assert.equal(state.chairBlend,.25);assert.equal(state.floorHeight,.08);
  entity.position.x+=.02;entity.userData.chairBlend=0;updateAvatarActor(actor,1/60,0);
  assert.equal(state.chairBlend,0);assert.equal(state.speed,0,'Sliding onto a seat is handled by its chair pose');
 }finally{actor.avatar.dispose();}
});

test('public seats use their actual surface and release onto their authored standing floor',()=>{
 const parent=new THREE.Group(),profile=RESIDENTS.find(p=>p.name==='Tetsuo'),g=new THREE.Group();parent.add(g);
 const seat={position:[5,2,5],stand:[5,2,6],surfaceY:2.42,eyeY:99,yaw:0};
 const bench=new THREE.Object3D();bench.position.set(5,3,5);bench.userData={hit:{label:'Sit on the bench',inside:true},seat};parent.add(bench);
 const p={g,profile};g.position.set(...seat.stand);
 const activities=createTownActivities({getTargets:()=>[bench],inside:true,collides:()=>false});
 const base={place:'park',target:[5,6],activity:'resting in the park'};
 activities.plan(p,base,1000,false,0);activities.plan(p,base,1010,false,0);
 assert.equal(g.userData.socialPose,'Sit');assert.ok(Math.abs(g.userData.seatHeight-.42)<1e-8);
 assert.deepEqual(g.position.toArray(),seat.position);assert.equal(bench.userData.reservedBy,'Tetsuo');
 g.userData.chairBlend=.4;activities.release(p,1011);
 assert.deepEqual(g.position.toArray(),seat.stand);assert.equal(bench.userData.reservedBy,undefined);
 for(const key of ['seatHeight','chairBlend','socialPose','usingTownObject'])assert.equal(g.userData[key],undefined,key);
 activities.dispose();
});

test('public seats respect reservations made by another seating controller',()=>{
 const parent=new THREE.Group(),profile=RESIDENTS.find(p=>p.name==='Tetsuo'),g=new THREE.Group();parent.add(g);
 const bench=new THREE.Object3D();bench.position.set(0,1,0);bench.userData={hit:{label:'Sit on bench'},seat:{position:[0,0,0],stand:[0,0,1],surfaceY:.47},reservedBy:'Thuan'};parent.add(bench);
 const activities=createTownActivities({getTargets:()=>[bench],collides:()=>false}),p={g,profile},base={place:'park',target:[0,1],activity:'resting'};
 activities.plan(p,base,1000,false,0);activities.plan(p,base,1010,false,0);
 assert.equal(activities.stateFor(p),undefined);assert.equal(bench.userData.reservedBy,'Thuan');activities.dispose();
});

test('indoor visitors lower into chairs and finish standing before returning to navigation',()=>{
 const street=new THREE.Group(),room=new THREE.Group(),profile=RESIDENTS.find(p=>p.name==='Chin'),g=new THREE.Group();
 g.userData={name:'Chin',hit:{inside:false}};g.position.set(RAMEN_DOOR[0],0,RAMEN_DOOR[1]);street.add(g);
 const seat=SATO_GUEST_SEATS[0],visitors=createIndoorResidents({world:{people:[{g,profile}]},parent:room,place:'ramen',layout:{entrance:seat.stand},collides:()=>false});
 visitors.sync(700,0);visitors.sync(700,.1);
 assert.equal(g.userData.socialPose,'Sit');assert.equal(g.userData.chairBlend,.2);
 assert.equal(g.userData.seatHeight,seat.surfaceY??seat.height);
 assert.ok(g.position.z>seat.position[2]&&g.position.z<seat.stand[2]);
 visitors.sync(700,.4);visitors.sync(700,0);
 assert.equal(g.userData.chairBlend,undefined);assert.deepEqual(g.position.toArray(),seat.position);
 // Interrupting during an arrival must still take the same clear route back out.
 visitors.sync(850,.1);
 assert.equal(g.userData.chairBlend,.8);assert.ok(Number.isFinite(g.userData.seatHeight));
 for(let frame=0;frame<300&&g.parent===room;frame++)visitors.sync(850,1/60);
 assert.equal(g.parent,street);
 for(const key of ['seatHeight','chairBlend','socialPose','roomTransition'])assert.equal(g.userData[key],undefined,key);
 visitors.restore();
});
