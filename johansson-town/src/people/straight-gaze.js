import * as THREE from '../../vendor/three.module.js';
import {clone} from '../../vendor/SkeletonUtils.js';

// The rig includes a headfront marker, so the correction follows the actual
// face direction instead of assuming a particular local bone axis.
export function straightenGaze(asset,source,{targetDegrees=0,loop=true}={}){
 if(!source)return source;
 const pose=clone(asset.scene),head=pose.getObjectByName('Head'),front=pose.getObjectByName('headfront');
 if(!head||!front)return source;
 const bindings=source.tracks.map(track=>({sample:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
 const frames=Math.max(32,Math.ceil(source.duration*30)),times=[],values=[];
 const headPosition=new THREE.Vector3(),frontPosition=new THREE.Vector3(),face=new THREE.Vector3(),parentWorld=new THREE.Quaternion(),world=new THREE.Quaternion(),lift=new THREE.Quaternion();
 for(let i=0;i<=frames;i++){
  const time=source.duration*i/frames,sampleTime=loop&&i===frames?0:time;
  for(const {sample,binding} of bindings)binding.setValue(sample.evaluate(sampleTime),0);
  pose.updateMatrixWorld(true);
  head.getWorldPosition(headPosition);front.getWorldPosition(frontPosition);face.copy(frontPosition).sub(headPosition).normalize();
  const pitch=Math.atan2(face.y,Math.hypot(face.x,face.z)),correction=pitch-THREE.MathUtils.degToRad(targetDegrees);
  head.getWorldQuaternion(world);lift.setFromAxisAngle(new THREE.Vector3(1,0,0),correction);world.premultiply(lift);
  head.parent.getWorldQuaternion(parentWorld);head.quaternion.copy(parentWorld.invert().multiply(world)).normalize();head.updateWorldMatrix(false,true);
  times.push(time);values.push(...head.quaternion.toArray());
 }
 for(const {binding} of bindings)binding.unbind();
 const tracks=source.tracks.filter(track=>track.name!=='Head.quaternion').map(track=>track.clone());
 tracks.push(new THREE.QuaternionKeyframeTrack('Head.quaternion',times,values));
 return new THREE.AnimationClip(source.name,source.duration,tracks);
}
