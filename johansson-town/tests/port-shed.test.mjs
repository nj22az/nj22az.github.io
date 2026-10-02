import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildPortShed,PORT_SHED,tvProgramme} from '../src/world/port-shed.js';
import {circleHitsRect} from '../physics.js';
installDOM();

test('Mr Fujita’s shed: the ballgame in the afternoon, a beer in his hand, the pier left open',()=>{
 const parent=new THREE.Group(),colliders=[],hits=[];
 const shed=buildPortShed({parent,colliders,register:(o,label,fn)=>hits.push({o,label,fn}),onAction(){}});
 assert.ok(hits.some(h=>h.label==='Talk to Mr Fujita'));assert.ok(hits.some(h=>h.label==='Watch the shed television'));
 assert.equal(tvProgramme(15*60),'baseball');assert.equal(tvProgramme(19*60+10),'news');assert.equal(tvProgramme(2*60),'off');
 shed.tick(.1,15*60);assert.equal(shed.fujita.userData.socialPose,'Drink');assert.equal(shed.fujita.userData.heldItem,'beer');
 shed.tick(.1,3*60);assert.equal(shed.fujita.userData.socialPose,'Sit');assert.equal(shed.fujita.userData.heldItem,undefined);
 // The walk along the pier past the open front stays clear.
 for(let z=-66;z<=-50;z+=.5)assert.ok(!colliders.some(c=>circleHitsRect(-35.3,z,.3,c)),'pier walk is open at z='+z);
 // He sits facing his set.
 assert.ok(PORT_SHED.tv[1]<PORT_SHED.chair[1],'the TV is in front of him (to the south, where he faces)');
 shed.dispose();
});
