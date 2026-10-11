import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {routeAt} from '../src/world/layout.js';
import {lanePatches} from '../src/world/lane-surfaces.js';
import {buildFujitaPier,FUJITA_PIER} from '../src/world/fujita-pier.js';
import {buildJohanssonTruck} from '../src/world/johansson-truck.js';

test('Fujita landing connects to the quay while the discarded L-return is water',()=>{
 for(let z=-49.7;z>-64;z-=.1)assert.equal(routeAt(-35.3,z,.25)?.surface,z>-49.7?'stone':'wood');
 for(let z=-50;z<-49.3;z+=.05)assert.ok(routeAt(-35.3,z,.3),`quay joint ${z}`);
 for(let x=-32.5;x<-24;x+=.2)assert.equal(routeAt(x,-62,.25),null,`open water ${x}`);
 assert.ok(!lanePatches().some(p=>p.surface==='wood'&&p.z0<-50&&p.x0<-20));
});
test('pier boards match walkable bounds with flush tops and a clear walking lane',()=>{
 const parent=new THREE.Group(),colliders=[];const {planks}=buildFujitaPier({parent,colliders});
 const bounds=new THREE.Box3().setFromObject(planks);
 assert.ok(Math.abs(bounds.max.y)<1e-6);assert.ok(Math.abs(bounds.min.x-FUJITA_PIER.minX)<1e-5);assert.ok(Math.abs(bounds.max.x-FUJITA_PIER.maxX)<1e-5);
 assert.ok(colliders.every(c=>Math.abs(c.x+35.3)>1));
});
test('truck collision covers the complete chassis and fork envelope throughout its lift',()=>{
 const {group,carriage,collider:c}=buildJohanssonTruck();
 for(const lift of [0,.16,.52]){carriage.position.y=lift;group.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(group);assert.ok(b.min.x>=-c.w/2-.001);assert.ok(b.max.x<=c.w/2+.001);assert.ok(b.min.z>=c.offsetZ-c.d/2-.001);assert.ok(b.max.z<=c.offsetZ+c.d/2+.001);assert.ok(b.max.y<=c.height);}
 assert.ok(group.children.length<15,'batched finishes limit truck draw calls');
});
