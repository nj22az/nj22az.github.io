import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {standingHitsRect} from '../physics.js';
import {SAKURA_LAYOUT} from '../src/world/interiors/sakura-layout.js';
import {SAKURA_STAIR,buildSakuraStoreys,sakuraStoreys,sakuraBoundsAt} from '../src/world/interiors/sakura-stairs.js';
import {suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {createIndoorCeilings} from '../src/render/indoor-camera.js';
import {buildSakuraShell} from '../src/world/interiors/sakura-shell.js';
import {fluorescent} from '../src/render/dusk.js';

test('walk from the stockroom up both flights to the office and down at normal player radius',()=>{
 const room=new THREE.Group(),stairs=buildSakuraStoreys({room,reg(){},action(){},exit(){}}),layout=sakuraStoreys(SAKURA_LAYOUT);
 const colliders=[...SAKURA_LAYOUT.colliders,...stairs.colliders],blocked=(x,y,z)=>suppliedRoomBoundsBlocked(sakuraBoundsAt(SAKURA_LAYOUT,y),x,z,.28)||colliders.some(c=>standingHitsRect(x,z,.28,y,c));
 const H=SAKURA_STAIR.height,route=[[3.8,0,-3.3],[3.8,0,-4.7],[2.95,0,-4.7],[2.95,0,-5.3],[-1.2,0,-5.3],[-1.2,0,-4.6],[-1.8,0,-4.6],[-4.5,H/2,-4.6],[-5.05,H/2,-4.6],[-5.05,H/2,-6.15],[-4.5,H/2,-6.15],[-1.8,H,-6.15],[-1.2,H,-6.15],[-1.2,H,-3.95],[-.8,H,-2.5]];
 let [x,y,z]=route[0];
 for(const target of [...route.slice(1),...route.slice(0,-1).reverse()]){
  const [tx,ty,tz]=target,n=Math.ceil(Math.hypot(tx-x,tz-z)/.025),sx=x,sz=z;
  for(let i=1;i<=n;i++){
   const nx=sx+(tx-sx)*i/n,nz=sz+(tz-sz)*i/n,step=layout.walk.move(x,y,z,nx,nz,.28,blocked);
   assert.ok(step.ok,`blocked at ${[nx,y,nz]} towards ${target}`);x=nx;z=nz;y=step.y;
  }
  assert.ok(Math.abs(y-ty)<.025,`feet at ${y}, expected ${ty}`);
 }
 assert.equal(y,0);
});

test('stair opening provides standing headroom; upper seats retain absolute positions',()=>{
 const room=new THREE.Group();room.add(buildSakuraShell());buildSakuraStoreys({room,reg(){},action(){},exit(){}});
 const ceilings=createIndoorCeilings(room),H=SAKURA_STAIR.height;
 for(const [x,y,z] of [[-3.15,H/4,-4.6],[-5.05,H/2,-5.35],[-3.15,H*.75,-6.15],[-1.2,H,-4.5]])assert.ok(ceilings.heightAt(x,z,y)>y+1.82,`headroom at ${[x,y,z]}`);
 let seat;room.traverse(o=>{if(o.userData.seat)seat=o.userData.seat;});assert.equal(seat.position[1],H);assert.ok(seat.eyeY>H+1);
});

test('office fixtures stay visible at midnight without extra point lights',()=>{
 const room=new THREE.Group();buildSakuraStoreys({room,reg(){},action(){},exit(){}});
 const fixtures=[],points=[];room.traverse(o=>{if(o.name==='Office fluorescent diffuser')fixtures.push(o);if(o.isPointLight)points.push(o);});
 assert.equal(fixtures.length,2);assert.equal(points.length,0);
 for(const minutes of [0,120,720,1380]){assert.equal(fluorescent(minutes),1);for(const o of fixtures){assert.ok(o.visible);assert.equal(o.material.toneMapped,false);}}
});
