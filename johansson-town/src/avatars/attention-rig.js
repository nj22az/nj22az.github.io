import * as THREE from '../../vendor/three.module.js';

// Original Johansson controller. No decompiled code, game data or tuning tables are used.
const radians=degrees=>degrees*Math.PI/180;
export const ATTENTION_LIMITS=Object.freeze({
 neckYaw:radians(32),headYaw:radians(22),chestYaw:radians(8),
 up:radians(26),down:radians(22),eyeYaw:radians(24),eyePitch:radians(18),
 neckDelay:.10,bodyDelay:.28,near:.18,far:7,
});
export const attentionRigOn=(search=globalThis.location?.search||'')=>new URLSearchParams(search).has('attention-rig')&&new URLSearchParams(search).get('attention-rig')!=='0';
const clamp=THREE.MathUtils.clamp;
const wrap=angle=>Math.atan2(Math.sin(angle),Math.cos(angle));
function approach(value,wanted,dt,rate,speed){
 const change=(wanted-value)*(1-Math.exp(-rate*dt));
 return value+clamp(change,-speed*dt,speed*dt);
}

/** Add a small attention layer AFTER the ordinary animator has restored its own pose.
 * The current head position supplies the origin, including seated height and parent
 * transforms. Eyes are solved again after the joints move, so they carry the actual
 * remaining angle. Task/film poses can own the whole head by passing `locked`.
 * The vectors, matrices and returned state/eye array are reused.
 */
export function createAttentionRig(avatar){
 const {root,bones,measure:m}=avatar,L=ATTENTION_LIMITS;
 const point=new THREE.Vector3(),origin=new THREE.Vector3(),direction=new THREE.Vector3(),forward=new THREE.Vector3();
 const inverse=new THREE.Matrix4(),rootQ=new THREE.Quaternion(),headQ=new THREE.Quaternion();
 const state={neckYaw:0,headYaw:0,chestYaw:0,neckPitch:0,headPitch:0,weight:0,elapsed:0,look:[0,0],active:false};
 let eyeX=0,eyeY=0;
 return {state,update(dt,target,{locked=false,chest=true}={}){
  dt=Number.isFinite(dt)?clamp(dt,0,.1):0;
  const valid=target&&(target.isVector3||Array.isArray(target)&&target.length===3);
  if(valid){if(target.isVector3)point.copy(target);else point.fromArray(target);}
  let yaw=0,pitch=0,weight=0;
  if(valid&&Number.isFinite(point.x)&&Number.isFinite(point.y)&&Number.isFinite(point.z)&&!locked){
   bones.head.updateWorldMatrix(true,false);
   origin.set(0,m.headCentre-m.headY,0);bones.head.localToWorld(origin);
   const distance=origin.distanceTo(point);
   inverse.copy(root.matrixWorld).invert();direction.copy(point).applyMatrix4(inverse).sub(origin.applyMatrix4(inverse));
   root.getWorldQuaternion(rootQ);bones.head.getWorldQuaternion(headQ);
   headQ.premultiply(rootQ.invert());forward.set(0,0,1).applyQuaternion(headQ);
   yaw=wrap(Math.atan2(direction.x,direction.z)-Math.atan2(forward.x,forward.z));
   pitch=-Math.atan2(direction.y,Math.hypot(direction.x,direction.z))+Math.atan2(forward.y,Math.hypot(forward.x,forward.z));
   weight=(1-THREE.MathUtils.smoothstep(Math.abs(yaw),radians(100),radians(138)))
    *THREE.MathUtils.smoothstep(distance,L.near,L.near*2)
    *(1-THREE.MathUtils.smoothstep(distance,L.far-1,L.far));
  }
  state.active=weight>0;
  state.elapsed=state.active?state.elapsed+dt:0;
  state.weight=weight;
  const torso=chest&&state.elapsed>L.bodyDelay?clamp((Math.abs(yaw)-radians(30))*.25,0,L.chestYaw)*Math.sign(yaw)*weight:0;
  const turn=clamp(yaw-torso,-L.neckYaw-L.headYaw,L.neckYaw+L.headYaw)*weight;
  const tilt=clamp(pitch,-L.up,L.down)*weight;
  const ready=state.elapsed>L.neckDelay;
  state.chestYaw=approach(state.chestYaw,torso,dt,5,radians(32));
  state.neckYaw=approach(state.neckYaw,ready?turn*32/54:0,dt,7,radians(95));
  state.headYaw=approach(state.headYaw,ready?turn*22/54:0,dt,9,radians(95));
  state.neckPitch=approach(state.neckPitch,ready?tilt*.45:0,dt,7,radians(65));
  state.headPitch=approach(state.headPitch,ready?tilt*.55:0,dt,9,radians(65));
  // A contact pose takes precedence immediately. Clear memory too: ending the task
  // must not reapply a look left over from before it began.
  if(locked)state.chestYaw=state.neckYaw=state.headYaw=state.neckPitch=state.headPitch=0;
  if(!chest)state.chestYaw=0;
  bones.chest.rotation.y+=state.chestYaw;
  bones.neck.rotation.y+=state.neckYaw;bones.neck.rotation.x+=state.neckPitch;
  bones.head.rotation.y+=state.headYaw;bones.head.rotation.x+=state.headPitch;
  let x=0,y=0;
  if(state.active){
   bones.head.updateWorldMatrix(true,false);direction.copy(point);bones.head.worldToLocal(direction);direction.y-=m.headCentre-m.headY;
   x=clamp(Math.atan2(direction.x,direction.z)/L.eyeYaw,-1,1)*weight;
   y=clamp(-Math.atan2(direction.y,Math.hypot(direction.x,direction.z))/L.eyePitch,-1,1)*weight;
  }
  eyeX=locked?0:approach(eyeX,x,dt,24,12);eyeY=locked?0:approach(eyeY,y,dt,24,12);
  state.look[0]=eyeX;state.look[1]=eyeY;
  return state.active||Math.abs(eyeX)+Math.abs(eyeY)>.002?state.look:null;
 }};
}
