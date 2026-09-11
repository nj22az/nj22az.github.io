import * as THREE from '../../vendor/three.module.js';
import {clone} from '../../vendor/SkeletonUtils.js';

// Keep the low-poly rigs' own locomotion. Add seated social poses on their
// original bones, including the independently parented foot controls.
export function prepareResidentAnimations(asset){
 const idle=asset.animations.find(clip=>clip.name==='Idle_Neutral');if(!idle)return asset.animations;
 const pose=clone(asset.scene),samples=idle.tracks.map(track=>({sample:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
 const point=name=>pose.getObjectByName(name).getWorldPosition(new THREE.Vector3());
 const rotate=(name,delta)=>{const bone=pose.getObjectByName(name),parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());bone.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent)).normalize();bone.updateWorldMatrix(false,true);};
 const result=[...asset.animations],duration=4,times=Array.from({length:25},(_,i)=>i*duration/24);
 const names=['UpperLegL','LowerLegL','FootL','UpperLegR','LowerLegR','FootR','UpperArmL','LowerArmL','UpperArmR','LowerArmR'];
 for(const name of ['Sit','Eat','Drink']){
  const tracks=new Map(names.map(n=>[n+'.quaternion',[]]));for(const side of ['L','R'])tracks.set('Foot'+side+'.position',[]);
  for(const t of times){
   for(const {sample,binding} of samples)binding.setValue(sample.evaluate(t/duration*idle.duration),0);pose.updateMatrixWorld(true);
   for(const side of ['L','R']){
    const upper='UpperLeg'+side,lower='LowerLeg'+side,foot='Foot'+side,hip=point(upper),knee=point(lower),ankle=point(foot);
    const thigh=knee.distanceTo(hip),calf=ankle.distanceTo(knee),footBone=pose.getObjectByName(foot),footRotation=footBone.getWorldQuaternion(new THREE.Quaternion());
    const lowerAxis=ankle.clone().sub(knee).normalize().applyQuaternion(pose.getObjectByName(lower).getWorldQuaternion(new THREE.Quaternion()).invert());
    const targetKnee=hip.clone().add(new THREE.Vector3(0,-.25,Math.sqrt(1-.25**2)).multiplyScalar(thigh));
    rotate(upper,new THREE.Quaternion().setFromUnitVectors(knee.clone().sub(hip).normalize(),targetKnee.clone().sub(hip).normalize()));
    const currentAxis=lowerAxis.applyQuaternion(pose.getObjectByName(lower).getWorldQuaternion(new THREE.Quaternion()));
    rotate(lower,new THREE.Quaternion().setFromUnitVectors(currentAxis,new THREE.Vector3(0,-1,0)));
    const targetFoot=point(lower).add(new THREE.Vector3(0,-calf,0));
    footBone.position.copy(footBone.parent.worldToLocal(targetFoot));
    footBone.quaternion.copy(footBone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(footRotation));footBone.updateWorldMatrix(false,true);
    const lift=side==='R'&&name!=='Sit'?(1-Math.cos(t/duration*Math.PI*2))*.5:0;
    rotate('UpperArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(-.25-.25*lift,0,0)));
    rotate('LowerArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(-.75-.80*lift,0,0)));
   }
   for(const [key,values] of tracks){const split=key.lastIndexOf('.'),bone=pose.getObjectByName(key.slice(0,split));values.push(...bone[key.slice(split+1)].toArray());}
  }
  const clip=idle.clone();clip.name=name;for(const track of clip.tracks)for(let i=0;i<track.times.length;i++)track.times[i]*=duration/idle.duration;
  clip.tracks=clip.tracks.filter(track=>!tracks.has(track.name));
  for(const [key,values] of tracks)clip.tracks.push(key.endsWith('.position')?new THREE.VectorKeyframeTrack(key,times,values):new THREE.QuaternionKeyframeTrack(key,times,values));
  clip.duration=duration;result.push(clip);
 }
 for(const {binding} of samples)binding.unbind();return result;
}
