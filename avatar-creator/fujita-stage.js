// Studio stages the real World shed; no substitute furniture or character model.
import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildPortShed,PORT_SHED,tvProgramme as shedProgramme} from '../johansson-town/src/world/port-shed.js';
const camera=new THREE.PerspectiveCamera(75,1,.05,60);
camera.position.set(2.2,1.35,.55);camera.lookAt(.15,.85,-.15);camera.updateMatrixWorld(true);
export const FUJITA_VIEW={wide:{camera:{position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),fov:75,aspect:1},floor:.06,spots:{stand:[[0,.06,1.45,.5,.78],[1.1,.06,1.5,.55,.78]]}}};
export function buildFujitaStage({room}){
 const parent=new THREE.Group();parent.position.set(-PORT_SHED.x,0,-PORT_SHED.z);room.add(parent);
 const colliders=[];
 const shed=buildPortShed({parent,colliders,register(){},onAction(){},shadows:true});
 // Freeze one ordinary off-duty evening, with the existing period-drama channel.
 let minutes=1340;for(;minutes<1440;minutes+=.25)if(shedProgramme(minutes)==='drama')break;
 shed.tick(0,minutes,{advanceLife:false});shed.fujita.visible=false;
 // The existing low footstool supports Fujita's short legs at its measured 18.8 cm top.
 shed.group.traverse(o=>{if(o.name==='Armchair footrest')o.scale.z=1.2;});
 const seat=new THREE.Object3D();seat.userData.studioLabel='Fujita’s armchair';
 seat.userData.seat={id:'fujita-armchair',position:[PORT_SHED.chair[0]-PORT_SHED.x,.06,PORT_SHED.chair[1]-PORT_SHED.z],surfaceY:.4,front:.15,yaw:0};room.add(seat);
 return {colliders:colliders.map(c=>({...c,x:c.x-PORT_SHED.x,z:c.z-PORT_SHED.z})),bounds:{minX:-1.15,maxX:2.8,minZ:-1.75,maxZ:2},dispose:()=>shed.dispose()};
}
