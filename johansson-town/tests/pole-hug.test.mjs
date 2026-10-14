import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildAvatar} from '../src/avatars/build.js';
import {CAST_RECIPES} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {poleHugPole,POLE_RADIUS} from '../src/avatars/fun-poses.js';
import {surface} from './body-contact.mjs';
installDOM();

// Up the pole (FUN_POSES.PoleHug) round a real pole: Johansson Studio's collision check found the nobori pole through Officer
// Mori's face in The Haunted Vending Machine (the creator, 2026-10-14: "the world should have its collisions intact even when
// we Make films"). Where the pole stands for a body (poleHugPole), no part of the body goes into it (a centimetre at most:
// the film's own tolerance) at any moment of the hold, as the head looks about and the body sways; and the left arm goes
// round it, its mitten in front of the pole; by either cheek (PoleHug, PoleHugR: a flag hangs from a nobori's pole on one
// side, and the body clings on the other).
for(const side of ['L','R'])test(`every resident hugs a real pole by the ${side==='L'?'left':'right'} cheek without going into it, that arm's mitten round in front of it`, ()=>{
 for(const [who,recipe] of Object.entries(CAST_RECIPES)){
  const avatar=buildAvatar(recipe),anim=createAvatarAnimator(avatar,{lively:false});
  const [px,pz]=poleHugPole(avatar.measure,POLE_RADIUS,avatar,side);
  anim.play(side==='L'?'PoleHug':'PoleHugR');
  let deepest=0,where='';
  for(let i=0;i<240;i++){
   anim.update(1/60,{airborne:true});
   if(i<56||i%10)continue;   // from when the hug has closed (its ramp, 0.9 s), every sixth of a second
   avatar.root.updateMatrixWorld(true);
   for(const {p,bone} of surface(avatar,{stride:2})){
    const q=avatar.root.worldToLocal(p.clone()),d=POLE_RADIUS-Math.hypot(q.x-px,q.z-pz);
    if(d>deepest){deepest=d;where=`${bone} at ${q.y.toFixed(2)} m, ${(i/60).toFixed(2)} s`;}
   }
  }
  assert.ok(deepest<=.01,`${who} (${side}): ${(deepest*1000).toFixed(0)} mm into the pole (${where})`);
  const hand=avatar.root.worldToLocal(avatar.bones['hand'+side].getWorldPosition(new THREE.Vector3()));
  assert.ok(hand.z>pz&&Math.abs(hand.x-px)<.12,`${who} (${side}): the mitten (${hand.x.toFixed(2)}, ${hand.z.toFixed(2)}) is not round in front of the pole (${px.toFixed(2)}, ${pz.toFixed(2)})`);
  avatar.dispose?.();
 }
});

test('the pole stands beside the cheek, clear of the drawn head however it turns, just ahead of the shoulder', ()=>{
 const avatar=buildAvatar(CAST_RECIPES['Officer Mori']),m=avatar.measure,[x,z]=poleHugPole(m,POLE_RADIUS,avatar);
 assert.ok(x>m.Rh*m.headSX+POLE_RADIUS,'beyond the head itself');
 assert.deepEqual(poleHugPole(m,POLE_RADIUS,avatar,'R'),[-x,z],'the right cheek\'s pole is the left\'s mirrored');
 assert.ok(z>m.depth/2&&z<m.depth/2+.1,'just ahead of the chest');
 avatar.dispose?.();
});
