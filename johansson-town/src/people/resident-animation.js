import * as THREE from '../../vendor/three.module.js';
import {clone} from '../../vendor/SkeletonUtils.js';

// Keep the low-poly rigs' own locomotion. Add seated social poses on their
// original bones, including the independently parented foot controls.
export function prepareResidentAnimations(asset){
 const idle=asset.animations.find(clip=>clip.name==='Idle_Neutral');if(!idle)return asset.animations;
 const pose=clone(asset.scene);
 const point=name=>pose.getObjectByName(name).getWorldPosition(new THREE.Vector3());
 const rotate=(name,delta)=>{const bone=pose.getObjectByName(name),parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());bone.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent)).normalize();bone.updateWorldMatrix(false,true);};
 const result=[...asset.animations],duration=4,times=Array.from({length:25},(_,i)=>i*duration/24);
 for(const name of ['Sleep','Wake','Sit','Eat','Drink','Read','Use','Phone','Fish','DrinkStanding','EatStanding','CarryIdle','CarryWalk']){
  const sleeping=name==='Sleep',seated=['Wake','Sit','Eat','Drink'].includes(name),base=name==='CarryWalk'?(asset.animations.find(c=>c.name==='Walk')||idle):idle;
  const samples=base.tracks.map(track=>({sample:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
  const names=['UpperArmL','LowerArmL','UpperArmR','LowerArmR',...((seated||sleeping)?['UpperLegL','LowerLegL','UpperLegR','LowerLegR']:[]),...(seated?['FootL','FootR']:[]),...(sleeping?['Head','Chest']:[])];
  const tracks=new Map(names.map(n=>[n+'.quaternion',[]]));if(seated)for(const side of ['L','R'])tracks.set('Foot'+side+'.position',[]);
  for(const t of times){
   for(const {sample,binding} of samples)binding.setValue(sample.evaluate(t/duration*base.duration),0);pose.updateMatrixWorld(true);
   for(const side of ['L','R']){
    if(seated){
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
    }
    if(sleeping){
     const breath=Math.sin(t/duration*Math.PI*2),sign=side==='L'?-1:1;
     rotate('UpperArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(.34+.012*breath,0,sign*.10)));
     rotate('LowerArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(.62+.018*breath,0,-sign*.035)));
     rotate('UpperLeg'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(side==='R'?.07:.025,0,sign*.018)));
     rotate('LowerLeg'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(side==='R'?.13:.055,0,0)));
    }else{
     const lift=side==='R'&&name!=='Sit'?(1-Math.cos(t/duration*Math.PI*2))*.5:0;
     const carry=name.startsWith('Carry'),phone=name==='Phone'&&side==='R',read=['Read','Fish'].includes(name);
     const upper=name==='Wake'?-.4-.7*Math.sin(Math.PI*t/duration)**2:carry?-.55:phone?-.6:read?-.4:-.25-.25*lift,lower=carry?-1.0:phone?-1.8:read?-1.1:-.75-.80*lift;
     rotate('UpperArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(upper,0,0)));
     rotate('LowerArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(lower,0,0)));
    }
   }
   if(sleeping){const breath=Math.sin(t/duration*Math.PI*2);rotate('Head',new THREE.Quaternion().setFromEuler(new THREE.Euler(.015*breath,.055,0)));rotate('Chest',new THREE.Quaternion().setFromEuler(new THREE.Euler(.012*breath,0,0)));}
   for(const [key,values] of tracks){const split=key.lastIndexOf('.'),bone=pose.getObjectByName(key.slice(0,split));values.push(...bone[key.slice(split+1)].toArray());}
  }
  const clip=base.clone();clip.name=name;for(const track of clip.tracks)for(let i=0;i<track.times.length;i++)track.times[i]*=duration/base.duration;
  clip.tracks=clip.tracks.filter(track=>!tracks.has(track.name));
  for(const [key,values] of tracks)clip.tracks.push(key.endsWith('.position')?new THREE.VectorKeyframeTrack(key,times,values):new THREE.QuaternionKeyframeTrack(key,times,values));
  clip.duration=duration;result.push(clip);
  for(const {binding} of samples)binding.unbind();
 }
 return result;
}
