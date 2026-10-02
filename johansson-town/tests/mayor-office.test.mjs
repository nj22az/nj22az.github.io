import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildMayorOffice} from '../src/world/interiors/town-hall.js';

test('mayor can approach the chair, face the computer, and use the archive with solid furniture',()=>{
 installDOM();const room=new THREE.Group(),solids=[],anchors=[],actions=[];
 const layout=buildMayorOffice({room,reg:(object,label,fn)=>anchors.push({object,label,fn}),action:(...a)=>actions.push(a),collider:(x,z,w,d,height)=>solids.push({x,z,w,d,height}),exit:()=>{}});
 const blocked=(x,z)=>solids.some(c=>Math.abs(x-c.x)<c.w/2+.22&&Math.abs(z-c.z)<c.d/2+.22);
 const seat=anchors.find(a=>a.label==='Sit at the mayor’s desk').object.userData.seat;
 assert.equal(blocked(...[seat.stand[0],seat.stand[2]]),false,'the chair has an unobstructed stand-up point');
 const desk=room.getObjectByName('Mayor’s desk top');assert.equal(blocked(desk.position.x,desk.position.z),true,'walking cannot pass through the desk');
 const screen=room.getObjectByName('CRT screen'),normal=new THREE.Vector3(0,0,1).applyQuaternion(screen.quaternion),towardChair=new THREE.Vector3(...seat.position).sub(screen.position);
 assert.ok(normal.dot(towardChair)>0,'the screen faces the mayor rather than visitors');
 const seen=new Set(),queue=[[...layout.spawn.filter((_,i)=>i!==1)]];
 while(queue.length){const [x,z]=queue.shift();for(const [dx,dz] of [[.1,0],[-.1,0],[0,.1],[0,-.1]]){const nx=+(x+dx).toFixed(1),nz=+(z+dz).toFixed(1),key=nx+','+nz;
  if(nx<layout.bounds.minX+.22||nx>layout.bounds.maxX-.22||nz<layout.bounds.minZ+.22||nz>layout.bounds.maxZ-.22||blocked(nx,nz)||seen.has(key))continue;seen.add(key);queue.push([nx,nz]);}}
 assert.ok(seen.has('1.5,-1.8'),'the entrance connects to the chair side');assert.ok(seen.has('2.5,1.3'),'the filing cabinet has a reachable approach');
 for(const label of ['Use the mayor’s computer','Open the document register'])anchors.find(a=>a.label===label).fn();assert.equal(actions.filter(a=>a[0]==='document-archive').length,2);
});
