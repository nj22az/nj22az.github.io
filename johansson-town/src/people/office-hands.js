import * as THREE from '../../vendor/three.module.js';

// Two-bone arm placement is constrained by the actual rig lengths. The seated
// body keeps its animation; only wrists at the keyboard get a small correction.
export function createOfficeHands(model){
 const arms=['L','R'].map(side=>({side,upper:model.getObjectByName('UpperArm'+side),lower:model.getObjectByName('LowerArm'+side),wrist:model.getObjectByName('Wrist'+side)}));
 const point=bone=>bone.getWorldPosition(new THREE.Vector3());
 function turn(bone,from,to){
  const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion()),delta=new THREE.Quaternion().setFromUnitVectors(from.normalize(),to.normalize());
  bone.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent)).normalize();bone.updateWorldMatrix(false,true);
 }
 let time=0;
 return {update(dt){
  time+=dt;model.updateWorldMatrix(true,true);
  for(const {side,upper,lower,wrist} of arms){
   if(!upper||!lower||!wrist)continue;
   const a=point(upper),b=point(lower),c=point(wrist),orientation=wrist.getWorldQuaternion(new THREE.Quaternion());
   const target=new THREE.Vector3(-2.52+(side==='L'?-.15:.15),.948+Math.sin(time*13+(side==='L'?0:Math.PI))*.003,-2.31);
   const l1=a.distanceTo(b),l2=b.distanceTo(c),direction=target.clone().sub(a),distance=Math.min(direction.length(),l1+l2-.0001);direction.normalize();
   const along=(l1*l1-l2*l2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,l1*l1-along*along));
   const bend=b.clone().sub(a);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
   const elbow=a.clone().addScaledVector(direction,along).addScaledVector(bend,height);
   turn(upper,b.clone().sub(a),elbow.sub(a));
   const elbowNow=point(lower);turn(lower,point(wrist).sub(elbowNow),target.sub(elbowNow));
   wrist.quaternion.copy(wrist.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(orientation));wrist.updateWorldMatrix(false,true);
  }
 }};
}
