import * as THREE from '../../vendor/three.module.js';
export const THUAN_CHAIR_STEP=.48;

// Solve in world space: Meshy's mirrored joints do not share local bend axes.
function aim(bone,child,target){
 const start=bone.getWorldPosition(new THREE.Vector3()),from=child.getWorldPosition(new THREE.Vector3()).sub(start).normalize(),to=target.clone().sub(start).normalize();
 const rotation=new THREE.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation));bone.updateWorldMatrix(false,true);
}
export function plantLeg(upper,lower,foot,target,rotation,forward){
 const hip=upper.getWorldPosition(new THREE.Vector3()),knee=lower.getWorldPosition(new THREE.Vector3()),ankle=foot.getWorldPosition(new THREE.Vector3());
 const a=hip.distanceTo(knee),b=knee.distanceTo(ankle),direction=target.clone().sub(hip),distance=THREE.MathUtils.clamp(direction.length(),Math.abs(a-b)+.001,a+b-.001);direction.normalize();
 const pole=forward.clone().addScaledVector(direction,-forward.dot(direction)).normalize();
 const along=(a*a-b*b+distance*distance)/(2*distance),bend=Math.sqrt(Math.max(0,a*a-along*along));
 aim(upper,lower,hip.clone().addScaledVector(direction,along).addScaledVector(pole,bend));aim(lower,foot,hip.clone().addScaledVector(direction,distance));
 foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation));foot.updateWorldMatrix(false,true);
}

export function createThuanChairMotion(model,entity){
 if(!model.getObjectByName('RightHand_End'))return null;
 entity.updateWorldMatrix(true,true);const inverse=entity.getWorldQuaternion(new THREE.Quaternion()).invert(),saved=new Map();
 const legs=['Left','Right'].map(side=>{const upper=model.getObjectByName(side+'UpLeg'),lower=model.getObjectByName(side+'Leg'),foot=model.getObjectByName(side+'Foot');return {upper,lower,foot,rest:entity.worldToLocal(foot.getWorldPosition(new THREE.Vector3())),rotation:inverse.clone().multiply(foot.getWorldQuaternion(new THREE.Quaternion()))};});
 const spine=model.getObjectByName('Spine');
 return {
  restore(){for(const [bone,q] of saved)bone.quaternion.copy(q);saved.clear();},
  update(data,blend){
   if(!blend)return;entity.updateWorldMatrix(true,true);
   for(const bone of [spine,...legs.flatMap(l=>[l.upper,l.lower,l.foot])])saved.set(bone,bone.quaternion.clone());
   if(Number.isFinite(data.chairBlend)){
    // Bring the chest over the planted feet before transferring weight.
    const lean=-.28*Math.sin(Math.PI*blend),axis=new THREE.Vector3(1,0,0).transformDirection(entity.matrixWorld),parent=spine.parent.getWorldQuaternion(new THREE.Quaternion());
    spine.quaternion.premultiply(parent.clone().invert().multiply(new THREE.Quaternion().setFromAxisAngle(axis,lean)).multiply(parent));spine.updateWorldMatrix(false,true);
   }
   const forward=new THREE.Vector3(0,0,-1).transformDirection(entity.matrixWorld),rotation=entity.getWorldQuaternion(new THREE.Quaternion());
   for(const leg of legs){
    const target=leg.rest.clone();target.z-=THUAN_CHAIR_STEP*blend;target.y+=(Number(data.floorHeight)||0)+Math.max(0,(data.seatHeight??.51)-.51)*blend;
    plantLeg(leg.upper,leg.lower,leg.foot,entity.localToWorld(target),rotation.clone().multiply(leg.rotation),forward);
   }
  }
 };
}
