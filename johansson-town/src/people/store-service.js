import * as THREE from '../../vendor/three.module.js';
import {STORE_CLERK_POSITION,STORE_SEATS,STORE_TABLES,STORE_SERVICE_ROUTE} from '../world/interiors/store-layout.js';
import {createSteamedBunGeometry} from '../world/interiors/steamed-bun.js';

export const STORE_MENU=Object.freeze([
 {id:'bun',name:'Steamed pork bun',cost:150},
 {id:'rice',name:'Onigiri',cost:120},
 {id:'tea',name:'Green tea',cost:120},
].map(Object.freeze));

// One order belongs to one occupied chair. Payment is taken only on delivery,
// so standing, closing time, leaving or reloading cannot lose the player's yen.
export function createStoreService({clerk,room,getSeat,getMinutes,getBalance,pay,say,isBlocked=()=>false}){
 let order=null,phase='counter',elapsed=0,timer=0,route=[],resumeBreak=false;
 const seat=STORE_SEATS[1],tray=new THREE.Group();tray.name='Yuri food service';tray.visible=false;room.add(tray);
 const mat=new THREE.MeshStandardMaterial({color:0xf2e8d3,roughness:.8});
 const plate=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.025,20),mat);tray.add(plate);
 const bun=new THREE.Mesh(createSteamedBunGeometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94}));bun.position.y=.018;tray.add(bun);
 const rice=new THREE.Mesh(new THREE.ConeGeometry(.16,.26,3),mat);rice.position.y=.145;rice.rotation.y=Math.PI/2;tray.add(rice);
 const nori=new THREE.Mesh(new THREE.BoxGeometry(.13,.14,.10),new THREE.MeshStandardMaterial({color:0x25362a}));nori.position.set(0,.11,.075);rice.add(nori);nori.position.y=-.025;
 const tea=new THREE.Mesh(new THREE.CylinderGeometry(.07,.055,.13,16),new THREE.MeshStandardMaterial({color:0x789774,roughness:.5}));tea.position.y=.08;tray.add(tea);
 const liquid=new THREE.Mesh(new THREE.CircleGeometry(.061,16),new THREE.MeshStandardMaterial({color:0x667434}));liquid.rotation.x=-Math.PI/2;liquid.position.y=.064;tea.add(liquid);
 function pose(value){if(value){clerk.userData.socialPose=value;clerk.userData.seatHeight=seat.height;}else{delete clerk.userData.socialPose;delete clerk.userData.seatHeight;}}
 function move(points,next){route=points.map(p=>[...p]);phase=next;pose(null);}
 function returnToCounter(){tray.visible=false;const p=clerk.position;const path=p.x<0?[[-3.6,4.3],[1,4.3],[1,1.1],[2.8,1.1]]:p.z<1.1?[[3.8,p.z],[3.8,1.1],[2.8,1.1]]:[[2.8,p.z],[2.8,1.1]];move([...path,...STORE_SERVICE_ROUTE.slice(2)],'return');}
 function occupied(id){return id===seat.id&&['sit','stand','break-arrive'].includes(phase);}
 function cancel(){if(!order)return;order=null;tray.visible=false;returnToCounter();}
 function walk(dt){
  const p=route[0];if(!p)return true;
  const dx=p[0]-clerk.position.x,dz=p[1]-clerk.position.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*.95);
  if(d<.025){route.shift();return !route.length;}
  const x=clerk.position.x+dx/d*step,z=clerk.position.z+dz/d*step;
  if(isBlocked(x,z))return false;
  clerk.position.set(x,0,z);const target=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(target-clerk.rotation.y),Math.cos(target-clerk.rotation.y));clerk.rotation.y+=delta*Math.min(1,dt*9);return false;
 }
 function request(id){
  const item=STORE_MENU.find(i=>i.id===id),playerSeat=getSeat();
  if(!item||!playerSeat||order||!clerk.visible||getMinutes()%1440<540||getMinutes()%1440>=1200)return false;
  if(getBalance()<item.cost){say('You do not have enough yen.',3);return false;}
  order={item,seat:playerSeat.id,delivered:false};resumeBreak=phase==='sit';
  if(phase==='sit'){phase='stand';timer=.65;pose(null);}else if(phase==='counter'){phase='prepare';timer=1.5;}else returnToCounter();
  say('Yuri: Of course. I will bring it to your table.',4);return true;
 }
 function eat(){if(!order?.delivered||getSeat()?.id!==order.seat)return false;const item=order.item;order=null;tray.visible=false;say(item.id==='tea'?'You finish your tea.':'You eat the '+item.name.toLowerCase()+'.',4);return true;}
 return {request,eat,cancel,occupied,get order(){return order;},get phase(){return phase;},
  update(dt){
   elapsed+=dt;
   if(order&&getSeat()?.id!==order.seat)cancel();
   clerk.userData.serving=!!order&&!order.delivered;clerk.userData.carrying=phase==='deliver';
   if(phase==='counter'){
    if(order&&!order.delivered){phase='prepare';timer=1.5;clerk.rotation.y=Math.PI;}
    else if(elapsed>12&&(resumeBreak||elapsed%55<30)&&getSeat()?.id!==seat.id){resumeBreak=false;move([...STORE_SERVICE_ROUTE].reverse().concat([[seat.position[0],seat.position[2]]]),'break-arrive');}
   }else if(phase==='break-arrive'){
    if(getSeat()?.id===seat.id){returnToCounter();return;}
    if(walk(dt)){phase='sit';timer=18;clerk.rotation.y=seat.yaw;pose('Sit');}
   }else if(phase==='sit'){
    if((timer-=dt)<=0){phase='stand';timer=.65;pose(null);}
   }else if(phase==='stand'){
    if((timer-=dt)<=0)returnToCounter();
   }else if(phase==='return'){
    if(walk(dt)){phase='counter';clerk.position.set(...STORE_CLERK_POSITION);clerk.rotation.y=Math.PI;}
   }else if(phase==='prepare'){
    if((timer-=dt)<=0&&order){
     const destination=STORE_SEATS.find(s=>s.id===order.seat);
     bun.visible=order.item.id==='bun';rice.visible=order.item.id==='rice';tea.visible=order.item.id==='tea';tray.visible=true;
     // Walk through the staff opening, then along the clear front aisle.
     const path=[...STORE_SERVICE_ROUTE].reverse().slice(0,4);
     if(destination.table===1)path.push([1,1.1],[1,4.3],[-3.6,4.3]);
     path.push([destination.stand[0],destination.stand[2]]);move(path,'deliver');
    }
   }else if(phase==='deliver'){
    if(walk(dt)&&order){
     if(!pay(order.item.cost)){say('There is not enough yen for this order.',3);cancel();return;}
     order.delivered=true;const destination=STORE_SEATS.find(s=>s.id===order.seat),table=STORE_TABLES[destination.table];
     tray.position.set(table.x,.875,table.z+(destination.yaw?-.18:.18));tray.rotation.set(0,0,0);
     say('Yuri: Here you are. Enjoy your '+order.item.name.toLowerCase()+'.',5);phase='served';timer=1.2;
    }
   }else if(phase==='served'){
    if((timer-=dt)<=0){const from=clerk.position;const path=from.x<0?[[-3.6,4.3],[1,4.3],[1,1.1],[2.8,1.1]]:[[2.8,from.z],[2.8,1.1]];move([...path,...STORE_SERVICE_ROUTE.slice(2)],'return');}
   }
   if(order&&!order.delivered&&phase==='deliver'){
    tray.position.copy(clerk.position).add(new THREE.Vector3(0,.98,-.34).applyAxisAngle(new THREE.Vector3(0,1,0),clerk.rotation.y));tray.rotation.y=clerk.rotation.y;
   }
  },
  dispose(){order=null;pose(null);delete clerk.userData.serving;delete clerk.userData.carrying;tray.removeFromParent();const geos=new Set(),mats=new Set();tray.traverse(o=>{if(o.isMesh){geos.add(o.geometry);mats.add(o.material);}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}
 };
}
