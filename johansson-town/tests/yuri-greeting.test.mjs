import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {prepareYuriAnimations} from '../src/people/yuri-animation.js';

test('Yuri greeting raises her hand, keeps feet planted, bounds the head tilt and returns to authored idle',async()=>{
 const oldSelf=globalThis.self,oldBitmap=globalThis.createImageBitmap;
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 try{
  const b=await readFile(new URL('../assets/characters/realistic/yuri-playful.glb',import.meta.url));
  const asset=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
  const poseSnapshot=()=>{const values=[];asset.scene.traverse(o=>values.push([o.uuid,...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()]));return values;};
  const original=JSON.stringify(asset.animations.map(clip=>clip.toJSON())),originalPose=poseSnapshot();
  const clips=prepareYuriAnimations(asset),idle=clips.find(c=>c.name==='Idle_Neutral'),wave=clips.find(c=>c.name==='Wave');
  assert.equal(JSON.stringify(asset.animations.map(clip=>clip.toJSON())),original,'Do not rewrite imported clips');
  assert.deepEqual(poseSnapshot(),originalPose,'Baking must not leave the loaded rig posed');
  assert.equal(wave.duration,1.6);
  for(const track of idle.tracks){
   const greeting=wave.tracks.find(t=>t.name===track.name);assert.ok(greeting);
   if(!/^(RightArm|RightForeArm|RightHand|Head)\.quaternion$/.test(track.name))assert.deepEqual(greeting.values,track.values,'Preserve body channels: '+track.name);
   for(const fraction of [0,1]){
    const a=track.createInterpolant().evaluate(idle.duration*fraction),b=greeting.createInterpolant().evaluate(wave.duration*fraction);
    if(track.name.endsWith('.quaternion'))assert.ok(new THREE.Quaternion().fromArray(a).angleTo(new THREE.Quaternion().fromArray(b))<.001,'Idle endpoint: '+track.name);
    else assert.deepEqual(Array.from(b),Array.from(a));
   }
  }
  const mixer=new THREE.AnimationMixer(asset.scene),action=mixer.clipAction(wave);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();
  const point=name=>asset.scene.getObjectByName(name).getWorldPosition(new THREE.Vector3());
  mixer.update(0);asset.scene.updateMatrixWorld(true);
  const feet=['LeftFoot','RightFoot'].map(point),handStart=point('RightHand');let maximumLift=0,previous=handStart.clone();
  const baseHead=idle.tracks.find(t=>t.name==='Head.quaternion').createInterpolant();
  for(let frame=1;frame<=96;frame++){
   mixer.update(wave.duration/96);asset.scene.updateMatrixWorld(true);
   const hand=point('RightHand');maximumLift=Math.max(maximumLift,hand.y-handStart.y);
   assert.ok(hand.distanceTo(previous)<.06,'No hand jumps between frames');previous.copy(hand);
   for(const [i,name] of ['LeftFoot','RightFoot'].entries())assert.ok(point(name).distanceTo(feet[i])<.0001,'Planted feet');
   assert.ok(asset.scene.getObjectByName('Head').quaternion.angleTo(new THREE.Quaternion().fromArray(baseHead.evaluate(frame/96*idle.duration)))<.09,'Small head motion, no accumulated rotation');
  }
  assert.ok(maximumLift>.30&&maximumLift<.65,'Greeting must be visible above the counter without throwing the hand overhead');
 }finally{globalThis.self=oldSelf;globalThis.createImageBitmap=oldBitmap;}
});
