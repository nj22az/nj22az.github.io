import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildPortShed,PORT_SHED} from '../src/world/port-shed.js';
import {HOUSEBOAT} from '../src/world/fujita-houseboat.js';
import {fujitaAsleep,fujitaBoatRoute} from '../src/world/fujita-routine.js';
import {buildCargoShipping} from '../src/world/cargo-shipping.js';
import {circleHitsRect} from '../physics.js';
import {routeAt,groundHeight} from '../src/world/layout.js';
installDOM();
const make=()=>{const colliders=[];return {shed:buildPortShed({parent:new THREE.Group(),colliders,register(){},onAction(){}}),colliders};};
test('Mr Fujita walks to his berth at 23:30 and returns at six without beer or a tilted walking body',()=>{
 const {shed,colliders}=make();const chairSeatHeight=shed.fujita.userData.seatHeight;shed.tick(.1,1409);assert.equal(shed.routine.state,'watching');
 for(let i=0;i<600;i++){shed.tick(.1,1410);const p=shed.fujita.getWorldPosition(new THREE.Vector3());if(shed.routine.state==='to-boat'&&p.z>-56.65)assert.ok(!colliders.some(c=>circleHitsRect(p.x,p.z,.2,c)),`clear ${p.x},${p.z}`);}
 assert.equal(shed.routine.state,'sleeping');assert.equal(shed.fujita.userData.heldItem,undefined);assert.equal(shed.fujita.userData.seatHeight,undefined);assert.equal(shed.fujita.userData.sleeping,true);
 const p=shed.fujita.getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(p.x-HOUSEBOAT.x-HOUSEBOAT.bed[0])<.001);assert.ok(Math.abs(p.z-HOUSEBOAT.z-HOUSEBOAT.bed[2])<.001);
 shed.tick(.1,0);assert.equal(shed.routine.state,'sleeping');for(let i=0;i<600;i++)shed.tick(.1,360);assert.equal(shed.routine.state,'watching');assert.equal(shed.fujita.userData.seatHeight,chairSeatHeight);assert.equal(shed.fujita.rotation.x,0);assert.equal(shed.fujita.userData.hatOff,undefined);shed.dispose();
});
test('night boot is in the berth with the same resident',()=>{const {shed}=make();shed.tick(0,90);assert.equal(shed.routine.state,'sleeping');for(let i=0;i<20;i++)shed.tick(.1,90);assert.equal(shed.fujita.parent,shed.group);assert.ok(!shed.boat.group.getObjectByName('Mr Fujita'));shed.dispose();});
test('pier, gangway and every walking segment are clear',()=>{
 const {shed,colliders}=make(),G=HOUSEBOAT.gangway,path=fujitaBoatRoute(PORT_SHED.chair);
 for(let x=G.minX+.25;x<G.maxX-.2;x+=.15){assert.ok(routeAt(x,-54.2,.2));assert.equal(groundHeight(x,-54.2),x>=-38.3?0:HOUSEBOAT.deckY);}
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/.05);for(let k=1;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[2]+(b[2]-a[2])*k/n;if(i===1&&z<-56.65)continue;assert.ok(routeAt(x,z,.2),`surface ${x},${z}`);assert.ok(!colliders.some(c=>circleHitsRect(x,z,.2,c)),`clear ${x},${z}`);}}
 for(let z=-64;z<-50;z+=.1)assert.ok(!colliders.some(c=>circleHitsRect(-35.3,z,.3,c)));shed.dispose();
});
test('clock reversal reverses the current walk continuously',()=>{
 assert.equal(fujitaAsleep(1409),false);assert.equal(fujitaAsleep(1410),true);assert.equal(fujitaAsleep(359),true);assert.equal(fujitaAsleep(360),false);
 const {shed}=make();shed.tick(.1,1409);for(let i=0;i<40;i++)shed.tick(.1,1410);const p=shed.fujita.position.clone();shed.tick(.1,1409);assert.ok(p.distanceTo(shed.fujita.position)<.1);for(let i=0;i<200;i++)shed.tick(.1,1409);assert.equal(shed.routine.state,'watching');shed.dispose();
});
test('cargo calls never overlap the houseboat or gangway',()=>{
 const {shed}=make(),shipping=buildCargoShipping({group:new THREE.Group()});for(const minute of [420,450,500,540,870,900,980,1010]){shipping.update(0,minute);const ship=new THREE.Box3().setFromObject(shipping.ship);assert.ok(!ship.intersectsBox(new THREE.Box3().setFromObject(shed.boat.group)));assert.ok(!ship.intersectsBox(new THREE.Box3().setFromObject(shed.boat.gangway)));}shed.dispose();
});
