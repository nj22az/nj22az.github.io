import * as THREE from '../../vendor/three.module.js';
import {clone} from '../../vendor/SkeletonUtils.js';

// Bake onto the supplied skeleton once at load time. Feet keep the original
// heel/toe timing, while two-bone IK places each step in its own wider lane.
export function swaggerWalk(asset,source,idle){
 if(!source||!idle)return source;
 const pose=clone(asset.scene),bones=new Map();pose.traverse(o=>{if(o.isBone)bones.set(o.name,o);});
 const required=['Hips','Spine02','Spine','Head',...['Left','Right'].flatMap(s=>[s+'UpLeg',s+'Leg',s+'Foot',s+'Shoulder',s+'Arm',s+'ForeArm',s+'Hand'])];
 if(required.some(n=>!bones.has(n)))return source;
 const pelvisRest=bones.get('Hips').quaternion.clone();
 const samples=source.tracks.map(track=>({sample:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
 const relaxed=new Map(idle.tracks.filter(t=>t.name.endsWith('.quaternion')).map(t=>[t.name.split('.')[0],new THREE.Quaternion().fromArray(t.createInterpolant().evaluate(0))]));
 const points=new Map(),rotations=new Map(),times=[],duration=1.14,frames=64;
 const worldPosition=bone=>bone.getWorldPosition(new THREE.Vector3());
 const worldRotation=bone=>bone.getWorldQuaternion(new THREE.Quaternion());
 function setWorldRotation(bone,rotation){
  bone.quaternion.copy(worldRotation(bone.parent).invert().multiply(rotation)).normalize();bone.updateWorldMatrix(false,true);
 }
 function turnInWorld(bone,x,y,z){
  setWorldRotation(bone,new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z)).multiply(worldRotation(bone)));
 }
 function aim(bone,child,target){
  const origin=worldPosition(bone),from=worldPosition(child).sub(origin).normalize(),to=target.clone().sub(origin).normalize();
  setWorldRotation(bone,new THREE.Quaternion().setFromUnitVectors(from,to).multiply(worldRotation(bone)));
 }
 function plant(side,target,footRotation){
  const thigh=bones.get(side+'UpLeg'),shin=bones.get(side+'Leg'),foot=bones.get(side+'Foot');
  const a=worldPosition(thigh),b=worldPosition(shin),c=worldPosition(foot),upper=a.distanceTo(b),lower=b.distanceTo(c);
  const direction=target.clone().sub(a),distance=THREE.MathUtils.clamp(direction.length(),Math.abs(upper-lower)+.001,upper+lower-.001);direction.normalize();
  const reachable=a.clone().addScaledVector(direction,distance);
  // Knees bend forward in model space; no sideways knee roll or crossed feet.
  const bend=new THREE.Vector3(0,0,1).addScaledVector(direction,-direction.z).normalize();
  const along=(upper*upper-lower*lower+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,upper*upper-along*along));
  const knee=a.clone().addScaledVector(direction,along).addScaledVector(bend,height);
  aim(thigh,shin,knee);aim(shin,foot,reachable);setWorldRotation(foot,footRotation);
 }
 for(let i=0;i<=frames;i++){
  const phase=(i===frames?0:i/frames)*Math.PI*2,t=(i===frames?0:i/frames)*source.duration;
  for(const {sample,binding} of samples)binding.setValue(sample.evaluate(t),0);
  pose.updateMatrixWorld(true);
  const targets=['Left','Right'].map(side=>({side,position:worldPosition(bones.get(side+'Foot')),rotation:worldRotation(bones.get(side+'Foot'))}));
  const hips=bones.get('Hips');
  // Keep most of the pelvis upright. A small chest counterturn supplies swagger.
  hips.quaternion.copy(pelvisRest.clone().slerp(hips.quaternion,.22));
  hips.position.y=.866+(hips.position.y-.866)*.55;pose.updateMatrixWorld(true);
  for(const name of ['Spine02','Spine01','Spine','neck']){const bone=bones.get(name),rest=relaxed.get(name);if(bone&&rest){bone.quaternion.copy(rest.clone().slerp(bone.quaternion,.2));bone.updateWorldMatrix(false,true);}}
  turnInWorld(bones.get('Spine02'),-.018,.055*Math.sin(phase),.035*Math.sin(phase));
  for(const side of ['Left','Right']){
   const sign=side==='Left'?1:-1;
   for(const part of ['Shoulder','Arm','ForeArm','Hand']){const bone=bones.get(side+part);bone.quaternion.copy(relaxed.get(side+part));bone.updateWorldMatrix(false,true);}
   turnInWorld(bones.get(side+'Arm'),sign*.29*Math.sin(phase),0,sign*.065);
   turnInWorld(bones.get(side+'ForeArm'),-.15,0,0);
  }
  const head=bones.get('Head');head.quaternion.copy(relaxed.get('Head'));head.updateWorldMatrix(false,true);turnInWorld(head,-.08,0,-.025*Math.sin(phase));
  for(const target of targets){
   const sign=target.side==='Left'?1:-1;
   target.position.x=hips.position.x+sign*(.135+.005*Math.cos(phase*2));
   // Retain authored forward stride, foot clearance and heel/toe rotation.
   plant(target.side,target.position,target.rotation);
  }
  times.push(i/frames*duration);
  for(const [name,bone] of bones){
   if(!points.has(name)){points.set(name,[]);rotations.set(name,[]);}
   points.get(name).push(...bone.position.toArray());
   const values=rotations.get(name),q=bone.quaternion.clone();
   if(values.length&&q.dot(new THREE.Quaternion().fromArray(values,values.length-4))<0)q.set(-q.x,-q.y,-q.z,-q.w);
   values.push(...q.toArray());
  }
 }
 for(const {binding} of samples)binding.unbind();
 const tracks=[];
 for(const name of bones.keys()){
  tracks.push(new THREE.VectorKeyframeTrack(name+'.position',times,points.get(name)));
  tracks.push(new THREE.QuaternionKeyframeTrack(name+'.quaternion',times,rotations.get(name)));
 }
 // Keep original scale channels intact. The gait never widens the actual mesh.
 for(const track of source.tracks.filter(t=>t.name.endsWith('.scale'))){const fixed=track.clone();for(let i=0;i<fixed.times.length;i++)fixed.times[i]*=duration/source.duration;tracks.push(fixed);}
 return new THREE.AnimationClip('Walk',duration,tracks);
}
