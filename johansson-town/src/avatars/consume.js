import * as THREE from '../../vendor/three.module.js';
import {faceLayout} from './face.js';
import {shapeHeadPoint} from './head-profile.js';

/** A single lift, pause at the lips, then return; shared by every avatar. */
export function consumptionPhase(t,duration=2.4){
 const p=THREE.MathUtils.clamp(t/duration,0,1);
 const lift=THREE.MathUtils.smoothstep(p,0,.3)*(1-THREE.MathUtils.smoothstep(p,.7,1));
 return {lift,swallow:THREE.MathUtils.smoothstep(p,.4,.65),done:p>=1};
}
/**
 * How far a drink tips at the lips: a full mug barely, the last mouthful a long way, the
 * way you have to tip a glass further to reach what is left. Shared by the pose and the
 * grip so the rim and the mouth agree. Food stays level.
 */
export function drinkTilt(prop,lift,food=false){
 if(food)return 0;
 const left=THREE.MathUtils.clamp(prop?.userData?.portion??1,0,1);
 return -(.55+.2*(1-left))*lift;
}
/** The head goes back with the sip, further for the last of the glass. */
export function drinkHeadTilt(prop,lift,food=false){
 if(food)return 0;
 const left=THREE.MathUtils.clamp(prop?.userData?.portion??1,0,1);
 return -.05*(1-left)*THREE.MathUtils.smoothstep(lift,.5,1);
}
/**
 * Where a drink sits against the hand, in the hand's level frame: from the palm's centre
 * to the drink's base. A mug or cup hangs off the outside of its handle; a tumbler, a
 * bottle or a can is held round its body, so the palm rests on the glass rather than
 * hovering beside it. Shared by the grip and the drinking pose so the rim and the
 * mouth agree.
 */
