import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {prepareNaoAnimations} from '../src/people/nao-vrm-animation.js';

test('the supplied Nao VRM is preserved and has the town action set',async()=>{
 const bytes=await readFile(new URL('../assets/characters/nao/Nao.vrm',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'ea8fc33c7656b51f835075fc33621c5ce64fe9f3999ac4e95e00ec5ce755588d');
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 const scene=new THREE.Group();
 for(const name of ['J_Bip_C_Hips','J_Bip_C_Spine','J_Bip_C_Chest','J_Bip_C_Head','J_Bip_L_UpperArm','J_Bip_L_LowerArm','J_Bip_R_UpperArm','J_Bip_R_LowerArm','J_Bip_L_UpperLeg','J_Bip_L_LowerLeg','J_Bip_R_UpperLeg','J_Bip_R_LowerLeg']){
  const bone=new THREE.Bone();bone.name=name;scene.add(bone);
 }
 const clips=prepareNaoAnimations({scene}),names=new Set(clips.map(clip=>clip.name));
 for(const name of ['Idle_Neutral','CounterIdle','Walk','Run','Wave','Sit','Eat','Drink','Sleep','CarryWalk'])assert.ok(names.has(name),name);
 for(const clip of clips)for(const track of clip.tracks)assert.ok([...track.values].every(Number.isFinite),clip.name+' '+track.name);
 const use=clips.find(clip=>clip.name==='Use'),sit=clips.find(clip=>clip.name==='Sit');
 const useLeg=use.tracks.find(track=>track.name==='J_Bip_L_UpperLeg.quaternion');
 const sitLeg=sit.tracks.find(track=>track.name==='J_Bip_L_UpperLeg.quaternion');
 assert.notDeepEqual([...useLeg.values.slice(0,4)],[...sitLeg.values.slice(0,4)],'standing counter work must not reuse the airborne seated legs');
});
