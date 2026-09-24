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
 // The Meshy rig (RightHand_End) and her MakeHuman rebuild (upperleg01/lowerleg01/foot).
 const mh=!!model.getObjectByName('upperleg01R');
 if(!mh&&!model.getObjectByName('RightHand_End'))return null;
 entity.updateWorldMatrix(true,true);const inverse=entity.getWorldQuaternion(new THREE.Quaternion()).invert(),saved=new Map();
 const legs=['Left','Right'].map(side=>{
  const s=side[0],upper=model.getObjectByName(mh?'upperleg01'+s:side+'UpLeg'),lower=model.getObjectByName(mh?'lowerleg01'+s:side+'Leg'),foot=model.getObjectByName(mh?'foot'+s:side+'Foot');
  const ball=mh&&model.getObjectByName('toe1-1'+s),rest=entity.worldToLocal(foot.getWorldPosition(new THREE.Vector3()));
  // The ball of the foot, which stays put when the heel comes up.
  const restBall=ball?entity.worldToLocal(ball.getWorldPosition(new THREE.Vector3())):null;
  const toes=mh?[1,2,3,4,5].map(n=>model.getObjectByName('toe'+n+'-1'+s)).filter(Boolean):[];
  return {upper,lower,foot,toes,rest,restBall,rotation:inverse.clone().multiply(foot.getWorldQuaternion(new THREE.Quaternion()))};
 });
 const spine=model.getObjectByName(mh?'spine03':'Spine'),pitch=new THREE.Quaternion(),right=new THREE.Vector3(1,0,0);
 // How far the heels come up once seated: none unless fit() finds the legs too short.
 let heelRaise=0;
 function ankleTarget(leg,blend,data){
  const target=leg.rest.clone(),lift=heelRaise*blend;
  if(lift&&leg.restBall){
   // Tip the foot about the ball: the ankle rises, the toes stay on the floor.
   const heel=leg.rest.clone().sub(leg.restBall),angle=Math.asin(Math.min(.9,lift/Math.max(.01,Math.hypot(heel.y,heel.z))));
   target.copy(leg.restBall).add(heel.applyQuaternion(pitch.setFromAxisAngle(right,-angle)));
  }
  target.z-=THUAN_CHAIR_STEP*blend;target.y+=(Number(data.floorHeight)||0)+Math.max(0,(data.seatHeight??.51)-.51)*blend;
  return target;
 }
 return {
  get heelRaise(){return heelRaise;},
  /**
   * Called with the Sit clip playing and the pelvis over a .51 m seat: if the clip's
   * ankles sit higher than the floor, lift the heels by that much (to a natural limit)
   * rather than straightening the knees and dropping the thighs through the seat.
   */
  fit(floorHeight){
   if(!mh)return;
   const heights=legs.filter(l=>l.restBall).map(l=>entity.worldToLocal(l.foot.getWorldPosition(new THREE.Vector3())).y-(l.rest.y+floorHeight));
   if(heights.length)heelRaise=THREE.MathUtils.clamp(Math.min(...heights),0,.06);
  },
  restore(){for(const [bone,q] of saved)bone.quaternion.copy(q);saved.clear();},
  update(data,blend){
   // Chairs and benches only: in a bath the ledge is below the floor the feet were planted on.
   if(!blend||data.socialPose==='Soak')return;entity.updateWorldMatrix(true,true);
   for(const bone of [spine,...legs.flatMap(l=>[l.upper,l.lower,l.foot,...l.toes])])saved.set(bone,bone.quaternion.clone());
   if(Number.isFinite(data.chairBlend)){
    // Bring the chest over the planted feet before transferring weight.
    const lean=-.28*Math.sin(Math.PI*blend),axis=new THREE.Vector3(1,0,0).transformDirection(entity.matrixWorld),parent=spine.parent.getWorldQuaternion(new THREE.Quaternion());
    spine.quaternion.premultiply(parent.clone().invert().multiply(new THREE.Quaternion().setFromAxisAngle(axis,lean)).multiply(parent));spine.updateWorldMatrix(false,true);
   }
   const forward=new THREE.Vector3(0,0,-1).transformDirection(entity.matrixWorld),rotation=entity.getWorldQuaternion(new THREE.Quaternion());
   for(const leg of legs){
    const target=ankleTarget(leg,blend,data),worldForward=forward.clone();
    let footRotation=rotation.clone().multiply(leg.rotation);
    if(heelRaise&&leg.restBall){
     const heel=leg.rest.clone().sub(leg.restBall),angle=Math.asin(Math.min(.9,heelRaise*blend/Math.max(.01,Math.hypot(heel.y,heel.z))));
     footRotation=rotation.clone().multiply(pitch.setFromAxisAngle(right,-angle)).multiply(leg.rotation);
    }
    plantLeg(leg.upper,leg.lower,leg.foot,entity.localToWorld(target),footRotation,worldForward);
    if(heelRaise&&leg.toes.length){
     // The toes bend back and stay flat on the floor while the heel is up.
     const heel=leg.rest.clone().sub(leg.restBall),angle=Math.asin(Math.min(.9,heelRaise*blend/Math.max(.01,Math.hypot(heel.y,heel.z)))),axis=right.clone().transformDirection(entity.matrixWorld);
     for(const toe of leg.toes){const parent=toe.parent.getWorldQuaternion(new THREE.Quaternion());toe.quaternion.premultiply(parent.clone().invert().multiply(new THREE.Quaternion().setFromAxisAngle(axis,angle)).multiply(parent));toe.updateWorldMatrix(false,true);}
    }
   }
  }
 };
}
