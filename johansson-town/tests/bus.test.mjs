import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBusRun,vanishingPoint} from '../src/world/bus.js';
import {TUNNEL} from '../src/world/coyote-tunnel.js';

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
