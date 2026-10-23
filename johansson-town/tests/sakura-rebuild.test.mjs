import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildSakuraRebuild} from '../src/world/interiors/sakura-rebuild.js';
import {circleHitsRect} from '../physics.js';
import {createRoomWalk} from '../src/people/room-walk.js';
import {PRODUCTS} from '../src/commerce/products-data.js';

test('candidate retains catalogue keys, counted slots and stock depletion; supports real room routes',async()=>{
 installDOM();const room=new THREE.Group(),display=buildSakuraRebuild({room,reg(){},action(){},exit(){}});
 assert.equal(display.unitPositions.size,780);assert.equal(display.unitApproaches.size,780);
 assert.deepEqual(display.stock.records.map(p=>p.id).sort(),PRODUCTS.map(p=>p.id).sort());
 const blocked=(x,z,r=.36)=>display.layout.colliders.some(c=>circleHitsRect(x,z,r,c));
 for(const p of [...display.layout.queue,...display.layout.browse])assert.equal(blocked(p.x,p.z),false,p.id+' is blocked');
 for(const id of PRODUCTS.map(p=>p.id)){
  const p=display.unitApproaches.get(id+':0');assert.equal(blocked(p[0],p[2]),false,id+' approach blocked');
 }
 for(const destination of [...display.layout.browse.map(p=>[p.x,0,p.z]),display.layout.staffApproach,display.layout.stockroom,...PRODUCTS.map(p=>display.unitApproaches.get(p.id+':0'))]){
  const person={g:new THREE.Group(),profile:{name:'probe',age:35}};person.g.position.set(...display.layout.entrance);
  const walk=createRoomWalk(blocked,{bounds:display.layout.bounds,radius:.36,smoothTurn:true});let arrived=false;
  for(let i=0;i<6000&&!arrived;i++)arrived=walk.move(person,destination,.05);
  assert.ok(arrived,'route to '+destination);assert.equal(blocked(person.g.position.x,person.g.position.z,.36),false);
 }
 const chips=room.getObjectByName('Sakura chips goods'),m=new THREE.Matrix4(),s=new THREE.Vector3();
 display.updateStock(Object.fromEntries(PRODUCTS.map(p=>[p.id,{shelf:0}])));let shown=0;
 for(let i=0;i<chips.count;i++){chips.getMatrixAt(i,m);s.setFromMatrixScale(m);if(s.x>0)shown++;}
 assert.equal(shown,chips.count-24);
 display.updateStock(Object.fromEntries(PRODUCTS.map(p=>[p.id,{shelf:p.capacity}])));
 chips.getMatrixAt(0,m);s.setFromMatrixScale(m);assert.equal(s.x,1);
 assert.equal(display.refrigerator.hold(7,1),true);assert.ok(display.refrigerator.doors[7].door.rotation.y<0);
 display.frontDoor.set(1);assert.equal(display.frontDoor.amount,1);display.frontDoor.set(null);
 assert.ok(room.getObjectByName('Sakura cash drawer'));assert.ok(display.layout.candidate);
});
