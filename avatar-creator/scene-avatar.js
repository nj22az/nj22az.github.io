import * as THREE from '../johansson-town/vendor/three.module.js';
import {createAvatarAnimator,GESTURES} from '../johansson-town/src/avatars/animate.js';

export function poseSceneAvatar(avatar,{pose='Idle',expression='smile',turn=0,seatHeight=.48}){
 const animator=createAvatarAnimator(avatar),duration=GESTURES[pose],time=Number.isFinite(duration)?duration*.43:.7;
 if(duration)animator.play(pose);
 const steps=Math.ceil(time/.025);
 for(let i=0;i<steps;i++)animator.update(time/steps,{expression,seated:pose==='Sit',seatHeight});
 avatar.paintFace({expression,blink:0,talk:0,look:[0,0]});
 // Town roots face -z. Scene portraits look into a camera on +z.
 avatar.root.rotation.y=turn*Math.PI/180;avatar.root.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(avatar.root),size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());
 const height=Math.max(2.3,size.y*1.12,size.x*1.7);
 const camera=new THREE.OrthographicCamera(-height/3,height/3,height/2,-height/2,.01,50);
 camera.position.set(centre.x,box.min.y+height/2,8);camera.lookAt(centre.x,box.min.y+height/2,0);camera.updateMatrixWorld(true);
 return camera;
}
