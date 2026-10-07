import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildPortShed,PORT_SHED,SHED_PIER,tvProgramme} from '../src/world/port-shed.js';
import {circleHitsRect} from '../physics.js';
installDOM();

test('Mr Fujita’s shed: channels flipping, a glass in his hand, the empties round him, the pier left open',()=>{
 const parent=new THREE.Group(),colliders=[],hits=[];
 const shed=buildPortShed({parent,colliders,register:(o,label,fn)=>hits.push({o,label,fn}),onAction(){}});
 assert.ok(hits.some(h=>h.label==='Talk to Mr Fujita'));assert.ok(hits.some(h=>h.label==='Watch the shed television'));
 assert.ok(['baseball','sumo','variety','drama','cooking'].includes(tvProgramme(15*60)));assert.equal(tvProgramme(2*60),'off');
 shed.tick(.1,15*60);assert.ok(['SitHold','SitPour'].includes(shed.fujita.userData.socialPose));assert.equal(shed.fujita.userData.heldItem,'bottle');
 assert.ok(shed.fujita.userData.heldPortion>=0&&shed.fujita.userData.heldPortion<=1,'his glass has a level');
 shed.tick(.1,3*60);assert.equal(shed.fujita.userData.socialPose,'Sit');assert.equal(shed.fujita.userData.heldItem,undefined);assert.ok(shed.fujita.userData.sleeping,'asleep at three');
 assert.equal(tvProgramme(22*60+55),'snow');shed.tick(.1,22*60+55);
 // The empties: none when the van has been, a pile by night.
 const empties=()=>shed.group.children.find(o=>o.name==='Empty Umineko bottles').count;
 shed.tick(.1,6*60+10);assert.equal(empties(),0);shed.tick(.1,22*60);assert.ok(empties()>=20,'a day’s bottles round him');
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
