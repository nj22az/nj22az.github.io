import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildPortShed,PORT_SHED,SHED_PIER,tvProgramme} from '../src/world/port-shed.js';
import {shoeHeight,seatContactHeight} from './seating-contact.mjs';
import {updateAvatarActor} from '../src/avatars/actors.js';
import {circleHitsRect} from '../physics.js';
installDOM();

test('Mr Fujita’s shed: the ballgame in the afternoon, a beer in his hand, the pier left open',()=>{
 const parent=new THREE.Group(),colliders=[],hits=[];
 const shed=buildPortShed({parent,colliders,register:(o,label,fn)=>hits.push({o,label,fn}),onAction(){}});
 assert.ok(hits.some(h=>h.label==='Talk to Mr Fujita'));assert.ok(hits.some(h=>h.label==='Watch the shed television'));
 assert.equal(tvProgramme(15*60),'baseball');assert.equal(tvProgramme(19*60+10),'news');assert.equal(tvProgramme(2*60),'off');
 shed.tick(.1,15*60);assert.equal(shed.fujita.userData.socialPose,'Drink');assert.equal(shed.fujita.userData.heldItem,'beer');
 shed.tick(.1,3*60);assert.equal(shed.fujita.userData.socialPose,'Sit');assert.equal(shed.fujita.userData.heldItem,undefined);
 assert.equal(tvProgramme(22*60+55),'snow');shed.tick(.1,22*60+55);
 // The walk along the pier past the open front stays clear.
 for(let z=-66;z<=-50;z+=.5)assert.ok(!colliders.some(c=>circleHitsRect(-35.3,z,.3,c)),'pier walk is open at z='+z);
 // He sits facing his set.
 assert.ok(PORT_SHED.tv[1]<PORT_SHED.chair[1],'the TV is in front of him (to the south, where he faces)');
 // It stands wholly on the pier's deck, not over the water.
 const P=SHED_PIER,hx=PORT_SHED.depth/2,hz=PORT_SHED.width/2;
 assert.ok(PORT_SHED.x-hx>=P.minX&&PORT_SHED.x+hx<=P.maxX&&PORT_SHED.z-hz>=P.minZ&&PORT_SHED.z+hz<=P.maxZ,'the shed is on the deck');
 // You can walk in through the end towards the quay, beside his chair.
 for(const z of [PORT_SHED.z+hz+.6,PORT_SHED.z+hz-.4,PORT_SHED.z+.5])assert.ok(!colliders.some(c=>circleHitsRect(PORT_SHED.x-.55,z,.25,c)),'the way in is open at z='+z);
 shed.dispose();
});


test('Fujita has connected visible calves and planted shoes while holding and sipping',()=>{
 const shed=buildPortShed({parent:new THREE.Group(),colliders:[],register(){},onAction(){}});
 try{
  const a=shed.actor.avatar,chair=new THREE.Box3().setFromObject(shed.fujita.parent.getObjectByName('Armchair seat'));
  const rest=new THREE.Box3().setFromObject(shed.fujita.parent.getObjectByName('Armchair footrest'));
  for(const phase of [0,1.2,2.4]){
   shed.fujita.userData.consumeElapsed=phase;
   for(let i=0;i<90;i++)updateAvatarActor(shed.actor,1/60,1000);
   assert.ok(Math.abs(shoeHeight(a)-rest.max.y)<.002,'Both shoes rest on the timber footstool');
   assert.ok(Math.abs(seatContactHeight(a)-chair.max.y)<.002,'His pelvis rests on the cushion');
   a.root.updateMatrixWorld(true);
   for(const side of ['L','R']){
    const knee=a.bones['knee'+side].getWorldPosition(new THREE.Vector3());
    assert.ok(knee.z<chair.min.z-.04,'The calf is beyond the upholstered front');
   }
  }
 }finally{shed.dispose();}
});
