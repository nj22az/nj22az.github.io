import * as THREE from '../johansson-town/vendor/three.module.js';
import {createAvatarAnimator,GESTURES} from '../johansson-town/src/avatars/animate.js';
import {reachHand} from './scene-contact.js';
import {seatedPose} from './scene-catalogue.mjs';

export function poseSceneAvatar(avatar,{pose='Idle',expression='smile',turn=0,seatHeight=.48}){
 const custom=pose;pose=({SchoolRest:'Sit',SchoolProtest:'Tada',SchoolRun:'FanWild',LiftedBack:'Idle',HoldBack:'Idle'})[pose]||pose;
 const animator=createAvatarAnimator(avatar),duration=GESTURES[pose],time=Number.isFinite(duration)?duration*.43:.7;
 if(duration)animator.play(pose);
 const steps=Math.ceil(time/.025);
 for(let i=0;i<steps;i++)animator.update(time/steps,{expression,seated:seatedPose(pose),seatHeight});
 const b=avatar.bones;
 if(custom==='SchoolRest'){b.head.rotation.x=.15;b.shoulderL.rotation.set(-1.2,0,.25);b.elbowL.rotation.x=-1.7;b.shoulderR.rotation.set(-1.2,0,-.25);b.elbowR.rotation.x=-1.7;}
 if(custom==='SchoolProtest'){b.shoulderL.rotation.set(-.2,0,2.55);b.shoulderR.rotation.set(-.2,0,-2.55);b.elbowL.rotation.x=-.25;b.elbowR.rotation.x=-.25;b.thighL.rotation.set(0,0,0);b.kneeL.rotation.set(0,0,0);}
 if(custom==='SchoolRun'){b.hips.rotation.x=.3;b.chest.rotation.x=.30;b.thighL.rotation.x=-1.0;b.thighR.rotation.x=.8;b.kneeL.rotation.x=.6;b.kneeR.rotation.x=1.2;b.shoulderL.rotation.set(-1.3,0,.25);b.shoulderR.rotation.set(.7,0,-.2);b.elbowL.rotation.x=-1.1;b.elbowR.rotation.x=-1.0;}
 if(custom==='LiftedBack'&&expression==='embarrassed'){b.head.rotation.x=.32;b.head.rotation.z=-.05;b.chest.rotation.x=.06;}
 if(custom==='LiftedBack'){b.thighL.rotation.x=-.15;b.thighR.rotation.x=.12;b.kneeL.rotation.x=.2;b.kneeR.rotation.x=.3;}
 avatar.paintFace({expression,blink:0,talk:0,look:custom==='LiftedBack'&&expression==='embarrassed'?[0,.8]:[0,0]});
 // Town roots face -z. Scene portraits look into a camera on +z.
 avatar.root.rotation.y=turn*Math.PI/180;avatar.root.updateMatrixWorld(true);
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
export function placeSceneAvatar(avatar,{x,y,z},size=1){
 avatar.root.position.set(x,y+avatar.root.position.y*size,z);avatar.root.updateMatrixWorld(true);
}
