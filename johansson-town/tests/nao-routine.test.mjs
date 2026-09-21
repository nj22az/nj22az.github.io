import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {RESIDENTS,STREET_CAST_NAMES} from '../src/people/residents.js';
import {residentPlan,naoBeforeShift} from '../src/people/social.js';
import {shiftFor} from '../src/people/commuter-schedule.js';
import {residentPersonality} from '../src/people/resident-personalities.js';
import {createRoomWalk} from '../src/people/room-walk.js';
import {forwardOnly} from '../src/people/facing.js';

const nao=RESIDENTS.find(person=>person.name==='Nao');

test('Nao is the only neighbour reintroduced beside Thuan',()=>{
 assert.deepEqual(STREET_CAST_NAMES,['Thuan','Nao']);
});

test('Nao has a distinct all-day town routine around her Izakaya shift',()=>{
 assert.equal(shiftFor(nao).arrival,510,'Nao should arrive on the morning Harbour Line');
 assert.match(naoBeforeShift(nao,600).activity,/Ramune soda/);
 assert.equal(residentPersonality('Nao').shopping,'soda');
 assert.equal(naoBeforeShift(nao,700).place,'park');
 assert.equal(naoBeforeShift(nao,780).place,'stroll');
 assert.equal(naoBeforeShift(nao,870).place,'park');
 assert.match(naoBeforeShift(nao,930).activity,/tidying Minato/);
 assert.match(residentPlan(nao,1200,false,null,true).activity,/serving guests and tidying/);
 assert.match(residentPlan(nao,1650,false,null,true).activity,/clearing tables and closing/);
 assert.equal(residentPlan(nao,1890,false,null,true).place,'bus');
});

test('every indoor Nao translation frame points forward',()=>{
 const g=new THREE.Group();g.userData.name='Nao';g.rotation.y=Math.PI;
 const person={g,profile:{name:'Nao',age:24}};
 const walker=createRoomWalk(()=>false,{bounds:{minX:-3,maxX:3,minZ:-3,maxZ:3},smoothTurn:true});
 const target=[1.8,0,-1.8];let moved=0;
 for(let frame=0;frame<600;frame++){
  const before=g.position.clone();walker.move(person,target,1/60);
  const dx=g.position.x-before.x,dz=g.position.z-before.z;
  if(Math.hypot(dx,dz)<1e-8)continue;
  moved++;assert.equal(forwardOnly(g.rotation.y,dx,dz),true,'Nao translated outside the forward cone on frame '+frame);
 }
 assert.ok(moved>30,'test never exercised Nao walking');
 assert.ok(Math.hypot(g.position.x-target[0],g.position.z-target[2])<.13,'Nao did not reach the target');
});
