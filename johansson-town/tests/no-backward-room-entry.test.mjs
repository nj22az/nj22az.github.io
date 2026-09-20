import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {travelYaw,snapFaceTravel,FACE_ALIGN,alignedStep,faceYaw} from '../src/people/facing.js';
import {createRoomWalk} from '../src/people/room-walk.js';

test('town forward look: yaw 0 faces -Z; travelYaw matches faceYaw',()=>{
 assert.ok(Math.abs(travelYaw({x:0,z:0},{x:0,z:-2}))<1e-9);
 assert.ok(Math.abs(travelYaw([0,0,0],[0,0,-2]))<1e-9);
 assert.ok(Math.abs(faceYaw({x:0,z:0},{x:0,z:-1})-travelYaw({x:0,z:0},{x:0,z:-1}))<1e-9);
 assert.ok(Math.abs(travelYaw({x:0,z:0},{x:-1,z:0})-Math.PI/2)<1e-9);
});

test('snapFaceTravel aims the body before any step',()=>{
 const g=new THREE.Group();g.position.set(0,0,0);g.rotation.y=Math.PI; // faced +Z / away from -Z walk
 snapFaceTravel(g,[0,0,-3]);
 assert.ok(Math.abs(g.rotation.y)<1e-9,'now faces the doorway travel');
});

test('room-walk will not translate while facing more than FACE_ALIGN off the step',()=>{
 const g=new THREE.Group();g.position.set(0,0,0);g.rotation.y=0;
 const person={g,profile:{name:'Kenji',age:32}};
 const walk=createRoomWalk(()=>false,{smoothTurn:false});
 const before=g.position.clone();
 // Target to -X needs ~+pi/2; start facing -Z (yaw 0)
 for(let i=0;i<8;i++)walk.move(person,[-2,0,0],1/60);
 assert.ok(g.position.distanceTo(before)<1e-6);
 assert.ok(FACE_ALIGN===.35);
 assert.ok(alignedStep(Math.PI/2)<1e-9);
});
