import * as THREE from '../../../vendor/three.module.js';
import {createHouseWalk} from '../house-walk.js';
import {buildSakuraOfficeRoom} from './sakura-office-room.js';

// Two flights in the existing western stockroom; the delivery passage stays east.
export const SAKURA_STAIR=Object.freeze({height:4.01,officeZ:-.64,
 well:{minX:-5.65,maxX:-.6,minZ:-6.78,maxZ:-4},
 hole:{minX:-5.65,maxX:-2.05,minZ:-6.14,maxZ:-4},
 bottom:[-1.25,0,-4.6],top:[-1.25,4.01,-3.5]});

// Upper bounds include the stair landing behind the office's rear wall.
export const sakuraBoundsAt=(base,y)=>y>SAKURA_STAIR.height-.24?
 {bounds:{minX:-6.4,maxX:6.4,minZ:-6.78,maxZ:3.91}}:base;

export function sakuraStoreys(base){
 const H=SAKURA_STAIR.height;
 const floors=[
  {id:'shop',x:[-6.8,6.8],z:[-3.95,3.88],y:0},
  {id:'stockroom',x:[-5.7,5.7],z:[-6.78,-3.95],y:0},
  {id:'office-lower-flight',x:[-4.5,-1.8],z:[-5.15,-4.05],y:{x:[H/2,0]},thick:.1},
  {id:'office-turn',x:[-5.6,-4.5],z:[-6.7,-4.05],y:H/2,thick:.1},
  {id:'office-upper-flight',x:[-4.5,-1.8],z:[-6.7,-5.6],y:{x:[H/2,H]},thick:.1},
  {id:'office-top-landing',x:[-1.8,-.6],z:[-6.7,-4],y:H,thick:.12},
  {id:'office-main',x:[-6.4,6.4],z:[-4,3.91],y:H,thick:.12},
  {id:'office-rear-west',x:[-6.4,-5.65],z:[-6.14,-4],y:H,thick:.12},
  {id:'office-rear-east',x:[-2.05,6.4],z:[-6.14,-4],y:H,thick:.12}
 ];
 return {...base,storeys:true,walk:createHouseWalk(floors)};
}

/** Same real office, mounted over the shop, with a hole rather than a solid floor across its stairs. */
export function buildSakuraStoreys({room,reg,action}){
 const parent=room;room=new THREE.Group();room.name='Sakura internal stairwell';parent.add(room);
 const S=SAKURA_STAIR,H=S.height,colliders=[];
 const material=new THREE.MeshStandardMaterial({color:0x8d7458,roughness:.88});
 const box=(w,h,d,x,y,z,name)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.name=name;room.add(m);return m;};
 const solid=(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY});
 // Continue the stockroom enclosure up to the office roof; no open strip above the old ceiling.
 const plaster=new THREE.MeshStandardMaterial({color:0xece1ca,roughness:.9});
 for(const [w,h,d,x,y,z] of [[.08,H+2.8,2.78,-5.7,(H+2.8)/2,-5.39],[5.1,H+2.8,.08,-3.15,(H+2.8)/2,-6.78],[.08,H+2.8,.64,-.6,(H+2.8)/2,-6.46],[5.1,.12,.64,-3.15,H+2.86,-6.46]]){
  const wall=box(w,h,d,x,y,z,'Sakura enclosed stairwell');wall.material=plaster;
  if(h>1)solid(x,z,w,d,h);
 }
 for(let i=0;i<12;i++){
  const t=(i+.5)/12,y=(i+1)*H/24;
  box(2.7/12,.1,1.1,-1.8-t*2.7,y-.05,-4.6,'Sakura lower stair tread');
  box(2.7/12,.1,1.1,-4.5+t*2.7,H/2+y-.05,-6.15,'Sakura upper stair tread');
 }
 box(1.1,.12,2.65,-5.05,H/2-.06,-5.375,'Sakura stair turn landing');
 box(1.2,.12,2.7,-1.2,H-.06,-5.35,'Sakura office top landing');
 const diffuser=new THREE.MeshBasicMaterial({color:0xfff1ce,toneMapped:false});diffuser.userData.keepPhysical=true;diffuser.userData.keepPhysicalStrict=true;
 const lamp=new THREE.Mesh(new THREE.BoxGeometry(.06,.32,.2),diffuser);lamp.position.set(-5.59,H/2+1.5,-5.35);lamp.name='Sakura stair bulkhead';room.add(lamp);
 // Enclose the under-stair space and guard the open edges at their actual height.
 for(const [x,z,w,d,top,bottom] of [[-3.15,-4.02,2.9,.06,3.05,0],[-5.64,-5.375,.06,2.75,H+1,0],[-3.15,-5.375,2.7,.06,H/2+1,H/2],[-3.85,-4,3.6,.06,H+1,H],[-2.05,-4.8,.06,1.5,H+1,H]]){
  box(w,top-bottom,d,x,(top+bottom)/2,z,'Sakura stair guard');solid(x,z,w,d,top,bottom);
 }
 for(const [x,y,z,turn] of [[-3.15,H/4+1,-4.07,1],[-3.15,H*.75+1,-6.67,-1]]){
  const rail=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,Math.hypot(2.7,H/2),8),material);
  rail.position.set(x,y,z);rail.rotation.z=turn*Math.atan2(2.7,H/2);rail.name='Sakura stair handrail';room.add(rail);
 }
 const office=new THREE.Group();office.name='Sakura upstairs main office';office.position.set(0,H,S.officeZ);room.add(office);
 buildSakuraOfficeRoom({room:office,reg,action,internal:true,
  collider:(x,z,w,d,height)=>solid(x,z+S.officeZ,w,d,height+H,H)});
 // Seats are stored in room coordinates, not the nested office's local frame.
 office.traverse(o=>{const seat=o.userData.seat;if(!seat)return;for(const key of ['position','stand'])if(seat[key]){seat[key][1]+=H;seat[key][2]+=S.officeZ;}for(const key of ['surfaceY','eyeY'])if(Number.isFinite(seat[key]))seat[key]+=H;});
 return {colliders,office};
}
