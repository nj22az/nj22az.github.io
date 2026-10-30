import {test} from 'node:test';
import assert from 'node:assert/strict';
import {slides,GAIT_NAMES,GAIT_SPEEDS} from '../tools/gait-feet.mjs';
import {providePixarBodyInNode} from './pixar-fixture.mjs';

function planted(r){
 const label=`${r.name} ${r.speed} m/s`;
 assert.ok(r.landingDelay<=167,`${label}: both feet suspended for ${r.landingDelay} ms after stopping`);
 assert.ok(r.contacts>=4,`${label}: must actually put both shoes down`);
 assert.ok(r.worst<10,`${label}: heel/toe slides ${r.worst} mm`);
 assert.ok(r.surfaceWorst<10,`${label}: drawn sole slides ${r.surfaceWorst} mm`);
 assert.ok(r.penetration<10,`${label}: shoe penetrates floor ${r.penetration} mm`);
 assert.ok(r.pop<40,`${label}: shoe jumps vertically ${r.pop} mm in a 60 Hz frame`);
}

test('six different bodies plant their drawn soles from a standing start, at four speeds',()=>{
 for(const name of GAIT_NAMES)for(const speed of GAIT_SPEEDS)planted(slides(name,speed,{pixar:false}));
});

test('stops at different points of walk and run finish with lifted recovery steps, never a drag',()=>{
 for(const name of GAIT_NAMES)for(const speed of GAIT_SPEEDS)for(const stopAt of [1.13,1.37,1.69]){
  const r=slides(name,speed,{stop:true,stopAt,pixar:false});planted(r);
  assert.ok(r.stopWorst<10,`${name} stop: ${r.stopWorst} mm`);
 }
});

test('foot locks are in world space, independent of the direction of travel',()=>{
 for(const name of ['Harbour master','Vy'])for(const heading of [.7,Math.PI/2,Math.PI])
  planted(slides(name,1.3,{heading,pixar:false,stop:true}));
});

test('the live Pixar Thuan and Johansson use their own measured bones and shoe surfaces',async()=>{
 for(const name of ['Thuan','Johansson']){
  await providePixarBodyInNode(name);
  for(const speed of GAIT_SPEEDS)for(const stopAt of [1.13,1.69])planted(slides(name,speed,{stop:true,stopAt}));
 }
});


function changingPace(name,pixar=false){
 const cases=[
  slides(name,3.5,{seconds:6,pixar,pace:t=>t<1?1.3:t<3?3.5:Math.max(0,3.5-(t-3)*2)}),
  slides(name,3.5,{seconds:5,pixar,pace:t=>t<1?1.3:t<1.1?0:t<2.1?3.5:t<3?0:t<4?1.3:0}),
 ];
 for(const r of cases){planted(r);
  assert.ok(r.hipDrop<r.reach*.4,`${name}: pelvis collapses ${r.hipDrop} mm during transition`);
  assert.ok(r.hipJump<50,`${name}: pelvis jumps ${r.hipJump} mm during transition`);
 }
}
test('changing pace and interrupting a stop preserve contacts and continuous soles',async()=>{
 for(const name of GAIT_NAMES)changingPace(name);
 for(const name of ['Thuan','Johansson']){await providePixarBodyInNode(name);changingPace(name,true);}
});

test('running keeps the pelvis up without abrupt body-height changes',async()=>{
 for(const name of GAIT_NAMES){const r=slides(name,3.5,{pixar:false});
  assert.ok(r.hipDrop<r.reach*.3,`${name}: pelvis drops ${r.hipDrop} mm`);
  assert.ok(r.hipJump<40,`${name}: pelvis jumps ${r.hipJump} mm/frame`);
 }
 for(const name of ['Thuan','Johansson']){await providePixarBodyInNode(name);const r=slides(name,3.5);
  assert.ok(r.hipDrop<r.reach*.3,`${name} Pixar: pelvis drops ${r.hipDrop} mm`);
  assert.ok(r.hipJump<40,`${name} Pixar: pelvis jumps ${r.hipJump} mm/frame`);
 }
});
