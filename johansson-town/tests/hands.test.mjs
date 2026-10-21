import test from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from './fixtures.mjs';
import * as THREE from '../vendor/three.module.js';
import {buildAvatar,BONES} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {HAND_BONES,HAND_PRESETS,DIGITS,normalizeHands,applyHands} from '../src/avatars/hands.js';
import {capturePose,normalizePose,applyPose} from '../src/avatars/pose.js';
installDOM();
const dispose=a=>{a.body.skeleton.dispose();a.dispose();};
test('optional bare hands append 28 joints; existing bones and indices stay unchanged',()=>{
 const legacy=buildAvatar(recipeFor('Thuan'),{faceSize:64}),a=buildAvatar(recipeFor('Thuan'),{faceSize:64,articulatedHands:true});try{
  assert.deepEqual(Object.keys(legacy.bones),BONES);assert.equal(legacy.articulatedHands,false);
  assert.deepEqual(a.body.skeleton.bones.slice(0,BONES.length).map(b=>b.name),BONES);
  assert.deepEqual(a.body.skeleton.bones.slice(BONES.length).map(b=>b.name),HAND_BONES);
  for(const side of ['L','R'])assert.equal(DIGITS.filter(d=>a.bones[d+side+'1']).length,5);
  for(const name of BONES)assert.deepEqual(a.bones[name].position.toArray(),legacy.bones[name].position.toArray());
  const I=a.body.geometry.attributes.skinIndex,W=a.body.geometry.attributes.skinWeight;
  for(let i=0;i<I.count;i++){assert.ok(I.getX(i)<BONES.length+HAND_BONES.length);assert.ok(Math.abs(W.getX(i)+W.getY(i)+W.getZ(i)+W.getW(i)-1)<1e-6);}
  const colour=new THREE.Color(a.recipe.body.skin),C=a.body.geometry.attributes.color;for(let i=0;i<I.count;i++)if(I.getX(i)>=BONES.length){assert.ok(Math.abs(C.getX(i)-colour.r)<1e-6);assert.ok(Math.abs(C.getY(i)-colour.g)<1e-6);assert.ok(Math.abs(C.getZ(i)-colour.b)<1e-6);}
  const meshes=v=>{let count=0;v.root.traverse(o=>{if(o.isMesh)count++;});return count;};assert.equal(meshes(a),meshes(legacy));
  assert.ok(I.array.some(v=>v>=BONES.length));assert.ok(a.body.geometry.attributes.position.array.every(Number.isFinite));
  assert.ok(a.body.geometry.attributes.position.count<legacy.body.geometry.attributes.position.count+10000,'bounded geometry cost');
 }finally{dispose(legacy);dispose(a);}
});
test('presets animate all five digits independently without moving the wrist or accumulating rotations',()=>{
 const a=buildAvatar(recipeFor('Johansson'),{faceSize:64,articulatedHands:true});try{
  a.bones.handR.rotation.set(.3,.2,.1);const wrist=a.bones.handR.quaternion.clone();
  for(const preset of Object.keys(HAND_PRESETS)){
   const state=normalizeHands({enabled:true,R:{preset}});applyHands(a,state);const q=a.bones.indexR2.quaternion.clone();
   for(let i=0;i<200;i++)applyHands(a,state);
   assert.ok(a.bones.indexR2.quaternion.angleTo(q)<1e-7);assert.ok(a.bones.handR.quaternion.angleTo(wrist)<1e-7);
  }
  applyHands(a,{enabled:true,R:{preset:'peace'}});assert.ok(Math.abs(a.bones.indexR2.rotation.x)<1e-7);assert.ok(Math.abs(a.bones.middleR2.rotation.x)<1e-7);assert.ok(a.bones.ringR2.rotation.x<-1);
  const state=normalizeHands({enabled:true});state.R.curl[2]=.8;applyHands(a,state);assert.ok(a.bones.ringR1.rotation.x<-1);assert.ok(Math.abs(a.bones.pinkyR1.rotation.x)<.6);
 }finally{dispose(a);}
});
test('body and hand poses round trip together; old pose files still use the original rig',()=>{
 const a=buildAvatar(recipeFor('Vy'),{faceSize:64,articulatedHands:true});try{
  applyHands(a,{enabled:true,L:{preset:'point'},R:{preset:'peace'}});
  const pose=normalizePose(JSON.parse(JSON.stringify(capturePose(a))));assert.equal(pose.hands.R.preset,'peace');
  const q=a.bones.pinkyR2.quaternion.clone();a.bones.pinkyR2.rotation.x=0;applyPose(a,pose);assert.ok(a.bones.pinkyR2.quaternion.angleTo(q)<1e-7);
  const old=buildAvatar(recipeFor('Vy'),{faceSize:64});try{const oldPose=capturePose(old);assert.equal(oldPose.hands,undefined);applyPose(old,oldPose);assert.throws(()=>applyPose(old,pose));}finally{dispose(old);}
  assert.throws(()=>normalizeHands({enabled:true,L:{curl:[1]}}));assert.throws(()=>normalizeHands({R:{preset:'bad'}}));
  assert.throws(()=>normalizeHands({R:{spread:NaN}}));assert.equal(normalizeHands({L:{curl:[-2,4,0,0,0]}}).L.curl[0],0);
 }finally{dispose(a);}
});
test('all existing preview outfits keep the articulated hand skinning',()=>{
 const a=buildAvatar(recipeFor('Thuan'),{faceSize:64,articulatedHands:true});try{
  for(const outfit of ['clothes','nozomi','sailor','swim','towel','afterbath']){
   a.wear(outfit);const meshes=[];a.root.traverse(o=>{if(o.isSkinnedMesh&&o.visible&&!o.userData.outline)meshes.push(o);});
   assert.ok(meshes.some(o=>o.geometry.attributes.skinIndex.array.some(v=>v>=BONES.length)),outfit);
  }
 }finally{dispose(a);}
});
