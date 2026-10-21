import test from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from './fixtures.mjs';
import {buildAvatar,BONES} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {capturePose,applyPose,normalizePose,createPoseHistory} from '../src/avatars/pose.js';
import {normalizeScene,placementOf,applyPlacement,samePlacement} from '../../avatar-creator/scene-model.mjs';
installDOM();
const dispose=a=>{a.body.skeleton.dispose();a.dispose();};
test('zero offsets preserve the sampled animation and repeated adjustments never drift',()=>{
 const a=buildAvatar(recipeFor('Thuan'),{faceSize:64});try{
  const animator=createAvatarAnimator(a,{random:()=>.5,initialTime:0});animator.play('Peace');
  for(let i=0;i<30;i++)animator.update(.025,{expression:'smile'});
  const pose=capturePose(a,'Peace'),before=a.bones.head.quaternion.clone();
  applyPose(a,pose);assert.ok(a.bones.head.quaternion.angleTo(before)<1e-7);
  pose.adjustments.headTilt=20;pose.adjustments.RBend=30;applyPose(a,pose);
  const adjusted=a.bones.head.quaternion.clone(),elbow=a.bones.elbowR.quaternion.clone();
  assert.ok(before.angleTo(adjusted)>.3);
  for(let i=0;i<1000;i++)applyPose(a,pose);
  assert.ok(a.bones.head.quaternion.angleTo(adjusted)<1e-7);assert.ok(a.bones.elbowR.quaternion.angleTo(elbow)<1e-7);
  pose.adjustments.headTilt=0;applyPose(a,pose);assert.ok(a.bones.head.quaternion.angleTo(before)<1e-7);
 }finally{dispose(a);}
});
test('portable pose retains target proportions, bone names, appearance and root location',()=>{
 const source=buildAvatar(recipeFor('Johansson'),{faceSize:64}),target=buildAvatar(recipeFor('Vy'),{faceSize:64});try{
  source.root.position.y=.1*source.measure.H;source.bones.shoulderL.rotation.z=1;
  const recipe=JSON.stringify(target.recipe),positions=Object.values(target.bones).map(b=>b.position.toArray());
  target.root.position.set(7,0,9);target.root.rotation.y=.7;
  applyPose(target,normalizePose(JSON.parse(JSON.stringify(capturePose(source)))));
  assert.equal(target.root.position.x,7);assert.equal(target.root.position.z,9);assert.equal(target.root.rotation.y,.7);
  assert.equal(target.root.position.y,.1*target.measure.H);assert.equal(JSON.stringify(target.recipe),recipe);
  assert.deepEqual(Object.values(target.bones).map(b=>b.position.toArray()),positions);assert.deepEqual(Object.keys(target.bones),BONES);
 }finally{dispose(source);dispose(target);}
});
test('pose files reject invalid transforms and clamp offsets without changing input',()=>{
 const a=buildAvatar(recipeFor('Johansson'),{faceSize:64});try{
  const pose=capturePose(a);pose.adjustments.headTilt=999;assert.equal(normalizePose(pose).adjustments.headTilt,25);assert.equal(pose.adjustments.headTilt,999);
  for(const bad of [{...pose,version:2},{...pose,rootHeight:Infinity},{...pose,bones:{}},{...pose,adjustments:{headTilt:'12'}}])assert.throws(()=>normalizePose(bad));
  const bad=structuredClone(pose);bad.bones.head.rotation=[0,0,0,0];assert.throws(()=>normalizePose(bad));
 }finally{dispose(a);}
});
test('undo groups a slider gesture, redo clears after a new edit, and scene files retain custom poses',()=>{
 const a=buildAvatar(recipeFor('Thuan'),{faceSize:64});try{
  const history=createPoseHistory(),pose=capturePose(a);history.set(pose);pose.adjustments.headTilt=10;history.set(pose);
  pose.adjustments.headTilt=20;history.set(pose,{record:false});history.undo();assert.equal(history.value.adjustments.headTilt,0);
  history.redo();assert.equal(history.value.adjustments.headTilt,20);history.undo();history.set(pose);assert.equal(history.canRedo,false);
  const s=normalizeScene({version:2,actors:[{recipe:a.recipe,customPose:pose}]});assert.deepEqual(normalizeScene(JSON.parse(JSON.stringify(s))),s);
  const actor=s.actors[0],before=placementOf(actor);delete actor.customPose;assert.equal(samePlacement(before,placementOf(actor)),false);
  applyPlacement(s,actor.id,before);assert.deepEqual(actor.customPose,normalizePose(pose));
  assert.equal(normalizeScene({version:1,actors:[{recipe:a.recipe}]}).actors[0].customPose,undefined);
 }finally{dispose(a);}
});
