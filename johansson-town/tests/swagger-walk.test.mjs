import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {prepareProtagonistAnimations} from '../src/people/protagonist-animation.js';

test('swagger keeps separate foot lanes, steadier hips, foot timing and a seamless loop',async()=>{
 const bitmap=globalThis.createImageBitmap,self=globalThis.self;globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 try{
  const bytes=await readFile(new URL('../assets/characters/protagonist/johansson.glb',import.meta.url));const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const original=asset.animations.find(c=>c.name==='Walking'),unchanged=JSON.stringify(original.toJSON()),walk=prepareProtagonistAnimations(asset).find(c=>c.name==='Walk');
  assert.equal(JSON.stringify(original.toJSON()),unchanged,'Preserve the supplied animation');assert.ok(walk.duration>original.duration);
  const mixer=new THREE.AnimationMixer(asset.scene),sample=clip=>{
   mixer.stopAllAction();mixer.clipAction(clip).reset().play();const rows=[];
   for(let i=0;i<64;i++){
    mixer.setTime(clip.duration*i/64);asset.scene.updateMatrixWorld(true);
    const p=name=>asset.scene.getObjectByName(name).getWorldPosition(new THREE.Vector3()),hips=asset.scene.getObjectByName('Hips'),left=p('LeftFoot'),right=p('RightFoot');
    const roll=new THREE.Euler().setFromQuaternion(hips.getWorldQuaternion(new THREE.Quaternion())).z;rows.push({left,right,roll,hipY:p('Hips').y});
   }return rows;
  };
  const before=sample(original),after=sample(walk),range=(rows,key)=>Math.max(...rows.map(r=>r[key]))-Math.min(...rows.map(r=>r[key]));
  assert.ok(range(after,'roll')<range(before,'roll')*.3);assert.ok(range(after,'hipY')<range(before,'hipY')*.65);
  for(let i=0;i<after.length;i++){
   assert.ok(after[i].left.x-after[i].right.x>.24,'Feet stay in their own lanes');assert.ok(after[i].left.x-after[i].right.x<.30,'No exaggerated wide squat');
   for(const side of ['left','right'])assert.ok(Math.abs(before[i][side].y-after[i][side].y)<.025,'Keep authored ground clearance');
  }
  for(const track of walk.tracks){const stride=track.getValueSize();for(const value of track.values)assert.ok(Number.isFinite(value));
   const a=Array.from(track.values.slice(0,stride)),b=Array.from(track.values.slice(-stride));
   if(track.name.endsWith('.quaternion'))assert.ok(Math.abs(new THREE.Quaternion().fromArray(a).dot(new THREE.Quaternion().fromArray(b)))>.9999,'Loop quaternion matches');
   else for(let i=0;i<stride;i++)assert.ok(Math.abs(a[i]-b[i])<.0001,'Loop endpoint matches');
  }
 }finally{globalThis.createImageBitmap=bitmap;globalThis.self=self;}
});

test('idle, walk and run keep the protagonist’s gaze level',async()=>{
 const bitmap=globalThis.createImageBitmap,self=globalThis.self;globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 try{
  const bytes=await readFile(new URL('../assets/characters/protagonist/johansson.glb',import.meta.url));const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const clips=prepareProtagonistAnimations(asset),mixer=new THREE.AnimationMixer(asset.scene),head=asset.scene.getObjectByName('Head'),front=asset.scene.getObjectByName('headfront');
  const headPosition=new THREE.Vector3(),frontPosition=new THREE.Vector3();
  for(const name of ['Idle_Neutral','Walk','Run']){
   const clip=clips.find(c=>c.name===name);mixer.stopAllAction();mixer.clipAction(clip).reset().play();
   for(let i=0;i<64;i++){
    mixer.setTime(clip.duration*i/64);asset.scene.updateMatrixWorld(true);head.getWorldPosition(headPosition);front.getWorldPosition(frontPosition);
    const face=frontPosition.sub(headPosition).normalize(),pitch=THREE.MathUtils.radToDeg(Math.atan2(face.y,Math.hypot(face.x,face.z)));
    assert.ok(Math.abs(pitch)<.35,`${name} gaze is ${pitch.toFixed(2)}° from level`);
   }
  }
 }finally{globalThis.createImageBitmap=bitmap;globalThis.self=self;}
});
