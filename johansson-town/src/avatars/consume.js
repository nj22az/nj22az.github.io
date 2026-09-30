import * as THREE from '../../vendor/three.module.js';
import {faceLayout} from './face.js';
import {shapeHeadPoint} from './head-profile.js';

/** A single lift, pause at the lips, then return; shared by every avatar. */
export function consumptionPhase(t,duration=2.4){
 const p=THREE.MathUtils.clamp(t/duration,0,1);
 const lift=THREE.MathUtils.smoothstep(p,0,.3)*(1-THREE.MathUtils.smoothstep(p,.7,1));
 return {lift,swallow:THREE.MathUtils.smoothstep(p,.4,.65),done:p>=1};
}
function aim(bone,child,target){
 const start=bone.getWorldPosition(new THREE.Vector3());
 const from=child.getWorldPosition(new THREE.Vector3()).sub(start).normalize();
 const q=new THREE.Quaternion().setFromUnitVectors(from,target.clone().sub(start).normalize()).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));bone.updateWorldMatrix(false,true);
}
function reach(avatar,target){
 const b=avatar.bones,start=b.shoulderR.getWorldPosition(new THREE.Vector3());
 const a=start.distanceTo(b.elbowR.getWorldPosition(new THREE.Vector3())),length=b.elbowR.getWorldPosition(new THREE.Vector3()).distanceTo(b.handR.getWorldPosition(new THREE.Vector3()));
 const dir=target.clone().sub(start),d=THREE.MathUtils.clamp(dir.length(),Math.abs(a-length)+.0001,a+length-.0001);dir.normalize();
 const pole=new THREE.Vector3(-1,-.25,0).transformDirection(avatar.root.matrixWorld);
 pole.addScaledVector(dir,-pole.dot(dir)).normalize();
 const along=(a*a-length*length+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
 aim(b.shoulderR,b.elbowR,start.clone().addScaledVector(dir,along).addScaledVector(pole,height));
 aim(b.elbowR,b.handR,start.clone().addScaledVector(dir,d));
}
/** Keep the rim/morsel at the measured mouth, independent of height or head shape. */
export function poseAvatarConsumption(avatar,lift,food=false,prop=null){
 const {root,measure:m,bones:b}=avatar;root.updateWorldMatrix(true,true);
 const L=faceLayout(avatar.recipe),head=b.head;
 const theta=Math.PI*.28+L.mouthY/256*Math.PI*.58,phi=Math.PI/2-.95+L.mouthX/256*1.9;
 const v=shapeHeadPoint(new THREE.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);
 const mouth=head.localToWorld(new THREE.Vector3(v.x*m.Rh*m.headSX,m.headCentre-m.headY+v.y*m.Rh*m.headSY,v.z*m.Rh*.98+.025*m.k));
 const rest=root.localToWorld(new THREE.Vector3(-m.shoulderX,m.shoulderY-m.upper*.75,m.depth*.75+m.fore*.45));
 const q=root.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),food?0:-.55*lift));
 const contact=new THREE.Vector3(food?0:-.10*m.k,food?.04:(prop?.userData.rimHeight??.15)-.08*m.k,food?.115:.015*m.k).applyQuaternion(q);
 const target=rest.lerp(mouth.sub(contact),lift);reach(avatar,target);
 // The palm is level, rather than inheriting the forearm's angle.
 b.handR.quaternion.copy(b.handR.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));b.handR.updateWorldMatrix(false,true);
}
/** A cup is gripped beside its handle, clear of the arm; its base remains upright. */
export function fitAvatarHeldProp(avatar,prop,lift=0,side='R'){
 const food=!!prop.userData.food,m=avatar.measure,hand=avatar.bones['hand'+side];
 avatar.root.updateWorldMatrix(true,true);
 const q=avatar.root.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),food?0:-.55*lift));
 const offset=new THREE.Vector3(food?0:(side==='R'?-.10:.10)*m.k,food?0:-.08*m.k,.015*m.k).applyQuaternion(q);
 const p=hand.getWorldPosition(new THREE.Vector3()).add(offset);
 const world=new THREE.Matrix4().compose(p,q,new THREE.Vector3(1,1,1));
 prop.matrixAutoUpdate=false;prop.matrix.copy(hand.matrixWorld).invert().multiply(world);prop.matrixWorldNeedsUpdate=true;
}
