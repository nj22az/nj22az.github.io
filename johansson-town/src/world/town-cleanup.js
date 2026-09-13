import * as THREE from '../../vendor/three.module.js';
import {FULL_TOWN} from './full-town-state.js';
import {groundHeight} from './layout.js';
import {CLEANUP_SPOTS} from '../commerce/town-cleanup.js';
import {TOWN_FINDS} from '../commerce/sakura-economy.js';

export function createTownCleanup({parent,register,action,getState,blocked=()=>false}){
 const objects=[];
 for(const spot of CLEANUP_SPOTS){
  const original=spot[FULL_TOWN.active?'full':'classic'];let position=null;
  for(let radius=0;radius<=2&&!position;radius+=.4)for(let i=0;i<12;i++){
   const x=original[0]+Math.cos(i*Math.PI/6)*radius,z=original[1]+Math.sin(i*Math.PI/6)*radius;
   if(!blocked(x,z,.35)){position=[x,groundHeight(x,z),z];break;}
  }
  if(!position)continue;
  const group=new THREE.Group();group.position.set(...position);group.name='Town clean-up · '+spot.id;group.userData.dynamic=true;group.userData.npcInteraction=false;
  const item=TOWN_FINDS.find(i=>i.id===spot.kind),mat=new THREE.MeshStandardMaterial({color:spot.kind==='bottle'?0x4e8270:spot.kind==='cans'?0xb5b7a5:0x846d52,roughness:.7});
  if(spot.kind==='bottle'){
   const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.039,.048,.20,10),mat);bottle.rotation.z=1.24;bottle.position.y=.06;group.add(bottle);
   const neck=new THREE.Mesh(new THREE.CylinderGeometry(.021,.028,.07,8),mat);neck.position.y=.128;bottle.add(neck);
  }else if(spot.kind==='cans'){
   for(let i=0;i<3;i++){const can=new THREE.Mesh(new THREE.CylinderGeometry(.037,.04,.07,10),mat);can.rotation.z=.8+i*.25;can.position.set(i*.065-.065,.047,(i%2)*.05);group.add(can);}
  }else{
   for(let i=0;i<3;i++){const part=new THREE.Mesh(new THREE.TorusGeometry(.04+i*.008,.009,4,12),mat);part.rotation.set(Math.PI/2,.1,i);part.position.set(i*.048-.048,.022+i*.008,0);group.add(part);}
  }
  parent.add(group);register(group,'Pick up '+item.name.toLowerCase(),()=>{action('town-cleanup',spot.id);update();});objects.push({id:spot.id,group});
 }
 function update(){const collected=getState().townCleanup?.collected||[];for(const {id,group} of objects)group.visible=!collected.includes(id);}
 update();return {update,objects};
}