export function drinkGrip(prop,m,side='R'){
 const g=prop?.userData?.grip,s=side==='R'?1:-1;
 if(!g)return new THREE.Vector3(s*.10*m.k,-.08*m.k+m.hand*.55,.015*m.k);
 const out=g.handle!=null?g.handle+m.hand*.25:g.radius+m.hand*.70;
 return new THREE.Vector3(s*out,-g.height,0);
}
/** Keep the palm upright while holding or sipping, including idle holds. */
function alignDrinkHand(avatar,q,side='R'){
 const hand=avatar.bones['hand'+side],handQ=q;
 hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(handQ));
 hand.updateWorldMatrix(false,true);
}
/** The palm's centre, below the wrist the hand bone pivots on (build.js, the mitten hand). */
const palm=m=>new THREE.Vector3(0,-m.hand*.55,0);
function aim(bone,child,target){
 const start=bone.getWorldPosition(new THREE.Vector3());
 const from=child.getWorldPosition(new THREE.Vector3()).sub(start).normalize();
 const q=new THREE.Quaternion().setFromUnitVectors(from,target.clone().sub(start).normalize()).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));bone.updateWorldMatrix(false,true);
}
/** Two-bone reach: the hand of `side` ('R' or 'L') to a world point, the elbow out and down. */
export function reach(avatar,target,side='R'){
 const b=avatar.bones,shoulder=b['shoulder'+side],elbow=b['elbow'+side],hand=b['hand'+side];
 const start=shoulder.getWorldPosition(new THREE.Vector3());
 const a=start.distanceTo(elbow.getWorldPosition(new THREE.Vector3())),length=elbow.getWorldPosition(new THREE.Vector3()).distanceTo(hand.getWorldPosition(new THREE.Vector3()));
 const dir=target.clone().sub(start),d=THREE.MathUtils.clamp(dir.length(),Math.abs(a-length)+.0001,a+length-.0001);dir.normalize();
 const pole=new THREE.Vector3(side==='R'?-1:1,-.25,0).transformDirection(avatar.root.matrixWorld);
 pole.addScaledVector(dir,-pole.dot(dir)).normalize();
 const along=(a*a-length*length+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
 aim(shoulder,elbow,start.clone().addScaledVector(dir,along).addScaledVector(pole,height));
 aim(elbow,hand,start.clone().addScaledVector(dir,d));
}
/**
 * Both hands on a steering wheel, at nine and three on its rim. `wheel` is {x,y,z,r} in
 * `vehicle`'s frame (world/road-vehicles.js steeringWheel). The wrist goes to the rim, so
 * the mitten closes over it. A gentle drift of the wheel keeps it from looking welded.
 */
export function gripWheel(avatar,vehicle,wheel,time=0){
 avatar.root.updateWorldMatrix(true,true);vehicle.updateWorldMatrix(true,false);
 const steer=Math.sin(time*.7)*.05+Math.sin(time*1.9)*.02;
 const rim=a=>vehicle.localToWorld(new THREE.Vector3(wheel.x+Math.cos(a)*wheel.r,wheel.y+Math.sin(a)*wheel.r,wheel.z));
 const three=rim(steer),nine=rim(Math.PI+steer);
 // Each hand takes the side of the rim nearer its own shoulder, whichever way round the
 // vehicle has turned the body.
 const left=avatar.bones.shoulderL.getWorldPosition(new THREE.Vector3());
 const leftTakesThree=left.distanceTo(three)<left.distanceTo(nine);
 reach(avatar,leftTakesThree?three:nine,'L');
 reach(avatar,leftTakesThree?nine:three,'R');
}
/** Keep the rim/morsel at the measured mouth, independent of height or head shape. */
export function poseAvatarConsumption(avatar,lift,food=false,prop=null){
 const {root,measure:m,bones:b}=avatar;root.updateWorldMatrix(true,true);
 const L=faceLayout(avatar.recipe),head=b.head;
 const theta=Math.PI*.28+L.mouthY/256*Math.PI*.58,phi=Math.PI/2-.95+L.mouthX/256*1.9;
 const v=shapeHeadPoint(new THREE.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);
 const lips=new THREE.Vector3(v.x*m.Rh*m.headSX,m.headCentre-m.headY+v.y*m.Rh*m.headSY,v.z*m.Rh*.98+.025*m.k);
 const rest=root.localToWorld(new THREE.Vector3(-m.shoulderX,m.shoulderY-m.upper*.75,m.depth*.75+m.fore*.45));
 const q=root.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),drinkTilt(prop,lift,food)));
 const contact=(food?new THREE.Vector3(0,.04,.115):palm(m).add(drinkGrip(prop,m)).add(new THREE.Vector3(0,prop?.userData.rimHeight??.15,0))).applyQuaternion(q);
 // Short arms and large custom heads still meet the drink. Start from a
 // reachable resting hand, then lean gently; any remaining reach is met by
 // bringing the head towards the hand instead of turning it through a right angle.
 const shoulder=b.shoulderR.getWorldPosition(new THREE.Vector3());
 const span=(m.upper+m.fore)*.985;
 if(rest.distanceTo(shoulder)>span*.95)rest.sub(shoulder).setLength(span*.95).add(shoulder);
 const initialPitch=head.rotation.x;
 let target=null;
 for(let pass=0;pass<12;pass++){
  head.updateWorldMatrix(true,false);
  target=rest.clone().lerp(head.localToWorld(lips.clone()).sub(contact),lift);
  const over=target.distanceTo(shoulder)-span;
  if(over<=.0005||lift<.01)break;
  const pitch=Math.min(initialPitch+.30*lift,head.rotation.x+Math.min(.12,over/(m.Rh*1.1)));
  if(pitch===head.rotation.x)break;
  head.rotation.x=pitch;
 }
 head.updateWorldMatrix(true,false);
 target=rest.clone().lerp(head.localToWorld(lips.clone()).sub(contact),lift);
 if(lift>.01&&target.distanceTo(shoulder)>span){
  const reachable=target.clone().sub(shoulder).setLength(span).add(shoulder);
  const shift=reachable.clone().sub(target).multiplyScalar(1/lift);
  head.position.copy(head.parent.worldToLocal(head.getWorldPosition(new THREE.Vector3()).add(shift)));
  head.updateWorldMatrix(true,false);
  target=rest.clone().lerp(head.localToWorld(lips.clone()).sub(contact),lift);
 }
 reach(avatar,target,'R');
 // The vessel sits inside the hand, where the thumb can close on it, rather
 // than hanging outside the wrist. Keep the palm level throughout the sip.
 if(!food)alignDrinkHand(avatar,q);
 else{b.handR.quaternion.copy(b.handR.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));b.handR.updateWorldMatrix(false,true);}
}
/** A drink is gripped in the palm (drinkGrip), clear of the arm; its base remains upright. */
export function fitAvatarHeldProp(avatar,prop,lift=0,side='R'){
 const food=!!prop.userData.food,m=avatar.measure,hand=avatar.bones['hand'+side];
 avatar.root.updateWorldMatrix(true,true);
 const q=avatar.root.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),drinkTilt(prop,lift,food)));
 if(!food)alignDrinkHand(avatar,q,side);
 const p=food?hand.getWorldPosition(new THREE.Vector3()):hand.localToWorld(palm(m)).add(drinkGrip(prop,m,side).applyQuaternion(q));
 const world=new THREE.Matrix4().compose(p,q,new THREE.Vector3(1,1,1));
 // A right-hand mug's handle faces the right hand (negative avatar X).
 // Its authored handle faces +X, so turn its orientation for the right hand.
 if(!food&&side==='R')world.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
 prop.matrixAutoUpdate=false;prop.matrix.copy(hand.matrixWorld).invert().multiply(world);prop.matrixWorldNeedsUpdate=true;
}
