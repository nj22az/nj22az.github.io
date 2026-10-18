import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';
import {SAKURA_OFFICE} from './interiors/sakura-office-room.js';

/** Historical module name retained; Sakura's upper floor now belongs to the business. */
export function buildThuanFlat(parent,{colliders=[],sites=[],register,enter}={}){
 const O=SAKURA_OFFICE,hw=O.width/2,D=O.depth,F=O.floor,kit=createKit(),solid=c=>colliders.push(c);
 parent.updateWorldMatrix(true,false);
 const p=parent.getWorldPosition(new THREE.Vector3()),yaw=parent.rotation.y;
 // All solids and walking levels are emitted in the real storefront's world frame.
 kit.at(p.x,p.z,yaw,()=>{
  kit.block(-hw,hw,F-.12,F,-D, -.95,0xc9bda3);
  kit.block(-hw,hw,F,F+2.8,-D-.12,-D,0xe8dfc7);
  kit.block(-hw-.12,-hw,F,F+2.8,-D,-.95,0xe8dfc7);
  for(const [a,b] of [[F,F+.9],[F+2.35,F+2.8]]){
   kit.block(-hw,hw,a,b,-1.07,-.95,0xe8dfc7);
   kit.block(hw,hw+.12,a,b,-6.75,-.95,0xe8dfc7);
  }
  kit.block(-hw-.12,hw+.12,F+2.8,F+2.95,-D-.12,-.95,0xd3c9b5);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(O.width,1.45),new THREE.MeshStandardMaterial({color:0x92a9a5,roughness:.4}));
  glass.name='Sakura main office glazing';glass.position.set(0,F+1.625,-.94);parent.add(glass);
 },0);
 const target=parent.parent;kit.finish(target,'Sakura office stair and upper shell');
 const door=new THREE.Vector3(-18.8,F,-26.66);
 // The office room's origin is the middle of the upper floor; portals identify the actual east/south openings.
 const origin=parent.localToWorld(new THREE.Vector3(0,F,-D/2));
 const portal=(local,interiorYaw,span)=>({position:parent.localToWorld(new THREE.Vector3(local[0],F,local[2]-D/2)).toArray(),yaw:yaw+interiorYaw,interiorOrigin:local,interiorYaw,span,hideGlazing:true});
 const site={id:'sakura-office',title:'Sakura main office & kitchenette',sub:'SAKURA · MAIN OFFICE',line:'Accounts and supplier orders upstairs; daily till administration remains downstairs.',
  x:door.x,z:door.z,door:door.toArray(),exitPosition:door.toArray(),approachPosition:door.toArray(),entryFacing:-Math.PI/2,opens:'00:00',
  officeOrigin:origin.toArray(),officePortals:[portal([0,0,O.front],0,{minX:-hw,maxX:hw,minY:.9,maxY:2.35}),portal([hw,0,1.5],Math.PI/2,{minX:-2.85,maxX:2.85,minY:.9,maxY:2.35})]};
 sites.push(site);const anchor=new THREE.Object3D();anchor.name='Sakura main office entrance';anchor.position.copy(door).add(new THREE.Vector3(0,1.1,0));target.add(anchor);register?.(anchor,'Enter Sakura main office',()=>enter(site));
 return {site};
}
