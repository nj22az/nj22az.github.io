import {buildBeerBottle} from '../johansson-town/src/people/izakaya-serving-visuals.js';
import {disposeServing} from '../johansson-town/src/people/izakaya-beer.js';
import {fitAvatarHeldProp} from '../johansson-town/src/avatars/consume.js';
import * as THREE from '../johansson-town/vendor/three.module.js';
import {createAvatarAnimator,GESTURES} from '../johansson-town/src/avatars/animate.js';
import {createFootGrounder} from '../johansson-town/src/avatars/foot-ground.js';
import {reachHand} from './scene-contact.js';
import {seatedPose} from './scene-catalogue.mjs?v=20261020-acting';

export const movingPose=name=>['Walk','Run','SchoolRun'].includes(name);
const held=new WeakMap();
const motion=new WeakMap(),supports=new WeakMap();
export function poseSceneAvatar(avatar,{pose='Idle',expression='smile',turn=0,seatHeight=.48,seatFront,heldItem,time:sample=0}){
 avatar.bones.head.scale.set(1,1,1);
 let prop=held.get(avatar);if(heldItem==='beer'&&!prop){prop=buildBeerBottle();prop.traverse(o=>{if(/cap/i.test(o.name))o.visible=false;});Object.assign(prop.userData,{drinkKind:'bottle',portion:.7,rimHeight:.278,grip:{radius:.038,height:.14}});avatar.bones.handR.add(prop);held.set(avatar,prop);}else if(!heldItem&&prop){disposeServing(prop);held.delete(avatar);prop=null;}
 const custom=pose;pose=({ResolveFist:'Idle',SitBeer:'Sit',SchoolRest:'Sit',SchoolProtest:'Idle',SchoolRun:'Idle',ComicLeap:'Idle',SchoolEscape:'Idle',LiftedBack:'Idle',HoldBack:'Idle'})[pose]||pose;
 const duration=GESTURES[pose],time=Number.isFinite(duration)?duration*.43:.7;
 if(movingPose(custom)){
  const elapsed=Math.floor(Math.max(0,Math.min(60,sample))/.025+1e-8)*.025+.5;let track=motion.get(avatar);
  if(!track||track.pose!==custom||elapsed<track.time){
   for(const bone of Object.values(avatar.bones))bone.rotation.set(0,0,0);
   avatar.root.position.set(0,0,0);
   track={pose:custom,time:0,animator:createAvatarAnimator(avatar,{random:()=>.5,initialTime:0})};motion.set(avatar,track);
  }
  avatar.root.position.y=track.rootY||0;
  const advanced=track.time<elapsed-1e-8;
  while(track.time<elapsed-1e-8){const dt=Math.min(.025,elapsed-track.time);track.animator.update(dt,{expression,speed:custom==='Walk'?1.1:3.8,running:custom!=='Walk'});track.time+=dt;}track.rootY=avatar.root.position.y;
  if(advanced)track.poseBones=Object.values(avatar.bones).map(b=>[b,b.quaternion.clone()]);else for(const [b,q] of track.poseBones)b.quaternion.copy(q);
 }else{
  const animator=createAvatarAnimator(avatar,{random:()=>.5,initialTime:0});if(duration)animator.play(pose);
  const steps=Math.ceil(time/.025);
  for(let i=0;i<steps;i++)animator.update(time/steps,{expression,seated:seatedPose(pose),seatHeight,seatFront,heldProp:prop});
  if(prop)fitAvatarHeldProp(avatar,prop,animator.consumption?.lift||0);
 }
 const b=avatar.bones;
 if(custom==='ResolveFist'){b.chest.rotation.set(-.10,.10,0);b.head.rotation.set(.12,.10,0);b.shoulderR.rotation.set(-1.1,0,-.6);b.elbowR.rotation.x=-1.8;b.shoulderL.rotation.set(.15,0,.35);b.elbowL.rotation.x=-1.2;b.thighL.rotation.z=.10;b.thighR.rotation.z=-.10;}
 if(custom==='SitBeer'){b.shoulderR.rotation.set(-.65,0,-.15);b.elbowR.rotation.x=-1.15;}
 if(custom==='SchoolRest'){b.spine.rotation.x=.14;b.chest.rotation.x=.62;b.head.rotation.x=-.26;b.head.scale.set(1.06,.93,1);b.shoulderL.rotation.set(-1.2,0,.25);b.elbowL.rotation.x=-1.7;b.shoulderR.rotation.set(-1.2,0,-.25);b.elbowR.rotation.x=-1.7;}
 if(custom==='SchoolProtest'){b.hips.rotation.x=-.08;b.chest.rotation.set(-.32,0,.08);b.head.rotation.set(-.28,0,-.10);b.shoulderL.rotation.set(-.15,.1,2.6);b.shoulderR.rotation.set(-.5,-.12,-2.15);b.elbowL.rotation.x=-.65;b.elbowR.rotation.x=-.18;b.handL.rotation.z=.4;b.handR.rotation.z=-.35;}
 if(custom==='SchoolRun'){b.hips.rotation.x=.16;b.chest.rotation.x+=.22;b.head.rotation.x-=.08;b.shoulderL.rotation.x*=1.35;b.shoulderR.rotation.x*=1.35;b.elbowL.rotation.x=-1.45;b.elbowR.rotation.x=-1.45;let ground=supports.get(avatar);if(!ground){ground=createFootGrounder(avatar);supports.set(avatar,ground);}ground(0);}
 if(custom==='SchoolEscape'){b.hips.rotation.set(.35,0,.04);b.chest.rotation.set(.44,-.08,0);b.head.rotation.x=-.22;b.thighL.rotation.set(-1.05,0,.12);b.thighR.rotation.set(.65,0,-.12);b.kneeL.rotation.x=.75;b.kneeR.rotation.x=.3;b.shoulderL.rotation.set(.9,0,.35);b.shoulderR.rotation.set(-1.6,0,-.3);b.elbowL.rotation.x=-1.1;b.elbowR.rotation.x=-.8;let ground=supports.get(avatar);if(!ground){ground=createFootGrounder(avatar);supports.set(avatar,ground);}ground(0);}
 if(custom==='ComicLeap'){b.hips.rotation.x=.25;b.chest.rotation.x=.28;b.head.rotation.x=-.24;b.thighL.rotation.set(-1.15,0,.12);b.thighR.rotation.set(.8,0,-.1);b.kneeL.rotation.x=.9;b.kneeR.rotation.x=1.9;b.shoulderL.rotation.set(-.6,0,1.9);b.shoulderR.rotation.set(.5,0,-1.4);b.elbowL.rotation.x=-.2;b.elbowR.rotation.x=-.3;}
 if(custom==='LiftedBack'&&expression==='embarrassed'){b.hips.rotation.x=.13;b.spine.rotation.x=.1;b.chest.rotation.x=.22;b.head.rotation.x=.48;b.head.rotation.z=-.08;}
 if(custom==='LiftedBack'){b.shoulderL.rotation.set(-.36,0,.08);b.shoulderR.rotation.set(-.38,0,-.08);b.elbowL.rotation.x=-.03;b.elbowR.rotation.x=-.06;b.thighL.rotation.x=-.12;b.thighR.rotation.x=.15;b.kneeL.rotation.x=.20;b.kneeR.rotation.x=.30;}
 avatar.paintFace({expression,blink:0,talk:0,look:custom==='LiftedBack'&&expression==='embarrassed'?[0,.8]:[0,0]});
 // Town roots face -z. Scene portraits look into a camera on +z.
 avatar.root.rotation.y=turn*Math.PI/180;avatar.root.updateMatrixWorld(true);
 if(custom==='ResolveFist'){const m=avatar.measure;reachHand(avatar,'R',avatar.root.localToWorld(new THREE.Vector3(-(m.Rh*m.headSX+m.hand*1.35),m.headCentre-m.Rh*m.headSY*.35,.17*m.k)));}
 if(custom==='ResolveFist'){let ground=supports.get(avatar);if(!ground){ground=createFootGrounder(avatar);supports.set(avatar,ground);}ground(0);}
 if(custom==='SitBeer'&&prop)fitAvatarHeldProp(avatar,prop,0);
 if(custom==='SchoolRest'){for(const [side,x] of [['L',.12],['R',-.12]]){const at=b.head.localToWorld(new THREE.Vector3(x,avatar.measure.Rh*avatar.measure.headSY*.45,.12));reachHand(avatar,side,at);}}
 const box=new THREE.Box3().setFromObject(avatar.root),size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());
 const height=Math.max(2.3,size.y*1.12,size.x*1.7);
 const camera=new THREE.OrthographicCamera(-height/3,height/3,height/2,-height/2,.01,50);
 camera.position.set(centre.x,box.min.y+height/2,8);camera.lookAt(centre.x,box.min.y+height/2,0);camera.updateMatrixWorld(true);
 return camera;
}

/**
 * Put a posed avatar (posed with its root at the origin) on its spot: x, z on the ground and y the floor or the seat's
 * floor. The animator lifts or lowers the root itself (a seated body's bottom on its seat, on the floor when the seat
 * height is 0; a jump), in the body's own units: that offset is kept, scaled with the character.
 */
export function placeSceneAvatar(avatar,{x,y,z,seat},size=1){
 const offset=seat?new THREE.Vector3(avatar.root.position.x,0,avatar.root.position.z).applyAxisAngle(new THREE.Vector3(0,1,0),seat.yaw||0).multiplyScalar(size):new THREE.Vector3();
 avatar.root.position.set(x+offset.x,y+avatar.root.position.y*size,z+offset.z);avatar.root.updateMatrixWorld(true);
}
