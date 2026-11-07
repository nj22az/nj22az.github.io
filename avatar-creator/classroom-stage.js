// World's classroom with its running lesson paused. Studio owns only the staging.
import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildClassroom} from '../johansson-town/src/world/interiors/classroom.js';
export const CLASSROOM_VIEW={floor:0,camera:{position:[1.45,1.7,3.15],quaternion:[0,0,0,1]},spots:{stand:[[0,0,0,.5,.78]]}};
{const camera=new THREE.PerspectiveCamera();camera.position.fromArray(CLASSROOM_VIEW.camera.position);camera.lookAt(0,.95,0);CLASSROOM_VIEW.camera.quaternion=camera.quaternion.toArray();}
export function buildClassroomStage(options){
 const api=buildClassroom(options);api.tick(.01,600,.01);
 options.room.traverse(o=>{if(o.userData.figure)o.visible=false;});
 for(const u of api.units)u.unit.visible=false;
 const u=api.units[0],desk=u.unit,chair=u.chair;desk.visible=true;desk.scale.setScalar(1.35);desk.position.set(0,0,.5);desk.rotation.set(0,-Math.PI/2,0);u.tray.visible=false;
 options.room.attach(chair);chair.position.set(0,0,-.11);chair.rotation.set(0,-Math.PI/2,0);chair.scale.setScalar(1.35);
 const furniture={desk,chair},rest=Object.fromEntries(Object.entries(furniture).map(([id,o])=>[id,{position:o.position.toArray(),rotation:o.rotation.toArray().slice(0,3),visible:o.visible}]));
 const seat=new THREE.Object3D();seat.userData.seat={id:'classroom-desk',position:[0,0,-.11],stand:[-.8,0,-.3],surfaceY:.54,yaw:Math.PI};options.room.add(seat);options.reg(seat,'Classroom desk');
 return {...api,furniture,stage(settings={}){for(const [id,o] of Object.entries(furniture)){const s=settings[id]||rest[id];o.position.fromArray(s.position||rest[id].position);o.rotation.set(...(s.rotation||rest[id].rotation));o.visible=s.visible??true;}options.room.updateMatrixWorld(true);},dispose:()=>api.dispose()};
}
