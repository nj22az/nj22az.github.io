import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBusRun,vanishingPoint} from '../src/world/bus.js';
import {TUNNEL} from '../src/world/coyote-tunnel.js';
import {circleHitsRect} from '../physics.js';

/** Runs the service until it reaches a phase, or gives up. */
function until(run,phase,seconds=200,dt=1/30){
 const seen=[];
 for(let t=0;t<seconds;t+=dt){
  if(run.phase!==seen.at(-1))seen.push(run.phase);
  if(run.phase===phase)return seen;
  run.update(dt);
 }
 return null;
}

test('the bus leaves by being shrunk onto the painting, and comes back the same way',()=>{
 const parent=new THREE.Group(),run=createBusRun({parent});
 const vanish=vanishingPoint();
 // It starts at the stop, full size, facing the way it will go.
 assert.equal(run.phase,'waiting');
 assert.equal(run.bus.scale.x,1);
 assert.ok(run.bus.position.z<TUNNEL.z-10,'The bus starts at the tunnel rather than the stop');

 assert.ok(until(run,'leaving'),'The bus never leaves');
 assert.ok(until(run,'vanishing'),'The bus never reaches the tunnel');
 // Through the vanish it converges on the painting's own vanishing point. Anything
 // else and it slides off the picture as it recedes, which is the whole illusion.
 let last=Infinity;
 for(let t=0;t<4;t+=1/30){
  run.update(1/30);
  if(run.phase!=='vanishing')break;
  const gap=run.bus.position.distanceTo(vanish);
  assert.ok(gap<=last+1e-6,'The bus is not closing on the vanishing point');
  assert.ok(run.bus.scale.x<1,'The bus is not shrinking');
  last=gap;
 }
 assert.equal(run.phase,'gone');
 assert.equal(run.bus.visible,false,'The bus is still there once it has gone');
 assert.ok(run.bus.scale.x<.05,'The bus goes out at a size you would still see');
 assert.ok(run.bus.position.distanceTo(vanish)<.4,'The bus goes out somewhere other than the far end');

 // and the whole thing comes round again.
 const seen=until(run,'waiting',400);
 assert.ok(seen,'The service never comes back');
 for(const phase of ['arriving','returning','turning'])assert.ok(seen.includes(phase),'The bus skips '+phase);
 assert.equal(run.bus.scale.x,1);
 assert.ok(Math.abs(run.bus.rotation.y)<1e-6,'The bus waits facing the wrong way');
});

test('the bus is solid while it is a bus, and not once it is a picture of one',()=>{
 const parent=new THREE.Group(),colliders=[],run=createBusRun({parent,colliders});
 const solid=colliders.find(c=>c.id==='harbour-bus');
 assert.ok(solid,'You walk through the bus at the stop');

 // Standing at the terminus it is eight and a half metres of vehicle across the road.
 const nose=run.bus.position.z+3.5;
 assert.ok(circleHitsRect(run.bus.position.x,nose,.36,solid),'You can walk into the side of the waiting bus');
 assert.ok(!circleHitsRect(run.bus.position.x+4,run.bus.position.z,.36,solid),'The bus stops you from the next lane');
 assert.ok(solid.d>solid.w,'The waiting bus is as wide as it is long');

 // It carries its box up the road with it.
 assert.ok(until(run,'leaving'),'The bus never leaves');
 for(let t=0;t<2;t+=1/30){run.update(1/30);if(run.phase!=='leaving')break;}
 assert.ok(Math.abs(solid.z-run.bus.position.z)<1e-6,'The box stayed at the stop');

 // and drops it the moment it stops being a vehicle in the road. A collider left on
 // the shrinking bus is an invisible wall across the mouth of the tunnel.
 assert.ok(until(run,'gone'),'The bus never goes');
 assert.equal(solid.w,0);assert.equal(solid.d,0);
 assert.ok(!circleHitsRect(TUNNEL.x,TUNNEL.z-2,.36,solid),'The departed bus still blocks the tunnel mouth');
 // and it is parked out of the world rather than shrunk to nothing where it stood.
 // A 0x0 rect is not "no collider": circleHitsRect compares against half the width
 // plus the walker's radius, so a zero box still stops anyone who comes within 0.36m
 // of its centre — an invisible post at whatever spot the bus faded out on.
 assert.ok(Math.hypot(solid.x,solid.z)>1e5,'The departed bus left an invisible post behind it');
 assert.ok(circleHitsRect(solid.x,solid.z,.36,{x:solid.x,z:solid.z,w:0,d:0}),'A zero-size rect does not stop anyone, so parking it away is pointless');

 // Turning at the terminus it sweeps the road, so the box turns with it.
 assert.ok(until(run,'turning',400),'The bus never turns');
 for(let t=0;t<1;t+=1/30){run.update(1/30);if(run.phase!=='turning')break;}
 assert.ok(solid.w>2.5&&solid.d>2.5,'The turning bus keeps a box it is not inside');
});
