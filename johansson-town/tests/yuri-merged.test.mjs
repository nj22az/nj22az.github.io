import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {prepareMergedYuriAnimations} from '../src/people/yuri-merged-animation.js';
import {rigThuanFingers} from '../src/people/thuan-fingers.js';

async function load(){
 const b=await readFile(new URL('../assets/characters/yuri/yuri-merged.glb',import.meta.url));
 return new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
}

test('merged Thuan retains her supplied mesh and ten animations in a self-contained mobile texture package',async()=>{
 const b=await readFile(new URL('../assets/characters/yuri/yuri-merged.glb',import.meta.url));
 assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);assert.ok(b.length<10_100_000);
 const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),binary=b.subarray(28+b.readUInt32LE(12));
 assert.equal(g.skins.length,1);assert.equal(g.meshes.length,1);assert.equal(g.accessors[g.meshes[0].primitives[0].attributes.POSITION].count,98333);
 assert.equal(g.accessors[g.meshes[0].primitives[0].indices].count/3,98972);assert.equal(g.animations.length,10);
 for(const buffer of g.buffers)assert.equal(buffer.uri,undefined);
 for(const image of g.images){const view=g.bufferViews[image.bufferView];assert.equal(image.uri,undefined);assert.equal(image.mimeType,'image/jpeg');assert.equal(binary.readUInt16BE(view.byteOffset),0xffd8);}
 for(const view of g.bufferViews){assert.equal(view.byteOffset%4,0);assert.ok(view.byteOffset+view.byteLength<=binary.length);}
});

test('Thuan retains authored locomotion and a calm chair loop without root drift or crouching at idle',async()=>{
 const previous={self:globalThis.self,bitmap:globalThis.createImageBitmap};globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 try{
  const asset=await load();
  const original=JSON.stringify(asset.animations.map(c=>c.toJSON())),snapshot=[];asset.scene.traverse(o=>snapshot.push([o,...o.position.toArray(),...o.quaternion.toArray()]));
  const clips=prepareMergedYuriAnimations(asset),rest=asset.animations.find(c=>c.name==='restpose').tracks.find(t=>t.name==='Hips.position').values;
  assert.equal(JSON.stringify(asset.animations.map(c=>c.toJSON())),original,'Adapt clones, not the source clips');
  for(const [node,...values] of snapshot)assert.deepEqual([...node.position.toArray(),...node.quaternion.toArray()],values,'Baking leaves the source skeleton untouched');
  for(const clip of clips){
   const root=clip.tracks.find(t=>t.name==='Hips.position');
   for(let i=0;i<root.values.length;i+=3){assert.equal(root.values[i],rest[0]);assert.equal(root.values[i+2],rest[2]);}
  }
  for(const [name,source] of [['Walk','Walking'],['Run','Running'],['Wave','Big_Wave_Hello']]){
   const clip=clips.find(c=>c.name===name),authored=asset.animations.find(c=>c.name===source);assert.equal(clip.duration,authored.duration);
   for(const track of authored.tracks.filter(t=>t.name.endsWith('.quaternion'))){
    const a=track.createInterpolant(),b=clip.tracks.find(t=>t.name===track.name).createInterpolant();
    for(const fraction of [0,.23,.51,.89])assert.ok(new THREE.Quaternion().fromArray(a.evaluate(clip.duration*fraction)).angleTo(new THREE.Quaternion().fromArray(b.evaluate(clip.duration*fraction)))<.001,'Preserve authored rotations: '+name+' '+track.name);
   }
  }
  const sit=clips.find(c=>c.name==='Sit');
  for(const track of sit.tracks){const sample=track.createInterpolant();assert.deepEqual([...sample.evaluate(0)],[...sample.evaluate(sit.duration)],'The quiet seated loop closes without a jump');}
  const mixer=new THREE.AnimationMixer(asset.scene);mixer.clipAction(clips.find(c=>c.name==='Idle_Neutral')).play();mixer.update(.5);asset.scene.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(asset.scene,true);assert.ok(bounds.max.y>1.68&&bounds.min.y>-.01&&bounds.min.y<.01,'Standing idle stays grounded at full height');
 }finally{globalThis.self=previous.self;globalThis.createImageBitmap=previous.bitmap;}
});

test('Thuan has relaxed idle and counter poses with independently posed fingers',async()=>{
 const previous={self:globalThis.self,bitmap:globalThis.createImageBitmap};globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 try{
  const asset=await load();
  rigThuanFingers(asset);
  assert.equal(asset.scene.getObjectByName('LeftHandIndex1')?.isBone,true);
  assert.equal(asset.scene.getObjectByName('RightHandPinky3')?.isBone,true);
  let mesh;asset.scene.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});
  assert.equal(mesh.skeleton.bones.length,58);
  const clips=prepareMergedYuriAnimations(asset),idle=clips.find(c=>c.name==='Idle_Neutral'),counter=clips.find(c=>c.name==='CounterIdle');
  assert.ok(idle.tracks.some(t=>t.name==='LeftHandIndex2.quaternion'));
  assert.ok(counter);
  const mixer=new THREE.AnimationMixer(asset.scene),point=new THREE.Vector3();
  mixer.clipAction(idle).play();mixer.update(.3);asset.scene.updateMatrixWorld(true);mesh.skeleton.update();
  const right=asset.scene.getObjectByName('RightHand').getWorldPosition(new THREE.Vector3());
  const index=asset.scene.getObjectByName('LeftHandIndex3').getWorldPosition(new THREE.Vector3());
  const pinky=asset.scene.getObjectByName('LeftHandPinky3').getWorldPosition(new THREE.Vector3());
  assert.ok(index.distanceTo(pinky)>.02,'Fingers can separate');
  mixer.stopAllAction();mixer.clipAction(counter).play();mixer.update(.3);asset.scene.updateMatrixWorld(true);
  const counterHand=asset.scene.getObjectByName('RightHand').getWorldPosition(new THREE.Vector3());
  assert.ok(counterHand.z>.18,'Counter idle plants the right hand toward the desk');
  assert.ok(counterHand.y>1.0&&counterHand.y<1.22,'Counter hand stays near desk height');
  assert.ok(counterHand.z>right.z+.15,'Desk reach is further forward than the hip idle');
  for(const clip of [idle,counter,clips.find(c=>c.name==='Walk')]){
   mixer.stopAllAction();mixer.clipAction(clip).play();
   for(const fraction of [0,.33,.66,1]){
    mixer.setTime(clip.duration*fraction);mesh.skeleton.update();
    for(let i=0;i<mesh.geometry.attributes.position.count;i+=19){
     mesh.getVertexPosition(i,point);assert.ok(point.toArray().every(Number.isFinite));assert.ok(point.length()<3.2);
    }
   }
  }
 }finally{globalThis.self=previous.self;globalThis.createImageBitmap=previous.bitmap;}
});
