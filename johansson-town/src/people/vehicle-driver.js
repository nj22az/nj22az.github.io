import * as THREE from '../../vendor/three.module.js';

/** Borrow the existing resident, never add a second copy of their avatar. */
export function createVehicleDrivers({people}){
 const borrowed=new Map();
 const keys=['inVehicle','indoors','socialPose','seatHeight','floorHeight','activity'];
 function board(v){
  if(borrowed.has(v))return true;
  const person=people().find(p=>p.profile?.name===v.driver),g=person?.g,u=g?.userData;
  if(!g||u.playerControlled||u.inVehicle||u.indoors||u.inHome||u.inMarket||u.inIzakaya||u.inRamen||u.inBookshop||u.inWorkplace||u.inOnsen||u.sleeping||u.roomTransition||u.playerConversation)return false;
  const saved={g,parent:g.parent,position:g.position.clone(),rotation:g.rotation.clone(),visible:g.visible,flags:Object.fromEntries(keys.map(k=>[k,u[k]]))};borrowed.set(v,saved);
  v.g.add(g);const seat=v.g.userData.driverSeat;
  g.position.set(seat.x,0,seat.z);g.rotation.set(0,Math.PI,0);g.visible=true;
  Object.assign(u,{inVehicle:v.id,indoors:'vehicle',socialPose:'Sit',seatHeight:seat.y,floorHeight:.22,activity:'Driving · '+v.purpose});
  return true;
 }
 function release(v,{restore=false,away=false}={}){
  const saved=borrowed.get(v);if(!saved)return;
  const {g,parent,position,rotation,visible,flags}=saved,at=v.g.localToWorld(new THREE.Vector3(v.width/2+.65,0,0));
  parent.add(g);g.position.copy(restore?position:at);g.rotation.copy(rotation);g.visible=away?false:visible;
  for(const k of keys){if(flags[k]===undefined)delete g.userData[k];else g.userData[k]=flags[k];}
  borrowed.delete(v);
 }
 return {board,release,has:v=>borrowed.has(v)};
}
