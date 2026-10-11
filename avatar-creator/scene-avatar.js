import * as THREE from '../johansson-town/vendor/three.module.js';
import {createAvatarAnimator,GESTURES} from '../johansson-town/src/avatars/animate.js';
import {seatedPose} from './scene-catalogue.mjs';

export function poseSceneAvatar(avatar,{pose='Idle',expression='smile',turn=0,seatHeight=.48}){
 const animator=createAvatarAnimator(avatar),duration=GESTURES[pose],time=Number.isFinite(duration)?duration*.43:.7;
 if(duration)animator.play(pose);
 const steps=Math.ceil(time/.025);
 for(let i=0;i<steps;i++)animator.update(time/steps,{expression,seated:seatedPose(pose),seatHeight});
 avatar.paintFace({expression,blink:0,talk:0,look:[0,0]});
 // Town roots face -z. Scene portraits look into a camera on +z.
 avatar.root.rotation.y=turn*Math.PI/180;avatar.root.updateMatrixWorld(true);
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
