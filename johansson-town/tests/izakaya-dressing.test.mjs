import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildIzakayaDressing,BOTTLE_KEEP,MINATO_1997_POSTERS,KEEP_SHELF} from '../src/world/interiors/izakaya-dressing.js';

test('Minato carries its 1997 posters, the bottle keep and the table things in a few draws',()=>{
 installDOM();
 const room=new THREE.Group(),colliders=[];
 const {group,bottles}=buildIzakayaDressing(room,{collider:(x,z,w,d,h)=>colliders.push({x,z,w,d,h})});
 assert.ok(MINATO_1997_POSTERS.length>=6,'Six posters of the year');
 for(const [,x,y,z,yaw,w,h] of MINATO_1997_POSTERS){
  // On a wall of the room (x or z at the wall line), clear of the floor and the ceiling.
  assert.ok(Math.abs(Math.abs(x)-6.29)<.01||Math.abs(Math.abs(z)-6.29)<.01,'On a wall');
  assert.ok(y-h/2>1.2&&y+h/2<3.2,'Above the wainscot and under the beams');
 }
 assert.equal(bottles.count,BOTTLE_KEEP.length,'One bottle per regular who keeps one');
 const draws=[];group.traverse(o=>{if(o.isMesh)draws.push(o.name);});
 assert.ok(draws.length<=5,'Posters, props, lanterns and bottles: '+draws.join(', '));
 assert.ok(colliders.some(c=>Math.abs(c.z-KEEP_SHELF.z)<.01),'The shelf is solid');
});
